'use client';

import { useUser } from '@/contexts/user/UserContext';
import { apiClient } from '@/lib/api';
import { Code, Lightbulb, BookOpen, TrendingUp, Bot, GitMerge, Loader2, BarChart3, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import TopRightLoader from '@/components/TopRightLoader';

// Component for the logged-in user's dashboard
const Dashboard = () => {
  const { user } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSyncProjects = async () => {
    if (!user) {
      toast.error('You must be logged in to sync projects.');
      return;
    }

    setIsSyncing(true);
    toast.loading('Syncing your GitLab projects...');

    try {
      const response = await apiClient.syncGitlabProjects(user.gitlab_username);
      toast.dismiss();
      toast.success(`Successfully synced ${response.project_count} projects!`);
    } catch (error) {
      console.error('Failed to sync projects:', error);
      toast.dismiss();
      toast.error('Failed to sync projects. Please check your token or try again later.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!user) {
      toast.error('You must be logged in to analyze projects.');
      return;
    }

    setIsAnalyzing(true);
    toast.loading('Analyzing your projects...');
    try {
      await apiClient.analyzeStudentProjects(user.id);
      toast.dismiss();
      toast.success('Analysis completed!');
    } catch (error) {
      console.error('Failed to analyze projects:', error);
      toast.dismiss();
      toast.error('Failed to analyze projects.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!user) {
      toast.error('You must be logged in to generate suggestions.');
      return;
    }

    setIsGenerating(true);
    toast.loading('Generating suggestions from your latest analysis...');
    try {
      await apiClient.createAISuggestions(user.id);
      toast.dismiss();
      toast.success('Suggestions generated!');
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      toast.dismiss();
      toast.error('Failed to generate suggestions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isBusy = isSyncing || isAnalyzing || isGenerating;
  const busyText = isSyncing
    ? 'Syncing your GitLab projects...'
    : isAnalyzing
      ? 'Analyzing your projects...'
      : 'Generating suggestions...';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <TopRightLoader visible={isBusy} text={busyText} />

      <div className="mb-8 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user?.gitlab_username}!
        </h1>
        <p className="text-gray-600">
          Ready to improve your coding skills? Let's get started.
        </p>
      </div>

      {/* Get Started Guide */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Get Started Guide</h2>
        <ol className="space-y-4">
          <li className="border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">1</div>
              <div>
                <p className="font-semibold text-gray-900">Sync your GitLab projects</p>
                <p className="text-sm text-gray-600">Fetch your latest repositories and files.</p>
              </div>
            </div>
            <button
              onClick={handleSyncProjects}
              disabled={isSyncing}
              className="w-44 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSyncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <GitMerge className="h-4 w-4 mr-2" />}
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </li>

          <li className="border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">2</div>
              <div>
                <p className="font-semibold text-gray-900">Analyze your code</p>
                <p className="text-sm text-gray-600">Run AI analysis on your synced projects.</p>
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-44 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BarChart3 className="h-4 w-4 mr-2" />}
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </li>

          <li className="border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold">3</div>
              <div>
                <p className="font-semibold text-gray-900">Generate task suggestions</p>
                <p className="text-sm text-gray-600">Create personalized learning tasks from your analysis.</p>
              </div>
            </div>
            <button
              onClick={handleGenerateSuggestions}
              disabled={isGenerating}
              className="w-44 flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </li>
        </ol>
      </div>

      {/* Removed old duplicate sync section */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/editor" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <Code className="h-8 w-8 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Code Editor</h3>
          <p className="text-gray-600 text-sm">Write, run, and get feedback on your code</p>
        </Link>
        <Link href="/suggestions" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <Lightbulb className="h-8 w-8 text-yellow-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Task Suggestions</h3>
          <p className="text-gray-600 text-sm">Get personalized project recommendations</p>
        </Link>
        <Link href="/projects" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <GitMerge className="h-8 w-8 text-purple-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Projects</h3>
          <p className="text-gray-600 text-sm">View your projects</p>
        </Link>
        <Link href="/resources" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <BookOpen className="h-8 w-8 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Resources</h3>
          <p className="text-gray-600 text-sm">Learning materials and documentation</p>
        </Link>

      </div>
    </div>
  );
};

// Component for the pre-login landing page
const LandingPage = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Unlock Your Coding Potential
          </h1>
          <p className="mt-4 text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            Your personal AI-powered coding assistant. Get instant feedback, intelligent suggestions, and a clear path to becoming a better developer.
          </p>
          <button
            onClick={() => apiClient.login()}
            className="mt-8 bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-md"
          >
            Get Started with GitLab
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why Coding Coach?</h2>
            <p className="mt-2 text-lg text-gray-600">
              Go beyond simple error checking. Understand the 'why' behind your code.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mx-auto">
                <Bot />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">AI-Powered Analysis</h3>
              <p className="mt-2 text-base text-gray-600">
                Receive in-depth feedback on code quality, style, and potential bugs from our advanced AI.
              </p>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600 mx-auto">
                <Lightbulb />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">Personalized Tasks</h3>
              <p className="mt-2 text-base text-gray-600">
                Get smart suggestions for new projects and tasks tailored to your skill level and areas for improvement.
              </p>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600 mx-auto">
                <TrendingUp />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">Track Your Growth</h3>
              <p className="mt-2 text-base text-gray-600">
                Monitor your progress over time and see your programming skills evolve with clear metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Simple Steps to Success</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white mx-auto font-bold text-xl">1</div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">Write & Submit Code</h3>
              <p className="mt-2 text-base text-gray-600">Use our integrated editor to write and run your Python code.</p>
            </div>
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white mx-auto font-bold text-xl">2</div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">Get Instant Analysis</h3>
              <p className="mt-2 text-base text-gray-600">Our AI analyzes your submission and provides actionable feedback.</p>
            </div>
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white mx-auto font-bold text-xl">3</div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">Improve & Repeat</h3>
              <p className="mt-2 text-base text-gray-600">Apply the feedback, tackle new suggested tasks, and watch your skills grow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <p className="text-center text-base text-gray-500">&copy; {new Date().getFullYear()} Coding Coach. All rights reserved.</p>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-500">
              A Master Thesis Project
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function HomePage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? <Dashboard /> : <LandingPage />}
    </div>
  );
}
