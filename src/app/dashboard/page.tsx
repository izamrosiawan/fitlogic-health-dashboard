import { createClient } from '@/utils/supabase/server'
import { WelcomeSection } from '@/components/dashboard/WelcomeSection'
import { BmiWidget } from '@/components/dashboard/BmiWidget'
import { CalorieWidget } from '@/components/dashboard/CalorieWidget'
import { WorkoutWidget } from '@/components/dashboard/WorkoutWidget'
import { ProgressOverview } from '@/components/dashboard/ProgressOverview'
import { PageContainer } from '@/components/layout/PageContainer'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get active session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.user_metadata?.full_name || 'Enthusiast'

  // Fetch latest BMI record
  const { data: latestBmi } = await supabase
    .from('bmi_records')
    .select('*')
    .eq('user_id', user.id)
    .order('recorded_at', { ascending: false })
    .limit(1)

  // Fetch latest Calorie record
  const { data: latestCalorie } = await supabase
    .from('calorie_records')
    .select('*')
    .eq('user_id', user.id)
    .order('recorded_at', { ascending: false })
    .limit(1)

  // Fetch workouts from the last 7 days (trailing)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0]

  const { data: recentWorkouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', oneWeekAgoStr)
    .order('date', { ascending: true })

  // Aggregate weekly workout stats
  let workoutCount = 0
  let totalDuration = 0
  let totalCalories = 0

  if (recentWorkouts) {
    workoutCount = recentWorkouts.length
    totalDuration = recentWorkouts.reduce((sum: number, w: any) => sum + (w.duration || 0), 0)
    totalCalories = recentWorkouts.reduce((sum: number, w: any) => sum + (w.calories_burned || 0), 0)
  }

  // Build last 7 days chart data
  const chartData = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    
    // Format date properly depending on local timezone
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    const dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
    
    // Sum calories burned for workouts on this date
    const dailyWorkouts = recentWorkouts?.filter((w: any) => w.date === dateStr) || []
    const dailyCalories = dailyWorkouts.reduce((sum: number, w: any) => sum + (w.calories_burned || 0), 0)

    chartData.push({
      date: dateLabel,
      calories: dailyCalories
    })
  }

  return (
    <PageContainer
      title="Dashboard"
      description="Track and monitor your fitness trends and health metrics."
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <WelcomeSection userName={displayName} />

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BmiWidget latestBmi={latestBmi?.[0] || null} />
          <CalorieWidget latestCalorie={latestCalorie?.[0] || null} />
          <WorkoutWidget 
            workoutCount={workoutCount}
            totalDuration={totalDuration}
            totalCalories={totalCalories}
          />
        </div>

        {/* Charts & Trends Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProgressOverview data={chartData} />
        </div>
      </div>
    </PageContainer>
  )
}
