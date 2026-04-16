import { useState, useEffect, useCallback } from 'react';
import { db } from '@/integrations/firebase/config';
import { ref, push, onValue, update, remove, get } from 'firebase/database';
import { useAuth } from './useAuth';
import type { Profile } from './useProfile';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
}

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<(Friendship & { friend_profile?: Profile })[]>([]);
  const [pendingRequests, setPendingRequests] = useState<(Friendship & { requester_profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileById = async (userId: string): Promise<Profile | undefined> => {
    const snapshot = await get(ref(db, `profiles/${userId}`));
    if (snapshot.exists()) return { ...snapshot.val(), id: userId };
    return undefined;
  };

  const fetchFriends = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const snapshot = await get(ref(db, 'friendships'));
    if (!snapshot.exists()) {
      setFriends([]);
      setPendingRequests([]);
      setLoading(false);
      return;
    }

    const all: Friendship[] = [];
    snapshot.forEach((child) => {
      all.push({ ...child.val(), id: child.key! });
    });

    const accepted = all.filter(f => f.status === 'accepted' && (f.requester_id === user.uid || f.addressee_id === user.uid));
    const enrichedFriends = await Promise.all(accepted.map(async (f) => {
      const friendId = f.requester_id === user.uid ? f.addressee_id : f.requester_id;
      const friend_profile = await fetchProfileById(friendId);
      return { ...f, friend_profile };
    }));
    setFriends(enrichedFriends);

    const pending = all.filter(f => f.status === 'pending' && f.addressee_id === user.uid);
    const enrichedPending = await Promise.all(pending.map(async (p) => {
      const requester_profile = await fetchProfileById(p.requester_id);
      return { ...p, requester_profile };
    }));
    setPendingRequests(enrichedPending);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchFriends(); }, [fetchFriends]);

  const sendRequest = useCallback(async (addresseeId: string) => {
    if (!user) return false;
    await push(ref(db, 'friendships'), {
      requester_id: user.uid,
      addressee_id: addresseeId,
      status: 'pending',
      created_at: new Date().toISOString(),
    });
    await fetchFriends();
    return true;
  }, [user, fetchFriends]);

  const acceptRequest = useCallback(async (friendshipId: string) => {
    await update(ref(db, `friendships/${friendshipId}`), { status: 'accepted' });
    await fetchFriends();
    return true;
  }, [fetchFriends]);

  const rejectRequest = useCallback(async (friendshipId: string) => {
    await remove(ref(db, `friendships/${friendshipId}`));
    await fetchFriends();
    return true;
  }, [fetchFriends]);

  const removeFriend = useCallback(async (friendshipId: string) => {
    await remove(ref(db, `friendships/${friendshipId}`));
    await fetchFriends();
    return true;
  }, [fetchFriends]);

  return { friends, pendingRequests, loading, sendRequest, acceptRequest, rejectRequest, removeFriend, fetchFriends };
}
