"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PageContainer } from '@/components/layout/PageContainer'
import { Scale, Loader2, Trash2, Plus, Info, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'

interface BmiRecord {
  id: string
  height: number
  weight: number
  bmi: number
  category: string
  recorded_at: string
}

export default function BmiPage() {
  const supabase = createClient()
  
  // State variables
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [calculatedBmi, setCalculatedBmi] = useState<number | null>(null)
  const [bmiCategory, setBmiCategory] = useState('')
  
  const [records, setRecords] = useState<BmiRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Fetch BMI records on mount
  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    setLoadingRecords(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('bmi_records')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (err: any) {
      toast.error('Failed to load BMI history: ' + err.message)
    } finally {
      setLoadingRecords(false)
    }
  }

  // Calculate BMI category
  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight'
    if (bmi < 25) return 'Normal weight'
    if (bmi < 30) return 'Overweight'
    return 'Obese'
  }

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    const h = parseFloat(height)
    const w = parseFloat(weight)

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      toast.error('Please enter valid positive numbers')
      return
    }

    let bmi = 0
    if (unit === 'metric') {
      // Metric: Weight (kg) / (Height (m))^2
      const heightInMeters = h / 100
      bmi = w / (heightInMeters * heightInMeters)
    } else {
      // Imperial: 703 * Weight (lbs) / (Height (in))^2
      bmi = (703 * w) / (h * h)
    }

    setCalculatedBmi(bmi)
    setBmiCategory(getBmiCategory(bmi))
  }

  const handleSave = async () => {
    if (calculatedBmi === null) return
    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Normalize inputs to metric for database storage
      let dbHeight = parseFloat(height)
      let dbWeight = parseFloat(weight)

      if (unit === 'imperial') {
        dbHeight = dbHeight * 2.54 // inches to cm
        dbWeight = dbWeight * 0.453592 // lbs to kg
      }

      // Round values
      dbHeight = Math.round(dbHeight * 10) / 10
      dbWeight = Math.round(dbWeight * 10) / 10
      const roundedBmi = Math.round(calculatedBmi * 10) / 10

      const { error } = await supabase.from('bmi_records').insert({
        user_id: user.id,
        height: dbHeight,
        weight: dbWeight,
        bmi: roundedBmi,
        category: bmiCategory
      })

      if (error) throw error

      toast.success('BMI record saved successfully!')
      // Clear form
      setHeight('')
      setWeight('')
      setCalculatedBmi(null)
      setBmiCategory('')
      // Refresh list
      fetchRecords()
    } catch (err: any) {
      toast.error('Failed to save BMI: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('bmi_records')
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

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'underweight':
        return 'text-sky-400 font-bold bg-sky-500/10 border-sky-500/20 px-2.5 py-0.5 rounded-full border text-xs'
      case 'normal weight':
        return 'text-emerald-400 font-bold bg-emerald-500/10 border-emerald-500/20 px-2.5 py-0.5 rounded-full border text-xs'
      case 'overweight':
        return 'text-amber-400 font-bold bg-amber-500/10 border-amber-500/20 px-2.5 py-0.5 rounded-full border text-xs'
      case 'obese':
        return 'text-red-400 font-bold bg-red-500/10 border-red-500/20 px-2.5 py-0.5 rounded-full border text-xs'
      default:
        return 'text-neutral-400 font-bold bg-neutral-500/10 border-neutral-500/20 px-2.5 py-0.5 rounded-full border text-xs'
    }
  }

  return (
    <PageContainer
      title="BMI Calculator"
      description="Quickly compute your Body Mass Index and monitor your trends."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* BMI Input Form and Result */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-neutral-950 border-neutral-900 glass-panel">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Scale className="h-5 w-5 text-emerald-400" /> Calculate BMI
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Enter details below to find your BMI score
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCalculate}>
              <CardContent className="space-y-4">
                {/* Unit selector */}
                <div className="space-y-1.5">
                  <Label htmlFor="unit" className="text-neutral-300 font-medium">Measurement Unit</Label>
                  <Select 
                    value={unit} 
                    onValueChange={(val) => {
                      if (val === 'metric' || val === 'imperial') {
                        setUnit(val)
                        setHeight('')
                        setWeight('')
                        setCalculatedBmi(null)
                        setBmiCategory('')
                      }
                    }}
                  >
                    <SelectTrigger className="w-full bg-neutral-900 border-neutral-800 text-white rounded-xl h-10">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white rounded-xl">
                      <SelectItem value="metric">Metric (cm, kg)</SelectItem>
                      <SelectItem value="imperial">Imperial (in, lbs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Height Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="height" className="text-neutral-300 font-medium">
                    Height ({unit === 'metric' ? 'cm' : 'inches'})
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    step="any"
                    placeholder={unit === 'metric' ? 'e.g. 175' : 'e.g. 69'}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="bg-neutral-900/50 border-neutral-800 focus:border-orange-500 text-white h-10 rounded-xl"
                    required
                  />
                </div>

                {/* Weight Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="weight" className="text-neutral-300 font-medium">
                    Weight ({unit === 'metric' ? 'kg' : 'lbs'})
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="any"
                    placeholder={unit === 'metric' ? 'e.g. 70' : 'e.g. 154'}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="bg-neutral-900/50 border-neutral-800 focus:border-orange-500 text-white h-10 rounded-xl"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold h-10 rounded-xl cursor-pointer"
                >
                  Calculate BMI
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* BMI Results display */}
          <AnimatePresence>
            {calculatedBmi !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-neutral-950 border-neutral-900 bg-gradient-to-r from-emerald-500/5 to-neutral-950">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Your Result</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <div className="text-5xl font-extrabold text-white">
                        {calculatedBmi.toFixed(1)}
                      </div>
                      <div className={getCategoryColor(bmiCategory)}>
                        {bmiCategory}
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-900/40 rounded-xl border border-neutral-900 text-xs text-neutral-400 leading-relaxed font-medium flex gap-2">
                      <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        A healthy BMI for adults is between 18.5 and 24.9. BMI is a useful indicator, but does not measure body fat percentage directly.
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleSave}
                      disabled={submitting}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold h-10 rounded-xl cursor-pointer flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-4.5 w-4.5" /> Save Record to History
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BMI History List */}
        <div className="lg:col-span-2">
          <Card className="bg-neutral-950 border-neutral-900 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">BMI History</CardTitle>
                <CardDescription className="text-neutral-400">
                  Track your changes and updates over time
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchRecords}
                className="border-neutral-800 hover:bg-neutral-900 text-neutral-400 cursor-pointer h-8 w-8"
                disabled={loadingRecords}
              >
                <RefreshCw className={`h-4 w-4 ${loadingRecords ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent>
              {loadingRecords ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500 space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <span className="text-sm font-semibold">Loading history...</span>
                </div>
              ) : records.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="border-neutral-900">
                      <TableRow className="border-neutral-900 hover:bg-transparent">
                        <TableHead className="text-neutral-400 font-bold">Date</TableHead>
                        <TableHead className="text-neutral-400 font-bold">Height</TableHead>
                        <TableHead className="text-neutral-400 font-bold">Weight</TableHead>
                        <TableHead className="text-neutral-400 font-bold">BMI</TableHead>
                        <TableHead className="text-neutral-400 font-bold">Category</TableHead>
                        <TableHead className="text-neutral-400 font-bold text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((rec) => (
                        <TableRow key={rec.id} className="border-neutral-900 hover:bg-neutral-900/30 text-neutral-200">
                          <TableCell className="font-semibold text-sm">
                            {new Date(rec.recorded_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="font-medium">{rec.height} cm</TableCell>
                          <TableCell className="font-medium">{rec.weight} kg</TableCell>
                          <TableCell className="font-extrabold text-white">{rec.bmi.toFixed(1)}</TableCell>
                          <TableCell>
                            <span className={getCategoryColor(rec.category)}>
                              {rec.category}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(rec.id)}
                              className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer h-7 w-7"
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
                  <Scale className="h-12 w-12 text-neutral-600 animate-pulse" />
                  <p className="text-base font-bold text-neutral-400">No BMI entries yet</p>
                  <p className="text-xs text-neutral-500 max-w-sm">Use the form on the left to calculate and save your first Body Mass Index profile.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </PageContainer>
  )
}
