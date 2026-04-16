import { useState, useEffect, useCallback } from 'react';
import { db } from '@/integrations/firebase/config';
import { ref, push, onValue, update, query, orderByChild, off } from 'firebase/database';
import { useAuth } from './useAuth';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url?: string | null;
  is_read: boolean;
  created_at: string;
}

export function useChat(friendId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !friendId) { setLoading(false); return; }
    
    const chatId = [user.uid, friendId].sort().join('_');
    const messagesRef = ref(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderByChild('created_at'));
    
    const unsub = onValue(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((child) => {
        const val = child.val();
        msgs.push({ ...val, id: child.key! });
        if (val.sender_id === friendId && !val.is_read) {
          update(ref(db, `chats/${chatId}/messages/${child.key}`), { is_read: true });
        }
      });
      setMessages(msgs);
      setLoading(false);
    });

    return () => off(messagesRef);
  }, [user, friendId]);

  const sendMessage = useCallback(async (content: string, imageUrl?: string) => {
    if (!user || !friendId || (!content.trim() && !imageUrl)) return false;
    const chatId = [user.uid, friendId].sort().join('_');
    const messagesRef = ref(db, `chats/${chatId}/messages`);
    const msgData: any = {
      sender_id: user.uid,
      receiver_id: friendId,
      content: content.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    };
    if (imageUrl) msgData.image_url = imageUrl;
    await push(messagesRef, msgData);
    return true;
  }, [user, friendId]);

  return { messages, loading, sendMessage };
}
