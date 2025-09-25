import React from 'react';
import { ClassCard } from '../molecules/ClassCard';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';

interface ClassCardData {
    classCardId: string;
    classRoomId: string;
    classRoomName: string;
    color: string;
    createdAt: string;
    sectionName: string;
    subjectCode: string;
    subjectId: string;
    subjectName: string;
    updatedAt: string;
    activityCount?: number;
    teacher?: string;
}

interface ClassListProps {
    classes: ClassCardData[];
    isLoading: boolean;
    hasAccessToken: boolean;
    onRefresh: () => void;
    onClassClick: (classCard: ClassCardData) => void;
}

export const ClassList: React.FC<ClassListProps> = ({
    classes,
    isLoading,
    hasAccessToken,
    onRefresh,
    onClassClick
}) => {
    if (isLoading) {
        return (
            <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-gray-600">Loading classes...</p>
            </div>
        );
    }

    if (classes.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon name="book" size="lg" className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-3">No classes available</p>
                <Button
                    onClick={onRefresh}
                    disabled={!hasAccessToken}
                >
                    Load Classes
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">My Classes</h2>
                <Button
                    onClick={onRefresh}
                    disabled={isLoading || !hasAccessToken}
                    size="sm"
                    variant="secondary"
                >
                    {isLoading ? (
                        <>
                            <Icon name="loading" size="sm" />
                            <span>Loading...</span>
                        </>
                    ) : (
                        <>
                            <Icon name="refresh" size="sm" />
                            <span>Refresh</span>
                        </>
                    )}
                </Button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Select a class to view activities</p>
            
            <div className="space-y-2">
                {classes.map((classCard) => (
                    <ClassCard
                        key={classCard.classCardId}
                        classCardId={classCard.classCardId}
                        classRoomName={classCard.classRoomName}
                        subjectName={classCard.subjectName}
                        subjectCode={classCard.subjectCode}
                        color={classCard.color}
                        onClick={() => onClassClick(classCard)}
                    />
                ))}
            </div>
        </>
    );
};
