// 'use client'
// import { useState, useRef, useActionState } from 'react' // Updated import
// import { useFormStatus } from 'react-dom'
// import ReCAPTCHA from 'react-google-recaptcha'
// import { login, signup } from './actions'
// import { AuthResponse, AuthAction } from '@/types/auth'
// import { validateEmail, validatePassword } from '@/lib/validation'
// import PasswordStrengthMeter from '@/components/PasswordStrengthMeter'

// function SubmitButton({ children, variant = 'primary' }: { children: React.ReactNode, variant?: 'primary' | 'secondary' }) {
//   const { pending } = useFormStatus()
  
//   const variants = {
//     primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
//     secondary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
//   }

//   return (
//     <button
//       type="submit"
//       disabled={pending}
//       className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${variants[variant]} ${pending ? 'opacity-70 cursor-not-allowed' : ''}`}
//     >
//       {pending ? (
//         <>
//           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//           </svg>
//           Processing...
//         </>
//       ) : (
//         children
//       )}
//     </button>
//   )
// }

// export default function LoginPage() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   // Changed useFormState to useActionState
//   const [loginState, loginAction] = useActionState<AuthResponse, FormData>(login, {}) 
//   const [signupState, signupAction] = useActionState<AuthResponse, FormData>(signup, {}) // Changed useFormState to useActionState
//   const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
//   const [errors, setErrors] = useState({ email: '', password: '' })
//   const [showVerificationNotice, setShowVerificationNotice] = useState(false)
//   const captchaRef = useRef<ReCAPTCHA>(null)

//   const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value
//     setEmail(value)
//     setErrors({...errors, email: validateEmail(value)})
//   }

//   const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value
//     setPassword(value)
//     setErrors({...errors, password: validatePassword(value)})
//   }

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, action: AuthAction) => {
//     e.preventDefault()
    
//     // Reset states
//     setShowVerificationNotice(false)
    
//     // Validate inputs
//     const emailError = validateEmail(email)
//     const passwordError = validatePassword(password)
    
//     if (emailError || passwordError) {
//       setErrors({ email: emailError, password: passwordError })
//       return
//     }

//     // Get CAPTCHA token
//     const token = await captchaRef.current?.executeAsync()
//     captchaRef.current?.reset()

//     const formData = new FormData(e.currentTarget)
//     if (token) formData.set('captchaToken', token)

//     // Execute the action
//     const result = await action(formData)
    
//     if (result?.requiresVerification) {
//       setShowVerificationNotice(true)
//     }
//   }

//   const errorMessage = loginState?.error || signupState?.error

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//           {activeTab === 'login' ? 'Sign in to your account' : 'Create a new account'}
//         </h2>
//       </div>

//       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
//           {/* Tabs */}
//           <div className="flex border-b mb-6 justify-between">
//             <button
//               onClick={() => setActiveTab('login')}
//               className={`py-2 px-4 font-medium text-sm ${activeTab === 'login' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
//             >
//               Sign In
//             </button>
//             <button
//               onClick={() => setActiveTab('signup')}
//               className={`py-2 px-4 font-medium text-sm ${activeTab === 'signup' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
//             >
//               Sign Up
//             </button>
//           </div>

//           {/* Verification Notice */}
//           {showVerificationNotice && (
//             <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0">
//                   <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-sm text-blue-700">
//                     A verification email has been sent. Please check your inbox and follow the instructions to complete {activeTab === 'login' ? 'login' : 'registration'}.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Error Message */}
//           {errorMessage && (
//             <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0">
//                   <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-sm text-red-700">{errorMessage}</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           <form 
//             className="space-y-6" 
//             onSubmit={(e) => handleSubmit(e, activeTab === 'login' ? loginAction : signupAction)}
//           >
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                 Email address
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   value={email}
//                   onChange={handleEmailChange}
//                   className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
//               </div>
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 Password
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
//                   value={password}
//                   onChange={handlePasswordChange}
//                   className={`appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {activeTab === 'signup' && (
//                   <PasswordStrengthMeter password={password} />
//                 )}
//                 {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
//               </div>
//             </div>

//             {activeTab === 'login' && (
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <input
//                     id="remember-me"
//                     name="remember-me"
//                     type="checkbox"
//                     className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                   />
//                   <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
//                     Remember me
//                   </label>
//                 </div>

//                 <div className="text-sm">
//                   <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
//                     Forgot your password?
//                   </a>
//                 </div>
//               </div>
//             )}

//             {/* Hidden CAPTCHA */}
//             <ReCAPTCHA
//               ref={captchaRef}
//               size="invisible"
//               sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
//             />

//             <div>
//               {activeTab === 'login' ? (
//                 <SubmitButton variant="primary">Sign in</SubmitButton>
//               ) : (
//                 <SubmitButton variant="primary">Create account</SubmitButton>
//               )}
//             </div>
//           </form>

//           <div className="mt-6">
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-300"></div>
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="px-2 bg-white text-gray-500">Or continue with</span>
//               </div>
//             </div>

//             <div className="mt-6 grid grid-cols-1 gap-3">
//               <form action="/auth/google" method="post">
//                 <SubmitButton variant="secondary">
//                   <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.664-4.153-2.675-6.735-2.675-5.522 0-10 4.477-10 10s4.478 10 10 10c8.396 0 10-7.524 10-10 0-0.67-0.069-1.325-0.189-1.955h-9.811z"/>
//                   </svg>
//                   Google
//                 </SubmitButton>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      <button formAction={login}>Log in</button>
      <button formAction={signup}>Sign up</button>
    </form>
  )
}