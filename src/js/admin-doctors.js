import {
  getDoctors,
  getAppointments,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from './api.js';
import { validateDoctor, buildDoctor, hasActiveAppointments } from './doctor-form.js';
import {
  buildDayChips,
  fillSlotOptions,
  fillSpecialtyList,
  renderDoctorRows,
  readDoctorForm,
  writeDoctorForm,
  showDoctorErrors,
  setFormMode,
} from './admin-doctors-view.js';
import { showLoading, showError, showSuccess, clearStatus } from './ui.js';

const form = document.querySelector('#doctor-form');
const rows = document.querySelector('#rows');
const status = document.querySelector('#status');
const daysContainer = document.querySelector('#days');
const slotSelect = document.querySelector('#slot');
const specialtyList = document.querySelector('#specialties');
const saveButton = document.querySelector('#save');
const cancelButton = document.querySelector('#cancel-edit');

const state = { doctors: [], editingId: null };

function draw() {
  renderDoctorRows(rows, state.doctors, state.editingId, {
    onEdit: startEdit,
    onDelete: remove,
  });
  fillSpecialtyList(specialtyList, state.doctors);
}

function resetForm() {
  state.editingId = null;
  writeDoctorForm(form, null);
  showDoctorErrors(form, {});
  setFormMode(form, false);
}

function startEdit(doctor) {
  state.editingId = doctor.id;
  writeDoctorForm(form, doctor);
  showDoctorErrors(form, {});
  setFormMode(form, true);
  clearStatus(status);
  draw();
  form.querySelector('#name').focus();
}

async function save(event) {
  event.preventDefault();
  const values = readDoctorForm(form);
  const errors = validateDoctor(values);
  showDoctorErrors(form, errors);
  if (Object.keys(errors).length > 0) {
    form.querySelector('.invalid')?.focus();
    return;
  }

  const data = buildDoctor(values);
  saveButton.disabled = true;
  showLoading(status, 'Saving doctor…');
  try {
    if (state.editingId !== null) {
      const updated = await updateDoctor(state.editingId, { ...data, id: state.editingId });
      state.doctors = state.doctors.map((d) => (d.id === updated.id ? updated : d));
      showSuccess(status, `${updated.name} was updated.`);
    } else {
      const created = await createDoctor(data);
      state.doctors = [...state.doctors, created];
      showSuccess(status, `${created.name} was added.`);
    }
    resetForm();
    draw();
  } catch {
    showError(status, 'Could not save the doctor. Check that the API is running and try again.');
  } finally {
    saveButton.disabled = false;
  }
}

async function remove(doctor) {
  showLoading(status, 'Checking appointments…');
  try {
    const appointments = await getAppointments({ doctorId: doctor.id });
    if (hasActiveAppointments(appointments, doctor.id)) {
      showError(
        status,
        `${doctor.name} still has upcoming appointments. Cancel or complete them first, or untick "Accepting appointments" instead of deleting.`
      );
      return;
    }
  } catch {
    showError(status, 'Could not check appointments. Check that the API is running.');
    return;
  }

  clearStatus(status);
  if (!window.confirm(`Delete ${doctor.name}? This cannot be undone.`)) return;

  showLoading(status, 'Deleting doctor…');
  try {
    await deleteDoctor(doctor.id);
    state.doctors = state.doctors.filter((d) => d.id !== doctor.id);
    if (state.editingId === doctor.id) resetForm();
    draw();
    showSuccess(status, `${doctor.name} was deleted.`);
  } catch {
    showError(status, 'Could not delete the doctor. Check that the API is running and try again.');
  }
}

async function init() {
  buildDayChips(daysContainer);
  fillSlotOptions(slotSelect);
  resetForm();

  showLoading(status, 'Loading doctors…');
  try {
    state.doctors = await getDoctors();
  } catch {
    showError(status, 'Could not load doctors. Check that the API is running.');
    return;
  }
  clearStatus(status);
  draw();
}

form.addEventListener('submit', save);
cancelButton.addEventListener('click', () => {
  resetForm();
  draw();
});

init();