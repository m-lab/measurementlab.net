import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';
import ArrowDown from '~icons/m-lab/arrow-down';
import ArrowLong from '~icons/m-lab/arrow-long';
import MeasurementSmall from '~icons/m-lab/measurement-small';

type BaseProps = {
  variant?:
    | 'primary'
    | 'secondary'
    | 'supporting1'
    | 'supporting2'
    | 'speed'
    | 'outline'
    | 'ghost';
  icon?: 'arrowDown' | 'arrowRight' | 'measurement';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'square';
  className?: string;
  children?: ReactNode;
};

type ButtonAsButton = BaseProps & {
  as?: 'button';
  type?: 'button' | 'submit' | 'reset';
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

type ButtonAsAnchor = BaseProps & {
  as: 'a';
  href?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'>;

export type Props = ButtonAsButton | ButtonAsAnchor;

export default function Button({
  variant = 'primary',
  size = 'md',
  as = 'button',
  icon,
  className = '',
  children,
  ...props
}: Props) {
  const baseStyles = 'button-base';

  const variants = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    supporting1: 'button-supporting1',
    supporting2: 'button-supporting2',
    speed: 'button-speed',
    outline: 'button-outline',
    ghost: 'button-ghost',
  };

  const sizes = {
    sm: 'button-size-sm',
    md: 'button-size-md',
    lg: 'button-size-lg',
    xl: 'button-size-xl',
    square: 'button-size-square',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (as === 'a') {
    const { href, ...anchorProps } = props as ButtonAsAnchor;
    return (
      <a data-component href={href} className={classes} {...anchorProps}>
        {icon === 'arrowDown' && <ArrowDown />}
        {icon === 'measurement' && <MeasurementSmall />}
        {children}
        {icon === 'arrowRight' && <ArrowLong style={{ fontSize: '2em' }} />}
      </a>
    );
  }

  const { type = 'button', ...buttonProps } = props as ButtonAsButton;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {icon === 'arrowDown' && <ArrowDown />}
      {icon === 'measurement' && <MeasurementSmall />}
      {children}
      {icon === 'arrowRight' && <ArrowLong style={{ fontSize: '2em' }} />}
    </button>
  );
}
