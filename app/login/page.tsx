"use client";
import { useState } from "react";
import { Mail, Lock, LogIn, UserPlus } from "lucide-react";
import { login, signup } from "./actions";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // For client-side password match validation
  function handleSignupSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      ?.value;
    const confirm = (
      form.elements.namedItem("confirmPassword") as HTMLInputElement
    )?.value;
    if (password !== confirm) {
      e.preventDefault();
      setSignupError("Passwords do not match");
    } else {
      setSignupError(null);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#3a1c71] via-[#d76d77] to-[#ffaf7b] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Sun */}
        <div className="absolute left-1/4 top-24 w-32 h-32 bg-yellow-200 opacity-40 rounded-full blur-2xl" />
        {/* Stars */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: "blur(0.5px)",
              }}
            />
          ))}
        </div>
        {/* Mountains */}
        <svg
          className="absolute bottom-0 left-0 w-full h-64"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon
            points="0,320 400,200 800,320 1200,180 1440,320 1440,320 0,320"
            fill="#2d2540"
            fillOpacity="0.7"
          />
          <polygon
            points="0,320 300,250 700,320 1100,220 1440,320 1440,320 0,320"
            fill="#1a1833"
            fillOpacity="0.8"
          />
        </svg>
        {/* Reflection */}
        <svg
          className="absolute bottom-0 left-0 w-full h-32 opacity-30"
          viewBox="0 0 1440 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon
            points="0,0 400,120 800,0 1200,140 1440,0 1440,160 0,160"
            fill="#fff"
          />
        </svg>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-white/30 flex flex-col items-center">
        {/* Tabs */}
        <div className="flex w-full mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-3 text-lg font-semibold rounded-t-lg transition-colors duration-300 ${
              activeTab === "login"
                ? "text-white bg-white/10 shadow-inner"
                : "text-white/70 hover:text-white"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-3 text-lg font-semibold rounded-t-lg transition-colors duration-300 ${
              activeTab === "signup"
                ? "text-white bg-white/10 shadow-inner"
                : "text-white/70 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        {activeTab === "login" && (
          <form
            className="w-full flex flex-col gap-6"
            action={login}
            method="post"
          >
            {/* Email */}
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70"
                size={20}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/30 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:bg-white/50 transition"
                autoComplete="email"
                required
              />
            </div>
            {/* Password */}
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/30 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:bg-white/50 transition"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white/90"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.09-2.73 2.99-4.98 5.38-6.32M6.1 6.1A9.94 9.94 0 0 1 12 4c5 0 9.27 3.11 11 8a10.05 10.05 0 0 1-4.17 5.19M1 1l22 22" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M2.05 12C3.81 7.61 7.88 4.5 12 4.5c4.12 0 8.19 3.11 9.95 7.5-1.76 4.39-5.83 7.5-9.95 7.5-4.12 0-8.19-3.11-9.95-7.5z" />
                  </svg>
                )}
              </button>
            </div>
            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between text-white/80 text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe((v) => !v)}
                  className="accent-orange-400 w-4 h-4 rounded border-white/40 bg-white/30"
                />
                Remember me
              </label>
              <a href="#" className="hover:underline text-white/90">
                Forgot password?
              </a>
            </div>
            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold text-lg shadow-lg hover:from-orange-500 hover:to-pink-600 transition flex items-center justify-center gap-2"
            >
              <LogIn size={20} /> Login
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {activeTab === "signup" && (
          <form
            className="w-full flex flex-col gap-6"
            action={signup}
            method="post"
            onSubmit={handleSignupSubmit}
          >
            {/* Email */}
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70"
                size={20}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/30 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:bg-white/50 transition"
                autoComplete="email"
                required
              />
            </div>
            {/* Password */}
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70"
                size={20}
              />
              <input
                type={showSignupPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/30 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:bg-white/50 transition"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowSignupPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white/90"
                tabIndex={-1}
              >
                {showSignupPassword ? (
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.09-2.73 2.99-4.98 5.38-6.32M6.1 6.1A9.94 9.94 0 0 1 12 4c5 0 9.27 3.11 11 8a10.05 10.05 0 0 1-4.17 5.19M1 1l22 22" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M2.05 12C3.81 7.61 7.88 4.5 12 4.5c4.12 0 8.19 3.11 9.95 7.5-1.76 4.39-5.83 7.5-9.95 7.5-4.12 0-8.19-3.11-9.95-7.5z" />
                  </svg>
                )}
              </button>
            </div>
            {/* Confirm Password */}
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70"
                size={20}
              />
              <input
                type={showSignupConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/30 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:bg-white/50 transition"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowSignupConfirm((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white/90"
                tabIndex={-1}
              >
                {showSignupConfirm ? (
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.09-2.73 2.99-4.98 5.38-6.32M6.1 6.1A9.94 9.94 0 0 1 12 4c5 0 9.27 3.11 11 8a10.05 10.05 0 0 1-4.17 5.19M1 1l22 22" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M2.05 12C3.81 7.61 7.88 4.5 12 4.5c4.12 0 8.19 3.11 9.95 7.5-1.76 4.39-5.83 7.5-9.95 7.5-4.12 0-8.19-3.11-9.95-7.5z" />
                  </svg>
                )}
              </button>
            </div>
            {signupError && (
              <div className="text-red-200 text-sm text-center">
                {signupError}
              </div>
            )}
            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold text-lg shadow-lg hover:from-orange-500 hover:to-pink-600 transition flex items-center justify-center gap-2"
            >
              <UserPlus size={20} /> Sign Up
            </button>
          </form>
        )}

        {/* Footer: Switch tabs */}
        <p className="mt-8 text-white/90 text-center text-sm">
          {activeTab === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="font-bold underline hover:text-orange-200"
                onClick={() => setActiveTab("signup")}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="font-bold underline hover:text-orange-200"
                onClick={() => setActiveTab("login")}
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
