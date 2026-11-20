import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800/40',
        secondary:
          'border-transparent bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
        destructive:
          'border-transparent bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/40',
        outline:
          'border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300',
        success:
          'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40',
        warning:
          'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40',
        info:
          'border-transparent bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/40',
        purple:
          'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/40',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, children, icon: Icon, dot, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full animate-pulse',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'destructive' && 'bg-rose-500',
            variant === 'info' && 'bg-sky-500',
            (!variant || variant === 'default') && 'bg-indigo-500'
          )}
        />
      )}
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
