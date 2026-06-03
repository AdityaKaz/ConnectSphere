import { useEffect, useState } from "react";
import { MapPin, Search, ArrowUpDown } from "lucide-react";

const JobSearchBar = ({
  q,
  setQ,
  location,
  setLocation,
  sortBy,
  setSortBy,
}) => {
  const [qLocal, setQLocal] = useState(q || "");
  const [locLocal, setLocLocal] = useState(location || "");

  useEffect(() => {
    setQLocal(q || "");
  }, [q]);

  useEffect(() => {
    setLocLocal(location || "");
  }, [location]);

  useEffect(() => {
    const t = setTimeout(() => setQ(qLocal), 300);
    return () => clearTimeout(t);
  }, [qLocal, setQ]);

  useEffect(() => {
    const t = setTimeout(() => setLocation(locLocal), 300);
    return () => clearTimeout(t);
  }, [locLocal, setLocation]);

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-base-content/50
            "
          />

          <input
            type="text"
            value={qLocal}
            onChange={(e) => setQLocal(e.target.value)}
            placeholder="Search jobs, companies..."
            className="
              w-full
              h-12
              pl-11
              pr-4
              rounded-xl
              border
              border-base-300
              bg-base-100
              focus:outline-none
              focus:ring-2
              focus:ring-primary/20
              focus:border-primary
              transition-all
            "
          />
        </div>

        {/* Location */}
        <div className="relative">
          <MapPin
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-base-content/50
            "
          />

          <input
            type="text"
            value={locLocal}
            onChange={(e) => setLocLocal(e.target.value)}
            placeholder="Location"
            className="
              w-full
              h-12
              pl-11
              pr-4
              rounded-xl
              border
              border-base-300
              bg-base-100
              focus:outline-none
              focus:ring-2
              focus:ring-primary/20
              focus:border-primary
              transition-all
            "
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-base-content/50
              pointer-events-none
            "
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="
              w-full
              h-12
              pl-11
              pr-4
              rounded-xl
              border
              border-base-300
              bg-base-100
              focus:outline-none
              focus:ring-2
              focus:ring-primary/20
              focus:border-primary
              transition-all
            "
          >
            <option value="newest">Newest First</option>

            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default JobSearchBar;
