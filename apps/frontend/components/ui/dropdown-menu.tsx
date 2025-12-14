import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  buttonRef: React.MutableRefObject<HTMLButtonElement | null>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined);

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const dropdownContent = document.querySelector('[data-dropdown-content]');

      // Close if clicking outside both trigger and dropdown content
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        (!dropdownContent || !dropdownContent.contains(target))
      ) {
        setOpen(false);
      }
    };

    if (open) {
      // Small delay to avoid closing immediately when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef, buttonRef }}>
      <div ref={triggerRef} className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = ({
  children,
  className,
  asChild,
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu');

  const handleClick = React.useCallback(() => {
    context.setOpen(!context.open);
  }, [context]);

  // Use useEffect to find and store button ref after render
  const buttonRef = context.buttonRef;
  const triggerRef = context.triggerRef;
  React.useEffect(() => {
    if (asChild && triggerRef.current) {
      const button = triggerRef.current.querySelector('button');
      if (button) {
        buttonRef.current = button;
      }
    }
    // Refs are stable and don't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asChild]);

  // If asChild, clone the child and add onClick handler
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>;

    // Use React's cloneElement with proper typing
    return React.cloneElement(child, {
      ...child.props,
      onClick: handleClick,
      className: cn(className, child.props.className),
    } as React.HTMLAttributes<HTMLElement>);
  }

  // Otherwise render a div wrapper (not a button to avoid nesting)
  return (
    <div onClick={handleClick} className={cn('inline-block', className)} role="button" tabIndex={0}>
      {children}
    </div>
  );
};

const DropdownMenuContent = ({
  children,
  className,
  align = 'end',
}: {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'end' | 'center';
}) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu');
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Handle mounting for portal
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = React.useCallback(() => {
    const trigger = context.triggerRef.current;
    if (!trigger) {
      setPosition(null);
      return;
    }

    // Find the button element
    const button = context.buttonRef.current || trigger.querySelector('button');
    const elementToMeasure = button || trigger;

    if (!elementToMeasure) {
      setPosition(null);
      return;
    }

    const rect = elementToMeasure.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Get actual menu dimensions if rendered
    const menuWidth = contentRef.current?.offsetWidth || 160;
    const menuHeight = contentRef.current?.offsetHeight || 120;

    let top: number;
    let left: number;

    // Position below by default, above if not enough space
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < menuHeight + 8 && spaceAbove > spaceBelow) {
      // Position above
      top = rect.top - menuHeight - 8;
    } else {
      // Position below
      top = rect.bottom + 8;
    }

    // Calculate horizontal position based on align
    if (align === 'end') {
      // Align right edge of menu with right edge of button
      left = rect.right - menuWidth;
    } else if (align === 'start') {
      // Align left edge of menu with left edge of button
      left = rect.left;
    } else {
      // center
      left = rect.left + rect.width / 2 - menuWidth / 2;
    }

    // Ensure menu doesn't go off screen horizontally
    if (left < 8) {
      left = 8;
    } else if (left + menuWidth > viewportWidth - 8) {
      left = viewportWidth - menuWidth - 8;
    }

    setPosition({ top, left });
  }, [align, context.buttonRef, context.triggerRef]);

  React.useEffect(() => {
    if (context.open && mounted) {
      // Calculate position after a brief delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        calculatePosition();
        // Recalculate after menu renders to get actual dimensions
        setTimeout(() => calculatePosition(), 10);
      }, 0);

      // Recalculate on scroll/resize
      const handleRecalculate = () => {
        if (context.open) {
          calculatePosition();
        }
      };

      window.addEventListener('scroll', handleRecalculate, true);
      window.addEventListener('resize', handleRecalculate);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('scroll', handleRecalculate, true);
        window.removeEventListener('resize', handleRecalculate);
      };
    } else {
      setPosition(null);
    }
  }, [context.open, mounted, calculatePosition]);

  if (!context.open || !mounted || !position) return null;

  const content = (
    <div
      ref={contentRef}
      data-dropdown-content
      className={cn(
        'fixed z-100 min-w-32 overflow-hidden rounded-md border border-zinc-200 bg-white p-1 text-zinc-950 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {children}
    </div>
  );

  // Render via portal to document.body to avoid clipping issues
  return createPortal(content, document.body);
};

const DropdownMenuItem = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuItem must be used within DropdownMenu');

  return (
    <div
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100 dark:hover:bg-zinc-800 dark:focus:bg-zinc-800',
        className
      )}
      onClick={() => {
        onClick?.();
        context.setOpen(false);
      }}
    >
      {children}
    </div>
  );
};

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
