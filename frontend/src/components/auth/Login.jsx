import { useEffect,useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from "../../contexts/AuthContext";
import { FaLock, FaUser, FaSpinner, FaGoogle, FaFacebookF, FaEye, FaEyeSlash, FaSignInAlt, FaLeaf, FaShieldAlt, FaCalendarCheck, FaChartLine, FaHeartbeat } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    mode: 'onChange'
  });

  const [showPassword, setShowPassword] = useState(false);

  // Initialize AOS animations
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    });
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      const role = user.role;
      
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "doctor") navigate("/doctor/dashboard");
      else if (role === "patient") navigate("/patient/dashboard");
      else if (role === "therapist") navigate("/therapy/dashboard");
      else navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const onSubmit = async (data) => {
    try {
      // Validate Remember Me before submission
      if (!data.rememberMe) {
        toast.warning('Please check "Remember me" to proceed', {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          style: { right: '1rem' }
        });
        return;
      }

      const loginData = await login(data.email, data.password);

      if (!loginData) return;

      toast.success("Welcome back! Login successful!", { 
        autoClose: 2500,
        position: "top-right"
      });

      const role = loginData?.user?.role;
      
      if (role === "patient") navigate("/patient/dashboard");
      else if (role === "doctor") navigate("/doctor/dashboard");
      else if (role === "admin") navigate("/admin/dashboard");
      else if (role === "therapy") navigate("/therapy/dashboard");
      else navigate("/login");

    } catch (err) {
      // Handle specific backend errors
      const errorMessage = err.response?.data?.error || "Login failed. Please check your credentials.";
      
      if (err.response?.status === 401) {
        setError('root', {
          type: 'manual',
          message: 'Invalid email or password'
        });
        toast.error("Invalid email or password. Please try again.");
      } else if (err.response?.status === 403) {
        setError('root', {
          type: 'manual',
          message: 'Account is disabled. Please contact administrator.'
        });
        toast.error("Account is disabled. Please contact administrator.");
      } else if (err.response?.status === 404) {
        setError('root', {
          type: 'manual',
          message: 'User not found. Please check your email.'
        });
        toast.error("User not found. Please check your email.");
      } else if (err.response?.status === 429) {
        setError('root', {
          type: 'manual',
          message: 'Too many attempts. Please try again later.'
        });
        toast.error("Too many login attempts. Please try again in 15 minutes.");
      } else {
        setError('root', {
          type: 'manual',
          message: errorMessage
        });
        toast.error(errorMessage);
      }
    }
  };

  const handleSocialLogin = (provider) => {
    toast.info(`${provider} login integration is under development!`, {
      position: "top-right",
      autoClose: 2000,
      style: { right: '1rem' }
    });
  };

  // Clear root error when user starts typing
  const handleInputChange = (fieldName) => {
    if (errors.root) {
      clearErrors('root');
    }
    if (errors[fieldName]) {
      clearErrors(fieldName);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-emerald-50 to-teal-100">
        <div className="text-center">
          <FaLeaf className="animate-pulse text-6xl text-emerald-600 mx-auto mb-4" />
          <div className="flex items-center space-x-2">
            <FaSpinner className="animate-spin text-2xl text-emerald-500" />
            <span className="text-emerald-700 font-medium">Loading AyurSutra...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-linear-to-br from-emerald-50 via-white to-teal-50 p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      {/* Main Horizontal Container */}
      <div className="w-full max-w-6xl relative z-10 my-8" data-aos="fade-up">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            
            {/* Left Side - Login Form */}
            <div className="lg:w-1/2 p-8 md:p-12">
              {/* Header */}
              <div className="text-center mb-10" data-aos="fade-right">
                <div className="inline-flex items-center justify-center p-5 bg-linear-to-r from-emerald-500 to-teal-600 rounded-full shadow-2xl mb-6">
                  <FaLeaf className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-emerald-900 tracking-tight mb-3">
                  Welcome Back<span className="text-emerald-500"> to AyurSutra!</span>
                </h1>
                {errors.root && (
                  <div 
                    className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                    data-aos="fade-up"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{errors.root.message}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-8" data-aos="fade-up" data-aos-delay="200">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  className="group flex items-center justify-center py-4 px-4 border-2 border-gray-200 rounded-2xl text-gray-800 hover:bg-red-50 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                  <FaGoogle className="h-6 w-6 text-red-500 mr-3 group-hover:scale-125 transition-transform" />
                  <span className="text-sm font-semibold">Google</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Facebook')}
                  className="group flex items-center justify-center py-4 px-4 border-2 border-gray-200 rounded-2xl text-gray-800 hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                  <FaFacebookF className="h-6 w-6 text-blue-600 mr-3 group-hover:scale-125 transition-transform" />
                  <span className="text-sm font-semibold">Facebook</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-8" data-aos="fade-up" data-aos-delay="300">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or sign in with email</span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-aos="fade-up" data-aos-delay="400">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative group">
                    <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className={`pl-12 w-full px-4 py-4 rounded-xl border-2 ${
                        errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                      } bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 ${
                        errors.email ? 'focus:ring-red-100' : 'focus:ring-emerald-100'
                      } transition-all duration-300`}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Please enter a valid email address'
                        },
                        onChange: () => handleInputChange('email')
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative group">
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className={`pl-12 pr-12 w-full px-4 py-4 rounded-xl border-2 ${
                        errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                      } bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 ${
                        errors.password ? 'focus:ring-red-100' : 'focus:ring-emerald-100'
                      } transition-all duration-300`}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        },
                        onChange: () => handleInputChange('password')
                      })}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                      {...register('rememberMe')}
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 cursor-pointer hover:text-emerald-700 transition-colors">
                      Remember me
                    </label>
                  </div>
                  <Link to="/reset-password" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-4 px-6 border border-transparent text-xl font-bold rounded-2xl text-white bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-3" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="mr-3" />
                      Sign In to Dashboard
                    </>
                  )}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
                    Create an account
                  </Link>
                </p>
              </div>
            </div>

            {/* Right Side - Image with Overlay Content */}
            <div className="lg:w-1/2 relative overflow-hidden min-h-screen">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")'
                }}
              >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-emerald-900/80 via-emerald-800/60 to-transparent"></div>
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white">
                  <div data-aos="fade-left" data-aos-delay="500">
                    <h3 className="text-3xl font-bold mb-4">Transform Your Ayurvedic Practice</h3>
                    <p className="text-emerald-100 text-lg mb-8">
                      Join thousands of Ayurvedic practitioners who trust AyurSutra for seamless clinic management and patient care.
                    </p>
                    
                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center mb-2">
                          <FaHeartbeat className="h-5 w-5 text-emerald-300 mr-2" />
                          <span className="font-bold">Patient Management</span>
                        </div>
                        <p className="text-sm text-emerald-200">Track holistic wellness journeys</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center mb-2">
                          <FaCalendarCheck className="h-5 w-5 text-emerald-300 mr-2" />
                          <span className="font-bold">Therapy Scheduling</span>
                        </div>
                        <p className="text-sm text-emerald-200">Smart Panchakarma scheduling</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center mb-2">
                          <FaChartLine className="h-5 w-5 text-emerald-300 mr-2" />
                          <span className="font-bold">Analytics Dashboard</span>
                        </div>
                        <p className="text-sm text-emerald-200">Real-time healing insights</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center mb-2">
                          <FaShieldAlt className="h-5 w-5 text-emerald-300 mr-2" />
                          <span className="font-bold">Secure & Compliant</span>
                        </div>
                        <p className="text-sm text-emerald-200">HIPAA compliant security</p>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex space-x-8 mb-6">
                      <div>
                        <div className="text-3xl font-bold">500+</div>
                        <div className="text-emerald-200 text-sm">Clinics Trust Us</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">50K+</div>
                        <div className="text-emerald-200 text-sm">Patients Managed</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">99%</div>
                        <div className="text-emerald-200 text-sm">Satisfaction Rate</div>
                      </div>
                    </div>
                    
                    {/* Testimonial */}
                    <div className="border-t border-emerald-300/30 pt-6">
                      <p className="text-lg italic mb-2">
                        "AyurSutra revolutionized our Panchakarma clinic management. The platform's intuitive design has improved patient care by 40%."
                      </p>
                      <div>
                        <p className="font-bold">Dr. Priya Sharma</p>
                        <p className="text-emerald-200 text-sm">Chief Ayurvedic Practitioner</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Login;