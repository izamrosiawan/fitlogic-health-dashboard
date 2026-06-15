"use client"

import React from 'react'
import Link from 'next/link'
import { Flame, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CalorieWidgetProps {
  latestCalorie?: {
    target_calories: number
    bmr: number
    tdee: number
    goal: string
    activity_level: string
  } | null
}

export function CalorieWidget({ latestCalorie }: CalorieWidgetProps) {
  const getGoalLabel = (goal: string) => {
    switch (goal) {
      case 'lose_fast':
        return 'Weight Loss (Fast)'
      case 'lose_slow':
        return 'Weight Loss (Slow)'
      case 'maintain':
        return 'Maintain Weight'
      case 'gain_slow':
        return 'Weight Gain (Slow)'
      case 'gain_fast':
        return 'Weight Gain (Fast)'
      default:
        return goal
    }
  }

  return (
    <Card className="bg-neutral-950 border-neutral-900 overflow-hidden flex flex-col justify-between h-full hover:border-neutral-800 transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" /> Daily Calories
          </CardTitle>
          <CardDescription className="text-xs text-neutral-400">Target daily caloric energy profile</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        {latestCalorie ? (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="text-4xl font-extrabold text-white">
                {latestCalorie.target_calories} <span className="text-sm font-semibold text-neutral-500">kcal/day</span>
              </div>
              <div className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded-full uppercase">
                {getGoalLabel(latestCalorie.goal).split(' ')[0]}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-sm border-t border-neutral-900">
              <div>
                <p className="text-xs text-neutral-400 font-semibold uppercase">Basal Metabolic (BMR)</p>
                <p className="font-bold text-white mt-0.5">{latestCalorie.bmr} kcal</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-semibold uppercase">TDEE (Active Target)</p>
                <p className="font-bold text-white mt-0.5">{latestCalorie.tdee} kcal</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-6 space-y-3">
            <div className="h-10 w-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
              <Flame className="h-5 w-5" />
            </div>
            <p className="text-sm text-neutral-400 font-semibold">No Calorie target found</p>
            <p className="text-xs text-neutral-500 max-w-[180px]">Calculate daily caloric needs based on activity multiplier.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-neutral-900 bg-neutral-950/40 p-4">
        <Link href="/dashboard/calorie" className="w-full">
          <Button variant="ghost" className="w-full text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-900/60 justify-between cursor-pointer">
            {latestCalorie ? 'Recalculate Calories' : 'Calculate Calories Now'} <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
