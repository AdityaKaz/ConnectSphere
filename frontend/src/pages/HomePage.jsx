import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import PostCreation from "../components/PostCreation";
import Post from "../components/Post";
import { Users } from "lucide-react";
import RecommendedUser from "../components/RecommendedUser";

const HomePage = () => {
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const { data: recommendedUsers } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/suggestions");
      return res.data;
    },
  });

  const { data: posts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/posts");
      return res.data;
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Sidebar */}
      <div className="hidden lg:block lg:col-span-3">
        <Sidebar user={authUser} />
      </div>

      {/* Feed */}
      <div className="col-span-1 lg:col-span-6 order-first lg:order-none">
        <div className="max-w-2xl mx-auto space-y-5">
          <PostCreation user={authUser} />

          {posts?.map((post) => (
            <Post key={post._id} post={post} />
          ))}

          {posts?.length === 0 && (
            <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-10 text-center">
              <div className="mb-6">
                <Users size={64} className="mx-auto text-primary" />
              </div>

              <h2 className="text-2xl font-bold text-base-content mb-3">
                No Posts Yet
              </h2>

              <p className="text-base-content/70">
                Connect with other professionals to start seeing posts in your
                feed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Users */}
      {recommendedUsers?.length > 0 && (
        <div className="hidden lg:block lg:col-span-3">
          <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-5 sticky top-24">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <Users size={18} />
              People you may know
            </h2>

            <div className="space-y-4">
              {recommendedUsers.map((user) => (
                <RecommendedUser key={user._id} user={user} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
