import React, { useState } from 'react';
import {
  Calculator,
  CheckCircle2,
  ClipboardList,
  Play,
  Save,
  Volume2,
} from 'lucide-react';
import { LabSimulationState, Language, TrialName, TrialRecord } from '../types/lab';
import { TRANSLATIONS } from '../i18n/translations';
import {
  computeConcordantVolume,
  getSolutionColorState,
  HCL_PIPETTE_VOLUME,
  STANDARD_NAOH_MOLARITY,
} from '../utils/chemistry';

interface LabWorkflowPanelProps {
  simState: LabSimulationState;
  language: Language;
  trials: TrialRecord[];
  calculatedMolarityInput: string;
  onExecuteStep: (step: number) => void;
  onSpeakStep: (script: string) => void;
  onSelectTrial: (trial: TrialName) => void;
  onUpdateTrialField: (trial: TrialName, field: 'initialReading' | 'finalReading', value: string) => void;
  onCaptureInitial: (trial: TrialName) => void;
  onCaptureFinal: (trial: TrialName) => void;
  onSaveTrial: (trial: TrialName) => void;
  onCalculatedMolarityChange: (value: string) => void;
  onVerifyCalculation: () => void;
  calculationFeedback: { verified: boolean; percentError: number; accurate: boolean } | null;
}

type RightTab = 'procedure' | 'observation' | 'calculation';

export const LabWorkflowPanel: React.FC<LabWorkflowPanelProps> = ({
  simState,
  language,
  trials,
  calculatedMolarityInput,
  onExecuteStep,
  onSpeakStep,
  onSelectTrial,
  onUpdateTrialField,
  onCaptureInitial,
  onCaptureFinal,
  onSaveTrial,
  onCalculatedMolarityChange,
  onVerifyCalculation,
  calculationFeedback,
}) => {
  const [activeTab, setActiveTab] = useState<RightTab>('procedure');
  const t = TRANSLATIONS[language];
  const currentStepDef = t.procedure.steps[simState.currentStep - 1];
  const colorState = getSolutionColorState(
    simState.currentPh,
    simState.indicatorAdded,
    simState.hclTransferred,
    simState.pinkFlashIntensity,
  );

  const concordantVol = computeConcordantVolume(trials);
  const autoM1 =
    concordantVol && concordantVol > 0
      ? (STANDARD_NAOH_MOLARITY * concordantVol) / HCL_PIPETTE_VOLUME
      : null;

  // Build SVG coordinates for live titration curve (x: 0..25 mL, y: 0..14 pH)
  const curvePoints = simState.curveHistory;
  const svgW = 320;
  const svgH = 128;
  const padL = 28;
  const padB = 20;
  const padT = 10;
  const padR = 10;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const toX = (vol: number) => padL + (Math.min(25, Math.max(0, vol)) / 25) * plotW;
  const toY = (ph: number) => padT + (1 - Math.min(14, Math.max(0, ph)) / 14) * plotH;

  const polylineStr = curvePoints.map((pt) => `${toX(pt.volumeAdded).toFixed(1)},${toY(pt.pH).toFixed(1)}`).join(' ');

  return (
    <div className="flex flex-col h-full lg:h-[calc(100vh-140px)] min-h-[520px] rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Live Telemetry Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-px bg-slate-200 border-b border-slate-200">
        <div className="bg-white px-3 py-2.5">
          <div className="text-[11px] font-medium text-slate-500">{t.telemetry.buretteReading}</div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
            {simState.buretteFilled ? simState.buretteReadingMl.toFixed(2) : '--'}
            <span className="text-xs font-normal text-slate-400 ml-1">mL</span>
          </div>
        </div>
        <div className="bg-white px-3 py-2.5">
          <div className="text-[11px] font-medium text-slate-500">{t.telemetry.volumeAdded}</div>
          <div className="text-lg font-bold font-mono tabular-nums text-blue-700">
            {simState.volumeAddedMl.toFixed(2)}
            <span className="text-xs font-normal text-slate-400 ml-1">mL</span>
          </div>
        </div>
        <div className="bg-white px-3 py-2.5">
          <div className="text-[11px] font-medium text-slate-500">{t.telemetry.livePh}</div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
            {simState.hclTransferred ? simState.currentPh.toFixed(2) : '7.00'}
            <span className="text-xs font-normal text-slate-400 ml-1">pH</span>
          </div>
        </div>
        <div className="bg-white px-3 py-2.5">
          <div className="text-[11px] font-medium text-slate-500">{t.telemetry.solutionColor}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="w-3.5 h-3.5 rounded border border-slate-300 shrink-0"
              style={{ backgroundColor: colorState.cssColor }}
            />
            <span className="text-xs font-semibold text-slate-800 truncate">
              {t.telemetry.colorStates[colorState.labelKey]}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-1 p-1.5 bg-slate-100 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('procedure')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'procedure' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>{t.procedure.heading}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('observation')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'observation' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>{t.observation.heading}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('calculation')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'calculation' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>{t.calculation.heading}</span>
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'procedure' && (
          <>
            {/* Active Step Guide Card */}
            <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-blue-700">
                  {t.procedure.stepOf} {currentStepDef.step} / 11
                </span>
                <button
                  type="button"
                  onClick={() => onSpeakStep(currentStepDef.audioScript)}
                  className="flex items-center gap-1 rounded-md border border-blue-200 bg-white px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{t.procedure.listenStep}</span>
                </button>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1.5">{currentStepDef.title}</h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">{currentStepDef.instruction}</p>
              <p className="text-[11px] text-slate-500 mt-1.5">{currentStepDef.hint}</p>

              <button
                type="button"
                onClick={() => {
                  if (currentStepDef.step === 11) {
                    setActiveTab('calculation');
                  } else {
                    onExecuteStep(currentStepDef.step);
                  }
                }}
                className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
              >
                {currentStepDef.actionLabel}
              </button>
            </div>

            {/* Live Titration Curve Graph */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold text-slate-700 mb-2">{t.telemetry.curveTitle}</div>
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-32 bg-white rounded border border-slate-200">
                {/* Horizontal pH gridlines */}
                {[0, 4, 7, 10, 14].map((phVal) => (
                  <g key={phVal}>
                    <line
                      x1={padL}
                      y1={toY(phVal)}
                      x2={svgW - padR}
                      y2={toY(phVal)}
                      stroke={phVal === 7 ? '#94a3b8' : '#e2e8f0'}
                      strokeDasharray={phVal === 7 ? '3 3' : undefined}
                      strokeWidth="1"
                    />
                    <text x={4} y={toY(phVal) + 3} fontSize="9" fill="#64748b" fontFamily="IBM Plex Mono">
                      {phVal}
                    </text>
                  </g>
                ))}
                {/* Phenolphthalein indicator band (pH 8.2 - 10.0) */}
                <rect
                  x={padL}
                  y={toY(10.0)}
                  width={plotW}
                  height={toY(8.2) - toY(10.0)}
                  fill="rgba(244, 114, 182, 0.14)"
                />
                {/* X axis labels */}
                {[0, 5, 10, 15, 20, 25].map((vol) => (
                  <text
                    key={vol}
                    x={toX(vol) - 5}
                    y={svgH - 5}
                    fontSize="9"
                    fill="#64748b"
                    fontFamily="IBM Plex Mono"
                  >
                    {vol}
                  </text>
                ))}
                {/* Curve polyline */}
                {curvePoints.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                    points={polylineStr}
                  />
                )}
                {/* Current point marker */}
                {curvePoints.length > 0 && (
                  <circle
                    cx={toX(curvePoints[curvePoints.length - 1].volumeAdded)}
                    cy={toY(curvePoints[curvePoints.length - 1].pH)}
                    r="3.8"
                    fill={simState.isEndpointReached ? '#db2777' : '#2563eb'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}
              </svg>
            </div>

            {/* 11-Step Checklist */}
            <div className="space-y-1.5">
              {t.procedure.steps.map((s) => {
                const isDone = simState.completedSteps.includes(s.step);
                const isCurrent = simState.currentStep === s.step;
                return (
                  <div
                    key={s.step}
                    className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${
                      isCurrent
                        ? 'border-blue-300 bg-blue-50/50 text-slate-900 font-semibold'
                        : isDone
                        ? 'border-emerald-200 bg-emerald-50/40 text-slate-700'
                        : 'border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[11px] w-5 shrink-0">{s.step}.</span>
                      <span className="truncate">{s.title}</span>
                    </div>
                    {isDone && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'observation' && (
          <div className="space-y-3">
            {/* Active Trial Selector */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700">{t.toolbar.trialLabel}:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {(['Rough', 'I', 'II', 'III'] as TrialName[]).map((tr) => (
                  <button
                    key={tr}
                    type="button"
                    onClick={() => onSelectTrial(tr)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                      simState.activeTrial === tr
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    {tr}
                  </button>
                ))}
              </div>
            </div>

            {/* Capture Current Burette Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onCaptureInitial(simState.activeTrial)}
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-blue-50 hover:border-blue-200 cursor-pointer"
              >
                {t.observation.captureInitial} ({simState.buretteFilled ? simState.buretteReadingMl.toFixed(2) : '0.00'})
              </button>
              <button
                type="button"
                onClick={() => onCaptureFinal(simState.activeTrial)}
                className="flex-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer"
              >
                {t.observation.captureFinal} ({simState.buretteFilled ? simState.buretteReadingMl.toFixed(2) : '0.00'})
              </button>
            </div>

            {/* Observation Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-2.5 py-2 font-semibold">{t.observation.trialCol}</th>
                    <th className="px-2.5 py-2 font-semibold">{t.observation.initialCol}</th>
                    <th className="px-2.5 py-2 font-semibold">{t.observation.finalCol}</th>
                    <th className="px-2.5 py-2 font-semibold">{t.observation.volumeCol}</th>
                    <th className="px-2 py-2 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                  {trials.map((row) => (
                    <tr
                      key={row.trialName}
                      className={simState.activeTrial === row.trialName ? 'bg-blue-50/40' : 'bg-white'}
                    >
                      <td className="px-2.5 py-2 font-sans font-semibold text-slate-800">{row.trialName}</td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="50"
                          value={row.initialReading}
                          onChange={(e) => onUpdateTrialField(row.trialName, 'initialReading', e.target.value)}
                          placeholder="0.00"
                          className="w-16 rounded border border-slate-200 px-1.5 py-1 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="50"
                          value={row.finalReading}
                          onChange={(e) => onUpdateTrialField(row.trialName, 'finalReading', e.target.value)}
                          placeholder="0.00"
                          className="w-16 rounded border border-slate-200 px-1.5 py-1 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-2.5 py-2 font-semibold text-blue-700">
                        {row.volumeUsed || '--'}
                      </td>
                      <td className="px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() => onSaveTrial(row.trialName)}
                          title={t.observation.saveTrial}
                          className="inline-flex items-center gap-1 rounded bg-slate-900 px-2 py-1 text-[11px] font-sans font-medium text-white hover:bg-blue-600 cursor-pointer"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Concordant Volume Summary */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-medium text-slate-600">{t.observation.concordantLabel}</div>
              <div className="text-lg font-bold font-mono tabular-nums text-blue-700 mt-0.5">
                {concordantVol !== null ? `${concordantVol.toFixed(2)} mL` : t.observation.noConcordant}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calculation' && (
          <div className="space-y-3.5">
            <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3">
              <div className="text-xs font-semibold text-blue-800">{t.calculation.formulaTitle}</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded bg-white border border-slate-200 p-2">
                  <div className="text-slate-500">{t.calculation.v1Label}</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">{HCL_PIPETTE_VOLUME.toFixed(1)} mL</div>
                </div>
                <div className="rounded bg-white border border-slate-200 p-2">
                  <div className="text-slate-500">{t.calculation.m2Label}</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">{STANDARD_NAOH_MOLARITY.toFixed(2)} M</div>
                </div>
                <div className="col-span-2 rounded bg-white border border-slate-200 p-2">
                  <div className="text-slate-500">{t.calculation.v2Label}</div>
                  <div className="font-mono font-bold text-blue-700 mt-0.5">
                    {concordantVol !== null ? `${concordantVol.toFixed(2)} mL` : t.observation.noConcordant}
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-step substitution */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1.5">
              <div className="text-xs font-semibold text-slate-800">{t.calculation.stepByStep}</div>
              <div className="font-mono text-xs text-slate-700 space-y-1">
                <div>M₁ × V₁ = M₂ × V₂</div>
                <div>M₁ = (M₂ × V₂) / V₁</div>
                <div>
                  M₁ = ({STANDARD_NAOH_MOLARITY.toFixed(2)} ×{' '}
                  {concordantVol !== null ? concordantVol.toFixed(2) : 'V₂'}) / {HCL_PIPETTE_VOLUME.toFixed(1)}
                </div>
                {autoM1 !== null && (
                  <div className="font-bold text-blue-700 pt-1">
                    M₁ = {autoM1.toFixed(4)} mol/L (M)
                  </div>
                )}
              </div>
            </div>

            {/* Student Verification Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                {t.calculation.m1Label}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.001"
                  value={calculatedMolarityInput}
                  onChange={(e) => onCalculatedMolarityChange(e.target.value)}
                  placeholder={t.calculation.enterM1}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={onVerifyCalculation}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                >
                  {t.calculation.checkAnswer}
                </button>
              </div>
            </div>

            {calculationFeedback && (
              <div
                className={`rounded-lg border p-3 text-xs ${
                  calculationFeedback.accurate
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-amber-200 bg-amber-50 text-amber-900'
                }`}
              >
                <div className="font-bold">
                  {calculationFeedback.accurate ? t.calculation.accurateMsg : t.calculation.offMsg}
                </div>
                <div className="mt-1.5 font-mono space-y-0.5">
                  <div>
                    {t.calculation.actualLabel}: {simState.unknownHclMolarity.toFixed(3)} M
                  </div>
                  <div>
                    {t.calculation.errorLabel}: {calculationFeedback.percentError.toFixed(2)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
