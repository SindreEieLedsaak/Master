import { PostTaskFormData } from '@/lib/survey/types';

interface PostTaskSurveyProps {
    currentTask: number;
    formData: PostTaskFormData;
    onFormChange: (data: Partial<PostTaskFormData>) => void;
    onSubmit: () => void;
}

export default function PostTaskSurvey({ currentTask, formData, onFormChange, onSubmit }: PostTaskSurveyProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Post-Task Questionnaire - Task {currentTask + 1}
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Were you able to successfully fix the bug within the time limit?
                        </label>
                        <div className="flex space-x-4">
                            <label className="flex items-center text-gray-900">
                                <input
                                    type="radio"
                                    checked={formData.fixedWithinTime === true}
                                    onChange={() => onFormChange({ fixedWithinTime: true })}
                                    className="mr-2"
                                />
                                Yes
                            </label>
                            <label className="flex items-center text-gray-900">
                                <input
                                    type="radio"
                                    checked={formData.fixedWithinTime === false}
                                    onChange={() => onFormChange({ fixedWithinTime: false })}
                                    className="mr-2"
                                />
                                No
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            How difficult did you find this task? (1 = Very easy, 5 = Very difficult)
                        </label>
                        <div className="flex space-x-4">
                            {[1, 2, 3, 4, 5].map(n => (
                                <label key={n} className="flex items-center text-gray-900">
                                    <input
                                        type="radio"
                                        checked={formData.difficulty === n}
                                        onChange={() => onFormChange({ difficulty: n })}
                                        className="mr-2"
                                    />
                                    {n}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            How helpful was the system in helping you understand the error? (1 = Not helpful at all, 5 = Very helpful)
                        </label>
                        <div className="flex space-x-4">
                            {[1, 2, 3, 4, 5].map(n => (
                                <label key={n} className="flex items-center text-gray-900">
                                    <input
                                        type="radio"
                                        checked={formData.helpfulUnderstand === n}
                                        onChange={() => onFormChange({ helpfulUnderstand: n })}
                                        className="mr-2"
                                    />
                                    {n}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            How helpful was the system in helping you fix the error? (1 = Not helpful at all, 5 = Very helpful)
                        </label>
                        <div className="flex space-x-4">
                            {[1, 2, 3, 4, 5].map(n => (
                                <label key={n} className="flex items-center text-gray-900">
                                    <input
                                        type="radio"
                                        checked={formData.helpfulFix === n}
                                        onChange={() => onFormChange({ helpfulFix: n })}
                                        className="mr-2"
                                    />
                                    {n}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Please briefly describe your thought process for solving this task. What was the most challenging part for you?
                        </label>
                        <textarea
                            value={formData.thoughtProcess}
                            onChange={(e) => onFormChange({ thoughtProcess: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Please explain why you found the system's feedback helpful or unhelpful for this specific task.
                        </label>
                        <textarea
                            value={formData.feedbackReason}
                            onChange={(e) => onFormChange({ feedbackReason: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end mt-8">
                    <button onClick={onSubmit} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        {currentTask < 3 ? 'Next Task' : 'Continue to Exploration'}
                    </button>
                </div>
            </div>
        </div>
    );
}
