const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function toISODate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseISODate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getUpcomingDates(doctor, count = 7, from = new Date()) {
  if (!doctor.available) return [];
  const dates = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let i = 0; i < 60 && dates.length < count; i++) {
    if (doctor.workingDays.includes(cursor.getDay())) {
      dates.push(toISODate(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function formatDateShort(iso) {
  const date = parseISODate(iso);
  return { weekday: WEEKDAYS[date.getDay()], day: date.getDate() };
}

export function formatDateLong(iso) {
  const date = parseISODate(iso);
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}