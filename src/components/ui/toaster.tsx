
import { useToast } from "@/hooks/use-toast"
import { CircleCheck } from "lucide-react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} {...props} variant={variant} className="w-auto max-w-[350px]">
            <div className="flex items-start gap-3">
              <CircleCheck 
                className={
                  variant === "destructive" 
                    ? "h-4 w-4 text-white" 
                    : "h-4 w-4 text-[#1EAEDB] dark:text-[#1EAEDB]"
                } 
              />
              <div className="grid gap-1">
                {title && <ToastTitle className="text-sm">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-xs">{description}</ToastDescription>
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
