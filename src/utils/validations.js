const regexPatterns = {
  id: /^\d+$/,
  dni: /^\d{8}$/,
  name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\d+$/,
  address: /^[a-zA-Z0-9\s,.'-]{3,}$/,
  time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  imageFormat: /\.(jpeg|jpg|png|gif)$/i,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
};

const validate = {
  id: id => regexPatterns.id.test(id),
  dni: dni => regexPatterns.dni.test(dni),
  name: name => regexPatterns.name.test(name),
  email: email => regexPatterns.email.test(email),
  phone: number => !isNaN(number) && regexPatterns.phone.test(number),
  address: address => regexPatterns.address.test(address),
  capacity: capacity => !isNaN(capacity) && capacity > 0,
  state: state => ['pendiente', 'confirmado', 'cancelado', 'finalizado', 'ausente'].includes(state),
  date: date => !isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0,10) === date,
  time: time => regexPatterns.time.test(time),
  lastLogin: lastLogin => !isNaN(Date.parse(lastLogin)),
  imageFormat: photo => regexPatterns.imageFormat.test(photo),
  password: password => regexPatterns.password.test(password),
  createResetUrl: resetToken => `${process.env.MAIL_RESET_PASSWORD_URL}/reset-password/${resetToken}`,
};

export default validate;
