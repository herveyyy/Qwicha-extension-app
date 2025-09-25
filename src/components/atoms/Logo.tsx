import React from 'react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
    size = 'md', 
    className = '', 
    text = 'SQ' 
}) => {
    const sizeClasses = {
        sm: 'w-6 h-6 text-xs',
        md: 'w-8 h-8 text-sm',
        lg: 'w-20 h-20 text-3xl'
    };
    
    return (
        <div className={`bg-gradient-to-b from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/25 transform rotate-12 ${sizeClasses[size]} ${className}`}>
            <span className="text-white font-bold transform -rotate-12">{text}</span>
        </div>
    );
};
