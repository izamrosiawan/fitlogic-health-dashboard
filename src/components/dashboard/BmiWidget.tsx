"use client"

import React from 'react'
import Link from 'next/link'
import { Scale, ArrowRight, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface BmiWidgetProps {
  latestBmi?: {
    bmi: number
    category: string
    weight: number
    height: number
    recorded_at: string
  } | null
}

export function BmiWidget({ latestBmi }: BmiWidgetProps) {
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'underweight':
        return 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20'
      case 'normal weight':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      case 'overweight':
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'obese':
        return 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20'
      default:
        return 'text-muted-foreground bg-muted border-border'
    }
  }

  return (
    <Card className="overflow-hidden flex flex-col justify-between h-full border border-border hover:shadow-xs transition-all bg-card text-card-foreground">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" /> BMI Profile
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Your latest body mass statistics</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        {latestBmi ? (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="text-4xl font-semibold tracking-tight text-foreground">
                {latestBmi.bmi.toFixed(1)}
              </div>
              <div className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getCategoryColor(latestBmi.category)}`}>
                {latestBmi.category}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2 text-sm border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Weight</p>
                <p className="font-semibold text-foreground mt-0.5">{latestBmi.weight} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Height</p>
                <p className="font-semibold text-foreground mt-0.5">{latestBmi.height} cm</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-6 space-y-3">
            <div className="h-10 w-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground">
              <Scale className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted-foreground font-semibold">No BMI record found</p>
            <p className="text-xs text-muted-foreground/80 max-w-[180px]">Calculate your BMI to start tracking your weight goals.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-border bg-muted/30 p-4">
        <Link href="/dashboard/bmi" className="w-full">
          <Button variant="ghost" className="w-full text-xs font-semibold text-primary hover:text-primary-focus hover:bg-muted justify-between cursor-pointer">
            {latestBmi ? 'Update BMI' : 'Calculate BMI Now'} <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
