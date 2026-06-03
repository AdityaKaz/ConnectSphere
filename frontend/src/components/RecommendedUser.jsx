import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Check, Clock, UserCheck, UserPlus, X } from "lucide-react";

const RecommendedUser = ({ user }) => {
  const queryClient = useQueryClient();

  const { data: connectionStatus, isLoading } = useQuery({
    queryKey: ["connectionStatus", user._id],
    queryFn: () => axiosInstance.get(`/connections/status/${user._id}`),
  });

  const { mutate: sendConnectionRequest } = useMutation({
    mutationFn: (userId) =>
      axiosInstance.post(`/connections/request/${userId}`),

    onSuccess: () => {
      toast.success("Connection request sent successfully");

      queryClient.invalidateQueries({
        queryKey: ["connectionStatus", user._id],
      });
    },

    onError: (error) => {
      toast.error(error.response?.data?.error || "An error occurred");
    },
  });

  const { mutate: acceptRequest } = useMutation({
    mutationFn: (requestId) =>
      axiosInstance.put(`/connections/accept/${requestId}`),

    onSuccess: () => {
      toast.success("Connection request accepted");

      queryClient.invalidateQueries({
        queryKey: ["connectionStatus", user._id],
      });
    },

    onError: (error) => {
      toast.error(error.response?.data?.error || "An error occurred");
    },
  });

  const { mutate: rejectRequest } = useMutation({
    mutationFn: (requestId) =>
      axiosInstance.put(`/connections/reject/${requestId}`),

    onSuccess: () => {
      toast.success("Connection request rejected");

      queryClient.invalidateQueries({
        queryKey: ["connectionStatus", user._id],
      });
    },

    onError: (error) => {
      toast.error(error.response?.data?.error || "An error occurred");
    },
  });

  const handleConnect = () => {
    if (
      connectionStatus?.data?.status === "not_connected" ||
      !connectionStatus?.data?.status
    ) {
      sendConnectionRequest(user._id);
    }
  };

  const renderButton = () => {
    if (isLoading) {
      return (
        <button
          className="
            btn btn-sm
            rounded-xl
            loading
          "
          disabled
        >
          Loading
        </button>
      );
    }

    switch (connectionStatus?.data?.status) {
      case "pending":
        return (
          <button
            className="
              btn btn-sm
              rounded-xl
              btn-warning
            "
            disabled
          >
            <Clock size={14} />
            Pending
          </button>
        );

      case "received":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => acceptRequest(connectionStatus.data.requestId)}
              className="
                btn btn-sm
                btn-success
                rounded-xl
              "
            >
              <Check size={16} />
            </button>

            <button
              onClick={() => rejectRequest(connectionStatus.data.requestId)}
              className="
                btn btn-sm
                btn-error
                rounded-xl
              "
            >
              <X size={16} />
            </button>
          </div>
        );

      case "connected":
        return (
          <button
            className="
              btn btn-sm
              btn-success
              rounded-xl
            "
            disabled
          >
            <UserCheck size={14} />
            Connected
          </button>
        );

      default:
        return (
          <button
            onClick={handleConnect}
            className="
              btn btn-sm
              btn-outline
              btn-primary
              rounded-xl
            "
          >
            <UserPlus size={14} />
            Connect
          </button>
        );
    }
  };

  return (
    <div
      className="
        flex items-center justify-between
        p-3
        rounded-xl
        hover:bg-base-200
        transition-all duration-200
      "
    >
      <Link
        to={`/profile/${user.username}`}
        className="flex items-center flex-grow min-w-0"
      >
        <img
          src={user.profilePicture || "/avatar.png"}
          alt={user.name}
          className="
            w-12 h-12
            rounded-full
            object-cover
            border border-base-300
            mr-3
            flex-shrink-0
          "
        />

        <div className="min-w-0">
          <h3
            className="
              font-semibold
              text-sm
              truncate
              text-base-content
            "
          >
            {user.name}
          </h3>

          <p
            className="
              text-xs
              text-base-content/60
              truncate
            "
          >
            {user.headline || "ConnectSphere User"}
          </p>
        </div>
      </Link>

      <div className="ml-3 flex-shrink-0">{renderButton()}</div>
    </div>
  );
};

export default RecommendedUser;
