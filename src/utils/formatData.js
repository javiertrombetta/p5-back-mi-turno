export function formatDate(date) {
  return date.toISOString().substring(0, 10);
}
export function formatTime(time) {
  const timeString = time.toString().padStart(4, '0');
  return `${timeString.substring(0, 2)}:${timeString.substring(2)}`;
}
export function formatReservationData(reservations) {
  return reservations.map(reservation => ({
    ...reservation.get({ plain: true }),
    date: formatDate(reservation.date),
    time: formatTime(reservation.time)
  }));
}
export function formatSingleReservation(reservation) {
  return {
    ...reservation.get({ plain: true }),
    date: formatDate(reservation.date),
    time: formatTime(reservation.time)
  };
}