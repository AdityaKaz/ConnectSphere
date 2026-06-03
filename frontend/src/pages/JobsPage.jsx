import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import JobCard from "../components/JobCard";
import JobSearchBar from "../components/JobSearchBar";
import { Briefcase } from "lucide-react";

const JobsPage = () => {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (q) params.set("q", q);
    if (location) params.set("location", location);
    if (sortBy) params.set("sortBy", sortBy);

    return params.toString();
  }, [q, location, sortBy]);

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const { data: jobsFromApi, isLoading } = useQuery({
    queryKey: ["jobs", q, location, sortBy],

    queryFn: async () => {
      const res = await axiosInstance.get(`/jobs?${queryString}`);
      return res.data;
    },

    enabled: !!authUser,
  });

  const jobs = jobsFromApi || [];

  const filteredJobs = useMemo(() => {
    let list = jobs.slice();

    if (q) {
      const qLower = q.toLowerCase();

      list = list.filter(
        (job) =>
          (job.title && job.title.toLowerCase().includes(qLower)) ||
          (job.company && job.company.toLowerCase().includes(qLower)),
      );
    }

    if (location) {
      const locLower = location.toLowerCase();

      list = list.filter(
        (job) => job.location && job.location.toLowerCase().includes(locLower),
      );
    }

    if (sortBy === "oldest") {
      list.sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
      );
    } else {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || Date.now()) -
          new Date(a.createdAt || Date.now()),
      );
    }

    return list;
  }, [jobs, q, location, sortBy]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sidebar */}
      <div className="hidden lg:block lg:col-span-3">
        <Sidebar user={authUser} />
      </div>

      {/* Jobs Section */}
      <div className="col-span-1 lg:col-span-9">
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Briefcase size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-base-content">Jobs</h1>

              <p className="text-sm text-base-content/60">
                Find opportunities that match your skills and interests
              </p>
            </div>
          </div>

          {/* Search */}
          <JobSearchBar
            q={q}
            setQ={setQ}
            location={location}
            setLocation={setLocation}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {/* Loading */}
          {isLoading && (
            <div className="mt-6">
              <div className="bg-base-200 rounded-xl p-4 border border-base-300">
                <p className="text-sm text-base-content/60">Loading jobs...</p>
              </div>
            </div>
          )}

          {/* Results Count */}
          {!isLoading && (
            <div className="mt-6 mb-4">
              <p className="text-sm text-base-content/60">
                {filteredJobs.length} job
                {filteredJobs.length !== 1 ? "s" : ""} found
              </p>
            </div>
          )}

          {/* Jobs */}
          {filteredJobs.length > 0 ? (
            <div className="space-y-5">
              {filteredJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            !isLoading && (
              <div className="mt-8 bg-base-200 rounded-2xl border border-base-300 p-12 text-center">
                <Briefcase
                  size={64}
                  className="mx-auto mb-4 text-base-content/40"
                />

                <h2 className="text-xl font-semibold mb-2">No Jobs Found</h2>

                <p className="text-base-content/60">
                  Try adjusting your search keywords or location filters.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
