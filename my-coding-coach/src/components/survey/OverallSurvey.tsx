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
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Spørreskjema om samlet opplevelse</h2>

                <div className="space-y-8">
                    {/* SUS Questions */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">System Usability Scale</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            For hver påstand, vennligst angi ditt nivå av enighet (1 = Sterkt uenig, 5 = Sterkt enig).
                        </p>

                        <div className="space-y-4">
                            {([
                                { q: 'q7', text: 'Jeg tror at jeg vil bruke dette systemet ofte.' },
                                { q: 'q8', text: 'Jeg synes systemet var unødvendig komplekst.' },
                                { q: 'q9', text: 'Jeg synes systemet var enkelt å bruke.' },
                                { q: 'q10', text: 'Jeg tror at jeg vil trenge støtte fra en teknisk person for å kunne bruke dette systemet.' },
                                { q: 'q11', text: 'Jeg synes de forskjellige funksjonene i systemet var godt integrert.' },
                                { q: 'q12', text: 'Jeg synes det var for mye inkonsekvens i dette systemet.' },
                                { q: 'q13', text: 'Jeg vil anta at de fleste vil lære å bruke dette systemet veldig raskt.' },
                                { q: 'q14', text: 'Jeg synes systemet var veldig tungvint å bruke.' },
                                { q: 'q15', text: 'Jeg følte meg veldig trygg på å bruke systemet.' },
                                { q: 'q16', text: 'Jeg måtte lære mye før jeg kunne komme i gang med dette systemet.' }
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
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Avsluttende refleksjoner</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hvor sannsynlig vil du være å bruke et verktøy som gir tilbakemelding i denne stilen for dine egne programmeringsoppgaver i fremtiden? (1 = Veldig usannsynlig, 5 = Veldig sannsynlig)
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
                                    Tenk deg at du står fast på en feil i ditt eget prosjekt. På lang sikt, hvilken av disse tilbakemeldingsstilene tror du vil hjelpe deg å lære mest?
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { value: 'A', text: 'Bare standard Python-feilmelding.' },
                                        { value: 'B', text: 'En forklaring av feilen og den fullstendige, korrigerte koden.' },
                                        { value: 'C', text: 'En forklaring av feilen og hint som veileder meg til å fikse den selv.' },
                                        { value: 'D', text: "Jeg er ikke sikker." }
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
                                    Vennligst forklar ditt valg for spørsmålet ovenfor.
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
                                    Har du andre kommentarer om din opplevelse med programmeringsverktøyet i dag? Hva likte du best, og hva likte du minst?
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
                        Fullfør undersøkelse
                    </button>
                </div>
            </div>
        </div>
    );
}
