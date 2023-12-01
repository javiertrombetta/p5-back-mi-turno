const formatData = {
  formatDate: (date) => {
    return date.toISOString().substring(0, 10);
  },
  formatTime: (time) => {
    const timeString = time.toString().padStart(4, '0');
    return `${timeString.substring(0, 2)}:${timeString.substring(2)}`;
  },
  formatReservationData: (reservations) => {
    return reservations.map(reservation => ({
      ...reservation.get({ plain: true }),
      date: formatData.formatDate(reservation.date),
      time: formatData.formatTime(reservation.time)
    }));
  },
  formatSingleReservation: (reservation) => {
    return {
      ...reservation.get({ plain: true }),
      date: formatData.formatDate(reservation.date),
      time: formatData.formatTime(reservation.time)
    };
  }
};
export default formatData;
