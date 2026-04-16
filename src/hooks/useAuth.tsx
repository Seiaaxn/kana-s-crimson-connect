import { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from '@/integrations/firebase/config';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, GoogleAuthProvider, type User } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { setOneSignalExternalUserId, removeOneSignalExternalUserId, sendOneSignalTag } from '@/lib/onesignal';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
