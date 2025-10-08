import { api } from "../http";
import { SurveyType } from "../survey/types";

// Survey types
export interface PreSurveyData {
    participant_id: string;
    field_of_study: string;
    confidence_level: number;
    use_of_AI: boolean;
    which_AI?: string;
}

export interface TaskResultData {
    participant_id: string;
    survey_type: string;
    task_index: number;
    time_taken: number;
    finished_within_time: boolean;
    code_files: Array<{ name: string; content: string; language: string }>;
    run_output?: string;
}

export interface PostTaskSurveyData {
    participant_id: string;
    survey_type: string;
    task_index: number;
    finished_within_time: boolean;
    difficult_to_fix: number;
    helpful_understand: number;
    helpful_fix: number;
    thought_process: string;
    feedback: string;
}

export interface OverallSurveyData {
    participant_id: string;
    survey_type: string;
    sus: {
        q7: number; q8: number; q9: number; q10: number; q11: number;
        q12: number; q13: number; q14: number; q15: number; q16: number;
    };
    future_use_likelihood: number;
    preferred_feedback_style: string;
    preferred_feedback_reason: string;
    other_comments?: string;
}

// Survey API functions

export const startSurvey = async (surveyType: SurveyType) => {
    console.log('surveyType', surveyType);
    return api.post('/api/survey/start', { survey_type: surveyType });
};

export const submitPreSurvey = async (data: PreSurveyData) => {
    return api.post('/api/survey/pre-task', data);
};

export const saveTaskResult = async (data: TaskResultData) => {
    return api.post('/api/survey/task-result', data);
};

export const submitPostTaskSurvey = async (data: PostTaskSurveyData) => {
    return api.post('/api/survey/post-task', data);
};

export const submitOverallSurvey = async (data: OverallSurveyData) => {
    return api.post('/api/survey/overall', data);
};