import { PreSurveyFormData } from '@/lib/survey/types';

interface PreTaskSurveyProps {
    formData: PreSurveyFormData;
    onFormChange: (data: Partial<PreSurveyFormData>) => void;
    onBack: () => void;
    onSubmit: () => void;
}

export default function PreTaskSurvey({ formData, onFormChange, onBack, onSubmit }: PreTaskSurveyProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Pre-Experiment Questionnaire</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Participant ID *
                        </label>
                        <input
                            type="text"
                            value={formData.participantId}
                            onChange={(e) => onFormChange({ participantId: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Primary field of study *
                        </label>
                        <input
                            type="text"
                            value={formData.fieldOfStudy}
                            onChange={(e) => onFormChange({ fieldOfStudy: e.target.value })}
                            placeholder="e.g., Computer Science, Engineering, Biology"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Python programming confidence (1 = Not confident at all, 5 = Very confident)
                        </label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={formData.pythonConfidence}
                                onChange={(e) => onFormChange({ pythonConfidence: Number(e.target.value) })}
                                className="flex-1"
                            />
                            <span className="text-sm font-medium text-gray-700 w-8">{formData.pythonConfidence}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Have you used AI-powered coding assistants before? *
                        </label>
                        <div className="flex space-x-4">
                            <label className="flex items-center text-gray-900">
                                <input
                                    type="radio"
                                    checked={formData.usedAiBefore === true}
                                    onChange={() => onFormChange({ usedAiBefore: true })}
                                    className="mr-2"
                                />
                                Yes
                            </label>
                            <label className="flex items-center text-gray-900">
                                <input
                                    type="radio"
                                    checked={formData.usedAiBefore === false}
                                    onChange={() => onFormChange({ usedAiBefore: false })}
                                    className="mr-2"
                                />
                                No
                            </label>
                        </div>
                    </div>

                    {formData.usedAiBefore && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Which tools have you used and how often? (Optional)
                            </label>
                            <textarea
                                value={formData.aiToolsUsed}
                                onChange={(e) => onFormChange({ aiToolsUsed: e.target.value })}
                                placeholder="e.g., GitHub Copilot (daily), ChatGPT (weekly)"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-8">
                    <button onClick={onBack} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                        Back
                    </button>
                    <button onClick={onSubmit} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Start Tasks
                    </button>
                </div>
            </div>
        </div>
    );
}
