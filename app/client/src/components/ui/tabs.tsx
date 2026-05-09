import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-7 w-fit max-w-full items-center justify-center rounded-md border border-[#253041] bg-[#151A23] p-0.5 text-[#B8C0CC]",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-full min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded border border-transparent px-2 py-0.5 text-[11px] font-medium text-[#B8C0CC] transition-[background-color,border-color,color,box-shadow] outline-none data-[state=active]:border-[#334155] data-[state=active]:bg-[#202A38] data-[state=active]:text-[#F4EFE3] disabled:pointer-events-none disabled:text-[#7E8898] disabled:opacity-70 focus-visible:border-[#6BA6FF] focus-visible:ring-2 focus-visible:ring-[#6BA6FF]/45 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0E1116] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none focus-visible:ring-2 focus-visible:ring-[#6BA6FF]/45 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0E1116]", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
