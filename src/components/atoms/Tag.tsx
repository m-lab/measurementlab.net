import type { ReactNode } from 'react';

export interface TagProps {
  variant?:
    | 'primary'
    | 'secondary'
    | 'supporting1'
    | 'supporting2'
    | 'speed'
    | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: ReactNode;
}

const baseStyles = 'tag-base';

const variants = {
  primary: 'tag-primary',
  secondary: 'tag-secondary',
  supporting1: 'tag-supporting1',
  supporting2: 'tag-supporting2',
  speed: 'tag-speed',
  neutral: 'tag-neutral',
};

const sizes = {
  sm: 'tag-size-sm',
  md: 'tag-size-md',
  lg: 'tag-size-lg',
};

export default function Tag({
  variant = 'primary',
  size = 'sm',
  className = '',
  children,
}: TagProps) {
  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return <span className={classes}>{children}</span>;
}
