import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import { formatDistanceToNow } from "date-fns";

const ApplicationsPage = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/applications");
      return res.data;
    },
    enabled: !!authUser,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-1">
        <Sidebar user={authUser} />
      </div>

      <div className="col-span-1 lg:col-span-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">My Applications</h1>

          {isLoading ? (
            <p>Loading applications...</p>
          ) : applications && applications.length > 0 ? (
            <ul className="space-y-4">
              {applications.map((app) => (
                <li key={app._id} className="border rounded p-4">
                  <h2 className="font-semibold">{app.job.title}</h2>
                  <p className="text-sm text-gray-600">
                    {app.job.company} • {app.job.location}
                  </p>
                  <p className="text-xs text-gray-500">
                    Applied{" "}
                    {formatDistanceToNow(new Date(app.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                  {app.coverLetter && (
                    <div className="mt-2">
                      <strong className="text-sm">Cover letter</strong>
                      <p className="text-sm mt-1 whitespace-pre-line">
                        {app.coverLetter}
                      </p>
                    </div>
                  )}

                  {app.resumeUrl && (
                    <div className="mt-2">
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View resume
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No applications yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsPage;
