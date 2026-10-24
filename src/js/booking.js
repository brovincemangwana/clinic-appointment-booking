import { getDoctor } from './api.js';
import { getUpcomingDates } from './dates.js';
import { renderProfile, renderDates } from './booking-view.js';
import { showLoading, showError, clearStatus } from './ui.js';

const status = document.querySelector('#status');
const profile = document.querySelector('#profile');
const datesContainer = document.querySelector('#dates');
const crumb = document.querySelector('#crumb-name');

const state = { doctor: null, dates: [], date: '', time: '' };

function selectDate(iso) {
  state.date = iso;
  state.time = '';
  renderDates(datesContainer, state.dates, state.date, selectDate);
}

async function init() {
  const id = new URLSearchParams(window.location.search).get('doctor');
  if (!id) {
    showError(status, 'No doctor selected. Go back and choose a doctor.');
    return;
  }

  showLoading(status, 'Loading doctor…');
  try {
    state.doctor = await getDoctor(id);
  } catch {
    showError(status, 'Could not load this doctor. Check the link and that the API is running.');
    return;
  }

  clearStatus(status);
  crumb.textContent = state.doctor.name;
  document.title = `MediBook – Book ${state.doctor.name}`;
  renderProfile(profile, state.doctor);

  state.dates = getUpcomingDates(state.doctor);
  if (state.dates.length === 0) {
    status.textContent = 'This doctor has no upcoming availability.';
    return;
  }
  selectDate(state.dates[0]);
}

init();