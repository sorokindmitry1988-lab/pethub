/**
 * Domain types for PetHub (aligned with typical Supabase row shapes: UUIDs and timestamptz as strings).
 */

export type Pet = {
  id: string;
  user_id: string;
  name: string;
  species: string;
  breed: string | null;
  /** ISO 8601 calendar date (YYYY-MM-DD) */
  birth_date: string | null;
  sex: "male" | "female" | "unknown" | null;
  notes: string | null;
  photo_url: string | null;
  weight_kg: number | null;
  microchip_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  author_id: string;
  pet_id: string | null;
  body: string;
  media_urls: string[] | null;
  visibility: "public" | "followers" | "private";
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan: "free" | "basic" | "pro";
  status:
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "paused";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

export type VetQuestion = {
  id: string;
  user_id: string;
  pet_id: string | null;
  title: string;
  body: string;
  status: "open" | "answered" | "archived";
  created_at: string;
  updated_at: string;
};

export type VetAnswer = {
  id: string;
  question_id: string;
  vet_user_id: string;
  body: string;
  created_at: string;
};

export type UsageLimit = {
  id: string;
  user_id: string;
  /** Logical meter, e.g. vet_questions_monthly, storage_mb */
  feature: string;
  limit: number;
  used: number;
  /** Inclusive window for the quota (ISO 8601) */
  window_start: string;
  window_end: string;
};
