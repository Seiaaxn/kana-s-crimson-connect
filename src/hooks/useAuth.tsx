import { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from '@/integrations/firebase/config';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { setOneSignalExternalUserId, removeOneSignalExternalUserId, sendOneSignalTag } from '@/lib/onesignal';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  resetPassword: async () => {},
  signOut: async () => {},
  loginModalOpen: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Link OneSignal user
        setOneSignalExternalUserId(firebaseUser.uid);
        sendOneSignalTag('email', firebaseUser.email || '');

        const profileRef = ref(db, `profiles/${firebaseUser.uid}`);
        const snapshot = await get(profileRef);
        if (!snapshot.exists()) {
          await set(profileRef, {
            user_id: firebaseUser.uid,
            display_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            avatar_url: firebaseUser.photoURL || null,
            email: firebaseUser.email || null,
            level: 1,
            exp: 0,
            coins: 0,
            is_premium: false,
            premium_expires_at: null,
            badge: null,
            bio: null,
            login_streak: 0,
            last_login_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          await set(ref(db, `profiles/${firebaseUser.uid}/avatar_url`), firebaseUser.photoURL || null);
          await set(ref(db, `profiles/${firebaseUser.uid}/display_name`), firebaseUser.displayName || snapshot.val().display_name);
        }
      } else {
        removeOneSignalExternalUserId();
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    setLoginModalOpen(false);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    setLoginModalOpen(false);
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName });
    }
    setLoginModalOpen(false);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
        loginModalOpen,
        openLoginModal: () => setLoginModalOpen(true),
        closeLoginModal: () => setLoginModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
