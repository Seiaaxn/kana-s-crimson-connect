import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, Trash2, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { db } from '@/integrations/firebase/config';
import { ref, get, push, remove, update, onValue, off } from 'firebase/database';
import { Link } from 'react-router-dom';
import { getLevelBadge } from '@/lib/levelUtils';

interface Comment {
  id: string;
  user_id: string;
  content_id: string;
  content_type: string;
  text: string;
  parent_id: string | null;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
    level: number;
    badge: string | null;
    is_premium: boolean;
    user_id: string;
  };
  replies?: Comment[];
}

interface CommentSectionProps {
  contentId: string;
  contentType: 'anime' | 'donghua' | 'comic';
}

export function CommentSection({ contentId, contentType }: CommentSectionProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    const commentsRef = ref(db, `comments/${contentType}/${contentId}`);
    const snapshot = await get(commentsRef);
    
    if (!snapshot.exists()) { setComments([]); setLoading(false); return; }

    const data: Comment[] = [];
    snapshot.forEach((child) => {
      data.push({ ...child.val(), id: child.key! });
    });

    const userIds = [...new Set(data.map(c => c.user_id))];
    const profiles: Record<string, any> = {};
    for (const uid of userIds) {
      const pSnap = await get(ref(db, `profiles/${uid}`));
      if (pSnap.exists()) profiles[uid] = { ...pSnap.val(), user_id: uid };
    }

    const enriched = data.map(c => ({
      ...c,
      parent_id: c.parent_id || null,
      profile: profiles[c.user_id],
    }));

    const topLevel = enriched.filter(c => !c.parent_id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const replies = enriched.filter(c => c.parent_id);
    const tree = topLevel.map(c => ({
      ...c,
      replies: replies.filter(r => r.parent_id === c.id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    }));
    setComments(tree);
    setLoading(false);
  }, [contentId, contentType]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  useEffect(() => {
    const commentsRef = ref(db, `comments/${contentType}/${contentId}`);
    const unsub = onValue(commentsRef, () => { fetchComments(); });
    return () => unsub();
  }, [contentId, contentType, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    await push(ref(db, `comments/${contentType}/${contentId}`), {
      user_id: user.uid,
      content_id: contentId,
      content_type: contentType,
      text: newComment.trim(),
      parent_id: null,
      created_at: new Date().toISOString(),
    });
    setNewComment('');
  };

  const handleReply = async (parentId: string) => {
    if (!user || !replyText.trim()) return;
    await push(ref(db, `comments/${contentType}/${contentId}`), {
      user_id: user.uid,
      content_id: contentId,
      content_type: contentType,
      text: replyText.trim(),
      parent_id: parentId,
      created_at: new Date().toISOString(),
    });
    setReplyText('');
    setReplyTo(null);
    setExpandedReplies(prev => new Set(prev).add(parentId));
  };

  const handleDelete = async (id: string) => {
    await remove(ref(db, `comments/${contentType}/${contentId}/${id}`));
  };

  const toggleReplies = (id: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours} jam lalu`;
    return `${Math.floor(diff / 86400000)} hari lalu`;
  };

  const totalComments = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);

  const renderComment = (comment: Comment, isReply = false) => {
    const badge = comment.profile ? getLevelBadge(comment.profile.level) : null;
    const hasReplies = !isReply && (comment.replies?.length || 0) > 0;
    const isExpanded = expandedReplies.has(comment.id);

    return (
      <div key={comment.id} className={`${isReply ? 'ml-10 border-l-2 border-border/30 pl-3' : ''}`}>
        <div className="flex gap-3 animate-slide-in">
          <Link to={`/user/${comment.user_id}`} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
            {comment.profile?.avatar_url ? <img src={comment.profile.avatar_url} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-secondary-foreground">{(comment.profile?.display_name || '?').charAt(0).toUpperCase()}</span>}
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link to={`/user/${comment.user_id}`} className="text-sm font-medium text-foreground hover:text-primary transition">{comment.profile?.display_name || 'User'}</Link>
              {badge && <span className="text-xs">{badge.emoji}</span>}
              <span className="text-[10px] text-primary bg-primary/10 px-1 py-0.5 rounded">Lv.{comment.profile?.level || 1}</span>
              {comment.profile?.badge && <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1 py-0.5 rounded">{comment.profile.badge}</span>}
              {comment.profile?.is_premium && <span className="text-[10px] text-yellow-500">👑</span>}
              <span className="text-[10px] text-muted-foreground">{formatTime(comment.created_at)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 break-words">{comment.text}</p>
            <div className="flex items-center gap-3 mt-1">
              {user && !isReply && (
                <button onClick={() => setReplyTo(replyTo?.id === comment.id ? null : { id: comment.id, name: comment.profile?.display_name || 'User' })} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition">
                  <Reply className="w-3 h-3" /> Balas
                </button>
              )}
              {hasReplies && (
                <button onClick={() => toggleReplies(comment.id)} className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition">
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {comment.replies!.length} balasan
                </button>
              )}
            </div>
          </div>
          {user && user.uid === comment.user_id && (
            <button onClick={() => handleDelete(comment.id)} className="p-1 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {replyTo?.id === comment.id && user && (
          <div className="ml-10 mt-2 flex gap-2">
            <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={`Balas ${replyTo.name}...`}
              className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              onKeyDown={e => { if (e.key === 'Enter') handleReply(comment.id); }} autoFocus />
            <button onClick={() => handleReply(comment.id)} disabled={!replyText.trim()} className="p-2 rounded-lg gradient-bg text-primary-foreground disabled:opacity-30">
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {hasReplies && isExpanded && (
          <div className="space-y-2 mt-2">
            {comment.replies!.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 bg-card/50 rounded-xl p-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-display font-bold text-foreground">Komentar</h2>
        <span className="text-sm text-muted-foreground">({totalComments})</span>
      </div>

      {user && profile ? (
        <form onSubmit={handleSubmit} className="flex gap-3 items-start">
          <Link to="/profile" className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center flex-shrink-0 overflow-hidden">
            {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-primary-foreground">{(profile.display_name || 'U').charAt(0).toUpperCase()}</span>}
          </Link>
          <div className="flex-1 relative">
            <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Tulis komentar..." maxLength={500} rows={2}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none pr-12" />
            <button type="submit" disabled={!newComment.trim()} className="absolute bottom-2 right-2 p-2 rounded-full gradient-bg text-primary-foreground disabled:opacity-30">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-4 bg-muted/30 rounded-xl border border-border/50">
          <p className="text-sm text-muted-foreground"><Link to="/login" className="text-primary font-medium">Masuk</Link> untuk berkomentar</p>
        </div>
      )}

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground py-4">Memuat komentar...</p>
        ) : comments.length === 0 ? (
          <div className="text-center py-6">
            <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Belum ada komentar</p>
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
}