export const MALTA_LOCATIONS = [
  'Valletta',
  'Birkirkara',
  'Mosta',
  'Qormi',
  'Żabbar',
  'Sliema',
  "St. Julian's",
  'Paola',
  'Naxxar',
  'Fgura',
  'Żejtun',
  'Żebbuġ',
  'Siġġiewi',
  'Marsaskala',
  'Attard',
  'Mdina',
  'Rabat',
  'Birżebbuġa',
  'Mellieħa',
  'Marsa',
  'Gozo (Victoria)',
  'Gozo (Xagħra)',
  'Gozo (Nadur)',
  'Gozo (Għarb)',
  'Gozo (Munxar)',
] as const;

export const COUNTRIES = [
  'Malta',
  'Italy',
  'United Kingdom',
  'Spain',
  'France',
  'Germany',
  'Netherlands',
  'Belgium',
  'Switzerland',
  'Austria',
  'Greece',
  'Cyprus',
  'Portugal',
  'Sweden',
  'Denmark',
  'Norway',
  'Poland',
  'Czech Republic',
  'Ireland',
  'Other',
] as const;

export const USER_ROLES = {
  BREEDER_REGISTERED: 'breeder_registered',
  BREEDER_INDEPENDENT: 'breeder_independent',
  SHELTER: 'shelter',
  BUYER: 'buyer',
  VET: 'vet',
} as const;

export const HEAT_EVENT_TYPES = {
  BLEED: 'bleed',
  FLAGGING: 'flagging',
  PROGESTERONE: 'progesterone',
  MATING: 'mating',
  WHELPING: 'whelping',
} as const;

export const LITTER_STATUS = {
  EXPECTED: 'expected',
  BORN: 'born',
  AVAILABLE: 'available',
  CLOSED: 'closed',
} as const;

export const WAITLIST_STATUS = {
  WAITING: 'waiting',
  DEPOSIT_REQUESTED: 'deposit_requested',
  DEPOSIT_PAID: 'deposit_paid',
  CONFIRMED: 'confirmed',
  PASSED: 'passed',
  REMOVED: 'removed',
} as const;

export const DEPOSIT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  APPLIED: 'applied',
} as const;

export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  PAYPAL: 'paypal',
  CASH: 'cash',
  OTHER: 'other',
} as const;

export const VIDEO_PLATFORMS = {
  WHATSAPP: 'whatsapp',
  ZOOM: 'zoom',
  GOOGLE_MEET: 'google_meet',
  FACETIME: 'facetime',
  OTHER: 'other',
} as const;

export const MESSAGE_TYPES = {
  TEXT: 'text',
  VIDEO_CALL_INVITE: 'video_call_invite',
  SYSTEM: 'system',
} as const;

export const NOTIFICATION_TYPES = {
  HEAT_CYCLE: 'heat_cycle',
  WAITLIST: 'waitlist',
  MESSAGE: 'message',
  DEPOSIT: 'deposit',
  MATCH: 'match',
  SYSTEM: 'system',
} as const;

export const CYCLE_LENGTH = 21;
export const FERTILE_WINDOW_START = 9;
export const FERTILE_WINDOW_END = 13;
export const GESTATION_DAYS = 63;

export const SPECIES = ['Dog', 'Cat'] as const;

export const PET_STATUS = {
  AVAILABLE: 'available',
  BREEDING: 'breeding',
  RETIRED: 'retired',
  SOLD: 'sold',
} as const;

export const LISTING_TYPES = {
  STUD: 'stud',
  LITTER: 'litter',
  ADOPTION: 'adoption',
} as const;

export const LISTING_STATUS = {
  DRAFT: 'draft',
  LIVE: 'live',
  RESERVED: 'reserved',
  CLOSED: 'closed',
} as const;
