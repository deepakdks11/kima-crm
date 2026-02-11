import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host') // forwarded host from Vercel
            const isLocalEnv = process.env.NODE_ENV === 'development'
            const redirectUrl = isLocalEnv ? `${origin}${next}` : (forwardedHost ? `https://${forwardedHost}${next}` : `${origin}${next}`)

            // Validating User Profile & Workspace Existence
            try {
                const { data: { user } } = await supabase.auth.getUser()

                if (user) {
                    // 1. Check/Create Profile
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('id', user.id)
                        .single()

                    if (!profile) {
                        // Extract metadata
                        const metadata = user.user_metadata || {}
                        const firstName = metadata.full_name?.split(' ')[0] || metadata.name?.split(' ')[0] || 'New'
                        const lastName = metadata.full_name?.split(' ').slice(1).join(' ') || ''
                        const avatarUrl = metadata.avatar_url || metadata.picture || ''

                        await supabase.from('profiles').insert({
                            id: user.id,
                            first_name: firstName,
                            last_name: lastName,
                            avatar_url: avatarUrl,
                            email: user.email // Assuming 'email' column exists based on typical patterns, if not it might fail but usually profiles have email copy
                        })
                    }

                    // 2. Check/Create Workspace Member
                    // Check if user is part of any workspace
                    const { data: memberships } = await supabase
                        .from('workspace_members')
                        .select('workspace_id')
                        .eq('user_id', user.id)
                        .limit(1)

                    if (!memberships || memberships.length === 0) {
                        // Create Default Workspace
                        const name = "My Workspace"
                        const slug = `my-workspace-${Math.random().toString(36).substring(2, 6)}`

                        const { data: workspace } = await supabase
                            .from('workspaces')
                            .insert({
                                name,
                                slug,
                                owner_id: user.id
                            })
                            .select()
                            .single()

                        if (workspace) {
                            await supabase.from('workspace_members').insert({
                                workspace_id: workspace.id,
                                user_id: user.id,
                                role: 'owner'
                            })
                        }
                    }
                }
            } catch (error) {
                console.error('Error during auth callback DB operations:', error)
                // Continue to redirect even if DB ops fail
            }

            return NextResponse.redirect(redirectUrl)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
