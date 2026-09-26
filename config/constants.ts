
import type { Village, District } from '../types';

export type { District };

export const PLATFORM_COMMISSION_RATE = 0.15;

/**
 * البيانات الجغرافية الشاملة لمحافظة المنوفية (10 مراكز)
 * تم تحديث القائمة لتشمل كافة الوحدات المحلية والقرى الرئيسية
 */
export const MENOFIA_DATA: District[] = [
  {
    id: 'd-ashmoun',
    name: 'أشمون',
    villages: [
      { id: 'ash-city', name: 'مدينة أشمون', center: { lat: 30.2931, lng: 30.9863 } },
      { id: 'v-shamma', name: 'شما', center: { lat: 30.3340, lng: 30.9420 } },
      { id: 'v-tahway', name: 'طهواي', center: { lat: 30.3420, lng: 30.8350 } },
      { id: 'v-samadoun', name: 'سمادون', center: { lat: 30.2858, lng: 30.9636 } },
      { id: 'v-santes', name: 'سنتريس', center: { lat: 30.3008, lng: 30.9439 } },
      { id: 'v-saqia', name: 'ساقية أبو شعرة', center: { lat: 30.3256, lng: 30.9394 } },
      { id: 'v-sabk', name: 'سبك الأحد', center: { lat: 30.3219, lng: 30.9981 } },
      { id: 'v-gris', name: 'جريس', center: { lat: 30.3361, lng: 30.9812 } },
      { id: 'v-shatanouf', name: 'شطانوف', center: { lat: 30.3297, lng: 30.9268 } },
      { id: 'v-darwa', name: 'دروة', center: { lat: 30.2500, lng: 30.9800 } },
      { id: 'v-shanshour', name: 'شنشور', center: { lat: 30.2799, lng: 30.9507 } },
      { id: 'v-talia', name: 'طليا', center: { lat: 30.2450, lng: 30.9350 } },
      { id: 'v-anjab', name: 'الأنجب', center: { lat: 30.3700, lng: 30.9900 } },
      { id: 'v-ramla', name: 'رملة الأنجب', center: { lat: 30.3750, lng: 30.9850 } },
      { id: 'v-khadra', name: 'الخضرة', center: { lat: 30.3200, lng: 30.9700 } },
      { id: 'v-el-kawady', name: 'الكوادي', center: { lat: 30.3800, lng: 31.0000 } },
      { id: 'v-monsha-sultan', name: 'منشأة سلطان', center: { lat: 30.3550, lng: 31.0100 } }
    ]
  },
  {
    id: 'd-shebin',
    name: 'شبين الكوم',
    villages: [
      { id: 'shebin-city', name: 'مدينة شبين الكوم', center: { lat: 30.5612, lng: 31.0125 } },
      { id: 'v-elmay', name: 'الماي', center: { lat: 30.5200, lng: 30.9500 } },
      { id: 'v-elbetanoun', name: 'البتانون', center: { lat: 30.6100, lng: 31.0500 } },
      { id: 'v-shanawan', name: 'شنوان', center: { lat: 30.5100, lng: 31.0100 } },
      { id: 'v-milia', name: 'مليج', center: { lat: 30.6000, lng: 31.0000 } },
      { id: 'v-bakhati', name: 'بخاتي', center: { lat: 30.5800, lng: 30.9400 } },
      { id: 'v-shobrabas', name: 'شبرا باص', center: { lat: 30.5400, lng: 30.9700 } },
      { id: 'v-el-moselha', name: 'المصيلحة', center: { lat: 30.5400, lng: 31.0500 } },
      { id: 'v-zowat-el-ghazal', name: 'زاوية الغزال', center: { lat: 30.5700, lng: 31.0300 } },
      { id: 'v-meet-khalaf', name: 'ميت خلف', center: { lat: 30.5300, lng: 31.0400 } },
      { id: 'v-tobloha', name: 'تبلوها', center: { lat: 30.6300, lng: 31.0200 } }
    ]
  },
  {
    id: 'd-menouf',
    name: 'منوف',
    villages: [
      { id: 'menouf-city', name: 'مدينة منوف', center: { lat: 30.4667, lng: 30.9333 } },
      { id: 'sers-city', name: 'سرس الليان', center: { lat: 30.4333, lng: 30.9167 } },
      { id: 'v-feisha', name: 'فيشا الكبرى', center: { lat: 30.4000, lng: 30.9667 } },
      { id: 'v-barahim', name: 'براهيم', center: { lat: 30.4833, lng: 30.9500 } },
      { id: 'v-al-haswa', name: 'الحصوة', center: { lat: 30.4500, lng: 30.9000 } },
      { id: 'v-zowat-rabein', name: 'زاوية رزين', center: { lat: 30.4100, lng: 30.8800 } },
      { id: 'v-barhoum', name: 'برهيم', center: { lat: 30.4800, lng: 30.9400 } },
      { id: 'v-tamalay', name: 'تتلا', center: { lat: 30.4900, lng: 30.9100 } },
      { id: 'v-sanhour', name: 'سنهور', center: { lat: 30.5100, lng: 30.9200 } },
      { id: 'v-deberky', name: 'دبركي', center: { lat: 30.4200, lng: 30.9800 } }
    ]
  },
  {
    id: 'd-sadat',
    name: 'مدينة السادات',
    villages: [
      { id: 'sadat-center', name: 'مركز المدينة', center: { lat: 30.3833, lng: 30.5000 } },
      { id: 'v-khatatba', name: 'الخطاطبة', center: { lat: 30.3167, lng: 30.8000 } },
      { id: 'v-kafr-dawood', name: 'كفر داود', center: { lat: 30.4667, lng: 30.7333 } },
      { id: 'v-el-akhmas', name: 'الأخماس', center: { lat: 30.4000, lng: 30.6000 } },
      { id: 'v-el-breigat', name: 'البريجات', center: { lat: 30.3500, lng: 30.7500 } },
      { id: 'v-el-tahra', name: 'الطاهرة', center: { lat: 30.4200, lng: 30.5500 } }
    ]
  },
  {
    id: 'd-bagour',
    name: 'الباجور',
    villages: [
      { id: 'bagour-city', name: 'مدينة الباجور', center: { lat: 30.4333, lng: 31.0333 } },
      { id: 'v-meet-afifi', name: 'ميت عفيف', center: { lat: 30.4167, lng: 31.0667 } },
      { id: 'v-estra', name: 'أسطرنط', center: { lat: 30.4500, lng: 31.0500 } },
      { id: 'v-behalshai', name: 'بهناي', center: { lat: 30.4000, lng: 31.0000 } },
      { id: 'v-shonoha', name: 'شنوان (الباجور)', center: { lat: 30.4400, lng: 31.0100 } },
      { id: 'v-el-khatatba-bagour', name: 'الخضرة (الباجور)', center: { lat: 30.4600, lng: 31.0400 } },
      { id: 'v-meshirf', name: 'مشيرف', center: { lat: 30.4200, lng: 31.0800 } },
      { id: 'v-feisha-soghra', name: 'فيشا الصغرى', center: { lat: 30.4100, lng: 31.0200 } }
    ]
  },
  {
    id: 'd-quesna',
    name: 'قويسنا',
    villages: [
      { id: 'quesna-city', name: 'مدينة قويسنا', center: { lat: 30.5500, lng: 31.1333 } },
      { id: 'v-arab-raml', name: 'عرب الرمل', center: { lat: 30.5167, lng: 31.1500 } },
      { id: 'v-meet-berra', name: 'ميت برة', center: { lat: 30.5000, lng: 31.1167 } },
      { id: 'v-taha-shobra', name: 'طه شبرا', center: { lat: 30.5833, lng: 31.1500 } },
      { id: 'v-ashlim', name: 'أشليم', center: { lat: 30.5300, lng: 31.1800 } },
      { id: 'v-el-koramia', center: { lat: 30.5600, lng: 31.1000 }, name: 'الكرامية' },
      { id: 'v-shobra-qabala', center: { lat: 30.5400, lng: 31.1400 }, name: 'شبرا قبالة' },
      { id: 'v-meet-sirag', center: { lat: 30.5700, lng: 31.1200 }, name: 'ميت سراج' }
    ]
  },
  {
    id: 'd-berket',
    name: 'بركة السبع',
    villages: [
      { id: 'berket-city', name: 'مدينة بركة السبع', center: { lat: 30.6333, lng: 31.0833 } },
      { id: 'v-horin', name: 'هورين', center: { lat: 30.6167, lng: 31.1167 } },
      { id: 'v-abu-mashhour', name: 'أبو مشهور', center: { lat: 30.6667, lng: 31.1000 } },
      { id: 'v-toukh-dalaka', name: 'طوخ طنبشا', center: { lat: 30.6000, lng: 31.0667 } },
      { id: 'v-el-ghouri', name: 'الغوري', center: { lat: 30.6500, lng: 31.0700 } },
      { id: 'v-el-dabia', name: 'الضبعة', center: { lat: 30.6200, lng: 31.1000 } },
      { id: 'v-kafr-el-sheikh-shehata', name: 'كفر الشيخ شحاتة', center: { lat: 30.6400, lng: 31.0900 } }
    ]
  },
  {
    id: 'd-tala',
    name: 'تلا',
    villages: [
      { id: 'tala-city', name: 'مدينة تلا', center: { lat: 30.6833, lng: 30.9500 } },
      { id: 'v-babel', name: 'بابل', center: { lat: 30.6500, lng: 30.9333 } },
      { id: 'v-kafr-arab', name: 'كفر العرب', center: { lat: 30.7000, lng: 30.9667 } },
      { id: 'v-zenara', name: 'زنارة', center: { lat: 30.7167, lng: 30.9167 } },
      { id: 'v-shobrakhalaf', name: 'شبرا خلفون', center: { lat: 30.6700, lng: 30.9000 } },
      { id: 'v-el-kawady-tala', name: 'الكوادي (تلا)', center: { lat: 30.7300, lng: 30.9400 } },
      { id: 'v-meet-abu-el-koum', name: 'ميت أبو الكوم', center: { lat: 30.7500, lng: 30.9200 } }
    ]
  },
  {
    id: 'd-shohadaa',
    name: 'الشهداء',
    villages: [
      { id: 'shohadaa-city', name: 'مدينة الشهداء', center: { lat: 30.6000, lng: 30.8167 } },
      { id: 'v-zawyat-naura', name: 'زاوية الناعورة', center: { lat: 30.6333, lng: 30.7833 } },
      { id: 'v-meet-shahala', name: 'ميت شهالة', center: { lat: 30.5833, lng: 30.8333 } },
      { id: 'v-denashwai', name: 'دنشواي', center: { lat: 30.6167, lng: 30.7500 } },
      { id: 'v-el-shohada-village', name: 'عزبة الشهداء', center: { lat: 30.5900, lng: 30.8200 } },
      { id: 'v-kafr-el-sheikh-mansour', name: 'كفر الشيخ منصور', center: { lat: 30.6200, lng: 30.8000 } },
      { id: 'v-el-atf', name: 'العطف', center: { lat: 30.6400, lng: 30.7700 } }
    ]
  }
];

export const ASHMOUN_VILLAGES: Village[] = MENOFIA_DATA.flatMap(d => d.villages);

export const DEFAULT_PRICING = {
  basePrice: 5, 
  pricePerKm: 4, 
  minPrice: 30,  
  maxPrice: 900,
  sameVillagePrice: 25, 
  deliveryBasePrice: 30, 
  foodOutsidePricePerKm: 3, 
  multipliers: {
    MOTORCYCLE: 0.85,
    TOKTOK: 1.0,
    CAR: 2.2
  }
};
