import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded border text-[11px] font-medium leading-none transition-[background-color,border-color,color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[#253041] disabled:bg-[#151A23] disabled:text-[#7E8898] disabled:opacity-70 aria-invalid:border-[#EF6F6C] aria-invalid:ring-2 aria-invalid:ring-[#EF6F6C]/30 focus-visible:border-[#6BA6FF] focus-visible:ring-2 focus-visible:ring-[#6BA6FF]/45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "border-[#6BA6FF] bg-[#6BA6FF] text-[#0E1116] hover:bg-[#8DBBFF]",
        destructive:
          "border-[#EF6F6C] bg-[#7F1D1D] text-[#F4EFE3] hover:bg-[#EF6F6C] hover:text-[#0E1116] focus-visible:border-[#EF6F6C] focus-visible:ring-[#EF6F6C]/35",
        risk:
          "border-[#F6C177] bg-[#3A2A18] text-[#F6C177] hover:bg-[#F6C177] hover:text-[#0E1116] focus-visible:border-[#F6C177] focus-visible:ring-[#F6C177]/35",
        outline:
          "border-[#334155] bg-[#151A23] text-[#F4EFE3] hover:border-[#6BA6FF] hover:bg-[#202A38]",
        secondary:
          "border-[#334155] bg-[#202A38] text-[#F4EFE3] hover:border-[#D9B56A] hover:bg-[#252F3F]",
        ghost:
          "border-transparent bg-transparent text-[#B8C0CC] hover:border-[#253041] hover:bg-[#151A23] hover:text-[#F4EFE3]",
        link: "border-transparent bg-transparent px-0 text-[#6BA6FF] underline-offset-4 hover:text-[#F4EFE3] hover:underline",
      },
      size: {
        default: "h-7 px-2.5 py-1 has-[>svg]:px-2",
        sm: "h-6 rounded px-2 has-[>svg]:px-1.5",
        lg: "h-8 px-3 has-[>svg]:px-2.5",
        icon: "size-7",
        "icon-sm": "size-6",
        "icon-lg": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
