
import { toast as sonnerToast, type ToastOptions as SonnerToastOptions } from "sonner";

export type ToastProps = SonnerToastOptions & {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function toast({ title, description, variant, ...props }: ToastProps) {
  return sonnerToast(title || description || "", {
    ...props,
    classNames: {
      toast: `group toast group-[.destructive]:border-destructive ${
        variant === "destructive"
          ? "border-destructive bg-destructive text-destructive-foreground"
          : ""
      }`,
      title: "toast-title",
      description: "toast-description",
    },
  });
}

export { toast, sonnerToast as useToast };
