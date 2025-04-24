"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, X } from "lucide-react"

interface SuccessToastProps {
  message: string
  onClose: () => void
}

export function SuccessToast({ message, onClose }: SuccessToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Aguarda a animação de saída terminar
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md bg-green-50 p-4 text-green-700 shadow-md transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <CheckCircle2 className="h-5 w-5 text-green-500" />
      <span>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, 300)
        }}
        className="ml-2 rounded-full p-1 hover:bg-green-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
