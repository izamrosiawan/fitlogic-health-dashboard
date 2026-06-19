"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PageContainer } from '@/components/layout/PageContainer'
import { Flame, Loader2, Trash2, Plus, Info, RefreshCw, Sparkles, Apple, Dumbbell, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'

interface CalorieRecord {
  id: string
  age: number
  gender: string
  height: number
  weight: number
  activity_level: string
  goal: string
  bmr: number
  tdee: number
  target_calories: number
  recorded_at: string
}

interface Recommendation {
  bmiStatus: string
  bmiColor: string
  warning: string | null
  nutrition: {
    title: string
    macros: string
    foods: string[]
    notes: string
  }
  workout: {
    title: string
    frequency: string
    type: string
    exercises: string[]
    notes: string
  }
}

const getAiRecommendations = (bmi: number, goal: string): Recommendation => {
  let bmiStatus = 'Normal'
  let bmiColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'

  if (bmi < 18.5) {
    bmiStatus = 'Underweight'
    bmiColor = 'bg-primary/10 text-primary border-primary/20'
  } else if (bmi >= 18.5 && bmi < 25) {
    bmiStatus = 'Normal'
    bmiColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  } else if (bmi >= 25 && bmi < 30) {
    bmiStatus = 'Overweight'
    bmiColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  } else {
    bmiStatus = 'Obese'
    bmiColor = 'bg-destructive/10 text-destructive border-destructive/20'
  }

  const isCutting = goal === 'lose_fast' || goal === 'lose_slow'
  const isBulking = goal === 'gain_fast' || goal === 'gain_slow'
  const isMaintain = goal === 'maintain'

  let warning: string | null = null

  // Safety Warnings
  if (bmiStatus === 'Underweight' && isCutting) {
    warning = '⚠️ Anda tergolong Underweight. Menurunkan berat badan (Cutting) tidak disarankan secara medis. Fokuslah pada peningkatan berat badan sehat (Bulking) atau pemeliharaan (Maintenance).'
  } else if (bmiStatus === 'Obese' && isBulking) {
    warning = '⚠️ Anda tergolong Obesitas. Menambah berat badan (Bulking) tidak disarankan saat ini. Fokuslah pada penurunan berat badan secara bertahap (Cutting) untuk menjaga kesehatan jantung dan metabolisme.'
  } else if (bmiStatus === 'Overweight' && isBulking) {
    warning = '⚠️ Anda tergolong Overweight. Melakukan surplus kalori (Bulking) berisiko meningkatkan penumpukan lemak. Disarankan melakukan Cutting atau Recomposisi Tubuh (Maintenance dengan latihan beban).'
  } else if (bmiStatus === 'Obese' && isMaintain) {
    warning = '⚠️ Anda tergolong Obesitas. Mempertahankan berat badan saat ini diperbolehkan, namun menargetkan penurunan berat badan secara perlahan (Cutting lambat) sangat disarankan demi kesehatan jangka panjang.'
  }

  // Base Recommendations Template
  let nutrition = {
    title: 'Nutrisi & Makanan',
    macros: 'Karbohidrat 50% | Protein 25% | Lemak 25%',
    foods: ['Dada ayam, ikan, telur', 'Nasi merah, oat, kentang', 'Alpukat, kacang-kacangan, minyak zaitun'],
    notes: 'Konsumsi air putih minimal 2-3 liter per hari dan hindari makanan olahan tinggi gula.'
  }

  let workout = {
    title: 'Latihan & Olahraga',
    frequency: '3-4 hari / minggu',
    type: 'Latihan Kekuatan & Kardio Ringan',
    exercises: ['Latihan beban (Push / Pull / Legs Split)', 'Kardio intensitas rendah (LISS) seperti jalan kaki', 'Peregangan / Mobilitas'],
    notes: 'Fokus pada konsistensi gerakan dan istirahat yang cukup (7-8 jam semalam).'
  }

  // Customization based on BMI + Goal
  if (bmiStatus === 'Underweight') {
    if (isBulking) {
      nutrition = {
        title: 'Nutrisi Bulking Sehat',
        macros: 'Karbohidrat 50% | Protein 25% | Lemak 25%',
        foods: [
          'Dada ayam fillet, daging sapi rendah lemak, telur utuh',
          'Nasi putih/merah, pisang, oat, kentang manis',
          'Alpukat, kacang almond, selai kacang, minyak zaitun (sumber kalori padat)'
        ],
        notes: 'Makan dalam porsi sedang tapi sering (4-5 kali sehari). Tambahkan smoothie kalori tinggi jika sulit makan banyak.'
      }
      workout = {
        title: 'Latihan Beban (Hypertrophy)',
        frequency: '3-4 hari / minggu',
        type: 'Fokus Angkat Beban & Batasi Kardio',
        exercises: [
          'Squat & Lunges (Kaki)',
          'Bench Press & Overhead Press (Dada & Bahu)',
          'Barbell Row & Pull-up (Punggung)',
          'Batasi kardio maksimal 1 kali seminggu selama 20 menit'
        ],
        notes: 'Fokus pada angkatan compound dengan beban berat secara bertahap (Progressive Overload).'
      }
    } else {
      nutrition = {
        title: 'Nutrisi Padat Gizi',
        macros: 'Karbohidrat 55% | Protein 20% | Lemak 25%',
        foods: [
          'Ikan salmon, telur, susu full-cream, tempe/tahu',
          'Ubi jalar, quinoa, sereal gandum utuh',
          'Kacang mede, keju, alpukat'
        ],
        notes: 'Prioritaskan makanan padat kalori dan kaya nutrisi untuk menjaga stabilitas hormon.'
      }
      workout = {
        title: 'Latihan Kekuatan & Fleksibilitas',
        frequency: '2-3 hari / minggu',
        type: 'Latihan Beban Ringan & Yoga/Peregangan',
        exercises: [
          'Latihan beban seluruh tubuh (Full Body Split)',
          'Yoga atau Pilates untuk kelenturan',
          'Jalan kaki santai 15-20 menit'
        ],
        notes: 'Hindari latihan kardio berlebih agar tubuh tidak mengalami defisit energi yang lebih dalam.'
      }
    }
  } else if (bmiStatus === 'Normal') {
    if (isCutting) {
      nutrition = {
        title: 'Nutrisi Cutting (Defisit)',
        macros: 'Karbohidrat 35% | Protein 40% | Lemak 25%',
        foods: [
          'Dada ayam tanpa kulit, putih telur, ikan kembung/tuna',
          'Sayuran hijau (brokoli, bayam) porsi besar, oat',
          'Minyak zaitun porsi kecil, chia seeds'
        ],
        notes: 'Pola makan tinggi protein membantu mempertahankan massa otot saat membakar lemak.'
      }
      workout = {
        title: 'Latihan Beban + Kardio Lemak',
        frequency: '4-5 hari / minggu',
        type: 'Angkat Beban Intens + Kardio HIIT/LISS',
        exercises: [
          'Latihan beban (Upper/Lower Split atau Push/Pull/Legs)',
          'Kardio LISS (jalan cepat/sepeda statis) 30-40 menit setelah latihan beban',
          'HIIT 15 menit di akhir sesi (1-2 kali seminggu)'
        ],
        notes: 'Pertahankan beban angkatan saat latihan kekuatan untuk memberi sinyal pada tubuh agar mempertahankan otot.'
      }
    } else if (isBulking) {
      nutrition = {
        title: 'Nutrisi Clean Bulking',
        macros: 'Karbohidrat 45% | Protein 30% | Lemak 25%',
        foods: [
          'Daging sapi, dada ayam, ikan nila, telur',
          'Nasi putih/merah, kentang, roti gandum, pasta',
          'Alpukat, kacang tanah, minyak kelapa'
        ],
        notes: 'Pertahankan surplus kalori sekitar 250-500 kkal dari TDEE agar penambahan lemak minimal.'
      }
      workout = {
        title: 'Latihan Beban (Hypertrophy)',
        frequency: '4-5 hari / minggu',
        type: 'Fokus Angkat Beban & Progressive Overload',
        exercises: [
          'Squat, Deadlift, Bench Press, Barbell Row',
          'Latihan isolasi (Bicep Curl, Lateral Raise, Tricep Pushdown)',
          'Kardio ringan 1-2 kali seminggu untuk kesehatan jantung'
        ],
        notes: 'Catat beban latihan Anda dan usahakan ada peningkatan repetisi atau beban di setiap sesi.'
      }
    } else {
      nutrition = {
        title: 'Nutrisi Seimbang (Maintenance)',
        macros: 'Karbohidrat 50% | Protein 25% | Lemak 25%',
        foods: [
          'Variasi protein (daging ayam, telur, tempe, tahu)',
          'Nasi merah, ubi kayu, sayur campur',
          'Kacang-kacangan, alpukat'
        ],
        notes: 'Fokus pada pemenuhan mikronutrien (vitamin dan mineral) dari buah-buahan segar.'
      }
      workout = {
        title: 'Latihan Kebugaran & Pengondisian',
        frequency: '3-4 hari / minggu',
        type: 'Latihan Beban Kombinasi Kardio',
        exercises: [
          'Latihan beban fungsional atau kalistenik',
          'Jogging atau berenang 30 menit',
          'Peregangan aktif'
        ],
        notes: 'Tujuan utama adalah menjaga komposisi tubuh, stamina, dan kebugaran jantung.'
      }
    }
  } else if (bmiStatus === 'Overweight') {
    if (isCutting) {
      nutrition = {
        title: 'Nutrisi Cutting Tinggi Protein',
        macros: 'Karbohidrat 30% | Protein 40% | Lemak 30%',
        foods: [
          'Ikan tuna, putih telur, ayam panggang, tempe kukus',
          'Brokoli, kembang kol, asparagus, oatmeal',
          'Sedikit almond, minyak zaitun untuk memasak'
        ],
        notes: 'Kurangi porsi karbohidrat sederhana dan perbanyak serat dari sayur untuk menahan rasa lapar lebih lama.'
      }
      workout = {
        title: 'Latihan Beban & Defisit Energi',
        frequency: '4-5 hari / minggu',
        type: 'Latihan Kekuatan & Kardio Konsisten',
        exercises: [
          'Latihan beban sirkuit atau Push/Pull/Legs',
          'Kardio LISS (jalan cepat menanjak, sepeda) 45 menit',
          'Aktivitas harian (targetkan 8.000-10.000 langkah per hari)'
        ],
        notes: 'Kardio intensitas rendah (LISS) sangat baik untuk membakar kalori tanpa membebani persendian.'
      }
    } else {
      nutrition = {
        title: 'Nutrisi Rekomposisi Tubuh',
        macros: 'Karbohidrat 35% | Protein 35% | Lemak 30%',
        foods: [
          'Dada ayam fillet, daging sapi tanpa lemak, ikan salmon, tahu',
          'Nasi merah porsi terkontrol, ubi jalar',
          'Alpukat, kacang-kacangan'
        ],
        notes: 'Targetkan kalori di tingkat maintenance atau defisit sedikit agar tubuh menggunakan cadangan lemak untuk membangun otot.'
      }
      workout = {
        title: 'Latihan Beban Fokus Kekuatan',
        frequency: '3-4 hari / minggu',
        type: 'Latihan Beban Compound & Kardio LISS',
        exercises: [
          'Squat, Deadlift, Bench Press, Lat Pulldown',
          'Jalan cepat 30 menit setiap hari',
          'Plank dan latihan core'
        ],
        notes: 'Fokus pada pembentukan otot agar metabolisme basal (BMR) Anda meningkat secara alami.'
      }
    }
  } else {
    // Obese
    nutrition = {
      title: 'Nutrisi Defisit Terstruktur',
      macros: 'Karbohidrat 30% | Protein 40% | Lemak 30%',
      foods: [
        'Putih telur, ayam rebus/panggang, ikan tuna, edamame',
        'Semua jenis sayuran hijau porsi besar, apel, pir',
        'Kurangi penggunaan minyak goreng berlebih, ganti ke rebusan/kukusan'
      ],
      notes: 'Hindari segala minuman manis (sirup, boba, soda) dan makanan cepat saji. Minum air putih sebelum makan.'
    }
    workout = {
      title: 'Latihan Kardio Ramah Sendi',
      frequency: '4-5 hari / minggu',
      type: 'Kardio Rendah Benturan & Latihan Beban Ringan',
      exercises: [
        'Berenang, sepeda statis, atau jalan kaki (sangat aman untuk lutut)',
        'Latihan beban dengan mesin (Chest Press Machine, Leg Press) untuk stabilitas',
        'Peregangan sendi dan latihan mobilitas'
      ],
      notes: 'Hindari gerakan melompat (seperti burpee atau tali) untuk melindungi sendi lutut Anda.'
    }
  }

  return { bmiStatus, bmiColor, warning, nutrition, workout }
}

const getDietMatchScore = (bmi: number, goal: string, weight: number, targetWeight: number, targetCalories: number): number => {
  let score = 95 // base score

  let bmiStatus = 'Normal'
  if (bmi < 18.5) bmiStatus = 'Underweight'
  else if (bmi >= 18.5 && bmi < 25) bmiStatus = 'Normal'
  else if (bmi >= 25 && bmi < 30) bmiStatus = 'Overweight'
  else bmiStatus = 'Obese'

  const isCutting = goal === 'lose_fast' || goal === 'lose_slow'
  const isBulking = goal === 'gain_fast' || goal === 'gain_slow'
  const isMaintain = goal === 'maintain'

  // Conflict 1: Underweight & Cutting
  if (bmiStatus === 'Underweight' && isCutting) {
    score -= 50
  }
  // Conflict 2: Obese & Bulking
  else if (bmiStatus === 'Obese' && isBulking) {
    score -= 55
  }
  // Conflict 3: Overweight & Bulking
  else if (bmiStatus === 'Overweight' && isBulking) {
    score -= 35
  }
  // Conflict 4: Obese & Maintain
  else if (bmiStatus === 'Obese' && isMaintain) {
    score -= 15
  }

  // Weight direction vs Goal conflict
  if (isCutting && targetWeight >= weight) {
    score -= 30
  }
  if (isBulking && targetWeight <= weight) {
    score -= 30
  }
  if (isMaintain && Math.abs(weight - targetWeight) > 2) {
    score -= 20
  }

  // Safety Floor Calories
  if (targetCalories < 1200) {
    score -= 15
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score))
}

const getMacroGrams = (targetCalories: number, bmi: number, goal: string) => {
  let bmiStatus = 'Normal'
  if (bmi < 18.5) bmiStatus = 'Underweight'
  else if (bmi >= 18.5 && bmi < 25) bmiStatus = 'Normal'
  else if (bmi >= 25 && bmi < 30) bmiStatus = 'Overweight'
  else bmiStatus = 'Obese'

  const isCutting = goal === 'lose_fast' || goal === 'lose_slow'
  const isBulking = goal === 'gain_fast' || goal === 'gain_slow'

  let carbsPct = 50
  let proteinPct = 25
  let fatPct = 25

  if (bmiStatus === 'Underweight') {
    if (isBulking) {
      carbsPct = 50; proteinPct = 25; fatPct = 25
    } else {
      carbsPct = 55; proteinPct = 20; fatPct = 25
    }
  } else if (bmiStatus === 'Normal') {
    if (isCutting) {
      carbsPct = 35; proteinPct = 40; fatPct = 25
    } else if (isBulking) {
      carbsPct = 45; proteinPct = 30; fatPct = 25
    } else {
      carbsPct = 50; proteinPct = 25; fatPct = 25
    }
  } else if (bmiStatus === 'Overweight') {
    if (isCutting) {
      carbsPct = 30; proteinPct = 40; fatPct = 30
    } else {
      carbsPct = 35; proteinPct = 35; fatPct = 30
    }
  } else {
    // Obese
    carbsPct = 30; proteinPct = 40; fatPct = 30
  }

  const proteinGrams = Math.round((targetCalories * (proteinPct / 100)) / 4)
  const carbsGrams = Math.round((targetCalories * (carbsPct / 100)) / 4)
  const fatGrams = Math.round((targetCalories * (fatPct / 100)) / 9)

  return { proteinGrams, carbsGrams, fatGrams, proteinPct, carbsPct, fatPct }
}

const getDietProgress = (weight: number, targetWeight: number, goal: string): string => {
  const isCutting = goal === 'lose_fast' || goal === 'lose_slow'
  const isBulking = goal === 'gain_fast' || goal === 'gain_slow'
  const isMaintain = goal === 'maintain'

  const weightDiff = Math.abs(weight - targetWeight)
  if (isMaintain || weightDiff === 0) {
    return '0 minggu (Berat badan saat ini sesuai target)'
  }

  const calorieDifference = goal === 'lose_fast' || goal === 'gain_fast' ? 500 : 250
  const weeklyChangeKcal = calorieDifference * 7
  const kgChangePerWeek = weeklyChangeKcal / 7700 // ~0.45 kg for 500 kcal, ~0.23 kg for 250 kcal
  const estimatedWeeks = Math.ceil(weightDiff / kgChangePerWeek)

  if (isCutting && targetWeight > weight) {
    return `${estimatedWeeks} minggu (Peringatan: Target berat badan lebih tinggi dari berat saat ini meskipun memilih target Cutting)`
  }
  if (isBulking && targetWeight < weight) {
    return `${estimatedWeeks} minggu (Peringatan: Target berat badan lebih rendah dari berat saat ini meskipun memilih target Bulking)`
  }

  return `${estimatedWeeks} minggu`
}

const getAutomaticConclusion = (goal: string, targetCalories: number): string => {
  let targetText = 'mempertahankan berat badan'
  let paceText = ''
  
  if (goal === 'lose_fast') {
    targetText = 'menurunkan berat badan'
    paceText = ' secara cepat (defisit kalori terarah)'
  } else if (goal === 'lose_slow') {
    targetText = 'menurunkan berat badan'
    paceText = ' secara perlahan (defisit kalori moderat & aman)'
  } else if (goal === 'gain_slow') {
    targetText = 'menaikkan berat badan'
    paceText = ' secara bertahap (clean bulking/surplus terkontrol)'
  } else if (goal === 'gain_fast') {
    targetText = 'menaikkan berat badan'
    paceText = ' secara cepat (surplus kalori)'
  }

  return `Target Anda adalah ${targetText}${paceText}. Rekomendasi energi harian Anda adalah sebesar ${targetCalories} kkal. Catat perkembangan berat badan secara rutin di modul BMI, dan lakukan workout minimal 3-4 kali seminggu untuk menjaga kesehatan metabolisme.`
}

export default function CaloriePage() {
  const supabase = createClient()

  // Form states
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [activityLevel, setActivityLevel] = useState<string>('moderate')
  const [goal, setGoal] = useState<string>('maintain')

  // Calculation results
  const [bmr, setBmr] = useState<number | null>(null)
  const [tdee, setTdee] = useState<number | null>(null)
  const [targetCalories, setTargetCalories] = useState<number | null>(null)
  const [bmi, setBmi] = useState<number | null>(null)
  const [calculatedTargetWeight, setCalculatedTargetWeight] = useState<number | null>(null)

  // List states
  const [records, setRecords] = useState<CalorieRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    setLoadingRecords(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('calorie_records')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (err: any) {
      toast.error('Failed to load calorie history: ' + err.message)
    } finally {
      setLoadingRecords(false)
    }
  }

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    const a = parseInt(age)
    const h = parseFloat(height)
    const w = parseFloat(weight)
    const tw = parseFloat(targetWeight)

    if (isNaN(a) || isNaN(h) || isNaN(w) || isNaN(tw) || a <= 0 || h <= 0 || w <= 0 || tw <= 0) {
      toast.error('Please enter valid positive numbers for all fields')
      return
    }

    // 1. Calculate BMR using Mifflin-St Jeor Equation
    let computedBmr = 0
    if (gender === 'male') {
      computedBmr = 10 * w + 6.25 * h - 5 * a + 5
    } else {
      computedBmr = 10 * w + 6.25 * h - 5 * a - 161
    }

    // 2. Calculate TDEE based on activity multiplier
    let multiplier = 1.2
    switch (activityLevel) {
      case 'sedentary':
        multiplier = 1.2
        break
      case 'light':
        multiplier = 1.375
        break
      case 'moderate':
        multiplier = 1.55
        break
      case 'active':
        multiplier = 1.725
        break
      case 'extra_active':
        multiplier = 1.9
        break
    }
    const computedTdee = computedBmr * multiplier

    // 3. Adjust Target Calories based on Goal
    let computedTarget = computedTdee
    switch (goal) {
      case 'lose_fast':
        computedTarget = computedTdee - 500
        break
      case 'lose_slow':
        computedTarget = computedTdee - 250
        break
      case 'maintain':
        computedTarget = computedTdee
        break
      case 'gain_slow':
        computedTarget = computedTdee + 250
        break
      case 'gain_fast':
        computedTarget = computedTdee + 500
        break
    }

    // Enforce safety floor
    if (computedTarget < 1200) {
      toast.warning('Recommended daily calories are below 1200 kcal. Daily intake below 1200 kcal is not advised without medical supervision.')
    }

    const computedBmi = w / ((h / 100) ** 2)
    setBmi(parseFloat(computedBmi.toFixed(1)))
    setCalculatedTargetWeight(tw)
    setBmr(Math.round(computedBmr))
    setTdee(Math.round(computedTdee))
    setTargetCalories(Math.round(computedTarget))
  }

  const handleSave = async () => {
    if (bmr === null || tdee === null || targetCalories === null) return
    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('calorie_records').insert({
        user_id: user.id,
        age: parseInt(age),
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        activity_level: activityLevel,
        goal,
        bmr,
        tdee,
        target_calories: targetCalories
      })

      if (error) throw error

      // Also update profiles table with target_weight and target_calories
      if (calculatedTargetWeight !== null) {
        await supabase.from('profiles').update({
          target_weight: calculatedTargetWeight,
          target_calories: targetCalories,
          height: parseFloat(height),
          weight: parseFloat(weight)
        }).eq('id', user.id)
      }

      toast.success('Calorie profile saved successfully!')
      // Clear form
      setAge('')
      setHeight('')
      setWeight('')
      setTargetWeight('')
      setBmr(null)
      setTdee(null)
      setTargetCalories(null)
      setBmi(null)
      setCalculatedTargetWeight(null)
      
      // Refresh list
      fetchRecords()
    } catch (err: any) {
      toast.error('Failed to save calorie configuration: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('calorie_records')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Record deleted')
      setRecords(records.filter(r => r.id !== id))
    } catch (err: any) {
      toast.error('Failed to delete: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const getActivityLabel = (level: string) => {
    switch (level) {
      case 'sedentary': return 'Sedentary'
      case 'light': return 'Lightly Active'
      case 'moderate': return 'Moderately Active'
      case 'active': return 'Very Active'
      case 'extra_active': return 'Extra Active'
      default: return level
    }
  }

  const getGoalLabel = (g: string) => {
    switch (g) {
      case 'lose_fast': return 'Lose Weight (Fast)'
      case 'lose_slow': return 'Lose Weight (Slow)'
      case 'maintain': return 'Maintain'
      case 'gain_slow': return 'Gain Weight (Slow)'
      case 'gain_fast': return 'Gain Weight (Fast)'
      default: return g
    }
  }

  return (
    <PageContainer
      title="Calorie Calculator"
      description="Estimate daily energy needs and budget calorie targets with the Mifflin-St Jeor model."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Calorie Calculator Inputs */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card border-border text-card-foreground">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2 text-lg font-semibold tracking-tight">
                <Flame className="h-5 w-5 text-primary" /> Energy Budget
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Determine your metabolic rate
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCalculate}>
              <CardContent className="space-y-4">
                
                {/* Age Input */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="age" className="text-foreground font-medium">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="e.g. 21"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground h-10 rounded-xl"
                      required
                    />
                  </div>
                  
                  {/* Gender Selector */}
                  <div className="space-y-1.5">
                    <Label htmlFor="gender" className="text-foreground font-medium">Gender</Label>
                    <Select value={gender} onValueChange={(val) => { if (val === 'male' || val === 'female') setGender(val) }}>
                      <SelectTrigger className="w-full bg-background border-border text-foreground rounded-xl h-10">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Height / Weight / Target Weight */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="height" className="text-foreground font-medium text-xs">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="any"
                      placeholder="e.g. 175"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground h-10 rounded-xl px-2.5 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="weight" className="text-foreground font-medium text-xs">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="any"
                      placeholder="e.g. 80"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground h-10 rounded-xl px-2.5 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="targetWeight" className="text-foreground font-medium text-xs">Target (kg)</Label>
                    <Input
                      id="targetWeight"
                      type="number"
                      step="any"
                      placeholder="e.g. 75"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value)}
                      className="bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground h-10 rounded-xl px-2.5 text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Activity Level */}
                <div className="space-y-1.5">
                  <Label htmlFor="activity" className="text-foreground font-medium">Activity Multiplier</Label>
                  <Select value={activityLevel} onValueChange={(val) => { if (val) setActivityLevel(val) }}>
                    <SelectTrigger className="w-full bg-background border-border text-foreground rounded-xl h-10">
                      <SelectValue placeholder="Select activity" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl">
                      <SelectItem value="sedentary">Sedentary (Little to no exercise)</SelectItem>
                      <SelectItem value="light">Lightly Active (1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderately Active (3-5 days/week)</SelectItem>
                      <SelectItem value="active">Very Active (6-7 days/week)</SelectItem>
                      <SelectItem value="extra_active">Extra Active (Hard physical work)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fitness Goal */}
                <div className="space-y-1.5">
                  <Label htmlFor="goal" className="text-foreground font-medium">Target Fitness Goal</Label>
                  <Select value={goal} onValueChange={(val) => { if (val) setGoal(val) }}>
                    <SelectTrigger className="w-full bg-background border-border text-foreground rounded-xl h-10">
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl">
                      <SelectItem value="lose_fast">Lose Weight Fast (-500 kcal)</SelectItem>
                      <SelectItem value="lose_slow">Lose Weight Slow (-250 kcal)</SelectItem>
                      <SelectItem value="maintain">Maintain Current Weight</SelectItem>
                      <SelectItem value="gain_slow">Gain Weight Slow (+250 kcal)</SelectItem>
                      <SelectItem value="gain_fast">Gain Weight Fast (+500 kcal)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-2 text-[10px] text-muted-foreground space-y-1 leading-relaxed bg-muted/40 p-2.5 rounded-xl border border-border">
                    <p className="font-semibold text-foreground mb-0.5">💡 Panduan Pilihan Target:</p>
                    <p>• <strong>Lose Weight (Fast)</strong>: Defisit ~500 kkal/hari (penurunan berat badan lebih cepat).</p>
                    <p>• <strong>Lose Weight (Slow)</strong>: Defisit ~250 kkal/hari (penurunan bertahap, aman & stabil).</p>
                    <p>• <strong>Maintain</strong>: Menjaga berat badan agar tetap stabil (kalori harian sesuai TDEE).</p>
                    <p>• <strong>Gain Weight (Slow)</strong>: Surplus ~250 kkal/hari (penambahan otot dengan minimal penumpukan lemak).</p>
                    <p>• <strong>Gain Weight (Fast)</strong>: Surplus ~500 kkal/hari (penambahan berat badan lebih cepat).</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-focus text-white font-semibold h-10 rounded-xl cursor-pointer transition-colors shadow-xs"
                >
                  Calculate Budget
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Calorie Output Results */}
          <AnimatePresence>
            {targetCalories !== null && bmr !== null && tdee !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="bg-card border border-border text-card-foreground">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Calculated Budget</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col border-b border-border pb-3">
                      <span className="text-4xl font-semibold tracking-tight text-foreground">
                        {targetCalories} <span className="text-xs font-medium text-muted-foreground">kcal/hari</span>
                      </span>
                      <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">Target Anggaran Energi ({getGoalLabel(goal).split(' ')[0]})</span>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                        Jumlah asupan kalori harian yang disarankan untuk membantu Anda mencapai target program kebugaran (cutting/bulking/maintain).
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-b border-border pb-3">
                      <div className="flex flex-col">
                        <span className="text-xl font-semibold tracking-tight text-foreground">
                          {bmr} <span className="text-xs font-medium text-muted-foreground">kcal</span>
                        </span>
                        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">BASAL METABOLIC RATE (BMR)</span>
                        <p className="text-[9px] text-muted-foreground mt-1 leading-normal">
                          Kalori dasar minimum yang dibutuhkan tubuh Anda untuk bertahan hidup saat kondisi istirahat total (misal tidur).
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl font-semibold tracking-tight text-foreground">
                          {tdee} <span className="text-xs font-medium text-muted-foreground">kcal</span>
                        </span>
                        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">DAILY ACTIVE NEEDS (TDEE)</span>
                        <p className="text-[9px] text-muted-foreground mt-1 leading-normal">
                          Estimasi total kalori yang Anda bakar per hari setelah memperhitungkan seluruh tingkat aktivitas fisik Anda.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs text-muted-foreground leading-relaxed font-medium flex gap-2">
                      <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                      <span>
                        Targets are based on the Mifflin-St Jeor formula. Maintain this target to safely align with your weights strategy.
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleSave}
                      disabled={submitting}
                      className="w-full bg-primary hover:bg-primary-focus text-white font-semibold h-10 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors shadow-xs"
                    >
                      {submitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-4.5 w-4.5" /> Save Target to Profile
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                {/* AI Coach Recommendations */}
                {bmi !== null && (
                  <Card className="bg-card border border-border overflow-hidden relative text-card-foreground">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <CardHeader className="pb-3 border-b border-border">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <CardTitle className="text-foreground flex items-center gap-2 text-base font-semibold tracking-tight">
                          <Sparkles className="h-5 w-5 text-primary" /> Rekomendasi Pelatih AI
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-medium">BMI: <strong className="text-foreground">{bmi}</strong></span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getAiRecommendations(bmi, goal).bmiColor}`}>
                            {getAiRecommendations(bmi, goal).bmiStatus}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-4 space-y-4">
                      {/* Automatic Conclusion / Kesimpulan Otomatis */}
                      <div className="p-3.5 bg-primary/5 border border-primary/10 rounded-xl text-xs text-foreground/90 leading-relaxed font-medium italic">
                        <span className="text-[9px] text-primary font-semibold block not-italic uppercase tracking-wider mb-1">💡 Ringkasan Rekomendasi:</span>
                        "{getAutomaticConclusion(goal, targetCalories)}"
                      </div>
 
                      {/* Diet Match Score & Progress Timeline */}
                      {calculatedTargetWeight !== null && (
                        <div className="space-y-3 border-b border-border pb-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-muted/40 rounded-xl border border-border flex flex-col justify-between text-center">
                              <div className="flex items-baseline justify-center gap-1">
                                <span className="text-2xl font-semibold tracking-tight text-foreground">
                                  {getDietMatchScore(bmi, goal, parseFloat(weight), calculatedTargetWeight, targetCalories)}%
                                </span>
                                <span className="text-[8px] font-bold text-primary uppercase">
                                  ({getDietMatchScore(bmi, goal, parseFloat(weight), calculatedTargetWeight, targetCalories) >= 80 ? 'Sesuai' : (getDietMatchScore(bmi, goal, parseFloat(weight), calculatedTargetWeight, targetCalories) >= 60 ? 'Cukup' : 'Beresiko')})
                                </span>
                              </div>
                              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">DIET MATCH SCORE</span>
                            </div>
                            
                            <div className="p-3 bg-muted/40 rounded-xl border border-border flex flex-col justify-between text-center">
                              <span className="text-lg font-semibold tracking-tight text-foreground">
                                {getDietProgress(parseFloat(weight), calculatedTargetWeight, goal).split(' ')[0]} <span className="text-[10px] font-medium text-muted-foreground">minggu</span>
                              </span>
                              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">ESTIMASI WAKTU</span>
                            </div>
                          </div>
                          
                          <div className="text-[9px] text-muted-foreground leading-normal space-y-1 bg-muted/20 p-2.5 rounded-xl border border-border">
                            <p>• <strong>Diet Match Score</strong>: Kecocokan target kalori dengan BMI (Indeks Massa Tubuh) Anda saat ini.</p>
                            <p>• <strong>Estimasi Waktu</strong>: Durasi mencapai target berat secara aman (~0.23 kg/minggu untuk santai, ~0.45 kg/minggu untuk cepat).</p>
                          </div>
                        </div>
                      )}
 
                      {/* Safety Warning if any */}
                      {getAiRecommendations(bmi, goal).warning && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium flex gap-2.5">
                          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>{getAiRecommendations(bmi, goal).warning}</span>
                        </div>
                      )}
 
                      <div className="grid grid-cols-1 gap-4">
                        {/* Nutrition Section */}
                        <div className="p-3 bg-muted/30 rounded-xl border border-border hover:border-primary/15 transition-colors">
                          <h4 className="text-xs font-semibold text-primary flex items-center gap-1.5 uppercase tracking-wider mb-2">
                            <Apple className="h-4 w-4" /> {getAiRecommendations(bmi, goal).nutrition.title}
                          </h4>
                          
                          {/* Calculated Macro Grams */}
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-background p-2 rounded-lg border border-border text-center">
                              <p className="text-[9px] text-muted-foreground uppercase font-semibold">Protein</p>
                              <p className="text-xs font-semibold text-foreground mt-0.5">
                                {getMacroGrams(targetCalories, bmi, goal).proteinGrams}g
                                <span className="text-[8px] text-primary font-semibold block">({getMacroGrams(targetCalories, bmi, goal).proteinPct}%)</span>
                              </p>
                            </div>
                            <div className="bg-background p-2 rounded-lg border border-border text-center">
                              <p className="text-[9px] text-muted-foreground uppercase font-semibold">Karbohidrat</p>
                              <p className="text-xs font-semibold text-foreground mt-0.5">
                                {getMacroGrams(targetCalories, bmi, goal).carbsGrams}g
                                <span className="text-[8px] text-primary font-semibold block">({getMacroGrams(targetCalories, bmi, goal).carbsPct}%)</span>
                              </p>
                            </div>
                            <div className="bg-background p-2 rounded-lg border border-border text-center">
                              <p className="text-[9px] text-muted-foreground uppercase font-semibold">Lemak</p>
                              <p className="text-xs font-semibold text-foreground mt-0.5">
                                {getMacroGrams(targetCalories, bmi, goal).fatGrams}g
                                <span className="text-[8px] text-primary font-semibold block">({getMacroGrams(targetCalories, bmi, goal).fatPct}%)</span>
                              </p>
                            </div>
                          </div>
 
                          <ul className="space-y-1.5 mb-3 border-t border-border pt-2.5">
                            {getAiRecommendations(bmi, goal).nutrition.foods.map((food, idx) => (
                              <li key={idx} className="text-xs text-foreground/90 flex items-start gap-1.5">
                                <span className="text-primary mt-1">•</span>
                                <span>{food}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="text-[10px] text-muted-foreground italic border-t border-border pt-2 mt-2">
                            Tips: {getAiRecommendations(bmi, goal).nutrition.notes}
                          </p>
                        </div>
 
                        {/* Workout Section */}
                        <div className="p-3 bg-muted/30 rounded-xl border border-border hover:border-primary/15 transition-colors">
                          <h4 className="text-xs font-semibold text-primary flex items-center gap-1.5 uppercase tracking-wider mb-2">
                            <Dumbbell className="h-4 w-4" /> {getAiRecommendations(bmi, goal).workout.title}
                          </h4>
                          <div className="space-y-0.5 mb-3">
                            <p className="text-[11px] text-muted-foreground">Frekuensi: <strong className="text-foreground">{getAiRecommendations(bmi, goal).workout.frequency}</strong></p>
                            <p className="text-[11px] text-muted-foreground">Tipe: <strong className="text-foreground">{getAiRecommendations(bmi, goal).workout.type}</strong></p>
                          </div>
                          <ul className="space-y-1.5 mb-3 border-t border-border pt-2.5">
                            {getAiRecommendations(bmi, goal).workout.exercises.map((ex, idx) => (
                              <li key={idx} className="text-xs text-foreground/90 flex items-start gap-1.5">
                                <span className="text-primary mt-1">•</span>
                                <span>{ex}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="text-[10px] text-muted-foreground italic border-t border-border pt-2 mt-2">
                            Tips: {getAiRecommendations(bmi, goal).workout.notes}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Calorie History List */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border h-full text-card-foreground shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground text-lg font-semibold tracking-tight">Calorie History</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Track calculations and changes in daily energy budgets
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchRecords}
                className="border-border hover:bg-muted text-muted-foreground cursor-pointer h-8 w-8"
                disabled={loadingRecords}
              >
                <RefreshCw className={`h-4 w-4 ${loadingRecords ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent>
              {loadingRecords ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm font-semibold">Loading history...</span>
                </div>
              ) : records.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="border-border">
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground font-semibold">Date</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Parameters</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Multiplier</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Goal</TableHead>
                        <TableHead className="text-muted-foreground font-semibold">Target</TableHead>
                        <TableHead className="text-muted-foreground font-semibold text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((rec) => (
                        <TableRow key={rec.id} className="border-border hover:bg-muted/40 text-foreground">
                          <TableCell className="font-semibold text-sm">
                            {new Date(rec.recorded_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="font-medium text-xs space-y-0.5">
                            <p>Age: {rec.age} | Gen: {rec.gender}</p>
                            <p className="text-muted-foreground">{rec.weight} kg | {rec.height} cm</p>
                          </TableCell>
                          <TableCell className="font-medium text-xs">
                            {getActivityLabel(rec.activity_level)}
                          </TableCell>
                          <TableCell className="font-semibold text-xs">
                            {getGoalLabel(rec.goal)}
                          </TableCell>
                          <TableCell className="font-semibold text-primary text-sm">
                            {rec.target_calories} kcal
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(rec.id)}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer h-7 w-7"
                              disabled={deletingId === rec.id}
                            >
                              {deletingId === rec.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 space-y-3">
                  <Flame className="h-12 w-12 text-muted-foreground" />
                  <p className="text-base font-semibold text-muted-foreground">No calorie logs yet</p>
                  <p className="text-xs text-muted-foreground max-w-sm">Use the tool on the left to estimate BMR/TDEE and customize your target profiles.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
