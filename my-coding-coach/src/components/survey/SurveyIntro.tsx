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
                        Thank you for participating in our study. Your feedback is incredibly valuable for our research
                        into how to build better learning tools for programmers.
                    </p>
                    <p>
                        You will be asked to solve four short debugging tasks. After each task, there will be a few
                        short questions. Please answer all questions as honestly as possible.
                    </p>
                    <p className="font-semibold">
                        There are no right or wrong answers. We are testing the tool, not you.
                    </p>
                    <p>
                        The entire session should take approximately 45 minutes.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                        <p className="text-blue-800 font-medium">Selected Survey: {selectedSurvey.name}</p>
                        <p className="text-blue-700 text-sm mt-1">{selectedSurvey.description}</p>
                    </div>
                </div>
                <div className="flex justify-between mt-8">
                    <button onClick={onBack} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                        Back to Selection
                    </button>
                    <button onClick={onContinue} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}
