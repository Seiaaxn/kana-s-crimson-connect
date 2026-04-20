import { useState, useEffect, useCallback } from 'react';
import { db } from '@/integrations/firebase/config';
import { ref, onValue, update, get, runTransaction } from 'firebase/database';
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

const expNeededFor = (level: number) => Math.floor(Math.pow(level, 1.8) * 100);

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

  // Atomic: add EXP + coins in one transaction so they don't overwrite each other
  const addExpAndCoins = useCallback(async (expAmount: number, coinAmount: number = 0) => {
    if (!user) return null;
    const profileRef = ref(db, `profiles/${user.uid}`);
    let appliedExp = 0;
    const result = await runTransaction(profileRef, (current) => {
      if (!current) return current;
      const isPremium = !!current.is_premium && (!current.premium_expires_at || new Date(current.premium_expires_at) > new Date());
      const multiplier = isPremium ? 5 : 1;
      const gained = expAmount * multiplier;
      appliedExp = gained;
      let newExp = (current.exp || 0) + gained;
      let newLevel = current.level || 1;
      let needed = expNeededFor(newLevel);
      while (newExp >= needed) {
        newExp -= needed;
        newLevel++;
        needed = expNeededFor(newLevel);
      }
      return {
        ...current,
        exp: newExp,
        level: newLevel,
        coins: (current.coins || 0) + coinAmount,
        updated_at: new Date().toISOString(),
      };
    });
    if (!result.committed) return null;
    return { gainedExp: appliedExp, gainedCoins: coinAmount };
  }, [user]);

  const addExp = useCallback(async (amount: number) => {
    const r = await addExpAndCoins(amount, 0);
    return r ? true : null;
  }, [addExpAndCoins]);

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
    if (!user) return false;
    const profileRef = ref(db, `profiles/${user.uid}`);
    const result = await runTransaction(profileRef, (current) => {
      if (!current) return current;
      return { ...current, coins: (current.coins || 0) + amount, updated_at: new Date().toISOString() };
    });
    return result.committed;
  }, [user]);

  return { profile, loading, addExp, addExpAndCoins, buyPremium, addCoins, fetchProfile };
}
