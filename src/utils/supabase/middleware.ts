import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const isMock = true

  if (isMock) {
    const userCookie = request.cookies.get('fitlogic_user')
    const pathname = request.nextUrl.pathname

    // Auto-redirect root to dashboard in demo mode
    if (pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      const response = NextResponse.redirect(url)
      if (!userCookie) {
        response.cookies.set('fitlogic_user', 'true', { path: '/' })
      }
      return response
    }

    if (pathname.startsWith('/dashboard')) {
      if (!userCookie) {
        const response = NextResponse.next({ request })
        response.cookies.set('fitlogic_user', 'true', { path: '/' })
        return response
      }
    }

    if (userCookie && (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protected routes guard
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from auth routes
  if (user && (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
