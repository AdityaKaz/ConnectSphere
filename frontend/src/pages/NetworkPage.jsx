/* eslint-disable react/no-unescaped-entities */
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import { Search, UserPlus, Users } from "lucide-react";
import FriendRequest from "../components/FriendRequest";
import UserCard from "../components/UserCard";
import RecommendedUser from "../components/RecommendedUser";

const NetworkPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: user } = useQuery({
    queryKey: ["authUser"],
  });

  const { data: connectionRequests } = useQuery({
    queryKey: ["connectionRequests"],
    queryFn: () => axiosInstance.get("/connections/requests"),
  });

  const { data: connections } = useQuery({
    queryKey: ["connections"],
    queryFn: () => axiosInstance.get("/connections"),
  });

  const { data: searchResults } = useQuery({
    queryKey: ["userSearch", searchQuery],
    queryFn: () =>
      axiosInstance.get(`/users/search?q=${encodeURIComponent(searchQuery)}`),
    enabled: !!searchQuery.trim(),
  });

  const results = searchResults?.data || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-3">
        <Sidebar user={user} />
      </div>

      <div className="lg:col-span-9">
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Users size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-base-content">Network</h1>

              <p className="text-base-content/60 text-sm">
                Manage your connections, connection requests, and search users
              </p>
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Search size={24} />
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-semibold">Search People</h2>
                <p className="text-base-content/60 text-sm">
                  Find professionals to connect
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or username"
                className="input input-bordered w-full"
              />

              <button
                className="btn btn-primary"
                onClick={() => {}}
                disabled={!searchQuery.trim()}
              >
                Search
              </button>
            </div>

            {searchQuery.trim() ? (
              results.length > 0 ? (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold">Results</h3>
                    <span className="badge badge-primary">
                      {results.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {results.map((u) => (
                      <RecommendedUser key={u._id} user={u} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-base-200 rounded-2xl p-8 text-center border border-base-300 mt-6">
                  <Users
                    size={56}
                    className="mx-auto text-base-content/40 mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">No users found</h3>
                  <p className="text-base-content/60">
                    Try a different name or username.
                  </p>
                </div>
              )
            ) : null}
          </div>

          {connectionRequests?.data?.length > 0 ? (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-xl font-semibold">Connection Requests</h2>

                <span className="badge badge-primary">
                  {connectionRequests.data.length}
                </span>
              </div>

              <div className="space-y-4">
                {connectionRequests.data.map((request) => (
                  <FriendRequest
                    key={request._id || request.id}
                    request={request}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-base-200 rounded-2xl p-8 text-center mb-10 border border-base-300">
              <UserPlus size={56} className="mx-auto text-primary mb-4" />

              <h3 className="text-xl font-semibold mb-2">
                No Connection Requests
              </h3>

              <p className="text-base-content/60">
                You don't have any pending connection requests at the moment.
              </p>

              <p className="text-base-content/60 mt-2">
                Connect with professionals to grow your network.
              </p>
            </div>
          )}

          {connections?.data?.length > 0 ? (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-xl font-semibold">My Connections</h2>

                <span className="badge badge-primary">
                  {connections.data.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {connections.data.map((connection) => (
                  <UserCard
                    key={connection._id}
                    user={connection}
                    isConnection={true}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-base-200 rounded-2xl p-8 text-center border border-base-300">
              <Users size={56} className="mx-auto text-base-content/40 mb-4" />

              <h3 className="text-xl font-semibold mb-2">No Connections Yet</h3>

              <p className="text-base-content/60">
                Start connecting with other professionals to build your network.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;
