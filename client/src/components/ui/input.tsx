import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
   <input
  type={type}
  className={cn(
   " border-solid border-2 border-gray-700 rounded-2xl p-2",
    className
  )}
  {...props}
/>
  );
}

export { Input };
