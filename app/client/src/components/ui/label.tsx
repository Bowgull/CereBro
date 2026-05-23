import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-[12px] font-medium leading-none text-[#F4EFE3] select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-[#7E8898] group-data-[disabled=true]:opacity-70 peer-disabled:cursor-not-allowed peer-disabled:text-[#7E8898] peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
}

export { Label };
