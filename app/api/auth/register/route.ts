import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthUser } from "@/lib/sqlite-auth-store";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration details." }, { status: 400 });
  }

  const created = await createAuthUser(parsed.data);
  if (!created.ok && created.reason === "exists") {
    return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
