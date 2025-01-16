import { BrowserRouter } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { AppRoutes } from "./AppRoutes"
import "./App.css"

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <AppRoutes />
        <Toaster />
      </SidebarProvider>
    </BrowserRouter>
  )
}

export default App