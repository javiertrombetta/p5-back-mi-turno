function validateName(name) {
  const regexName = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  return regexName.test(name);
}
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function validatePhone(number) {
  const regexPhone = /^\d{10}$/;
  return !isNaN(number) && regexPhone.test(number);
}
function validateAddress(address) {
  const regexAddress = /^[a-zA-Z0-9\s,.'-]{3,}$/;
  return regexAddress.test(address);
}
function validateCapacity(capacity) {
  return !isNaN(capacity) && capacity > 0;
}
function validateTime(time) {
  const regexTime = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regexTime.test(time);
}
function validateImageFormat(photo) {
  const validImageExtensions = /\.(jpeg|jpg|png|gif)$/i;
  return validImageExtensions.test(photo);
}
export { validateName, validateEmail, validatePhone, validateAddress, validateCapacity, validateTime, validateImageFormat };