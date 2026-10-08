import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const FIELD_CLASSES = 'px-3 py-[11px] rounded-[9px] bg-panel2 border border-bd2 text-tx text-sm outline-none focus:border-acc'

interface FieldWrapperProps {
  label: string
  htmlFor: string
  error?: ReactNode
  hint?: ReactNode
  children: ReactNode
}

function FieldWrapper({ label, htmlFor, error, hint, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-[7px]">
      <label htmlFor={htmlFor} className="text-[13px] text-mut font-medium">
        {label}
      </label>
      {children}
      {error ? <div className="text-[12.5px] text-err">{error}</div> : null}
      {hint ? <div className="text-[12px] text-mut3">{hint}</div> : null}
    </div>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: ReactNode
  hint?: ReactNode
}

export function TextField({ label, error, hint, className, id, ...props }: TextFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={id ?? label} error={error} hint={hint}>
      <input id={id ?? label} className={cn(FIELD_CLASSES, className)} {...props} />
    </FieldWrapper>
  )
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: ReactNode
  hint?: ReactNode
}

export function TextAreaField({ label, error, hint, className, id, ...props }: TextAreaFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={id ?? label} error={error} hint={hint}>
      <textarea id={id ?? label} className={cn(FIELD_CLASSES, 'resize-y', className)} {...props} />
    </FieldWrapper>
  )
}
