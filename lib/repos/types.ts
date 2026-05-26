import type { Database } from '@/lib/supabase/types';

export type Category = Database['public']['Tables']['categories']['Row'];
export type Subcategory = Database['public']['Tables']['subcategories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductPhoto = Database['public']['Tables']['product_photos']['Row'];

export type ProductWithPhotos = Product & { photos: ProductPhoto[] };
export type CategoryWithSubs = Category & { subcategories: Subcategory[] };
