import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Enums, Tables } from '@/lib/database.types';

export type SiteSettings = Tables<'site_settings'>;
export type Facility = Tables<'facilities'>;
export type AccommodationOption = Tables<'accommodation_options'>;
export type CateringService = Tables<'catering_services'>;
export type LaundryService = Tables<'laundry_services'>;
export type MassSchedule = Tables<'mass_schedules'>;
export type Retreat = Tables<'retreats'>;
export type FormationProgram = Tables<'formation_programs'>;
export type EventItem = Tables<'events'>;
export type ProductCategory = Tables<'product_categories'>;
export type Product = Tables<'products'> & { category: Pick<ProductCategory, 'id' | 'name'> | null };
export type GalleryImage = Tables<'gallery_images'>;
export type GalleryCategory = Enums<'gallery_category'>;
export type CoreValue = { title: string; description: string };

const STALE = 5 * 60 * 1000;

/** Used until settings load (and if the request fails) so contact details never render blank. */
export const FALLBACK_SETTINGS: SiteSettings = {
  id: 1,
  name: 'Watakatifu Wote Senta (All Saints Conference Centre)',
  short_name: 'Watakatifu Wote Senta',
  diocese: 'Catholic Diocese of Ngong',
  location: 'Ngong, Kahara Road, Kenya',
  address: 'Kahara Road, Ngong, Kajiado County, Kenya',
  phone: '+254704346417',
  phone_display: '+254 704 346 417',
  whatsapp_number: '254704346417',
  whatsapp_message: 'Hello Watakatifu Wote Senta, I would like to make an inquiry.',
  email: 'wws@ngongdiocese.org',
  daily_mass_time: '7:00 AM',
  office_hours: 'Mon–Sat, 8:00 AM – 5:00 PM',
  founded_on: '1986-11-01',
  mission: null,
  vision: null,
  philosophy: null,
  core_values: [],
  map_embed_url: null,
  map_link_url: null,
  social: {},
  updated_at: '',
};

export function useSiteSettings() {
  const query = useQuery({
    queryKey: ['site_settings'],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (error) throw error;
      return data;
    },
  });
  return { ...query, settings: query.data ?? FALLBACK_SETTINGS };
}

export const coreValuesOf = (settings: SiteSettings): CoreValue[] =>
  Array.isArray(settings.core_values) ? (settings.core_values as CoreValue[]) : [];

// Published, ordered rows for the public site. Staff see unpublished rows in the admin via their own queries.
type PublishedTable =
  | 'facilities'
  | 'accommodation_options'
  | 'catering_services'
  | 'laundry_services'
  | 'mass_schedules'
  | 'retreats'
  | 'formation_programs'
  | 'events'
  | 'gallery_images';

const published = <T,>(key: string, table: PublishedTable, order = 'sort_order') => ({
  queryKey: ['public', key],
  staleTime: STALE,
  queryFn: async (): Promise<T[]> => {
    // Every PublishedTable has is_published + the order column; the union is too wide for supabase-js generics.
    const { data, error } = await supabase
      .from(table as 'facilities')
      .select('*')
      .eq('is_published', true)
      .order(order as 'sort_order');
    if (error) throw error;
    return data as unknown as T[];
  },
});

export const useFacilities = () => useQuery(published<Facility>('facilities', 'facilities'));
export const useAccommodation = () => useQuery(published<AccommodationOption>('accommodation', 'accommodation_options'));
export const useCatering = () => useQuery(published<CateringService>('catering', 'catering_services'));
export const useLaundry = () => useQuery(published<LaundryService>('laundry', 'laundry_services'));
export const useMassSchedules = () => useQuery(published<MassSchedule>('mass', 'mass_schedules'));
export const useRetreats = () => useQuery(published<Retreat>('retreats', 'retreats'));
export const useFormation = () => useQuery(published<FormationProgram>('formation', 'formation_programs'));
export const useEvents = () => useQuery(published<EventItem>('events', 'events', 'event_date'));
export const useGallery = () => useQuery(published<GalleryImage>('gallery', 'gallery_images'));

export const useProductCategories = () =>
  useQuery({
    queryKey: ['public', 'product_categories'],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase.from('product_categories').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

export const useProducts = () =>
  useQuery({
    queryKey: ['public', 'products'],
    staleTime: STALE,
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:product_categories(id, name)')
        .eq('is_published', true)
        .order('sort_order');
      if (error) throw error;
      return data as Product[];
    },
  });
