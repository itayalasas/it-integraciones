import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, department: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting to login with:', email);
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful');
      // El documento del usuario se cargará automáticamente en el listener onAuthStateChanged
    } catch (error) {
      console.error('Login error:', error);
      const authError = error as AuthError;
      
      // Provide more specific error messages
      switch (authError.code) {
        case 'auth/user-not-found':
          throw new Error('No existe una cuenta con este correo electrónico. ¿Necesitas registrarte?');
        case 'auth/wrong-password':
          throw new Error('Contraseña incorrecta');
        case 'auth/invalid-email':
          throw new Error('Correo electrónico inválido');
        case 'auth/user-disabled':
          throw new Error('Esta cuenta ha sido deshabilitada');
        case 'auth/too-many-requests':
          throw new Error('Demasiados intentos fallidos. Intenta más tarde');
        case 'auth/network-request-failed':
          throw new Error('Error de conexión. Verifica tu internet');
        case 'auth/invalid-credential':
          throw new Error('Credenciales inválidas. Verifica tu email y contraseña, o regístrate si es tu primera vez.');
        default:
          throw new Error('Error al iniciar sesión. Verifica tus credenciales o regístrate si es tu primera vez.');
      }
    }
  };

  const register = async (email: string, password: string, name: string, department: string) => {
    try {
      console.log('Attempting to register user:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Registration successful:', userCredential.user);
      
      // Create user document in Firestore
      const newUser: Omit<User, 'id'> = {
        email: email,
        name: name,
        role: email === 'pedro.ayala@segurossura.com.uy' ? 'admin' : 'requester',
        department: department,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      console.log('User document created successfully');
      
      // Cerrar sesión después del registro para que el usuario tenga que hacer login
      await signOut(auth);
      console.log('User logged out after registration');
    } catch (error) {
      console.error('Registration error:', error);
      const authError = error as AuthError;
      
      switch (authError.code) {
        case 'auth/email-already-in-use':
          throw new Error('Ya existe una cuenta con este correo electrónico. Intenta iniciar sesión.');
        case 'auth/invalid-email':
          throw new Error('Correo electrónico inválido');
        case 'auth/weak-password':
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        case 'auth/network-request-failed':
          throw new Error('Error de conexión. Verifica tu internet');
        default:
          throw new Error('Error al registrar usuario: ' + authError.message);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email || 'No user');
      setFirebaseUser(user);
      
      if (user) {
        try {
          console.log('Fetching user document for:', user.uid);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data found:', userData);
            setCurrentUser({
              id: user.uid,
              ...userData,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date()
            } as User);
          } else {
            console.log('User document not found, creating default');
            // Create a default user document if it doesn't exist (for existing Firebase Auth users)
            const defaultUser: Omit<User, 'id'> = {
              email: user.email || '',
              name: user.displayName || user.email?.split('@')[0] || 'Usuario',
              role: user.email === 'pedro.ayala@segurossura.com.uy' ? 'admin' : 'requester',
              department: 'IT',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            await setDoc(doc(db, 'users', user.uid), defaultUser);
            setCurrentUser({
              id: user.uid,
              ...defaultUser
            });
            console.log('Default user document created');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set a minimal user object if there's an error
          setCurrentUser({
            id: user.uid,
            email: user.email || '',
            name: user.displayName || user.email?.split('@')[0] || 'Usuario',
            role: user.email === 'pedro.ayala@segurossura.com.uy' ? 'admin' : 'requester',
            department: 'IT',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    firebaseUser,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};