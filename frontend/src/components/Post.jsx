import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import {
  Loader,
  MessageCircle,
  Send,
  Share2,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import PostAction from "./PostAction";

const Post = ({ post }) => {
  const { postId } = useParams();

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);

  const isOwner = authUser._id === post.author._id;
  const isLiked = post.likes.includes(authUser._id);

  const queryClient = useQueryClient();

  const { mutate: deletePost, isPending: isDeletingPost } = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/posts/delete/${post._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: createComment, isPending: isAddingComment } = useMutation({
    mutationFn: async (newComment) => {
      await axiosInstance.post(`/posts/${post._id}/comment`, {
        content: newComment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Comment added successfully");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Failed to add comment");
    },
  });

  const { mutate: likePost, isPending: isLikingPost } = useMutation({
    mutationFn: async () => {
      await axiosInstance.post(`/posts/${post._id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  const handleDeletePost = () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    deletePost();
  };

  const handleLikePost = () => {
    if (isLikingPost) return;
    likePost();
  };

  const handleAddComment = (e) => {
    e.preventDefault();

    if (newComment.trim()) {
      createComment(newComment);

      setComments([
        ...comments,
        {
          content: newComment,
          user: {
            _id: authUser._id,
            name: authUser.name,
            profilePicture: authUser.profilePicture,
          },
          createdAt: new Date(),
        },
      ]);

      setNewComment("");
    }
  };

  return (
    <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 mb-5 overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link to={`/profile/${post?.author?.username}`}>
              <img
                src={post.author.profilePicture || "/avatar.png"}
                alt={post.author.name}
                className="size-11 rounded-full mr-3 object-cover border border-base-300"
              />
            </Link>

            <div>
              <Link to={`/profile/${post?.author?.username}`}>
                <h3 className="font-semibold text-base-content hover:text-primary transition-colors">
                  {post.author.name}
                </h3>
              </Link>

              <p className="text-xs text-base-content/70">
                {post.author.headline}
              </p>

              <p className="text-xs text-base-content/50">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          {isOwner && (
            <button
              onClick={handleDeletePost}
              className="text-error hover:bg-error/10 p-2 rounded-lg transition-all"
            >
              {isDeletingPost ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <p className="mb-4 text-base-content leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Image */}
        {post.image && (
          <img
            src={post.image}
            alt="Post content"
            className="rounded-xl w-full mb-4 border border-base-300 object-cover max-h-[500px]"
          />
        )}

        {/* Actions */}
        <div className="flex justify-between border-t border-base-300 pt-3 text-base-content/70">
          <PostAction
            icon={
              <ThumbsUp
                size={18}
                className={isLiked ? "text-primary fill-primary/30" : ""}
              />
            }
            text={`Like (${post.likes.length})`}
            onClick={handleLikePost}
          />

          <PostAction
            icon={<MessageCircle size={18} />}
            text={`Comment (${comments.length})`}
            onClick={() => setShowComments(!showComments)}
          />

          <PostAction icon={<Share2 size={18} />} text="Share" />
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-5 pb-5 border-t border-base-300 bg-base-100">
          <div className="mt-4 mb-4 max-h-72 overflow-y-auto">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="mb-3 bg-base-200 rounded-xl p-3 flex items-start"
              >
                <img
                  src={comment.user.profilePicture || "/avatar.png"}
                  alt={comment.user.name}
                  className="w-9 h-9 rounded-full mr-3 flex-shrink-0 object-cover"
                />

                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {comment.user.name}
                    </span>

                    <span className="text-xs text-base-content/50">
                      {formatDistanceToNow(new Date(comment.createdAt))}
                    </span>
                  </div>

                  <p className="text-sm text-base-content">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="flex items-center">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="
                flex-grow
                px-4
                py-3
                rounded-l-xl
                border
                border-base-300
                bg-base-100
                focus:outline-none
                focus:ring-2
                focus:ring-primary/30
              "
            />

            <button
              type="submit"
              disabled={isAddingComment}
              className="
                bg-primary
                text-white
                px-4
                py-3
                rounded-r-xl
                hover:opacity-90
                transition-all
              "
            >
              {isAddingComment ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Post;
