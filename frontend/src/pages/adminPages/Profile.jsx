import { useEffect, useState, useCallback } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import api from "../../services/api";
import { 
  User, 
  Mail, 
  Phone, 
  Edit2, 
  Save, 
  X, 
  Camera,
  Upload,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    bio: "",
    photo: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  /* ---------------- AOS INIT ---------------- */
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    });
  }, []);

  /* ---------------- FETCH PROFILE ---------------- */
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/profile/me");
      const userData = res.data.user;

      setUser(userData);
      setFormData({
        name: userData.name || "",
        number: userData.number || "",
        bio: userData.bio || "",
        photo: userData.photo || ""
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
      setMessage({ 
        text: error.response?.data?.message || "Failed to load profile", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* ---------------- HANDLE INPUT ---------------- */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /* ---------------- HANDLE PHOTO UPLOAD ---------------- */
 const handlePhotoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // ✅ show filename immediately
  setSelectedFileName(file.name);

  try {
    const formData = new FormData();
    formData.append("photo", file);

    const res = await api.post("/profile/upload-image", formData);

    // ✅ use cloudinary url
    const imageUrl = res.data.cloudinaryUrl;

    setFormData((prev) => ({
      ...prev,
      photo: imageUrl,
    }));

    setUser((prev) => ({
      ...prev,
      photo: imageUrl,
    }));

    setMessage({
      text: "Image uploaded successfully",
      type: "success",
    });

    // ✅ reset input (allows same file re-upload)
    e.target.value = "";

  } catch (error) {
    console.error(error);
    setMessage({
      text: error.response?.data?.message || "Image upload failed",
      type: "error",
    });
  }
};

  /* ---------------- UPDATE PROFILE ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put("/profile/me", formData);
      setUser(res.data.user);

      setMessage({ 
        text: "Profile updated successfully!", 
        type: "success" 
      });
      
      setTimeout(() => {
        setIsEditing(false);
        setMessage({ text: "", type: "" });
      }, 2000);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || "Update failed. Please try again.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8" data-aos="fade-down">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Profile <span className="text-blue-600">Settings</span>
          </h1>
          <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-aos="fade-up">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              {/* Profile Image */}
              <div className="relative group mb-6">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={
                      user?.photo
                        ? user.photo
                        : `https://ui-avatars.com/api/?name=${user?.name}&background=3B82F6&color=fff`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                {isEditing && (
                  <label className="absolute bottom-2 right-1/2 translate-x-1/2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                    <Camera size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* User Info */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-2 text-gray-600">
                  <Mail size={16} />
                  <p>{user.email}</p>
                </div>
                {user.number && (
                  <div className="flex items-center justify-center gap-2 mt-1 text-gray-600">
                    <Phone size={16} />
                    <p>{user.number}</p>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">12</p>
                  <p className="text-sm text-gray-600">Projects</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">24</p>
                  <p className="text-sm text-gray-600">Connections</p>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                  isEditing
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isEditing ? (
                  <>
                    <X size={20} />
                    Cancel Editing
                  </>
                ) : (
                  <>
                    <Edit2 size={20} />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
              <div className="flex space-x-1">
                {["profile", "settings", "security", "preferences"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      activeTab === tab
                        ? "bg-blue-600 text-white shadow"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Personal Information
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Edit2 size={18} />
                    Edit
                  </button>
                )}
              </div>

              {!isEditing ? (
                /* View Mode */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <User size={20} className="text-gray-400" />
                        <p className="text-gray-900">{user.name}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail size={20} className="text-gray-400" />
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Phone Number</label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone size={20} className="text-gray-400" />
                        <p className="text-gray-900">{user.number || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Member Since</label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-900">January 2024</p>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">About</label>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Edit Mode */
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Message Alert */}
                  {message.text && (
                    <div
                      className={`p-4 rounded-xl flex items-center gap-3 ${
                        message.type === "success"
                          ? "bg-green-50 text-green-800 border border-green-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {message.type === "success" ? (
                        <CheckCircle size={20} />
                      ) : (
                        <AlertCircle size={20} />
                      )}
                      <p className="font-medium">{message.text}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="tel"
                          name="number"
                          value={formData.number}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      About You
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Photo URL */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Profile Photo
                    </label>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => document.getElementById("fileInput").click()}
                        className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                      >
                        <Upload size={20} />
                        Upload
                      </button>

                      {/* File name display */}
                      {selectedFileName && (
                        <span className="text-sm text-gray-600 truncate max-w-55">
                          {selectedFileName}
                        </span>
                      )}

                      <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>


                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          Save Changes
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 border border-gray-300 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;