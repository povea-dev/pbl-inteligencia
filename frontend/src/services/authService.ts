import { auth, db } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  getIdToken,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
} from "firebase/auth";
import {
  doc, getDoc, setDoc, serverTimestamp,
} from "firebase/firestore";
import type { AppUser, UserRole } from "../types";

/**
 * Detecta el rol del usuario basado en el dominio del correo electrónico
 * @param email - Correo electrónico del usuario
 * @returns 'teacher' | 'student' | null (null si no se puede detectar)
 */
export function detectRoleFromEmail(email: string | null | undefined): UserRole | null {
  if (!email) return null;
  
  const emailLower = email.toLowerCase();
  
  // Docentes: @uautonoma.cl
  if (emailLower.endsWith('@uautonoma.cl')) {
    return 'teacher';
  }
  
  // Estudiantes: @cloud.uautonoma.cl
  if (emailLower.endsWith('@cloud.uautonoma.cl')) {
    return 'student';
  }
  
  // No se puede detectar automáticamente
  return null;
}

export async function register(email: string, password: string, role: UserRole, firstName: string, lastName: string) {
  // Si no se especifica rol, intentar detectarlo del correo
  let finalRole = role;
  if (!role) {
    const detectedRole = detectRoleFromEmail(email);
    if (detectedRole) {
      finalRole = detectedRole;
    } else {
      // Si no se puede detectar, usar 'student' por defecto
      finalRole = 'student';
    }
  }
  
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  
  // Enviar email de verificación con URL de acción personalizada
  // Firebase reemplazará {CODE} con el código real en el email
  const actionCodeSettings = {
    url: `${window.location.origin}/login`,
    handleCodeInApp: true,
  };
  
  await sendEmailVerification(cred.user, actionCodeSettings);
  
  const ref = doc(db, "users", cred.user.uid);
  const fullName = `${firstName} ${lastName}`;
  // Normalizar el email antes de guardarlo (minúsculas, sin espacios)
  const normalizedEmail = email.toLowerCase().trim();
  
  await setDoc(ref, {
    uid: cred.user.uid,
    email: normalizedEmail,
    role: finalRole,
    firstName,
    lastName,
    displayName: fullName,
    emailVerified: false,
    hasSeenTutorial: false, // Marcar que no ha visto el tutorial
    createdAt: serverTimestamp(),
  }, { merge: true });
  return cred.user;
}

export async function login(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  
  // Verificar si el email está verificado
  if (!cred.user.emailVerified) {
    // Reenviar email de verificación si no está verificado
    await sendEmailVerification(cred.user);
    throw new Error('Por favor, verifica tu correo electrónico antes de iniciar sesión. Se ha enviado un nuevo correo de verificación.');
  }
  
  return cred.user;
}

// Autenticación con Google
export async function signInWithGoogle(role?: UserRole | null): Promise<{ user: User; needsRoleSelection: boolean }> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  
  // Suprimir warnings de COOP (Cross-Origin-Opener-Policy)
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (args[0]?.includes?.('Cross-Origin-Opener-Policy')) {
      return; // Suprimir este warning específico
    }
    originalError.apply(console, args);
  };
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Verificar si el usuario ya existe en Firestore
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // NUNCA crear el usuario automáticamente - SIEMPRE debe seleccionar su rol primero
      // Esto aplica incluso si se puede detectar el rol del correo
      console.error = originalError; // Restaurar console.error
      return { user, needsRoleSelection: true };
    } else {
      // Actualizar emailVerified si cambió
      await setDoc(userRef, {
        emailVerified: user.emailVerified,
      }, { merge: true });
      
      console.error = originalError; // Restaurar console.error
      return { user, needsRoleSelection: false };
    }
  } catch (error) {
    console.error = originalError; // Restaurar console.error en caso de error
    throw error;
  }
}

// Autenticación con Microsoft
export async function signInWithMicrosoft(role?: UserRole | null): Promise<{ user: User; needsRoleSelection: boolean }> {
  const provider = new OAuthProvider('microsoft.com');
  provider.setCustomParameters({
    prompt: 'consent',
    tenant: 'common' // Permite cuentas personales y organizacionales
  });
  
  // Suprimir warnings de COOP (Cross-Origin-Opener-Policy)
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (args[0]?.includes?.('Cross-Origin-Opener-Policy')) {
      return; // Suprimir este warning específico
    }
    originalError.apply(console, args);
  };
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Verificar si el usuario ya existe en Firestore
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Detectar rol automáticamente del correo
      let finalRole = role || detectRoleFromEmail(user.email);
      const needsRoleSelection = !finalRole;
      
      // Solo crear el usuario en Firestore si se puede detectar el rol automáticamente
      // Si no se puede detectar, el usuario debe seleccionar su rol primero
      if (finalRole) {
        // Crear nuevo usuario con rol detectado
        const displayName = user.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Normalizar el email antes de guardarlo (minúsculas, sin espacios)
        const normalizedEmail = user.email ? user.email.toLowerCase().trim() : user.email;
        
        await setDoc(userRef, {
          uid: user.uid,
          email: normalizedEmail,
          role: finalRole,
          firstName,
          lastName,
          displayName,
          emailVerified: user.emailVerified,
          hasSeenTutorial: false, // Marcar que no ha visto el tutorial
          createdAt: serverTimestamp(),
        }, { merge: true });
        
        console.error = originalError; // Restaurar console.error
        return { user, needsRoleSelection: false };
      } else {
        // No crear el usuario todavía, necesita seleccionar rol
        console.error = originalError; // Restaurar console.error
        return { user, needsRoleSelection: true };
      }
    } else {
      // Actualizar emailVerified si cambió
      await setDoc(userRef, {
        emailVerified: user.emailVerified,
      }, { merge: true });
      
      console.error = originalError; // Restaurar console.error
      return { user, needsRoleSelection: false };
    }
  } catch (error) {
    console.error = originalError; // Restaurar console.error en caso de error
    throw error;
  }
}

// Actualizar rol del usuario
export async function updateUserRole(userId: string, newRole: UserRole): Promise<void> {
  const userRef = doc(db, "users", userId);
  
  // Si el usuario no existe todavía, crearlo con el rol seleccionado
  const userSnap = await getDoc(userRef);
  const { auth } = await import("../config/firebase");
  const currentUser = auth.currentUser;
  
  if (!userSnap.exists() && currentUser) {
    // Crear el usuario con el rol seleccionado
    const displayName = currentUser.displayName || '';
    const nameParts = displayName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Normalizar el email antes de guardarlo (minúsculas, sin espacios)
    const normalizedEmail = currentUser.email ? currentUser.email.toLowerCase().trim() : currentUser.email;
    
    await setDoc(userRef, {
      uid: userId,
      email: normalizedEmail,
      role: newRole,
      firstName,
      lastName,
      displayName,
      emailVerified: currentUser.emailVerified,
      hasSeenTutorial: false,
      createdAt: serverTimestamp(),
    }, { merge: true });
  } else {
    // Solo actualizar el rol si el usuario ya existe
    await setDoc(userRef, {
      role: newRole
    }, { merge: true });
  }
}

// Marcar que el usuario ha visto el tutorial
export async function markTutorialAsSeen(userId: string): Promise<void> {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, {
    hasSeenTutorial: true
  }, { merge: true });
}

// Verificar email usando el código de acción de Firebase
export async function verifyEmailWithCode(oobCode: string): Promise<{ email: string; needsLogin: boolean }> {
  try {
    // Verificar el código de acción para obtener información
    const info = await checkActionCode(auth, oobCode);
    const email = info.data.email;
    
    // Aplicar el código para verificar el email
    await applyActionCode(auth, oobCode);
    
    // Verificar si el usuario está autenticado
    const needsLogin = !auth.currentUser || auth.currentUser.email !== email;
    
    // Si el usuario está autenticado, recargar para actualizar el estado
    if (auth.currentUser && auth.currentUser.email === email) {
      await auth.currentUser.reload();
    }
    
    return { email: email || '', needsLogin };
  } catch (error: any) {
    console.error('Error verificando email:', error);
    throw new Error('El link de verificación es inválido o ha expirado. Por favor, solicita un nuevo correo de verificación.');
  }
}

// Reenviar email de verificación
export async function resendVerificationEmail() {
  if (!auth.currentUser) {
    throw new Error('No hay usuario autenticado');
  }
  await sendEmailVerification(auth.currentUser);
}

export async function logout() {
  await signOut(auth);
}

export async function getCurrentUserWithRole(u: User | null): Promise<AppUser | null> {
  if (!u) return null;
  const snap = await getDoc(doc(db, "users", u.uid));
  const userData = snap.exists() ? snap.data() : {};
  const role = (userData?.role || "student") as UserRole;
  
  // Actualizar emailVerified en Firestore si cambió (solo si realmente cambió)
  // Esto evita actualizaciones innecesarias que pueden causar bucles
  if (snap.exists() && 
      userData.emailVerified !== u.emailVerified && 
      typeof userData.emailVerified !== 'undefined') {
    // Usar updateDoc en lugar de setDoc para evitar re-triggers
    try {
      await setDoc(doc(db, "users", u.uid), {
        emailVerified: u.emailVerified
      }, { merge: true });
    } catch (error) {
      // Ignorar errores de actualización para evitar bucles
      console.warn('Error actualizando emailVerified:', error);
    }
  }
  
  return { 
    uid: u.uid, 
    email: u.email, 
    role, 
    displayName: userData?.displayName || u.displayName || undefined,
    firstName: userData?.firstName,
    lastName: userData?.lastName,
    hasSeenTutorial: userData?.hasSeenTutorial ?? false
  };
}

export function onAuth(cb: (u: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function getFirebaseIdToken(): Promise<string | null> {
  if (!auth.currentUser) return null;
  return await getIdToken(auth.currentUser, true);
}

/**
 * Envía un email para restablecer la contraseña
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const actionCodeSettings = {
    // URL a la que Firebase redirigirá después de verificar el código
    // Esta URL debe estar en la lista de dominios autorizados en Firebase Console
    url: `${window.location.origin}/login`,
    // handleCodeInApp: true hace que Firebase intente abrir la URL directamente
    // sin mostrar su página intermedia (si el dominio está autorizado)
    handleCodeInApp: true,
  };
  
  await sendPasswordResetEmail(auth, email, actionCodeSettings);
}

/**
 * Restablece la contraseña usando el código de acción
 */
export async function resetPasswordWithCode(oobCode: string, newPassword: string): Promise<void> {
  await confirmPasswordReset(auth, oobCode, newPassword);
}
