import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'normal',
  shadow = 'medium',
  hover = false,
  border = false 
}) => {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    normal: 'p-6',
    large: 'p-8',
    xl: 'p-10',
  };

  const shadowClasses = {
    none: '',
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-300' : '';
  const borderClasses = border ? 'border border-gray-200' : '';

  return (
    <div
      className={`bg-white rounded-lg ${paddingClasses[padding]} ${shadowClasses[shadow]} ${hoverClasses} ${borderClasses} ${className}`}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

const CardBody = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
