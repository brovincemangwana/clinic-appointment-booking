import { el } from './ui.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatDays(days) {
  const sorted = [...days].sort((a, b) => a - b);
  const consecutive = sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1);
  if (consecutive && sorted.length > 1) {
    return `${DAYS[sorted[0]]} – ${DAYS[sorted[sorted.length - 1]]}`;
  }
  return sorted.map((d) => DAYS[d]).join(', ');
}

export function fillSpecialties(select, doctors) {
  const specialties = [...new Set(doctors.map((d) => d.specialty))].sort();
  specialties.forEach((name) => {
    const option = el('option', '', name);
    option.value = name;
    select.append(option);
  });
}

function doctorCard(doctor) {
  const card = el('article', 'card doctor');
  const top = el('div', 'doctor-top');
  top.append(el('div', 'avatar'));
  const text = el('div');
  text.append(el('h3', '', doctor.name), el('p', 'muted', doctor.specialty));
  top.append(text);

  const hours = el(
    'p',
    'hours',
    `${formatDays(doctor.workingDays)} · ${doctor.startTime} – ${doctor.endTime}`
  );
  const link = el('a', 'btn', 'View slots');
  link.href = `booking.html?doctor=${doctor.id}`;

  card.append(top, hours, link);
  return card;
}

export function renderDoctors(container, doctors) {
  container.replaceChildren(...doctors.map(doctorCard));
}