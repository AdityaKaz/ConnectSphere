import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  Briefcase,
  Home,
  LogOut,
  MessageSquare,
  User,
  Users,
} from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => axiosInstance.get("/notifications"),
    enabled: !!authUser,
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
  });

  const { data: connectionRequests } = useQuery({
    queryKey: ["connectionRequests"],
    queryFn: async () => axiosInstance.get("/connections/requests"),
    enabled: !!authUser,
  });

  const { mutate: logout } = useMutation({
    mutationFn: () => axiosInstance.post("/auth/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["authUser"],
      });
    },
  });

  const unreadNotificationCount =
    (Array.isArray(notifications?.data) ? notifications.data : []).filter(
      (notif) => !notif.read,
    ).length || 0;

  const unreadConnectionRequestsCount =
    (Array.isArray(connectionRequests?.data) ? connectionRequests.data : [])
      .length || 0;

  const navClass = (path) =>
    `relative flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-200
    ${
      location.pathname === path
        ? "text-primary bg-primary/10"
        : "text-neutral hover:bg-base-200 hover:text-primary"
    }`;

  return (
    <nav
      className="
        fixed top-0 left-0 right-0
        bg-base-100/90
        backdrop-blur-md
        border-b border-base-300
        z-50
      "
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              className="h-10 w-10 object-contain rounded-lg"
              src="/small-logo.png"
              alt="ConnectSphere"
            />
          </Link>

          {authUser ? (
            <div className="flex items-center gap-1 md:gap-3">
              <Link to="/" className={navClass("/")}>
                <Home size={20} />
                <span className="text-xs hidden md:block">Home</span>
              </Link>

              <Link to="/network" className={navClass("/network")}>
                <Users size={20} />
                <span className="text-xs hidden md:block">My Network</span>

                {unreadConnectionRequestsCount > 0 && (
                  <span
                    className="
                      absolute top-1 right-1
                      min-w-[18px] h-[18px]
                      px-1
                      flex items-center justify-center
                      rounded-full
                      bg-primary
                      text-white
                      text-[10px]
                      font-semibold
                    "
                  >
                    {unreadConnectionRequestsCount}
                  </span>
                )}
              </Link>

              <Link to="/notifications" className={navClass("/notifications")}>
                <Bell size={20} />
                <span className="text-xs hidden md:block">Notifications</span>

                {unreadNotificationCount > 0 && (
                  <span
                    className="
                      absolute top-1 right-1
                      min-w-[18px] h-[18px]
                      px-1
                      flex items-center justify-center
                      rounded-full
                      bg-error
                      text-white
                      text-[10px]
                      font-semibold
                    "
                  >
                    {unreadNotificationCount}
                  </span>
                )}
              </Link>

              <Link to="/jobs" className={navClass("/jobs")}>
                <Briefcase size={20} />
                <span className="text-xs hidden md:block">Jobs</span>
              </Link>

              <Link to="/messages" className={navClass("/messages")}>
                <MessageSquare size={20} />
                <span className="text-xs hidden md:block">Messages</span>
              </Link>

              <Link
                to={`/profile/${authUser.username}`}
                className={navClass(`/profile/${authUser.username}`)}
              >
                <User size={20} />
                <span className="text-xs hidden md:block">Me</span>
              </Link>

              <div className="h-8 w-px bg-base-300 mx-2" />

              <button
                onClick={() => logout()}
                className="
                  flex items-center gap-2
                  px-3 py-2
                  rounded-xl
                  text-neutral
                  hover:bg-error/10
                  hover:text-error
                  transition-all
                "
              >
                <LogOut size={18} />
                <span className="hidden md:block text-sm">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn btn-ghost rounded-xl">
                Sign In
              </Link>

              <Link to="/signup" className="btn btn-primary rounded-xl">
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
