"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0b1b15]/50 p-3 sm:p-6">
        <DialogPrimitive.Content
          className={cn(
            "pointer-events-auto relative z-10 min-w-0 w-full max-w-[calc(100vw-1.5rem)] rounded-2xl border border-[#dce5df] bg-white shadow-xl focus:outline-none sm:my-auto sm:max-w-2xl",
            className
          )}
          {...props}
        >
          <div className="flex items-center justify-end border-b border-[#edf3ef] px-4 py-2.5">
            <DialogPrimitive.Close
              aria-label="Close dialog"
              className="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-xs font-medium text-[#4b5e56] hover:bg-[#edf3ef] hover:text-[#10201a] cursor-pointer"
            >
              <span>Close</span>
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
          <div className="min-w-0 overflow-x-hidden p-5 sm:p-6">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold text-[#10201a]", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description className={cn("text-sm text-[#4b5e56]", className)} {...props} />
  );
}
