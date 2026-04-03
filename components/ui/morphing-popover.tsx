'use client';

import {
  cloneElement,
  type MouseEvent as ReactMouseEvent,
  type MouseEventHandler,
  type ReactElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, MotionConfig, motion, type Transition, type Variants } from 'motion/react';
import { useClickOutside } from '@/hooks/use-click-outside';
import { cn } from '@/lib/utils';

const TRANSITION = {
  type: 'spring' as const,
  bounce: 0.1,
  duration: 0.4,
};

type MorphingPopoverContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  uniqueId: string;
  variants?: Variants;
};

const MorphingPopoverContext = createContext<MorphingPopoverContextValue | null>(null);

function usePopoverLogic({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const uniqueId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const isOpen = controlledOpen ?? uncontrolledOpen;

  const open = () => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(true);
    }
    onOpenChange?.(true);
  };

  const close = () => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(false);
    }
    onOpenChange?.(false);
  };

  return { isOpen, open, close, uniqueId };
}

export type MorphingPopoverProps = {
  children: React.ReactNode;
  transition?: Transition;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variants?: Variants;
  className?: string;
} & React.ComponentProps<'div'>;

function MorphingPopover({
  children,
  transition = TRANSITION,
  defaultOpen,
  open,
  onOpenChange,
  variants,
  className,
  ...props
}: MorphingPopoverProps) {
  const popoverLogic = usePopoverLogic({ defaultOpen, open, onOpenChange });

  return (
    <MorphingPopoverContext.Provider value={{ ...popoverLogic, variants }}>
      <MotionConfig transition={transition}>
        <div
          key={popoverLogic.uniqueId}
          className={cn('relative flex items-center justify-center', className)}
          {...props}
        >
          {children}
        </div>
      </MotionConfig>
    </MorphingPopoverContext.Provider>
  );
}

export type MorphingPopoverTriggerProps = {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<typeof motion.button>;

function MorphingPopoverTrigger({
  children,
  className,
  asChild = false,
  ...props
}: MorphingPopoverTriggerProps) {
  const context = useContext(MorphingPopoverContext);

  if (!context) {
    throw new Error('MorphingPopoverTrigger must be used within MorphingPopover');
  }

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{
      className?: string;
      onClick?: MouseEventHandler;
      'aria-expanded'?: boolean;
      'aria-controls'?: string;
    }>;
    const childProps = child.props;

    return (
      <motion.div key={context.uniqueId} layoutId={`popover-trigger-${context.uniqueId}`}>
        {cloneElement(child, {
          ...childProps,
          onClick: (event: ReactMouseEvent) => {
            childProps.onClick?.(event);
            context.open();
          },
          className: childProps.className,
          'aria-expanded': context.isOpen,
          'aria-controls': `popover-content-${context.uniqueId}`,
        })}
      </motion.div>
    );
  }

  return (
    <motion.div
      key={context.uniqueId}
      layoutId={`popover-trigger-${context.uniqueId}`}
      onClick={context.open}
    >
      <motion.button
        {...props}
        key={context.uniqueId}
        layoutId={`popover-label-${context.uniqueId}`}
        className={className}
        aria-expanded={context.isOpen}
        aria-controls={`popover-content-${context.uniqueId}`}
      >
        {children}
      </motion.button>
    </motion.div>
  );
}

export type MorphingPopoverContentProps = {
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<typeof motion.div>;

function MorphingPopoverContent({
  children,
  className,
  ...props
}: MorphingPopoverContentProps) {
  const context = useContext(MorphingPopoverContext);

  if (!context) {
    throw new Error('MorphingPopoverContent must be used within MorphingPopover');
  }

  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, context.close);

  useEffect(() => {
    if (!context.isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        context.close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [context]);

  return (
    <AnimatePresence>
      {context.isOpen ? (
        <motion.div
          {...props}
          ref={ref}
          key={context.uniqueId}
          id={`popover-content-${context.uniqueId}`}
          role="dialog"
          aria-modal="true"
          layoutId={`popover-trigger-${context.uniqueId}`}
          className={cn(
            'absolute overflow-hidden rounded-md border border-zinc-950/10 bg-white p-2 text-zinc-950 shadow-md dark:border-zinc-50/10 dark:bg-zinc-700 dark:text-zinc-50',
            className
          )}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={context.variants}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent };
