import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false }
    }
  );

  const data = await req.json();

  const {
    guest_id,
    room_id,
    base_amount,
    extra_hours,
    extra_charge,
    total_amount
  } = data;

  const { error } = await supabase.from("accounts").insert([
    {
      guest_id,
      room_id,
      base_amount,
      extra_hours,
      extra_charge,
      total_amount,
      payment_method: "cash",
    },
  ]);

  if (error) {
    console.error("accounts insert error:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
