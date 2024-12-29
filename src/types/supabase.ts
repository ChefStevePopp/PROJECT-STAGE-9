export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          slug: string
          owner_id: string
          settings: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
          owner_id: string
          settings?: Json
        }
        Update: {
          name?: string
          slug?: string
          owner_id?: string
          settings?: Json
        }
      }
      locations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          organization_id: string
          name: string
          address: string | null
          settings: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id: string
          name: string
          address?: string | null
          settings?: Json
        }
        Update: {
          organization_id?: string
          name?: string
          address?: string | null
          settings?: Json
        }
      }
      organization_members: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
        }
        Update: {
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
        }
      }
      location_members: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          location_id: string
          user_id: string
          role: 'manager' | 'staff'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          location_id: string
          user_id: string
          role: 'manager' | 'staff'
        }
        Update: {
          location_id?: string
          user_id?: string
          role?: 'manager' | 'staff'
        }
      }
      invitations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          organization_id: string
          location_id: string | null
          email: string
          role: string
          token: string
          expires_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id: string
          location_id?: string | null
          email: string
          role: string
          token: string
          expires_at: string
          accepted_at?: string | null
        }
        Update: {
          organization_id?: string
          location_id?: string | null
          email?: string
          role?: string
          token?: string
          expires_at?: string
          accepted_at?: string | null
        }
      }
      team_members: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          organization_id: string
          location_id: string | null
          first_name: string
          last_name: string
          email: string
          phone: string
          punch_id: string
          avatar_url: string
          roles: string[]
          departments: string[]
          locations: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          organization_id: string
          location_id?: string | null
          first_name: string
          last_name: string
          email: string
          phone?: string
          punch_id: string
          avatar_url?: string
          roles?: string[]
          departments?: string[]
          locations?: string[]
        }
        Update: {
          organization_id?: string
          location_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          punch_id?: string
          avatar_url?: string
          roles?: string[]
          departments?: string[]
          locations?: string[]
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}