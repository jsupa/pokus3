interface FormErrorProps {
  error?: string
}

export function FormError({ error }: FormErrorProps) {
  if (!error) return null

  return <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
}
