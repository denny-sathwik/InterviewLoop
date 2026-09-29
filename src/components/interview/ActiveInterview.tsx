import React, { useState, useEffect, useRef } from 'react';
import {
  DifficultyLevel,
  ExperienceLevel,
  HindsightMemory,
  Interview,
  InterviewType,
  QuestionResult,
  RoleType,
  InterviewStrategy,
} from '../../types/interview';
import {
  fetchNextQuestion,
  evaluateAnswer,
  reviewAndExtractMemory,
} from '../../services/api';
import {
  Brain,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Code2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface ActiveInterviewProps {
  interviewConfig: {
    role: RoleType;
    experienceLevel: ExperienceLevel;
    type: InterviewType;
    difficulty: DifficultyLevel;
    topics: string[];
    questionCount: number;
    strategy: InterviewStrategy;
  };
  memories: HindsightMemory[];
  onFinishInterview: (completedInterview: Interview) => void;
  onCancel: () => void;
}

export const ActiveInterview: React.FC<ActiveInterviewProps> = ({
  interviewConfig,
  memories,
  onFinishInterview,
  onCancel,
}) => {
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(
    interviewConfig.difficulty
  );
  const [currentRationale, setCurrentRationale] = useState('');
  const [targetedWeakness, setTargetedWeakness] = useState<string | undefined>();
  const [targetedMemoryId, setTargetedMemoryId] = useState<string | undefined>();

  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);

  // Probing state (interviewer follow-up on weak/ambiguous answer)
  const [isProbing, setIsProbing] = useState(false);
  const [probeQuestion, setProbeQuestion] = useState('');
  const [probeAnswer, setProbeAnswer] = useState('');

  // Voice Speech Synthesis & Dictation
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Completed questions accumulator
  const [completedQuestions, setCompletedQuestions] = useState<QuestionResult[]>([]);

  // Speech Synthesis helper
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Web Speech Recognition for voice dictation
  const toggleListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your answer.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (isProbing) {
            setProbeAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
          } else {
            setCandidateAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      }
    }
  };

  // Fetch Next Question
  const loadQuestion = async (qNum: number, lastEvaluation?: any) => {
    setIsLoadingQuestion(true);
    setIsProbing(false);
    setProbeQuestion('');
    setProbeAnswer('');
    setCandidateAnswer('');

    try {
      const exchanges = completedQuestions.map((cq) => ({
        question: cq.question,
        answer: cq.answer,
        score: cq.score,
      }));

      const res = await fetchNextQuestion({
        role: interviewConfig.role,
        experienceLevel: interviewConfig.experienceLevel,
        type: interviewConfig.type,
        difficulty: currentDifficulty,
        topics: interviewConfig.topics,
        questionNumber: qNum,
        totalQuestions: interviewConfig.questionCount,
        previousExchanges: exchanges,
        hindsightMemories: memories,
        lastAnswerEvaluation: lastEvaluation,
      });

      setCurrentQuestion(res.question);
      setCurrentTopic(res.topic);
      setCurrentDifficulty(res.difficulty);
      setCurrentRationale(res.rationale || '');
      setTargetedWeakness(res.targetedWeakness);
      setTargetedMemoryId(res.targetedMemoryId);

      // Read aloud question
      speakText(res.question);
    } catch (err) {
      console.error('Failed to load question:', err);
      // Resilient fallback
      setCurrentQuestion(
        `Can you walk me through how you would architect and optimize a high-volume ${interviewConfig.topics[0] || 'SQL'} system in a production environment?`
      );
      setCurrentTopic(interviewConfig.topics[0] || 'General');
      setCurrentRationale('Fallback evaluation question.');
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadQuestion(1);
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Handle Answer Submission
  const handleSubmitAnswer = async () => {
    const answerToEval = isProbing ? `${candidateAnswer}\n\n[Follow-up clarification]: ${probeAnswer}` : candidateAnswer;
    if (!answerToEval.trim()) return;

    setIsSubmitting(true);
    stopSpeaking();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    try {
      const evalResult = await evaluateAnswer({
        question: currentQuestion,
        answer: answerToEval,
        topic: currentTopic,
        difficulty: currentDifficulty,
        role: interviewConfig.role,
        targetedWeakness,
      });

      // Check if interviewer decides to probe weak or ambiguous explanation
      if (evalResult.shouldProbe && !isProbing && evalResult.probeQuestion) {
        setIsProbing(true);
        setProbeQuestion(evalResult.probeQuestion);
        speakText(evalResult.probeQuestion);
        setIsSubmitting(false);
        return;
      }

      // Record question result
      const newQuestionResult: QuestionResult = {
        id: `q-${Date.now()}`,
        questionNumber: currentQuestionNumber,
        question: currentQuestion,
        answer: candidateAnswer,
        topic: currentTopic,
        difficulty: currentDifficulty,
        correctness: evalResult.correctness,
        score: evalResult.score,
        feedback: evalResult.feedback,
        detectedWeaknesses: evalResult.detectedWeaknesses || [],
        detectedStrengths: evalResult.detectedStrengths || [],
        rationale: currentRationale,
        targetedMemoryId,
        followUpPrompt: isProbing ? probeQuestion : undefined,
        userFollowUpAnswer: isProbing ? probeAnswer : undefined,
      };

      const updatedCompleted = [...completedQuestions, newQuestionResult];
      setCompletedQuestions(updatedCompleted);

      // Check if interview is complete
      if (currentQuestionNumber >= interviewConfig.questionCount) {
        // Complete interview and extract Hindsight memories
        await finishAndExtract(updatedCompleted);
      } else {
        // Move to next question and adapt difficulty
        const nextQNum = currentQuestionNumber + 1;
        setCurrentQuestionNumber(nextQNum);

        // Adaptive difficulty adjustment
        let nextDiff = currentDifficulty;
        if (evalResult.score >= 85) {
          nextDiff = currentDifficulty === 'Easy' ? 'Medium' : 'Hard';
        } else if (evalResult.score < 55) {
          nextDiff = currentDifficulty === 'Hard' ? 'Medium' : 'Easy';
        }
        setCurrentDifficulty(nextDiff);

        await loadQuestion(nextQNum, evalResult);
      }
    } catch (err) {
      console.error('Answer evaluation failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Final review generation and Hindsight extraction
  const finishAndExtract = async (finalQuestions: QuestionResult[]) => {
    setIsSubmitting(true);
    try {
      const reviewData = await reviewAndExtractMemory({
        interviewNumber: 3, // Next sequential interview
        role: interviewConfig.role,
        experienceLevel: interviewConfig.experienceLevel,
        topics: interviewConfig.topics,
        questionsWithAnswers: finalQuestions,
        previousMemories: memories,
      });

      const fullInterview: Interview = {
        id: `int-${Date.now()}`,
        userId: 'candidate-a',
        interviewNumber: 3,
        role: interviewConfig.role,
        experienceLevel: interviewConfig.experienceLevel,
        type: interviewConfig.type,
        difficulty: interviewConfig.difficulty,
        topics: interviewConfig.topics,
        questionCount: interviewConfig.questionCount,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        status: 'completed',
        score: reviewData.score,
        scoresBreakdown: reviewData.scoresBreakdown,
        questions: finalQuestions,
        weaknesses: reviewData.weaknesses,
        strengths: reviewData.strengths,
        persistentWeaknesses: reviewData.persistentWeaknesses,
        memoriesCreatedOrUpdated: (reviewData.extractedMemories || []).map((m: any) => m.id),
        strategyRationale: interviewConfig.strategy.strategySummary,
      };

      onFinishInterview(fullInterview);
    } catch (err) {
      console.error('Failed to finalize interview:', err);
      // Fallback completion
      const avg = Math.round(
        finalQuestions.reduce((a, b) => a + b.score, 0) / finalQuestions.length
      );
      const fallbackInterview: Interview = {
        id: `int-${Date.now()}`,
        userId: 'candidate-a',
        interviewNumber: 3,
        role: interviewConfig.role,
        experienceLevel: interviewConfig.experienceLevel,
        type: interviewConfig.type,
        difficulty: interviewConfig.difficulty,
        topics: interviewConfig.topics,
        questionCount: interviewConfig.questionCount,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        status: 'completed',
        score: avg,
        scoresBreakdown: {
          technicalAccuracy: avg,
          communication: avg - 2,
          problemSolving: avg + 2,
          confidence: avg,
          topicCoverage: 80,
        },
        questions: finalQuestions,
        weaknesses: ['Deep trade-off articulation'],
        strengths: ['Algorithmic and systems comprehension'],
        persistentWeaknesses: [],
        memoriesCreatedOrUpdated: [],
      };
      onFinishInterview(fallbackInterview);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Session Progress Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {interviewConfig.role}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Question {currentQuestionNumber} of {interviewConfig.questionCount}
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20">
            Topic: {currentTopic || 'Loading...'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio read-aloud toggle */}
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setVoiceEnabled(!voiceEnabled);
            }}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
              voiceEnabled
                ? 'bg-slate-800 text-indigo-300 border-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title={voiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
          >
            {voiceEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span className="text-[11px] hidden sm:inline">
              {voiceEnabled ? 'Audio On' : 'Muted'}
            </span>
          </button>

          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            End Early
          </button>
        </div>
      </div>

      {/* Rationale Notification: Shows Hindsight connection */}
      {currentRationale && (
        <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-2.5">
          <Brain className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-200/90 leading-relaxed">
            <span className="font-semibold text-indigo-300">Why this was asked: </span>
            {currentRationale}
          </div>
        </div>
      )}

      {/* AI Interviewer Speech Bubble Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-start gap-3.5">
          {/* Avatar representation with speaking pulse */}
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md border border-indigo-400/30">
              AI
            </div>
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
            )}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                AI Senior Technical Interviewer
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Difficulty: {currentDifficulty}
              </span>
            </div>

            {isLoadingQuestion ? (
              <div className="py-6 flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Formulating memory-adapted question...</span>
              </div>
            ) : (
              <p className="text-base text-slate-100 font-medium leading-relaxed pt-1">
                {currentQuestion}
              </p>
            )}
          </div>
        </div>

        {/* Probing Alert (If interviewer follows up) */}
        {isProbing && (
          <div className="mt-4 p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Interviewer Follow-up Probe:</span>
            </div>
            <p className="text-sm text-amber-100 font-medium pl-6">
              "{probeQuestion}"
            </p>
            <p className="text-[11px] text-amber-300/80 pl-6">
              The interviewer wants you to clarify this specific trade-off or technical nuance before moving forward.
            </p>
          </div>
        )}
      </div>

      {/* Candidate Answer Box */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-200">
            {isProbing ? 'Your Follow-up Clarification' : 'Your Answer'}
          </label>

          <div className="flex items-center gap-2">
            {/* Mic Dictation */}
            <button
              onClick={toggleListening}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                isListening
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>Listening... (Click to stop)</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dictate Answer</span>
                </>
              )}
            </button>
          </div>
        </div>

        {isProbing ? (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
              <span className="font-semibold text-slate-300 block mb-1">Your Initial Answer:</span>
              <p className="line-clamp-2 italic">{candidateAnswer}</p>
            </div>
            <textarea
              value={probeAnswer}
              onChange={(e) => setProbeAnswer(e.target.value)}
              placeholder="Address the follow-up question here (explain trade-offs, edge cases, or performance)..."
              rows={4}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-amber-500/40 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 leading-relaxed font-normal"
            />
          </div>
        ) : (
          <textarea
            value={candidateAnswer}
            onChange={(e) => setCandidateAnswer(e.target.value)}
            placeholder="Type your structured answer here. Include architectural considerations, concrete mechanics, and production trade-offs..."
            rows={6}
            disabled={isLoadingQuestion || isSubmitting}
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 leading-relaxed font-normal"
          />
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-slate-500">
            Tip: Be thorough and state engineering trade-offs. The interviewer evaluates technical precision and depth.
          </div>

          <button
            onClick={handleSubmitAnswer}
            disabled={
              isSubmitting ||
              isLoadingQuestion ||
              (isProbing ? !probeAnswer.trim() : !candidateAnswer.trim())
            }
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Answer...</span>
              </>
            ) : isProbing ? (
              <>
                <span>Submit Clarification</span>
                <Send className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Submit Answer</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
