export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      accommodation_options: {
        Row: {
          amenities: string[]
          capacity_desc: string
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_available: boolean
          is_published: boolean
          name: string
          price_estimate: string | null
          rooms_count: number | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          amenities?: string[]
          capacity_desc?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_published?: boolean
          name: string
          price_estimate?: string | null
          rooms_count?: number | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          amenities?: string[]
          capacity_desc?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_published?: boolean
          name?: string
          price_estimate?: string | null
          rooms_count?: number | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      catering_services: {
        Row: {
          created_at: string
          description: string
          id: string
          ideal_for: string
          image_url: string | null
          includes: string[]
          is_published: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          ideal_for?: string
          image_url?: string | null
          includes?: string[]
          is_published?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          ideal_for?: string
          image_url?: string | null
          includes?: string[]
          is_published?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string
          end_time: string | null
          event_date: string
          id: string
          image_url: string | null
          is_published: boolean
          location: string
          registration_open: boolean
          slug: string
          sort_order: number
          start_time: string | null
          time_label: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          end_time?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          location?: string
          registration_open?: boolean
          slug: string
          sort_order?: number
          start_time?: string | null
          time_label?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          end_time?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          location?: string
          registration_open?: boolean
          slug?: string
          sort_order?: number
          start_time?: string | null
          time_label?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      facilities: {
        Row: {
          capacity_max: number
          capacity_min: number
          created_at: string
          description: string
          features: string[]
          id: string
          image_url: string | null
          is_published: boolean
          name: string
          price_kes: number | null
          price_note: string | null
          seating_styles: string[]
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          capacity_max: number
          capacity_min: number
          created_at?: string
          description?: string
          features?: string[]
          id?: string
          image_url?: string | null
          is_published?: boolean
          name: string
          price_kes?: number | null
          price_note?: string | null
          seating_styles?: string[]
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          capacity_max?: number
          capacity_min?: number
          created_at?: string
          description?: string
          features?: string[]
          id?: string
          image_url?: string | null
          is_published?: boolean
          name?: string
          price_kes?: number | null
          price_note?: string | null
          seating_styles?: string[]
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      facility_bookings: {
        Row: {
          booking_date: string
          client_name: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          facility_id: string
          id: string
          inquiry_id: string | null
          internal_note: string | null
          public_note: string | null
          status: Database["public"]["Enums"]["availability_status"]
          time_slot: Database["public"]["Enums"]["time_slot"]
          updated_at: string
        }
        Insert: {
          booking_date: string
          client_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          facility_id: string
          id?: string
          inquiry_id?: string | null
          internal_note?: string | null
          public_note?: string | null
          status: Database["public"]["Enums"]["availability_status"]
          time_slot?: Database["public"]["Enums"]["time_slot"]
          updated_at?: string
        }
        Update: {
          booking_date?: string
          client_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          facility_id?: string
          id?: string
          inquiry_id?: string | null
          internal_note?: string | null
          public_note?: string | null
          status?: Database["public"]["Enums"]["availability_status"]
          time_slot?: Database["public"]["Enums"]["time_slot"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_bookings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_bookings_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_bookings_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      formation_programs: {
        Row: {
          created_at: string
          description: string
          duration: string
          fee_kes: number | null
          fee_note: string | null
          id: string
          image_url: string | null
          is_published: boolean
          requirements: string[]
          schedule: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          duration?: string
          fee_kes?: number | null
          fee_note?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          requirements?: string[]
          schedule?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          duration?: string
          fee_kes?: number | null
          fee_note?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          requirements?: string[]
          schedule?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          caption: string
          category: Database["public"]["Enums"]["gallery_category"]
          created_at: string
          id: string
          image_url: string
          is_published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          caption?: string
          category: Database["public"]["Enums"]["gallery_category"]
          created_at?: string
          id?: string
          image_url: string
          is_published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          caption?: string
          category?: Database["public"]["Enums"]["gallery_category"]
          created_at?: string
          id?: string
          image_url?: string
          is_published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          accommodation_id: string | null
          additional_requirements: string | null
          assigned_to: string | null
          attendees_count: number | null
          catering_service_id: string | null
          check_in_date: string | null
          check_out_date: string | null
          created_at: string
          email: string
          end_time: string | null
          event_date: string | null
          event_id: string | null
          event_nature: string | null
          facility_id: string | null
          formation_id: string | null
          full_name: string
          guests_count: number | null
          id: string
          message: string
          organization: string | null
          participants_count: number | null
          phone: string
          preferred_date: string | null
          product_id: string | null
          product_quantity: number | null
          reference_code: string
          responded_at: string | null
          retreat_format: string | null
          retreat_id: string | null
          seating_arrangement: string | null
          source: string
          start_time: string | null
          status: Database["public"]["Enums"]["inquiry_status"]
          subject: string | null
          time_slot: Database["public"]["Enums"]["time_slot"] | null
          type: Database["public"]["Enums"]["inquiry_type"]
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          accommodation_id?: string | null
          additional_requirements?: string | null
          assigned_to?: string | null
          attendees_count?: number | null
          catering_service_id?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string
          email: string
          end_time?: string | null
          event_date?: string | null
          event_id?: string | null
          event_nature?: string | null
          facility_id?: string | null
          formation_id?: string | null
          full_name: string
          guests_count?: number | null
          id?: string
          message?: string
          organization?: string | null
          participants_count?: number | null
          phone: string
          preferred_date?: string | null
          product_id?: string | null
          product_quantity?: number | null
          reference_code: string
          responded_at?: string | null
          retreat_format?: string | null
          retreat_id?: string | null
          seating_arrangement?: string | null
          source?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          subject?: string | null
          time_slot?: Database["public"]["Enums"]["time_slot"] | null
          type: Database["public"]["Enums"]["inquiry_type"]
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          accommodation_id?: string | null
          additional_requirements?: string | null
          assigned_to?: string | null
          attendees_count?: number | null
          catering_service_id?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string
          email?: string
          end_time?: string | null
          event_date?: string | null
          event_id?: string | null
          event_nature?: string | null
          facility_id?: string | null
          formation_id?: string | null
          full_name?: string
          guests_count?: number | null
          id?: string
          message?: string
          organization?: string | null
          participants_count?: number | null
          phone?: string
          preferred_date?: string | null
          product_id?: string | null
          product_quantity?: number | null
          reference_code?: string
          responded_at?: string | null
          retreat_format?: string | null
          retreat_id?: string | null
          seating_arrangement?: string | null
          source?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          subject?: string | null
          time_slot?: Database["public"]["Enums"]["time_slot"] | null
          type?: Database["public"]["Enums"]["inquiry_type"]
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodation_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_catering_service_id_fkey"
            columns: ["catering_service_id"]
            isOneToOne: false
            referencedRelation: "catering_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formation_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_retreat_id_fkey"
            columns: ["retreat_id"]
            isOneToOne: false
            referencedRelation: "retreats"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry_activity: {
        Row: {
          author_id: string | null
          body: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["inquiry_status"] | null
          id: string
          inquiry_id: string
          kind: Database["public"]["Enums"]["inquiry_activity_kind"]
          to_status: Database["public"]["Enums"]["inquiry_status"] | null
        }
        Insert: {
          author_id?: string | null
          body?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["inquiry_status"] | null
          id?: string
          inquiry_id: string
          kind: Database["public"]["Enums"]["inquiry_activity_kind"]
          to_status?: Database["public"]["Enums"]["inquiry_status"] | null
        }
        Update: {
          author_id?: string | null
          body?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["inquiry_status"] | null
          id?: string
          inquiry_id?: string
          kind?: Database["public"]["Enums"]["inquiry_activity_kind"]
          to_status?: Database["public"]["Enums"]["inquiry_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_activity_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_activity_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      laundry_services: {
        Row: {
          created_at: string
          description: string
          id: string
          is_available: boolean
          is_published: boolean
          notes: string
          sort_order: number
          title: string
          turnaround_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_available?: boolean
          is_published?: boolean
          notes?: string
          sort_order?: number
          title: string
          turnaround_time?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_available?: boolean
          is_published?: boolean
          notes?: string
          sort_order?: number
          title?: string
          turnaround_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      mass_schedules: {
        Row: {
          celebration_type: string
          created_at: string
          day_label: string
          description: string
          id: string
          is_published: boolean
          is_special: boolean
          location: string
          sort_order: number
          time_label: string
          updated_at: string
        }
        Insert: {
          celebration_type: string
          created_at?: string
          day_label: string
          description?: string
          id?: string
          is_published?: boolean
          is_special?: boolean
          location?: string
          sort_order?: number
          time_label: string
          updated_at?: string
        }
        Update: {
          celebration_type?: string
          created_at?: string
          day_label?: string
          description?: string
          id?: string
          is_published?: boolean
          is_special?: boolean
          location?: string
          sort_order?: number
          time_label?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_available: boolean
          is_featured: boolean
          is_published: boolean
          name: string
          price_kes: number | null
          sku: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          is_published?: boolean
          name: string
          price_kes?: number | null
          sku: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          is_published?: boolean
          name?: string
          price_kes?: number | null
          sku?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      retreats: {
        Row: {
          category: Database["public"]["Enums"]["retreat_category"]
          created_at: string
          description: string
          duration: string
          end_date: string | null
          fee_kes: number | null
          fee_note: string | null
          id: string
          image_url: string | null
          is_published: boolean
          requirements: string[]
          slug: string
          sort_order: number
          start_date: string | null
          target_audience: string
          title: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["retreat_category"]
          created_at?: string
          description?: string
          duration?: string
          end_date?: string | null
          fee_kes?: number | null
          fee_note?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          requirements?: string[]
          slug: string
          sort_order?: number
          start_date?: string | null
          target_audience?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["retreat_category"]
          created_at?: string
          description?: string
          duration?: string
          end_date?: string | null
          fee_kes?: number | null
          fee_note?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          requirements?: string[]
          slug?: string
          sort_order?: number
          start_date?: string | null
          target_audience?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string
          core_values: Json
          daily_mass_time: string
          diocese: string
          email: string
          founded_on: string | null
          id: number
          location: string
          map_embed_url: string | null
          map_link_url: string | null
          mission: string | null
          name: string
          office_hours: string
          philosophy: string | null
          phone: string
          phone_display: string
          short_name: string
          social: Json
          updated_at: string
          vision: string | null
          whatsapp_message: string
          whatsapp_number: string
        }
        Insert: {
          address: string
          core_values?: Json
          daily_mass_time?: string
          diocese: string
          email: string
          founded_on?: string | null
          id?: number
          location: string
          map_embed_url?: string | null
          map_link_url?: string | null
          mission?: string | null
          name: string
          office_hours?: string
          philosophy?: string | null
          phone: string
          phone_display: string
          short_name?: string
          social?: Json
          updated_at?: string
          vision?: string | null
          whatsapp_message?: string
          whatsapp_number: string
        }
        Update: {
          address?: string
          core_values?: Json
          daily_mass_time?: string
          diocese?: string
          email?: string
          founded_on?: string | null
          id?: number
          location?: string
          map_embed_url?: string | null
          map_link_url?: string | null
          mission?: string | null
          name?: string
          office_hours?: string
          philosophy?: string | null
          phone?: string
          phone_display?: string
          short_name?: string
          social?: Json
          updated_at?: string
          vision?: string | null
          whatsapp_message?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["staff_role"]
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          role: Database["public"]["Enums"]["staff_role"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage: { Args: { area: string }; Returns: boolean }
      convert_inquiry_to_booking: {
        Args: {
          p_booking_date: string
          p_facility_id: string
          p_inquiry_id: string
          p_status?: Database["public"]["Enums"]["availability_status"]
          p_time_slot?: Database["public"]["Enums"]["time_slot"]
        }
        Returns: string
      }
      current_staff_role: {
        Args: never
        Returns: Database["public"]["Enums"]["staff_role"]
      }
      get_facility_availability: {
        Args: { p_from: string; p_to: string }
        Returns: {
          booking_date: string
          facility_id: string
          status: Database["public"]["Enums"]["availability_status"]
          time_slot: Database["public"]["Enums"]["time_slot"]
        }[]
      }
      inquiry_visible: {
        Args: { t: Database["public"]["Enums"]["inquiry_type"] }
        Returns: boolean
      }
      is_staff: { Args: never; Returns: boolean }
      submit_inquiry: { Args: { payload: Json }; Returns: Json }
    }
    Enums: {
      availability_status: "PENDING" | "BOOKED" | "BLOCKED"
      gallery_category:
        | "Facilities"
        | "Accommodation"
        | "Catering"
        | "Catholic Ministry"
        | "Events"
        | "Grounds"
      inquiry_activity_kind:
        | "note"
        | "status_change"
        | "assignment"
        | "booking_created"
      inquiry_status:
        | "New"
        | "In Progress"
        | "Responded"
        | "Completed"
        | "Cancelled"
      inquiry_type:
        | "conference"
        | "accommodation"
        | "catering"
        | "retreat"
        | "formation"
        | "product"
        | "event"
        | "general"
      retreat_category: "individual" | "group" | "seminar" | "youth" | "clergy"
      staff_role:
        | "primary_admin"
        | "hospitality_editor"
        | "ministry_editor"
        | "products_editor"
      time_slot: "FULL_DAY" | "MORNING" | "AFTERNOON" | "EVENING"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      availability_status: ["PENDING", "BOOKED", "BLOCKED"],
      gallery_category: [
        "Facilities",
        "Accommodation",
        "Catering",
        "Catholic Ministry",
        "Events",
        "Grounds",
      ],
      inquiry_activity_kind: [
        "note",
        "status_change",
        "assignment",
        "booking_created",
      ],
      inquiry_status: [
        "New",
        "In Progress",
        "Responded",
        "Completed",
        "Cancelled",
      ],
      inquiry_type: [
        "conference",
        "accommodation",
        "catering",
        "retreat",
        "formation",
        "product",
        "event",
        "general",
      ],
      retreat_category: ["individual", "group", "seminar", "youth", "clergy"],
      staff_role: [
        "primary_admin",
        "hospitality_editor",
        "ministry_editor",
        "products_editor",
      ],
      time_slot: ["FULL_DAY", "MORNING", "AFTERNOON", "EVENING"],
    },
  },
} as const
