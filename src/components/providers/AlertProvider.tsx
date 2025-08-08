'use client'
import { createContext, useContext, useState, ReactNode } from "react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

type Message = {
  title: string
  description?: string
  variant?: "default" | "destructive"
  icon?: ReactNode
}

type AlertContextType = {
  show: (msg: Message) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function useAlert() {
  const ctx = useContext(AlertContext)
  if (!ctx) throw new Error("useAlert must be used within AlertProvider")
  return ctx
}

export default function AlertProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<Message | null>(null)
  return (
    <AlertContext.Provider value={{ show: setMessage }}>
      {message && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm">
          <Alert variant={message.variant}>
            {message.icon}
            <AlertTitle>{message.title}</AlertTitle>
            {message.description && (
              <AlertDescription>{message.description}</AlertDescription>
            )}
          </Alert>
        </div>
      )}
      {children}
    </AlertContext.Provider>
  )
}
