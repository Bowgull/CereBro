import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { cerebroColors as C } from "@/lib/keepConfig";

interface ManusDialogProps {
  title?: string;
  logo?: string;
  open?: boolean;
  onLogin: () => void;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export function ManusDialog({
  title,
  logo,
  open = false,
  onLogin,
  onOpenChange,
  onClose,
}: ManusDialogProps) {
  const [internalOpen, setInternalOpen] = useState(open);

  useEffect(() => {
    if (!onOpenChange) {
      setInternalOpen(open);
    }
  }, [open, onOpenChange]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }

    if (!nextOpen) {
      onClose?.();
    }
  };

  return (
    <Dialog
      open={onOpenChange ? open : internalOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="w-[400px] gap-0 p-0 text-center">
        <div className="flex flex-col items-center gap-2 p-4 pt-8">
          {logo ? (
            <div
              className="flex h-12 w-12 items-center justify-center rounded border"
              style={{ background: C.surfaceMuted, borderColor: C.borderSoft }}
            >
              <img
                src={logo}
                alt="Dialog graphic"
                className="h-8 w-8 rounded"
              />
            </div>
          ) : null}

          {title ? (
            <DialogTitle className="text-[13px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
              {title}
            </DialogTitle>
          ) : null}
          <DialogDescription className="text-[12px] leading-snug" style={{ color: C.textSecondary }}>
            Please login with Manus to continue
          </DialogDescription>
        </div>

        <DialogFooter className="px-4 py-4">
          <Button
            onClick={onLogin}
            className="w-full"
          >
            Login with Manus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
