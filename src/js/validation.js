export function todayISO(now = new Date()) {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function normalizePhone(value) {
  const digits = String(value ?? '').replace(/[\s-]/g, '');
  const match = digits.match(/^(?:\+?254|0)([71]\d{8})$/);
  return match ? `0${match[1]}` : null;
}

export function validateName(name) {
  const value = String(name ?? '').trim();
  if (!value) return 'Enter your full name.';
  if (value.length < 2) return 'Name must be at least 2 characters.';
  return '';
}

export function validatePhone(phone) {
  if (!String(phone ?? '').trim()) return 'Enter your phone number.';
  if (!normalizePhone(phone)) return 'Enter a valid Kenyan number, like 0712 345 678.';
  return '';
}

export function validateReason(reason) {
  const value = String(reason ?? '').trim();
  if (!value) return 'Tell us briefly why you are visiting.';
  if (value.length < 3) return 'Reason must be at least 3 characters.';
  if (value.length > 200) return 'Reason must be 200 characters or fewer.';
  return '';
}

export function validateDate(date, today = todayISO()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date ?? ''))) return 'Choose a date.';
  if (date < today) return 'Choose a date that is not in the past.';
  return '';
}

export function validateTime(time) {
  return /^\d{2}:\d{2}$/.test(String(time ?? '')) ? '' : 'Choose a time slot.';
}

export function validateBooking(form, today = todayISO()) {
  const checks = {
    name: validateName(form.name),
    phone: validatePhone(form.phone),
    reason: validateReason(form.reason),
    date: validateDate(form.date, today),
    time: validateTime(form.time),
  };
  return Object.fromEntries(Object.entries(checks).filter(([, message]) => message));
}