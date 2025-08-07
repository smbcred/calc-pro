import React from 'react';
import { Link } from 'wouter';

interface NavigationLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

const NavigationLink: React.FC<NavigationLinkProps> = ({ to, children, className = '' }) => {
  return (
    <Link href={to}>
      <a className={className}>
        {children}
      </a>
    </Link>
  );
};

export default NavigationLink;