import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function requireEnv(name: "STRIPE_SECRET_KEY"): string {
  const raw = process.env[name];
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) {
    throw new Error(`[Stripe] Не задана переменная окружения ${name}.`);
  }
  return value;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
    }

    const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"));
    const origin = new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "rub",
            product_data: {
              name: "Vet Consultations",
            },
            unit_amount: 9900,
          },
          quantity: 1,
        },
      ],
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        plan_code: "premium",
      },
      success_url: `${origin}/account?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось создать Stripe Checkout session.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}