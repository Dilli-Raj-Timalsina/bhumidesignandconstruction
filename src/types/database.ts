/**
 * Supabase database types for the Bhumi CMS.
 *
 * Keep this file aligned with `supabase/migrations`. It is deliberately kept
 * local instead of relying on untyped query results during early development.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_path: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_path?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_path?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          settings_key: string;
          company_name: string;
          short_name: string | null;
          tagline: string | null;
          description: string | null;
          location: string | null;
          about_title: string | null;
          about_content: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          logo_path: string | null;
          hero_title: string | null;
          hero_description: string | null;
          hero_image_path: string | null;
          about_image_path: string | null;
          social_links: Json;
          default_seo_title: string | null;
          default_seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          settings_key?: string;
          company_name: string;
          short_name?: string | null;
          tagline?: string | null;
          description?: string | null;
          location?: string | null;
          about_title?: string | null;
          about_content?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_path?: string | null;
          hero_title?: string | null;
          hero_description?: string | null;
          hero_image_path?: string | null;
          about_image_path?: string | null;
          social_links?: Json;
          default_seo_title?: string | null;
          default_seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          settings_key?: string;
          company_name?: string;
          short_name?: string | null;
          tagline?: string | null;
          description?: string | null;
          location?: string | null;
          about_title?: string | null;
          about_content?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_path?: string | null;
          hero_title?: string | null;
          hero_description?: string | null;
          hero_image_path?: string | null;
          about_image_path?: string | null;
          social_links?: Json;
          default_seo_title?: string | null;
          default_seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category: string | null;
          location: string | null;
          client: string | null;
          main_contractor: string | null;
          financing: string | null;
          description: string | null;
          scope_of_work: string | null;
          execution_details: string | null;
          project_status: string | null;
          status: Database["public"]["Enums"]["content_status"];
          published_at: string | null;
          start_date: string | null;
          completion_date: string | null;
          manpower: number | null;
          featured: boolean;
          cover_image_path: string | null;
          sort_order: number;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          category?: string | null;
          location?: string | null;
          client?: string | null;
          main_contractor?: string | null;
          financing?: string | null;
          description?: string | null;
          scope_of_work?: string | null;
          execution_details?: string | null;
          project_status?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          published_at?: string | null;
          start_date?: string | null;
          completion_date?: string | null;
          manpower?: number | null;
          featured?: boolean;
          cover_image_path?: string | null;
          sort_order?: number;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          category?: string | null;
          location?: string | null;
          client?: string | null;
          main_contractor?: string | null;
          financing?: string | null;
          description?: string | null;
          scope_of_work?: string | null;
          execution_details?: string | null;
          project_status?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          published_at?: string | null;
          start_date?: string | null;
          completion_date?: string | null;
          manpower?: number | null;
          featured?: boolean;
          cover_image_path?: string | null;
          sort_order?: number;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_images: {
        Row: {
          id: string;
          project_id: string;
          image_path: string;
          caption: string | null;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          image_path: string;
          caption?: string | null;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          image_path?: string;
          caption?: string | null;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          id: string;
          title: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          cover_image_path: string | null;
          icon: string | null;
          featured: boolean;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
          published_at: string | null;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          short_description?: string | null;
          description?: string | null;
          cover_image_path?: string | null;
          icon?: string | null;
          featured?: boolean;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          published_at?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          short_description?: string | null;
          description?: string | null;
          cover_image_path?: string | null;
          icon?: string | null;
          featured?: boolean;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          published_at?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      gallery_albums: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          cover_image_path: string | null;
          category: string | null;
          featured: boolean;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          cover_image_path?: string | null;
          category?: string | null;
          featured?: boolean;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          cover_image_path?: string | null;
          category?: string | null;
          featured?: boolean;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      gallery_images: {
        Row: {
          id: string;
          album_id: string;
          image_path: string;
          caption: string | null;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          album_id: string;
          image_path: string;
          caption?: string | null;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          album_id?: string;
          image_path?: string;
          caption?: string | null;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gallery_images_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "gallery_albums";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          cover_image_path: string | null;
          content: string | null;
          category: string | null;
          tags: string[];
          author: string | null;
          author_id: string | null;
          status: Database["public"]["Enums"]["content_status"];
          published_at: string | null;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          cover_image_path?: string | null;
          content?: string | null;
          category?: string | null;
          tags?: string[];
          author?: string | null;
          author_id?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          published_at?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          cover_image_path?: string | null;
          content?: string | null;
          category?: string | null;
          tags?: string[];
          author?: string | null;
          author_id?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          published_at?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          status: Database["public"]["Enums"]["contact_message_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          status?: Database["public"]["Enums"]["contact_message_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          subject?: string;
          message?: string;
          status?: Database["public"]["Enums"]["contact_message_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      content_status: "draft" | "published";
      contact_message_status: "new" | "read" | "archived";
    };
    CompositeTypes: Record<string, never>;
  };
};
