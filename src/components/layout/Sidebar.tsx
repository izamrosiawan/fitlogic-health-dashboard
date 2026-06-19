"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  LayoutDashboard,
  Scale,
  Flame,
  Dumbbell,
  TrendingUp,
  User,
  LogOut,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'BMI Calc', href: '/dashboard/bmi', icon: Scale },
  { name: 'Calories', href: '/dashboard/calorie', icon: Flame },
  { name: 'Workouts', href: '/dashboard/workouts', icon: Dumbbell },
  { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-background to-card border-r border-border h-screen sticky top-0 text-foreground">
        <div className="h-16 flex items-center px-6 border-b border-border/80 gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg tracking-tight text-foreground">
            FITLOGIC
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 gap-3 group relative overflow-hidden",
                  isActive
                    ? "bg-background text-primary border-l-2 border-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-200 group-hover:scale-105",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200 gap-3 cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 border-t border-border backdrop-blur-lg flex justify-around items-center h-16 px-2 z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 mb-0.5" />
              <span>{item.name.split(' ')[0]}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
