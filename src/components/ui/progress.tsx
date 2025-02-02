import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string;
  }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-[#97ee88] dark:bg-[#2F2E31]",
      className
    )}
    {...props}
  >
    <style>
      {`
        @keyframes moveStripes {
          0% { background-position: 0 0; }
          100% { background-position: 30px 0; }
        }
        .striped-progress {
          background-image: linear-gradient(
            45deg,
            #08a621 25%,
            #97ee86 25%,
            #97ee86 50%,
            #08a621 50%,
            #08a621 75%,
            #97ee86 75%,
            #97ee86 100%
          );
          background-size: 30px 30px;
          animation: moveStripes 1s linear infinite;
        }
      `}
    </style>
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full transition-all duration-300 ease-in-out striped-progress dark:bg-white",
        indicatorClassName
      )}
      style={{ width: `${value || 0}%` }}
    />
  </ProgressPrimitive.Root>
));

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };