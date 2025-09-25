import React from 'react';
import { Header } from '../organisms/Header';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';

interface MainLayoutProps {
    isConnected: boolean;
    userInfo?: {
        isValid: boolean;
        name?: string;
    };
    currentView: 'classes' | 'activities' | 'auth';
    selectedClass?: {
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
    } | null;
    onSettingsClick: () => void;
    onBackClick: () => void;
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
    isConnected,
    userInfo,
    currentView,
    selectedClass,
    onSettingsClick,
    onBackClick,
    children
}) => {
    const showBackButton = (currentView === 'activities' && selectedClass) || currentView === 'auth';

    return (
        <div className="h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
            {/* Header */}
            <Header
                isConnected={isConnected}
                userInfo={userInfo}
                onSettingsClick={onSettingsClick}
            />

            {/* Navigation */}
            {showBackButton && (
                <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 px-4 py-2">
                    <Button
                        onClick={onBackClick}
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <Icon name="arrow-left" size="sm" />
                        <span>Back</span>
                    </Button>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
                {children}
            </div>

            {/* Footer */}
            <div className="bg-white/60 backdrop-blur-sm border-t border-gray-200/50 p-3">
                <p className="text-xs text-gray-500 text-center">Student Portal</p>
                <p className="text-xs text-gray-500 text-center">Prototype by Hervey Kulot </p>
            </div>
        </div>
    );
};
