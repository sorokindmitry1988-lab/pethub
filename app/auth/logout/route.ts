import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore
    .getAll()
    .filter(({ name }) => name.startsWith("sb-"))
    .forEach(({ name }) => {
      cookieStore.delete(name);
    });

  return NextResponse.redirect(new URL("/", request.url));
}
