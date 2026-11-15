import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LEARNING_DATA } from '../data/learningData';
import { Language, TrialRecord } from '../types/lab';
import {
  computeConcordantVolume,
  HCL_PIPETTE_VOLUME,
  STANDARD_NAOH_MOLARITY,
} from '../utils/chemistry';

interface LearningDashboardProps {
  language: Language;
  trials: TrialRecord[];
  calculatedMolarity: string;
}

export const LearningDashboard: React.FC<LearningDashboardProps> = ({
  language,
  trials,
  calculatedMolarity,
}) => {
  const data = LEARNING_DATA[language];
  const isTa = language === 'ta';
  const [openViva, setOpenViva] = useState<number | null>(0);
  const concordant = computeConcordantVolume(trials);
  const computedM1 =
    concordant !== null ? ((STANDARD_NAOH_MOLARITY * concordant) / HCL_PIPETTE_VOLUME).toFixed(4) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="text-xs font-semibold text-blue-700">
          {isTa ? 'ஆய்வகக் கையேடு' : 'Laboratory Learning Manual'}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1 text-balance">{data.title}</h1>
      </div>

      {/* 1. Aim & 6. Equation */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
          <h2 className="text-base font-bold text-slate-900">{data.aim.heading}</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{data.aim.text}</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
          <h2 className="text-base font-bold text-slate-900">{data.equation.heading}</h2>
          <div className="rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-2.5 font-mono text-sm font-bold text-blue-900">
            {data.equation.balanced}
          </div>
          <div className="font-mono text-xs text-slate-600">{data.equation.ionic}</div>
          <p className="text-xs text-slate-600 leading-relaxed">{data.equation.explanation}</p>
        </section>
      </div>

      {/* 2. Apparatus & 3. Chemicals */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-base font-bold text-slate-900">{data.apparatus.heading}</h2>
          <div className="divide-y divide-slate-100">
            {data.apparatus.items.map((item) => (
              <div key={item.name} className="py-2">
                <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                <div className="text-xs text-slate-600 mt-0.5">{item.detail}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-base font-bold text-slate-900">{data.chemicals.heading}</h2>
          <div className="divide-y divide-slate-100">
            {data.chemicals.items.map((chem) => (
              <div key={chem.name} className="py-2.5">
                <div className="text-sm font-semibold text-blue-800">{chem.name}</div>
                <div className="text-xs text-slate-600 mt-0.5">{chem.role}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. Theory */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
        <h2 className="text-base font-bold text-slate-900">{data.theory.heading}</h2>
        {data.theory.paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-slate-700 leading-relaxed">
            {p}
          </p>
        ))}
        <ul className="grid sm:grid-cols-3 gap-3 pt-2">
          {data.theory.keyPoints.map((kp, i) => (
            <li key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              {kp}
            </li>
          ))}
        </ul>
      </section>

      {/* 5. Procedure & 10. Precautions */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-base font-bold text-slate-900">{data.procedure.heading}</h2>
          <ol className="space-y-2 text-xs text-slate-700">
            {data.procedure.steps.map((step, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="font-mono font-bold text-blue-700 w-5 shrink-0">{i + 1}.</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-base font-bold text-slate-900">{data.precautions.heading}</h2>
          <ul className="space-y-2 text-xs text-slate-700">
            {data.precautions.items.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-mono font-bold text-slate-400">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 7. Observation Table, 8. Calculations & 9. Result */}
      <div className="grid md:grid-cols-3 gap-6">
        <section className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            {isTa ? '7. உற்றுநோக்கல் அட்டவணை (நேரடி தரவு)' : '7. Observation Table (Live Lab Data)'}
          </h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-3 py-2">{isTa ? 'சோதனை' : 'Trial'}</th>
                  <th className="px-3 py-2">{isTa ? 'தொடக்க அளவு (mL)' : 'Initial Reading (mL)'}</th>
                  <th className="px-3 py-2">{isTa ? 'இறுதி அளவு (mL)' : 'Final Reading (mL)'}</th>
                  <th className="px-3 py-2">{isTa ? 'NaOH அளவு (mL)' : 'Volume Used (mL)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                {trials.map((tr) => (
                  <tr key={tr.trialName}>
                    <td className="px-3 py-2 font-sans font-semibold">{tr.trialName}</td>
                    <td className="px-3 py-2">{tr.initialReading || '--'}</td>
                    <td className="px-3 py-2">{tr.finalReading || '--'}</td>
                    <td className="px-3 py-2 font-semibold text-blue-700">{tr.volumeUsed || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            {isTa ? '8 & 9. கணக்கீடு & முடிவு' : '8 & 9. Calculations & Result'}
          </h2>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 font-mono text-xs space-y-1">
            <div>M₁V₁ = M₂V₂</div>
            <div>V₁ = 10.0 mL (HCl)</div>
            <div>M₂ = 0.10 M (NaOH)</div>
            <div>V₂ = {concordant !== null ? `${concordant.toFixed(2)} mL` : '--'}</div>
            <div className="pt-1 font-bold text-blue-700">
              M₁ = {computedM1 ? `${computedM1} M` : '--'}
            </div>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-xs text-slate-800">
            <span className="font-semibold">{isTa ? 'முடிவு:' : 'Result:'} </span>
            {calculatedMolarity || computedM1
              ? isTa
                ? `கொடுக்கப்பட்ட HCl கரைசலின் மோலாரிட்டி = ${calculatedMolarity || computedM1} mol/L.`
                : `The molarity of the given unknown HCl solution is ${calculatedMolarity || computedM1} mol/L (M).`
              : isTa
              ? 'முடிவைக் காண மெய்நிகர் ஆய்வகத்தில் சோதனையை முடிக்கவும்.'
              : 'Complete a titration trial in the Virtual Lab to populate your experimental result.'}
          </div>
        </section>
      </div>

      {/* 11. Viva-Voce Questions */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="text-base font-bold text-slate-900">{data.vivaQuestions.heading}</h2>
        <div className="space-y-2">
          {data.vivaQuestions.qa.map((item, idx) => {
            const isOpen = openViva === idx;
            return (
              <div key={idx} className="rounded-lg border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenViva(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 py-3 text-xs text-slate-700 leading-relaxed bg-white border-t border-slate-200">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
