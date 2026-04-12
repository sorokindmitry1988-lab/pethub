import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function requireEnv(
  name: "STRIPE_SECRET_KEY" | "STRIPE_WEBHOOK_SECRET"
): string {
  const raw = process.env[name];
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) {
    throw new Error(`[Stripe] Не задана переменная окружения ${name}.`);
  }
  return value;
}

export async function POST(request: Request) {
  try {
    const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"));
    const webhookSecret = requireEnv("STRIPE_WEBHOOK_SECRET");

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Отсутствует подпись webhook" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch {
      return NextResponse.json(
        { error: "Невалидная подпись webhook" },
        { status: 400 }
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId =
        session.metadata?.user_id ?? session.client_reference_id ?? null;

      if (userId) {
        const supabase = await createClient();

        const stripeCustomerId =
          typeof session.customer === "string" ? session.customer : null;

        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_session_id: session.id,
            stripe_customer_id: stripeCustomerId,
            status: "active",
            plan_code: "premium",
          },
          { onConflict: "user_id" }
        );

        const { data: existingUsage } = await supabase
          .from("usage_limits")
          .select("id, used_count")
          .eq("user_id", userId)
          .eq("feature_key", "vet_questions")
          .maybeSingle();

        if (existingUsage?.id) {
          await supabase
            .from("usage_limits")
            .update({
              free_limit: 999999,
            })
            .eq("id", existingUsage.id);
        } else {
          await supabase.from("usage_limits").insert({
            user_id: userId,
            feature_key: "vet_questions",
            free_limit: 999999,
            used_count: 0,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Не удалось обработать Stripe webhook" },
      { status: 500 }
    );
  }
}