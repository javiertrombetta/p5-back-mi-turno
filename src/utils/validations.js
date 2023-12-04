const validRoles = ["super", "admin", "oper", "user"];
const validDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const isValidDate = (dateStr) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateStr.match(regex) === null) {
      return false;
  }  
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 10) === dateStr;
};

const regexPatterns = {
  id: /^\d+$/,
  dni: /^\d{8}$/,
  name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
  fantasyName: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,-]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\d+$/,
  address: /^[a-zA-Z0-9\s,.'-]{3,}$/,
  time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  imageFormat: /\.(jpeg|jpg|png|gif)$/i,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,  
};
const validate = {
  id: id => regexPatterns.id.test(id),
  dni: dni => regexPatterns.dni.test(dni),
  name: name => regexPatterns.name.test(name),
  fantasyName: name => regexPatterns.fantasyName.test(name),
  email: email => regexPatterns.email.test(email),
  phone: number => !isNaN(number) && regexPatterns.phone.test(number),
  address: address => regexPatterns.address.test(address),
  capacity: capacity => !isNaN(capacity) && capacity > 0,
  state: state => ['pendiente', 'confirmado', 'cancelado', 'finalizado', 'ausente'].includes(state),
  date: date => !isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0,10) === date,
  time: time => regexPatterns.time.test(time),
  day: day => validDays.includes(day),
  lastLogin: lastLogin => !isNaN(Date.parse(lastLogin)),
  imageFormat: photo => regexPatterns.imageFormat.test(photo),
  password: password => regexPatterns.password.test(password),
  createResetUrl: resetToken => `${process.env.MAIL_RESET_PASSWORD_URL}/reset-password/${resetToken}`,
  turnDuration: duration => Number.isInteger(duration) && duration >= 15 && duration <= 120,
  role: role => validRoles.includes(role),
  isEnable: isEnable => typeof isEnable === 'boolean',
  schedule: schedule => Array.isArray(schedule) && schedule.every(day => 
    typeof day === 'object' && 
    validDays.includes(day.day) && 
    Array.isArray(day.disabledHours) &&
    day.disabledHours.every(time => regexPatterns.time.test(time))
  ),
  specificDates: specificDates => Array.isArray(specificDates) && specificDates.every(dateObj => 
    validate.date(dateObj.date) && 
    typeof dateObj.isDisabled === 'boolean' 
  ),
  isValidDate: (dateStr) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateStr.match(regex) === null) return false;  
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 10) === dateStr;
  },
  branchIds: branchIds => 
    Array.isArray(branchIds) && branchIds.every(id => regexPatterns.id.test(id)),
};
export default validate;
