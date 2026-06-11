import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-w-0 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded border text-[11px] font-medium leading-none transition-[background-color,border-color,color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[rgba(198,155,85,0.16)] disabled:bg-[#050908] disabled:text-[#6f726b] disabled:opacity-70 disabled:shadow-none aria-busy:pointer-events-none aria-invalid:border-[#d56b52] aria-invalid:ring-2 aria-invalid:ring-[#d56b52]/30 aria-invalid:ring-offset-1 aria-invalid:ring-offset-[#020505] focus-visible:border-[#c69b55] focus-visible:ring-2 focus-visible:ring-[#c69b55]/45 focus-visible:ring-offset-1 focus-visible:ring-offset-[#020505] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "border-[#c69b55] bg-[#c69b55] text-[#020505] hover:bg-[#e6c284]",
        destructive:
          "border-[#d56b52] bg-[#7F1D1D] text-[#F4EFE3] hover:bg-[#d56b52] hover:text-[#020505] focus-visible:border-[#d56b52] focus-visible:ring-[#d56b52]/35",
        risk:
          "border-[#e6c284] bg-[#e6c284]/10 text-[#e6c284] hover:bg-[#e6c284] hover:text-[#020505] focus-visible:border-[#e6c284] focus-visible:ring-[#e6c284]/35",
        outline:
          "border-[rgba(198,155,85,0.42)] bg-[#050908] text-[#F4EFE3] hover:border-[#c69b55] hover:bg-[#0a1714]",
        secondary:
          "border-[rgba(198,155,85,0.32)] bg-[#0a1714] text-[#F4EFE3] hover:border-[#c69b55] hover:bg-[#07100e]",
        ghost:
          "border-transparent bg-transparent text-[#8c8a7e] hover:border-[rgba(198,155,85,0.22)] hover:bg-[#050908] hover:text-[#F4EFE3]",
        link: "border-transparent bg-transparent px-0 text-[#e6c284] underline-offset-4 hover:text-[#F4EFE3] hover:underline",
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
