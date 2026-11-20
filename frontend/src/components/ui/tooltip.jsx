import React, { useState } from 'react';
import { cn } from '@/utils/cn';

function Tooltip({ content, children, side = 'top', className }) {
  const [visible, setVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div
          className={cn(
            'absolute z-50 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs text-slate-100 shadow-md animate-in fade-in-0 zoom-in-95 dark:bg-slate-800 dark:text-slate-200 border border-slate-700/50 pointer-events-none',
            positionClasses[side] || positionClasses.top,
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export { Tooltip };
