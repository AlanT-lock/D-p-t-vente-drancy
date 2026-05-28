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
        Relationships: [];
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
          condition: 'neuf' | 'tres_bon_etat' | 'bon_etat' | 'etat_usage';
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
          condition: 'neuf' | 'tres_bon_etat' | 'bon_etat' | 'etat_usage';
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
        Relationships: [];
      };
      product_photos: {
        Row: { id: string; product_id: string; storage_path: string; position: number };
        Insert: { id?: string; product_id: string; storage_path: string; position: number };
        Update: Partial<Database['public']['Tables']['product_photos']['Insert']>;
        Relationships: [];
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
