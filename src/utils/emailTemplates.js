
import validations from './validations.js';

const createEmailOptions = (to, subject, htmlContent) => ({
  from: process.env.MAIL_USERNAME,
  to,
  subject,
  html: htmlContent
});
const emailTemplates = {
  welcome: user => `<h3>¡Hola, ${user.fullName}!</h3>
                    <p>¡Tu cuenta fue creada exitosamente!</p>
                    <p>Ya podés iniciar sesión y empezar a usar la aplicación.</p>
                    <p>Saludos,</p>
                    <p><b>Grupo 6 de Mi Turno Web App</b></p>`,

  forgotPassword: (user, resetUrl) => `<h3>¡Hola, ${user.fullName || ''}!</h3>
                                       <p>Por favor, hacé clic en el siguiente enlace para restablecer tu contraseña:</p>
                                       <p><a href="${resetUrl}">Hacé clic sobre este mismo link</a></p>
                                       <p>Si no solicitaste restablecer tu contraseña, por favor ignorá este correo electrónico.</p>
                                       <p>Saludos,</p>
                                       <p><b>Grupo 6 de Mi Turno Web App</b></p>`,

  resetPasswordConfirmation: user => `<h4>¡Tu contraseña fue cambiada exitosamente!</h4> 
                                       <p>Si no hiciste este cambio de contraseña, por favor comunicate con nuestro equipo de soporte.</p>
                                       <p>Si realizaste este cambio, no es necesario que realices ninguna otra acción.</p>
                                       <p>Saludos,</p>
                                       <p><b>Grupo 6 de Mi Turno Web App</b></p>`,

  adminResetPassword: (user, resetUrl) => `<h3>¡Hola, ${user.fullName || ''}!</h3>
                                            <p>Un administrador ha solicitado restablecer tu contraseña. Por favor, hacé clic en el siguiente enlace:</p>
                                            <p><a href="${resetUrl}">Hacé clic sobre este mismo link</a></p>
                                            <p>Si no solicitaste restablecer tu contraseña, por favor ignorá este correo electrónico.</p>
                                            <p>Saludos,</p>
                                            <p><b>Grupo 6 de Mi Turno Web App</b></p>`,

  createUser: (newUser, resetUrl) => `<h3>¡Bienvenido/a ${newUser.fullName}!</h3>
                                       <p>Por favor, creá tu contraseña haciendo clic en el siguiente enlace:</p> 
                                       <p><a href="${resetUrl}">Hacé clic en este mismo link</a></p>
                                       <p>Si no solicitaste crear una contraseña, por favor ignorá este correo electrónico.</p>
                                       <p>Saludos,</p>
                                       <p><b>Grupo 6 de Mi Turno Web App</b></p>`,

  createReservation: (user, reservationDetails) => `<h3>Hola ${user.fullName},</h3>
                                                     <p>Tu reserva se creó con éxito:</p>
                                                     <ul>
                                                     <li>Fecha: ${reservationDetails.date}</li>
                                                     <li>Hora: ${reservationDetails.time}</li>
                                                     <li>Sucursal: ${reservationDetails.branchId}</li>
                                                     </ul>
                                                     <p>Su estado actual es: <b>PENDIENTE</b></p>
                                                     <p>¡Gracias por utilizar nuestro servicio!</p>
                                                     <p>Saludos cordiales,</p>
                                                     <p><b>Grupo 6 de Mi Turno Web App</b></p>`
};
const welcomeEmailOptions = user => createEmailOptions(user.email, 'Bienvenido/a a Mi Turno Web App', emailTemplates.welcome(user));
const forgotPasswordEmailOptions = (user, resetToken) => {
  const resetUrl = validations.createResetUrl(resetToken);
  return createEmailOptions(user.email, 'Restablecimiento de Contraseña', emailTemplates.forgotPassword(user, resetUrl));
};
const resetPasswordConfirmationEmailOptions = user => createEmailOptions(user.email, 'Confirmación de Cambio de Contraseña', emailTemplates.resetPasswordConfirmation(user));
const adminResetPasswordEmailOptions = (user, resetToken) => {
  const resetUrl = validations.createResetUrl(resetToken);
  return createEmailOptions(user.email, 'Restablecimiento de Contraseña', emailTemplates.adminResetPassword(user, resetUrl));
};
const createUserEmailOptions = (user, resetToken) => {
  const resetUrl = validations.createResetUrl(resetToken);
  return createEmailOptions(user.email, 'Establece tu contraseña', emailTemplates.createUser(user, resetUrl)
  );
};
const createReservationEmailOptions = (user, reservationDetails) => createEmailOptions(user.email, 'Confirmación de Reserva', emailTemplates.createReservation(user, reservationDetails));
export { welcomeEmailOptions, forgotPasswordEmailOptions, resetPasswordConfirmationEmailOptions, adminResetPasswordEmailOptions, createUserEmailOptions, createReservationEmailOptions };
