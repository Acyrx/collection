export function validateEmail(email: string): string {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return 'Email is required'
    if (!re.test(email)) return 'Please enter a valid email address'
    return ''
  }
  
  export function validatePassword(password: string): string {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (password.length > 60) return 'Password must be less than 60 characters'
    return ''
  }