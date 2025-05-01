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
          acknowledged_by: Json | null
          activity_type: string
          created_at: string
          details: Json | null
          id: string
          metadata: Json | null
          organization_id: string
          user_id: string
        }
        Insert: {
          acknowledged_by?: Json | null
          activity_type: string
          created_at?: string
          details?: Json | null
          id?: string
          metadata?: Json | null
          organization_id: string
          user_id: string
        }
        Update: {
          acknowledged_by?: Json | null
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
          archived: boolean | null
          case_size: string | null
          category: string | null
          cost_per_recipe_unit: number
          created_at: string
          current_price: number
          id: string
          image_url: string | null
          inventory_unit_cost: number | null
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
          archived?: boolean | null
          case_size?: string | null
          category?: string | null
          cost_per_recipe_unit?: number
          created_at?: string
          current_price?: number
          id?: string
          image_url?: string | null
          inventory_unit_cost?: number | null
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
          archived?: boolean | null
          case_size?: string | null
          category?: string | null
          cost_per_recipe_unit?: number
          created_at?: string
          current_price?: number
          id?: string
          image_url?: string | null
          inventory_unit_cost?: number | null
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
      prep_list_template_tasks: {
        Row: {
          amount_required: number | null
          assignee_id: string | null
          assignee_station: string | null
          assignment_type: string | null
          auto_advance: boolean | null
          case_size: string | null
          cases: number | null
          completed_at: string | null
          created_at: string
          current_level: number | null
          description: string | null
          due_date: string | null
          estimated_time: number | null
          id: string
          kitchen_role: string | null
          kitchen_station: string | null
          lottery: boolean | null
          master_ingredient_id: string | null
          master_ingredient_name: string | null
          measurement_type: string | null
          on_hand: number | null
          organization_id: string | null
          par_level: number | null
          paused_at: string | null
          prep_item_id: string | null
          prep_system: string | null
          prep_unit_measure: string | null
          priority: string | null
          quantity: number | null
          recipe_id: string | null
          required: boolean
          schedule_days: number[] | null
          sequence: number
          started_at: string | null
          station: string | null
          status: string | null
          stopped_at: string | null
          storage_area: string | null
          team_member_role: string | null
          template_id: string
          title: string
          total_pause_time: number | null
          unit: string | null
          unit_of_measure: string | null
          units: number | null
          units_per_case: string | null
          updated_at: string
        }
        Insert: {
          amount_required?: number | null
          assignee_id?: string | null
          assignee_station?: string | null
          assignment_type?: string | null
          auto_advance?: boolean | null
          case_size?: string | null
          cases?: number | null
          completed_at?: string | null
          created_at?: string
          current_level?: number | null
          description?: string | null
          due_date?: string | null
          estimated_time?: number | null
          id?: string
          kitchen_role?: string | null
          kitchen_station?: string | null
          lottery?: boolean | null
          master_ingredient_id?: string | null
          master_ingredient_name?: string | null
          measurement_type?: string | null
          on_hand?: number | null
          organization_id?: string | null
          par_level?: number | null
          paused_at?: string | null
          prep_item_id?: string | null
          prep_system?: string | null
          prep_unit_measure?: string | null
          priority?: string | null
          quantity?: number | null
          recipe_id?: string | null
          required?: boolean
          schedule_days?: number[] | null
          sequence: number
          started_at?: string | null
          station?: string | null
          status?: string | null
          stopped_at?: string | null
          storage_area?: string | null
          team_member_role?: string | null
          template_id: string
          title: string
          total_pause_time?: number | null
          unit?: string | null
          unit_of_measure?: string | null
          units?: number | null
          units_per_case?: string | null
          updated_at?: string
        }
        Update: {
          amount_required?: number | null
          assignee_id?: string | null
          assignee_station?: string | null
          assignment_type?: string | null
          auto_advance?: boolean | null
          case_size?: string | null
          cases?: number | null
          completed_at?: string | null
          created_at?: string
          current_level?: number | null
          description?: string | null
          due_date?: string | null
          estimated_time?: number | null
          id?: string
          kitchen_role?: string | null
          kitchen_station?: string | null
          lottery?: boolean | null
          master_ingredient_id?: string | null
          master_ingredient_name?: string | null
          measurement_type?: string | null
          on_hand?: number | null
          organization_id?: string | null
          par_level?: number | null
          paused_at?: string | null
          prep_item_id?: string | null
          prep_system?: string | null
          prep_unit_measure?: string | null
          priority?: string | null
          quantity?: number | null
          recipe_id?: string | null
          required?: boolean
          schedule_days?: number[] | null
          sequence?: number
          started_at?: string | null
          station?: string | null
          status?: string | null
          stopped_at?: string | null
          storage_area?: string | null
          team_member_role?: string | null
          template_id?: string
          title?: string
          total_pause_time?: number | null
          unit?: string | null
          unit_of_measure?: string | null
          units?: number | null
          units_per_case?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prep_list_template_tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "organization_team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_list_template_tasks_master_ingredient_id_fkey"
            columns: ["master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_list_template_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_list_template_tasks_prep_item_id_fkey"
            columns: ["prep_item_id"]
            isOneToOne: false
            referencedRelation: "prepared_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_list_template_tasks_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_list_template_tasks_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_with_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_list_template_tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "prep_list_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      prep_list_templates: {
        Row: {
          advance_days: number | null
          auto_advance: boolean | null
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          kitchen_role: string | null
          kitchen_stations: string[] | null
          master_ingredient_id: string | null
          organization_id: string
          par_levels: Json | null
          prep_system: string
          recipe_id: string | null
          schedule_days: number[] | null
          station: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          advance_days?: number | null
          auto_advance?: boolean | null
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          kitchen_role?: string | null
          kitchen_stations?: string[] | null
          master_ingredient_id?: string | null
          organization_id: string
          par_levels?: Json | null
          prep_system: string
          recipe_id?: string | null
          schedule_days?: number[] | null
          station?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          advance_days?: number | null
          auto_advance?: boolean | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          kitchen_role?: string | null
          kitchen_stations?: string[] | null
          master_ingredient_id?: string | null
          organization_id?: string
          par_levels?: Json | null
          prep_system?: string
          recipe_id?: string | null
          schedule_days?: number[] | null
          station?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prep_list_templates_master_ingredient_id_fkey"
            columns: ["master_ingredient_id"]
            isOneToOne: false
            referencedRelation: "master_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_list_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_list_templates_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_list_templates_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes_with_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      prep_lists: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          id: string
          inventory_snapshot: Json | null
          kitchen_stations: string[] | null
          notes: string | null
          organization_id: string
          prep_system: string
          scheduled_for: string | null
          status: string
          template_id: string | null
          template_ids: string[] | null
          title: string
          updated_at: string
          viewer_team_members: string[] | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          description?: string | null
          id?: string
          inventory_snapshot?: Json | null
          kitchen_stations?: string[] | null
          notes?: string | null
          organization_id: string
          prep_system: string
          scheduled_for?: string | null
          status: string
          template_id?: string | null
          template_ids?: string[] | null
          title: string
          updated_at?: string
          viewer_team_members?: string[] | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          inventory_snapshot?: Json | null
          kitchen_stations?: string[] | null
          notes?: string | null
          organization_id?: string
          prep_system?: string
          scheduled_for?: string | null
          status?: string
          template_id?: string | null
          template_ids?: string[] | null
          title?: string
          updated_at?: string
          viewer_team_members?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "prep_lists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prep_lists_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "prep_list_templates"
            referencedColumns: ["id"]
          },
        ]
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
          stages: Json | null
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
          stages?: Json | null
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
          stages?: Json | null
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
          archived: boolean | null
          case_size: string | null
          category: string | null
          category_name: string | null
          cost_per_recipe_unit: number | null
          created_at: string | null
          current_price: number | null
          id: string | null
          image_url: string | null
          ingredient_type: string | null
          inventory_unit_cost: number | null
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
        Relationships: []
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
          created_by_email: string | null
          created_by_name: string | null
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
          modified_by_email: string | null
          modified_by_name: string | null
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
          stages: Json | null
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
      extract_numeric: {
        Args: { text_val: string }
        Returns: number
      }
      generate_unique_item_code: {
        Args: { org_id: string; base_code: string }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "login",
        "logout",
        "recipe_created",
        "recipe_updated",
        "recipe_deleted",
        "inventory_updated",
        "team_member_added",
        "team_member_updated",
        "team_member_removed",
        "role_changed",
        "settings_updated",
        "task_created",
        "task_updated",
        "task_deleted",
        "task_completed",
        "task_assigned",
      ],
    },
  },
} as const
