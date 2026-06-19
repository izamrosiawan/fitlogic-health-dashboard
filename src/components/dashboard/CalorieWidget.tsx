"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Flame, ArrowRight, RotateCcw, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CalorieWidgetProps {
  latestCalorie?: {
    target_calories: number
    bmr: number
    tdee: number
    goal: string
    activity_level: string
  } | null
  todayBurned?: number
  userId?: string
}

export function CalorieWidget({ latestCalorie, todayBurned = 0, userId }: CalorieWidgetProps) {
  const [consumedCalories, setConsumedCalories] = useState(0)
  const [customVal, setCustomVal] = useState('')

  // Determine local storage key based on date and userId
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const storageKey = `fitlogic_consumed_calories_${userId || 'guest'}_${todayStr}`

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey)
      setConsumedCalories(saved ? parseInt(saved, 10) : 0)
    }
  }, [userId, storageKey])

  const handleAddCalories = (amount: number) => {
    const newVal = consumedCalories + amount
    setConsumedCalories(newVal)
    localStorage.setItem(storageKey, newVal.toString())
  }

  const handleResetCalories = () => {
    setConsumedCalories(0)
    localStorage.removeItem(storageKey)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(customVal, 10)
    if (!isNaN(amount) && amount > 0) {
      handleAddCalories(amount)
      setCustomVal('')
    }
  }

  const getGoalLabel = (goal: string) => {
    switch (goal) {
      case 'lose_fast': return 'Weight Loss (Fast)'
      case 'lose_slow': return 'Weight Loss (Slow)'
      case 'maintain': return 'Maintain Weight'
      case 'gain_slow': return 'Weight Gain (Slow)'
      case 'gain_fast': return 'Weight Gain (Fast)'
      default: return goal
    }
  }

  const target = latestCalorie?.target_calories || 2000
  const netCalories = consumedCalories - todayBurned
  const progressPercent = Math.min(100, Math.round((consumedCalories / target) * 100))

  return (
    <Card className="overflow-hidden flex flex-col justify-between h-full border border-border hover:shadow-xs transition-all bg-card text-card-foreground">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" /> Daily Calories
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Log meals & view your daily energy balance</CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 flex-1 space-y-4">
        {latestCalorie ? (
          <>
            {/* Calorie Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {consumedCalories} <span className="text-xs font-semibold text-muted-foreground">/ {target} kcal</span>
                </span>
                <span className="text-xs font-semibold text-primary">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Logging Buttons */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Log Food / Meal Intake</p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => handleAddCalories(200)}
                  variant="outline" 
                  size="sm"
                  className="h-8 text-xs font-semibold rounded-lg hover:bg-muted/80 cursor-pointer"
                >
                  +200 kcal
                </Button>
                <Button 
                  onClick={() => handleAddCalories(500)}
                  variant="outline" 
                  size="sm"
                  className="h-8 text-xs font-semibold rounded-lg hover:bg-muted/80 cursor-pointer"
                >
                  +500 kcal
                </Button>
                
                <form onSubmit={handleCustomSubmit} className="flex gap-1 flex-1 min-w-[120px]">
                  <Input 
                    type="number"
                    placeholder="Custom kcal"
                    value={customVal}
                    onChange={(e) => setCustomVal(e.target.value)}
                    className="h-8 text-xs rounded-lg bg-background border-border"
                  />
                  <Button 
                    type="submit"
                    variant="outline" 
                    size="sm"
                    className="h-8 px-2 rounded-lg cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </div>
            </div>

            {/* Calories Balance Grid */}
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Today's Energy Balance</p>
                {consumedCalories > 0 && (
                  <button 
                    onClick={handleResetCalories}
                    className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors font-medium cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset Food
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-secondary/40 p-2 rounded-lg border border-border/50">
                  <span className="text-[10px] text-muted-foreground block font-medium">Food Intake</span>
                  <span className="font-semibold text-foreground">+{consumedCalories} kcal</span>
                </div>
                <div className="bg-secondary/40 p-2 rounded-lg border border-border/50">
                  <span className="text-[10px] text-muted-foreground block font-medium">Workout Burn</span>
                  <span className="font-semibold text-destructive">-{todayBurned} kcal</span>
                </div>
                <div className="bg-secondary/40 p-2 rounded-lg border border-border/50 col-span-2 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium">Net Calories</span>
                    <span className="font-semibold text-foreground">{netCalories} kcal</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block font-medium">Remaining Budget</span>
                    <span className={`font-semibold ${target - consumedCalories >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {target - consumedCalories} kcal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-8 space-y-3">
            <div className="h-10 w-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground">
              <Flame className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground font-semibold">No Calorie target found</p>
            <p className="text-xs text-muted-foreground/80 max-w-[180px]">Calculate daily caloric needs based on activity multiplier.</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-border bg-muted/30 p-4">
        <Link href="/dashboard/calorie" className="w-full">
          <Button variant="ghost" className="w-full text-xs font-semibold text-primary hover:text-primary-focus hover:bg-muted justify-between cursor-pointer">
            {latestCalorie ? 'Recalculate Calories' : 'Calculate Calories Now'} <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
