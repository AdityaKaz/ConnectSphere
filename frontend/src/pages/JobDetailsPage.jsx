import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import { Briefcase, Building2, MapPin, Send, Loader2 } from "lucide-react";

const JobDetailsPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [coverLetter, setCoverLetter] = useState("");

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],

    queryFn: async () => {
      const res = await axiosInstance.get(`/jobs/${id}`);
      return res.data;
    },

    enabled: !!authUser,
  });

  const { mutate: applyMutate, isPending: isApplying } = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post(`/jobs/${id}/apply`, payload);

      return res.data;
    },

    onSuccess: () => {
      toast.success("Application submitted successfully");

      queryClient.invalidateQueries({
        queryKey: ["jobs"],
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to apply");
    },
  });

  const handleApply = () => {
    applyMutate({
      coverLetter,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin size-8 text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Job not found</h2>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sidebar */}
      <div className="lg:col-span-3">
        <Sidebar user={authUser} />
      </div>

      {/* Main Content */}
      <div className="lg:col-span-9">
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-base-300">
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                <Briefcase size={28} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-base-content">
                  {job.title}
                </h1>

                <div className="mt-3 flex flex-wrap gap-4 text-sm text-base-content/70">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} />
                    {job.company}
                  </div>

                  {job.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      {job.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>

              <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
                <p className="whitespace-pre-line leading-relaxed text-base-content">
                  {job.description || "No description available."}
                </p>
              </div>
            </div>

            {/* Application Form */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Apply for this Position
              </h2>

              <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
                <label className="block text-sm font-medium mb-3">
                  Cover Letter (Optional)
                </label>

                <textarea
                  placeholder="Tell the employer why you're a good fit for this role..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="
                    w-full
                    min-h-[180px]
                    p-4
                    rounded-xl
                    border
                    border-base-300
                    bg-base-100
                    resize-none
                    focus:outline-none
                    focus:ring-2
                    focus:ring-primary/30
                  "
                />

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleApply}
                    disabled={isApplying}
                    className="
                      btn
                      btn-primary
                      rounded-xl
                      min-w-[160px]
                    "
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Apply Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
