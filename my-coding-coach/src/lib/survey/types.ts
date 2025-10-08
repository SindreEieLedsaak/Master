export interface File {
    name: string;
    content: string;
    language: string;
}

export type SurveyType = 'hints' | 'solutions' | 'terminal' | 'none';

export interface SurveyConfig {
    survey_type: SurveyType;
    name: string;
    description: string;
    aiEnabled: boolean;
    systemPrompt?: string;
}

export type Phase = 'select' | 'intro' | 'pre' | 'task' | 'post' | 'explore' | 'navigate' | 'overall' | 'complete';

export interface TaskData {
    title: string;
    md: string;
    main: string;
    verify: (output: string) => boolean;
}

export interface SurveyState {
    phase: Phase;
    selectedSurvey: SurveyConfig | null;
    currentTask: number;
    timeElapsed: number;
    isTimerActive: boolean;
    lastOutput: string;
    files: File[];
    activeFile: string;
}

export interface PreSurveyFormData {
    participantId: string;
    fieldOfStudy: string;
    pythonConfidence: number;
    usedAiBefore: boolean | null;
    aiToolsUsed: string;
}

export interface PostTaskFormData {
    survey_type: SurveyType;
    fixedWithinTime: boolean | null;
    difficulty: number | null;
    helpfulUnderstand: number | null;
    helpfulFix: number | null;
    thoughtProcess: string;
    feedbackReason: string;
}

export interface OverallSurveyFormData {
    survey_type: SurveyType;
    sus: {
        q7: number; q8: number; q9: number; q10: number; q11: number;
        q12: number; q13: number; q14: number; q15: number; q16: number;
    };
    futureUse: number;
    feedbackStyle: 'A' | 'B' | 'C' | 'D' | '';
    feedbackStyleReason: string;
    otherComments: string;
}
