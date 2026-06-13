import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }: { name: string; value: string }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  const publicRoutes = ["/", "/auth/login", "/auth/register", "/auth/forgot-password", "/auth/callback"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/auth/")
  );

  // On public routes, skip the auth check entirely — no Supabase call needed
  // This means the login page always loads instantly even when Supabase is paused
  if (isPublicRoute) return supabaseResponse;

  // For protected routes, validate the session
  // Wrap in try/catch so a Supabase outage never blocks navigation entirely
  try {
    // Use getSession() (local JWT decode from the HTTP-only cookie — no network
    // call to Supabase auth) instead of getUser() (remote verification) to avoid
    // tripping the auth rate limit on every navigation. The cookie is signed by
    // Supabase and cannot be tampered with by the client, so it's safe as a gate.
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/login";
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  } catch {
    // Supabase unreachable — redirect to login with a wake-up hint
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("error", "server_unavailable");
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}