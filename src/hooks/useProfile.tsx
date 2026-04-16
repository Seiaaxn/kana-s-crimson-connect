import { useState, useEffect, useCallback } from 'react';
import { db } from '@/integrations/firebase/config';
import { ref, onValue, update, get } from 'firebase/database';
import { useAuth } from './useAuth';

export interface Profile {
  id?: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  exp: number;
  coins: number;
  is_premium: boolean;
  premium_expires_at: string | null;
  badge: string | null;
  bio?: string | null;
  login_streak?: number;
  last_login_date?: string | null;
  created_at?: string;
  updated_at?: string;
  email?: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setProfile(null); setLoading(false); return; }
    const profileRef = ref(db, `profiles/${user.uid}`);
    const unsub = onValue(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile({ ...snapshot.val(), id: user.uid });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const snapshot = await get(ref(db, `profiles/${user.uid}`));
    if (snapshot.exists()) {
      setProfile({ ...snapshot.val(), id: user.uid });
    }
  }, [user]);

  const addExp = useCallback(async (amount: number) => {
    if (!user || !profile) return null;
    const newExp = profile.exp + amount;
    let newLevel = profile.level;
    let expNeeded = Math.floor(Math.pow(newLevel, 1.8) * 100);
    let totalExp = newExp;
    while (totalExp >= expNeeded) {
      newLevel++;
      expNeeded = Math.floor(Math.pow(newLevel, 1.8) * 100);
    }
    await update(ref(db, `profiles/${user.uid}`), { exp: newExp, level: newLevel, updated_at: new Date().toISOString() });
    return true;
  }, [user, profile]);

  const buyPremium = useCallback(async (days: number, cost: number) => {
    if (!user || !profile || profile.coins < cost) return false;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    await update(ref(db, `profiles/${user.uid}`), {
      is_premium: true,
      premium_expires_at: expiresAt.toISOString(),
      coins: profile.coins - cost,
      updated_at: new Date().toISOString(),
    });
    return true;
  }, [user, profile]);

  const addCoins = useCallback(async (amount: number) => {
    if (!user || !profile) return false;
    await update(ref(db, `profiles/${user.uid}`), {
      coins: profile.coins + amount,
      updated_at: new Date().toISOString(),
    });
    return true;
  }, [user, profile]);

  return { profile, loading, addExp, buyPremium, addCoins, fetchProfile };
}
