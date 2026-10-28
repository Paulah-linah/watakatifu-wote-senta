import type { Area } from '@/context/AuthContext';
import { Constants } from '@/lib/database.types';
import { formatDate } from '@/lib/dates';
import { formatKes } from '@/lib/format';

export type FieldType = 'text' | 'textarea' | 'number' | 'money' | 'date' | 'time' | 'boolean' | 'list' | 'select' | 'image' | 'slug';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  full?: boolean;
  options?: { value: string; label: string }[] | 'product_categories';
}

export type Row = Record<string, unknown> & { id: string };

export interface ResourceDef {
  key: string;
  table:
    | 'facilities'
    | 'accommodation_options'
    | 'catering_services'
    | 'laundry_services'
    | 'mass_schedules'
    | 'retreats'
    | 'formation_programs'
    | 'events'
    | 'products'
    | 'product_categories'
    | 'gallery_images';
  title: string;
  singular: string;
  description: string;
  area: Area;
  orderBy: { column: string; ascending: boolean };
  titleField: string;
  imageField?: string;
  slugSource?: string;
  hasPublished: boolean;
  reorderable: boolean;
  publicPath: string;
  subtitle: (row: Row) => string;
  defaults: Record<string, unknown>;
  fields: FieldDef[];
  select?: string;
  /** Extra button in the page header, e.g. "Manage availability". */
  pageLink?: { label: string; to: string };
  /** Extra per-row link, e.g. to the hall's availability. */
  rowLink?: { label: string; to: (row: Row) => string };
}

const opts = (values: readonly string[]) => values.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));
const sortOrder: FieldDef = { name: 'sort_order', label: 'Display order', type: 'number', hint: 'Lower numbers appear first.' };
const published: FieldDef = { name: 'is_published', label: 'Published on the website', type: 'boolean' };
const image: FieldDef = { name: 'image_url', label: 'Image', type: 'image', full: true };

export const RESOURCES: ResourceDef[] = [
  {
    key: 'facilities',
    table: 'facilities',
    title: 'Conference halls',
    singular: 'hall',
    description: 'Halls shown on the hospitality page, the inquiry form and the availability calendar.',
    area: 'hospitality',
    orderBy: { column: 'sort_order', ascending: true },
    titleField: 'name',
    imageField: 'image_url',
    slugSource: 'name',
    hasPublished: true,
    reorderable: true,
    publicPath: '/hospitality/conference',
    pageLink: { label: 'Manage availability', to: '/admin/calendar' },
    rowLink: { label: 'Availability', to: (r) => `/admin/calendar?hall=${r.id}` },
    subtitle: (r) => `${r.capacity_min}–${r.capacity_max} people · ${formatKes(r.price_kes as number | null)}`,
    defaults: { features: [], seating_styles: ['Classroom'], is_published: true, capacity_min: 1, capacity_max: 10 },
    fields: [
      { name: 'name', label: 'Hall name', type: 'text', required: true },
      { name: 'slug', label: 'URL key', type: 'slug', required: true },
      { name: 'capacity_min', label: 'Minimum people', type: 'number', required: true },
      { name: 'capacity_max', label: 'Maximum people', type: 'number', required: true },
      { name: 'price_kes', label: 'Day rate (KES)', type: 'money', hint: 'Leave empty to show "Price on inquiry".' },
      { name: 'price_note', label: 'Rate note', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      { name: 'features', label: 'Included features', type: 'list', hint: 'One per line.' },
      { name: 'seating_styles', label: 'Seating styles', type: 'list', hint: 'One per line, e.g. Classroom, Boardroom, U-Shape, Theater.' },
      image,
      sortOrder,
      published,
    ],
  },
  {
    key: 'accommodation',
    table: 'accommodation_options',
    title: 'Accommodation',
    singular: 'accommodation option',
    description: 'Room types listed on the accommodation page and in the inquiry form.',
    area: 'hospitality',
    orderBy: { column: 'sort_order', ascending: true },
    titleField: 'name',
    imageField: 'image_url',
    slugSource: 'name',
    hasPublished: true,
    reorderable: true,
    publicPath: '/hospitality/accommodation',
    subtitle: (r) => [r.category, r.capacity_desc].filter(Boolean).join(' · '),
    defaults: { amenities: [], is_available: true, is_published: true },
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'URL key', type: 'slug', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'capacity_desc', label: 'Capacity description', type: 'text' },
      { name: 'rooms_count', label: 'Number of rooms', type: 'number' },
      { name: 'price_estimate', label: 'Rate note', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      { name: 'amenities', label: 'Amenities', type: 'list', hint: 'One per line.', full: true },
      image,
      { name: 'is_available', label: 'Currently available', type: 'boolean' },
      sortOrder,
      published,
    ],
  },
  {
    key: 'catering',
    table: 'catering_services',
    title: 'Catering services',
    singular: 'catering service',
    description: 'Catering packages on the catering page and in the inquiry form.',
    area: 'hospitality',
    orderBy: { column: 'sort_order', ascending: true },
    titleField: 'title',
    imageField: 'image_url',
    slugSource: 'title',
    hasPublished: true,
    reorderable: true,
    publicPath: '/hospitality/catering',
    subtitle: (r) => String(r.ideal_for ?? ''),
    defaults: { includes: [], is_published: true },
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'URL key', type: 'slug', required: true },
      { name: 'ideal_for', label: 'Ideal for', type: 'text', full: true },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      { name: 'includes', label: 'Includes', type: 'list', hint: 'One per line.', full: true },
      image,
      sortOrder,
      published,
    ],
  },
  {
    key: 'laundry',
    table: 'laundry_services',
    title: 'Laundry services',
    singular: 'laundry service',
    description: 'Services listed on the laundry page.',
    area: 'hospitality',
    orderBy: { column: 'sort_order', ascending: true },
    titleField: 'title',
    hasPublished: true,
    reorderable: true,
    publicPath: '/hospitality/laundry',
    subtitle: (r) => String(r.turnaround_time ?? ''),
    defaults: { is_available: true, is_published: true },
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, full: true },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      { name: 'turnaround_time', label: 'Turnaround time', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'text' },
      { name: 'is_available', label: 'Currently available', type: 'boolean' },
      sortOrder,
      published,
    ],
  },
  {
    key: 'mass',
    table: 'mass_schedules',
    title: 'Mass schedule',
    singular: 'Mass time',
    description: 'Mass times on the ministry page. The daily Mass time in the site header is set in Site settings.',
    area: 'ministry',
    orderBy: { column: 'sort_order', ascending: true },
    titleField: 'celebration_type',
    hasPublished: true,
    reorderable: true,
    publicPath: '/ministry/mass',
    subtitle: (r) => `${r.day_label} · ${r.time_label}`,
    defaults: { is_special: false, is_published: true },
    fields: [
      { name: 'celebration_type', label: 'Celebration', type: 'text', required: true },
      { name: 'time_label', label: 'Time', type: 'text', required: true, hint: 'e.g. 7:00 AM' },
      { name: 'day_label', label: 'Day(s)', type: 'text', required: true, hint: 'e.g. Monday to Sunday' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      { name: 'is_special', label: 'Special / annual feast', type: 'boolean' },
      sortOrder,
      published,
    ],
  },
  {
    key: 'retreats',
    table: 'retreats',
    title: 'Retreats',
    singular: 'retreat',
    description: 'Retreats on the ministry page and in the inquiry form.',
    area: 'ministry',
    orderBy: { column: 'sort_order', ascending: true },
    titleField: 'title',
    imageField: 'image_url',
    slugSource: 'title',
    hasPublished: true,
    reorderable: true,
    publicPath: '/ministry/retreats',
    subtitle: (r) => [r.category, r.start_date ? formatDate(String(r.start_date)) : null, r.duration].filter(Boolean).join(' · '),
    defaults: { category: 'group', requirements: [], is_published: true },
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'URL key', type: 'slug', required: true },
      { name: 'category', label: 'Category', type: 'select', required: true, options: opts(Constants.public.Enums.retreat_category) },
      { name: 'target_audience', label: 'Who it is for', type: 'text' },
      { name: 'start_date', label: 'Start date', type: 'date' },
      { name: 'end_date', label: 'End date', type: 'date' },
      { name: 'duration', label: 'Duration', type: 'text', hint: 'e.g. Friday evening to Sunday lunch' },
      { name: 'fee_kes', label: 'Fee (KES)', type: 'money' },
      { name: 'fee_note', label: 'Fee note', type: 'text', full: true },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      { name: 'requirements', label: 'What to bring', type: 'list', hint: 'One per line.', full: true },
      image,
      sortOrder,
      published,
    ],
  },
  {
    key: 'formation',
    table: 'formation_programs',
    title: 'Formation programmes',
    singular: 'programme',
    description: 'Formation and seminar programmes on the ministry page.',
    area: 'ministry',
    orderBy: { column: 'sort_order', ascending: true },
    titleField: 'title',
    imageField: 'image_url',
    slugSource: 'title',
    hasPublished: true,
    reorderable: true,
    publicPath: '/ministry/formation',
    subtitle: (r) => String(r.duration ?? ''),
    defaults: { requirements: [], is_published: true },
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'URL key', type: 'slug', required: true },
      { name: 'duration', label: 'Format & duration', type: 'text' },
      { name: 'schedule', label: 'Schedule', type: 'text' },
      { name: 'fee_kes', label: 'Cost (KES)', type: 'money' },
      { name: 'fee_note', label: 'Cost note', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      { name: 'requirements', label: 'Prerequisites', type: 'list', hint: 'One per line.', full: true },
      image,
      sortOrder,
      published,
    ],
  },
  {
    key: 'events',
    table: 'events',
    title: 'Events',
    singular: 'event',
    description: 'Events move to "Past" automatically after their date.',
    area: 'events',
    orderBy: { column: 'event_date', ascending: false },
    titleField: 'title',
    imageField: 'image_url',
    slugSource: 'title',
    hasPublished: true,
    reorderable: false,
    publicPath: '/events',
    subtitle: (r) => `${formatDate(String(r.event_date))}${r.location ? ` · ${r.location}` : ''}`,
    defaults: { registration_open: true, is_published: true },
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'URL key', type: 'slug', required: true },
      { name: 'event_date', label: 'Date', type: 'date', required: true },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'start_time', label: 'Start time', type: 'time' },
      { name: 'end_time', label: 'End time', type: 'time' },
      { name: 'time_label', label: 'Time text (optional)', type: 'text', hint: 'Overrides start/end, e.g. "9:00 AM onwards".', full: true },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      image,
      { name: 'registration_open', label: 'Accept registrations online', type: 'boolean' },
      published,
    ],
  },
  {
    key: 'products',
    table: 'products',
    title: 'Products',
    singular: 'product',
    description: 'Items in the public products catalogue.',
    area: 'products',
    orderBy: { column: 'sort_order', ascending: true },
    titleField: 'name',
    imageField: 'image_url',
    hasPublished: true,
    reorderable: true,
    publicPath: '/products',
    select: '*, category:product_categories(name)',
    subtitle: (r) => `${r.sku} · ${(r.category as { name: string } | null)?.name ?? ''} · ${formatKes(r.price_kes as number | null)}${r.is_available ? '' : ' · Out of stock'}`,
    defaults: { is_available: true, is_featured: false, is_published: true },
    fields: [
      { name: 'name', label: 'Product name', type: 'text', required: true, full: true },
      { name: 'sku', label: 'Product code (SKU)', type: 'text', required: true },
      { name: 'category_id', label: 'Category', type: 'select', required: true, options: 'product_categories' },
      { name: 'price_kes', label: 'Price (KES)', type: 'money', hint: 'Leave empty to show "Price on inquiry".' },
      { name: 'description', label: 'Description', type: 'textarea', full: true },
      image,
      { name: 'is_available', label: 'In stock', type: 'boolean' },
      { name: 'is_featured', label: 'Featured', type: 'boolean' },
      sortOrder,
      published,
    ],
  },
  {
    key: 'categories',
    table: 'product_categories',
    title: 'Product categories',
    singular: 'category',
    description: 'Categories used to filter the products catalogue.',
    area: 'products',
    orderBy: { column: 'sort_order', ascending: true },
    titleField: 'name',
    hasPublished: false,
    reorderable: true,
    publicPath: '/products',
    subtitle: () => '',
    defaults: {},
    fields: [{ name: 'name', label: 'Category name', type: 'text', required: true, full: true }, sortOrder],
  },
  {
    key: 'gallery',
    table: 'gallery_images',
    title: 'Gallery',
    singular: 'photo',
    description: 'Photos on the gallery page and the home page preview.',
    area: 'gallery',
    orderBy: { column: 'sort_order', ascending: true },
    titleField: 'title',
    imageField: 'image_url',
    hasPublished: true,
    reorderable: true,
    publicPath: '/gallery',
    subtitle: (r) => String(r.category ?? ''),
    defaults: { category: 'Grounds', is_published: true },
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', required: true, options: Constants.public.Enums.gallery_category.map((v) => ({ value: v, label: v })) },
      { name: 'caption', label: 'Caption', type: 'text', full: true },
      { ...image, name: 'image_url', required: true },
      sortOrder,
      published,
    ],
  },
];

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
