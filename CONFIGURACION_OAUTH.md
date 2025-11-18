# Configuración de Autenticación OAuth (Google y Microsoft)

## Funcionalidades Implementadas

✅ **Verificación de Email**: Los usuarios deben verificar su correo electrónico antes de poder iniciar sesión
✅ **Autenticación con Google**: Los usuarios pueden registrarse/iniciar sesión con su cuenta de Google
✅ **Autenticación con Microsoft**: Los usuarios pueden registrarse/iniciar sesión con su cuenta de Microsoft

## Configuración Requerida en Firebase Console

### 1. Habilitar Proveedores de Autenticación

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Authentication** > **Sign-in method**
4. Habilita los siguientes proveedores:

#### Google:
- Haz clic en **Google**
- Activa el toggle "Enable"
- Ingresa el **Email de soporte del proyecto** (puede ser tu correo)
- Haz clic en **Save**

#### Microsoft:
- Haz clic en **Microsoft**
- Activa el toggle "Enable"
- Ingresa el **Email de soporte del proyecto**
- Haz clic en **Save**

### 2. Configurar Dominios Autorizados

1. En **Authentication** > **Settings** > **Authorized domains**
2. Asegúrate de que estén agregados:
   - `localhost` (para desarrollo)
   - Tu dominio de producción (ej: `tudominio.com`)

### 3. Configurar Email de Verificación (Opcional)

1. En **Authentication** > **Templates**
2. Personaliza el template de **Email address verification** si lo deseas
3. El template por defecto funcionará correctamente

## Notas Importantes

- **Google OAuth**: Funciona automáticamente una vez habilitado en Firebase
- **Microsoft OAuth**: Requiere configuración adicional si usas un tenant específico (actualmente configurado para `common` que permite cuentas personales y organizacionales)
- **Verificación de Email**: Se envía automáticamente al registrarse con email/password
- **OAuth**: Los usuarios de Google/Microsoft ya vienen con email verificado automáticamente

## Flujo de Usuario

### Registro con Email/Password:
1. Usuario completa el formulario de registro
2. Se envía automáticamente un correo de verificación
3. Usuario debe hacer clic en el enlace del correo
4. Una vez verificado, puede iniciar sesión

### Inicio de Sesión con OAuth:
1. Usuario hace clic en "Continuar con Google" o "Continuar con Microsoft"
2. Se abre un popup para autenticarse
3. Si es nuevo usuario, se crea automáticamente en Firestore
4. Acceso inmediato (email ya verificado)

## Solución de Problemas

### Error: "Popup bloqueado"
- Permite popups para tu dominio en la configuración del navegador

### Error: "Ya existe una cuenta con este correo"
- El usuario debe usar el método original de registro (email/password, Google o Microsoft)

### El correo de verificación no llega
- Revisa la carpeta de spam
- Usa el botón "Reenviar correo de verificación"
- Verifica que el correo esté correcto

