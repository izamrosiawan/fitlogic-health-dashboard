// Mock Supabase Client for local testing when Supabase credentials are not configured.
// Stores all data locally in localStorage and sets authentication cookies.

class MockQueryBuilder {
  table: string
  constructor(table: string) {
    this.table = table
  }

  select(fields?: string) { return this }
  eq(field: string, val: any) { return this }
  gte(field: string, val: any) { return this }
  order(field: string, options?: any) { return this }
  limit(n: number) { return this }

  // Promise resolution support for direct await of queries
  then(onfulfilled: (value: any) => any) {
    if (typeof window === 'undefined') {
      return Promise.resolve(onfulfilled({ data: [], error: null }))
    }

    let data: any = []
    if (this.table === 'profiles') {
      const p = localStorage.getItem('fitlogic_profile')
      data = p ? JSON.parse(p) : null
    } else if (this.table === 'bmi_records') {
      const r = localStorage.getItem('fitlogic_bmi')
      data = r ? JSON.parse(r) : []
    } else if (this.table === 'calorie_records') {
      const r = localStorage.getItem('fitlogic_calories')
      data = r ? JSON.parse(r) : []
    } else if (this.table === 'workouts') {
      const r = localStorage.getItem('fitlogic_workouts')
      data = r ? JSON.parse(r) : []
    }

    return Promise.resolve(onfulfilled({ data, error: null }))
  }

  async single() {
    if (typeof window === 'undefined') {
      return { data: null, error: null }
    }
    if (this.table === 'profiles') {
      const p = localStorage.getItem('fitlogic_profile')
      return { data: p ? JSON.parse(p) : null, error: null }
    }
    return { data: null, error: null }
  }

  async insert(values: any) {
    if (typeof window === 'undefined') {
      return { data: values, error: null }
    }

    let list: any[] = []
    let dataToInsert = Array.isArray(values) ? values : [values]

    if (this.table === 'bmi_records') {
      list = JSON.parse(localStorage.getItem('fitlogic_bmi') || '[]')
      dataToInsert = dataToInsert.map(x => ({
        id: Math.random().toString(36).substring(7),
        recorded_at: new Date().toISOString(),
        ...x
      }))
      list = [...dataToInsert, ...list]
      localStorage.setItem('fitlogic_bmi', JSON.stringify(list))
    } else if (this.table === 'calorie_records') {
      list = JSON.parse(localStorage.getItem('fitlogic_calories') || '[]')
      dataToInsert = dataToInsert.map(x => ({
        id: Math.random().toString(36).substring(7),
        recorded_at: new Date().toISOString(),
        ...x
      }))
      list = [...dataToInsert, ...list]
      localStorage.setItem('fitlogic_calories', JSON.stringify(list))
    } else if (this.table === 'workouts') {
      list = JSON.parse(localStorage.getItem('fitlogic_workouts') || '[]')
      dataToInsert = dataToInsert.map(x => ({
        id: Math.random().toString(36).substring(7),
        created_at: new Date().toISOString(),
        ...x
      }))
      list = [...dataToInsert, ...list]
      localStorage.setItem('fitlogic_workouts', JSON.stringify(list))
    }

    return {
      data: dataToInsert,
      error: null,
      select: () => ({
        then: (cb: any) => cb({ data: dataToInsert, error: null })
      })
    }
  }

  async upsert(values: any) {
    if (typeof window !== 'undefined' && this.table === 'profiles') {
      localStorage.setItem('fitlogic_profile', JSON.stringify(values))
    }
    return { data: values, error: null }
  }

  async delete() {
    return {
      eq: (field: string, val: any) => {
        if (typeof window !== 'undefined') {
          if (this.table === 'bmi_records') {
            const list = JSON.parse(localStorage.getItem('fitlogic_bmi') || '[]')
            localStorage.setItem('fitlogic_bmi', JSON.stringify(list.filter((x: any) => x[field] !== val)))
          } else if (this.table === 'calorie_records') {
            const list = JSON.parse(localStorage.getItem('fitlogic_calories') || '[]')
            localStorage.setItem('fitlogic_calories', JSON.stringify(list.filter((x: any) => x[field] !== val)))
          } else if (this.table === 'workouts') {
            const list = JSON.parse(localStorage.getItem('fitlogic_workouts') || '[]')
            localStorage.setItem('fitlogic_workouts', JSON.stringify(list.filter((x: any) => x[field] !== val)))
          }
        }
        return Promise.resolve({ error: null })
      }
    }
  }
}

export const mockSupabase = {
  auth: {
    getUser: async () => {
      if (typeof window === 'undefined') {
        return { data: { user: null }, error: null }
      }
      const userStr = localStorage.getItem('fitlogic_user')
      const user = userStr ? JSON.parse(userStr) : null
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
        localStorage.setItem('fitlogic_profile', JSON.stringify({
          id: 'demo-user-id',
          email,
          full_name: 'Demo Student',
          height: 175,
          weight: 78.5,
          target_weight: 72.0,
          target_calories: 2200
        }))
        
        // Seed workouts
        const today = new Date()
        const formatD = (offset: number) => {
          const d = new Date(today)
          d.setDate(d.getDate() - offset)
          return d.toISOString().split('T')[0]
        }
        localStorage.setItem('fitlogic_workouts', JSON.stringify([
          { id: '1', name: 'Swimming', duration: 40, calories_burned: 450, date: formatD(0) },
          { id: '2', name: 'Leg Day Gym Session', duration: 70, calories_burned: 550, date: formatD(1) },
          { id: '3', name: 'Evening Cycling', duration: 50, calories_burned: 480, date: formatD(2) },
          { id: '4', name: 'Pull Day Gym Session', duration: 60, calories_burned: 400, date: formatD(3) },
          { id: '5', name: 'HIIT Cardio', duration: 30, calories_burned: 380, date: formatD(4) }
        ]))
        
        // Seed BMI
        localStorage.setItem('fitlogic_bmi', JSON.stringify([
          { id: '1', height: 175, weight: 78.5, bmi: 25.6, category: 'Overweight', recorded_at: new Date().toISOString() }
        ]))

        // Seed Calories
        localStorage.setItem('fitlogic_calories', JSON.stringify([
          { id: '1', age: 21, gender: 'male', height: 175, weight: 78.5, activity_level: 'moderate', goal: 'lose_slow', bmr: 1740, tdee: 2697, target_calories: 2447, recorded_at: new Date().toISOString() }
        ]))
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
