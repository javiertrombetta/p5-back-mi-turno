function formatTime(time) {
  const [hours, minutes] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}
const reservationStepper = {
  
  incrementTime: (time, duration) => {
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes + duration;
    const newHours = Math.floor(timeInMinutes / 60);
    const newMinutes = timeInMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  },
  generateSchedules: (openingTime, closingTime, turnDuration) => {
    const schedules = [];
    let currentTime = openingTime;
    while (currentTime < closingTime) {
      schedules.push(formatTime(currentTime));
      currentTime = reservationStepper.incrementTime(currentTime, turnDuration);
    }
    return schedules;
  },
  filterAvailableSchedules: (schedules, reservations, date) => {
    

    const reservedTimes = reservations
      .filter(reservation => reservation.date === date)
      .map(reservation => formatTime(reservation.time));

    return schedules.filter(schedule => {
      const formattedSchedule = formatTime(schedule);
      return !reservedTimes.includes(formattedSchedule);
    });
  },
  identifyCriticalSchedules: (schedules, reservations, date, criticalLimit = 2) => {
    const reservationCounts = reservations
      .filter(reservation => reservation.date === date)
      .reduce((acc, reservation) => {
        acc[reservation.time] = (acc[reservation.time] || 0) + 1;
        return acc;
      }, {});
    return schedules.filter(schedule => reservationCounts[schedule] >= criticalLimit);
  }
};
export default reservationStepper;
