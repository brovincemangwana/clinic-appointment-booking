// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import {
  buildDayChips,
  fillSlotOptions,
  fillSpecialtyList,
  renderDoctorRows,
  readDoctorForm,
  writeDoctorForm,
  showDoctorErrors,
  setFormMode,
} from '../src/js/admin-doctors-view.js';

const doctor = {
  id: 1,
  name: 'Dr. Amina Odhiambo',
  specialty: 'General practitioner',
  workingDays: [1, 2, 3, 4, 5],
  startTime: '08:00',
  endTime: '17:00',
  slotMinutes: 30,
  available: true,
};

function makeForm() {
  const form = document.createElement('form');
  form.innerHTML = `
    <h2 id="form-title"></h2>
    <input id="name"><p id="name-error"></p>
    <input id="specialty"><p id="specialty-error"></p>
    <div id="days"></div><p id="days-error"></p>
    <input id="start" type="time"><input id="end" type="time"><p id="time-error"></p>
    <select id="slot"></select><p id="slot-error"></p>
    <input id="available" type="checkbox" checked>
    <button id="save"></button>`;
  buildDayChips(form.querySelector('#days'));
  fillSlotOptions(form.querySelector('#slot'));
  return form;
}

describe('buildDayChips', () => {
  it('creates seven chips starting on Monday', () => {
    const container = document.createElement('div');
    buildDayChips(container);
    const values = [...container.querySelectorAll('input')].map((i) => i.value);
    expect(values).toEqual(['1', '2', '3', '4', '5', '6', '0']);
  });

  it('labels each checkbox with the full day name', () => {
    const container = document.createElement('div');
    buildDayChips(container);
    expect(container.querySelector('input').getAttribute('aria-label')).toBe('Monday');
  });
});

describe('fillSlotOptions', () => {
  it('lists the allowed slot lengths', () => {
    const select = document.createElement('select');
    fillSlotOptions(select);
    expect([...select.options].map((o) => o.value)).toEqual(['10', '15', '20', '30', '45', '60']);
  });
});

describe('fillSpecialtyList', () => {
  it('lists each specialty once, sorted', () => {
    const list = document.createElement('datalist');
    fillSpecialtyList(list, [
      { specialty: 'Dentist' },
      { specialty: 'Cardiologist' },
      { specialty: 'Dentist' },
    ]);
    expect([...list.options].map((o) => o.value)).toEqual(['Cardiologist', 'Dentist']);
  });
});

describe('renderDoctorRows', () => {
  const handlers = () => ({ onEdit: vi.fn(), onDelete: vi.fn() });

  it('shows a message when there are no doctors', () => {
    const tbody = document.createElement('tbody');
    renderDoctorRows(tbody, [], null, handlers());
    expect(tbody.textContent).toBe('No doctors yet. Add one using the form.');
  });

  it('renders a row with the doctor details', () => {
    const tbody = document.createElement('tbody');
    renderDoctorRows(tbody, [doctor], null, handlers());
    const cells = [...tbody.querySelectorAll('td')].map((c) => c.textContent);
    expect(cells.slice(0, 5)).toEqual([
      'Dr. Amina Odhiambo',
      'General practitioner',
      'Mon – Fri',
      '8:00 AM – 5:00 PM',
      '30',
    ]);
    expect(cells[5]).toBe('Available');
  });

  it('shows Unavailable for a doctor who is not accepting appointments', () => {
    const tbody = document.createElement('tbody');
    renderDoctorRows(tbody, [{ ...doctor, available: false }], null, handlers());
    expect(tbody.textContent).toContain('Unavailable');
  });

  it('highlights the row being edited', () => {
    const tbody = document.createElement('tbody');
    renderDoctorRows(tbody, [doctor, { ...doctor, id: 2 }], 1, handlers());
    const rows = tbody.querySelectorAll('tr');
    expect(rows[0].classList.contains('is-editing')).toBe(true);
    expect(rows[1].classList.contains('is-editing')).toBe(false);
  });

  it('calls the edit and delete handlers with the doctor', () => {
    const h = handlers();
    const tbody = document.createElement('tbody');
    renderDoctorRows(tbody, [doctor], null, h);
    const [edit, remove] = tbody.querySelectorAll('button');
    edit.click();
    remove.click();
    expect(h.onEdit).toHaveBeenCalledWith(doctor);
    expect(h.onDelete).toHaveBeenCalledWith(doctor);
  });
});

describe('readDoctorForm and writeDoctorForm', () => {
  it('fills the form from a doctor and reads the same values back', () => {
    const form = makeForm();
    writeDoctorForm(form, doctor);
    expect(readDoctorForm(form)).toEqual({
      name: 'Dr. Amina Odhiambo',
      specialty: 'General practitioner',
      days: [1, 2, 3, 4, 5],
      startTime: '08:00',
      endTime: '17:00',
      slotMinutes: '30',
      available: true,
    });
  });

  it('clears the form when no doctor is given', () => {
    const form = makeForm();
    writeDoctorForm(form, doctor);
    writeDoctorForm(form, null);
    const values = readDoctorForm(form);
    expect(values.name).toBe('');
    expect(values.days).toEqual([]);
    expect(values.slotMinutes).toBe('30');
    expect(values.available).toBe(true);
  });

  it('adds a slot option for an unusual slot length', () => {
    const form = makeForm();
    writeDoctorForm(form, { ...doctor, slotMinutes: 25 });
    expect(readDoctorForm(form).slotMinutes).toBe('25');
  });
});

describe('showDoctorErrors', () => {
  it('shows messages and flags the invalid inputs', () => {
    const form = makeForm();
    showDoctorErrors(form, { name: 'Enter a name for the doctor.', time: 'End time must be after start time.' });
    expect(form.querySelector('#name-error').textContent).toBe('Enter a name for the doctor.');
    expect(form.querySelector('#name').classList.contains('invalid')).toBe(true);
    expect(form.querySelector('#time-error').textContent).toBe('End time must be after start time.');
    expect(form.querySelector('#start').classList.contains('invalid')).toBe(true);
    expect(form.querySelector('#end').classList.contains('invalid')).toBe(true);
  });

  it('clears the errors when the form is valid', () => {
    const form = makeForm();
    showDoctorErrors(form, { specialty: 'Enter a specialty.' });
    showDoctorErrors(form, {});
    expect(form.querySelector('#specialty-error').textContent).toBe('');
    expect(form.querySelector('#specialty').getAttribute('aria-invalid')).toBe('false');
  });
});

describe('setFormMode', () => {
  it('switches the title and button between add and edit', () => {
    const form = makeForm();
    setFormMode(form, true);
    expect(form.querySelector('#form-title').textContent).toBe('Edit doctor');
    expect(form.querySelector('#save').textContent).toBe('Save changes');
    setFormMode(form, false);
    expect(form.querySelector('#form-title').textContent).toBe('Add doctor');
    expect(form.querySelector('#save').textContent).toBe('Save doctor');
  });
});