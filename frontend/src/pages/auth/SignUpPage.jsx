import { Link } from "react-router-dom";
import SignUpForm from "../../components/auth/SignUpForm";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand Section */}
        <div className="text-center mb-8">
          <img
            className="mx-auto h-32 w-auto"
            src="/logo.svg"
            alt="ConnectSphere"
          />

          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Make the most of your professional life
          </h2>
        </div>

        {/* Signup Card */}
        <div className="bg-white shadow-lg rounded-xl p-8">
          <SignUpForm />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>

              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already on ConnectSphere?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="
                  w-full flex justify-center
                  py-2 px-4
                  rounded-md
                  text-sm font-medium
                  text-blue-600
                  hover:bg-gray-50
                "
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
