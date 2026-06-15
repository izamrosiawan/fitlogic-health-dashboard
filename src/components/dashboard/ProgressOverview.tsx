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
      <Card className="bg-neutral-950 border-neutral-900 col-span-1 md:col-span-3 h-[300px]">
        <CardContent className="h-full flex items-center justify-center text-neutral-500">
          Loading chart...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-neutral-950 border-neutral-900 col-span-1 md:col-span-3 hover:border-neutral-800 transition-all">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" /> Calories Burned (Last 7 Days)
        </CardTitle>
        <CardDescription className="text-xs text-neutral-400 font-medium">Daily calorie expenditure breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="h-[200px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#171717" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#737373" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#737373" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${value} kcal`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0a0a', 
                    borderColor: '#262626', 
                    borderRadius: '8px', 
                    color: '#fff' 
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                />
                <Bar 
                  dataKey="calories" 
                  fill="url(#colorOrange)" 
                  radius={[4, 4, 0, 0]} 
                />
                <defs>
                  <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[200px] flex flex-col items-center justify-center text-center text-neutral-500 py-6 space-y-3">
            <p className="text-sm font-semibold">No recent activity data</p>
            <p className="text-xs text-neutral-500 max-w-[240px]">Log your workouts to populate daily calorie burning trends.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
