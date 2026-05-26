import { publicEnv } from './env';

export const business = {
  name: publicEnv.BUSINESS_NAME,
  phone: publicEnv.BUSINESS_PHONE,
  address: publicEnv.BUSINESS_ADDRESS,
  lat: publicEnv.BUSINESS_LAT,
  lng: publicEnv.BUSINESS_LNG,
  googleBusinessUrl: publicEnv.GOOGLE_BUSINESS_URL,
};

const coords = `${business.lat},${business.lng}`;

export const mapsUrls = {
  google: () => `https://www.google.com/maps/dir/?api=1&destination=${coords}`,
  apple: () => `https://maps.apple.com/?daddr=${coords}`,
  waze: () => `https://waze.com/ul?ll=${coords}&navigate=yes`,
};

export const phoneHref = `tel:${business.phone.replace(/\s/g, '')}`;
