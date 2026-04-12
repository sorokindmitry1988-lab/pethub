import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const FEATURE_KEY = "vet_questions";
const PREMIUM_FREE_LIMIT = 999999;

function requireEnv(name: "STRIPE_SECRET_KEY" | "STRIPE_WEBHOOK_SECRET"): string {
  const raw = process.env[name];
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) {
    throw new Error(`[Stripe] Не задана переменная окружения ${name}.`);
  }
  return value;
}

function stripeCustomerId(
  customer: Stripe.Checkout.Session["customer"]
): string | null {
  if (customer == null) {
    return null;
  }
  if (typeof customer === "string") {
    return customer;
  }
  if (typeof customer === "object" && "id" in customer && typeof customer.id === "string") {
    return customer.id;
  }
  return null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"));
    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      requireEnv("STRIPE_WEBHOOK_SECRET")
    );
  } catch {
    return Response.json({ error: "Невалидная подпись webhook" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId =
      (session.metadata?.user_id?.trim() ?? "") ||
      (session.client_reference_id?.trim() ?? "") ||
      null;

    if (userId) {
      const supabase = await createClient();
      const customerId = stripeCustomerId(session.customer);

      const { data: existingSub, error: subSelectError } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (subSelectError) {
        console.error("Supabase subscriptions select error:", subSelectError);
        return Response.json({ error: "Не удалось обработать подписку" }, { status: 500 });
      }

      const subscriptionRow = {
        user_id: userId,
        stripe_session_id: session.id,
        stripe_customer_id: customerId,
        status: "active",
        plan_code: "premium",
      };

      if (existingSub) {
        const { error: subUpdateError } = await supabase
          .from("subscriptions")
          .update(subscriptionRow)
          .eq("id", existingSub.id);

        if (subUpdateError) {
          console.error("Supabase subscriptions update error:", subUpdateError);
          return Response.json({ error: "Не удалось обновить подписку" }, { status: 500 });
        }
      } else {
        const { error: subInsertError } = await supabase.from("subscriptions").insert(subscriptionRow);

        if (subInsertError) {
          console.error("Supabase subscriptions insert error:", subInsertError);
          return Response.json({ error: "Не удалось создать подписку" }, { status: 500 });
        }
      }

      const { data: usageRow, error: usageSelectError } = await supabase
        .from("usage_limits")
        .select("used_count")
        .eq("user_id", userId)
        .eq("feature_key", FEATURE_KEY)
        .maybeSingle();

      if (usageSelectError) {
        console.error("Supabase usage_limits select error:", usageSelectError);
        return Response.json({ error: "Не удалось обновить лимиты" }, { status: 500 });
      }

      if (usageRow) {
        const { error: usageUpdateError } = await supabase
          .from("usage_limits")
          .update({ free_limit: PREMIUM_FREE_LIMIT })
          .eq("user_id", userId)
          .eq("feature_key", FEATURE_KEY);

        if (usageUpdateError) {
          console.error("Supabase usage_limits update error:", usageUpdateError);
          return Response.json({ error: "Не удалось обновить лимиты" }, { status: 500 });
        }
      } else {
        const { error: usageInsertError } = await supabase.from("usage_limits").insert({
          user_id: userId,
          feature_key: FEATURE_KEY,
          free_limit: PREMIUM_FREE_LIMIT,
          used_count: 0,
        });

        if (usageInsertError) {
          console.error("Supabase usage_limits insert error:", usageInsertError);
          return Response.json({ error: "Не удалось создать лимиты" }, { status: 500 });
        }
      }
    }
  }

  return Response.json({ received: true }, { status: 200 });
}
