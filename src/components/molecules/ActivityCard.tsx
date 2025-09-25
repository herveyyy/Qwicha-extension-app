import React from 'react';
import { Icon } from '../atoms/Icon';

interface ActivityCardProps {
    id: string;
    title: string;
    type: 'Quiz' | 'Assignment' | 'Lesson';
    dueDate: string;
    onClick?: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
    id,
    title,
    type,
    dueDate,
    onClick
}) => {
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'Quiz': return 'quiz';
            case 'Assignment': return 'assignment';
            case 'Lesson': return 'lesson';
            default: return 'book';
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'Quiz': return 'bg-indigo-50 text-indigo-600';
            case 'Assignment': return 'bg-emerald-50 text-emerald-600';
            case 'Lesson': return 'bg-amber-50 text-amber-600';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    return (
        <div
            className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={onClick}
        >
            <div className="flex items-center p-3">
                {/* Activity Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${getActivityColor(type)}`}>
                    <Icon name={getActivityIcon(type)} size="sm" />
                </div>
                
                {/* Activity Info */}
                <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
                    <p className="text-xs text-gray-600">Due: {dueDate}</p>
                </div>

                {/* Arrow */}
                <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Icon name="arrow-right" size="sm" className="text-gray-600" />
                </div>
            </div>
        </div>
    );
};
