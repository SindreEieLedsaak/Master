'use client';

import { useEffect } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { useSurvey } from '@/contexts/survey/SurveyContext';
import { TIMER_LIMITS } from '@/lib/survey/constants';

export default function SurveyFloatingButton() {
    const { isSurveyMode, currentPhase, enableNavigation, timeElapsed, setTimeElapsed, setPhase, returnToSurvey } = useSurvey();

    // Update timer when in navigate phase on other pages
    useEffect(() => {
        if (currentPhase !== 'navigate' || !enableNavigation) return;

        const interval = setInterval(() => {
            setTimeElapsed((prev: number) => {
                const newTime = prev + 1;
                // Auto-advance to overall questionnaire after 10 minutes
                if (newTime >= TIMER_LIMITS.NAVIGATE) {
                    setPhase('overall');
                    // Redirect to survey page to show the overall questionnaire
                    window.location.href = '/survey';
                    return TIMER_LIMITS.NAVIGATE;
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [currentPhase, enableNavigation, setTimeElapsed, setPhase]);

    // Only show when in survey mode with navigation enabled and not already on survey page
    const shouldShow = isSurveyMode && enableNavigation && currentPhase === 'navigate' &&
        typeof window !== 'undefined' && !window.location.pathname.includes('/survey');

    if (!shouldShow) return null;

    const timeRemaining = TIMER_LIMITS.NAVIGATE - timeElapsed;
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        const warningTime = Math.floor(TIMER_LIMITS.NAVIGATE * 0.75);
        if (timeElapsed >= TIMER_LIMITS.NAVIGATE) return 'text-red-600';
        if (timeElapsed >= warningTime) return 'text-yellow-600';
        return 'text-green-600';
    };

    return (
        <div className="fixed bottom-6 left-2 z-50">
            <div className="bg-white border-2 border-blue-500 rounded-lg shadow-lg p-4 max-w-sm">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">Survey in Progress</h3>
                    <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className={`text-sm font-mono ${getTimerColor()}`}>
                            {formatTime(timeRemaining)}
                        </span>
                    </div>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                    Continue exploring the app. The final questionnaire will appear in {formatTime(timeRemaining)}.
                </p>
                <button
                    onClick={returnToSurvey}
                    className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                >
                    <span>Return to Survey</span>
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
