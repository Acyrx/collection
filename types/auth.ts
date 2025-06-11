export interface AuthFormData {
    email: string;
    password: string;
    // rememberMe?: boolean;
  }
  
  export interface AuthResponse {
    error?: string;
    success?: boolean;
    requiresVerification?: boolean;
  }
  
  export type AuthAction = (formData: FormData) => Promise<AuthResponse>;