import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit max-w-full shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none outline-none transition-[border-color,color,box-shadow] aria-disabled:border-[#253041] aria-disabled:bg-[#151A23] aria-disabled:text-[#7E8898] aria-disabled:opacity-70 focus-visible:border-[#6BA6FF] focus-visible:ring-2 focus-visible:ring-[#6BA6FF]/45 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0E1116] aria-invalid:border-[#EF6F6C] aria-invalid:ring-2 aria-invalid:ring-[#EF6F6C]/30 aria-invalid:ring-offset-1 aria-invalid:ring-offset-[#0E1116] [&>svg]:pointer-events-none [&>svg]:size-3 [&>span]:truncate",
  {
    variants: {
      variant: {
        default:
          "border-[#2D5B8F] bg-[#151A23] text-[#6BA6FF] [a&]:hover:bg-[#202A38]",
        secondary:
          "border-[#334155] bg-[#151A23] text-[#B8C0CC] [a&]:hover:bg-[#202A38]",
        destructive:
          "border-[#7F1D1D] bg-[#7F1D1D]/55 text-[#EF6F6C] [a&]:hover:bg-[#7F1D1D]",
        success:
          "border-[#9FD2B7]/50 bg-[#9FD2B7]/10 text-[#9FD2B7] [a&]:hover:bg-[#9FD2B7]/15",
        warning:
          "border-[#F6C177]/50 bg-[#F6C177]/10 text-[#F6C177] [a&]:hover:bg-[#F6C177]/15",
        violet:
          "border-[#8B5CF6]/50 bg-[#8B5CF6]/10 text-[#A78BFA] [a&]:hover:bg-[#8B5CF6]/15",
        outline:
          "border-[#334155] bg-transparent text-[#F4EFE3] [a&]:hover:bg-[#202A38]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
