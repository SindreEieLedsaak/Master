import { Phase } from '@/lib/survey/types';

interface PhaseMessagesProps {
    phase: Phase;
    timeElapsed: number;
    formatTime: (seconds: number) => string;
}

export default function PhaseMessages({ phase, timeElapsed, formatTime }: PhaseMessagesProps) {
    if (phase === 'explore') {
        return (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-300 rounded-lg p-3 z-10 shadow-lg">
                <div className="text-center">
                    <h3 className="font-medium text-blue-900">✅ Alle oppgaver fullført - Utforskningsfase</h3>
                    <p className="text-sm text-blue-700 mt-1">
                        Utforsk verktøyet og prøv ulike funksjoner de neste 8 minuttene.
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                        Fri navigasjon vil starte automatisk om {formatTime(480 - timeElapsed)}.
                    </p>
                </div>
            </div>
        );
    }

    if (phase === 'navigate') {
        return (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-300 rounded-lg p-3 z-10 shadow-lg">
                <div className="text-center">
                    <p className="text-sm text-green-700">
                        Du kan nå navigere til hvilken som helst side i applikasjonen! Test alle funksjonene.
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                        Det endelige spørreskjemaet vil dukke opp automatisk om {formatTime(600 - timeElapsed)}.
                    </p>
                </div>
            </div>
        );
    }

    return null;
}
