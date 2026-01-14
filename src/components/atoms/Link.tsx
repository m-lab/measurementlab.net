import type { ReactNode } from 'react';
import ArrowTopRightOnSquareIcon from '~icons/heroicons/arrow-top-right-on-square-20-solid';

export interface LinkProps {
  href: string;
  variant?: 'default' | 'nav' | 'footer' | 'unstyled';
  external?: boolean;
  className?: string;
  children: ReactNode;
  [key: string]: any;
}

const variants = {
  default: 'link-default',
  nav: 'text-xl',
  footer: 'text-white text-sm hover:underline underline-offset-4 transition',
  unstyled: '',
};

export default function Link({
  href,
  variant = 'default',
  external = false,
  className = '',
  children,
  ...props
}: LinkProps) {
  const classes = `${variants[variant]} ${className} flex items-center justify-start gap-1`;
  const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <a data-component href={href} className={classes} {...externalProps} {...props}>
     <span>{children}</span>
      {external && <ArrowTopRightOnSquareIcon className="inline-block h-4 w-4 ml-1" aria-hidden="true" />}
    </a>
  );
}
