'use client';

import { useState, useEffect, useRef } from 'react';
import { Terminal, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PyodideRunnerProps {
    code: string;
    onOutput?: (output: string) => void;
    onError?: (error: string) => void;
}

declare global {
    interface Window {
        loadPyodide: () => Promise<any>;
        pyodideInstance?: any;
    }
}

// Singleton for Pyodide loading
class PyodideLoader {
    private static instance: PyodideLoader;
    private loadingPromise: Promise<any> | null = null;
    private pyodideInstance: any = null;

    private constructor() { }

    static getInstance(): PyodideLoader {
        if (!PyodideLoader.instance) {
            PyodideLoader.instance = new PyodideLoader();
        }
        return PyodideLoader.instance;
    }

    async loadPyodide(): Promise<any> {
        // If already loaded, return the instance
        if (this.pyodideInstance) {
            return this.pyodideInstance;
        }

        // If currently loading, wait for the existing promise
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        // Start loading
        this.loadingPromise = this._loadPyodide();
        this.pyodideInstance = await this.loadingPromise;
        return this.pyodideInstance;
    }

    private async _loadPyodide(): Promise<any> {
        return new Promise((resolve, reject) => {
            // Check if Pyodide is already loaded
            if (window.pyodideInstance) {
                resolve(window.pyodideInstance);
                return;
            }

            // Check if the script is already in the document
            const existingScript = document.querySelector('script[src*="pyodide.js"]');
            if (existingScript) {
                // Wait for the script to load and initialize
                this.waitForPyodide(resolve, reject);
                return;
            }

            // Load Pyodide script using the latest version from the documentation
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.js';
            script.onload = () => {
                console.log('Pyodide script loaded');
                // Wait for Pyodide to initialize
                this.waitForPyodide(resolve, reject);
            };
            script.onerror = () => {
                reject(new Error('Failed to load Pyodide script'));
            };
            document.head.appendChild(script);
        });
    }

    private waitForPyodide(resolve: (value: any) => void, reject: (reason: any) => void) {
        let attempts = 0;
        const maxAttempts = 60; // 6 seconds with 100ms intervals

        const checkLoaded = () => {
            attempts++;

            if (window.loadPyodide) {
                console.log('Pyodide loadPyodide function found, initializing...');
                window.loadPyodide()
                    .then((pyodide) => {
                        console.log('Pyodide initialized successfully');
                        window.pyodideInstance = pyodide;
                        resolve(pyodide);
                    })
                    .catch((error) => {
                        console.error('Pyodide initialization failed:', error);
                        reject(new Error(`Pyodide initialization failed: ${error.message}`));
                    });
            } else if (attempts >= maxAttempts) {
                reject(new Error('Pyodide failed to initialize after 6 seconds. Please refresh the page and try again.'));
            } else {
                setTimeout(checkLoaded, 100);
            }
        };

        checkLoaded();
    }
}

export default function PyodideRunner({ code, onOutput, onError }: PyodideRunnerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState<string>('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [isInitialized, setIsInitialized] = useState(false);
    const outputRef = useRef<HTMLDivElement>(null);

    // Pre-initialize Pyodide when component mounts
    useEffect(() => {
        const initializePyodide = async () => {
            try {
                setOutput('Initializing Pyodide... (this may take 5-10 seconds on first load)');
                const pyodide = await PyodideLoader.getInstance().loadPyodide();

                // Test the initialization with a simple Python command
                const version = pyodide.runPython(`
                    import sys
                    sys.version
                `);

                setIsInitialized(true);
                setOutput(`Pyodide ready! Python version: ${version}\nYou can now run Python code.`);
                setStatus('idle');
            } catch (error: any) {
                setOutput(`Failed to initialize Pyodide: ${error.message}`);
                setStatus('error');
            }
        };

        initializePyodide();
    }, []);

    const runCode = async () => {
        if (!code.trim()) {
            setOutput('No code to run');
            return;
        }

        if (!isInitialized) {
            setOutput('Please wait for Pyodide to initialize...');
            return;
        }

        setIsLoading(true);
        setStatus('loading');
        setOutput('Running your code...');

        try {
            // Use the singleton loader
            const pyodide = await PyodideLoader.getInstance().loadPyodide();

            // Set up stdout/stderr capture using the proper Pyodide approach
            pyodide.runPython(`
                import sys
                from io import StringIO
                sys.stdout = StringIO()
                sys.stderr = StringIO()
            `);

            // Run the user's code
            const result = pyodide.runPython(code);

            // Get output
            const stdout = pyodide.runPython("sys.stdout.getvalue()");
            const stderr = pyodide.runPython("sys.stderr.getvalue()");

            if (stderr) {
                setOutput(`Error:\n${stderr}`);
                setStatus('error');
                onError?.(stderr);
            } else {
                // Combine stdout with any returned value
                let finalOutput = stdout || "";
                if (result !== undefined && result !== null) {
                    if (stdout) {
                        finalOutput += "\n" + result;
                    } else {
                        finalOutput = result.toString();
                    }
                }

                const displayOutput = finalOutput || "Code executed successfully (no output)";
                setOutput(displayOutput);
                setStatus('success');
                onOutput?.(displayOutput);
            }

        } catch (error: any) {
            const errorMessage = error.message || 'An error occurred while running the code';
            setOutput(`Error: ${errorMessage}`);
            setStatus('error');
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const clearOutput = () => {
        setOutput('');
        setStatus('idle');
    };

    const retryInitialization = async () => {
        setIsInitialized(false);
        setStatus('loading');
        setOutput('Retrying Pyodide initialization...');

        try {
            const pyodide = await PyodideLoader.getInstance().loadPyodide();
            const version = pyodide.runPython(`
                import sys
                sys.version
            `);
            setIsInitialized(true);
            setOutput(`Pyodide ready! Python version: ${version}\nYou can now run Python code.`);
            setStatus('idle');
        } catch (error: any) {
            setOutput(`Failed to initialize Pyodide: ${error.message}`);
            setStatus('error');
        }
    };

    return (
        <div className="border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between p-4 border-b bg-gray-100">
                <div className="flex items-center space-x-2">
                    <Terminal className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Code Output</h3>
                    {!isInitialized && (
                        <div className="flex items-center text-orange-600">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Initializing...</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {status === 'loading' && (
                        <div className="flex items-center text-blue-600">
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            <span className="text-sm">Running...</span>
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Success</span>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="flex items-center text-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Error</span>
                        </div>
                    )}
                    <button
                        onClick={runCode}
                        disabled={isLoading || !isInitialized}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        Run
                    </button>
                    {!isInitialized && (
                        <button
                            onClick={retryInitialization}
                            className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
                        >
                            Retry
                        </button>
                    )}
                    <button
                        onClick={clearOutput}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div
                    ref={outputRef}
                    className="bg-black text-green-400 font-mono text-sm p-4 rounded h-64 overflow-auto whitespace-pre-wrap"
                >
                    {output || 'Output will appear here...'}
                </div>
            </div>
        </div>
    );
} 