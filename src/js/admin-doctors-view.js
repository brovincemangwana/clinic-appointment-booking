import { el } from './ui.js';
import { formatDays } from './doctors.js';
import { formatTime } from './slots.js';
import { SLOT_OPTIONS } from './doctor-form.js';

const DAY_CHIPS = [['M', 1], ['T', 2], ['W', 3], ['T', 4], ['F', 5], ['S', 6], ['S', 0]];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function buildDayChips(container) {
  container.replaceChildren(
    ...DAY_CHIPS.map(([letter, value]) => {
      const label = el('label', 'day-chip');
      label.title = DAY_NAMES[value];
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = String(value);
      input.setAttribute('aria-label', DAY_NAMES[value]);
      label.append(input, el('span', '', letter));
      return label;
    })
  );
}

export function fillSlotOptions(select) {
  select.replaceChildren(
    ...SLOT_OPTIONS.map((minutes) => {
      const option = el('option', '', `${minutes} minutes`);
      option.value = String(minutes);
      return option;
    })
  );
}

export function fillSpecialtyList(datalist, doctors) {
  const names = [...new Set(doctors.map((d) => d.specialty))].sort();
  datalist.replaceChildren(
    ...names.map((name) => {
      const option = document.createElement('option');
      option.value = name;
      return option;
    })
  );
}

export function renderDoctorRows(tbody, doctors, editingId, { onEdit, onDelete }) {
  if (doctors.length === 0) {
    const row = el('tr');
    const cell = el('td', 'empty', 'No doctors yet. Add one using the form.');
    cell.colSpan = 7;
    row.append(cell);
    tbody.replaceChildren(row);
    return;
  }

  const rows = doctors.map((doctor) => {
    const row = el('tr', doctor.id === editingId ? 'is-editing' : '');
    [
      doctor.name,
      doctor.specialty,
      formatDays(doctor.workingDays),
      `${formatTime(doctor.startTime)} – ${formatTime(doctor.endTime)}`,
      String(doctor.slotMinutes),
    ].forEach((text) => row.append(el('td', '', text)));

    const statusCell = el('td');
    statusCell.append(
      el(
        'span',
        `badge ${doctor.available ? 'badge-available' : 'badge-unavailable'}`,
        doctor.available ? 'Available' : 'Unavailable'
      )
    );

    const edit = el('button', 'btn sm', 'Edit');
    edit.type = 'button';
    edit.addEventListener('click', () => onEdit(doctor));
    const remove = el('button', 'btn sm danger', 'Delete');
    remove.type = 'button';
    remove.addEventListener('click', () => onDelete(doctor));
    const wrapper = el('div', 'row-actions');
    wrapper.append(edit, remove);
    const actionCell = el('td');
    actionCell.append(wrapper);

    row.append(statusCell, actionCell);
    return row;
  });
  tbody.replaceChildren(...rows);
}

export function readDoctorForm(form) {
  return {
    name: form.querySelector('#name').value,
    specialty: form.querySelector('#specialty').value,
    days: [...form.querySelectorAll('#days input:checked')].map((input) => Number(input.value)),
    startTime: form.querySelector('#start').value,
    endTime: form.querySelector('#end').value,
    slotMinutes: form.querySelector('#slot').value,
    available: form.querySelector('#available').checked,
  };
}

export function writeDoctorForm(form, doctor) {
  form.querySelector('#name').value = doctor ? doctor.name : '';
  form.querySelector('#specialty').value = doctor ? doctor.specialty : '';
  form.querySelectorAll('#days input').forEach((input) => {
    input.checked = doctor ? doctor.workingDays.includes(Number(input.value)) : false;
  });
  form.querySelector('#start').value = doctor ? doctor.startTime : '';
  form.querySelector('#end').value = doctor ? doctor.endTime : '';

  const slot = form.querySelector('#slot');
  const value = doctor ? String(doctor.slotMinutes) : '30';
  if (![...slot.options].some((option) => option.value === value)) {
    const option = el('option', '', `${value} minutes`);
    option.value = value;
    slot.append(option);
  }
  slot.value = value;

  form.querySelector('#available').checked = doctor ? doctor.available : true;
}

export function showDoctorErrors(form, errors) {
  const fields = { name: 'name', specialty: 'specialty', days: 'days', time: 'time', slot: 'slotMinutes' };
  Object.entries(fields).forEach(([id, key]) => {
    form.querySelector(`#${id}-error`).textContent = errors[key] || '';
  });

  const flag = (selector, bad) => {
    const input = form.querySelector(selector);
    input.classList.toggle('invalid', bad);
    input.setAttribute('aria-invalid', String(bad));
  };
  flag('#name', Boolean(errors.name));
  flag('#specialty', Boolean(errors.specialty));
  flag('#start', Boolean(errors.time));
  flag('#end', Boolean(errors.time));
  flag('#slot', Boolean(errors.slotMinutes));
}

export function setFormMode(form, editing) {
  form.querySelector('#form-title').textContent = editing ? 'Edit doctor' : 'Add doctor';
  form.querySelector('#save').textContent = editing ? 'Save changes' : 'Save doctor';
}