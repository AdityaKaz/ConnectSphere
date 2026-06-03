import { Link } from "react-router-dom";

export default function Sidebar({ user }) {
  return (
    <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden sticky top-24">
      {/* Banner */}
      {user?.bannerImg ? (
        <div
          className="h-28 bg-cover bg-center"
          style={{
            backgroundImage: `url("${user.bannerImg}")`,
          }}
        />
      ) : (
        <div className="h-28 bg-gradient-to-r from-primary via-primary/90 to-accent" />
      )}

      {/* Profile Section */}
      <div className="px-6 pb-6 text-center">
        <Link to={`/profile/${user.username}`}>
          <img
            src={user.profilePicture || "/avatar.png"}
            alt={user.name}
            className="
              w-24 h-24
              rounded-full
              mx-auto
              -mt-12
              border-4 border-base-100
              object-cover
              shadow-lg
              bg-base-100
            "
          />

          <h2 className="text-xl font-semibold mt-4 text-base-content">
            {user.name}
          </h2>
        </Link>

        <p className="text-sm text-base-content/70 mt-1">
          {user.headline || "ConnectSphere User"}
        </p>

        <div className="mt-3">
          <span className="text-xs font-medium text-base-content/60">
            {user.connections?.length || 0} Connections
          </span>
        </div>
      </div>

      {/* Profile CTA */}
      <div className="border-t border-base-300 p-4">
        <Link
          to={`/profile/${user.username}`}
          className="
            block
            text-center
            w-full
            py-3
            rounded-xl
            font-medium
            text-primary
            hover:bg-primary/10
            transition-all duration-200
          "
        >
          Visit Your Profile
        </Link>
      </div>
    </div>
  );
}
