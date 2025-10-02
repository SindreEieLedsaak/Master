import { X } from 'lucide-react';
import { SurveyConfig } from '@/lib/survey/types';
import { SURVEY_CONFIGS } from '@/lib/survey/constants';

interface SurveySelectionProps {
    onSelectSurvey: (config: SurveyConfig) => void;
    onQuit: () => void;
}

export default function SurveySelection({ onSelectSurvey, onQuit }: SurveySelectionProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Choose Survey Type</h1>
                    <button onClick={onQuit} className="text-gray-500 hover:text-gray-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <p className="text-gray-600 mb-8">
                    Please select one of the three survey types. Each uses a different level of AI assistance.
                </p>

                <div className="grid gap-6 md:grid-cols-3">
                    {SURVEY_CONFIGS.map((config) => (
                        <div key={config.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">{config.name}</h3>
                            <p className="text-gray-600 mb-4 text-sm">{config.description}</p>
                            <button
                                onClick={() => onSelectSurvey(config)}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                            >
                                Select This Survey
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
