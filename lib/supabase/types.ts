/** TODO: regenerate with `supabase gen types typescript --linked > lib/supabase/types.ts` once the project is linked. */

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: { id: string; name: string; slug: string; position: number; created_at: string };
        Insert: { id?: string; name: string; slug: string; position?: number; created_at?: string };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
        Relationships: [];
      };
      subcategories: {
        Row: { id: string; category_id: string; name: string; slug: string; position: number };
        Insert: { id?: string; category_id: string; name: string; slug: string; position?: number };
        Update: Partial<Database['public']['Tables']['subcategories']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'subcategories_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          subcategory_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          price_cents: number;
          quantity: number;
          condition: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subcategory_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          price_cents: number;
          quantity?: number;
          condition: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
        Relationships: [];
      };
      product_conditions: {
        Row: { id: string; slug: string; label: string; position: number; created_at: string };
        Insert: { id?: string; slug: string; label: string; position?: number; created_at?: string };
        Update: Partial<Database['public']['Tables']['product_conditions']['Insert']>;
        Relationships: [];
      };
      product_photos: {
        Row: { id: string; product_id: string; storage_path: string; position: number };
        Insert: { id?: string; product_id: string; storage_path: string; position: number };
        Update: Partial<Database['public']['Tables']['product_photos']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'product_photos_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      google_reviews_cache: {
        Row: {
          id: string;
          author_name: string | null;
          rating: number | null;
          text: string | null;
          relative_time: string | null;
          profile_photo: string | null;
          fetched_at: string;
        };
        Insert: {
          id?: string;
          author_name?: string | null;
          rating?: number | null;
          text?: string | null;
          relative_time?: string | null;
          profile_photo?: string | null;
          fetched_at?: string;
        };
        Update: Partial<Database['public']['Tables']['google_reviews_cache']['Insert']>;
        Relationships: [];
      };
      google_business_info: {
        Row: { id: number; rating: number | null; total_reviews: number | null; fetched_at: string };
        Insert: { id?: number; rating?: number | null; total_reviews?: number | null; fetched_at?: string };
        Update: Partial<Database['public']['Tables']['google_business_info']['Insert']>;
        Relationships: [];
      };
      profiles: {
        Row: { id: string; email: string; role: 'admin' | 'employee'; created_at: string };
        Insert: { id: string; email: string; role?: 'admin' | 'employee'; created_at?: string };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
