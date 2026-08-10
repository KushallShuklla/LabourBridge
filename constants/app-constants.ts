// Common constants used across the app

export const COMMON_SKILLS = [
  'Plumber',
  'Electrician',
  'Carpenter',
  'Mason',
  'Painter',
  'Welder',
  'Driver',
  'Helper',
  'Cleaner',
  'Gardener',
];

export const APPLICATION_STATUSES = [
  'Applied',
  'Viewed',
  'Shortlisted',
  'Selected',
  'Rejected',
] as const;

export const STATUS_COLORS = {
  Applied: '#6C757D',
  Viewed: '#17A2B8',
  Shortlisted: '#FFC107',
  Selected: '#28A745',
  Rejected: '#DC3545',
};

export const DOCUMENT_TYPES = [
  'aadhaar',
  'certificate',
  'photo',
] as const;
