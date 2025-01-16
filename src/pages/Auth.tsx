import * as React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AuthAppearance } from "@/components/auth/AuthAppearance"
import { AuthFooter } from "@/components/auth/AuthFooter"
import { AuthForm } from "@/components/auth/AuthForm"
import { AuthHeader } from "@/components/auth/AuthHeader"
import { AuthLogo } from "@/components/auth/AuthLogo"
import { AuthSettings } from "@/components/auth/AuthSettings"

export default function Auth() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 md:px-6">
        <div className="grid w-full gap-6">
          <AuthLogo />
          <div className="mx-auto w-full max-w-[400px] grid gap-4">
            <AuthHeader />
            <AuthForm />
            <AuthSettings />
            <AuthAppearance />
            <AuthFooter />
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}