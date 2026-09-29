import React, { useState, useEffect } from 'react';
import {
  DifficultyLevel,
  ExperienceLevel,
  HindsightMemory,
  Interview,
  InterviewType,
  RoleType,
  SkillTimeline,
  InterviewStrategy,
} from './types/interview';
import { hindsightService } from './services/hindsightMemory';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { ConfigureInterview } from './components/interview/ConfigureInterview';
import { ActiveInterview } from './components/interview/ActiveInterview';
import { ReviewView } from './components/review/ReviewView';
import { RectifyView } from './components/rectify/RectifyView';
import { RerunView } from './components/rerun/RerunView';
import { MemoryInspectorView } from './components/memory/MemoryInspectorView';
import { HackathonDemoView } from './components/demo/HackathonDemoView';
import { HistoryView } from './components/history/HistoryView';
import { WeaknessesView } from './components/weaknesses/WeaknessesView';
import { ProgressView } from './components/progress/ProgressView';
import { KnowledgeGraphView } from './components/graph/KnowledgeGraphView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [memories, setMemories] = useState<HindsightMemory[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [timelines, setTimelines] = useState<SkillTimeline[]>([]);

  // Navigation sub-states
  const [activeInterviewConfig, setActiveInterviewConfig] = useState<{
    role: RoleType;
    experienceLevel: ExperienceLevel;
    type: InterviewType;
    difficulty: DifficultyLevel;
    topics: string[];
    questionCount: number;
    strategy: InterviewStrategy;
  } | null>(null);

  const [selectedReview, setSelectedReview] = useState<Interview | null>(null);
  const [activeRectifyTarget, setActiveRectifyTarget] = useState<{
    concept: string;
    topic: string;
  } | null>(null);
  const [activeRerunTarget, setActiveRerunTarget] = useState<{
    concept: string;
    topic: string;
  } | null>(null);

  // Sync state from Hindsight Memory Service
  const refreshData = () => {
    setMemories(hindsightService.getAllMemories());
    setInterviews(hindsightService.getInterviews());
    setTimelines(hindsightService.getSkillTimelines());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Handlers
  const handleResetSeed = () => {
    hindsightService.resetToDemoSeed();
    refreshData();
    setCurrentTab('dashboard');
    setSelectedReview(null);
  };

  const handleStartInterview = (config: {
    role: RoleType;
    experienceLevel: ExperienceLevel;
    type: InterviewType;
    difficulty: DifficultyLevel;
    topics: string[];
    questionCount: number;
    strategy: InterviewStrategy;
  }) => {
    setActiveInterviewConfig(config);
    setCurrentTab('active_interview');
  };

  const handleFinishInterview = (completed: Interview) => {
    hindsightService.addInterview(completed);

    // Save extracted memories into Hindsight service
    if (completed.questions) {
      completed.questions.forEach((q) => {
        if (q.detectedWeaknesses) {
          q.detectedWeaknesses.forEach((dw) => {
            hindsightService.saveMemory({
              id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              userId: 'candidate-a',
              topic: q.topic,
              subtopic: dw,
              type: 'technical_weakness',
              observation: `Candidate struggled with ${dw} during technical evaluation.`,
              evidence: q.feedback,
              confidence: 'High',
              severity: 'Medium',
              status: 'Weak',
              firstDetected: new Date().toISOString().split('T')[0],
              lastDetected: new Date().toISOString().split('T')[0],
              occurrences: 1,
              detectedInInterviews: [`Interview #${completed.interviewNumber}`],
              recommendedFutureBehavior: `Test ${dw} with scenario-based queries rather than definitions.`,
            });
          });
        }
      });
    }

    refreshData();
    setSelectedReview(completed);
  };

  const handleSelectInterviewReview = (interviewId: string) => {
    const match = interviews.find((i) => i.id === interviewId);
    if (match) {
      setSelectedReview(match);
    }
  };

  const handleFixWeakness = (concept: string, topic: string) => {
    setActiveRectifyTarget({ concept, topic });
    setSelectedReview(null);
    setCurrentTab('rectify');
  };

  const handleRerunConcept = (concept: string, topic: string) => {
    setActiveRerunTarget({ concept, topic });
    setSelectedReview(null);
    setCurrentTab('rerun');
  };

  const persistentWeaknessCount = memories.filter(
    (m) =>
      (m.type === 'technical_weakness' || m.type === 'conceptual_misunderstanding') &&
      m.status === 'Weak'
  ).length;

  const completedCount = interviews.filter((i) => i.status === 'completed').length;
  const hasCompletedInterview = completedCount >= 1;

  const handleResetToFresh = () => {
    hindsightService.clearAll();
    refreshData();
    setCurrentTab('dashboard');
    setSelectedReview(null);
  };

  const handleLoadDemoSeed = () => {
    hindsightService.resetToDemoSeed();
    refreshData();
    setCurrentTab('dashboard');
    setSelectedReview(null);
  };

  // If 0 interviews are completed, redirect any evaluation tabs back to dashboard
  useEffect(() => {
    if (
      !hasCompletedInterview &&
      [
        'graph',
        'weaknesses',
        'rectify',
        'rerun',
        'progress',
        'memory',
        'history',
      ].includes(currentTab)
    ) {
      setCurrentTab('dashboard');
    }
  }, [hasCompletedInterview, currentTab]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedReview(null);
          setCurrentTab(tab);
        }}
        memoryCount={memories.length}
        persistentWeaknessCount={persistentWeaknessCount}
        hasCompletedInterview={hasCompletedInterview}
        onResetSeed={handleResetSeed}
        onResetToFresh={handleResetToFresh}
        onLoadDemoSeed={handleLoadDemoSeed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onNavigate={(tab) => {
            setSelectedReview(null);
            setCurrentTab(tab);
          }}
          memoryCount={memories.length}
          persistentCount={persistentWeaknessCount}
          hasCompletedInterview={hasCompletedInterview}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {selectedReview ? (
            <ReviewView
              interview={selectedReview}
              onFixWeakness={handleFixWeakness}
              onRerunWeaknesses={handleRerunConcept}
              onBackToDashboard={() => {
                setSelectedReview(null);
                setCurrentTab('dashboard');
              }}
            />
          ) : currentTab === 'dashboard' ? (
            <DashboardView
              interviews={interviews}
              memories={memories}
              timelines={timelines}
              onNavigate={(tab) => setCurrentTab(tab)}
              onSelectInterviewReview={handleSelectInterviewReview}
              onFixWeakness={handleFixWeakness}
              onRerunConcept={handleRerunConcept}
              onLoadDemoSeed={handleLoadDemoSeed}
            />
          ) : currentTab === 'graph' ? (
            <KnowledgeGraphView
              memories={memories}
              onFixWeakness={handleFixWeakness}
              onRerunConcept={handleRerunConcept}
              onStartNewInterview={() => setCurrentTab('configure')}
              onBackToDashboard={() => setCurrentTab('dashboard')}
            />
          ) : currentTab === 'configure' ? (
            <ConfigureInterview
              memories={memories}
              onStartInterview={handleStartInterview}
            />
          ) : currentTab === 'active_interview' && activeInterviewConfig ? (
            <ActiveInterview
              interviewConfig={activeInterviewConfig}
              memories={memories}
              onFinishInterview={handleFinishInterview}
              onCancel={() => setCurrentTab('dashboard')}
            />
          ) : currentTab === 'history' ? (
            <HistoryView
              interviews={interviews}
              onSelectReview={handleSelectInterviewReview}
              onStartNew={() => setCurrentTab('configure')}
            />
          ) : currentTab === 'weaknesses' ? (
            <WeaknessesView
              memories={memories}
              onFixWeakness={handleFixWeakness}
              onRerunConcept={handleRerunConcept}
            />
          ) : currentTab === 'progress' ? (
            <ProgressView
              timelines={timelines}
              onFixWeakness={handleFixWeakness}
              onRerunConcept={handleRerunConcept}
              onStartNewInterview={() => setCurrentTab('configure')}
            />
          ) : currentTab === 'memory' ? (
            <MemoryInspectorView
              memories={memories}
              onResetSeed={handleResetSeed}
              onFixWeakness={handleFixWeakness}
            />
          ) : currentTab === 'rectify' ? (
            <RectifyView
              weaknessConcept={activeRectifyTarget?.concept}
              topic={activeRectifyTarget?.topic}
              onCompleted={() => {
                refreshData();
                setCurrentTab('dashboard');
              }}
              onCancel={() => setCurrentTab('dashboard')}
            />
          ) : currentTab === 'rerun' ? (
            <RerunView
              weaknessConcept={activeRerunTarget?.concept}
              topic={activeRerunTarget?.topic}
              onCompleted={() => {
                refreshData();
                setCurrentTab('dashboard');
              }}
              onCancel={() => setCurrentTab('dashboard')}
            />
          ) : currentTab === 'demo' ? (
            <HackathonDemoView
              onDemoCompleted={() => {
                refreshData();
                setCurrentTab('dashboard');
              }}
              onGoToInspector={() => {
                refreshData();
                setCurrentTab('memory');
              }}
            />
          ) : (
            <DashboardView
              interviews={interviews}
              memories={memories}
              timelines={timelines}
              onNavigate={(tab) => setCurrentTab(tab)}
              onSelectInterviewReview={handleSelectInterviewReview}
              onFixWeakness={handleFixWeakness}
              onRerunConcept={handleRerunConcept}
            />
          )}
        </main>
      </div>
    </div>
  );
}
