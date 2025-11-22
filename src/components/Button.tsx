interface ButtonProps {
  type: 'submit' | 'reset' | 'button'
  name: string
  disabled?: boolean
  isLoading?: boolean
}

export function Button({
  type,
  name,
  disabled = false,
  isLoading = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className="text-white bg-green-600 hover:bg-green-800 disabled:bg-gray-600 disabled:cursor-not-allowed font-semibold rounded-xl h-9 w-56 transition-colors flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          Processando...
        </>
      ) : (
        name
      )}
    </button>
  )
}
