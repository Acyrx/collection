// "use client";
// import React, { useRef, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Lock, Mail, Eye, EyeOff, Github } from "lucide-react";
// import Link from "next/link";
// import ReCAPTCHA from "react-google-recaptcha";
// import { supabase } from "@/lib/supabase";
// import { useRouter } from "next/navigation";

// export default function Login() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [captchaToken, setCaptchaToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const recaptchaRef = useRef<ReCAPTCHA>(null);
//   const router = useRouter();

//   const handleCaptchaChange = (token: string | null) => {
//     setCaptchaToken(token);
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!captchaToken) {
//       alert("Please complete the reCAPTCHA.");
//       return;
//     }

//     const formData = new FormData(e.currentTarget);
//     const email = formData.get("email") as string;
//     const password = formData.get("password") as string;

//     setLoading(true);
//     const { error } = await supabase.auth.signInWithPassword({ email, password });

//     setLoading(false);

//     if (error) {
//       alert(error.message);
//     } else {
//       router.push("/companions"); // Redirect after login
//     }
//   };

//   const handleGoogleLogin = async () => {
//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: "google",
//     });
//     if (error) alert(error.message);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-orange-500 mb-2">Collection</h1>
//           <p className="text-gray-600">Your AI Companion Platform</p>
//         </div>

//         {/* Login Card */}
//         <div className="bg-white rounded-xl shadow-md p-8">
//           <h2 className="text-2xl font-semibold text-center mb-6">Welcome Back</h2>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             {/* Email Field */}
//             <div className="space-y-1">
//               <label className="text-sm font-medium text-gray-700">Email</label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                 <input
//                   name="email"
//                   type="email"
//                   placeholder="your@email.com"
//                   className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Password Field */}
//             <div className="space-y-1">
//               <label className="text-sm font-medium text-gray-700">Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                 <input
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="••••••••"
//                   className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//               <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline float-right">
//                 Forgot password?
//               </Link>
//             </div>

//             {/* reCAPTCHA */}
//             <ReCAPTCHA
//               sitekey="6Lfev14rAAAAAMrO4C9Y0eyuYeLyLXh3BfVKF0T4"
//               onChange={handleCaptchaChange}
//               ref={recaptchaRef}
//             />

//             {/* Submit Button */}
//             <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
//               {loading ? "Logging in..." : "Login"}
//             </Button>
//           </form>

//           {/* Divider */}
//           <div className="flex items-center my-6">
//             <div className="flex-grow border-t border-gray-300"></div>
//             <span className="mx-4 text-gray-500">or</span>
//             <div className="flex-grow border-t border-gray-300"></div>
//           </div>

//           {/* Social Login */}
//           <div className="space-y-3">
//             <Button
//               onClick={handleGoogleLogin}
//               variant="outline"
//               className="w-full flex items-center justify-center gap-2"
//             >
//               {/* <Google className="w-5 h-5 text-red-500" /> */}
//               Continue with Google
//             </Button>
//           </div>

//           {/* Sign-Up Link */}
//           <p className="text-center mt-6 text-sm text-gray-600">
//             Don’t have an account?{" "}
//             <Link href="/signup" className="text-blue-600 hover:underline font-medium">
//               Sign up
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client"
import { useState } from 'react'; // Import useState to manage active tab
import { login, signup } from './actions';
import { Mail, Lock, LogIn, UserPlus} from 'lucide-react';

export default function LoginPage() {
  // State to manage the currently active tab: 'login' or 'signup'
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 font-inter">
      <form className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col space-y-7 border border-gray-200">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-6 border-b border-gray-200">
          <button
            type="button" // Important: Prevent form submission when clicking tabs
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-lg font-semibold rounded-t-lg transition-colors duration-300 ${
              activeTab === 'login'
                ? 'text-blue-700 border-b-4 border-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Log In
          </button>
          <button
            type="button" // Important: Prevent form submission when clicking tabs
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-3 text-lg font-semibold rounded-t-lg transition-colors duration-300 ${
              activeTab === 'signup'
                ? 'text-blue-700 border-b-4 border-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Dynamic Heading and Sub-heading based on active tab */}
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-2">
          {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-center text-gray-600 text-lg">
          {activeTab === 'login' ? 'Sign in to your account' : 'Join us today!'}
        </p>

        {/* Email Input Field */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <label htmlFor="email" className="sr-only">Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-blue-400 text-gray-800 placeholder-gray-500 transition duration-200 ease-in-out"
            placeholder="you@example.com"
          />
        </div>

        {/* Password Input Field */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <label htmlFor="password" className="sr-only">Password:</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-blue-400 text-gray-800 placeholder-gray-500 transition duration-200 ease-in-out"
            placeholder="••••••••"
          />
        </div>

        {/* Confirm Password Input Field (only for Sign Up tab) */}
        {activeTab === 'signup' && (
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <label htmlFor="confirm-password" className="sr-only">Confirm Password:</label>
            <input
              id="confirm-password"
              name="confirmPassword" // Using a distinct name for confirm password
              type="password"
              required
              autoComplete="new-password"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-blue-400 text-gray-800 placeholder-gray-500 transition duration-200 ease-in-out"
              placeholder="Confirm password"
            />
          </div>
        )}

        {/* Forgot Password Link (only for Log In tab) */}
        {activeTab === 'login' && (
          <div className="text-right -mt-2">
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out">
              Forgot password?
            </a>
          </div>
        )}

        {/* Primary Action Button (Log In or Sign Up) */}
        <button
          formAction={activeTab === 'login' ? login : signup}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-800 transition duration-300 ease-in-out shadow-lg transform hover:scale-105 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-offset-2"
        >
          {activeTab === 'login' ? <><LogIn size={20} /> Log in</> : <><UserPlus size={20} /> Sign up</>}
        </button>

        {/* Footer text to switch between forms */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            {activeTab === 'login' ? (
              <>Don't have an account?{' '}</>
            ) : (
              <>Already have an account?{' '}</>
            )}
            <button
              type="button" // Use type="button" to prevent form submission, as we're just switching tabs
              onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')}
              className="text-blue-600 hover:text-blue-800 font-semibold transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              {activeTab === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
