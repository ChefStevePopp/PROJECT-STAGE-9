import React from 'react';
import { twMerge } from 'tailwind-merge';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'small';
  component?: keyof JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
}

const variantStyles = {
  h1: 'text-fluid-4xl font-bold font-display leading-fluid-tight',
  h2: 'text-fluid-3xl font-semibold font-display leading-fluid-tight',
  h3: 'text-fluid-2xl font-medium font-display leading-fluid-snug',
  h4: 'text-fluid-xl font-medium font-display leading-fluid-snug',
  h5: 'text-fluid-lg font-medium font-display leading-fluid-normal',
  h6: 'text-fluid-base font-medium font-display leading-fluid-normal',
  body: 'text-fluid-base font-body leading-fluid-normal',
  small: 'text-fluid-sm font-body leading-fluid-normal',
};

const defaultElements = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'p',
  small: 'small',
} as const;

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  component,
  className,
  children,
}) => {
  const Component = component || defaultElements[variant];
  const baseStyles = variantStyles[variant];
  const combinedStyles = twMerge(baseStyles, className);

  return (
    <Component className={combinedStyles}>
      {children}
    </Component>
  );
};