// page.tsx
"use client";
import { useState } from 'react';

type AnalysisResponse = {
  qualityScore: string;
  semanticErrors: string[];
  styleIssues: string[];
  improvementSuggestions: string[];
};

type ExecuteResponse = {
  output: string;
};

export default function Home() {
  const [code, setCode] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [executionOutput, setExecutionOutput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data: AnalysisResponse = await res.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error analyzing code:', error);
    }
    setLoading(false);
  };

  const handleExecute = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data: ExecuteResponse = await res.json();
      setExecutionOutput(data.output);
    } catch (error) {
      console.error('Error executing code:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Code Learning Tool</h1>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter your code here..."
        rows={12}
        style={{
          width: '100%',
          fontFamily: 'monospace',
          fontSize: '14px',
          padding: '1rem',
        }}
      ></textarea>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleAnalyze} disabled={loading}>
          Analyze Code
        </button>
        <button
          onClick={handleExecute}
          disabled={loading}
          style={{ marginLeft: '1rem' }}
        >
          Run Code
        </button>
      </div>
      {analysis && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Analysis Results</h2>
          <p>
            <strong>Quality Score:</strong> {analysis.qualityScore}
          </p>
          <div>
            <h3>Semantic Errors:</h3>
            {analysis.semanticErrors.length > 0 ? (
              <ul>
                {analysis.semanticErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            ) : (
              <p>None</p>
            )}
          </div>
          <div>
            <h3>Style Issues:</h3>
            {analysis.styleIssues.length > 0 ? (
              <ul>
                {analysis.styleIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            ) : (
              <p>None</p>
            )}
          </div>
          <div>
            <h3>Suggestions:</h3>
            {analysis.improvementSuggestions.length > 0 ? (
              <ul>
                {analysis.improvementSuggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            ) : (
              <p>None</p>
            )}
          </div>
        </div>
      )}
      {executionOutput && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Execution Output</h2>
          <pre
            style={{
              background: '#f4f4f4',
              padding: '1rem',
              whiteSpace: 'pre-wrap',
            }}
          >
            {executionOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
