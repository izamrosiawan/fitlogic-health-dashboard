"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Info, HelpCircle, Flame, Activity, Target, PieChart, Star } from 'lucide-react'

export function NutritionGlossary() {
  const glossaryItems = [
    {
      title: 'BMR (Basal Metabolic Rate)',
      description: 'Jumlah energi (kalori) minimum yang dibutuhkan tubuh Anda untuk menjalankan fungsi organ vital saat beristirahat total tanpa aktivitas fisik.',
      icon: Flame,
      color: 'text-primary'
    },
    {
      title: 'TDEE (Total Daily Energy Expenditure)',
      description: 'Kebutuhan kalori harian total setelah memperhitungkan tingkat aktivitas fisik Anda. Ini adalah batas pemeliharaan berat badan (maintenance).',
      icon: Activity,
      color: 'text-blue-500'
    },
    {
      title: 'Target Kalori',
      description: 'Rekomendasi asupan kalori harian yang disarankan sesuai tujuan Anda (defisit kalori untuk menurunkan berat badan, atau surplus untuk menaikkan berat badan).',
      icon: Target,
      color: 'text-emerald-500'
    },
    {
      title: 'Makronutrisi',
      description: 'Zat gizi utama yang dibutuhkan tubuh dalam skala besar, terdiri dari Karbohidrat (sumber energi utama), Protein (pembangun otot), dan Lemak (regulasi hormon).',
      icon: PieChart,
      color: 'text-amber-500'
    },
    {
      title: 'Diet Match Score',
      description: 'Persentase tingkat kecocokan rencana kalori harian dengan parameter fisik Anda untuk mencapai target berat badan secara optimal dan sehat.',
      icon: Star,
      color: 'text-indigo-500'
    }
  ]

  return (
    <Card className="border border-border bg-card text-card-foreground">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" /> Info Gizi & Glosarium Istilah
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground font-medium">
          Pahami istilah kebugaran dan gizi yang digunakan dalam penyusunan program diet Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {glossaryItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <div 
                key={index} 
                className="p-4 bg-muted/40 border border-border/80 rounded-2xl space-y-2 hover:bg-muted/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-lg bg-background flex items-center justify-center border border-border shrink-0`}>
                    <IconComponent className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <h4 className="text-xs font-semibold text-foreground tracking-tight leading-tight">
                    {item.title}
                  </h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
