"use client";

import { useState } from "react";
import { Sparkles, Activity, TestTube2, Dna, Bot } from "lucide-react";

// --- Type Definitions ---
interface AgentResponse {
  analysis: { [key: string]: any; };
  summary: string;
}

interface AnalysisResult {
  agent_responses: {
    chemical_analyst: AgentResponse;
    pathway_analyst: AgentResponse;
    target_analyst: AgentResponse;
    similarity_analyst: AgentResponse;
  };
  final_verdict: { 
    [key: string]: any;
    risk_label?: string;
  };
  presenter_summary: {
    summary?: string;
    error?: string;
  };
}

// --- Helper Components ---

const AgentCard = ({ title, icon, data }: { title: string; icon: React.ReactNode; data: AgentResponse }) => {
  const summary = data?.summary || "Summary not available.";
  const analysis = data?.analysis;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 backdrop-blur-sm flex flex-col">
      <div className="flex items-center mb-3">
        {icon}
        <h3 className="ml-3 text-lg font-semibold text-fuchsia-400">{title}</h3>
      </div>
      <p className="text-sm text-gray-300 mb-3 flex-grow">{summary}</p>
      {analysis && (!analysis.error || Object.keys(analysis).length > 1) && (
        <details className="mt-auto">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-fuchsia-400 focus:outline-none">
            Show Raw JSON
          </summary>
          <pre className="mt-2 text-xs bg-gray-900/70 p-3 rounded-md overflow-x-auto">
            <code>{JSON.stringify(analysis, null, 2)}</code>
          </pre>
        </details>
      )}
      {analysis?.error && Object.keys(analysis).length === 1 && (
         <p className="text-xs text-red-400 mt-auto">Analysis failed: {analysis.error}</p>
      )}
    </div>
  );
};

const FinalVerdict = ({ verdict, summary }: { verdict: AnalysisResult['final_verdict']; summary: AnalysisResult['presenter_summary'] }) => {
  const riskScore = verdict?.risk_score;
  const riskLabel = verdict?.risk_label ?? 'Unknown';

  const getRiskColor = (label: string) => {
    const lowerLabel = label.toLowerCase();
    switch (lowerLabel) {
      case 'very high': return 'text-red-500';
      case 'high': return 'text-orange-400';
      case 'moderate': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      case 'none': return 'text-green-400';
      default: return 'text-gray-400';
    }
  }
  const riskColor = getRiskColor(riskLabel);
  const riskLabelSize = riskLabel.toLowerCase() === 'very high' ? 'text-2xl' : 'text-lg';
  
  const summaryText = summary?.summary || summary?.error || "Summary could not be generated.";

  return (
    <div className="bg-gradient-to-br from-fuchsia-900/40 to-gray-900/40 p-6 rounded-xl border border-fuchsia-700/50 shadow-2xl">
      <div className="flex items-center mb-4">
        <Bot size={28} className="text-fuchsia-300" />
        <h2 className="ml-3 text-2xl font-bold text-white">Final Verdict</h2>
      </div>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 flex flex-col items-center justify-center bg-gray-900/50 p-4 rounded-lg text-center">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Predicted Risk</h3>
          {typeof riskScore === 'number' && (
             <p className={`text-6xl font-bold ${riskColor}`}>{riskScore.toFixed(2)}</p>
          )}
          <p className={`mt-1 font-semibold ${riskColor} ${riskLabelSize}`}>{riskLabel}</p>
        </div>
        <div className="md:col-span-2 bg-gray-900/50 p-4 rounded-lg">
           <h3 className="text-lg font-semibold text-gray-200 mb-2">Executive Summary</h3>
           <p className="text-sm text-gray-300 whitespace-pre-wrap">{summaryText}</p>
        </div>
      </div>

       <div className="mt-4 bg-gray-900/50 p-4 rounded-lg">
           <h3 className="text-lg font-semibold text-gray-200 mb-3">Coordinator Agent's Raw JSON Analysis</h3>
            <pre className="text-xs bg-gray-900/70 p-3 rounded-md overflow-x-auto">
                <code>{JSON.stringify(verdict, null, 2)}</code>
            </pre>
       </div>
    </div>
  );
};


// --- Main Page Component ---

export default function HomePage() {
  const [drug1, setDrug1] = useState("warfarin");
  const [drug2, setDrug2] = useState("aspirin");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drug1_name: drug1, drug2_name: drug2 }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "An error occurred during prediction.");
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-fuchsia-900/20 to-gray-900 z-0"></div>
      <div className="absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-fuchsia-500/10 to-transparent blur-3xl"></div>

      <div className="z-10 w-full max-w-4xl">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Sparkles className="text-fuchsia-400" size={32} />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
              Dr. Strange
            </h1>
          </div>
          <p className="text-md text-gray-400">AI-Powered Drug-Drug Interaction Analysis</p>
        </header>

        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-800/50 border border-gray-700/50 rounded-lg backdrop-blur-sm shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={drug1}
              onChange={(e) => setDrug1(e.target.value)}
              placeholder="Enter first drug (e.g., warfarin)"
              className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition"
            />
            <input
              type="text"
              value={drug2}
              onChange={(e) => setDrug2(e.target.value)}
              placeholder="Enter second drug (e.g., aspirin)"
              className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !drug1 || !drug2}
            className="w-full mt-4 py-2.5 px-5 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md font-semibold text-white transition-all duration-300 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Analyzing...
              </>
            ) : "Predict Interaction"}
          </button>
        </form>

        {error && <div className="text-center p-4 mb-8 bg-red-900/50 border border-red-500 rounded-md">{error}</div>}

        {result && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-center text-gray-300">Agent Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AgentCard title="Chemical Analyst" icon={<TestTube2 className="text-cyan-400" />} data={result.agent_responses.chemical_analyst} />
                <AgentCard title="Pathway Analyst" icon={<Activity className="text-lime-400" />} data={result.agent_responses.pathway_analyst} />
                <AgentCard title="Target Analyst" icon={<Dna className="text-rose-400" />} data={result.agent_responses.target_analyst} />
                <AgentCard title="Similarity Analyst" icon={<Sparkles className="text-yellow-400" />} data={result.agent_responses.similarity_analyst} />
              </div>
            </div>
            <FinalVerdict verdict={result.final_verdict} summary={result.presenter_summary} />
          </div>
        )}
      </div>
    </main>
  );
} 