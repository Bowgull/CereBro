import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-[12px] font-medium leading-none text-[#B8C0CC] transition-[background-color,border-color,color,box-shadow] outline-none hover:border-[#334155] hover:bg-[#202A38] hover:text-[#F4EFE3] data-[state=on]:border-[#6BA6FF] data-[state=on]:bg-[#202A38] data-[state=on]:text-[#F4EFE3] disabled:pointer-events-none disabled:cursor-not-allowed disabled:text-[#7E8898] disabled:opacity-70 focus-visible:border-[#6BA6FF] focus-visible:ring-2 focus-visible:ring-[#6BA6FF]/45 aria-invalid:border-[#EF6F6C] aria-invalid:ring-2 aria-invalid:ring-[#EF6F6C]/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border-[#334155] bg-[#151A23] hover:border-[#6BA6FF]",
      },
      size: {
        default: "h-8 min-w-8 px-2",
        sm: "h-7 min-w-7 px-1.5",
        lg: "h-9 min-w-9 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
