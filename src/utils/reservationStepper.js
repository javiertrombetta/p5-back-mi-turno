export const generateSchedules = (openingTime, closingTime, turnDuration) => {
  const schedules = [];
  let currentTime = openingTime;
  while (currentTime < closingTime) {
    schedules.push(currentTime);
    currentTime = incrementTime(currentTime, turnDuration);
  }
  return schedules;
};
export const incrementTime = (time, duration) => {
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes + duration;
  const newHours = Math.floor(timeInMinutes / 60);
  const newMinutes = timeInMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
};
export const filterAvailableSchedules = (schedules, reservations, date) => {
  const reservedTimes = reservations
    .filter(reservation => reservation.date === date)
    .map(reservation => reservation.time);
  return schedules.filter(schedule => !reservedTimes.includes(schedule));
};
export const identifyCriticalSchedules = (schedules, reservations, date, criticalLimit = 2) => {
  const reservationCounts = reservations
    .filter(reservation => reservation.date === date)
    .reduce((acc, reservation) => {
      acc[reservation.time] = (acc[reservation.time] || 0) + 1;
      return acc;
    }, {});
  return schedules.filter(schedule => reservationCounts[schedule] >= criticalLimit);
};
