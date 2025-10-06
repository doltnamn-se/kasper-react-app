import { useToast } from "@/components/ui/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Check, Minus } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isDestructive = variant === "destructive";
        
        return (
          <Toast key={id} {...props} variant={variant} className="w-auto max-w-[350px] transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full ${
                isDestructive ? "bg-destructive" : "bg-green-500"
              }`}>
                {isDestructive ? (
                  <Minus 
                    className="h-3.5 w-3.5 text-white stroke-[3]" 
                  />
                ) : (
                  <Check 
                    className="h-3.5 w-3.5 text-white stroke-[3]" 
                  />
                )}
              </div>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose className="h-4 w-4" />
          </Toast>
        )
      })}
      <ToastViewport 
        className="fixed top-0 right-0 z-[10010] flex flex-col gap-2 px-4 pb-4 md:px-6 sm:top-0 sm:right-0 sm:flex-col md:max-w-[420px]" 
        style={{
          paddingTop: 'calc(1rem + env(safe-area-inset-top))'
        }}
      />
    </ToastProvider>
  )
}
