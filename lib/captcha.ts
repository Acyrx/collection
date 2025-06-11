export async function verifyCaptcha(token: string | null): Promise<boolean> {
    if (!token) return false
    
    try {
      const response = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
        { method: 'POST' }
      )
      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('CAPTCHA verification error:', error)
      return false
    }
  }