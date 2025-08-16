'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface PasswordStrengthProps {
  password: string
  className?: string
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '', bg: '', checks: null }
    
    let score = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    }
    
    score = Object.values(checks).filter(Boolean).length
    
    const levels = [
      { score: 0, label: '', color: '', bg: '' },
      { score: 1, label: 'Very Weak', color: 'text-red-600', bg: 'bg-red-600' },
      { score: 2, label: 'Weak', color: 'text-red-500', bg: 'bg-red-500' },
      { score: 3, label: 'Fair', color: 'text-yellow-500', bg: 'bg-yellow-500' },
      { score: 4, label: 'Good', color: 'text-blue-500', bg: 'bg-blue-500' },
      { score: 5, label: 'Strong', color: 'text-green-600', bg: 'bg-green-600' }
    ]
    
    return { ...levels[score], checks }
  }, [password])

  if (!password) return null

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Password Strength</span>
        <span className={cn("text-xs font-medium", strength.color)}>
          {strength.label}
        </span>
      </div>
      
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              level <= (strength.score || 0) ? strength.bg : "bg-muted"
            )}
          />
        ))}
      </div>
      
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground">Requirements:</div>
        <div className="grid grid-cols-1 gap-1 text-xs">
          <div className={cn(
            "flex items-center space-x-2",
            strength.checks?.length ? "text-green-600" : "text-muted-foreground"
          )}>
            <span>{strength.checks?.length ? "✓" : "○"}</span>
            <span>At least 8 characters</span>
          </div>
          <div className={cn(
            "flex items-center space-x-2",
            strength.checks?.lowercase ? "text-green-600" : "text-muted-foreground"
          )}>
            <span>{strength.checks?.lowercase ? "✓" : "○"}</span>
            <span>Lowercase letter</span>
          </div>
          <div className={cn(
            "flex items-center space-x-2",
            strength.checks?.uppercase ? "text-green-600" : "text-muted-foreground"
          )}>
            <span>{strength.checks?.uppercase ? "✓" : "○"}</span>
            <span>Uppercase letter</span>
          </div>
          <div className={cn(
            "flex items-center space-x-2",
            strength.checks?.number ? "text-green-600" : "text-muted-foreground"
          )}>
            <span>{strength.checks?.number ? "✓" : "○"}</span>
            <span>Number</span>
          </div>
          <div className={cn(
            "flex items-center space-x-2",
            strength.checks?.special ? "text-green-600" : "text-muted-foreground"
          )}>
            <span>{strength.checks?.special ? "✓" : "○"}</span>
            <span>Special character (@$!%*?&)</span>
          </div>
        </div>
      </div>
    </div>
  )
}