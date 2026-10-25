// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { fillSpecialties, renderDoctors } from '../src/js/doctors.js';

const doctors = [
  { id: 1, name: 'Dr. Amina Odhiambo', specialty: 'General practitioner', workingDays: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '17:00' },
  { id: 2, name: 'Dr. Peter Kamau', specialty: 'Dentist', workingDays: [1, 3, 5], startTime: '09:00', endTime: '16:00' },
  { id: 3, name: 'Dr. Grace Wanjiku', specialty: 'Dentist', workingDays: [1, 2, 3, 4, 5, 6], startTime: '08:00', endTime: '14:00' },
];

describe('fillSpecialties', () => {
  it('adds each specialty once, sorted', () => {
    const select = document.createElement('select');
    select.append(new Option('All specialties', ''));
    fillSpecialties(select, doctors);
    expect([...select.options].map((o) => o.value)).toEqual(['', 'Dentist', 'General practitioner']);
  });
});

describe('renderDoctors', () => {
  it('renders one card per doctor', () => {
    const container = document.createElement('div');
    renderDoctors(container, doctors);
    expect(container.querySelectorAll('article.doctor')).toHaveLength(3);
  });

  it('shows the name, specialty and working hours', () => {
    const container = document.createElement('div');
    renderDoctors(container, doctors);
    const card = container.querySelector('article');
    expect(card.querySelector('h3').textContent).toBe('Dr. Amina Odhiambo');
    expect(card.querySelector('.muted').textContent).toBe('General practitioner');
    expect(card.querySelector('.hours').textContent).toBe('Mon – Fri · 08:00 – 17:00');
  });

  it('links View slots to the booking page for that doctor', () => {
    const container = document.createElement('div');
    renderDoctors(container, doctors);
    const link = container.querySelector('a.btn');
    expect(link.textContent).toBe('View slots');
    expect(link.getAttribute('href')).toBe('booking.html?doctor=1');
  });

  it('replaces the previous cards when rendered again', () => {
    const container = document.createElement('div');
    renderDoctors(container, doctors);
    renderDoctors(container, doctors.slice(0, 1));
    expect(container.querySelectorAll('article')).toHaveLength(1);
  });
});