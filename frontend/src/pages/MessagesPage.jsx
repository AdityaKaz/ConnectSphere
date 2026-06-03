import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Link, useSearchParams } from "react-router-dom";
import { Send, MessageSquare, Search } from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

const MessagesPage = () => {
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedUsername = searchParams.get("user") || "";
  const [content, setContent] = useState("");

  const { data: conversations } = useQuery({
    queryKey: ["messageConversations"],
    queryFn: async () =>
      (await axiosInstance.get("/messages/conversations")).data,
    enabled: !!authUser,
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
  });

  const { data: selectedUserProfile, isLoading: isUserLoading } = useQuery({
    queryKey: ["messageTargetUser", selectedUsername],
    queryFn: async () =>
      (await axiosInstance.get(`/users/${selectedUsername}`)).data,
    enabled: !!authUser && !!selectedUsername,
  });

  const selectedUserId = selectedUserProfile?._id || "";

  const { data: threadData, isLoading: isThreadLoading } = useQuery({
    queryKey: ["messageThread", selectedUserId],
    queryFn: async () =>
      (await axiosInstance.get(`/messages/${selectedUserId}`)).data,
    enabled: !!authUser && !!selectedUserId,
  });

  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (messageContent) => {
      const res = await axiosInstance.post(`/messages/${selectedUserId}`, {
        content: messageContent,
      });
      return res.data;
    },

    onSuccess: () => {
      setContent("");

      queryClient.invalidateQueries({
        queryKey: ["messageThread", selectedUserId],
      });

      queryClient.invalidateQueries({
        queryKey: ["messageConversations"],
      });

      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send message");
    },
  });

  useEffect(() => {
    if (!selectedUsername && conversations?.length > 0) {
      const firstConversation = conversations[0];

      const otherUser = firstConversation.participants.find(
        (participant) => participant._id !== authUser?._id,
      );

      if (otherUser?.username) {
        setSearchParams({ user: otherUser.username }, { replace: true });
      }
    }
  }, [selectedUsername, conversations, authUser, setSearchParams]);

  const threadMessages = useMemo(
    () => threadData?.messages || [],
    [threadData],
  );

  const handleOpenUser = (username) => {
    if (!username) return;
    setSearchParams({ user: username });
  };

  const handleSend = (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    sendMessage(content.trim());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sidebar */}
      <div className="hidden lg:block lg:col-span-3">
        <Sidebar user={authUser} />
      </div>

      {/* Main Content */}
      <div className="lg:col-span-9">
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden min-h-[75vh]">
          {/* Header */}
          <div className="border-b border-base-300 p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <MessageSquare size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-base-content">
                  Messages
                </h1>

                <p className="text-sm text-base-content/60">
                  Stay connected with your network
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();

                const formData = new FormData(e.currentTarget);

                handleOpenUser(String(formData.get("username") || "").trim());

                e.currentTarget.reset();
              }}
              className="flex gap-2"
            >
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
                />

                <input
                  name="username"
                  placeholder="Search username..."
                  className="
                    pl-10
                    pr-4
                    h-11
                    rounded-xl
                    border
                    border-base-300
                    bg-base-100
                    focus:outline-none
                    focus:ring-2
                    focus:ring-primary/20
                  "
                />
              </div>

              <button
                className="
                  btn
                  btn-primary
                  rounded-xl
                "
              >
                Open
              </button>
            </form>
          </div>

          {/* Chat Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[calc(75vh-92px)]">
            {/* Conversations */}
            <div className="border-r border-base-300 p-4 overflow-y-auto">
              <h2 className="font-semibold mb-4">Conversations</h2>

              <div className="space-y-3">
                {conversations?.length ? (
                  conversations.map((conversation) => {
                    const otherUser = conversation.participants.find(
                      (participant) => participant._id !== authUser?._id,
                    );

                    const isActive = otherUser?.username === selectedUsername;

                    return (
                      <button
                        key={conversation._id}
                        onClick={() => handleOpenUser(otherUser?.username)}
                        className={`
                          w-full
                          text-left
                          p-4
                          rounded-2xl
                          border
                          transition-all
                          duration-200
                          ${
                            isActive
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-base-300 hover:bg-base-200"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={otherUser?.profilePicture || "/avatar.png"}
                            alt={otherUser?.name || "User"}
                            className="
                              w-12 h-12
                              rounded-full
                              object-cover
                              border
                              border-base-300
                            "
                          />

                          <div className="min-w-0">
                            <div className="font-semibold truncate">
                              {otherUser?.name}
                            </div>

                            <div className="text-xs text-base-content/50 truncate">
                              @{otherUser?.username}
                            </div>

                            <div className="text-sm text-base-content/70 truncate mt-1">
                              {conversation.lastMessage?.content ||
                                "No messages yet"}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-10">
                    <MessageSquare
                      size={48}
                      className="mx-auto text-base-content/30 mb-3"
                    />

                    <p className="text-sm text-base-content/60">
                      No conversations yet
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 flex flex-col">
              {!selectedUsername ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-base-content/60">
                  <MessageSquare size={64} className="mb-4 opacity-40" />

                  <p>Select a conversation to start messaging</p>
                </div>
              ) : isUserLoading || isThreadLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  Loading conversation...
                </div>
              ) : selectedUserProfile ? (
                <>
                  {/* Chat Header */}
                  <div className="border-b border-base-300 p-5 flex items-center gap-4">
                    <img
                      src={selectedUserProfile.profilePicture || "/avatar.png"}
                      alt={selectedUserProfile.name}
                      className="
                        w-12 h-12
                        rounded-full
                        object-cover
                        border
                        border-base-300
                      "
                    />

                    <div>
                      <Link
                        to={`/profile/${selectedUserProfile.username}`}
                        className="font-semibold hover:text-primary"
                      >
                        {selectedUserProfile.name}
                      </Link>

                      <p className="text-sm text-base-content/50">
                        @{selectedUserProfile.username}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-base-200">
                    {threadMessages.length > 0 ? (
                      threadMessages.map((message) => {
                        const isMine =
                          String(message.sender?._id) === String(authUser?._id);

                        return (
                          <div
                            key={message._id}
                            className={`flex ${
                              isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`
                                max-w-[70%]
                                rounded-2xl
                                px-4
                                py-3
                                shadow-sm
                                ${
                                  isMine
                                    ? "bg-primary text-primary-content"
                                    : "bg-base-100 border border-base-300"
                                }
                              `}
                            >
                              <p className="whitespace-pre-line text-sm">
                                {message.content}
                              </p>

                              <p
                                className={`text-[11px] mt-2 ${
                                  isMine ? "opacity-80" : "text-base-content/40"
                                }`}
                              >
                                {new Date(message.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-base-content/50 py-10">
                        No messages yet. Say hello 👋
                      </div>
                    )}
                  </div>

                  {/* Composer */}
                  <form
                    onSubmit={handleSend}
                    className="
                      border-t
                      border-base-300
                      p-4
                      flex
                      gap-3
                      bg-base-100
                    "
                  >
                    <input
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write a message..."
                      className="
                        flex-1
                        px-4
                        py-3
                        rounded-xl
                        border
                        border-base-300
                        bg-base-100
                        focus:outline-none
                        focus:ring-2
                        focus:ring-primary/20
                      "
                    />

                    <button
                      type="submit"
                      disabled={isSending || !content.trim()}
                      className="
                        btn
                        btn-primary
                        rounded-xl
                      "
                    >
                      <Send size={16} />
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-base-content/60">
                  User not found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
