const LOCAL_API = 'http://localhost:3000';
const LIVE_API = 'https://clinic-appointment-booking-6pr4.onrender.com';

const host = globalThis.location?.hostname;

export const API_URL = host === 'localhost' || host === '127.0.0.1' ? LOCAL_API : LIVE_API;