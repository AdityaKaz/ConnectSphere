/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { X } from "lucide-react";

const ApplyModal = ({ job, isOpen, onClose }) => {
  const [coverLetter, setCoverLetter] = useState("");
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const isSample = String(job._id).startsWith("sample-");

  const { mutate: applyMutate, isLoading } = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post(`/jobs/${job._id}/apply`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Application submitted");
      queryClient.invalidateQueries(["jobs"]);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to apply");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSample) {
      toast("This is demo data — seed the DB to enable apply", { icon: "ℹ️" });
      return;
    }
    applyMutate({ coverLetter });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-xl p-6 z-10">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold mb-2">Apply to {job.title}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {job.company} • {job.location}
        </p>

        {isSample && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
            This is demo data — seeding the database enables real applications.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm mb-1">Cover letter (optional)</label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full p-2 border rounded mb-4 min-h-[120px]"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-white"
              disabled={isLoading}
            >
              {isLoading ? "Applying..." : "Apply"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;
