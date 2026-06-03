import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

import { Camera, Clock, MapPin, UserCheck, UserPlus, X } from "lucide-react";

const ProfileHeader = ({ userData, onSave, isOwnProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const { data: connectionStatus, refetch: refetchConnectionStatus } = useQuery(
    {
      queryKey: ["connectionStatus", userData._id],
      queryFn: () => axiosInstance.get(`/connections/status/${userData._id}`),
      enabled: !isOwnProfile,
    },
  );

  const isConnected = userData.connections.some(
    (connection) => connection === authUser._id,
  );

  const { mutate: sendConnectionRequest } = useMutation({
    mutationFn: (userId) =>
      axiosInstance.post(`/connections/request/${userId}`),
    onSuccess: () => {
      toast.success("Connection request sent");
      refetchConnectionStatus();
      queryClient.invalidateQueries(["connectionRequests"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "An error occurred");
    },
  });

  const { mutate: acceptRequest } = useMutation({
    mutationFn: (requestId) =>
      axiosInstance.put(`/connections/accept/${requestId}`),
    onSuccess: () => {
      toast.success("Connection request accepted");
      refetchConnectionStatus();
      queryClient.invalidateQueries(["connectionRequests"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "An error occurred");
    },
  });

  const { mutate: rejectRequest } = useMutation({
    mutationFn: (requestId) =>
      axiosInstance.put(`/connections/reject/${requestId}`),
    onSuccess: () => {
      toast.success("Connection request rejected");
      refetchConnectionStatus();
      queryClient.invalidateQueries(["connectionRequests"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "An error occurred");
    },
  });

  const { mutate: removeConnection } = useMutation({
    mutationFn: (userId) => axiosInstance.delete(`/connections/${userId}`),
    onSuccess: () => {
      toast.success("Connection removed");
      refetchConnectionStatus();
      queryClient.invalidateQueries(["connectionRequests"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "An error occurred");
    },
  });

  const getConnectionStatus = useMemo(() => {
    if (isConnected) return "connected";
    if (!isConnected) return "not_connected";
    return connectionStatus?.data?.status;
  }, [isConnected, connectionStatus]);

  const renderConnectionButton = () => {
    const baseClass =
      "btn rounded-xl transition-all duration-200 flex items-center justify-center gap-2";

    switch (getConnectionStatus) {
      case "connected":
        return (
          <div className="flex flex-wrap gap-3 justify-center">
            <div className={`${baseClass} btn-success`}>
              <UserCheck size={18} />
              Connected
            </div>

            <button
              className={`${baseClass} btn-error`}
              onClick={() => removeConnection(userData._id)}
            >
              <X size={18} />
              Remove Connection
            </button>
          </div>
        );

      case "pending":
        return (
          <button className={`${baseClass} btn-warning`} disabled>
            <Clock size={18} />
            Pending
          </button>
        );

      case "received":
        return (
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => acceptRequest(connectionStatus.data.requestId)}
              className={`${baseClass} btn-success`}
            >
              Accept
            </button>

            <button
              onClick={() => rejectRequest(connectionStatus.data.requestId)}
              className={`${baseClass} btn-error`}
            >
              Reject
            </button>
          </div>
        );

      default:
        return (
          <button
            onClick={() => sendConnectionRequest(userData._id)}
            className={`${baseClass} btn-primary`}
          >
            <UserPlus size={18} />
            Connect
          </button>
        );
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedData((prev) => ({
          ...prev,
          [event.target.name]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSave = () => {
    onSave(editedData);
    setIsEditing(false);
  };

  return (
    <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden mb-6">
      {/* Banner */}
      {editedData.bannerImg || userData.bannerImg ? (
        <div
          className="relative h-56 bg-cover bg-center"
          style={{
            backgroundImage: `url('${
              editedData.bannerImg || userData.bannerImg
            }')`,
          }}
        >
          {isEditing && (
            <label
              className="
              absolute top-4 right-4
              bg-base-100
              p-3
              rounded-full
              shadow-lg
              border border-base-300
              cursor-pointer
              hover:scale-105
              transition-all
            "
            >
              <Camera size={18} />

              <input
                type="file"
                className="hidden"
                name="bannerImg"
                onChange={handleImageChange}
                accept="image/*"
              />
            </label>
          )}
        </div>
      ) : (
        <div className="relative h-56 bg-gradient-to-r from-primary via-primary/90 to-accent">
          {isEditing && (
            <label
              className="
              absolute top-4 right-4
              bg-base-100
              p-3
              rounded-full
              shadow-lg
              border border-base-300
              cursor-pointer
              hover:scale-105
              transition-all
            "
            >
              <Camera size={18} />

              <input
                type="file"
                className="hidden"
                name="bannerImg"
                onChange={handleImageChange}
                accept="image/*"
              />
            </label>
          )}
        </div>
      )}

      {/* Profile Content */}
      <div className="px-8 pb-8">
        {/* Avatar */}
        <div className="relative -mt-20 mb-6">
          <img
            className="
            w-36 h-36
            rounded-full
            mx-auto
            object-cover
            border-4
            border-base-100
            shadow-xl
            bg-base-100
          "
            src={
              editedData.profilePicture ||
              userData.profilePicture ||
              "/avatar.png"
            }
            alt={userData.name}
          />

          {isEditing && (
            <label
              className="
              absolute
              bottom-2
              right-1/2
              translate-x-20
              bg-base-100
              p-3
              rounded-full
              shadow-lg
              border border-base-300
              cursor-pointer
              hover:scale-105
              transition-all
            "
            >
              <Camera size={18} />

              <input
                type="file"
                className="hidden"
                name="profilePicture"
                onChange={handleImageChange}
                accept="image/*"
              />
            </label>
          )}
        </div>

        {/* User Info */}
        <div className="text-center mb-6">
          {isEditing ? (
            <input
              type="text"
              value={editedData.name ?? userData.name}
              onChange={(e) =>
                setEditedData({
                  ...editedData,
                  name: e.target.value,
                })
              }
              className="
              text-3xl
              font-bold
              text-center
              w-full
              bg-transparent
              focus:outline-none
            "
            />
          ) : (
            <h1 className="text-3xl font-bold text-base-content mb-2">
              {userData.name}
            </h1>
          )}

          {isEditing ? (
            <input
              type="text"
              value={editedData.headline ?? userData.headline}
              onChange={(e) =>
                setEditedData({
                  ...editedData,
                  headline: e.target.value,
                })
              }
              className="
              text-lg
              text-center
              w-full
              bg-transparent
              text-base-content/70
              focus:outline-none
            "
            />
          ) : (
            <p className="text-lg text-base-content/70">{userData.headline}</p>
          )}

          <div className="flex justify-center items-center mt-3">
            <MapPin size={16} className="text-primary mr-2" />

            {isEditing ? (
              <input
                type="text"
                value={editedData.location ?? userData.location}
                onChange={(e) =>
                  setEditedData({
                    ...editedData,
                    location: e.target.value,
                  })
                }
                className="
                bg-transparent
                text-center
                text-base-content/60
                focus:outline-none
              "
              />
            ) : (
              <span className="text-base-content/60">{userData.location}</span>
            )}
          </div>

          <div className="mt-4">
            <span className="badge badge-primary badge-lg">
              {userData.connections?.length || 0} Connections
            </span>
          </div>
        </div>

        {/* Actions */}
        {isOwnProfile ? (
          isEditing ? (
            <button
              onClick={handleSave}
              className="
              btn
              btn-primary
              rounded-xl
              w-full
            "
            >
              Save Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="
              btn
              btn-primary
              rounded-xl
              w-full
            "
            >
              Edit Profile
            </button>
          )
        ) : (
          <div className="flex justify-center">{renderConnectionButton()}</div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
