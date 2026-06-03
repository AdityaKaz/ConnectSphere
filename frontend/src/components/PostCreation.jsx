import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Image, Loader } from "lucide-react";

const PostCreation = ({ user }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const queryClient = useQueryClient();

  const { mutate: createPostMutation, isPending } = useMutation({
    mutationFn: async (postData) => {
      const res = await axiosInstance.post("/posts/create", postData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return res.data;
    },

    onSuccess: () => {
      resetForm();
      toast.success("Post created successfully");

      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create post");
    },
  });

  const handlePostCreation = async () => {
    try {
      const postData = {
        content,
      };

      if (image) {
        postData.image = await readFileAsDataURL(image);
      }

      createPostMutation(postData);
    } catch (error) {
      console.error("Error in handlePostCreation:", error);
    }
  };

  const resetForm = () => {
    setContent("");
    setImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    setImage(file);

    if (file) {
      readFileAsDataURL(file).then(setImagePreview);
    } else {
      setImagePreview(null);
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-5">
      {/* Top Section */}
      <div className="flex gap-4">
        <img
          src={user.profilePicture || "/avatar.png"}
          alt={user.name}
          className="
            size-12
            rounded-full
            object-cover
            border
            border-base-300
            flex-shrink-0
          "
        />

        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="
            w-full
            p-4
            rounded-2xl
            bg-base-200
            border
            border-base-300
            resize-none
            min-h-[110px]
            focus:outline-none
            focus:ring-2
            focus:ring-primary/30
            focus:border-primary/30
            transition-all
          "
        />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="mt-4">
          <img
            src={imagePreview}
            alt="Selected"
            className="
              w-full
              rounded-2xl
              border
              border-base-300
              object-cover
              max-h-[500px]
            "
          />
        </div>
      )}

      {/* Bottom Section */}
      <div className="flex justify-between items-center mt-5 pt-4 border-t border-base-300">
        {/* Upload Button */}
        <label
          className="
            flex items-center gap-2
            px-4 py-2
            rounded-xl
            cursor-pointer
            text-base-content/70
            hover:bg-base-200
            hover:text-primary
            transition-all
          "
        >
          <Image size={20} />

          <span className="font-medium">Photo</span>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>

        {/* Share Button */}
        <button
          onClick={handlePostCreation}
          disabled={isPending || (!content.trim() && !image)}
          className="
            btn
            btn-primary
            rounded-xl
            min-w-[100px]
          "
        >
          {isPending ? <Loader className="size-5 animate-spin" /> : "Share"}
        </button>
      </div>
    </div>
  );
};

export default PostCreation;
