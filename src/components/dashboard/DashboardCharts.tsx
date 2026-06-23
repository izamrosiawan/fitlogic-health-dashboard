"use client"

import React, { useEffect, useState } from 'react'
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart as PieIcon, TrendingUp, BarChart2 } from 'lucide-react'

interface DashboardChartsProps {
  latestCalorie?: {
    target_calories: number
    bmr: number
    tdee: number
    goal: string
  } | null
  currentWeight?: number
  targetWeight?: number
}

export function DashboardCharts({ latestCalorie, currentWeight = 70, targetWeight = 65 }: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-border bg-card h-[300px] text-card-foreground">
            <CardContent className="h-full flex items-center justify-center text-muted-foreground">
              Loading charts...
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // --- DATA 1: MACRONUTRIENT PIE CHART ---
  const targetCals = latestCalorie?.target_calories || 2000
  // Macro calculations: Carbs (50%), Protein (25%), Fats (25%)
  const carbsG = Math.round((targetCals * 0.50) / 4)
  const proteinG = Math.round((targetCals * 0.25) / 4)
  const fatsG = Math.round((targetCals * 0.25) / 9)

  const pieData = [
    { name: 'Karbohidrat (50%)', value: carbsG, color: 'var(--primary)' },
    { name: 'Protein (25%)', value: proteinG, color: 'oklch(0.60 0.15 150)' }, // Green
    { name: 'Lemak (25%)', value: fatsG, color: 'oklch(0.70 0.12 40)' } // Amber/Brown
  ]

  // --- DATA 2: WEIGHT PROGRESSION LINE CHART ---
  const goal = latestCalorie?.goal || 'maintain'
  let weeklyRate = 0
  if (goal === 'lose_fast') weeklyRate = -0.75
  else if (goal === 'lose_slow') weeklyRate = -0.4
  else if (goal === 'gain_slow') weeklyRate = 0.25
  else if (goal === 'gain_fast') weeklyRate = 0.5

  const lineData = []
  const startW = currentWeight || 70
  const targetW = targetWeight || 65

  for (let week = 0; week <= 10; week++) {
    const projected = startW + (week * weeklyRate)
    let finalProjected = projected
    
    // Lock value when target is met
    if (weeklyRate < 0) {
      finalProjected = Math.max(targetW, projected)
    } else if (weeklyRate > 0) {
      finalProjected = Math.min(targetW, projected)
    }

    lineData.push({
      week: `Mg-${week}`,
      'Berat Badan (kg)': Math.round(finalProjected * 10) / 10
    })
  }

  // --- DATA 3: DAILY CALORIE BAR CHART ---
  const bmr = latestCalorie?.bmr || 1500
  const tdee = latestCalorie?.tdee || 2100
  const target = latestCalorie?.target_calories || 1800

  const barData = [
    { name: 'BMR', 'Kalori (kcal)': bmr, fill: 'oklch(0.65 0.15 250)' },
    { name: 'TDEE', 'Kalori (kcal)': tdee, fill: 'oklch(0.70 0.12 40)' },
    { name: 'Target Diet', 'Kalori (kcal)': target, fill: 'var(--primary)' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* 1. Macro Pie Chart */}
      <Card className="border border-border hover:shadow-xs transition-all bg-card text-card-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-primary" /> Pembagian Makronutrisi
          </CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground">Rekomendasi gram makro harian</CardDescription>
        </CardHeader>
        <CardContent className="h-[220px] flex flex-col justify-between">
          <div className="h-[140px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} gram`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">Total</span>
              <span className="text-xs font-bold text-foreground">{carbsG + proteinG + fatsG}g</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-1 text-[10px] pt-2 border-t border-border/80">
            {pieData.map((entry, idx) => (
              <div key={idx} className="text-center">
                <span className="block font-semibold text-foreground">{entry.value}g</span>
                <span className="text-[9px] text-muted-foreground truncate block">{entry.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. Weight progression Line Chart */}
      <Card className="border border-border hover:shadow-xs transition-all bg-card text-card-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Estimasi Progres Berat
          </CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground">Proyeksi berat badan dalam 10 minggu</CardDescription>
        </CardHeader>
        <CardContent className="h-[220px]">
          <div className="h-full w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis 
                  dataKey="week" 
                  stroke="var(--muted-foreground)" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="var(--muted-foreground)" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="Berat Badan (kg)" 
                  stroke="var(--primary)" 
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 3. Calories Bar Chart */}
      <Card className="border border-border hover:shadow-xs transition-all bg-card text-card-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" /> Perbandingan Energi
          </CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground">Kebutuhan kalori BMR vs TDEE vs Target</CardDescription>
        </CardHeader>
        <CardContent className="h-[220px]">
          <div className="h-full w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--muted-foreground)" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="var(--muted-foreground)" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip />
                <Bar 
                  dataKey="Kalori (kcal)" 
                  radius={[4, 4, 0, 0]}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
