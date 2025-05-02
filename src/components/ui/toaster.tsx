
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Check } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} {...props} variant={variant} className="w-auto max-w-[350px]">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-green-500">
                <Check 
                  className="h-3.5 w-3.5 text-white stroke-[3]" 
                />
              </div>
              <div className="grid gap-1">
                {title && <ToastTitle className="text-sm font-medium text-black dark:text-white">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-xs font-medium text-black dark:text-white">{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose className="h-4 w-4" />
          </Toast>
        )
      })}
      <ToastViewport className="fixed top-[10px] right-0 flex flex-col gap-2 px-4 pt-4 md:px-12 md:pt-12 sm:top-[10px] sm:right-0 sm:flex-col md:max-w-[420px]" />
    </ToastProvider>
  )
}
