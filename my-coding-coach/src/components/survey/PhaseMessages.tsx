import { Phase } from '@/lib/survey/types';

interface PhaseMessagesProps {
    phase: Phase;
    timeElapsed: number;
    formatTime: (seconds: number) => string;
}

export default function PhaseMessages({ phase, timeElapsed, formatTime }: PhaseMessagesProps) {
    if (phase === 'explore') {
        return (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-300 rounded-lg p-4 z-10 shadow-lg">
                <div className="text-center">
                    <h3 className="font-medium text-blue-900">✅ All Tasks Complete - Exploration Phase</h3>
                    <p className="text-sm text-blue-700 mt-1">
                        Feel free to explore the tool and try different features for the next 8 minutes.
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                        Free navigation will begin automatically in {formatTime(480 - timeElapsed)}.
                    </p>
                </div>
            </div>
        );
    }

    if (phase === 'navigate') {
        return (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-300 rounded-lg p-4 z-10 shadow-lg">
                <div className="text-center">
                    <h3 className="font-medium text-green-900">🎉 Free Navigation Mode</h3>
                    <p className="text-sm text-green-700 mt-1">
                        You can now navigate to any page in the application! Test all features.
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                        The final questionnaire will appear automatically in {formatTime(600 - timeElapsed)}.
                    </p>
                </div>
            </div>
        );
    }

    return null;
}
