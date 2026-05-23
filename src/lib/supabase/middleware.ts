import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";

function withPathname(request: NextRequest, response: NextResponse) {
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export async function updateSession(request: NextRequest) {
  // Skip Supabase when using .env.example placeholders (avoids "connection failed")
  if (!isSupabaseConfigured()) {
    return withPathname(request, NextResponse.next({ request }));
  }

  let supabaseResponse = withPathname(request, NextResponse.next({ request }));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = withPathname(request, NextResponse.next({ request }));
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    await supabase.auth.getUser();
  } catch {
    // Bad URL, paused project, or network issue — don't block the app
    return withPathname(request, NextResponse.next({ request }));
  }

  return supabaseResponse;
}
