import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-bhumi px-5 py-3.5 text-white hover:bg-bhumi-dark",
        dark: "bg-ink px-5 py-3.5 text-white hover:bg-black",
        outline:
          "border border-ink px-5 py-3.5 text-ink hover:bg-ink hover:text-white",
        subtle:
          "border border-line px-5 py-3.5 text-ink hover:border-bhumi hover:text-bhumi",
        text: "px-0 py-1 text-bhumi hover:text-bhumi-dark",
      },
      size: {
        default: "",
        sm: "px-3.5 py-2.5 text-xs",
        lg: "px-6 py-4",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  children,
  className,
  variant,
  size,
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(buttonVariants({ variant, size, className }))}
    >
      {children}
    </Link>
  );
}

export { buttonVariants };
