"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { WelcomeSection } from '@/components/dashboard/WelcomeSection'
import { BmiWidget } from '@/components/dashboard/BmiWidget'
import { CalorieWidget } from '@/components/dashboard/CalorieWidget'
import { WorkoutWidget } from '@/components/dashboard/WorkoutWidget'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { NutritionGlossary } from '@/components/dashboard/NutritionGlossary'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { Loader2, User, Activity, Flame, Dumbbell, TrendingUp, Target } from 'lucide-react'

export default function DashboardPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('Enthusiast')
  const [latestBmi, setLatestBmi] = useState<any>(null)
  const [latestCalorie, setLatestCalorie] = useState<any>(null)
  const [workoutCount, setWorkoutCount] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [totalCalories, setTotalCalories] = useState(0)
  const [todayBurnedCalories, setTodayBurnedCalories] = useState(0)
  const [currentWeight, setCurrentWeight] = useState(70)
  const [targetWeight, setTargetWeight] = useState(65)
  const [userId, setUserId] = useState<string>('')
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUserId(user.id)

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setDisplayName(profile?.full_name || user.user_metadata?.full_name || 'Enthusiast')

        // Fetch latest BMI record
        const { data: bmiData } = await supabase
          .from('bmi_records')
          .select('*')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1)
        setLatestBmi(bmiData?.[0] || null)

        // Fetch latest Calorie record
        const { data: calorieData } = await supabase
          .from('calorie_records')
          .select('*')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1)
        setLatestCalorie(calorieData?.[0] || null)

        // Populate weight metrics for projection chart
        if (profile) {
          if (profile.weight) setCurrentWeight(profile.weight)
          if (profile.target_weight) setTargetWeight(profile.target_weight)
        } else if (bmiData?.[0]) {
          setCurrentWeight(bmiData[0].weight)
        }

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
        let count = 0
        let duration = 0
        let calories = 0

        if (recentWorkouts) {
          count = recentWorkouts.length
          duration = recentWorkouts.reduce((sum: number, w: any) => sum + (w.duration || 0), 0)
          calories = recentWorkouts.reduce((sum: number, w: any) => sum + (w.calories_burned || 0), 0)
        }
        setWorkoutCount(count)
        setTotalDuration(duration)
        setTotalCalories(calories)

        // Compute today's active calorie burn
        const now = new Date()
        const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        const todayWorkouts = recentWorkouts?.filter((w: any) => w.date === todayDateStr) || []
        const todayBurn = todayWorkouts.reduce((sum: number, w: any) => sum + (w.calories_burned || 0), 0)
        setTodayBurnedCalories(todayBurn)

        // Build last 7 days chart data
        const tempChartData = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          const dateStr = `${year}-${month}-${day}`
          
          const dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
          
          const dailyWorkouts = recentWorkouts?.filter((w: any) => w.date === dateStr) || []
          const dailyCalories = dailyWorkouts.reduce((sum: number, w: any) => sum + (w.calories_burned || 0), 0)

          tempChartData.push({
            date: dateLabel,
            calories: dailyCalories
          })
        }
        setChartData(tempChartData)
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <PageContainer title="Dashboard" description="Loading your profile and trends...">
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="text-sm font-semibold text-muted-foreground">Loading Dashboard...</span>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Dashboard"
      description="Track and monitor your fitness trends and health metrics."
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <WelcomeSection userName={displayName} />

        {/* Onboarding Guide: Mulai Dari Sini */}
        <div className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden text-card-foreground">
          <div className="relative z-10 space-y-4">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">i</span>
                Panduan Penggunaan FitLogic (Mulai Dari Sini)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Ikuti 5 langkah sederhana berikut untuk menyusun program diet dan memantau progres kebugaran Anda:</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <a href="/dashboard/profile" className="flex items-center gap-3 p-3 bg-muted/40 hover:bg-muted/80 border border-border hover:border-primary/30 rounded-xl transition-all group">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">1. Lengkapi Profil</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Lengkapi tinggi, berat, & target di halaman profil.</p>
                </div>
              </a>

              <a href="/dashboard/bmi" className="flex items-center gap-3 p-3 bg-muted/40 hover:bg-muted/80 border border-border hover:border-primary/30 rounded-xl transition-all group">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">2. Hitung BMI</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Ukur indeks massa tubuh & status awal berat badan.</p>
                </div>
              </a>

              <a href="/dashboard/calorie" className="flex items-center gap-3 p-3 bg-muted/40 hover:bg-muted/80 border border-border hover:border-primary/30 rounded-xl transition-all group">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Flame className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">3. Hitung Kalori</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Hitung BMR, TDEE, & rancang target kalori harian.</p>
                </div>
              </a>

              <a href="/dashboard/workouts" className="flex items-center gap-3 p-3 bg-muted/40 hover:bg-muted/80 border border-border hover:border-primary/30 rounded-xl transition-all group">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Dumbbell className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">4. Catat Workout</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Catat latihan olahraga & total kalori terbakar.</p>
                </div>
              </a>

              <a href="/dashboard/analytics" className="flex items-center gap-3 p-3 bg-muted/40 hover:bg-muted/80 border border-border hover:border-primary/30 rounded-xl transition-all group">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">5. Pantau Progres</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Lihat tren perkembangan berat & olahraga Anda.</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Academic Report Summary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card BMR */}
          <Card className="border border-border bg-card text-card-foreground p-5 space-y-2 hover:shadow-xs transition-all">
            <div className="flex items-center gap-2">
              <Flame className="h-4.5 w-4.5 text-primary" />
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Basal Metabolic Rate (BMR)</h4>
            </div>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {latestCalorie ? `${latestCalorie.bmr} kcal` : '--'}
            </p>
            <p className="text-[10px] text-muted-foreground leading-snug">Kebutuhan kalori dasar untuk mempertahankan hidup organ tubuh saat istirahat total.</p>
          </Card>

          {/* Card TDEE */}
          <Card className="border border-border bg-card text-card-foreground p-5 space-y-2 hover:shadow-xs transition-all">
            <div className="flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-blue-500" />
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Energy Expenditure (TDEE)</h4>
            </div>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {latestCalorie ? `${latestCalorie.tdee} kcal` : '--'}
            </p>
            <p className="text-[10px] text-muted-foreground leading-snug">Kebutuhan kalori harian total disesuaikan dengan perkiraan level aktivitas fisik Anda.</p>
          </Card>

          {/* Card Target Kalori */}
          <Card className="border border-border bg-card text-card-foreground p-5 space-y-2 hover:shadow-xs transition-all">
            <div className="flex items-center gap-2">
              <Target className="h-4.5 w-4.5 text-emerald-500" />
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Kalori Harian</h4>
            </div>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {latestCalorie ? `${latestCalorie.target_calories} kcal` : '--'}
            </p>
            <p className="text-[10px] text-muted-foreground leading-snug">Rekomendasi asupan energi harian untuk mencapai berat badan target secara bertahap.</p>
          </Card>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BmiWidget latestBmi={latestBmi} />
          <CalorieWidget 
            latestCalorie={latestCalorie} 
            todayBurned={todayBurnedCalories}
            userId={userId}
          />
          <WorkoutWidget
            workoutCount={workoutCount}
            totalDuration={totalDuration}
            totalCalories={totalCalories}
          />
        </div>

        {/* Report Visualization Charts Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">Visualisasi Progres & Analitik Rekomendasi Diet</h3>
            <p className="text-xs text-muted-foreground">Grafik pemantauan kecocokan kalori, pembagian zat makro gizi, dan proyeksi berat badan target.</p>
          </div>
          <DashboardCharts 
            latestCalorie={latestCalorie}
            currentWeight={currentWeight}
            targetWeight={targetWeight}
          />
        </div>

        {/* Nutrition Glossary (Edukasi Gizi) */}
        <NutritionGlossary />
      </div>
    </PageContainer>
  )
}
