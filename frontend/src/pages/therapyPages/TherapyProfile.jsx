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
  AlertCircle,
  Bell,
  Lock,
  Globe,
  Moon,
  Palette,
  Eye,
  EyeOff,
  Trash2
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
  
  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    notifications: {
      email: true,
      push: true,
      marketing: false
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showPhone: false
    },
    preferences: {
      theme: "light",
      language: "en",
      timezone: "UTC"
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      
      // Fetch user settings if available
      if (userData.settings) {
        setSettingsForm(userData.settings);
      }
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

  /* ---------------- HANDLE SETTINGS CHANGE ---------------- */
  const handleSettingsChange = (category, field, value) => {
    setSettingsForm(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  /* ---------------- HANDLE PASSWORD CHANGE ---------------- */
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  /* ---------------- UPDATE SETTINGS ---------------- */
  const handleSaveSettings = async () => {
    try {
      setSettingsLoading(true);
      const res = await api.put("/profile/settings", settingsForm);
      
      setMessage({
        text: "Settings saved successfully!",
        type: "success"
      });
      
      // Update user settings in state
      setUser(prev => ({
        ...prev,
        settings: settingsForm
      }));
      
      setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Failed to save settings",
        type: "error"
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  /* ---------------- UPDATE PASSWORD ---------------- */
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        text: "New passwords don't match!",
        type: "error"
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({
        text: "Password must be at least 6 characters long",
        type: "error"
      });
      return;
    }
    
    try {
      setLoading(true);
      await api.put("/profile/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setMessage({
        text: "Password updated successfully!",
        type: "success"
      });
      
      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setShowPasswordFields(false);
      
      setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Failed to update password",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- HANDLE PHOTO UPLOAD ---------------- */
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await api.post("/profile/upload-image", formData);
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

  /* ---------------- RENDER SETTINGS CONTENT ---------------- */
  const renderSettingsContent = () => {
    switch (activeTab) {
      case "settings":
        return (
          <div className="space-y-6">
            {/* Notifications Settings */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="text-blue-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settingsForm.notifications.email}
                      onChange={(e) => handleSettingsChange("notifications", "email", e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-2px after:left-2px after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive push notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settingsForm.notifications.push}
                      onChange={(e) => handleSettingsChange("notifications", "push", e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-2px after:left-2px after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Marketing Emails</p>
                    <p className="text-sm text-gray-600">Receive promotional content</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settingsForm.notifications.marketing}
                      onChange={(e) => handleSettingsChange("notifications", "marketing", e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-2px after:left-2px after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="text-blue-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Privacy</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Profile Visibility</p>
                    <p className="text-sm text-gray-600">Allow others to view your profile</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settingsForm.privacy.profileVisible}
                      onChange={(e) => handleSettingsChange("privacy", "profileVisible", e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer
                     peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] 
                     after:absolute after:top-2px after:bg-white after:border-gray-300 after:border 
                     after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                    
                     </div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Show Email</p>
                    <p className="text-sm text-gray-600">Display email on profile</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settingsForm.privacy.showEmail}
                      onChange={(e) => handleSettingsChange("privacy", "showEmail", e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-2px after:left-2px after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Show Phone Number</p>
                    <p className="text-sm text-gray-600">Display phone number on profile</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settingsForm.privacy.showPhone}
                      onChange={(e) => handleSettingsChange("privacy", "showPhone", e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-2px after:left-2px after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Settings Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={settingsLoading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {settingsLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            {/* Password Change */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Lock className="text-blue-600" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900">Password & Security</h3>
                </div>
                <button
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showPasswordFields ? "Cancel" : "Change Password"}
                </button>
              </div>
              
              {showPasswordFields ? (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        placeholder="Enter new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Update Password
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <Lock className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">Your password is securely stored</p>
                  <p className="text-sm text-gray-500 mt-1">Last changed: 2 months ago</p>
                </div>
              )}
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Lock className="text-blue-600" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settingsForm.security.twoFactor}
                    onChange={(e) => handleSettingsChange("security", "twoFactor", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-2px after:left-2px after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {settingsForm.security.twoFactor && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Two-factor authentication is now enabled. You'll need to verify your identity when signing in.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-6">
            {/* Theme Preferences */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="text-blue-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Theme & Display</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Theme</label>
                  <div className="flex gap-4">
                    {["light", "dark", "auto"].map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => handleSettingsChange("preferences", "theme", theme)}
                        className={`flex-1 py-3 rounded-lg border transition-all ${
                          settingsForm.preferences.theme === theme
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Language</label>
                  <select
                    value={settingsForm.preferences.language}
                    onChange={(e) => handleSettingsChange("preferences", "language", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Timezone</label>
                  <select
                    value={settingsForm.preferences.timezone}
                    onChange={(e) => handleSettingsChange("preferences", "timezone", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time (EST)</option>
                    <option value="PST">Pacific Time (PST)</option>
                    <option value="GMT">Greenwich Mean Time (GMT)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Session Settings */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="text-blue-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Session</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Session Timeout ({settingsForm.security.sessionTimeout} minutes)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={settingsForm.security.sessionTimeout}
                    onChange={(e) => handleSettingsChange("security", "sessionTimeout", parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>5 min</span>
                    <span>120 min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Preferences Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={settingsLoading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {settingsLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default: // "profile"
        return (
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
        );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8" data-aos="fade-down">
          <h1 className="text-3xl md:text-4xl font-semibold font-serif text-gray-900">
            Profile <span className="text-blue-600">Settings</span>
          </h1>
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
                {isEditing && activeTab === "profile" && (
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
                  isEditing && activeTab === "profile"
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } ${activeTab !== "profile" ? "hidden" : ""}`}
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
                    onClick={() => {
                      setActiveTab(tab);
                      if (tab !== "profile") setIsEditing(false);
                    }}
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

            {/* Message Alert for Settings */}
            {message.text && activeTab !== "profile" && (
              <div
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
                data-aos="fade-down"
              >
                {message.type === "success" ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <p className="font-medium">{message.text}</p>
              </div>
            )}

            {/* Render Content Based on Active Tab */}
            {renderSettingsContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;