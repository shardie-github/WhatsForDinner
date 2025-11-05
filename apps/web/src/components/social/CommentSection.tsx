"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { hapticTap } from "@/components/gamification/Haptics";

export default function CommentSection({ postId }: { postId: number }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [postId]);

  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(display_name, avatar_url)")
      .eq("post_id", postId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });
    
    if (data) setComments(data);
    setLoading(false);
  }

  async function addComment() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !newComment.trim()) return;

    const { error } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: user.id, body: newComment });

    if (!error) {
      setNewComment("");
      hapticTap();
      loadComments();
    }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading comments...</div>;

  return (
    <div className="space-y-3 mt-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          onKeyPress={e => e.key === "Enter" && addComment()}
          placeholder="Add a comment..."
          className="flex-1 rounded-lg border border-border p-2 text-sm"
        />
        <button
          onClick={addComment}
          className="px-4 rounded-lg bg-primary text-primary-fg text-sm"
          disabled={!newComment.trim()}
        >
          Post
        </button>
      </div>

      {comments.length > 0 && (
        <div className="space-y-2">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 text-sm">
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                {comment.profiles?.avatar_url ? (
                  <img src={comment.profiles.avatar_url} alt="" className="h-6 w-6 rounded-full" />
                ) : (
                  <span className="text-xs">{(comment.profiles?.display_name || "U")[0]}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{comment.profiles?.display_name || "Anonymous"}</div>
                <div>{comment.body}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(comment.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
