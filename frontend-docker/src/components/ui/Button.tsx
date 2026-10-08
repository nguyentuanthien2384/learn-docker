import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger-ghost'
export type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'border-0 bg-grad text-acc-ink shadow-glow font-bold hover:brightness-110',
  secondary: 'border border-bd2 bg-transparent text-mut hover:text-tx hover:border-bd3',
  ghost: 'border border-bd3 bg-transparent text-tx font-semibold hover:border-vio hover:text-vio',
  'danger-ghost': 'border border-bd2 bg-transparent text-mut hover:bg-err-bg hover:text-err',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[13px] rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-[9px]',
}

export function Button({ variant = 'secondary', size = 'md', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn('cursor-pointer whitespace-nowrap transition-[filter,border-color,color]', VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      {...props}
    />
  )
}
