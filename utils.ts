
/**
 * وظيفة متقدمة لتطهير البيانات من أي مراجع دائرية أو كائنات معقدة غير قابلة للتسلسل.
 * مصممة للتعامل مع كائنات Firestore و Leaflet و DOM.
 */
export const stripFirestore = (data: any, seen = new WeakSet()): any => {
  // 1. القيم البسيطة والأساسية
  if (data === null || data === undefined) return data;
  const type = typeof data;
  if (type !== 'object') return data;

  // 2. منع المراجع الدائرية (Circular References)
  if (seen.has(data)) return undefined;

  // 3. معالجة تواريخ وطوابع Firebase
  if (typeof data.toMillis === 'function') return data.toMillis();
  if (typeof data.toDate === 'function') return data.toDate().getTime();

  // 4. معالجة مراجع المستندات في Firestore (DocumentReferences)
  if (data.id && data.path && typeof data.path === 'string') {
    // التحقق مما إذا كان كائناً برمجياً خاصاً بـ Firestore
    if (data.constructor?.name?.includes('DocumentReference') || data.firestore || data._delegate) {
      return data.path;
    }
  }

  // 5. استبعاد كائنات الـ DOM والخرائط (مثل Leaflet) التي تسبب مراجع دائرية
  if (data.nodeType || data.target || data._map || data._layers || data.options || data.srcElement) {
    return undefined;
  }

  // إضافة الكائن للمجموعة لمنع الدوران المستقبلي
  seen.add(data);

  // 6. معالجة المصفوفات
  if (Array.isArray(data)) {
    return data
      .map(item => stripFirestore(item, seen))
      .filter(val => val !== undefined);
  }

  // 7. التحقق من أن الكائن "بسيط" (Plain Object)
  const proto = Object.getPrototypeOf(data);
  const isPlain = proto === null || proto === Object.prototype;
  
  if (!isPlain && data.constructor?.name !== 'Object') {
    if (typeof data.toString === 'function' && data.toString() !== '[object Object]') {
      return data.toString();
    }
    return undefined;
  }

  // 8. تطهير خصائص الكائن
  const stripped: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // تخطي الخصائص الداخلية
      if (key.startsWith('_') || key.startsWith('$')) continue;
      
      const value = data[key];
      if (typeof value === 'function') continue;

      const cleanedValue = stripFirestore(value, seen);
      if (cleanedValue !== undefined) {
        stripped[key] = cleanedValue;
      }
    }
  }

  return stripped;
};

/**
 * جلب قائمة إحداثيات المسار الفعلي (Road Geometry) بين نقطتين عبر OSRM
 */
export const getRouteGeometry = async (lat1: number, lon1: number, lat2: number, lon2: number): Promise<[number, number][]> => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal: controller.signal }).catch(() => null);
    clearTimeout(timeoutId);
    
    if (response && response.ok) {
      const data = await response.json().catch(() => null);
      if (data && data.code === 'Ok' && data.routes?.length > 0 && data.routes[0].geometry?.coordinates) {
        return data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      }
    }
  } catch (_error) {
    // Fallback quietly to direct trajectory
  }
  return [[lat1, lon1], [lat2, lon2]];
};

/**
 * حساب المسافة الفعلية والزمن التقديري للطرق
 */
export const getRoadDistance = async (lat1: number, lon1: number, lat2: number, lon2: number): Promise<{ distance: number, duration: number }> => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return { distance: 0, duration: 0 };
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
    const response = await fetch(url, { signal: controller.signal }).catch(() => null);
    clearTimeout(timeoutId);
    
    if (response && response.ok) {
      const data = await response.json().catch(() => null);
      if (data && data.code === 'Ok' && data.routes?.length > 0) {
        return {
          distance: parseFloat((data.routes[0].distance / 1000).toFixed(1)),
          duration: Math.ceil(data.routes[0].duration / 60)
        };
      }
    }
  } catch (_error) {
    // Fallback quietly to calculated straight distance
  }
  const straight = calculateDistance(lat1, lon1, lat2, lon2);
  return { distance: parseFloat((straight * 1.3).toFixed(1)), duration: Math.ceil(straight * 3) };
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

/**
 * ضغط الصور لتقليل استهلاك الذاكرة وحجم المستندات في Firestore
 */
export const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith('data:image')) { resolve(base64Str); return; }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width; let height = img.height;
      if (width > height) { if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; } }
      else { if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; } }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => resolve(base64Str);
  });
};
