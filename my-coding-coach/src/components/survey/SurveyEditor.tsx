import { useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import MultiFileEditor, { MultiFileEditorRef } from '@/components/MultiFileEditor';
import MultiFilePyodideRunner from '@/components/MultiFilePyodideRunner';
import AssistantChat from '@/components/AssistantChat';
import FileExplorer from '@/components/FileExplorer';
import { File, SurveyConfig } from '@/lib/survey/types';

interface SurveyEditorProps {
    files: File[];
    activeFile: string;
    selectedSurvey: SurveyConfig;
    onFilesChange: (files: File[]) => void;
    onActiveFileChange: (file: string) => void;
    onOutput: (output: string) => void;
}

export default function SurveyEditor({
    files,
    activeFile,
    selectedSurvey,
    onFilesChange,
    onActiveFileChange,
    onOutput
}: SurveyEditorProps) {
    const editorRef = useRef<MultiFileEditorRef>(null);

    return (
        <div className="h-[calc(100vh-73px)] bg-gray-50">
            <div className="h-full overflow-hidden">
                <PanelGroup direction="horizontal" className="h-full">
                    {/* Left: File Explorer */}
                    <Panel defaultSize={15} minSize={12} className="min-w-[180px]">
                        <div className="h-full p-2">
                            <FileExplorer
                                files={files}
                                activeFile={activeFile}
                                onFilesChange={onFilesChange}
                                onActiveFileChange={onActiveFileChange}
                            />
                        </div>
                    </Panel>
                    <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors cursor-col-resize" />

                    {/* Center: Editor over Terminal */}
                    <Panel defaultSize={selectedSurvey.aiEnabled ? 55 : 70} minSize={30}>
                        <PanelGroup direction="vertical">
                            {/* Editor */}
                            <Panel defaultSize={60} minSize={25}>
                                <div className="h-full p-2">
                                    <MultiFileEditor
                                        ref={editorRef}
                                        files={files}
                                        activeFile={activeFile}
                                        onFilesChange={onFilesChange}
                                        onActiveFileChange={onActiveFileChange}
                                        showHeader={false}
                                        showFooter={false}
                                        className="h-full"
                                    />
                                </div>
                            </Panel>
                            <PanelResizeHandle className="h-1 bg-gray-200 hover:bg-gray-300 transition-colors cursor-row-resize" />

                            {/* Bottom: Terminal */}
                            <Panel defaultSize={40} minSize={20}>
                                <div className="h-full p-2">
                                    <MultiFilePyodideRunner
                                        files={files}
                                        activeFile={activeFile}
                                        onOutput={onOutput}
                                        className="h-full"
                                    />
                                </div>
                            </Panel>
                        </PanelGroup>
                    </Panel>

                    {/* Right: AI Assistant (if enabled) */}
                    {selectedSurvey.aiEnabled && (
                        <>
                            <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors cursor-col-resize" />
                            <Panel defaultSize={30} minSize={15}>
                                <div className="h-full p-2">
                                    <AssistantChat
                                        systemPrompt={selectedSurvey.systemPrompt}
                                        files={files}
                                        activeFile={activeFile}
                                        standalone={true}
                                        className="h-full"
                                    />
                                </div>
                            </Panel>
                        </>
                    )}
                </PanelGroup>
            </div>
        </div>
    );
}
