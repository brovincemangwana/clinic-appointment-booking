export function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(total) {
  const hours = String(Math.floor(total / 60)).padStart(2, '0');
  const minutes = String(total % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function isWorkingDay(doctor, date) {
  const [year, month, day] = date.split('-').map(Number);
  const weekday = new Date(year, month - 1, day).getDay();
  return doctor.workingDays.includes(weekday);
}

export function generateSlots(doctor, date) {
  if (!doctor.available || !isWorkingDay(doctor, date)) return [];
  const slots = [];
  const end = timeToMinutes(doctor.endTime);
  for (
    let t = timeToMinutes(doctor.startTime);
    t + doctor.slotMinutes <= end;
    t += doctor.slotMinutes
  ) {
    slots.push(minutesToTime(t));
  }
  return slots;
}

export function getAvailableSlots(doctor, date, appointments) {
  const taken = new Set(
    appointments
      .filter(
        (a) =>
          a.doctorId === doctor.id &&
          a.date === date &&
          a.status !== 'Cancelled'
      )
      .map((a) => a.time)
  );
  return generateSlots(doctor, date).map((time) => ({
    time,
    booked: taken.has(time),
  }));
}