import { auth } from "@/auth"

export default auth((req) => {
  const { pathname, origin } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Paths that don't require auth
  const publicPaths = ["/", "/login", "/signup", "/verify:path*"]

  // 🚫 Not logged in, trying to access a protected route
  if (!isLoggedIn && !publicPaths.includes(pathname)) {
    return Response.redirect(new URL("/login", origin))
  }

  // ✅ Logged in: redirect only if they hit a public path (login/signup/landing)
  if (isLoggedIn && publicPaths.includes(pathname)) {
    return Response.redirect(new URL("/new", origin))
  }

  // Allow request to continue
  return
})

export const config = {
  matcher: [
    // Protect overview, documents, topics, and new
    "/",
    "/overview",
    "/results/:path*",
    "/new",
    // Also apply middleware on login & signup for redirect logic
    "/login",
    "/signup",
    "/verify:path*",
  ],
}
