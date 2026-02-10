
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // 1. If user is logged in and trying to access login/signup pages, redirect to dashboard
    if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname === '/')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    // 2. If user is NOT logged in and trying to access protected routes, redirect to login
    // Protected routes are everything NOT in the public paths list
    const publicPaths = ['/login', '/signup', '/forgot-password', '/auth/callback', '/invite', '/update-password']
    const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

    if (!user && !isPublicPath && request.nextUrl.pathname !== '/') {
        // Allow landing page access for now, but restrict dashboard paths
        // For now, let's assume everything under /dashboard, /leads, etc is protected
        // Actually, let's use a simpler "If it's NOT a public path, and NOT the root (if root is landing), protect it"
        // User requested: "redirect people to the /login page if they are not logged in else send them to the /dasboard site"

        // Strategy: Protect everything by default, exclude public paths
        // We will treat '/' as public if it's a landing page, BUT the user said "redirect people to the /login page if they are not logged in"
        // This implies the root might be a protected entry point too, OR we should redirect root to login.

        if (request.nextUrl.pathname === '/') {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('return_to', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    // Special handling for root path when logged in -> already handled in block #1

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|manifest\\.webmanifest|sw\\.js|icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
