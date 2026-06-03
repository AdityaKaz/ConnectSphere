import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios";

function UserCard({ user, isConnection }) {
  const queryClient = useQueryClient();

  const disconnectMutation = useMutation({
    mutationFn: () => axiosInstance.delete(`/connections/${user._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center transition-all hover:shadow-md">
      <Link
        to={`/profile/${user.username}`}
        className="flex flex-col items-center"
      >
        <img
          src={user.profilePicture || "/avatar.png"}
          alt={user.name}
          className="w-24 h-24 rounded-full object-cover mb-4"
        />
        <h3 className="font-semibold text-lg text-center">{user.name}</h3>
      </Link>
      <p className="text-gray-600 text-center">{user.headline}</p>
      <p className="text-sm text-gray-500 mt-2">
        {user.connections?.length} connections
      </p>
      <div className="mt-4 w-full space-y-2">
        {isConnection ? (
          <>
            <Link
              to={`/messages?user=${user.username}`}
              className="block text-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors w-full"
            >
              Message
            </Link>
            <button
              className="block text-center bg-base-200 text-base-content px-4 py-2 rounded-md hover:bg-base-300 transition-colors w-full"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
            >
              Disconnect
            </button>
          </>
        ) : (
          <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors w-full">
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

export default UserCard;
