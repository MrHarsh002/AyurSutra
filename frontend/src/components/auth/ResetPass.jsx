// frontend/src/pages/ResetPassword.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword", "");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { email, newPassword, confirmPassword } = data;
      const { data: response } = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        { email, newPassword, confirmPassword }
      );
      toast.success(response.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden w-full max-w-4xl">

        {/* Left side form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            Reset Password 🔐
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <input
                type="password"
                placeholder="New Password"
                {...register("newPassword", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                {...register("confirmPassword", {
                  required: "Confirm password is required",
                  validate: (value) =>
                    value === newPassword || "Passwords do not match",
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-4 cursor-pointer py-2 rounded-lg text-white font-semibold transition-all duration-200 ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Processing..." : "Reset Password"}
            </button>
          </form>
        </div>

        {/* Right side image */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/002/174/698/small/landing-page-illustration-design-people-forgot-her-password-vector.jpg"
            alt="Reset Password"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
