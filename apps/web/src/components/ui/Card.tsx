import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

const paddings = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ className, children, hover = false, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-200 shadow-soft',
        paddings[padding],
        hover && 'transition-shadow duration-200 hover:shadow-card hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  )
}
