import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, className = "" }) => {
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
