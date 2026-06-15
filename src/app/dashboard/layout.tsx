import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile from the database
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || 'Enthusiast'
  const email = profile?.email || user.email

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100 pb-16 md:pb-0">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header userEmail={email} userName={displayName} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
