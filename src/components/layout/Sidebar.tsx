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
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 text-neutral-200">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border gap-2">
          <Activity className="h-6 w-6 text-orange-500 animate-pulse" />
          <span className="font-bold text-xl tracking-wider text-white">
            FIT<span className="text-orange-500">LOGIC</span>
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
                    ? "bg-gradient-to-r from-orange-500/10 to-amber-500/5 text-orange-500 border-l-2 border-orange-500"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-orange-500" : "text-neutral-400 group-hover:text-neutral-200"
                )} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-neutral-900">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl text-red-400 hover:bg-red-500/5 hover:text-red-300 transition-all duration-200 gap-3 cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar/90 border-t border-sidebar-border backdrop-blur-lg flex justify-around items-center h-16 px-2 z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors",
                isActive ? "text-orange-500" : "text-neutral-400 hover:text-neutral-200"
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
