import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({ name, value, ...options })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          req.cookies.set({ name, value: '', ...options })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If there is no session and the user is trying to access protected paths
  const protectedPaths = ['/dashboard', '/invoices', '/exceptions', '/erp', '/settings']
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))

  if (!session && isProtectedPath) {
    // Check if it's a demo request
    if (req.nextUrl.searchParams.get('demo') === 'true') {
      return res;
    }

    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/invoices/:path*', '/exceptions/:path*', '/erp/:path*', '/settings/:path*'],
}
