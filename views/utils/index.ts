
export const stripFirestore = (data: any, seen = new WeakSet()): any => {
  if (data === null || data === undefined) return data;
  
  const type = typeof data;
  if (type !== 'object') return data;

  if (seen.has(data)) return undefined;

  if (typeof data.toMillis === 'function') return data.toMillis();
  if (typeof data.toDate === 'function') return data.toDate().getTime();
  
  if (data.id && data.path && typeof data.path === 'string') {
    if (data.constructor.name.includes('DocumentReference') || data.firestore || data._delegate) {
      return data.path;
    }
  }

  const isArray = Array.isArray(data);
  const proto = Object.getPrototypeOf(data);
  const isPlainObject = proto === null || proto === Object.prototype || data.constructor?.name === 'Object';
  
  if (!isArray && !isPlainObject) {
    return undefined;
  }

  seen.add(data);

  if (isArray) {
    return data.map(item => stripFirestore(item, seen)).filter(val => val !== undefined);
  }

  const stripped: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      if (key.startsWith('_') || key.startsWith('$')) continue;
      if (typeof data[key] === 'function') continue;
      const cleaned = stripFirestore(data[key], seen);
      if (cleaned !== undefined) {
        stripped[key] = cleaned;
      }
    }
  }
  return stripped;
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};
