"use client"

import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface ProgressOverviewProps {
  data: {
    date: string
    calories: number
  }[]
}

export function ProgressOverview({ data }: ProgressOverviewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className="border border-border bg-card col-span-1 md:col-span-3 h-[300px] text-card-foreground">
        <CardContent className="h-full flex items-center justify-center text-muted-foreground">
          Loading chart...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-border col-span-1 md:col-span-3 hover:shadow-xs transition-all bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Calories Burned (Last 7 Days)
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground font-medium">Daily calorie expenditure breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="h-[200px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--muted-foreground)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="var(--muted-foreground)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${value} kcal`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)', 
                    borderRadius: '8px', 
                    color: 'var(--foreground)' 
                  }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
                />
                <Bar 
                  dataKey="calories" 
                  fill="url(#colorBlue)" 
                  radius={[4, 4, 0, 0]} 
                />
                <defs>
                  <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.15}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[200px] flex flex-col items-center justify-center text-center text-muted-foreground py-6 space-y-3">
            <p className="text-sm font-semibold">No recent activity data</p>
            <p className="text-xs text-muted-foreground max-w-[240px]">Log your workouts to populate daily calorie burning trends.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
