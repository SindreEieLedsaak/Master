'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Phase, SurveyConfig } from '@/lib/survey/types';

interface SurveyContextType {
    isSurveyMode: boolean;
    currentPhase: Phase | null;
    enableNavigation: boolean;
    participantId: string | null;
    selectedSurvey: SurveyConfig | null;
    timeElapsed: number;
    startSurvey: (config: SurveyConfig, participantId: string) => void;
    endSurvey: () => void;
    setPhase: (phase: Phase) => void;
    setNavigationEnabled: (enabled: boolean) => void;
    setTimeElapsed: (time: number) => void;
    returnToSurvey: () => void;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export function SurveyProvider({ children }: { children: ReactNode }) {
    const [isSurveyMode, setIsSurveyMode] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<Phase | null>(null);
    const [enableNavigation, setEnableNavigation] = useState(false);
    const [participantId, setParticipantId] = useState<string | null>(null);
    const [selectedSurvey, setSelectedSurvey] = useState<SurveyConfig | null>(null);
    const [timeElapsed, setTimeElapsed] = useState(0);

    // Load state from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('survey-state');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                setIsSurveyMode(state.isSurveyMode || false);
                setCurrentPhase(state.currentPhase || null);
                setEnableNavigation(state.enableNavigation || false);
                setParticipantId(state.participantId || null);
                setSelectedSurvey(state.selectedSurvey || null);
                setTimeElapsed(state.timeElapsed || 0);
            } catch (error) {
                console.error('Failed to load survey state:', error);
            }
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        const state = {
            isSurveyMode,
            currentPhase,
            enableNavigation,
            participantId,
            selectedSurvey,
            timeElapsed
        };
        localStorage.setItem('survey-state', JSON.stringify(state));
    }, [isSurveyMode, currentPhase, enableNavigation, participantId, selectedSurvey, timeElapsed]);

    const startSurvey = (config: SurveyConfig, id: string) => {
        setSelectedSurvey(config);
        setParticipantId(id);
        setIsSurveyMode(true);
        setEnableNavigation(false);
        setTimeElapsed(0);
    };

    const endSurvey = () => {
        setIsSurveyMode(false);
        setCurrentPhase(null);
        setEnableNavigation(false);
        setParticipantId(null);
        setSelectedSurvey(null);
        setTimeElapsed(0);
        localStorage.removeItem('survey-state');
    };

    const setPhase = (phase: Phase) => {
        setCurrentPhase(phase);
        // Enable navigation when in navigate phase
        if (phase === 'navigate') {
            setEnableNavigation(true);
        }
    };

    const setNavigationEnabled = (enabled: boolean) => {
        setEnableNavigation(enabled);
    };

    const returnToSurvey = () => {
        // Navigate back to survey page - this will be handled by the component using this
        window.location.href = '/survey';
    };

    return (
        <SurveyContext.Provider value={{
            isSurveyMode,
            currentPhase,
            enableNavigation,
            participantId,
            selectedSurvey,
            timeElapsed,
            startSurvey,
            endSurvey,
            setPhase,
            setNavigationEnabled,
            setTimeElapsed,
            returnToSurvey
        }}>
            {children}
        </SurveyContext.Provider>
    );
}

export function useSurvey() {
    const context = useContext(SurveyContext);
    if (context === undefined) {
        throw new Error('useSurvey must be used within a SurveyProvider');
    }
    return context;
}
