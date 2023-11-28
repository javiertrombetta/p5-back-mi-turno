import validations from './validations.js';

const createEmailOptions = (to, subject, htmlContent) => ({
  from: process.env.MAIL_USERNAME,
  to,
  subject,
  html: htmlContent
});
const emailTemplates = {
  welcome: (user) => createEmailOptions(user.email, 'Bienvenido/a a Mi Turno Web App', `
    <h3>¡Hola, ${user.fullName}!</h3>
    <p>¡Tu cuenta fue creada exitosamente!</p>
    <p>Ya podés iniciar sesión y empezar a usar la aplicación.</p>
    <p>Saludos,</p>
    <p><b>Grupo 6 de Mi Turno Web App</b></p>
  `),
  forgotPassword: (user, resetToken) => {
    const resetUrl = validations.createResetUrl(resetToken);
    return createEmailOptions(user.email, 'Restablecimiento de Contraseña', `
      <h3>¡Hola, ${user.fullName || ''}!</h3>
      <p>Por favor, hacé clic en el siguiente enlace para restablecer tu contraseña:</p>
      <p><a href="${resetUrl}">Hacé clic sobre este mismo link</a></p>
      <p>Si no solicitaste restablecer tu contraseña, por favor ignorá este correo electrónico.</p>
      <p>Saludos,</p>
      <p><b>Grupo 6 de Mi Turno Web App</b></p>
    `);
  },
  resetPasswordConfirmation: (user) => createEmailOptions(user.email, 'Confirmación de Cambio de Contraseña', `
    <h4>¡Tu contraseña fue cambiada exitosamente!</h4>
    <p>Si no hiciste este cambio de contraseña, por favor comunicate con nuestro equipo de soporte.</p>
    <p>Si realizaste este cambio, no es necesario que realices ninguna otra acción.</p>
    <p>Saludos,</p>
    <p><b>Grupo 6 de Mi Turno Web App</b></p>
  `),
  adminResetPassword: (user, resetToken) => {
    const resetUrl = validations.createResetUrl(resetToken);
    return createEmailOptions(user.email, 'Restablecimiento de Contraseña', `
      <h3>¡Hola, ${user.fullName || ''}!</h3>
      <p>Un administrador ha solicitado restablecer tu contraseña. Por favor, hacé clic en el siguiente enlace:</p>
      <p><a href="${resetUrl}">Hacé clic sobre este mismo link</a></p>
      <p>Si no solicitaste restablecer tu contraseña, por favor ignorá este correo electrónico.</p>
      <p>Saludos,</p>
      <p><b>Grupo 6 de Mi Turno Web App</b></p>
    `);
  },
  createUser: (user, resetToken) => {
    const resetUrl = validations.createResetUrl(resetToken);
    return createEmailOptions(user.email, 'Establece tu contraseña', `
      <h3>¡Bienvenido/a ${user.fullName}!</h3>
      <p>Por favor, creá tu contraseña haciendo clic en el siguiente enlace:</p>
      <p><a href="${resetUrl}">Hacé clic en este mismo link</a></p>
      <p>Si no solicitaste crear una contraseña, por favor ignorá este correo electrónico.</p>
      <p>Saludos,</p>
      <p><b>Grupo 6 de Mi Turno Web App</b></p>
    `);
  },
  createReservation: (user, reservationDetails) => createEmailOptions(user.email, 'Confirmación de Reserva', `
    <h3>Hola ${user.fullName},</h3>
    <p>Tu reserva se creó con éxito:</p>
    <ul>
      <li>Fecha: ${reservationDetails.date}</li>
      <li>Hora: ${reservationDetails.time}</li>
      <li>Sucursal: ${reservationDetails.branchId}</li>
    </ul>
    <p>Su estado actual es: <b>PENDIENTE</b></p>
    <p>¡Gracias por utilizar nuestro servicio!</p>
    <p>Saludos cordiales,</p>
    <p><b>Grupo 6 de Mi Turno Web App</b></p>
  `),
  accountDeletion: (user) => createEmailOptions(user.email, 'Cuenta Eliminada en Mi Turno Web App', `
    <h3>¡Hola, ${user.fullName}!</h3>
    <p>Lamentamos informarte que tu cuenta en Mi Turno Web App ha sido eliminada.</p>
    <p>Si crees que esto es un error, por favor contacta con nuestro soporte.</p>
    <p>Gracias por haber sido parte de nuestra comunidad.</p>
    <p>Saludos,</p>
    <p><b>Grupo 6 de Mi Turno Web App</b></p>
  `),
  passwordChanged: (user) => createEmailOptions(user.email, 'Cambio de Contraseña en Mi Turno Web App', `
    <h3>¡Hola, ${user.fullName}!</h3>
    <p>Tu contraseña en Mi Turno Web App ha sido cambiada exitosamente.</p>
    <p>Si no realizaste este cambio, por favor contacta inmediatamente con nuestro equipo de soporte.</p>
    <p>Saludos,</p>
    <p><b>Grupo 6 de Mi Turno Web App</b></p>
  `),
  userDetailsUpdated: (user, updatedFields) => createEmailOptions(user.email, 'Actualización de Datos en Mi Turno Web App', `
    <h3>¡Hola, ${user.fullName}!</h3>
    <p>Tus datos en Mi Turno Web App han sido actualizados.</p>
    <p>Cambios realizados:</p>
    <ul>
      ${updatedFields.map(field => `<li>${field}</li>`).join('')}
    </ul>
    <p>Si no realizaste estos cambios, por favor contacta inmediatamente con nuestro equipo de soporte.</p>
    <p>Saludos,</p>
    <p><b>Grupo 6 de Mi Turno Web App</b></p>
  `)
};
export default emailTemplates;
