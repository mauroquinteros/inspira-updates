import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-28 w-full rounded-[1.4rem] border border-white/8 bg-input/95 px-3.5 py-3 text-base text-foreground shadow-inner shadow-black/10 transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/40 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/95 dark:disabled:bg-input/70 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
