import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

import ProfileHeader from "../components/ProfileHeader";
import AboutSection from "../components/AboutSection";
import ExperienceSection from "../components/ExperienceSection";
import EducationSection from "../components/EducationSection";
import SkillsSection from "../components/SkillsSection";

import toast from "react-hot-toast";
import { Loader2, User } from "lucide-react";

const ProfilePage = () => {
  const { username } = useParams();

  const queryClient = useQueryClient();

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
  });

  const { data: userProfile, isLoading: isUserProfileLoading } = useQuery({
    queryKey: ["userProfile", username],

    queryFn: () =>
      axiosInstance.get(`/users/${username}`),
  });

  const { mutate: updateProfile } = useMutation({
    mutationFn: async (updatedData) => {
      await axiosInstance.put(
        "/users/profile",
        updatedData
      );
    },

    onSuccess: () => {
      toast.success("Profile updated successfully");

      queryClient.invalidateQueries({
        queryKey: ["userProfile", username],
      });

      queryClient.invalidateQueries({
        queryKey: ["authUser"],
      });
    },
  });

  if (isLoading || isUserProfileLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2
          className="
            size-10
            animate-spin
            text-primary
          "
        />
      </div>
    );
  }

  const isOwnProfile =
    authUser.username === userProfile.data.username;

  const userData = isOwnProfile
    ? authUser
    : userProfile.data;

  const handleSave = (updatedData) => {
    updateProfile(updatedData);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <div
          className="
            bg-base-100
            rounded-2xl
            border
            border-base-300
            shadow-sm
            p-5
            flex
            items-center
            gap-4
          "
        >
          <div
            className="
              p-3
              rounded-xl
              bg-primary/10
              text-primary
            "
          >
            <User size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-base-content">
              {isOwnProfile
                ? "My Profile"
                : `${userData.name}'s Profile`}
            </h1>

            <p className="text-sm text-base-content/60">
              Professional profile and career information
            </p>
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="space-y-6">
        <ProfileHeader
          userData={userData}
          isOwnProfile={isOwnProfile}
          onSave={handleSave}
        />

        <AboutSection
          userData={userData}
          isOwnProfile={isOwnProfile}
          onSave={handleSave}
        />

        <ExperienceSection
          userData={userData}
          isOwnProfile={isOwnProfile}
          onSave={handleSave}
        />

        <EducationSection
          userData={userData}
          isOwnProfile={isOwnProfile}
          onSave={handleSave}
        />

        <SkillsSection
          userData={userData}
          isOwnProfile={isOwnProfile}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
