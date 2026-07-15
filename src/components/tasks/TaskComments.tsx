import React, { useState } from 'react';
import { TaskComment } from '@/types';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { TaskStorage } from '@/storage/TaskStorage';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface TaskCommentsProps {
  taskId: string;
  comments: TaskComment[];
  onUpdate: () => void;
}

export function TaskComments({ taskId, comments, onUpdate }: TaskCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('Workspace Member'); // Placeholder author

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    TaskStorage.addComment(taskId, newComment.trim(), author.trim() || 'Anonymous');
    setNewComment('');
    onUpdate();
  };

  const handleDelete = (commentId: string) => {
    TaskStorage.deleteComment(taskId, commentId);
    onUpdate();
  };

  // Sort chronologically: newest at bottom
  const sortedComments = [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {sortedComments.map(comment => (
          <div key={comment.id} className="flex gap-2.5 items-start bg-surface-secondary/40 border border-surface-border p-3 rounded-xl hover:bg-surface-secondary/60 transition-all group">
            {/* Avatar Circle */}
            <div className="w-6 h-6 rounded-full bg-brand-yellow text-content-primary flex items-center justify-center text-[10px] font-bold uppercase flex-shrink-0 mt-0.5">
              {comment.author.slice(0, 2)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-content-primary truncate">{comment.author}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-content-muted">
                    {formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true })}
                  </span>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-content-muted hover:text-red-500 p-0.5 rounded"
                    title="Delete comment"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-content-secondary mt-1 whitespace-pre-wrap leading-relaxed">
                {comment.message}
              </p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-6 text-content-muted flex flex-col items-center justify-center">
            <MessageSquare size={20} className="mb-1.5 opacity-30" />
            <p className="text-xs italic">No comments yet. Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} className="space-y-2 border-t border-surface-border pt-3">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            className="input h-7 px-2.5 text-[10px] w-40 bg-surface-secondary/80 focus:bg-white"
            placeholder="Commenter name..."
            value={author}
            onChange={e => setAuthor(e.target.value)}
          />
          <span className="text-[10px] text-content-muted">(Author name)</span>
        </div>
        <div className="flex gap-2 items-end">
          <textarea
            className="textarea text-xs flex-1 h-14 min-h-[48px]"
            placeholder="Add a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button 
            type="submit" 
            disabled={!newComment.trim()} 
            className="btn-primary h-8 px-3 rounded-lg"
          >
            <Send size={12} />
          </button>
        </div>
      </form>
    </div>
  );
}
