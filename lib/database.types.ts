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
      admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      author_profile: {
        Row: {
          bio_en: string | null
          bio_hi: string | null
          created_at: string
          email: string | null
          id: boolean
          intro_en: string | null
          intro_hi: string | null
          photo_path: string | null
          quote_en: string | null
          quote_hi: string | null
          social_links: Json
          tagline_en: string | null
          tagline_hi: string | null
          updated_at: string
        }
        Insert: {
          bio_en?: string | null
          bio_hi?: string | null
          created_at?: string
          email?: string | null
          id?: boolean
          intro_en?: string | null
          intro_hi?: string | null
          photo_path?: string | null
          quote_en?: string | null
          quote_hi?: string | null
          social_links?: Json
          tagline_en?: string | null
          tagline_hi?: string | null
          updated_at?: string
        }
        Update: {
          bio_en?: string | null
          bio_hi?: string | null
          created_at?: string
          email?: string | null
          id?: boolean
          intro_en?: string | null
          intro_hi?: string | null
          photo_path?: string | null
          quote_en?: string | null
          quote_hi?: string | null
          social_links?: Json
          tagline_en?: string | null
          tagline_hi?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      awards: {
        Row: {
          created_at: string
          featured: boolean
          id: string
          organiser_en: string | null
          organiser_hi: string | null
          sort_order: number
          title_en: string | null
          title_hi: string
          updated_at: string
          visible: boolean
          year: number | null
        }
        Insert: {
          created_at?: string
          featured?: boolean
          id?: string
          organiser_en?: string | null
          organiser_hi?: string | null
          sort_order?: number
          title_en?: string | null
          title_hi: string
          updated_at?: string
          visible?: boolean
          year?: number | null
        }
        Update: {
          created_at?: string
          featured?: boolean
          id?: string
          organiser_en?: string | null
          organiser_hi?: string | null
          sort_order?: number
          title_en?: string | null
          title_hi?: string
          updated_at?: string
          visible?: boolean
          year?: number | null
        }
        Relationships: []
      }
      genres: {
        Row: {
          created_at: string
          id: string
          name_en: string | null
          name_hi: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_hi: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_hi?: string
          slug?: string
        }
        Relationships: []
      }
      platforms: {
        Row: {
          created_at: string
          description_en: string | null
          description_hi: string | null
          id: string
          logo_path: string | null
          name_en: string | null
          name_hi: string
          profile_url: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_hi?: string | null
          id?: string
          logo_path?: string | null
          name_en?: string | null
          name_hi: string
          profile_url?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_hi?: string | null
          id?: string
          logo_path?: string | null
          name_en?: string | null
          name_hi?: string
          profile_url?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      releases: {
        Row: {
          chapter_count: number | null
          created_at: string
          format: Database["public"]["Enums"]["release_format"]
          id: string
          isbn: string | null
          narrator: string | null
          platform_id: string
          publisher: string | null
          released_on: string | null
          updated_at: string
          url: string
          work_id: string
        }
        Insert: {
          chapter_count?: number | null
          created_at?: string
          format: Database["public"]["Enums"]["release_format"]
          id?: string
          isbn?: string | null
          narrator?: string | null
          platform_id: string
          publisher?: string | null
          released_on?: string | null
          updated_at?: string
          url: string
          work_id: string
        }
        Update: {
          chapter_count?: number | null
          created_at?: string
          format?: Database["public"]["Enums"]["release_format"]
          id?: string
          isbn?: string | null
          narrator?: string | null
          platform_id?: string
          publisher?: string | null
          released_on?: string | null
          updated_at?: string
          url?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "releases_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "releases_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      work_genres: {
        Row: {
          genre_id: string
          work_id: string
        }
        Insert: {
          genre_id: string
          work_id: string
        }
        Update: {
          genre_id?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_genres_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      work_members: {
        Row: {
          child_id: string
          parent_id: string
          position: number
        }
        Insert: {
          child_id: string
          parent_id: string
          position?: number
        }
        Update: {
          child_id?: string
          parent_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "work_members_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_members_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      works: {
        Row: {
          contributors_total: number | null
          cover_path: string | null
          created_at: string
          editor: string | null
          excerpt_hi: string | null
          featured: boolean
          featured_contributors: string[]
          id: string
          kind: Database["public"]["Enums"]["work_kind"]
          published_on: string | null
          search_text: string | null
          slug: string
          status: Database["public"]["Enums"]["work_status"]
          synopsis_en: string | null
          synopsis_hi: string | null
          title_en: string | null
          title_hi: string
          updated_at: string
        }
        Insert: {
          contributors_total?: number | null
          cover_path?: string | null
          created_at?: string
          editor?: string | null
          excerpt_hi?: string | null
          featured?: boolean
          featured_contributors?: string[]
          id?: string
          kind: Database["public"]["Enums"]["work_kind"]
          published_on?: string | null
          search_text?: string | null
          slug: string
          status?: Database["public"]["Enums"]["work_status"]
          synopsis_en?: string | null
          synopsis_hi?: string | null
          title_en?: string | null
          title_hi: string
          updated_at?: string
        }
        Update: {
          contributors_total?: number | null
          cover_path?: string | null
          created_at?: string
          editor?: string | null
          excerpt_hi?: string | null
          featured?: boolean
          featured_contributors?: string[]
          id?: string
          kind?: Database["public"]["Enums"]["work_kind"]
          published_on?: string | null
          search_text?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["work_status"]
          synopsis_en?: string | null
          synopsis_hi?: string | null
          title_en?: string | null
          title_hi?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_published_work: { Args: { work: string }; Returns: boolean }
      normalize_search_text: { Args: { input: string }; Returns: string }
    }
    Enums: {
      release_format: "online" | "audiobook" | "print" | "ebook"
      work_kind:
        | "poem"
        | "story"
        | "novel"
        | "series"
        | "collection"
        | "anthology"
      work_status: "draft" | "published"
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
      release_format: ["online", "audiobook", "print", "ebook"],
      work_kind: [
        "poem",
        "story",
        "novel",
        "series",
        "collection",
        "anthology",
      ],
      work_status: ["draft", "published"],
    },
  },
} as const
