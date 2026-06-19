"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PageContainer } from '@/components/layout/PageContainer'
import { TrendingUp, Scale, Flame, Dumbbell, Loader2, Calendar, Activity, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar } from 'recharts'
import { toast } from 'sonner'

interface BmiData {
  recorded_at: string
  weight: number
}

interface CalorieData {
  recorded_at: string
  target_calories: number
}

interface WorkoutData {
  date: string
  calories_burned: number
  duration: number
}

export default function AnalyticsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('weight')

  // Data states
  const [weightData, setWeightData] = useState<BmiData[]>([])
  const [activeCaloriesData, setActiveCaloriesData] = useState<WorkoutData[]>([])
  const [calorieBudgetData, setCalorieBudgetData] = useState<CalorieData[]>([])

  // Metric states
  const [weightChange, setWeightChange] = useState<string>('0')
  const [peakSessionBurn, setPeakSessionBurn] = useState(0)
  const [avgWorkoutDuration, setAvgWorkoutDuration] = useState(0)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Fetch BMI history for weight chart
      const { data: bmiRecords, error: bmiErr } = await supabase
        .from('bmi_records')
        .select('weight, recorded_at')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: true })

      if (bmiErr) throw bmiErr

      // Parse BMI history
      if (bmiRecords && bmiRecords.length > 0) {
        const parsedWeight = bmiRecords.map((r: any) => ({
          recorded_at: new Date(r.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          weight: Number(r.weight)
        }))
        setWeightData(parsedWeight)

        // Calculate weight difference
        const firstWeight = Number(bmiRecords[0].weight)
        const lastWeight = Number(bmiRecords[bmiRecords.length - 1].weight)
        const diff = lastWeight - firstWeight
        setWeightChange(diff > 0 ? `+${diff.toFixed(1)} kg` : `${diff.toFixed(1)} kg`)
      }

      // 2. Fetch workouts for calorie burn chart
      const { data: workoutRecords, error: workErr } = await supabase
        .from('workouts')
        .select('date, calories_burned, duration')
        .eq('user_id', user.id)
        .order('date', { ascending: true })

      if (workErr) throw workErr

      if (workoutRecords && workoutRecords.length > 0) {
        // Group calories by date
        const groupedMap = new Map<string, { calories_burned: number, duration: number }>()
        let maxBurn = 0
        let totalMins = 0

        workoutRecords.forEach((w: any) => {
          const formattedDate = new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          const current = groupedMap.get(formattedDate) || { calories_burned: 0, duration: 0 }
          
          groupedMap.set(formattedDate, {
            calories_burned: current.calories_burned + Number(w.calories_burned),
            duration: current.duration + Number(w.duration)
          })

          if (Number(w.calories_burned) > maxBurn) {
            maxBurn = Number(w.calories_burned)
          }
          totalMins += Number(w.duration)
        })

        const parsedWorkouts = Array.from(groupedMap.entries()).map(([date, val]) => ({
          date,
          calories_burned: val.calories_burned,
          duration: val.duration
        }))

        setActiveCaloriesData(parsedWorkouts)
        setPeakSessionBurn(maxBurn)
        setAvgWorkoutDuration(Math.round(totalMins / workoutRecords.length))
      }

      // 3. Fetch calorie calculations history
      const { data: calorieRecords, error: calErr } = await supabase
        .from('calorie_records')
        .select('target_calories, recorded_at')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: true })

      if (calErr) throw calErr

      if (calorieRecords && calorieRecords.length > 0) {
        const parsedBudget = calorieRecords.map((r: any) => ({
          recorded_at: new Date(r.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          target_calories: Number(r.target_calories)
        }))
        setCalorieBudgetData(parsedBudget)
      }

    } catch (err: any) {
      toast.error('Failed to load analytics trends: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer
      title="Analytics Dashboard"
      description="Deep-dive into weight shift histories, calorie targets, and active workout profiles."
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 text-muted-foreground space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm font-semibold">Loading data analytics...</span>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Key Indicators Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border-border flex items-center justify-between p-6 shadow-xs text-card-foreground">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Weight Variance</p>
                <h3 className={`text-2xl font-semibold tracking-tight ${parseFloat(weightChange) < 0 ? 'text-emerald-600 dark:text-emerald-400' : parseFloat(weightChange) > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-foreground'}`}>
                  {weightChange}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Scale className="h-5 w-5" />
              </div>
            </Card>

            <Card className="bg-card border-border flex items-center justify-between p-6 shadow-xs text-card-foreground">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Peak Active Burn</p>
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                  {peakSessionBurn} <span className="text-xs text-muted-foreground font-semibold">kcal / session</span>
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Flame className="h-5 w-5" />
              </div>
            </Card>

            <Card className="bg-card border-border flex items-center justify-between p-6 shadow-xs text-card-foreground">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Avg Session Duration</p>
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                  {avgWorkoutDuration} <span className="text-xs text-muted-foreground font-semibold">min</span>
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Dumbbell className="h-5 w-5" />
              </div>
            </Card>
          </div>

          {/* Interactive Chart Section with Tabs */}
          <Card className="bg-card border-border p-6 shadow-xs text-card-foreground">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" /> Fitness Progress Trends
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">Select parameters to view your historical logs</p>
                </div>
                
                <TabsList className="bg-muted border border-border rounded-xl p-1 text-muted-foreground self-start md:self-center">
                  <TabsTrigger 
                    value="weight" 
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all cursor-pointer"
                  >
                    Weight Progress
                  </TabsTrigger>
                  <TabsTrigger 
                    value="energy" 
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all cursor-pointer"
                  >
                    Active Expenditure
                  </TabsTrigger>
                  <TabsTrigger 
                    value="calorie" 
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all cursor-pointer"
                  >
                    Caloric Target
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Weight Chart Tab */}
              <TabsContent value="weight" className="outline-none pt-2">
                {weightData.length > 1 ? (
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weightData}>
                        <defs>
                          <linearGradient id="weightGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis 
                          dataKey="recorded_at" 
                          stroke="var(--muted-foreground)" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis 
                          stroke="var(--muted-foreground)" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false} 
                          domain={['dataMin - 3', 'dataMax + 3']}
                          tickFormatter={(v) => `${v}kg`}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#weightGlow)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground space-y-2">
                    <Scale className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">Not enough weight data</p>
                    <p className="text-xs text-muted-foreground/80 max-w-[280px]">Add at least 2 entries in the BMI history to plot weight trends.</p>
                  </div>
                )}
              </TabsContent>

              {/* Active Calories Tab */}
              <TabsContent value="energy" className="outline-none pt-2">
                {activeCaloriesData.length > 0 ? (
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activeCaloriesData}>
                        <defs>
                          <linearGradient id="burnGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.85}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.15}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="var(--muted-foreground)" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis 
                          stroke="var(--muted-foreground)" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(v) => `${v} kcal`}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                        />
                        <Bar 
                          dataKey="calories_burned" 
                          fill="url(#burnGlow)" 
                          radius={[4, 4, 0, 0]} 
                          name="Calories Burned"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground space-y-2">
                    <Flame className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">No workout activity logged</p>
                    <p className="text-xs text-muted-foreground/80 max-w-[280px]">Add logged sessions in the Workout tracker to visualize active energy trends.</p>
                  </div>
                )}
              </TabsContent>

              {/* Caloric Budget Tab */}
              <TabsContent value="calorie" className="outline-none pt-2">
                {calorieBudgetData.length > 0 ? (
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={calorieBudgetData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis 
                          dataKey="recorded_at" 
                          stroke="var(--muted-foreground)" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis 
                          stroke="var(--muted-foreground)" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(v) => `${v} kcal`}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="target_calories" 
                          stroke="var(--primary)" 
                          strokeWidth={2.5}
                          dot={{ fill: 'var(--primary)', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Daily Target"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground space-y-2">
                    <TrendingUp className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">No daily calorie goals set</p>
                    <p className="text-xs text-muted-foreground/80 max-w-[280px]">Use the Calorie Calculator to save multiple targets and monitor adjustments here.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      )}
    </PageContainer>
  )
}
