import React from 'react';
import { ActivityCard } from '../molecules/ActivityCard';
import { Icon } from '../atoms/Icon';

interface ActivityData {
    id: string;
    title: string;
    type: 'Quiz' | 'Assignment' | 'Lesson';
    dueDate: string;
}

interface ActivityListProps {
    activities: ActivityData[];
    className?: string;
    onActivityClick: (activity: ActivityData) => void;
}

export const ActivityList: React.FC<ActivityListProps> = ({
    activities,
    className = '',
    onActivityClick
}) => {
    if (activities.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon name="book" size="lg" className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">No activities available</p>
            </div>
        );
    }

    return (
        <div className={`space-y-2 ${className}`}>
            {activities.map((activity) => (
                <ActivityCard
                    key={activity.id}
                    {...activity}
                    onClick={() => onActivityClick(activity)}
                />
            ))}
        </div>
    );
};
