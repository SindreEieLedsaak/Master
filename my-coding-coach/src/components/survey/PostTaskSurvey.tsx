import { PostTaskFormData } from '@/lib/survey/types';
import { useContext } from 'react';
import { useSurvey } from '@/contexts/survey/SurveyContext';

interface PostTaskSurveyProps {
    currentTask: number;
    formData: PostTaskFormData;
    onFormChange: (data: Partial<PostTaskFormData>) => void;
    onSubmit: () => void;
}
const selectedSurvey_type = useSurvey().selectedSurvey?.survey_type;
export default function PostTaskSurvey({ currentTask, formData, onFormChange, onSubmit }: PostTaskSurveyProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Spørreskjema etter oppgave - Oppgave {currentTask + 1}
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Klarte du å fikse feilen innen tidsfristen?
                        </label>
                        <div className="flex space-x-4">
                            <label className="flex items-center text-gray-900">
                                <input
                                    type="radio"
                                    checked={formData.fixedWithinTime === true}
                                    onChange={() => onFormChange({ fixedWithinTime: true })}
                                    className="mr-2"
                                />
                                Ja
                            </label>
                            <label className="flex items-center text-gray-900">
                                <input
                                    type="radio"
                                    checked={formData.fixedWithinTime === false}
                                    onChange={() => onFormChange({ fixedWithinTime: false })}
                                    className="mr-2"
                                />
                                Nei
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hvor vanskelig syntes du denne oppgaven var? (1 = Veldig lett, 5 = Veldig vanskelig)
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
                            Hvor nyttig var systemet for å hjelpe deg forstå feilen? (1 = Ikke nyttig i det hele tatt, 5 = Veldig nyttig)
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
                            Hvor nyttig var systemet for å hjelpe deg fikse feilen? (1 = Ikke nyttig i det hele tatt, 5 = Veldig nyttig)
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
                            Vennligst beskriv kort din tankeprosess for å løse denne oppgaven. Hva var den mest utfordrende delen for deg?
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
                            Vennligst forklar hvorfor du fant systemets tilbakemelding nyttig eller ikke nyttig for denne spesifikke oppgaven.
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
                        {currentTask < 3 ? 'Neste oppgave' : 'Fortsett til utforskning'}
                    </button>
                </div>
            </div>
        </div>
    );
}
