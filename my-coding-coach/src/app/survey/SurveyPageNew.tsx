'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useUser } from '@/contexts/user/UserContext';
import { useSurvey } from '@/contexts/survey/SurveyContext';
import toast from 'react-hot-toast';

// Survey components
import SurveySelection from '@/components/survey/SurveySelection';
import SurveyIntro from '@/components/survey/SurveyIntro';
import PreTaskSurvey from '@/components/survey/PreTaskSurvey';
import PostTaskSurvey from '@/components/survey/PostTaskSurvey';
import OverallSurvey from '@/components/survey/OverallSurvey';
import SurveyEditor from '@/components/survey/SurveyEditor';
import SurveyTopBar from '@/components/survey/SurveyTopBar';
import PhaseMessages from '@/components/survey/PhaseMessages';

// Survey types and constants
import {
    Phase,
    SurveyConfig,
    File,
    PreSurveyFormData,
    PostTaskFormData,
    OverallSurveyFormData
} from '@/lib/survey/types';
import { TASKS, EXPLORATION_FILES, NAVIGATION_FILES } from '@/lib/survey/constants';
import { generateParticipantId } from '@/lib/survey/utils';

// Custom hooks
import { useSurveyTimer } from '@/hooks/survey/useSurveyTimer';

export default function SurveyPageNew() {
    const { user } = useUser();
    const router = useRouter();
    const {
        startSurvey,
        endSurvey,
        setPhase: setSurveyPhase,
        setNavigationEnabled,
        participantId: contextParticipantId,
        selectedSurvey: contextSelectedSurvey,
        isSurveyMode,
        currentPhase: contextPhase,
        timeElapsed: contextTimeElapsed,
        setTimeElapsed: setContextTimeElapsed
    } = useSurvey();

    // Survey state (initialize from context if available)
    const [phase, setPhase] = useState<Phase>(contextPhase || 'select');
    const [selectedSurvey, setSelectedSurvey] = useState<SurveyConfig | null>(contextSelectedSurvey);
    const [currentTask, setCurrentTask] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(contextTimeElapsed || 0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [lastOutput, setLastOutput] = useState('');
    const [authExpired, setAuthExpired] = useState(false);

    // Editor state
    const [files, setFiles] = useState<File[]>([]);
    const [activeFile, setActiveFile] = useState('main.py');

    // Form state
    const [preFormData, setPreFormData] = useState<PreSurveyFormData>({
        participantId: contextParticipantId || generateParticipantId(),
        fieldOfStudy: '',
        pythonConfidence: 3,
        usedAiBefore: null,
        aiToolsUsed: ''
    });

    const [postFormData, setPostFormData] = useState<PostTaskFormData>({
        survey_type: selectedSurvey?.survey_type || 'none',
        fixedWithinTime: null,
        difficulty: null,
        helpfulUnderstand: null,
        helpfulFix: null,
        thoughtProcess: '',
        feedbackReason: ''
    });

    const [overallFormData, setOverallFormData] = useState<OverallSurveyFormData>({
        survey_type: selectedSurvey?.survey_type || 'none',
        sus: { q7: 3, q8: 3, q9: 3, q10: 3, q11: 3, q12: 3, q13: 3, q14: 3, q15: 3, q16: 3 },
        futureUse: 3,
        feedbackStyle: '',
        feedbackStyleReason: '',
        otherComments: ''
    });

    // Timer hook
    const { formatTime, getTimerColor, getMaxTimeDisplay, isTimeUp } = useSurveyTimer({
        isTimerActive,
        phase,
        timeElapsed,
        setTimeElapsed: (time) => {
            if (typeof time === 'number') {
                setTimeElapsed(time);
                setContextTimeElapsed(time);
            } else {
                setTimeElapsed(time);
                setContextTimeElapsed(time(timeElapsed));
            }
        },
        setIsTimerActive,
        setPhase: (newPhase: Phase) => {
            setPhase(newPhase);
            setSurveyPhase(newPhase);

            if (newPhase === 'navigate') {
                setNavigationEnabled(true);
                loadNavigationFiles();
            }
        }
    });

    // Sync with survey context
    useEffect(() => {
        setSurveyPhase(phase);
    }, [phase, setSurveyPhase]);

    // Update survey_type in form data when survey is selected
    useEffect(() => {
        if (selectedSurvey?.survey_type) {
            setPostFormData(prev => ({ ...prev, survey_type: selectedSurvey.survey_type }));
            setOverallFormData(prev => ({ ...prev, survey_type: selectedSurvey.survey_type }));
        }
    }, [selectedSurvey?.survey_type]);

    // Resume timer in navigation phase if returning to survey
    useEffect(() => {
        if (contextPhase === 'navigate' && isSurveyMode && contextSelectedSurvey && contextParticipantId) {
            setPhase('navigate');
            setSelectedSurvey(contextSelectedSurvey);
            setPreFormData(prev => ({ ...prev, participantId: contextParticipantId }));
            setTimeElapsed(contextTimeElapsed);
            setIsTimerActive(true);
            loadNavigationFiles();
        }
    }, [contextPhase, isSurveyMode, contextSelectedSurvey, contextParticipantId, contextTimeElapsed]);

    // Handle overall phase when returning to survey
    useEffect(() => {
        if (contextPhase === 'overall' && isSurveyMode && contextSelectedSurvey && contextParticipantId) {
            setPhase('overall');
            setSelectedSurvey(contextSelectedSurvey);
            setPreFormData(prev => ({ ...prev, participantId: contextParticipantId }));
            setIsTimerActive(false);
        }
    }, [contextPhase, isSurveyMode, contextSelectedSurvey, contextParticipantId]);

    // Reset to selection screen if survey context has been cleared
    useEffect(() => {
        if (!isSurveyMode && !contextPhase && phase !== 'select') {
            setPhase('select');
            setSelectedSurvey(null);
            setCurrentTask(0);
            setTimeElapsed(0);
            setIsTimerActive(false);
            setAuthExpired(false);
            // Reset form data to defaults
            setPreFormData({
                participantId: generateParticipantId(),
                fieldOfStudy: '',
                pythonConfidence: 3,
                usedAiBefore: null,
                aiToolsUsed: ''
            });
            setPostFormData(prev => ({
                survey_type: prev.survey_type || 'none',
                fixedWithinTime: null,
                difficulty: null,
                helpfulUnderstand: null,
                helpfulFix: null,
                thoughtProcess: '',
                feedbackReason: ''
            }));
            setOverallFormData({
                survey_type: selectedSurvey?.survey_type || 'none',
                sus: { q7: 3, q8: 3, q9: 3, q10: 3, q11: 3, q12: 3, q13: 3, q14: 3, q15: 3, q16: 3 },
                futureUse: 3,
                feedbackStyle: '',
                feedbackStyleReason: '',
                otherComments: ''
            });
        }
    }, [isSurveyMode, contextPhase, phase]);

    const loadTask = (index: number) => {
        const task = TASKS[index];
        setFiles([
            { name: 'task.md', content: task.md, language: 'markdown' },
            { name: 'main.py', content: task.main, language: 'python' }
        ]);
        setActiveFile('main.py');
    };

    const loadNavigationFiles = () => {
        setFiles(NAVIGATION_FILES);
        setActiveFile('navigate.py');
    };

    const loadExplorationFiles = () => {
        setFiles(EXPLORATION_FILES);
        setActiveFile('welcome.py');
    };

    const handleStartSurvey = async (config: SurveyConfig) => {
        setSelectedSurvey(config);
        // Generate participant ID when survey is selected
        const generatedId = generateParticipantId();
        setPreFormData(prev => ({ ...prev, participantId: generatedId }));
        await apiClient.startSurvey(config.survey_type);
        setPhase('intro');
    };

    const handleSubmitPreSurvey = async () => {
        if (!preFormData.fieldOfStudy.trim() || preFormData.usedAiBefore === null) {
            toast.error('Please complete all required fields');
            return;
        }

        try {
            await apiClient.submitPreSurvey({
                participant_id: preFormData.participantId,
                field_of_study: preFormData.fieldOfStudy,
                confidence_level: preFormData.pythonConfidence,
                use_of_AI: preFormData.usedAiBefore,
                which_AI: preFormData.usedAiBefore ? preFormData.aiToolsUsed || undefined : undefined,
            });

            // Start survey with context and begin first task
            startSurvey(selectedSurvey!, preFormData.participantId);
            setCurrentTask(0);
            loadTask(0);
            setTimeElapsed(0);
            setIsTimerActive(true);
            setPhase('task');
        } catch (error: any) {
            if (error?.surveyMode) {
                setAuthExpired(true);
                toast.error('Authentication expired. Please log in again to continue the survey.', {
                    duration: 6000
                });
            } else {
                toast.error('Failed to submit survey');
            }
            console.error(error);
        }
    };

    const canCompleteTask = () => {
        return TASKS[currentTask].verify(lastOutput) || isTimeUp();
    };

    const handleCompleteTask = async () => {
        const success = TASKS[currentTask].verify(lastOutput);

        try {
            await apiClient.saveTaskResult({
                participant_id: preFormData.participantId,
                survey_type: selectedSurvey?.survey_type || 'none',
                task_index: currentTask + 1,
                time_taken: timeElapsed,
                finished_within_time: success,
                code_files: files,
                run_output: lastOutput
            });

            setIsTimerActive(false);
            setPhase('post');
        } catch (error: any) {
            if (error?.surveyMode) {
                setAuthExpired(true);
                toast.error('Authentication expired. Survey progress saved locally. Please log in to continue.', {
                    duration: 6000
                });
            } else {
                toast.error('Failed to save task result');
            }
            console.error(error);
        }
    };

    const handleSubmitPostTask = async () => {
        if (postFormData.fixedWithinTime === null || postFormData.difficulty === null ||
            postFormData.helpfulUnderstand === null || postFormData.helpfulFix === null ||
            !postFormData.thoughtProcess.trim() || !postFormData.feedbackReason.trim()) {
            toast.error('Please complete all post-task questions');
            return;
        }

        // Validate survey_type before submission
        const surveyType = postFormData.survey_type || selectedSurvey?.survey_type || 'none';
        if (!surveyType || surveyType === 'none') {
            toast.error('Survey type is missing. Please try again.');
            return;
        }


        try {
            await apiClient.submitPostTaskSurvey({
                participant_id: preFormData.participantId,
                survey_type: surveyType,
                task_index: currentTask + 1,
                finished_within_time: postFormData.fixedWithinTime,
                difficult_to_fix: postFormData.difficulty,
                helpful_understand: postFormData.helpfulUnderstand,
                helpful_fix: postFormData.helpfulFix,
                thought_process: postFormData.thoughtProcess,
                feedback: postFormData.feedbackReason,
            });


            // Reset post-task form (preserve survey_type)
            setPostFormData(prev => ({
                fixedWithinTime: null,
                difficulty: null,
                helpfulUnderstand: null,
                helpfulFix: null,
                thoughtProcess: '',
                feedbackReason: '',
                survey_type: prev.survey_type // Preserve existing survey_type
            }));

            if (currentTask < 3) {
                const nextTaskIndex = currentTask + 1;
                setCurrentTask(nextTaskIndex);
                loadTask(nextTaskIndex);
                setTimeElapsed(0);
                setIsTimerActive(true);
                setPhase('task');
            } else {
                // Navigation phase
                loadNavigationFiles();
                setTimeElapsed(0);
                setIsTimerActive(true);
                setPhase('navigate');
                router.push('/');
            }
        } catch (error: any) {
            console.error('Error submitting post-task survey:', error);
            console.error('Error details:', {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
            });

            if (error?.surveyMode) {
                setAuthExpired(true);
                toast.error('Authentication expired. Survey progress saved locally. Please log in to continue.', {
                    duration: 6000
                });
            } else {
                const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to submit post-task survey';
                toast.error(errorMsg);
            }
        }
    };

    const handleSubmitOverall = async () => {
        if (!overallFormData.feedbackStyle || !overallFormData.feedbackStyleReason.trim()) {
            toast.error('Please complete the overall questionnaire');
            return;
        }

        try {
            await apiClient.submitOverallSurvey({
                participant_id: preFormData.participantId,
                survey_type: selectedSurvey?.survey_type || 'none',
                sus: overallFormData.sus,
                future_use_likelihood: overallFormData.futureUse,
                preferred_feedback_style: overallFormData.feedbackStyle,
                preferred_feedback_reason: overallFormData.feedbackStyleReason,
                other_comments: overallFormData.otherComments || undefined,
            });

            setPhase('complete');
        } catch (error: any) {
            if (error?.surveyMode) {
                setAuthExpired(true);
                toast.error('Authentication expired. Survey data saved locally. Please log in to complete submission.', {
                    duration: 6000
                });
            } else {
                toast.error('Failed to submit overall survey');
            }
            console.error(error);
        }
    };

    const handleQuitSurvey = () => {
        endSurvey();
        router.push('/');
    };

    const handleReauth = () => {
        // Save current survey state before redirecting
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`;
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Please log in to access the survey</h1>
                    <button onClick={() => router.push('/')} className="text-blue-600 hover:text-blue-800">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 relative">
            {authExpired && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 relative z-50">
                    <div className="flex items-center justify-between">
                        <div className="flex">
                            <div>
                                <h3 className="text-sm font-medium">Authentication Expired</h3>
                                <p className="text-sm">Your session has expired. Survey progress is saved locally. Please log in to continue.</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setAuthExpired(false)}
                                className="text-red-700 hover:text-red-900 text-sm underline"
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={handleReauth}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                                Log In Again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {phase === 'select' && (
                <SurveySelection onSelectSurvey={handleStartSurvey} onQuit={handleQuitSurvey} />
            )}

            {phase === 'intro' && selectedSurvey && (
                <SurveyIntro
                    selectedSurvey={selectedSurvey}
                    onBack={() => setPhase('select')}
                    onContinue={() => setPhase('pre')}
                />
            )}

            {phase === 'pre' && (
                <PreTaskSurvey
                    formData={preFormData}
                    onFormChange={(data) => setPreFormData(prev => ({ ...prev, ...data }))}
                    onBack={() => setPhase('intro')}
                    onSubmit={handleSubmitPreSurvey}
                />
            )}

            {phase === 'post' && (
                <PostTaskSurvey
                    currentTask={currentTask}
                    formData={postFormData}
                    onFormChange={(data) => setPostFormData(prev => ({ ...prev, ...data }))}
                    onSubmit={handleSubmitPostTask}
                />
            )}

            {phase === 'overall' && (
                <OverallSurvey
                    formData={overallFormData}
                    onFormChange={(data) => setOverallFormData(prev => ({ ...prev, ...data }))}
                    onSubmit={handleSubmitOverall}
                />
            )}

            {phase === 'complete' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
                        <p className="text-gray-700 mb-6">
                            You have completed the survey. Thank you for your participation in this research study.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => {
                                    endSurvey();
                                    setPhase('select');
                                }}
                                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Start New Survey
                            </button>
                            <button
                                onClick={handleQuitSurvey}
                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Interface (blurred during overlays) */}
            <div className={`min-h-screen ${['select', 'intro', 'pre', 'post', 'overall', 'complete'].includes(phase) ? 'blur-sm pointer-events-none' : ''}`}>
                {/* Top Bar */}
                {(phase === 'task' || phase === 'navigate') && selectedSurvey && (
                    <SurveyTopBar
                        selectedSurvey={selectedSurvey}
                        phase={phase}
                        currentTask={currentTask}
                        timeElapsed={timeElapsed}
                        isTimerActive={isTimerActive}
                        formatTime={formatTime}
                        getTimerColor={getTimerColor}
                        getMaxTimeDisplay={getMaxTimeDisplay}
                        isTimeUp={isTimeUp}
                        canCompleteTask={phase === 'task' ? canCompleteTask : undefined}
                        onCompleteTask={phase === 'task' ? handleCompleteTask : undefined}
                        onQuitSurvey={handleQuitSurvey}
                        enableNavigation={phase === 'navigate'}
                    />
                )}

                {/* Editor Interface */}
                {(phase === 'task' || phase === 'navigate') && selectedSurvey && (
                    <SurveyEditor
                        files={files}
                        activeFile={activeFile}
                        selectedSurvey={selectedSurvey}
                        onFilesChange={setFiles}
                        onActiveFileChange={setActiveFile}
                        onOutput={setLastOutput}
                    />
                )}

                {/* Phase Messages */}
                <PhaseMessages
                    phase={phase}
                    timeElapsed={timeElapsed}
                    formatTime={formatTime}
                />
            </div>
        </div>
    );
}
