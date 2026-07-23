import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Prefixed with _ since it's unused while the auth gate below is disabled.
  const _supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // TEMP: auth gate disabled during solo testing — re-enable before this app
  // is ever reachable by anyone but you (uncomment below, and re-enable RLS
  // via `alter table ... enable row level security` in Supabase).
  //
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();
  //
  // const isAuthRoute = request.nextUrl.pathname.startsWith("/login");
  //
  // if (!user && !isAuthRoute) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/login";
  //   return NextResponse.redirect(url);
  // }
  //
  // if (user && isAuthRoute) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/library";
  //   return NextResponse.redirect(url);
  // }

  return supabaseResponse;
}
