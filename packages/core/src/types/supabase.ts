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
    }
  }
}