import React from 'react';

interface StatusIndicatorProps {
    status: 'connected' | 'disconnected' | 'loading' | 'error';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
    status, 
    size = 'sm', 
    className = '' 
}) => {
    const sizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4'
    };
    
    const statusClasses = {
        connected: 'bg-green-500',
        disconnected: 'bg-red-500',
        loading: 'bg-yellow-500 animate-pulse',
        error: 'bg-red-500 animate-pulse'
    };
    
    return (
        <div className={`${sizeClasses[size]} rounded-full ${statusClasses[status]} ${className}`}></div>
    );
};
