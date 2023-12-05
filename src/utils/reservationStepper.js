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
  filterAvailableSchedules: (schedules, reservations, branchCapacity, queryDate) => {
    const queryDateFormatted = new Date(queryDate).toISOString().split('T')[0];
    
    const reservedTimes = reservations
      .filter(reservation => new Date(reservation.date).toISOString().split('T')[0] === queryDateFormatted)
      .reduce((acc, reservation) => {
        acc[reservation.time] = (acc[reservation.time] || 0) + 1;
        return acc;
      }, {});
  
    return schedules.filter(schedule => {
      const reservationCount = reservedTimes[schedule] || 0;
      return reservationCount < branchCapacity;
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
  },
  filterSchedulesByDate: (schedules, schedule, specificDates, queryDate) => {
    const queryDay = new Date(queryDate).getDay();
    const dayMapping = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const disabledHours = schedule
      .filter(daySchedule => daySchedule.day === dayMapping[queryDay])
      .flatMap(daySchedule => daySchedule.disabledHours);
    let filteredSchedules = schedules.filter(scheduleTime => 
      !disabledHours.some(disabledTime => 
        scheduleTime >= disabledTime.split('-')[0] && scheduleTime < disabledTime.split('-')[1]
      )
    );
    const isDateDisabled = specificDates
      .some(dateObj => dateObj.date === queryDate && dateObj.isDisabled);

    if (isDateDisabled) {
      filteredSchedules = [];
    }
    return filteredSchedules;
  },
};
export default reservationStepper;
