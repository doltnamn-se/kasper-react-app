import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <div
      className={cn(
        "flex h-screen w-64 flex-col border-r bg-background",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export function SidebarHeader({ className, children, ...props }: SidebarHeaderProps) {
  return (
    <div
      className={cn("flex h-14 items-center border-b px-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export function SidebarContent({ className, children, ...props }: SidebarContentProps) {
  return (
    <div className={cn("flex-1 overflow-auto py-2", className)} {...props}>
      {children}
    </div>
  );
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export function SidebarFooter({ className, children, ...props }: SidebarFooterProps) {
  return (
    <div
      className={cn("flex h-14 items-center border-t px-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}