import React from 'react';
import { Logo } from '../atoms/Logo';
import { StatusIndicator } from '../atoms/StatusIndicator';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';

interface HeaderProps {
    isConnected: boolean;
    userInfo?: {
        isValid: boolean;
        name?: string;
    };
    onSettingsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    isConnected,
    userInfo,
    onSettingsClick
}) => {
    return (
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Logo size="md" />
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Silid Quickies</h1>
                        {userInfo?.isValid && (
                            <p className="text-xs text-green-600">
                                <Icon name="check" size="sm" className="inline mr-1" />
                                {userInfo.name}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={onSettingsClick}
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0"
                    >
                        <Icon name="settings" size="sm" />
                    </Button>
                    <StatusIndicator 
                        status={isConnected ? 'connected' : 'disconnected'} 
                    />
                </div>
            </div>
        </div>
    );
};
