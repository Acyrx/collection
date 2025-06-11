import { useEffect, useState } from 'react'

interface PasswordStrengthMeterProps {
  password: string
}

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState<number>(0)
  const [feedback, setFeedback] = useState<string>('')

  useEffect(() => {
    if (!password) {
      setStrength(0)
      setFeedback('')
      return
    }

    // Calculate password strength
    let score = 0
    const feedbackMessages: string[] = []

    // Length check
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1

    // Character variety
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    // Feedback
    if (password.length < 8) {
      feedbackMessages.push('Password is too short')
    }
    if (!/[A-Z]/.test(password)) {
      feedbackMessages.push('Add uppercase letters')
    }
    if (!/[0-9]/.test(password)) {
      feedbackMessages.push('Add numbers')
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      feedbackMessages.push('Add special characters')
    }

    setStrength(Math.min(score, 5)) // Cap at 5
    setFeedback(feedbackMessages.join(', '))
  }, [password])

  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500',
  ]

  return (
    <div className="mt-2">
      <div className="flex gap-1 h-1 mb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 ${i < strength ? strengthColors[strength - 1] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      {feedback && (
        <p className="text-xs text-gray-500">
          {feedback}
        </p>
      )}
    </div>
  )
}