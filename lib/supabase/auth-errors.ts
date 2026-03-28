type AuthErrorContext = 'login' | 'signup' | 'default'

const AUTH_ERROR_TRANSLATIONS: Array<{ match: string; message: string }> = [
  { match: 'invalid login credentials', message: 'Correo o contraseña incorrectos' },
  { match: 'email not confirmed', message: 'Debes confirmar tu correo electrónico antes de iniciar sesión' },
  { match: 'too many requests', message: 'Demasiados intentos. Inténtalo de nuevo en unos minutos' },
  { match: 'already been registered', message: 'Ya existe un usuario registrado con este correo electrónico' },
  { match: 'already registered', message: 'Ya existe un usuario registrado con este correo electrónico' },
  { match: 'user already registered', message: 'Ya existe un usuario registrado con este correo electrónico' },
  { match: 'password should be at least', message: 'La contraseña debe tener al menos 6 caracteres' },
  { match: 'invalid email', message: 'El correo electrónico no es válido' },
  { match: 'unable to validate email address', message: 'El correo electrónico no es válido' },
]

export function translateSupabaseAuthError(message: string, context: AuthErrorContext = 'default'): string {
  const normalized = message.toLowerCase()

  const translation = AUTH_ERROR_TRANSLATIONS.find((entry) => normalized.includes(entry.match))
  if (translation) {
    return translation.message
  }

  if (context === 'login') {
    return 'No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo'
  }

  if (context === 'signup') {
    return 'No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo'
  }

  return 'Ocurrió un error de autenticación. Inténtalo de nuevo'
}