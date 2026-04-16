import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyActmXTykTLOnwaGJ2tbMpTnb0pg-1floU",
  authDomain: "kanachat-ffeb7.firebaseapp.com",
  databaseURL: "https://kanachat-ffeb7-default-rtdb.firebaseio.com",
  projectId: "kanachat-ffeb7",
  storageBucket: "kanachat-ffeb7.firebasestorage.app",
  messagingSenderId: "755917977291",
  appId: "1:755917977291:web:9b0bf4da0d64536697cd4e",
  measurementId: "G-PYNK0BED5P"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export default app;
