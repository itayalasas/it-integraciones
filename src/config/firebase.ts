import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDxU6EkH2IeST-eX1VVJ9hrrtTl5nV8BDI",
  authDomain: "integraciones-88c88.firebaseapp.com",
  projectId: "integraciones-88c88",
  storageBucket: "integraciones-88c88.firebasestorage.app",
  messagingSenderId: "313292543918",
  appId: "1:313292543918:web:6d9dc0f62bcbdca4049a3f",
  measurementId: "G-07QJ6Y2V70"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

// Enable persistence for offline support
import { enableNetwork, disableNetwork } from 'firebase/firestore';

export { enableNetwork, disableNetwork };

export default app;