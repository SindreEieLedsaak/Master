import { OverallSurveyFormData } from '@/lib/survey/types';

interface OverallSurveyProps {
    formData: OverallSurveyFormData;
    onFormChange: (data: Partial<OverallSurveyFormData>) => void;
    onSubmit: () => void;
}

export default function OverallSurvey({ formData, onFormChange, onSubmit }: OverallSurveyProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Overall Experience Questionnaire</h2>

                <div className="space-y-8">
                    {/* SUS Questions */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">System Usability Scale</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            For each statement, please indicate your level of agreement (1 = Strongly Disagree, 5 = Strongly Agree).
                        </p>

                        <div className="space-y-4">
                            {([
                                { q: 'q7', text: 'I think that I would like to use this system frequently.' },
                                { q: 'q8', text: 'I found the system unnecessarily complex.' },
                                { q: 'q9', text: 'I thought the system was easy to use.' },
                                { q: 'q10', text: 'I think that I would need the support of a technical person to be able to use this system.' },
                                { q: 'q11', text: 'I found the various functions in this system were well integrated.' },
                                { q: 'q12', text: 'I thought there was too much inconsistency in this system.' },
                                { q: 'q13', text: 'I would imagine that most people would learn to use this system very quickly.' },
                                { q: 'q14', text: 'I found the system very cumbersome to use.' },
                                { q: 'q15', text: 'I felt very confident using the system.' },
                                { q: 'q16', text: 'I needed to learn a lot of things before I could get going with this system.' }
                            ] as const).map(({ q, text }) => (
                                <div key={q} className="border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-700 mb-3">{text}</p>
                                    <div className="flex space-x-4">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <label key={n} className="flex items-center text-gray-900">
                                                <input
                                                    type="radio"
                                                    checked={formData.sus[q] === n}
                                                    onChange={() => onFormChange({
                                                        sus: { ...formData.sus, [q]: n }
                                                    })}
                                                    className="mr-2"
                                                />
                                                {n}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Final Questions */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Final Reflections</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    How likely would you be to use a tool that provides feedback in this style for your own programming assignments in the future? (1 = Very unlikely, 5 = Very likely)
                                </label>
                                <div className="flex space-x-4">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <label key={n} className="flex items-center text-gray-900">
                                            <input
                                                type="radio"
                                                checked={formData.futureUse === n}
                                                onChange={() => onFormChange({ futureUse: n })}
                                                className="mr-2"
                                            />
                                            {n}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Imagine you are stuck on a bug in your own project. In the long run, which of these feedback styles do you believe would help you learn the most?
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { value: 'A', text: 'Just the standard Python error message.' },
                                        { value: 'B', text: 'An explanation of the error and the complete, corrected code.' },
                                        { value: 'C', text: 'An explanation of the error and hints that guide me to fix it myself.' },
                                        { value: 'D', text: "I'm not sure." }
                                    ].map(({ value, text }) => (
                                        <label key={value} className="flex items-center text-gray-900">
                                            <input
                                                type="radio"
                                                checked={formData.feedbackStyle === value}
                                                onChange={() => onFormChange({ feedbackStyle: value as any })}
                                                className="mr-2"
                                            />
                                            {value}. {text}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Please explain your choice for the question above.
                                </label>
                                <textarea
                                    value={formData.feedbackStyleReason}
                                    onChange={(e) => onFormChange({ feedbackStyleReason: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Do you have any other comments about your experience with the programming tool today? What did you like most, and what did you like least?
                                </label>
                                <textarea
                                    value={formData.otherComments}
                                    onChange={(e) => onFormChange({ otherComments: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-8">
                    <button onClick={onSubmit} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Complete Survey
                    </button>
                </div>
            </div>
        </div>
    );
}
