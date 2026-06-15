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
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20'
      case 'normal weight':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      case 'overweight':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'obese':
        return 'text-red-400 bg-red-500/10 border-red-500/20'
      default:
        return 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20'
    }
  }

  return (
    <Card className="bg-neutral-950 border-neutral-900 overflow-hidden flex flex-col justify-between h-full hover:border-neutral-800 transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Scale className="h-5 w-5 text-emerald-400" /> BMI Profile
          </CardTitle>
          <CardDescription className="text-xs text-neutral-400">Your latest body mass statistics</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        {latestBmi ? (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="text-4xl font-extrabold text-white">
                {latestBmi.bmi.toFixed(1)}
              </div>
              <div className={`text-xs px-2.5 py-1 rounded-full border font-bold ${getCategoryColor(latestBmi.category)}`}>
                {latestBmi.category}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2 text-sm border-t border-neutral-900">
              <div>
                <p className="text-xs text-neutral-400 font-semibold uppercase">Weight</p>
                <p className="font-bold text-white mt-0.5">{latestBmi.weight} kg</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-semibold uppercase">Height</p>
                <p className="font-bold text-white mt-0.5">{latestBmi.height} cm</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-6 space-y-3">
            <div className="h-10 w-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
              <Scale className="h-5 w-5" />
            </div>
            <p className="text-sm text-neutral-400 font-semibold">No BMI record found</p>
            <p className="text-xs text-neutral-500 max-w-[180px]">Calculate your BMI to start tracking your weight goals.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-neutral-900 bg-neutral-950/40 p-4">
        <Link href="/dashboard/bmi" className="w-full">
          <Button variant="ghost" className="w-full text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-900/60 justify-between cursor-pointer">
            {latestBmi ? 'Update BMI' : 'Calculate BMI Now'} <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
