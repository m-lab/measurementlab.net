import type { ReactNode } from 'react';

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
  const classes = `${variants[variant]} ${className}`;
  const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <a data-component href={href} className={classes} {...externalProps} {...props}>
      {children}
    </a>
  );
}
