import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Profile {
  id: string
  first_name?: string | null
  last_name?: string | null
  avatar_url?: string | null
  email?: string | null
  created_at?: string
  updated_at?: string
}

interface ProfileState {
  profile: Profile | null
  loading: boolean
  error: string | null
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearProfile: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      loading: false,
      error: null,
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearProfile: () => set({ profile: null, loading: false, error: null }),
    }),
    {
      name: 'profile-storage',
      partialize: (state) => ({ profile: state.profile }),
    },
  ),
)