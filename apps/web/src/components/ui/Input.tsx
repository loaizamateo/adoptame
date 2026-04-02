import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-150 bg-white',
            'border placeholder:text-gray-400 text-gray-800',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>}
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
