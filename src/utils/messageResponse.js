const messageResponse = {
  '400': {
    'nameMissing': "Nombre completo no proporcionado.",
    'dniMissing': "DNI no proporcionado.",
    'emailMissing': "Email no proporcionado.",
    'passwordMissing': "Contraseña no proporcionada.",
    'dniInvalid': "El DNI contiene caracteres inválidos. Solo se aceptan números.",
    'emailInvalid': "El email tiene un formato incorrecto.",
    'passwordInvalid': "La contraseña no cumple con los requisitos: Solo letras y números. Mínimo: 1 letra mayúsucula, 1 letra minúscula, 1 número, 8 caracteres de largo.",
    'userExists': "El usuario ya se encuentra registrado.",
    'tokenMissing': "No hay sesión iniciada.",
    'tokenInvalid': "Token inválido o expirado.",
    'userNotFound': "Usuario no encontrado.",
    'passwordIncorrect': "La contraseña actual es incorrecta.",
    'roleInvalid': "El rol ingresado es inválido",
    'newPasswordMissing': "Se requiere la contraseña nueva.",
    'currentPasswordMissing': "Se requiere la contraseña actual.",
    'resetTokenMissing': "Se requiere un token.",
    'resetTokenExpired': "Token inválido o expirado.",
    'newPasswordInvalid': "La nueva contraseña no cumple con los requisitos mínimos.",
    'imageFormatInvalid': "El formato de imagen es inválido para la foto.",
    'phoneNumberInvalid': "El número de teléfono tiene que contener solo números.",
    'userNotAuthorized': "No autorizado para depromocionar a este operador.",
    'fullNameInvalid': "El nombre completo no puede contener caracteres especiales.",
  },
  '404': {
    'userNotFound': "Usuario no encontrado.",
    'branchNotFound': "Sucursal no encontrada",
    'businessNotFound': "Empresa no encontrada.",
    'reservationNotFound': "Reserva no encontrada.",
    'resourceNotFound': "Recurso no encontrado."
  },
  '500': {
    'serverError': "Error de servidor.",
    'databaseError': "Error al conectar con la base de datos.",
    'unexpectedError': "Error inesperado."
  },
  '204': {
    'logoutSuccess': "Deslogueado correctamente.",
    'deleteSuccess': "Eliminado con éxito.",
    'updateSuccess': "Actualizado con éxito.",
    'noContent': "Sin contenido para mostrar."
  }
};

function getMessage(infoCode, infoType) {
  return messageResponse[infoCode][infoType] || "Mensaje desconocido";
}

export default getMessage;