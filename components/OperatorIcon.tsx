import React from 'react';
import { Operator } from '../types';
import { Smartphone, Wallet } from 'lucide-react';

interface OperatorIconProps {
  operator: Operator;
  size?: number;
  className?: string;
}

export const OperatorIcon: React.FC<OperatorIconProps> = ({ operator, size = 24, className = '' }) => {
  switch (operator) {
    case Operator.ORANGE:
      return (
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg" 
          alt="Orange" 
          width={size} 
          height={size} 
          className={`object-contain rounded-md ${className}`} 
          referrerPolicy="no-referrer"
          onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=Orange&background=ff7900&color=fff&rounded=true&bold=true"; }}
        />
      );
    case Operator.MTN:
      return (
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg" 
          alt="MTN" 
          width={size} 
          height={size} 
          className={`object-contain rounded-full bg-white p-0.5 ${className}`} 
          referrerPolicy="no-referrer"
          onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=MTN&background=ffcc00&color=000&rounded=true&bold=true"; }}
        />
      );
    case Operator.MOOV:
      return (
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/3/37/Moov_Africa_logo.png" 
          alt="Moov" 
          width={size} 
          height={size} 
          className={`object-contain rounded-md ${className}`} 
          referrerPolicy="no-referrer"
          onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=Moov&background=0055A5&color=fff&rounded=true&bold=true"; }}
        />
      );
    case Operator.WAVE:
      return (
        <img 
          src="https://www.wave.com/wp-content/uploads/2023/11/Wave-logo-blue.png" 
          alt="Wave" 
          width={size} 
          height={size} 
          className={`object-contain rounded-md ${className}`} 
          referrerPolicy="no-referrer"
          onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=Wave&background=1ce&color=fff&rounded=true&bold=true"; }}
        />
      );
    case Operator.WALLET:
      return <Wallet size={size} className={className} />;
    default:
      return <Smartphone size={size} className={className} />;
  }
};
