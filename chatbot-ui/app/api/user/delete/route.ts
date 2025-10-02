export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/supabase/types"

export async function POST() {
  try {
    const cookieStore = cookies()

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          }
        }
      }
    )

    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = session.user.id

    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const errors: string[] = []

    // Best-effort deletes across key tables owned by the user
    const tablesWithUserId = [
      "message_file_items",
      "messages",
      "chat_files",
      "chats",
      "files",
      "collections",
      "assistants",
      "tools",
      "models",
      "prompts",
      "presets",
      "workspaces",
      "profiles",
      "experiment_state"
    ] as const

    for (const table of tablesWithUserId) {
      try {
        await supabaseAdmin.from(table as any).delete().eq("user_id", userId)
      } catch (e: any) {
        errors.push(`${table}: ${e?.message || "unknown error"}`)
      }
    }

    // Finally, delete the auth user
    try {
      await supabaseAdmin.auth.admin.deleteUser(userId)
    } catch (e: any) {
      errors.push(`auth: ${e?.message || "unknown error"}`)
    }

    return NextResponse.json({ ok: true, errors })
  } catch (error: any) {
    const message = error?.message || "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
} 