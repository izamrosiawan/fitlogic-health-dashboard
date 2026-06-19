"use client"

import React from 'react'
import Link from 'next/link'
import { Dumbbell, ArrowRight, Clock, Flame } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface WorkoutWidgetProps {
  workoutCount: number
  totalDuration: number
  totalCalories: number
}

export function WorkoutWidget({ workoutCount, totalDuration, totalCalories }: WorkoutWidgetProps) {
  return (
    <Card className="overflow-hidden flex flex-col justify-between h-full border border-border hover:shadow-xs transition-all bg-card text-card-foreground">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" /> Workouts (This Week)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Weekly exercise logs summary</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        {workoutCount > 0 ? (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="text-4xl font-semibold tracking-tight text-foreground">
                {workoutCount} <span className="text-sm font-semibold text-muted-foreground">{workoutCount === 1 ? 'session' : 'sessions'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-sm border-t border-border">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-primary">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Total Time</p>
                  <p className="font-semibold text-foreground text-sm mt-0.5">{totalDuration} min</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-primary">
                  <Flame className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Burned</p>
                  <p className="font-semibold text-foreground text-sm mt-0.5">{totalCalories} kcal</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-6 space-y-3">
            <div className="h-10 w-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground">
              <Dumbbell className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground font-semibold">No workouts logged this week</p>
            <p className="text-xs text-muted-foreground/80 max-w-[180px]">Add your exercise records to start monitoring your output.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-border bg-muted/30 p-4">
        <Link href="/dashboard/workouts" className="w-full">
          <Button variant="ghost" className="w-full text-xs font-semibold text-primary hover:text-primary-focus hover:bg-muted justify-between cursor-pointer">
            Log Workout <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
