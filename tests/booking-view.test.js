// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import {
  renderProfile,
  renderDates,
  renderSlots,
  renderSummary,
  showFormErrors,
} from '../src/js/booking-view.js';

const doctor = {
  id: 1,
  name: 'Dr. Amina Odhiambo',
  specialty: 'General practitioner',
  workingDays: [1, 2, 3, 4, 5],
  startTime: '08:00',
  endTime: '17:00',
  slotMinutes: 30,
};

describe('renderProfile', () => {
  it('shows the doctor name, specialty and hours', () => {
    const container = document.createElement('section');
    renderProfile(container, doctor);
    expect(container.querySelector('h1').textContent).toBe('Dr. Amina Odhiambo');
    expect(container.textContent).toContain('General practitioner');
    expect(container.textContent).toContain('Mon – Fri · 8:00 AM – 5:00 PM · 30-minute slots');
  });
});

describe('renderDates', () => {
  it('renders a button for each date and marks the selected one', () => {
    const container = document.createElement('div');
    renderDates(container, ['2026-10-27', '2026-10-28'], '2026-10-28', () => {});
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].textContent).toBe('Tue27');
    expect(buttons[1].classList.contains('is-selected')).toBe(true);
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
  });

  it('calls the handler with the ISO date when clicked', () => {
    const onSelect = vi.fn();
    const container = document.createElement('div');
    renderDates(container, ['2026-10-27'], '', onSelect);
    container.querySelector('button').click();
    expect(onSelect).toHaveBeenCalledWith('2026-10-27');
  });
});

describe('renderSlots', () => {
  const slots = [
    { time: '09:00', booked: false },
    { time: '09:30', booked: true },
  ];

  it('shows a message when there are no slots', () => {
    const container = document.createElement('div');
    renderSlots(container, [], '', () => {});
    expect(container.textContent).toBe('No slots available on this date.');
  });

  it('renders each slot and disables booked ones', () => {
    const container = document.createElement('div');
    renderSlots(container, slots, '', () => {});
    const buttons = container.querySelectorAll('button');
    expect(buttons[0].textContent).toBe('9:00 AM');
    expect(buttons[0].disabled).toBe(false);
    expect(buttons[1].disabled).toBe(true);
  });

  it('marks the selected slot', () => {
    const container = document.createElement('div');
    renderSlots(container, slots, '09:00', () => {});
    expect(container.querySelector('button').classList.contains('is-selected')).toBe(true);
  });

  it('calls the handler with the time when a slot is clicked', () => {
    const onSelect = vi.fn();
    const container = document.createElement('div');
    renderSlots(container, slots, '', onSelect);
    container.querySelector('button').click();
    expect(onSelect).toHaveBeenCalledWith('09:00');
  });
});

describe('renderSummary', () => {
  it('asks the patient to choose when nothing is selected', () => {
    const container = document.createElement('div');
    renderSummary(container, doctor, '', '');
    expect(container.textContent).toBe('Select a date and time to continue.');
  });

  it('shows the chosen slot', () => {
    const container = document.createElement('div');
    renderSummary(container, doctor, '2026-10-27', '10:30');
    expect(container.textContent).toContain('Tue, 27 Oct · 10:30 AM');
    expect(container.textContent).toContain('Dr. Amina Odhiambo');
  });
});

describe('showFormErrors', () => {
  function makeForm() {
    const form = document.createElement('form');
    form.innerHTML = `
      <input id="name"><p id="name-error"></p>
      <input id="phone"><p id="phone-error"></p>
      <textarea id="reason"></textarea><p id="reason-error"></p>
      <p id="slot-error"></p>`;
    return form;
  }

  it('shows messages and flags the invalid inputs', () => {
    const form = makeForm();
    showFormErrors(form, { name: 'Enter your full name.', time: 'Choose a time slot.' });
    expect(form.querySelector('#name-error').textContent).toBe('Enter your full name.');
    expect(form.querySelector('#name').classList.contains('invalid')).toBe(true);
    expect(form.querySelector('#name').getAttribute('aria-invalid')).toBe('true');
    expect(form.querySelector('#slot-error').textContent).toBe('Choose a time slot.');
  });

  it('clears earlier errors when the form is valid', () => {
    const form = makeForm();
    showFormErrors(form, { phone: 'Enter your phone number.' });
    showFormErrors(form, {});
    expect(form.querySelector('#phone-error').textContent).toBe('');
    expect(form.querySelector('#phone').classList.contains('invalid')).toBe(false);
    expect(form.querySelector('#phone').getAttribute('aria-invalid')).toBe('false');
  });

  it('falls back to the date error when there is no time error', () => {
    const form = makeForm();
    showFormErrors(form, { date: 'Choose a date.' });
    expect(form.querySelector('#slot-error').textContent).toBe('Choose a date.');
  });
});