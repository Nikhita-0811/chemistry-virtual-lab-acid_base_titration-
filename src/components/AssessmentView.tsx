import React, { useState } from 'react';
import { Award, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import {
  APPLICATION_QUESTIONS,
  FILL_QUESTIONS,
  MCQ_QUESTIONS,
  VIVA_QUESTIONS,
} from '../data/assessmentData';
import { AssessmentResult, Language } from '../types/lab';

interface AssessmentViewProps {
  language: Language;
  savedResult: AssessmentResult | null;
  onSubmitAssessment: (result: AssessmentResult) => void;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  language,
  savedResult,
  onSubmitAssessment,
}) => {
  const isTa = language === 'ta';
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [fillAnswers, setFillAnswers] = useState<Record<string, string>>({});
  const [appAnswers, setAppAnswers] = useState<Record<string, number>>({});
  const [vivaAnswers, setVivaAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(savedResult);

  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

  const isFillCorrect = (qId: string) => {
    const q = FILL_QUESTIONS.find((f) => f.id === qId);
    if (!q) return false;
    const ans = normalize(fillAnswers[qId] || '');
    return q.acceptedAnswers.some((acc) => normalize(acc) === ans);
  };

  const isVivaCorrect = (qId: string) => {
    const q = VIVA_QUESTIONS.find((v) => v.id === qId);
    if (!q) return false;
    const ans = normalize(vivaAnswers[qId] || '');
    if (ans.length < 4) return false;
    return q.keywords.some((kw) => ans.includes(kw.toLowerCase()));
  };

  const handleGrade = () => {
    let mcqScore = 0;
    for (const q of MCQ_QUESTIONS) {
      if (mcqAnswers[q.id] === q.correctIndex) mcqScore++;
    }
    let fillScore = 0;
    for (const q of FILL_QUESTIONS) {
      if (isFillCorrect(q.id)) fillScore++;
    }
    let applicationScore = 0;
    for (const q of APPLICATION_QUESTIONS) {
      if (appAnswers[q.id] === q.correctIndex) applicationScore++;
    }
    let vivaScore = 0;
    for (const q of VIVA_QUESTIONS) {
      if (isVivaCorrect(q.id)) vivaScore++;
    }

    const totalScore = mcqScore + fillScore + applicationScore + vivaScore;
    const evalResult: AssessmentResult = {
      totalScore,
      maxScore: 25,
      mcqScore,
      fillScore,
      applicationScore,
      vivaScore,
      submittedAt: new Date().toISOString(),
    };
    setResult(evalResult);
    setSubmitted(true);
    onSubmitAssessment(evalResult);
  };

  const handleResetQuiz = () => {
    setMcqAnswers({});
    setFillAnswers({});
    setAppAnswers({});
    setVivaAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Score Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-700">
            {isTa ? 'மதிப்பீடு & சுய மதிப்பாய்வு' : 'Experiment Evaluation & Grading'}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {isTa ? 'அமில-கார தரம்பார்த்தல் தேர்வு (25 வினாக்கள்)' : 'Acid-Base Titration Assessment (25 Questions)'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isTa
              ? '10 பல்தேர்வு + 5 கோடிட்ட இடம் + 5 பயன்பாட்டு வினாக்கள் + 5 வாய்மொழி வினாக்கள்'
              : '10 Multiple Choice · 5 Fill-in-the-Blanks · 5 Application · 5 Viva-Voce'}
          </p>
        </div>

        {result && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-5 py-3 text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-blue-700">
              <Award className="w-4 h-4" />
              <span>{isTa ? 'மதிப்பெண்' : 'Evaluation Score'}</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {result.totalScore} / {result.maxScore}
              <span className="text-sm font-semibold text-blue-700 ml-2">
                ({Math.round((result.totalScore / result.maxScore) * 100)}%)
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-600 mt-0.5">
              MCQ {result.mcqScore}/10 · Fill {result.fillScore}/5 · App {result.applicationScore}/5 · Viva {result.vivaScore}/5
            </div>
          </div>
        )}
      </div>

      {/* Section 1: 10 MCQs */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <h2 className="text-base font-bold text-slate-900">
          {isTa ? 'பகுதி A: பல்தேர்வு வினாக்கள் (10)' : 'Section A: Multiple-Choice Questions (10 Marks)'}
        </h2>
        {MCQ_QUESTIONS.map((q, idx) => {
          const picked = mcqAnswers[q.id];
          const correct = picked === q.correctIndex;
          return (
            <div key={q.id} className="rounded-lg border border-slate-200 p-4 space-y-3">
              <div className="text-sm font-semibold text-slate-900">
                {idx + 1}. {q.question[language]}
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {q.options[language].map((opt, optIdx) => {
                  const selected = picked === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => setMcqAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                      className={`text-left rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        submitted
                          ? optIdx === q.correctIndex
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold'
                            : selected
                            ? 'border-rose-300 bg-rose-50 text-rose-900'
                            : 'border-slate-200 bg-white text-slate-500'
                          : selected
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div
                  className={`flex items-start gap-2 rounded-md p-2.5 text-xs ${
                    correct ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'
                  }`}
                >
                  {correct ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                  <span>{q.explanation[language]}</span>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Section 2: 5 Fill in the Blanks */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          {isTa ? 'பகுதி B: கோடிட்ட இடங்களை நிரப்புக (5)' : 'Section B: Fill in the Blanks (5 Marks)'}
        </h2>
        {FILL_QUESTIONS.map((q, idx) => {
          const ok = submitted && isFillCorrect(q.id);
          return (
            <div key={q.id} className="rounded-lg border border-slate-200 p-4 space-y-2.5">
              <div className="text-sm font-semibold text-slate-900">
                {idx + 1}. {q.prompt[language]}
              </div>
              <input
                type="text"
                disabled={submitted}
                value={fillAnswers[q.id] || ''}
                onChange={(e) => setFillAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                placeholder={isTa ? 'விடையை உள்ளிடவும்...' : 'Type your answer...'}
                className="w-full sm:w-80 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
              {submitted && (
                <div className={`text-xs p-2.5 rounded-md ${ok ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                  <span className="font-bold">
                    {ok ? (isTa ? 'சரி!' : 'Correct!') : `${isTa ? 'சரியான விடை:' : 'Answer:'} ${q.displayAnswer}`}
                  </span>{' '}
                  — {q.explanation[language]}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Section 3: 5 Application-Based Questions */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          {isTa ? 'பகுதி C: பயன்பாட்டு வினாக்கள் (5)' : 'Section C: Application-Based Questions (5 Marks)'}
        </h2>
        {APPLICATION_QUESTIONS.map((q, idx) => {
          const picked = appAnswers[q.id];
          const correct = picked === q.correctIndex;
          return (
            <div key={q.id} className="rounded-lg border border-slate-200 p-4 space-y-3">
              <div className="text-sm font-semibold text-slate-900">
                {idx + 1}. {q.question[language]}
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {q.options[language].map((opt, optIdx) => {
                  const selected = picked === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => setAppAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                      className={`text-left rounded-lg border px-3 py-2 text-xs font-medium cursor-pointer ${
                        submitted
                          ? optIdx === q.correctIndex
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold'
                            : selected
                            ? 'border-rose-300 bg-rose-50 text-rose-900'
                            : 'border-slate-200 bg-white text-slate-500'
                          : selected
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div className={`text-xs p-2.5 rounded-md ${correct ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                  {q.explanation[language]}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Section 4: 5 Viva-Voce Questions */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          {isTa ? 'பகுதி D: வாய்மொழி வினாக்கள் (5)' : 'Section D: Viva-Voce Questions (5 Marks)'}
        </h2>
        {VIVA_QUESTIONS.map((q, idx) => {
          const ok = submitted && isVivaCorrect(q.id);
          return (
            <div key={q.id} className="rounded-lg border border-slate-200 p-4 space-y-2.5">
              <div className="text-sm font-semibold text-slate-900">
                {idx + 1}. {q.question[language]}
              </div>
              <textarea
                rows={2}
                disabled={submitted}
                value={vivaAnswers[q.id] || ''}
                onChange={(e) => setVivaAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                placeholder={isTa ? 'உங்கள் விளக்கத்தை எழுதவும்...' : 'Write a concise scientific explanation...'}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
              {submitted && (
                <div className={`text-xs p-2.5 rounded-md ${ok ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`}>
                  <span className="font-bold">{isTa ? 'மாதிரி விடை:' : 'Model Answer:'} </span>
                  {q.modelAnswer[language]}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Submit / Retake Controls */}
      <div className="flex items-center justify-end gap-3">
        {submitted ? (
          <button
            type="button"
            onClick={handleResetQuiz}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isTa ? 'மீண்டும் எழுதுக' : 'Retake Assessment'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleGrade}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer"
          >
            {isTa ? 'மதிப்பீட்டைச் சமர்ப்பிக்கவும்' : 'Submit & Auto-Grade Assessment'}
          </button>
        )}
      </div>
    </div>
  );
};
