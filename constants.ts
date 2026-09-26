
import type { Zone, Village } from './types';

export const PLATFORM_COMMISSION_RATE = 0.15;

/**
 * القائمة الشاملة والنهائية لقرى وعزب مركز أشمون (المنوفية)
 * تم تجميعها بناءً على الوحدات المحلية لضمان التغطية الجغرافية الكاملة
 */
export const ASHMOUN_VILLAGES: Village[] = [
  // مدينة أشمون
  { id: 'ash-city', name: 'أشمون (المدينة)', center: { lat: 30.2986, lng: 30.9753 } },
  
  // وحدة شما
  { id: 'v-shamma', name: 'شما', center: { lat: 30.3122, lng: 30.9658 } },
  { id: 'v-khadra', name: 'الخضرة', center: { lat: 30.3200, lng: 30.9700 } },
  
  // وحدة سمادون
  { id: 'v-samadoun', name: 'سمادون', center: { lat: 30.2858, lng: 30.9636 } },
  { id: 'v-ezbet-samadoun', name: 'عزبة سمادون', center: { lat: 30.2916, lng: 30.9709 } },
  { id: 'v-smalay', name: 'سملاي', center: { lat: 30.2750, lng: 30.9550 } },
  
  // وحدة سنتريس
  { id: 'v-santes', name: 'سنتريس', center: { lat: 30.3008, lng: 30.9439 } },
  { id: 'v-mansh-santes', name: 'منشأة سنتريس', center: { lat: 30.3050, lng: 30.9400 } },
  { id: 'v-kohafa', name: 'كفر قورص', center: { lat: 30.3100, lng: 30.9450 } },
  { id: 'v-qours', name: 'قورص', center: { lat: 30.3150, lng: 30.9500 } },
  
  // وحدة طهواي
  { id: 'v-tahway', name: 'طهواي', center: { lat: 30.3089, lng: 30.9322 } },
  { id: 'v-dalhamou', name: 'دلهمو', center: { lat: 30.3150, lng: 30.9250 } },
  { id: 'v-ezbet-tahway', name: 'عزبة طهواي', center: { lat: 30.3050, lng: 30.9250 } },
  
  // وحدة ساقية أبو شعرة
  { id: 'v-saqia', name: 'ساقية أبو شعرة', center: { lat: 30.3256, lng: 30.9394 } },
  { id: 'v-shatanouf', name: 'شطانوف', center: { lat: 30.3297, lng: 30.9268 } },
  { id: 'v-hallawsi', name: 'الحلواصي', center: { lat: 30.3300, lng: 30.9350 } },
  { id: 'v-kfr-mansh', name: 'كفر منصور', center: { lat: 30.3350, lng: 30.9400 } },
  
  // وحدة سبك الأحد
  { id: 'v-sabk', name: 'سبك الأحد', center: { lat: 30.3219, lng: 30.9981 } },
  { id: 'v-shanshour', name: 'شنشور', center: { lat: 30.2799, lng: 30.9507 } },
  { id: 'v-bra-shanshour', name: 'براهيم', center: { lat: 30.2750, lng: 30.9450 } },
  { id: 'v-kfr-sabk', name: 'كفر سبك الأحد', center: { lat: 30.3250, lng: 31.0050 } },
  
  // وحدة جريس
  { id: 'v-gris', name: 'جريس', center: { lat: 30.3361, lng: 30.9812 } },
  { id: 'v-monsha-gris', name: 'منشأة جريس', center: { lat: 30.3400, lng: 30.9850 } },
  { id: 'v-abu-raqaba', name: 'أبو رقبة', center: { lat: 30.3450, lng: 30.9750 } },
  { id: 'v-kfr-abu-raqaba', name: 'كفر أبو رقبة', center: { lat: 30.3500, lng: 30.9800 } },
  
  // وحدة منشأة سلطان
  { id: 'v-monsha-sultan', name: 'منشأة سلطان', center: { lat: 30.3550, lng: 31.0100 } },
  { id: 'v-amreia', name: 'العامرية', center: { lat: 30.3600, lng: 31.0150 } },
  { id: 'v-kfr-amreia', name: 'كفر العامرية', center: { lat: 30.3650, lng: 31.0200 } },
  
  // وحدة رملة الأنجب
  { id: 'v-ramla-anjab', name: 'رملة الأنجب', center: { lat: 30.3750, lng: 30.9900 } },
  { id: 'v-anjab', name: 'الأنجب', center: { lat: 30.3800, lng: 31.0000 } },
  { id: 'v-kawadi', name: 'الكوادي', center: { lat: 30.3850, lng: 31.0100 } },
  { id: 'v-lawaizeh', name: 'اللوايزة', center: { lat: 30.3900, lng: 31.0200 } },
  
  // وحدة طليا
  { id: 'v-talia', name: 'طليا', center: { lat: 30.2450, lng: 30.9350 } },
  { id: 'v-barania', name: 'البرانية', center: { lat: 30.2400, lng: 30.9250 } },
  { id: 'v-kfr-barania', name: 'كفر البرانية', center: { lat: 30.2350, lng: 30.9150 } },
  { id: 'v-el-kawady-talia', name: 'الكوادي (طليا)', center: { lat: 30.2300, lng: 30.9050 } },
  
  // وحدة دروة
  { id: 'v-darwa', name: 'دروة', center: { lat: 30.2500, lng: 30.9800 } },
  { id: 'v-khyria', name: 'الخيرية', center: { lat: 30.2450, lng: 30.9850 } },
  { id: 'v-sandafeis', name: 'صندفيس', center: { lat: 30.2400, lng: 30.9900 } },
  
  // مناطق وعزب متفرقة
  { id: 'v-ramla', name: 'الرملة', center: { lat: 30.2700, lng: 30.9900 } },
  { id: 'v-ezbet-bakr', name: 'عزبة بكر', center: { lat: 30.3000, lng: 30.9850 } },
  { id: 'v-ezbet-aly', name: 'عزبة علي', center: { lat: 30.3050, lng: 30.9900 } },
  { id: 'v-ashma-village', name: 'أشما', center: { lat: 30.2950, lng: 30.9500 } },
  { id: 'v-qanatir', name: 'منطقة القناطر', center: { lat: 30.2200, lng: 31.0100 } }
];

export const ASHMOUN_ZONES: Zone[] = [
  {
    id: 'zone_ashmoun_full',
    name: 'منظومة مشوار أشمون',
    operatorId: 'op_ashmoun_main',
    pricing: { 
      basePrice: 12, 
      pricePerKm: 6, 
      minPrice: 20, 
      maxPrice: 400,
      sameVillagePrice: 15,
      multipliers: {
        MOTORCYCLE: 0.85,
        TOKTOK: 1.0,
        CAR: 1.75
      }
    },
    center: { lat: 30.2986, lng: 30.9753 }
  }
];

export const STORAGE_KEYS = {
  ORDERS: 'meshwar_ashmoun_v3_orders',
  USERS: 'meshwar_ashmoun_v3_users',
  ZONES: 'meshwar_ashmoun_v3_zones',
  CURRENT_USER: 'meshwar_ashmoun_v3_auth'
};

export const DEFAULT_PRICING = ASHMOUN_ZONES[0]?.pricing || {
  basePrice: 12,
  pricePerKm: 6,
  minPrice: 20,
  maxPrice: 400,
  sameVillagePrice: 15,
  multipliers: { MOTORCYCLE: 0.85, TOKTOK: 1.0, CAR: 1.75 }
};
