import { SurveyConfig } from '@/lib/survey/types';

interface SurveyIntroProps {
    selectedSurvey: SurveyConfig;
    onBack: () => void;
    onContinue: () => void;
}

export default function SurveyIntro({ selectedSurvey, onBack, onContinue }: SurveyIntroProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {selectedSurvey.name}
                </h1>
                <div className="space-y-4 text-gray-700">
                    <p>
                        Takk for at du deltar i min studie. Tilbakemeldingene dine er svært verdifulle for vår forskning
                        om hvordan vi kan bygge bedre læringsverktøy for programmerere.
                    </p>
                    <p>
                        Du vil bli bedt om å løse fire korte feilsøkingsoppgaver. Etter hver oppgave vil det være noen
                        korte spørsmål. Vennligst svar på alle spørsmål så ærlig som mulig.
                    </p>
                    <p className="font-semibold">
                        Det finnes ingen riktige eller gale svar. Vi tester verktøyet, ikke deg.
                    </p>
                    <p>
                        Hele økten bør ta omtrent 20 minutter.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                        <p className="text-blue-800 font-medium">Valgt undersøkelse: {selectedSurvey.name}</p>
                        <p className="text-blue-700 text-sm mt-1">{selectedSurvey.description}</p>
                    </div>
                </div>
                <div className="flex justify-between mt-8">
                    <button onClick={onBack} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                        Tilbake til valg
                    </button>
                    <button onClick={onContinue} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Fortsett
                    </button>
                </div>
            </div>
        </div>
    );
}
