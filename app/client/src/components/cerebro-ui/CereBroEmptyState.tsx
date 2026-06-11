import { type ReactNode } from "react";
import { cerebroBrand as B } from "@/lib/cerebroTheme";
import { CereBroPanel } from "./CereBroPanel";

type CereBroEmptyStateProps = {
  title: ReactNode;
  children: ReactNode;
  action?: ReactNode;
};

export function CereBroEmptyState({ title, children, action }: CereBroEmptyStateProps) {
  return (
    <div className="grid h-full w-full place-items-center p-6">
      <CereBroPanel title={title} className="w-full max-w-md">
        <div className="text-[12px] leading-snug" style={{ color: B.color.muted500 }}>
          {children}
        </div>
        {action ? <div className="mt-3">{action}</div> : null}
      </CereBroPanel>
    </div>
  );
}
