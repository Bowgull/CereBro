import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-[#334155] bg-[#151A23] text-[#0E1116] shadow-none outline-none transition-[background-color,border-color,box-shadow,color] data-[state=checked]:border-[#6BA6FF] data-[state=checked]:bg-[#6BA6FF] data-[state=checked]:text-[#0E1116] focus-visible:border-[#6BA6FF] focus-visible:ring-2 focus-visible:ring-[#6BA6FF]/45 aria-invalid:border-[#EF6F6C] aria-invalid:ring-2 aria-invalid:ring-[#EF6F6C]/30 disabled:cursor-not-allowed disabled:border-[#253041] disabled:bg-[#151A23] disabled:text-[#7E8898] disabled:opacity-70",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
