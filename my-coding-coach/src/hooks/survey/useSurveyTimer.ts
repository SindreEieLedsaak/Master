import { useEffect } from 'react';
import { Phase } from '@/lib/survey/types';
import { TIMER_LIMITS } from '@/lib/survey/constants';

interface UseSurveyTimerProps {
    isTimerActive: boolean;
    phase: Phase;
    timeElapsed: number;
    setTimeElapsed: (time: number | ((prev: number) => number)) => void;
    setIsTimerActive: (active: boolean) => void;
    setPhase: (phase: Phase) => void;
}

export const useSurveyTimer = ({
    isTimerActive,
    phase,
    timeElapsed,
    setTimeElapsed,
    setIsTimerActive,
    setPhase
}: UseSurveyTimerProps) => {
    useEffect(() => {
        if (!isTimerActive) return;

        const interval = setInterval(() => {
            setTimeElapsed(prev => {
                let maxTime: number = TIMER_LIMITS.TASK;

                if (phase === 'navigate') {
                    maxTime = TIMER_LIMITS.NAVIGATE;
                }

                if (prev >= maxTime) {
                    setIsTimerActive(false);

                    // Auto-advance based on phase
                    if (phase === 'navigate') {
                        setPhase('overall');
                    }

                    return maxTime;
                }
                return prev + 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isTimerActive, phase, setTimeElapsed, setIsTimerActive, setPhase]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        let maxTime: number = TIMER_LIMITS.TASK;
        if (phase === 'navigate') maxTime = TIMER_LIMITS.NAVIGATE;

        const warningTime = Math.floor(maxTime * 0.75);

        if (timeElapsed >= maxTime) return 'text-red-600';
        if (timeElapsed >= warningTime) return 'text-yellow-600';
        return 'text-gray-700';
    };

    const getMaxTimeDisplay = () => {
        if (phase === 'navigate') return '10:00';
        return '7:00';
    };

    const isTimeUp = () => {
        let maxTime: number = TIMER_LIMITS.TASK;
        if (phase === 'navigate') maxTime = TIMER_LIMITS.NAVIGATE;

        return timeElapsed >= maxTime;
    };

    return {
        formatTime,
        getTimerColor,
        getMaxTimeDisplay,
        isTimeUp
    };
};
