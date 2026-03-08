import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * Consistent section wrapper with max-width and padding.
 */
export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn('relative w-full px-6 md:px-8', className)}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}
