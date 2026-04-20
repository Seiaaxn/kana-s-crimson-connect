import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/integrations/firebase/config';
import { ref, onValue, update, get, runTransaction, push, set } from 'firebase/database';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

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

export type ExpSource =
  | 'watch_anime'
  | 'watch_donghua'
  | 'read_comic'
  | 'level_up_bonus'
  | 'daily_bonus'
  | 'other';

export interface ExpActivity {
  id?: string;
  source: ExpSource;
  exp: number;
  coins: number;
  content_id?: string | null;
  content_title?: string | null;
  created_at: string;
}

const expNeededFor = (level: number) => Math.floor(Math.pow(level, 1.8) * 100);
const levelUpCoinBonus = (level: number) => Math.floor(level * 5 + 10);

function fireLevelUpConfetti() {
  const duration = 1500;
  const end = Date.now() + duration;
  const colors = ['#ef2950', '#ff6b8a', '#ffd166', '#ffffff'];
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 }, colors });
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const lastLevelRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) { setProfile(null); setLoading(false); lastLevelRef.current = null; return; }
    const profileRef = ref(db, `profiles/${user.uid}`);
    const unsub = onValue(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = { ...snapshot.val(), id: user.uid } as Profile;
        setProfile(data);
        if (lastLevelRef.current === null) lastLevelRef.current = data.level || 1;
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

  const logActivity = useCallback(async (
    source: ExpSource,
    exp: number,
    coins: number,
    contentId?: string,
    contentTitle?: string,
  ) => {
    if (!user) return;
    try {
      const listRef = ref(db, `exp_activity/${user.uid}`);
      const newRef = push(listRef);
      await set(newRef, {
        source,
        exp,
        coins,
        content_id: contentId || null,
        content_title: contentTitle || null,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      // non-fatal
      console.warn('Failed to log EXP activity', e);
    }
  }, [user]);

  // Atomic: add EXP + coins in one transaction so they don't overwrite each other
  const addExpAndCoins = useCallback(async (
    expAmount: number,
    coinAmount: number = 0,
    meta?: { source?: ExpSource; contentId?: string; contentTitle?: string },
  ) => {
    if (!user) return null;
    const profileRef = ref(db, `profiles/${user.uid}`);
    let appliedExp = 0;
    let levelsGained = 0;
    let bonusCoins = 0;
    let newLevelFinal = 1;
    const result = await runTransaction(profileRef, (current) => {
      if (!current) return current;
      const isPremium = !!current.is_premium && (!current.premium_expires_at || new Date(current.premium_expires_at) > new Date());
      const multiplier = isPremium ? 5 : 1;
      const gained = expAmount * multiplier;
      appliedExp = gained;
      let newExp = (current.exp || 0) + gained;
      let newLevel = current.level || 1;
      let needed = expNeededFor(newLevel);
      let gainedLevels = 0;
      let extraCoins = 0;
      while (newExp >= needed) {
        newExp -= needed;
        newLevel++;
        gainedLevels++;
        extraCoins += levelUpCoinBonus(newLevel);
        needed = expNeededFor(newLevel);
      }
      levelsGained = gainedLevels;
      bonusCoins = extraCoins;
      newLevelFinal = newLevel;
      return {
        ...current,
        exp: newExp,
        level: newLevel,
        coins: (current.coins || 0) + coinAmount + extraCoins,
        updated_at: new Date().toISOString(),
      };
    });
    if (!result.committed) return null;

    // Log primary activity
    if (meta?.source) {
      logActivity(meta.source, appliedExp, coinAmount, meta.contentId, meta.contentTitle);
    }

    // Handle level-up celebration & bonus log
    if (levelsGained > 0) {
      logActivity('level_up_bonus', 0, bonusCoins, undefined, `Level ${newLevelFinal}`);
      lastLevelRef.current = newLevelFinal;
      fireLevelUpConfetti();
      toast.success(`🎉 LEVEL UP! Lv.${newLevelFinal}`, {
        description: `Selamat! Kamu naik ${levelsGained > 1 ? `${levelsGained} level` : '1 level'} dan dapat +${bonusCoins} koin bonus!`,
        duration: 5000,
      });
    }

    return { gainedExp: appliedExp, gainedCoins: coinAmount + bonusCoins, levelsGained, bonusCoins };
  }, [user, logActivity]);

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
