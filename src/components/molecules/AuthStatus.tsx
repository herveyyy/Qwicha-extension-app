import React from 'react';
import { StatusIndicator } from '../atoms/StatusIndicator';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';

interface AuthStatusProps {
    isValid: boolean;
    name?: string;
    role?: string;
    domain?: string;
    cookieCount: number;
    onLoginClick?: () => void;
}

export const AuthStatus: React.FC<AuthStatusProps> = ({
    isValid,
    name,
    role,
    domain,
    cookieCount,
    onLoginClick
}) => {
    if (isValid) {
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium text-gray-900">{name}</span>
                </div>
                {role && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Role:</span>
                        <span className="text-sm font-medium text-gray-900">{role}</span>
                    </div>
                )}
                {domain && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Domain:</span>
                        <span className="text-sm font-medium text-gray-900">{domain}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Cookies:</span>
                    <span className="text-sm font-medium text-gray-900">{cookieCount} stored</span>
                </div>
            </div>
        );
    }

    return (
        <div className="text-center py-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon name="lock" size="lg" className="text-orange-600" />
            </div>
            <p className="text-sm text-gray-600 mb-3">Not authenticated</p>
            <Button onClick={onLoginClick} size="sm">
                Go to Login Page
            </Button>
        </div>
    );
};
