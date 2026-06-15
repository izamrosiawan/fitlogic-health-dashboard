import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { mockSupabase } from './mockClient'

export async function createClient() {
  const isMock = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-supabase-project-id') || 
                 !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                 process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-supabase-project-id.supabase.co'

  if (isMock) {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('fitlogic_user')

    const serverMock = {
      ...mockSupabase,
      auth: {
        ...mockSupabase.auth,
        getUser: async () => {
          if (!userCookie) return { data: { user: null }, error: null }
          const user = {
            id: 'demo-user-id',
            email: 'demo@fitlogic.com',
            user_metadata: { full_name: 'Demo Student' }
          }
          return { data: { user }, error: null }
        }
      }
    }
    return serverMock as any
  }

  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
