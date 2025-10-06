import { Clock, AlertTriangle } from 'lucide-react';
import { Phase, SurveyConfig } from '@/lib/survey/types';
import { TASKS } from '@/lib/survey/constants';

interface SurveyTopBarProps {
    selectedSurvey: SurveyConfig | null;
    phase: Phase;
    currentTask: number;
    timeElapsed: number;
    isTimerActive: boolean;
    formatTime: (seconds: number) => string;
    getTimerColor: () => string;
    getMaxTimeDisplay: () => string;
    isTimeUp: () => boolean;
    canCompleteTask?: () => boolean;
    onCompleteTask?: () => void;
    onQuitSurvey: () => void;
    enableNavigation?: boolean;
}

export default function SurveyTopBar({
    selectedSurvey,
    phase,
    currentTask,
    timeElapsed,
    isTimerActive,
    formatTime,
    getTimerColor,
    getMaxTimeDisplay,
    isTimeUp,
    canCompleteTask,
    onCompleteTask,
    onQuitSurvey,
    enableNavigation = false
}: SurveyTopBarProps) {
    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-semibold text-gray-900">
                        {enableNavigation ? 'Fri navigasjonsmodus' : selectedSurvey?.name || 'Undersøkelsesmodus'}
                    </h1>
                    {phase === 'task' && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>Oppgave {currentTask + 1}/4:</span>
                            <span className="font-medium">{TASKS[currentTask]?.title}</span>
                        </div>
                    )}
                    {phase === 'explore' && (
                        <div className="text-sm text-blue-600 font-medium">
                            Utforskningsfase - Test alle funksjonene
                        </div>
                    )}
                    {phase === 'navigate' && (
                        <div className="text-sm text-green-600 font-medium">
                            Fri navigasjon - Utforsk alle sider
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    {(phase === 'task' || phase === 'explore' || phase === 'navigate') && isTimerActive && (
                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className={`text-sm font-mono ${getTimerColor()}`}>
                                {formatTime(timeElapsed)} / {getMaxTimeDisplay()}
                            </span>
                            {isTimeUp() && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                        </div>
                    )}

                    {phase === 'task' && canCompleteTask && onCompleteTask && (
                        <button
                            onClick={onCompleteTask}
                            disabled={!canCompleteTask()}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${canCompleteTask()
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            Fullfør oppgave
                        </button>
                    )}

                    <button
                        onClick={onQuitSurvey}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                        {enableNavigation ? 'Avslutt økt' : 'Avslutt undersøkelse'}
                    </button>
                </div>
            </div>
        </div>
    );
}
