import React from 'react';

interface IconProps {
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
    };
    
    const iconMap: { [key: string]: string } = {
        'settings': '⚙️',
        'arrow-right': '→',
        'arrow-left': '←',
        'refresh': '🔄',
        'cookie': '🍪',
        'trash': '🗑️',
        'lock': '🔒',
        'unlock': '🔓',
        'book': '📚',
        'quiz': '🧠',
        'assignment': '📝',
        'lesson': '📚',
        'user': '👤',
        'check': '✓',
        'loading': '⏳'
    };
    
    return (
        <span className={`${sizeClasses[size]} ${className}`}>
            {iconMap[name] || name}
        </span>
    );
};
