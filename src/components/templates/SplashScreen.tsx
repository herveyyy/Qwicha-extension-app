import React from 'react';
import { Logo } from '../atoms/Logo';
import { Button } from '../atoms/Button';

interface SplashScreenProps {
    isLoading: boolean;
    onGetStarted: () => void;
    onCheckAuth: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
    isLoading,
    onGetStarted,
    onCheckAuth
}) => {
    return (
        <div className="h-screen w-full bg-gradient-to-br from-orange-50 via-white to-orange-100 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background texture */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-orange-100/30"></div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-200/40 to-transparent"></div>
            
            {/* Logo */}
            <div className="relative z-10 flex flex-col items-center space-y-6">
                <Logo size="lg" />
                
                {/* App Name */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Silid Quickies</h1>
                    <p className="text-gray-700 text-lg mb-1">Smart. Safe. Seamless.</p>
                    <p className="text-gray-600 text-sm">Your student portal for classes and activities.</p>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <Button
                        onClick={onGetStarted}
                        size="lg"
                    >
                        Get Started
                    </Button>
                    <Button
                        onClick={onCheckAuth}
                        disabled={isLoading}
                        variant="secondary"
                        size="md"
                    >
                        Check Authentication
                    </Button>
                </div>
            </div>
            
            {/* Subtle particles effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-orange-400/30 rounded-full animate-pulse"></div>
                <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-orange-300/20 rounded-full animate-pulse delay-1000"></div>
                <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-orange-500/25 rounded-full animate-pulse delay-2000"></div>
            </div>
        </div>
    );
};
