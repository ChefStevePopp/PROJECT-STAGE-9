export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          details: Json | null
          id: string
          metadata: Json | null
          organization_id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          details?: Json | null
          id?: string
          metadata?: Json | null
          organization_id: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      csv_mappings: {
        Row: {
          break_duration_field: string | null
          config: Json | null
          created_at: string | null
          created_by: string | null
          date_field: string | null
          employee_name_field: string | null
          end_time_field: string | null
          format: string
          format_type: string | null
          friday_field: string | null
          id: string
          is_default: boolean | null
          monday_field: string | null
          name: string
          notes_field: string | null
          organization_id: string
          role_field: string | null
          role_pattern: string | null
          saturday_field: string | null
          start_time_field: string | null
          sunday_field: string | null
          thursday_field: string | null
          time_format: string | null
          tuesday_field: string | null
          updated_at: string | null
          wednesday_field: string | null
        }
        Insert: {
          break_duration_field?: string | null
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          date_field?: string | null
          employee_name_field?: string | null
          end_time_field?: string | null
          format: string
          format_type?: string | null
          friday_field?: string | null
          id?: string
          is_default?: boolean | null
          monday_field?: string | null
          name: string
          notes_field?: string | null
          organization_id: string
          role_field?: string | null
          role_pattern?: string | null
          saturday_field?: string | null
          start_time_field?: string | null
          sunday_field?: string | null
          thursday_field?: string | null
          time_format?: string | null
          tuesday_field?: string | null
          updated_at?: string | null
          wednesday_field?: string | null
        }
        Update: {
          break_duration_field?: string | null
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          date_field?: string | null
          employee_name_field?: string | null
          end_time_field?: string | null
          format?: string
          format_type?: string | null
          friday_field?: string | null
          id?: string
          is_default?: boolean | null
          monday_field?: string | null
          name?: string
          notes_field?: string | null
          organization_id?: string
          role_field?: string | null
          role_pattern?: string | null
          saturday_field?: string | null
          start_time_field?: string | null
          sunday_field?: string | null
          thursday_field?: string | null
          time_format?: string | null
          tuesday_field?: string | null
          updated_at?: string | null
          wednesday_field?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "csv_mappings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      food_categories: {
        Row: {
          archived: boolean | null
          created_at: string
          description: string | null
          group_id: string
          id: string
          name: string
          organization_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          archived?: boolean | null
          created_at?: string
          description?: string | null
          group_id: string
          id?: string
          name: string
          organization_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          archived?: boolean | null
          created_at?: string
          description?: string | null
          group_id?: string
          id?: string
          name?: string
          organization_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_categories_group_id_organization_id_fkey"
            columns: ["group_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "food_category_groups"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "food_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      food_category_groups: {
        Row: {
          archived: boolean | null
          color: string
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          organization_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          archived?: boolean | null
          color: string
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          name: string
          organization_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          archived?: boolean | null
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          organization_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_category_groups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      food_sub_categories: {
        Row: {
          archived: boolean | null
          category_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          archived?: boolean | null
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          archived?: boolean | null
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_sub_categories_category_id_organization_id_fkey"
            columns: ["category_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "food_categories"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "food_sub_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      health_check: {
        Row: {
          id: number
          status: string
        }
        Insert: {
          id?: number
          status?: string
        }
        Update: {
          id?: number
          status?: string
        }
        Relationships: []
      }
      health_inspection_notifications: {
        Row: {
          created_at: string
          deadline: string | null
          id: string
          inspection_id: string | null
          message: string
          organization_id: string
          read_by: Json | null
          severity: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          id?: string
          inspection_id?: string | null
          message: string
          organization_id: string
          read_by?: Json | null
          severity?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          id?: string
          inspection_id?: string | null
          message?: string
          organization_id?: string
          read_by?: Json | null
          severity?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_inspection_notifications_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "health_inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_inspection_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      health_inspections: {
        Row: {
          action_items: Json | null
          created_at: string
          documents: Json | null
          end_time: string | null
          id: string
          inspector_name: string | null
          notes: string | null
          organization_id: string
          start_time: string | null
          updated_at: string
          visit_date: string
        }
        Insert: {
          action_items?: Json | null
          created_at?: string
          documents?: Json | null
          end_time?: string | null
          id?: string
          inspector_name?: string | null
          notes?: string | null
          organization_id: string
          start_time?: string | null
          updated_at?: string
          visit_date: string
        }
        Update: {
          action_items?: Json | null
          created_at?: string
          documents?: Json | null
          end_time?: string | null
          id?: string
          inspector_name?: string | null
          notes?: string | null
          organization_id?: string
          start_time?: string | null
          updated_at?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_inspections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_counts: {
        Row: {
          count_date: string
          counted_by: string | null
          created_at: string
          id: string
          location: string | null
          master_ingredient_id: string
          notes: string | null
          organization_id: string
          quantity: number
          status: string | null
          total_value: number | null
          unit_cost: number
          updated_at: string
        }
        Insert: {
          count_date?: string
          counted_by?: string | null
          created_at?: string
          id?: string
          location?: string | null
          master_ingredient_id: string
          notes?: string | null
          organization_id: string
          quantity?: number
          status?: string | null
          total_value?: number | null
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          count_date?: string
          counted_by?: string | null
          created_at?: string
          id?: string
          location?: string | null
          master_ingredient_id?: string
          notes?: string | null
          organization_id?: string
          quantity?: number
          status?: string | null
          total_value?: number | null
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_counts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          formatted_address: string | null
          id: string
          is_primary: boolean | null
          name: string
          organization_id: string
          phone: string | null
          postal_code: string | null
          settings: Json | null
          state: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          formatted_address?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          organization_id: string
          phone?: string | null
          postal_code?: string | null
          settings?: Json | null
          state?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          formatted_address?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          organization_id?: string
          phone?: string | null
          postal_code?: string | null
          settings?: Json | null
          state?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      master_ingredients: {
        Row: {
          allergen_celery: boolean
          allergen_citrus: boolean
          allergen_crustacean: boolean
          allergen_custom1_active: boolean | null
          allergen_custom1_name: string | null
          allergen_custom2_active: boolean | null
          allergen_custom2_name: string | null
          allergen_custom3_active: boolean | null
          allergen_custom3_name: string | null
          allergen_egg: boolean
          allergen_fish: boolean
          allergen_garlic: boolean
          allergen_gluten: boolean
          allergen_hot_pepper: boolean
          allergen_milk: boolean
          allergen_mushroom: boolean
          allergen_mustard: boolean
          allergen_nitrite: boolean
          allergen_notes: string | null
          allergen_onion: boolean
          allergen_peanut: boolean
          allergen_pork: boolean
          allergen_sesame: boolean
          allergen_shellfish: boolean
          allergen_soy: boolean
          allergen_sulphite: boolean
          allergen_treenut: boolean
          allergen_wheat: boolean
          archive: boolean | null
          case_size: string | null
          category: string | null
          cost_per_recipe_unit: number
          created_at: string
          current_price: number
          id: string
          image_url: string | null
          item_code: string
          major_group: string | null
          organization_id: string
          product: string
          recipe_unit_per_purchase_unit: number
          recipe_unit_type: string | null
          storage_area: string | null
          sub_category: string | null
          unit_of_measure: string
          units_per_case: string | null
          updated_at: string
          vendor: string
          yield_percent: number
        }
        Insert: {
          allergen_celery?: boolean
          allergen_citrus?: boolean
          allergen_crustacean?: boolean
          allergen_custom1_active?: boolean | null
          allergen_custom1_name?: string | null
          allergen_custom2_active?: boolean | null
          allergen_custom2_name?: string | null
          allergen_custom3_active?: boolean | null
          allergen_custom3_name?: string | null
          allergen_egg?: boolean
          allergen_fish?: boolean
          allergen_garlic?: boolean
          allergen_gluten?: boolean
          allergen_hot_pepper?: boolean
          allergen_milk?: boolean
          allergen_mushroom?: boolean
          allergen_mustard?: boolean
          allergen_nitrite?: boolean
          allergen_notes?: string | null
          allergen_onion?: boolean
          allergen_peanut?: boolean
          allergen_pork?: boolean
          allergen_sesame?: boolean
          allergen_shellfish?: boolean
          allergen_soy?: boolean
          allergen_sulphite?: boolean
          allergen_treenut?: boolean
          allergen_wheat?: boolean
          archive?: boolean | null
          case_size?: string | null
          category?: string | null
          cost_per_recipe_unit?: number
          created_at?: string
          current_price?: number
          id?: string
          image_url?: string | null
          item_code: string
          major_group?: string | null
          organization_id: string
          product: string
          recipe_unit_per_purchase_unit?: number
          recipe_unit_type?: string | null
          storage_area?: string | null
          sub_category?: string | null
          unit_of_measure: string
          units_per_case?: string | null
          updated_at?: string
          vendor: string
          yield_percent?: number
        }
        Update: {
          allergen_celery?: boolean
          allergen_citrus?: boolean
          allergen_crustacean?: boolean
          allergen_custom1_active?: boolean | null
          allergen_custom1_name?: string | null
          allergen_custom2_active?: boolean | null
          allergen_custom2_name?: string | null
          allergen_custom3_active?: boolean | null
          allergen_custom3_name?: string | null
          allergen_egg?: boolean
          allergen_fish?: boolean
          allergen_garlic?: boolean
          allergen_gluten?: boolean
          allergen_hot_pepper?: boolean
          allergen_milk?: boolean
          allergen_mushroom?: boolean
          allergen_mustard?: boolean
          allergen_nitrite?: boolean
          allergen_notes?: string | null
          allergen_onion?: boolean
          allergen_peanut?: boolean
          allergen_pork?: boolean
          allergen_sesame?: boolean
          allergen_shellfish?: boolean
          allergen_soy?: boolean
          allergen_sulphite?: boolean
          allergen_treenut?: boolean
          allergen_wheat?: boolean
          archive?: boolean | null
          case_size?: string | null
          category?: string | null
          cost_per_recipe_unit?: number
          created_at?: string
          current_price?: number
          id?: string
          image_url?: string | null
          item_code?: string
          major_group?: string | null
          organization_id?: string
          product?: string
          recipe_unit_per_purchase_unit?: number
          recipe_unit_type?: string | null
          storage_area?: string | null
          sub_category?: string | null
          unit_of_measure?: string
          units_per_case?: string | null
          updated_at?: string
          vendor?: string
          yield_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "master_ingredients_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "food_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_ingredients_major_group_fkey"
            columns: ["major_group"]
            isOneToOne: false
            referencedRelation: "food_category_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_ingredients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_ingredients_sub_category_fkey"
            columns: ["sub_category"]
            isOneToOne: false
            referencedRelation: "food_sub_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      operations_settings: {
        Row: {
          alcohol_measures: string[] | null
          batch_units: string[] | null
          category_descriptions: Json | null
          category_groups: Json | null
          container_types: string[] | null
          created_at: string
          departments: string[] | null
          dry_goods_measures: string[] | null
          id: string
          ingredient_categories: string[] | null
          ingredient_sub_categories: string[] | null
          kitchen_stations: string[] | null
          label_templates: Json | null
          last_updated: string
          mise_en_place_categories: string[] | null
          organization_id: string
          pos_family_groups: string[] | null
          pos_major_groups: string[] | null
          protein_measures: string[] | null
          recipe_unit_measures: string[] | null
          revenue_channels: string[] | null
          shelf_life_options: string[] | null
          storage_areas: string[] | null
          storage_containers: string[] | null
          updated_at: string
          vendors: string[] | null
          volume_measures: string[] | null
          weight_measures: string[] | null
        }
        Insert: {
          alcohol_measures?: string[] | null
          batch_units?: string[] | null
          category_descriptions?: Json | null
          category_groups?: Json | null
          container_types?: string[] | null
          created_at?: string
          departments?: string[] | null
          dry_goods_measures?: string[] | null
          id?: string
          ingredient_categories?: string[] | null
          ingredient_sub_categories?: string[] | null
          kitchen_stations?: string[] | null
          label_templates?: Json | null
          last_updated?: string
          mise_en_place_categories?: string[] | null
          organization_id: string
          pos_family_groups?: string[] | null
          pos_major_groups?: string[] | null
          protein_measures?: string[] | null
          recipe_unit_measures?: string[] | null
          revenue_channels?: string[] | null
          shelf_life_options?: string[] | null
          storage_areas?: string[] | null
          storage_containers?: string[] | null
          updated_at?: string
          vendors?: string[] | null
          volume_measures?: string[] | null
          weight_measures?: string[] | null
        }
        Update: {
          alcohol_measures?: string[] | null
          batch_units?: string[] | null
          category_descriptions?: Json | null
          category_groups?: Json | null
          container_types?: string[] | null
          created_at?: string
          departments?: string[] | null
          dry_goods_measures?: string[] | null
          id?: string
          ingredient_categories?: string[] | null
          ingredient_sub_categories?: string[] | null
          kitchen_stations?: string[] | null
          label_templates?: Json | null
          last_updated?: string
          mise_en_place_categories?: string[] | null
          organization_id?: string
          pos_family_groups?: string[] | null
          pos_major_groups?: string[] | null
          protein_measures?: string[] | null
          recipe_unit_measures?: string[] | null
          revenue_channels?: string[] | null
          shelf_life_options?: string[] | null
          storage_areas?: string[] | null
          storage_containers?: string[] | null
          updated_at?: string
          vendors?: string[] | null
          volume_measures?: string[] | null
          weight_measures?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "operations_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_team_members: {
        Row: {
          avatar_url: string | null
          created_at: string
          departments: string[] | null
          display_name: string | null
          email: string
          emergency_contact: Json | null
          first_name: string
          id: string
          kitchen_role: string | null
          kitchen_stations: string[] | null
          last_name: string
          locations: string[] | null
          metadata: Json | null
          notification_preferences: Json | null
          organization_id: string
          phone: string | null
          punch_id: string | null
          roles: string[] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          departments?: string[] | null
          display_name?: string | null
          email: string
          emergency_contact?: Json | null
          first_name: string
          id?: string
          kitchen_role?: string | null
          kitchen_stations?: string[] | null
          last_name: string
          locations?: string[] | null
          metadata?: Json | null
          notification_preferences?: Json | null
          organization_id: string
          phone?: string | null
          punch_id?: string | null
          roles?: string[] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          departments?: string[] | null
          display_name?: string | null
          email?: string
          emergency_contact?: Json | null
          first_name?: string
          id?: string
          kitchen_role?: string | null
          kitchen_stations?: string[] | null
          last_name?: string
          locations?: string[] | null
          metadata?: Json | null
          notification_preferences?: Json | null
          organization_id?: string
          phone?: string | null
          punch_id?: string | null
          roles?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      organization_themes: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          theme: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          theme?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          theme?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_themes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_user_app_roles: {
        Row: {
          app_role: string
          created_at: string
          id: string
          is_active: boolean | null
          kitchen_role: string
          organization_id: string
          permissions: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          app_role: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          kitchen_role: string
          organization_id: string
          permissions?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          app_role?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          kitchen_role?: string
          organization_id?: string
          permissions?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_user_app_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          health_inspections: Json | null
          id: string
          legal_name: string | null
          name: string
          owner_id: string | null
          settings: Json | null
          tax_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          health_inspections?: Json | null
          id?: string
          legal_name?: string | null
          name: string
          owner_id?: string | null
          settings?: Json | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          health_inspections?: Json | null
          id?: string
          legal_name?: string | null
          name?: string
          owner_id?: string | null
          settings?: Json | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      prepared_items: {
        Row: {
          allergen_celery: boolean
          allergen_citrus: boolean
          allergen_crustacean: boolean
          allergen_custom1_active: boolean | null
          allergen_custom1_name: string | null
          allergen_custom2_active: boolean | null
          allergen_custom2_name: string | null
          allergen_custom3_active: boolean | null
          allergen_custom3_name: string | null
          allergen_egg: boolean
          allergen_fish: boolean
          allergen_garlic: boolean
          allergen_gluten: boolean
          allergen_hot_pepper: boolean
          allergen_milk: boolean
          allergen_mushroom: boolean
          allergen_mustard: boolean
          allergen_nitrite: boolean
          allergen_notes: string | null
          allergen_onion: boolean
          allergen_peanut: boolean
          allergen_pork: boolean
          allergen_sesame: boolean
          allergen_shellfish: boolean
          allergen_soy: boolean
          allergen_sulphite: boolean
          allergen_treenut: boolean
          allergen_wheat: boolean
          category: string
          container: string | null
          container_type: string | null
          cost_per_recipe_unit: number
          created_at: string
          final_cost: number
          id: string
          item_id: string
          organization_id: string
          product: string
          recipe_unit: string
          shelf_life: string | null
          station: string
          storage_area: string | null
          sub_category: string | null
          updated_at: string
          yield_percent: number
        }
        Insert: {
          allergen_celery?: boolean
          allergen_citrus?: boolean
          allergen_crustacean?: boolean
          allergen_custom1_active?: boolean | null
          allergen_custom1_name?: string | null
          allergen_custom2_active?: boolean | null
          allergen_custom2_name?: string | null
          allergen_custom3_active?: boolean | null
          allergen_custom3_name?: string | null
          allergen_egg?: boolean
          allergen_fish?: boolean
          allergen_garlic?: boolean
          allergen_gluten?: boolean
          allergen_hot_pepper?: boolean
          allergen_milk?: boolean
          allergen_mushroom?: boolean
          allergen_mustard?: boolean
          allergen_nitrite?: boolean
          allergen_notes?: string | null
          allergen_onion?: boolean
          allergen_peanut?: boolean
          allergen_pork?: boolean
          allergen_sesame?: boolean
          allergen_shellfish?: boolean
          allergen_soy?: boolean
          allergen_sulphite?: boolean
          allergen_treenut?: boolean
          allergen_wheat?: boolean
          category: string
          container?: string | null
          container_type?: string | null
          cost_per_recipe_unit?: number
          created_at?: string
          final_cost?: number
          id?: string
          item_id: string
          organization_id: string
          product: string
          recipe_unit: string
          shelf_life?: string | null
          station: string
          storage_area?: string | null
          sub_category?: string | null
          updated_at?: string
          yield_percent?: number
        }
        Update: {
          allergen_celery?: boolean
          allergen_citrus?: boolean
          allergen_crustacean?: boolean
          allergen_custom1_active?: boolean | null
          allergen_custom1_name?: string | null
          allergen_custom2_active?: boolean | null
          allergen_custom2_name?: string | null
          allergen_custom3_active?: boolean | null
          allergen_custom3_name?: string | null
          allergen_egg?: boolean
          allergen_fish?: boolean
          allergen_garlic?: boolean
          allergen_gluten?: boolean
          allergen_hot_pepper?: boolean
          allergen_milk?: boolean
          allergen_mushroom?: boolean
          allergen_mustard?: boolean
          allergen_nitrite?: boolean
          allergen_notes?: string | null
          allergen_onion?: boolean
          allergen_peanut?: boolean
          allergen_pork?: boolean
          allergen_sesame?: boolean
          allergen_shellfish?: boolean
          allergen_soy?: boolean
          allergen_sulphite?: boolean
          allergen_treenut?: boolean
          allergen_wheat?: boolean
          category?: string
          container?: string | null
          container_type?: string | null
          cost_per_recipe_unit?: number
          created_at?: string
          final_cost?: number
          id?: string
          item_id?: string
          organization_id?: string
          product?: string
          recipe_unit?: string
          shelf_life?: string | null
          station?: string
          storage_area?: string | null
          sub_category?: string | null
          updated_at?: string
          yield_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "prepared_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_equipment: {
        Row: {
          alternatives: string[] | null
          created_at: string
          id: string
          is_required: boolean | null
          name: string
          recipe_id: string
          sort_order: number | null
          specifications: string | null
          station: string
          updated_at: string
        }
        Insert: {
          alternatives?: string[] | null
          created_at?: string
          id?: string
          is_required?: boolean | null
          name: string
          recipe_id: string
          sort_order?: number | null
          specifications?: string | null
          station: string
          updated_at?: string
        }
        Update: {
          alternatives?: string[] | null
          created_at?: string
          id?: string
          is_required?: boolean | null
          name?: string
          recipe_id?: string
          sort_order?: number | null
          specifications?: string | null
          station?: string
          updated_at?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          allergenInfo: Json | null
          approved_at: string | null
          approved_by: string | null
          category: string | null
          category_name: string | null
          container: string | null
          container_type: string | null
          cook_time: number | null
          cost_per_unit: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          equipment: Json | null
          id: string
          image_url: string | null
          ingredients: Json | null
          label_requirements: Json | null
          labor_cost_per_hour: number | null
          last_reviewed_at: string | null
          last_reviewed_by: string | null
          major_group: string | null
          major_group_name: string | null
          media: Json | null
          modified_by: string | null
          name: string
          organization_id: string
          prep_temp_notes: string | null
          prep_time: number | null
          prep_time_notes: string | null
          primary_station: string | null
          production_notes: string | null
          quality_standards: Json | null
          recipe_unit_ratio: string | null
          rest_time: number | null
          secondary_station: string | null
          secondary_stations: string[] | null
          shelf_life: string | null
          station: string | null
          station_name: string | null
          status: string
          steps: Json | null
          storage: Json | null
          storage_area: string | null
          sub_category: string | null
          sub_category_name: string | null
          target_cost_percent: number | null
          time_management_notes: string | null
          timeline_notes: string | null
          total_cost: number | null
          total_time: number | null
          training: Json | null
          type: string
          unit_type: string | null
          updated_at: string | null
          use_label_printer: boolean | null
          version: string | null
          versions: Json | null
          video_url: string | null
          yield_amount: number | null
          yield_unit: string | null
        }
        Insert: {
          allergenInfo?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          category_name?: string | null
          container?: string | null
          container_type?: string | null
          cook_time?: number | null
          cost_per_unit?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          equipment?: Json | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          label_requirements?: Json | null
          labor_cost_per_hour?: number | null
          last_reviewed_at?: string | null
          last_reviewed_by?: string | null
          major_group?: string | null
          major_group_name?: string | null
          media?: Json | null
          modified_by?: string | null
          name: string
          organization_id: string
          prep_temp_notes?: string | null
          prep_time?: number | null
          prep_time_notes?: string | null
          primary_station?: string | null
          production_notes?: string | null
          quality_standards?: Json | null
          recipe_unit_ratio?: string | null
          rest_time?: number | null
          secondary_station?: string | null
          secondary_stations?: string[] | null
          shelf_life?: string | null
          station?: string | null
          station_name?: string | null
          status?: string
          steps?: Json | null
          storage?: Json | null
          storage_area?: string | null
          sub_category?: string | null
          sub_category_name?: string | null
          target_cost_percent?: number | null
          time_management_notes?: string | null
          timeline_notes?: string | null
          total_cost?: number | null
          total_time?: number | null
          training?: Json | null
          type: string
          unit_type?: string | null
          updated_at?: string | null
          use_label_printer?: boolean | null
          version?: string | null
          versions?: Json | null
          video_url?: string | null
          yield_amount?: number | null
          yield_unit?: string | null
        }
        Update: {
          allergenInfo?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          category_name?: string | null
          container?: string | null
          container_type?: string | null
          cook_time?: number | null
          cost_per_unit?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          equipment?: Json | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          label_requirements?: Json | null
          labor_cost_per_hour?: number | null
          last_reviewed_at?: string | null
          last_reviewed_by?: string | null
          major_group?: string | null
          major_group_name?: string | null
          media?: Json | null
          modified_by?: string | null
          name?: string
          organization_id?: string
          prep_temp_notes?: string | null
          prep_time?: number | null
          prep_time_notes?: string | null
          primary_station?: string | null
          production_notes?: string | null
          quality_standards?: Json | null
          recipe_unit_ratio?: string | null
          rest_time?: number | null
          secondary_station?: string | null
          secondary_stations?: string[] | null
          shelf_life?: string | null
          station?: string | null
          station_name?: string | null
          status?: string
          steps?: Json | null
          storage?: Json | null
          storage_area?: string | null
          sub_category?: string | null
          sub_category_name?: string | null
          target_cost_percent?: number | null
          time_management_notes?: string | null
          timeline_notes?: string | null
          total_cost?: number | null
          total_time?: number | null
          training?: Json | null
          type?: string
          unit_type?: string | null
          updated_at?: string | null
          use_label_printer?: boolean | null
          version?: string | null
          versions?: Json | null
          video_url?: string | null
          yield_amount?: number | null
          yield_unit?: string | null
        }
        Relationships: []
      }
      schedule_shifts: {
        Row: {
          break_duration: number | null
          created_at: string | null
          employee_id: string | null
          employee_name: string
          end_time: string
          first_name: string | null
          id: string
          last_name: string | null
          notes: string | null
          role: string | null
          schedule_id: string
          shift_date: string
          start_time: string
        }
        Insert: {
          break_duration?: number | null
          created_at?: string | null
          employee_id?: string | null
          employee_name: string
          end_time: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          role?: string | null
          schedule_id: string
          shift_date: string
          start_time: string
        }
        Update: {
          break_duration?: number | null
          created_at?: string | null
          employee_id?: string | null
          employee_name?: string
          end_time?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          role?: string | null
          schedule_id?: string
          shift_date?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_shifts_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_date: string
          file_url: string | null
          id: string
          metadata: Json | null
          organization_id: string
          source: string
          start_date: string
          status: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_date: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          source: string
          start_date: string
          status: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          source?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      seven_shifts_integrations: {
        Row: {
          api_key: string
          auto_sync: boolean | null
          created_at: string | null
          created_by: string | null
          id: string
          last_sync_at: string | null
          location_id: string | null
          organization_id: string
          sync_frequency: string | null
          updated_at: string | null
        }
        Insert: {
          api_key: string
          auto_sync?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_sync_at?: string | null
          location_id?: string | null
          organization_id: string
          sync_frequency?: string | null
          updated_at?: string | null
        }
        Update: {
          api_key?: string
          auto_sync?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_sync_at?: string | null
          location_id?: string | null
          organization_id?: string
          sync_frequency?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seven_shifts_integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_time: number | null
          assignee_id: string | null
          completed: boolean
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string
          estimated_time: number
          id: string
          notes: string | null
          organization_id: string
          priority: string
          recipe_id: string | null
          station: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_time?: number | null
          assignee_id?: string | null
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date: string
          estimated_time?: number
          id?: string
          notes?: string | null
          organization_id: string
          priority?: string
          recipe_id?: string | null
          station?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_time?: number | null
          assignee_id?: string | null
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string
          estimated_time?: number
          id?: string
          notes?: string | null
          organization_id?: string
          priority?: string
          recipe_id?: string | null
          station?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "organization_team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_with_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      umbrella_ingredient_master_ingredients: {
        Row: {
          created_at: string | null
          master_ingredient_id: string
          umbrella_ingredient_id: string
        }
        Insert: {
          created_at?: string | null
          master_ingredient_id: string
          umbrella_ingredient_id: string
        }
        Update: {
          created_at?: string | null
          master_ingredient_id?: string
          umbrella_ingredient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "umbrella_ingredient_master_ingredie_umbrella_ingredient_id_fkey"
            columns: ["umbrella_ingredient_id"]
            isOneToOne: false
            referencedRelation: "umbrella_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umbrella_ingredient_master_ingredie_umbrella_ingredient_id_fkey"
            columns: ["umbrella_ingredient_id"]
            isOneToOne: false
            referencedRelation: "umbrella_ingredients_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umbrella_ingredient_master_ingredient_master_ingredient_id_fkey"
            columns: ["master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umbrella_ingredient_master_ingredient_master_ingredient_id_fkey"
            columns: ["master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients_with_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      umbrella_ingredients: {
        Row: {
          allergen_celery: boolean
          allergen_citrus: boolean
          allergen_crustacean: boolean
          allergen_custom1_active: boolean | null
          allergen_custom1_name: string | null
          allergen_custom2_active: boolean | null
          allergen_custom2_name: string | null
          allergen_custom3_active: boolean | null
          allergen_custom3_name: string | null
          allergen_egg: boolean
          allergen_fish: boolean
          allergen_garlic: boolean
          allergen_gluten: boolean
          allergen_hot_pepper: boolean
          allergen_milk: boolean
          allergen_mushroom: boolean
          allergen_mustard: boolean
          allergen_nitrite: boolean
          allergen_notes: string | null
          allergen_onion: boolean
          allergen_peanut: boolean
          allergen_pork: boolean
          allergen_sesame: boolean
          allergen_shellfish: boolean
          allergen_soy: boolean
          allergen_sulphite: boolean
          allergen_treenut: boolean
          allergen_wheat: boolean
          category: string | null
          cost_per_recipe_unit: number | null
          created_at: string | null
          description: string | null
          id: string
          major_group: string | null
          name: string
          organization_id: string
          primary_master_ingredient_id: string | null
          recipe_unit_type: string | null
          storage_area: string | null
          sub_category: string | null
          updated_at: string | null
        }
        Insert: {
          allergen_celery?: boolean
          allergen_citrus?: boolean
          allergen_crustacean?: boolean
          allergen_custom1_active?: boolean | null
          allergen_custom1_name?: string | null
          allergen_custom2_active?: boolean | null
          allergen_custom2_name?: string | null
          allergen_custom3_active?: boolean | null
          allergen_custom3_name?: string | null
          allergen_egg?: boolean
          allergen_fish?: boolean
          allergen_garlic?: boolean
          allergen_gluten?: boolean
          allergen_hot_pepper?: boolean
          allergen_milk?: boolean
          allergen_mushroom?: boolean
          allergen_mustard?: boolean
          allergen_nitrite?: boolean
          allergen_notes?: string | null
          allergen_onion?: boolean
          allergen_peanut?: boolean
          allergen_pork?: boolean
          allergen_sesame?: boolean
          allergen_shellfish?: boolean
          allergen_soy?: boolean
          allergen_sulphite?: boolean
          allergen_treenut?: boolean
          allergen_wheat?: boolean
          category?: string | null
          cost_per_recipe_unit?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          major_group?: string | null
          name: string
          organization_id: string
          primary_master_ingredient_id?: string | null
          recipe_unit_type?: string | null
          storage_area?: string | null
          sub_category?: string | null
          updated_at?: string | null
        }
        Update: {
          allergen_celery?: boolean
          allergen_citrus?: boolean
          allergen_crustacean?: boolean
          allergen_custom1_active?: boolean | null
          allergen_custom1_name?: string | null
          allergen_custom2_active?: boolean | null
          allergen_custom2_name?: string | null
          allergen_custom3_active?: boolean | null
          allergen_custom3_name?: string | null
          allergen_egg?: boolean
          allergen_fish?: boolean
          allergen_garlic?: boolean
          allergen_gluten?: boolean
          allergen_hot_pepper?: boolean
          allergen_milk?: boolean
          allergen_mushroom?: boolean
          allergen_mustard?: boolean
          allergen_nitrite?: boolean
          allergen_notes?: string | null
          allergen_onion?: boolean
          allergen_peanut?: boolean
          allergen_pork?: boolean
          allergen_sesame?: boolean
          allergen_shellfish?: boolean
          allergen_soy?: boolean
          allergen_sulphite?: boolean
          allergen_treenut?: boolean
          allergen_wheat?: boolean
          category?: string | null
          cost_per_recipe_unit?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          major_group?: string | null
          name?: string
          organization_id?: string
          primary_master_ingredient_id?: string | null
          recipe_unit_type?: string | null
          storage_area?: string | null
          sub_category?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "umbrella_ingredients_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "food_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umbrella_ingredients_major_group_fkey"
            columns: ["major_group"]
            isOneToOne: false
            referencedRelation: "food_category_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umbrella_ingredients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umbrella_ingredients_primary_master_ingredient_id_fkey"
            columns: ["primary_master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umbrella_ingredients_primary_master_ingredient_id_fkey"
            columns: ["primary_master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients_with_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umbrella_ingredients_sub_category_fkey"
            columns: ["sub_category"]
            isOneToOne: false
            referencedRelation: "food_sub_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_code_changes: {
        Row: {
          action: string | null
          created_at: string
          handled: boolean | null
          handled_at: string | null
          handled_by: string | null
          id: string
          ingredient_id: string | null
          invoice_date: string
          new_code: string
          notes: string | null
          old_code: string
          organization_id: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          action?: string | null
          created_at?: string
          handled?: boolean | null
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          ingredient_id?: string | null
          invoice_date: string
          new_code: string
          notes?: string | null
          old_code: string
          organization_id: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          action?: string | null
          created_at?: string
          handled?: boolean | null
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          ingredient_id?: string | null
          invoice_date?: string
          new_code?: string
          notes?: string | null
          old_code?: string
          organization_id?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_code_changes_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_code_changes_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients_with_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_code_changes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_current: boolean | null
          master_ingredient_id: string
          organization_id: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_current?: boolean | null
          master_ingredient_id: string
          organization_id: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_current?: boolean | null
          master_ingredient_id?: string
          organization_id?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_codes_master_ingredient_id_fkey"
            columns: ["master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_codes_master_ingredient_id_fkey"
            columns: ["master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients_with_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_codes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_imports: {
        Row: {
          created_at: string | null
          created_by: string | null
          file_name: string
          file_url: string | null
          id: string
          import_type: string
          items_count: number
          metadata: Json | null
          new_items: number
          organization_id: string
          price_changes: number
          status: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          file_name: string
          file_url?: string | null
          id?: string
          import_type: string
          items_count?: number
          metadata?: Json | null
          new_items?: number
          organization_id: string
          price_changes?: number
          status?: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          file_name?: string
          file_url?: string | null
          id?: string
          import_type?: string
          items_count?: number
          metadata?: Json | null
          new_items?: number
          organization_id?: string
          price_changes?: number
          status?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_imports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_invoice_items: {
        Row: {
          code_changed: boolean | null
          created_at: string
          id: string
          invoice_id: string
          last_ordered_date: string | null
          master_ingredient_id: string
          previous_code: string | null
          previous_unit_price: number | null
          price_change_percentage: number | null
          quantity: number
          total_price: number
          unit_price: number
          updated_at: string
          vendor_code: string
        }
        Insert: {
          code_changed?: boolean | null
          created_at?: string
          id?: string
          invoice_id: string
          last_ordered_date?: string | null
          master_ingredient_id: string
          previous_code?: string | null
          previous_unit_price?: number | null
          price_change_percentage?: number | null
          quantity: number
          total_price: number
          unit_price: number
          updated_at?: string
          vendor_code: string
        }
        Update: {
          code_changed?: boolean | null
          created_at?: string
          id?: string
          invoice_id?: string
          last_ordered_date?: string | null
          master_ingredient_id?: string
          previous_code?: string | null
          previous_unit_price?: number | null
          price_change_percentage?: number | null
          quantity?: number
          total_price?: number
          unit_price?: number
          updated_at?: string
          vendor_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "vendor_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_invoice_items_master_ingredient_id_fkey"
            columns: ["master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_invoice_items_master_ingredient_id_fkey"
            columns: ["master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients_with_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_invoices: {
        Row: {
          created_at: string
          id: string
          invoice_date: string
          invoice_number: string
          organization_id: string
          status: string
          total_amount: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_date: string
          invoice_number: string
          organization_id: string
          status?: string
          total_amount?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          organization_id?: string
          status?: string
          total_amount?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_price_changes: {
        Row: {
          approved: boolean | null
          approved_at: string | null
          approved_by: string | null
          change_percent: number | null
          created_at: string
          id: string
          ingredient_id: string
          invoice_date: string
          item_code: string | null
          new_price: number
          notes: string | null
          old_price: number
          organization_id: string
          percent_change: number
          rejected_at: string | null
          rejected_by: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          change_percent?: number | null
          created_at?: string
          id?: string
          ingredient_id: string
          invoice_date: string
          item_code?: string | null
          new_price: number
          notes?: string | null
          old_price: number
          organization_id: string
          percent_change: number
          rejected_at?: string | null
          rejected_by?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          change_percent?: number | null
          created_at?: string
          id?: string
          ingredient_id?: string
          invoice_date?: string
          item_code?: string | null
          new_price?: number
          notes?: string | null
          old_price?: number
          organization_id?: string
          percent_change?: number
          rejected_at?: string | null
          rejected_by?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_price_changes_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_price_changes_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients_with_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_price_changes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_price_history: {
        Row: {
          created_at: string | null
          created_by: string | null
          effective_date: string | null
          id: string
          invoice_id: string | null
          master_ingredient_id: string
          notes: string | null
          organization_id: string
          price: number
          vendor_code_id: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          id?: string
          invoice_id?: string | null
          master_ingredient_id: string
          notes?: string | null
          organization_id: string
          price: number
          vendor_code_id?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          id?: string
          invoice_id?: string | null
          master_ingredient_id?: string
          notes?: string | null
          organization_id?: string
          price?: number
          vendor_code_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_price_history_master_ingredient_id_fkey"
            columns: ["master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_price_history_master_ingredient_id_fkey"
            columns: ["master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients_with_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_price_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_price_history_vendor_code_id_fkey"
            columns: ["vendor_code_id"]
            isOneToOne: false
            referencedRelation: "current_vendor_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_price_history_vendor_code_id_fkey"
            columns: ["vendor_code_id"]
            isOneToOne: false
            referencedRelation: "vendor_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_templates: {
        Row: {
          column_mapping: Json | null
          created_at: string
          file_type: string
          id: string
          name: string
          ocr_regions: Json | null
          organization_id: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          column_mapping?: Json | null
          created_at?: string
          file_type: string
          id?: string
          name: string
          ocr_regions?: Json | null
          organization_id: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          column_mapping?: Json | null
          created_at?: string
          file_type?: string
          id?: string
          name?: string
          ocr_regions?: Json | null
          organization_id?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      code_alerts: {
        Row: {
          days_since_last_order: number | null
          ingredient_id: string | null
          ingredient_name: string | null
          last_ordered_date: string | null
          new_code: string | null
          old_code: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_invoice_items_master_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_invoice_items_master_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients_with_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      current_vendor_codes: {
        Row: {
          code: string | null
          created_at: string | null
          id: string | null
          ingredient_name: string | null
          master_ingredient_id: string | null
          organization_id: string | null
          updated_at: string | null
          vendor_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_codes_master_ingredient_id_fkey"
            columns: ["master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_codes_master_ingredient_id_fkey"
            columns: ["master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients_with_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_codes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      master_ingredients_with_categories: {
        Row: {
          allergen_celery: boolean | null
          allergen_citrus: boolean | null
          allergen_crustacean: boolean | null
          allergen_custom1_active: boolean | null
          allergen_custom1_name: string | null
          allergen_custom2_active: boolean | null
          allergen_custom2_name: string | null
          allergen_custom3_active: boolean | null
          allergen_custom3_name: string | null
          allergen_egg: boolean | null
          allergen_fish: boolean | null
          allergen_garlic: boolean | null
          allergen_gluten: boolean | null
          allergen_hot_pepper: boolean | null
          allergen_milk: boolean | null
          allergen_mushroom: boolean | null
          allergen_mustard: boolean | null
          allergen_nitrite: boolean | null
          allergen_notes: string | null
          allergen_onion: boolean | null
          allergen_peanut: boolean | null
          allergen_pork: boolean | null
          allergen_sesame: boolean | null
          allergen_shellfish: boolean | null
          allergen_soy: boolean | null
          allergen_sulphite: boolean | null
          allergen_treenut: boolean | null
          allergen_wheat: boolean | null
          case_size: string | null
          category: string | null
          category_name: string | null
          cost_per_recipe_unit: number | null
          created_at: string | null
          current_price: number | null
          id: string | null
          image_url: string | null
          item_code: string | null
          major_group: string | null
          major_group_name: string | null
          organization_id: string | null
          product: string | null
          recipe_unit_per_purchase_unit: number | null
          recipe_unit_type: string | null
          storage_area: string | null
          sub_category: string | null
          sub_category_name: string | null
          unit_of_measure: string | null
          units_per_case: string | null
          updated_at: string | null
          vendor: string | null
          vendor_codes: Json | null
          yield_percent: number | null
        }
        Relationships: [
          {
            foreignKeyName: "master_ingredients_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "food_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_ingredients_major_group_fkey"
            columns: ["major_group"]
            isOneToOne: false
            referencedRelation: "food_category_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_ingredients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_ingredients_sub_category_fkey"
            columns: ["sub_category"]
            isOneToOne: false
            referencedRelation: "food_sub_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alerts: {
        Row: {
          ingredient_id: string | null
          ingredient_name: string | null
          last_updated: string | null
          new_price: number | null
          old_price: number | null
          price_change_percentage: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_invoice_items_master_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_invoice_items_master_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients_with_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes_with_categories: {
        Row: {
          allergenInfo: Json | null
          approved_at: string | null
          approved_by: string | null
          category: string | null
          category_name: string | null
          container: string | null
          container_type: string | null
          cook_time: number | null
          cost_per_unit: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          equipment: Json | null
          id: string | null
          image_url: string | null
          ingredients: Json | null
          label_requirements: Json | null
          labor_cost_per_hour: number | null
          last_reviewed_at: string | null
          last_reviewed_by: string | null
          major_group: string | null
          major_group_name: string | null
          media: Json | null
          modified_by: string | null
          name: string | null
          organization_id: string | null
          prep_temp_notes: string | null
          prep_time: number | null
          prep_time_notes: string | null
          primary_station: string | null
          production_notes: string | null
          quality_standards: Json | null
          recipe_unit_ratio: string | null
          rest_time: number | null
          secondary_station: string | null
          secondary_stations: string[] | null
          shelf_life: string | null
          station: string | null
          station_name: string | null
          status: string | null
          steps: Json | null
          storage: Json | null
          storage_area: string | null
          sub_category: string | null
          sub_category_name: string | null
          target_cost_percent: number | null
          time_management_notes: string | null
          timeline_notes: string | null
          total_cost: number | null
          total_time: number | null
          training: Json | null
          type: string | null
          unit_type: string | null
          updated_at: string | null
          use_label_printer: boolean | null
          version: string | null
          versions: Json | null
          video_url: string | null
          yield_amount: number | null
          yield_unit: string | null
        }
        Relationships: []
      }
      umbrella_ingredients_with_details: {
        Row: {
          allergen_celery: boolean | null
          allergen_citrus: boolean | null
          allergen_crustacean: boolean | null
          allergen_custom1_active: boolean | null
          allergen_custom1_name: string | null
          allergen_custom2_active: boolean | null
          allergen_custom2_name: string | null
          allergen_custom3_active: boolean | null
          allergen_custom3_name: string | null
          allergen_egg: boolean | null
          allergen_fish: boolean | null
          allergen_garlic: boolean | null
          allergen_gluten: boolean | null
          allergen_hot_pepper: boolean | null
          allergen_milk: boolean | null
          allergen_mushroom: boolean | null
          allergen_mustard: boolean | null
          allergen_nitrite: boolean | null
          allergen_notes: string | null
          allergen_onion: boolean | null
          allergen_peanut: boolean | null
          allergen_pork: boolean | null
          allergen_sesame: boolean | null
          allergen_shellfish: boolean | null
          allergen_soy: boolean | null
          allergen_sulphite: boolean | null
          allergen_treenut: boolean | null
          allergen_wheat: boolean | null
          category: string | null
          category_name: string | null
          cost_per_recipe_unit: number | null
          created_at: string | null
          description: string | null
          id: string | null
          major_group: string | null
          major_group_name: string | null
          master_ingredients: string[] | null
          name: string | null
          organization_id: string | null
          primary_master_ingredient_id: string | null
          recipe_unit_type: string | null
          storage_area: string | null
          sub_category: string | null
          sub_category_name: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "umbrella_ingredients_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "food_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umbrella_ingredients_major_group_fkey"
            columns: ["major_group"]
            isOneToOne: false
            referencedRelation: "food_category_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umbrella_ingredients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umbrella_ingredients_primary_master_ingredient_id_fkey"
            columns: ["primary_master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umbrella_ingredients_primary_master_ingredient_id_fkey"
            columns: ["primary_master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients_with_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umbrella_ingredients_sub_category_fkey"
            columns: ["sub_category"]
            isOneToOne: false
            referencedRelation: "food_sub_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_price_trends: {
        Row: {
          effective_date: string | null
          ingredient_name: string | null
          master_ingredient_id: string | null
          organization_id: string | null
          previous_price: number | null
          price: number | null
          price_change_percent: number | null
          vendor_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_price_history_master_ingredient_id_fkey"
            columns: ["master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_price_history_master_ingredient_id_fkey"
            columns: ["master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients_with_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_price_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_unique_item_code: {
        Args: {
          org_id: string
          base_code: string
        }
        Returns: string
      }
      update_vendor_price_changes_invoice_dates: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      activity_type:
        | "login"
        | "logout"
        | "recipe_created"
        | "recipe_updated"
        | "recipe_deleted"
        | "inventory_updated"
        | "team_member_added"
        | "team_member_updated"
        | "team_member_removed"
        | "role_changed"
        | "settings_updated"
        | "task_created"
        | "task_updated"
        | "task_deleted"
        | "task_completed"
        | "task_assigned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
