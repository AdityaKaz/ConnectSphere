/* eslint-disable react/no-unescaped-entities */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import {
  Bell,
  ExternalLink,
  Eye,
  MessageCircle,
  MessageSquare,
  ThumbsUp,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";

const NotificationsPage = () => {
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => axiosInstance.get("/notifications"),
  });

  const { mutate: markAsReadMutation } = useMutation({
    mutationFn: (id) => axiosInstance.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });

  const { mutate: deleteNotificationMutation } = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });

      toast.success("Notification deleted");
    },
  });

  const { mutate: markAllAsReadMutation } = useMutation({
    mutationFn: () => axiosInstance.put(`/notifications/read-all`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const renderNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <ThumbsUp className="text-primary" size={18} />;

      case "comment":
        return <MessageSquare className="text-success" size={18} />;

      case "connectionAccepted":
        return <UserPlus className="text-secondary-content" size={18} />;

      case "message":
        return <MessageCircle className="text-info" size={18} />;

      case "newPost":
        return <ExternalLink size={18} className="text-primary" />;

      default:
        return <Bell size={18} />;
    }
  };

  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case "like":
        return (
          <>
            <strong>{notification.relatedUser.name}</strong> liked your post
          </>
        );

      case "comment":
        return (
          <>
            <Link
              to={`/profile/${notification.relatedUser.username}`}
              className="font-semibold hover:text-primary"
            >
              {notification.relatedUser.name}
            </Link>{" "}
            commented on your post
          </>
        );

      case "connectionAccepted":
        return (
          <>
            <Link
              to={`/profile/${notification.relatedUser.username}`}
              className="font-semibold hover:text-primary"
            >
              {notification.relatedUser.name}
            </Link>{" "}
            accepted your connection request
          </>
        );

      case "message":
        return (
          <>
            <Link
              to={`/messages?user=${notification.relatedUser.username}`}
              className="font-semibold hover:text-primary"
            >
              {notification.relatedUser.name}
            </Link>{" "}
            sent you a message
          </>
        );

      case "newPost":
        return (
          <>
            <Link
              to={`/profile/${notification.relatedUser.username}`}
              className="font-semibold hover:text-primary"
            >
              {notification.relatedUser.name}
            </Link>{" "}
            posted a new update
          </>
        );

      default:
        return null;
    }
  };

  const renderRelatedPost = (relatedPost) => {
    if (!relatedPost) return null;

    return (
      <Link
        to={`/post/${relatedPost._id}`}
        className="
          mt-3
          flex items-center gap-3
          p-3
          rounded-xl
          bg-base-200
          hover:bg-base-300
          transition-all
        "
      >
        {relatedPost.image && (
          <img
            src={relatedPost.image}
            alt="Post preview"
            className="
              w-12 h-12
              rounded-lg
              object-cover
              border border-base-300
            "
          />
        )}

        <div className="flex-1 overflow-hidden">
          <p className="text-sm truncate">{relatedPost.content}</p>
        </div>

        <ExternalLink size={16} className="text-base-content/50" />
      </Link>
    );
  };

  // When user opens the notifications page, treat all as seen.
  // This makes the navbar badge disappear immediately.
  useEffect(() => {
    if (!authUser) return;
    markAllAsReadMutation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sidebar */}
      <div className="lg:col-span-3">
        <Sidebar user={authUser} />
      </div>

      {/* Notifications */}
      <div className="lg:col-span-9">
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Bell size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>

              <p className="text-sm text-base-content/60">
                Stay updated with activity across your network
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-10">Loading notifications...</div>
          ) : notifications?.data?.length > 0 ? (
            <div className="space-y-4">
              {notifications.data.map((notification) => (
                <div
                  key={notification._id}
                  className={`
                    rounded-2xl
                    border
                    p-5
                    transition-all
                    hover:shadow-md
                    ${
                      !notification.read
                        ? "border-primary bg-primary/5"
                        : "border-base-300"
                    }
                  `}
                >
                  <div className="flex justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      <Link
                        to={`/profile/${notification.relatedUser.username}`}
                      >
                        <img
                          src={
                            notification.relatedUser.profilePicture ||
                            "/avatar.png"
                          }
                          alt={notification.relatedUser.name}
                          className="
                            w-12 h-12
                            rounded-full
                            object-cover
                            border border-base-300
                          "
                        />
                      </Link>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 rounded-full bg-base-200">
                            {renderNotificationIcon(notification.type)}
                          </div>

                          <p className="text-sm">
                            {renderNotificationContent(notification)}
                          </p>

                          {!notification.read && (
                            <span className="badge badge-primary badge-sm">
                              New
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-base-content/50">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            },
                          )}
                        </p>

                        {renderRelatedPost(notification.relatedPost)}

                        {notification.type === "message" &&
                          notification.relatedMessage && (
                            <Link
                              to={`/messages?user=${notification.relatedUser.username}`}
                              className="
                                mt-3
                                flex items-center gap-3
                                p-3
                                rounded-xl
                                bg-base-200
                                hover:bg-base-300
                                transition-all
                              "
                            >
                              <div className="flex-1 overflow-hidden">
                                <p className="text-sm truncate">
                                  {notification.relatedMessage.content}
                                </p>
                              </div>

                              <ExternalLink
                                size={16}
                                className="text-base-content/50"
                              />
                            </Link>
                          )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsReadMutation(notification._id)}
                          className="
                            btn btn-sm btn-ghost
                            rounded-xl
                          "
                          aria-label="Mark as read"
                        >
                          <Eye size={16} />
                        </button>
                      )}

                      <button
                        onClick={() =>
                          deleteNotificationMutation(notification._id)
                        }
                        className="
                          btn btn-sm btn-ghost
                          text-error
                          rounded-xl
                        "
                        aria-label="Delete notification"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-base-200 rounded-2xl border border-base-300 p-12 text-center">
              <Bell size={64} className="mx-auto mb-4 text-base-content/40" />

              <h2 className="text-xl font-semibold mb-2">No Notifications</h2>

              <p className="text-base-content/60">
                You're all caught up. New notifications will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
