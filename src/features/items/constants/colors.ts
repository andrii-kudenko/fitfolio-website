export const ITEM_FILTER_COLORS = [
  { value: 'black', label: 'Black', hex: '#000000' },
  { value: 'white', label: 'White', hex: '#FFFFFF' },
  { value: 'grey', label: 'Grey', hex: '#6B7280' },
  { value: 'blue', label: 'Blue', hex: '#2563EB' },
  { value: 'red', label: 'Red', hex: '#DC2626' },
  { value: 'green', label: 'Green', hex: '#16A34A' },
  { value: 'brown', label: 'Brown', hex: '#92400E' },
  { value: 'beige', label: 'Beige', hex: '#D4C4A8' },
  { value: 'yellow', label: 'Yellow', hex: '#EAB308' },
  { value: 'orange', label: 'Orange', hex: '#F97316' },
  { value: 'pink', label: 'Pink', hex: '#EC4899' },
  { value: 'purple', label: 'Purple', hex: '#9333EA' },
] as const;

export type ItemFilterColor = (typeof ITEM_FILTER_COLORS)[number];
