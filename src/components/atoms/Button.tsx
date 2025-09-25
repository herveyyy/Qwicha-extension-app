import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    disabled = false,
    variant = 'primary',
    size = 'md',
    className = '',
    loading = false
}) => {
    const baseClasses = 'font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2';
    
    const variantClasses = {
        primary: 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl',
        secondary: 'bg-white/80 hover:bg-white text-orange-600 border border-orange-200 shadow-md hover:shadow-lg',
        danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl',
        ghost: 'bg-transparent hover:bg-white/10 text-gray-600 hover:text-gray-900'
    };
    
    const sizeClasses = {
        sm: 'px-3 py-1 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-8 py-4 text-base'
    };
    
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105';
    
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
        >
            {loading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            )}
            {children}
        </button>
    );
};
