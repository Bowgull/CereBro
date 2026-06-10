import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-[#334155] bg-[#151A23] transition-[background-color,border-color,box-shadow] outline-none data-[state=checked]:border-[#6BA6FF] data-[state=checked]:bg-[#6BA6FF] data-[state=unchecked]:bg-[#151A23] focus-visible:border-[#6BA6FF] focus-visible:ring-2 focus-visible:ring-[#6BA6FF]/45 disabled:cursor-not-allowed disabled:border-[#253041] disabled:bg-[#151A23] disabled:opacity-70",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-[#B8C0CC] ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=checked]:bg-[#0E1116] data-[state=unchecked]:translate-x-0.5"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
