/* eslint-disable react-hooks/rules-of-hooks */
import { Briefcase } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const JobCard = ({ job }) => {
  const [expanded, setExpanded] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeData, setResumeData] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const queryClient = useQueryClient();
  const jobId = job?._id;
  const isSample = String(jobId || "").startsWith("sample-");

  if (!job) return null;

  const { mutate: applyMutate, isLoading: isApplying } = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post(`/jobs/${jobId}/apply`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Application submitted");
      queryClient.invalidateQueries(["jobs"]);
      setCoverLetter("");
      setExpanded(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to apply");
    },
  });

  const handleApply = (e) => {
    e.preventDefault();
    if (isSample) {
      toast("This is demo data — seed the DB to enable apply", { icon: "ℹ️" });
      return;
    }
    applyMutate({ coverLetter, resumeUrl: resumeData, resumeName });
  };

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="text-blue-600" size={18} />
            <h3 className="text-lg font-bold">{job.title}</h3>
          </div>
          <p className="text-gray-600">{job.company}</p>
          {job.location ? (
            <p className="text-gray-500 mt-1">📍 {job.location}</p>
          ) : null}
        </div>

        <div className="text-right text-sm text-gray-500">
          {job.type ? <div>{job.type}</div> : null}
          {job.level ? <div>{job.level}</div> : null}
        </div>
      </div>
      {job.description ? (
        <p className="text-gray-700 mt-3 line-clamp-3">{job.description}</p>
      ) : null}

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setExpanded((s) => !s)}
            className="text-sm text-blue-600 hover:underline"
          >
            {expanded ? "Hide details" : "View details"}
          </button>

          {!expanded && (
            <div>
              <button
                onClick={() => setExpanded(true)}
                className="bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {expanded && (
          <div className="mt-4 border-t pt-4 space-y-4">
            {job.description && (
              <div className="text-gray-700 whitespace-pre-line">
                {job.description}
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-4">
              <label className="block text-sm">Cover letter (optional)</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full p-2 border rounded min-h-[100px]"
              />

              <div>
                <label className="block text-sm mb-1">
                  Resume (PDF/DOC) — required
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) {
                      setResumeData(null);
                      setResumeName("");
                      return;
                    }
                    setResumeName(file.name);
                    const reader = new FileReader();
                    reader.onloadend = () => setResumeData(reader.result);
                    reader.readAsDataURL(file);
                  }}
                />
                {resumeName && (
                  <div className="text-sm text-gray-600 mt-1">
                    Selected: {resumeName}
                  </div>
                )}
              </div>

              {isSample && (
                <div className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
                  This is demo data — seed the DB to enable real applications.
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setExpanded(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={
                    "px-4 py-2 rounded " +
                    (isApplying || !resumeData
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary-dark")
                  }
                  disabled={isApplying || !resumeData}
                >
                  {isApplying ? "Applying..." : "Apply"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
