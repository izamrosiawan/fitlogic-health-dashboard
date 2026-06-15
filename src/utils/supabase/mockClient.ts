// Mock Supabase Client for local testing when Supabase credentials are not configured.
// Stores all data locally in localStorage and sets authentication cookies.

class MockQueryBuilder {
  table: string
  action: 'select' | 'insert' | 'delete' | 'upsert' = 'select'
  filters: { field: string; value: any; type: 'eq' | 'gte' }[] = []
  orderBy: { field: string; ascending: boolean }[] = []
  limitVal: number | null = null
  isSingle: boolean = false
  payload: any = null

  constructor(table: string) {
    this.table = table
  }

  select(fields?: string) {
    // Keep action as is if it's already insert/delete/upsert (for chaining after insert)
    if (this.action === 'select') {
      this.action = 'select'
    }
    return this
  }

  insert(values: any) {
    this.action = 'insert'
    this.payload = values
    return this
  }

  delete() {
    this.action = 'delete'
    return this
  }

  upsert(values: any) {
    this.action = 'upsert'
    this.payload = values
    return this
  }

  eq(field: string, val: any) {
    this.filters.push({ field, value: val, type: 'eq' })
    return this
  }

  gte(field: string, val: any) {
    this.filters.push({ field, value: val, type: 'gte' })
    return this
  }

  order(field: string, options?: any) {
    this.orderBy.push({ field, ascending: options?.ascending !== false })
    return this
  }

  limit(n: number) {
    this.limitVal = n
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  // Thenable implementation to support direct await on the query chain
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    if (typeof window === 'undefined') {
      const emptyResult = { data: this.isSingle ? null : [], error: null }
      return Promise.resolve(onfulfilled ? onfulfilled(emptyResult) : emptyResult)
    }

    let list: any[] = []
    
    // Load data from localStorage
    if (this.table === 'profiles') {
      const p = localStorage.getItem('fitlogic_profile')
      const profile = p ? JSON.parse(p) : null
      list = profile ? [profile] : []
    } else if (this.table === 'bmi_records') {
      list = JSON.parse(localStorage.getItem('fitlogic_bmi') || '[]')
    } else if (this.table === 'calorie_records') {
      list = JSON.parse(localStorage.getItem('fitlogic_calories') || '[]')
    } else if (this.table === 'workouts') {
      list = JSON.parse(localStorage.getItem('fitlogic_workouts') || '[]')
    }

    let resultData: any = null
    let error: any = null

    if (this.action === 'insert') {
      let dataToInsert = Array.isArray(this.payload) ? this.payload : [this.payload]
      dataToInsert = dataToInsert.map((x: any) => ({
        id: Math.random().toString(36).substring(7),
        created_at: new Date().toISOString(),
        recorded_at: new Date().toISOString(),
        ...x
      }))
      list = [...dataToInsert, ...list]

      if (this.table === 'bmi_records') {
        localStorage.setItem('fitlogic_bmi', JSON.stringify(list))
      } else if (this.table === 'calorie_records') {
        localStorage.setItem('fitlogic_calories', JSON.stringify(list))
      } else if (this.table === 'workouts') {
        localStorage.setItem('fitlogic_workouts', JSON.stringify(list))
      }

      resultData = dataToInsert
    } else if (this.action === 'upsert') {
      if (this.table === 'profiles') {
        localStorage.setItem('fitlogic_profile', JSON.stringify(this.payload))
        resultData = this.payload
      }
    } else if (this.action === 'delete') {
      const itemsToDelete = list.filter((item: any) => {
        return this.filters.length > 0 && this.filters.every(filter => {
          if (filter.type === 'eq') {
            return item[filter.field] === filter.value
          }
          return false
        })
      })

      const filteredList = list.filter((item: any) => {
        const matchesAllFilters = this.filters.length > 0 && this.filters.every(filter => {
          if (filter.type === 'eq') {
            return item[filter.field] === filter.value
          }
          return false
        })
        return !matchesAllFilters
      })

      if (this.table === 'bmi_records') {
        localStorage.setItem('fitlogic_bmi', JSON.stringify(filteredList))
      } else if (this.table === 'calorie_records') {
        localStorage.setItem('fitlogic_calories', JSON.stringify(filteredList))
      } else if (this.table === 'workouts') {
        localStorage.setItem('fitlogic_workouts', JSON.stringify(filteredList))
      }

      resultData = itemsToDelete
    } else {
      // select action
      let filtered = [...list]
      
      // Apply filters
      for (const filter of this.filters) {
        filtered = filtered.filter((item: any) => {
          if (filter.type === 'eq') {
            return item[filter.field] === filter.value
          } else if (filter.type === 'gte') {
            return item[filter.field] >= filter.value
          }
          return true
        })
      }

      // Apply sorting (compound comparator)
      if (this.orderBy.length > 0) {
        filtered.sort((a, b) => {
          for (const order of this.orderBy) {
            const valA = a[order.field]
            const valB = b[order.field]
            if (valA === undefined || valB === undefined) continue
            if (valA < valB) return order.ascending ? -1 : 1
            if (valA > valB) return order.ascending ? 1 : -1
          }
          return 0
        })
      }

      // Apply limit
      if (this.limitVal !== null) {
        filtered = filtered.slice(0, this.limitVal)
      }

      if (this.isSingle) {
        if (filtered.length > 0) {
          resultData = filtered[0]
        } else {
          resultData = null
          error = { code: 'PGRST116', message: 'The query returned 0 rows' }
        }
      } else {
        resultData = filtered
      }
    }

    const val = { data: resultData, error }
    return Promise.resolve(onfulfilled ? onfulfilled(val) : val)
  }
}

function seedAllMockData(email: string, fullName: string) {
  if (typeof window === 'undefined') return

  localStorage.setItem('fitlogic_profile', JSON.stringify({
    id: 'demo-user-id',
    email,
    full_name: fullName,
    height: 175,
    weight: 78.5,
    target_weight: 72.0,
    target_calories: 2200
  }))
  
  const today = new Date()
  const formatD = (offset: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() - offset)
    return d.toISOString().split('T')[0]
  }
  const formatISO = (offset: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() - offset)
    return d.toISOString()
  }

  // Workouts: 8 sessions over the last 7 days (shows high activity/progress)
  localStorage.setItem('fitlogic_workouts', JSON.stringify([
    { id: 'w1', name: 'Swimming', duration: 40, calories_burned: 450, date: formatD(0), notes: 'Felt highly energetic' },
    { id: 'w2', name: 'Leg Day Gym Session', duration: 70, calories_burned: 550, date: formatD(1), notes: 'Squat PR' },
    { id: 'w3', name: 'Evening Cycling', duration: 50, calories_burned: 480, date: formatD(2), notes: 'Rained a little' },
    { id: 'w4', name: 'HIIT Cardio', duration: 30, calories_burned: 350, date: formatD(3), notes: 'High intensity session' },
    { id: 'w5', name: 'Pull Day Gym Session', duration: 60, calories_burned: 400, date: formatD(4), notes: 'Focus on form' },
    { id: 'w6', name: 'Morning Run', duration: 45, calories_burned: 420, date: formatD(5), notes: 'Stamina improving' },
    { id: 'w7', name: 'Push Day Gym Session', duration: 65, calories_burned: 460, date: formatD(6), notes: 'Tired but finished' },
    { id: 'w8', name: 'Yoga and Stretch', duration: 30, calories_burned: 150, date: formatD(7), notes: 'Active recovery' }
  ]))
  
  // BMI Records: weight going down from 82.5 kg to 78.5 kg over 5 weeks (clear progress!)
  localStorage.setItem('fitlogic_bmi', JSON.stringify([
    { id: 'b6', height: 175, weight: 78.5, bmi: 25.6, category: 'Overweight', recorded_at: formatISO(0) },
    { id: 'b5', height: 175, weight: 79.2, bmi: 25.9, category: 'Overweight', recorded_at: formatISO(7) },
    { id: 'b4', height: 175, weight: 80.1, bmi: 26.2, category: 'Overweight', recorded_at: formatISO(14) },
    { id: 'b3', height: 175, weight: 80.8, bmi: 26.4, category: 'Overweight', recorded_at: formatISO(21) },
    { id: 'b2', height: 175, weight: 81.7, bmi: 26.7, category: 'Overweight', recorded_at: formatISO(28) },
    { id: 'b1', height: 175, weight: 82.5, bmi: 26.9, category: 'Overweight', recorded_at: formatISO(35) }
  ]))

  // Calories: Mifflin-St Jeor daily budget needs calculators logs showing tracking progress
  localStorage.setItem('fitlogic_calories', JSON.stringify([
    { id: 'c2', age: 21, gender: 'male', height: 175, weight: 78.5, activity_level: 'moderate', goal: 'lose_slow', bmr: 1740, tdee: 2697, target_calories: 2447, recorded_at: formatISO(0) },
    { id: 'c1', age: 21, gender: 'male', height: 175, weight: 80.8, activity_level: 'moderate', goal: 'lose_slow', bmr: 1763, tdee: 2732, target_calories: 2482, recorded_at: formatISO(21) }
  ]))
}

export const mockSupabase = {
  auth: {
    getUser: async () => {
      if (typeof window === 'undefined') {
        const user = {
          id: 'demo-user-id',
          email: 'demo@fitlogic.com',
          user_metadata: { full_name: 'Demo Student' }
        }
        return { data: { user }, error: null }
      }
      
      let userStr = localStorage.getItem('fitlogic_user')
      if (!userStr) {
        const defaultUser = {
          id: 'demo-user-id',
          email: 'demo@fitlogic.com',
          user_metadata: { full_name: 'Demo Student' }
        }
        localStorage.setItem('fitlogic_user', JSON.stringify(defaultUser))
        userStr = JSON.stringify(defaultUser)
        document.cookie = "fitlogic_user=true; path=/"
        
        // Seed database objects if missing
        if (!localStorage.getItem('fitlogic_profile')) {
          seedAllMockData('demo@fitlogic.com', 'Demo Student')
        }
      }
      const user = JSON.parse(userStr)
      return { data: { user }, error: null }
    },
    signInWithPassword: async ({ email }: { email: string }) => {
      if (typeof window === 'undefined') return { data: { user: null }, error: null }
      const user = {
        id: 'demo-user-id',
        email,
        user_metadata: { full_name: 'Demo Student' }
      }
      localStorage.setItem('fitlogic_user', JSON.stringify(user))
      document.cookie = "fitlogic_user=true; path=/"
      
      // Inject some mock seed data if not present
      if (!localStorage.getItem('fitlogic_profile')) {
        seedAllMockData(email, 'Demo Student')
      }

      return { data: { user }, error: null }
    },
    signUp: async ({ email, options }: any) => {
      if (typeof window === 'undefined') return { data: { user: null }, error: null }
      const user = {
        id: 'demo-user-id',
        email,
        user_metadata: { full_name: options?.data?.full_name || 'Demo Student' }
      }
      localStorage.setItem('fitlogic_user', JSON.stringify(user))
      document.cookie = "fitlogic_user=true; path=/"
      localStorage.setItem('fitlogic_profile', JSON.stringify({
        id: 'demo-user-id',
        email,
        full_name: options?.data?.full_name || 'Demo Student',
        height: 175,
        weight: 70,
        target_weight: 68,
        target_calories: 2200
      }))
      return { data: { user, session: { user } }, error: null }
    },
    signOut: async () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fitlogic_user')
        document.cookie = "fitlogic_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
      }
      return { error: null }
    },
    updateUser: async ({ password, data }: any) => {
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('fitlogic_user')
        if (userStr) {
          const user = JSON.parse(userStr)
          if (data?.full_name) {
            user.user_metadata = { ...user.user_metadata, full_name: data.full_name }
            localStorage.setItem('fitlogic_user', JSON.stringify(user))
          }
        }
      }
      return { error: null }
    }
  },
  from: (table: string) => {
    return new MockQueryBuilder(table)
  }
}
