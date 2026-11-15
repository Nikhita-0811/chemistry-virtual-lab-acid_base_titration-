import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { AssessmentView } from './components/AssessmentView';
import { LabViewport3D } from './components/LabViewport3D';
import { LabWorkflowPanel } from './components/LabWorkflowPanel';
import { LearningDashboard } from './components/LearningDashboard';
import { LoginModal } from './components/LoginModal';
import { MolecularEquationView } from './components/MolecularEquationView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { TRANSLATIONS } from './i18n/translations';
import {
  ApparatusId,
  AssessmentResult,
  LabSimulationState,
  Language,
  NavTab,
  TapSpeed,
  TrialName,
  TrialRecord,
  UserProfile,
} from './types/lab';
import { labAudio } from './utils/audio';
import {
  BURETTE_CAPACITY,
  calculateTitrationPh,
  computeConcordantVolume,
  createInitialLabState,
  getEquivalenceVolume,
  HCL_PIPETTE_VOLUME,
  STANDARD_NAOH_MOLARITY,
} from './utils/chemistry';

const DEFAULT_TRIALS: TrialRecord[] = [
  { trialName: 'Rough', initialReading: '', finalReading: '', volumeUsed: '', savedAt: '' },
  { trialName: 'I', initialReading: '', finalReading: '', volumeUsed: '', savedAt: '' },
  { trialName: 'II', initialReading: '', finalReading: '', volumeUsed: '', savedAt: '' },
  { trialName: 'III', initialReading: '', finalReading: '', volumeUsed: '', savedAt: '' },
];

const UNKNOWN_MOLARITIES = [0.085, 0.095, 0.11, 0.12, 0.135, 0.145];

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeNav, setActiveNav] = useState<NavTab>('lab');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('titralab_user');
      return saved ? (JSON.parse(saved) as UserProfile) : null;
    } catch {
      return null;
    }
  });

  const [simState, setSimState] = useState<LabSimulationState>(() =>
    createInitialLabState(currentUser?.unknownMolarity || 0.12),
  );
  const [trials, setTrials] = useState<TrialRecord[]>(() =>
    currentUser?.trials?.length ? currentUser.trials : DEFAULT_TRIALS,
  );
  const [calculatedMolarityInput, setCalculatedMolarityInput] = useState(
    currentUser?.calculatedMolarity || '',
  );
  const [calculationFeedback, setCalculationFeedback] = useState<{
    verified: boolean;
    percentError: number;
    accurate: boolean;
  } | null>(null);

  const endpointChimePlayedRef = useRef(false);
  const t = TRANSLATIONS[language];

  // Sync voice toggle
  useEffect(() => {
    labAudio.setSpeechEnabled(voiceEnabled);
  }, [voiceEnabled]);

  // Persist student progress to Express backend whenever key records change
  const syncProgressToServer = useCallback(
    async (
      nextSteps: number[],
      nextTrials: TrialRecord[],
      calcM1: string,
      unknownM1: number,
    ) => {
      if (!currentUser) return;
      const concordant = computeConcordantVolume(nextTrials);
      try {
        const res = await fetch(`/api/student/${encodeURIComponent(currentUser.id)}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            completedSteps: nextSteps,
            trials: nextTrials,
            calculatedMolarity: calcM1,
            concordantVolume: concordant !== null ? concordant.toFixed(2) : '',
            unknownMolarity: unknownM1,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { user: UserProfile };
          setCurrentUser(data.user);
          localStorage.setItem('titralab_user', JSON.stringify(data.user));
        }
      } catch {
        // Offline resilience
      }
    },
    [currentUser],
  );

  // Continuous burette flow loop when stopcock is open
  useEffect(() => {
    if (simState.tapSpeed === 'closed' || !simState.buretteFilled || !simState.flaskUnderBurette) {
      return;
    }

    const rateMlPerSec =
      simState.tapSpeed === 'slow' ? 0.3 : simState.tapSpeed === 'medium' ? 0.9 : 2.2;

    const timer = window.setInterval(() => {
      setSimState((prev) => {
        if (prev.tapSpeed === 'closed' || prev.buretteReadingMl >= BURETTE_CAPACITY) {
          return { ...prev, tapSpeed: 'closed' };
        }
        const dt = 0.08;
        const deltaVol = rateMlPerSec * dt;
        const nextReading = Math.min(BURETTE_CAPACITY, Number((prev.buretteReadingMl + deltaVol).toFixed(2)));
        const nextAdded = Number((nextReading - prev.initialBuretteReadingMl).toFixed(2));
        const nextPh = calculateTitrationPh(
          prev.unknownHclMolarity,
          prev.hclPipetteVolume,
          prev.standardNaohMolarity,
          nextAdded,
          prev.distilledWaterAddedMl,
        );
        const eqVol = getEquivalenceVolume(
          prev.unknownHclMolarity,
          prev.hclPipetteVolume,
          prev.standardNaohMolarity,
        );
        const nearEndpoint = nextAdded >= eqVol - 1.0 && nextAdded < eqVol;
        const flash = nearEndpoint ? 0.85 : Math.max(0, prev.pinkFlashIntensity - 0.15);
        const endpointReached = prev.indicatorAdded && nextPh >= 8.2 && nextPh <= 9.5;
        const overshot = prev.indicatorAdded && nextPh > 9.5;

        if ((endpointReached || overshot) && !endpointChimePlayedRef.current) {
          endpointChimePlayedRef.current = true;
          labAudio.playEndpointChime();
        }

        // Append curve point every >= 0.15 mL change or across steep equivalence
        const lastPt = prev.curveHistory[prev.curveHistory.length - 1];
        const shouldPush =
          !lastPt ||
          nextAdded - lastPt.volumeAdded >= 0.15 ||
          Math.abs(nextPh - lastPt.pH) >= 0.35;

        const nextHistory = shouldPush
          ? [...prev.curveHistory, { volumeAdded: nextAdded, pH: nextPh }]
          : prev.curveHistory;

        let nextStep = prev.currentStep;
        const nextCompleted = [...prev.completedSteps];
        if (prev.currentStep === 7 && nextAdded >= 0.5) {
          if (!nextCompleted.includes(7)) nextCompleted.push(7);
          nextStep = 8;
        }
        if ((endpointReached || overshot) && prev.currentStep <= 8) {
          if (!nextCompleted.includes(8)) nextCompleted.push(8);
          nextStep = 9;
        }

        return {
          ...prev,
          buretteReadingMl: nextReading,
          volumeAddedMl: nextAdded,
          currentPh: nextPh,
          pinkFlashIntensity: flash,
          isEndpointReached: endpointReached,
          isOvershot: overshot,
          currentStep: nextStep,
          completedSteps: nextCompleted,
          curveHistory: nextHistory,
        };
      });
    }, 80);

    return () => clearInterval(timer);
  }, [simState.tapSpeed, simState.buretteFilled, simState.flaskUnderBurette]);

  // Fade transient pink swirl flash smoothly
  useEffect(() => {
    if (simState.pinkFlashIntensity <= 0.01) return;
    const id = window.setInterval(() => {
      setSimState((prev) => ({
        ...prev,
        pinkFlashIntensity: Math.max(0, Number((prev.pinkFlashIntensity - 0.08).toFixed(2))),
      }));
    }, 90);
    return () => clearInterval(id);
  }, [simState.pinkFlashIntensity]);

  const markStepCompleted = (prev: LabSimulationState, step: number): LabSimulationState => {
    const completed = prev.completedSteps.includes(step)
      ? prev.completedSteps
      : [...prev.completedSteps, step];
    const nextStep = Math.min(11, Math.max(prev.currentStep, step + 1));
    return { ...prev, completedSteps: completed, currentStep: nextStep };
  };

  const handleSingleDrop = () => {
    labAudio.playDropPlink();
    setSimState((prev) => {
      if (!prev.buretteFilled || !prev.flaskUnderBurette || prev.buretteReadingMl >= BURETTE_CAPACITY) {
        return prev;
      }
      const nextReading = Math.min(BURETTE_CAPACITY, Number((prev.buretteReadingMl + 0.05).toFixed(2)));
      const nextAdded = Number((nextReading - prev.initialBuretteReadingMl).toFixed(2));
      const nextPh = calculateTitrationPh(
        prev.unknownHclMolarity,
        prev.hclPipetteVolume,
        prev.standardNaohMolarity,
        nextAdded,
        prev.distilledWaterAddedMl,
      );
      const eqVol = getEquivalenceVolume(
        prev.unknownHclMolarity,
        prev.hclPipetteVolume,
        prev.standardNaohMolarity,
      );
      const nearEndpoint = nextAdded >= eqVol - 0.8 && nextAdded < eqVol;
      const endpointReached = prev.indicatorAdded && nextPh >= 8.2 && nextPh <= 9.5;
      const overshot = prev.indicatorAdded && nextPh > 9.5;

      if ((endpointReached || overshot) && !endpointChimePlayedRef.current) {
        endpointChimePlayedRef.current = true;
        labAudio.playEndpointChime();
      }

      let updated = {
        ...prev,
        buretteReadingMl: nextReading,
        volumeAddedMl: nextAdded,
        currentPh: nextPh,
        pinkFlashIntensity: nearEndpoint ? 0.9 : 0,
        isEndpointReached: endpointReached,
        isOvershot: overshot,
        swirlTriggerCount: prev.swirlTriggerCount + 1,
        curveHistory: [...prev.curveHistory, { volumeAdded: nextAdded, pH: nextPh }],
      };

      if (prev.currentStep === 7) updated = markStepCompleted(updated, 7);
      if (endpointReached || overshot) {
        if (!updated.completedSteps.includes(8)) updated.completedSteps = [...updated.completedSteps, 8];
        updated.currentStep = Math.max(updated.currentStep, 9);
      }
      return updated;
    });
  };

  const handleExecuteStep = (step: number) => {
    const stepDef = t.procedure.steps[step - 1];
    if (voiceEnabled && stepDef) {
      labAudio.speakStep(stepDef.audioScript, language);
    }

    if (step === 8) {
      handleSingleDrop();
      return;
    }

    if (step === 3) {
      const val = simState.buretteFilled ? simState.buretteReadingMl.toFixed(2) : '0.00';
      const updatedTrials = trials.map((r) =>
        r.trialName === simState.activeTrial ? { ...r, initialReading: val } : r,
      );
      setTrials(updatedTrials);
      setSimState((prev) => {
        const next = markStepCompleted({ ...prev, initialReadingRecorded: true }, 3);
        syncProgressToServer(next.completedSteps, updatedTrials, calculatedMolarityInput, next.unknownHclMolarity);
        return next;
      });
      return;
    }

    if (step === 10) {
      handleCaptureFinal(simState.activeTrial);
      return;
    }

    setSimState((prev) => {
      let next = { ...prev };
      switch (step) {
        case 1:
          labAudio.playGlassClink();
          next.buretteRinsed = true;
          next = markStepCompleted(next, 1);
          break;
        case 2:
          labAudio.playGlassClink();
          next.buretteRinsed = true;
          next.buretteFilled = true;
          next.buretteReadingMl = 0.0;
          next.initialBuretteReadingMl = 0.0;
          next.volumeAddedMl = 0.0;
          next = markStepCompleted(next, 2);
          break;
        case 4:
          labAudio.playDropPlink();
          next.hclTransferred = true;
          next.currentPh = calculateTitrationPh(
            next.unknownHclMolarity,
            next.hclPipetteVolume,
            next.standardNaohMolarity,
            next.volumeAddedMl,
            next.distilledWaterAddedMl,
          );
          next.curveHistory = [{ volumeAdded: 0, pH: next.currentPh }];
          next = markStepCompleted(next, 4);
          break;
        case 5:
          labAudio.playDropPlink();
          next.indicatorAdded = true;
          next.indicatorDrops = 3;
          next = markStepCompleted(next, 5);
          break;
        case 6:
          labAudio.playGlassClink();
          next.flaskUnderBurette = true;
          next = markStepCompleted(next, 6);
          break;
        case 7:
          next.tapSpeed = 'slow';
          break;
        case 9:
          next.tapSpeed = 'closed';
          next = markStepCompleted(next, 9);
          break;
        default:
          break;
      }
      syncProgressToServer(next.completedSteps, trials, calculatedMolarityInput, next.unknownHclMolarity);
      return next;
    });
  };

  const handleApparatusClick = (id: ApparatusId) => {
    switch (id) {
      case 'naoh_bottle':
        if (!simState.buretteRinsed) handleExecuteStep(1);
        else if (!simState.buretteFilled) handleExecuteStep(2);
        break;
      case 'funnel':
        if (!simState.buretteFilled) handleExecuteStep(2);
        break;
      case 'pipette':
      case 'beaker':
      case 'hcl_bottle':
        if (!simState.hclTransferred) handleExecuteStep(4);
        break;
      case 'indicator_bottle':
        if (simState.hclTransferred && !simState.indicatorAdded) handleExecuteStep(5);
        break;
      case 'conical_flask':
      case 'white_tile':
        if (!simState.flaskUnderBurette && simState.hclTransferred) {
          handleExecuteStep(6);
        } else {
          setSimState((p) => ({ ...p, swirlTriggerCount: p.swirlTriggerCount + 1 }));
        }
        break;
      case 'burette':
        if (!simState.buretteRinsed) handleExecuteStep(1);
        else if (!simState.buretteFilled) handleExecuteStep(2);
        else if (simState.flaskUnderBurette) {
          setSimState((p) => ({
            ...p,
            tapSpeed: p.tapSpeed === 'closed' ? 'slow' : 'closed',
          }));
        }
        break;
      case 'wash_bottle':
        handleWashBottle();
        break;
      default:
        break;
    }
  };

  const handleTapSpeedChange = (speed: TapSpeed) => {
    setSimState((prev) => {
      let next = { ...prev, tapSpeed: speed };
      if (speed === 'closed' && (prev.isEndpointReached || prev.isOvershot)) {
        next = markStepCompleted(next, 9);
      }
      return next;
    });
  };

  const handleWashBottle = () => {
    labAudio.playDropPlink();
    setSimState((prev) => {
      const nextWater = prev.distilledWaterAddedMl + 2.0;
      const nextPh = prev.hclTransferred
        ? calculateTitrationPh(
            prev.unknownHclMolarity,
            prev.hclPipetteVolume,
            prev.standardNaohMolarity,
            prev.volumeAddedMl,
            nextWater,
          )
        : 7.0;
      return {
        ...prev,
        distilledWaterAddedMl: nextWater,
        currentPh: nextPh,
        washSquirtCount: prev.washSquirtCount + 1,
      };
    });
  };

  const handleResetTrial = (nextTrial?: TrialName) => {
    endpointChimePlayedRef.current = false;
    setSimState((prev) => ({
      ...createInitialLabState(prev.unknownHclMolarity),
      buretteRinsed: true,
      buretteFilled: true,
      buretteReadingMl: 0.0,
      initialBuretteReadingMl: 0.0,
      completedSteps: prev.completedSteps,
      activeTrial: nextTrial || prev.activeTrial,
      currentStep: 3,
    }));
  };

  const handleNewUnknownSample = () => {
    endpointChimePlayedRef.current = false;
    const nextUnknown =
      UNKNOWN_MOLARITIES[Math.floor(Math.random() * UNKNOWN_MOLARITIES.length)];
    setSimState(createInitialLabState(nextUnknown));
    setTrials(DEFAULT_TRIALS);
    setCalculatedMolarityInput('');
    setCalculationFeedback(null);
    syncProgressToServer([], DEFAULT_TRIALS, '', nextUnknown);
  };

  const handleUpdateTrialField = (
    trialName: TrialName,
    field: 'initialReading' | 'finalReading',
    value: string,
  ) => {
    setTrials((prev) =>
      prev.map((row) => {
        if (row.trialName !== trialName) return row;
        const nextRow = { ...row, [field]: value };
        const init = parseFloat(nextRow.initialReading);
        const fin = parseFloat(nextRow.finalReading);
        nextRow.volumeUsed =
          !Number.isNaN(init) && !Number.isNaN(fin) && fin >= init
            ? (fin - init).toFixed(2)
            : '';
        return nextRow;
      }),
    );
  };

  const handleCaptureInitial = (trialName: TrialName) => {
    const val = simState.buretteFilled ? simState.buretteReadingMl.toFixed(2) : '0.00';
    handleUpdateTrialField(trialName, 'initialReading', val);
    setSimState((prev) => markStepCompleted(prev, 3));
  };

  const handleCaptureFinal = (trialName: TrialName) => {
    const val = simState.buretteFilled ? simState.buretteReadingMl.toFixed(2) : '0.00';
    const updated = trials.map((row) => {
      if (row.trialName !== trialName) return row;
      const initStr = row.initialReading || simState.initialBuretteReadingMl.toFixed(2);
      const init = parseFloat(initStr);
      const fin = parseFloat(val);
      return {
        ...row,
        initialReading: initStr,
        finalReading: val,
        volumeUsed: !Number.isNaN(init) && fin >= init ? (fin - init).toFixed(2) : '',
        savedAt: new Date().toISOString(),
      };
    });
    setTrials(updated);
    const nextSteps = simState.completedSteps.includes(10)
      ? simState.completedSteps
      : [...simState.completedSteps, 10];
    setSimState((prev) => markStepCompleted(prev, 10));
    syncProgressToServer(nextSteps, updated, calculatedMolarityInput, simState.unknownHclMolarity);
  };

  const handleSaveTrial = (trialName: TrialName) => {
    const updated = trials.map((r) =>
      r.trialName === trialName ? { ...r, savedAt: new Date().toISOString() } : r,
    );
    setTrials(updated);
    const nextSteps = simState.completedSteps.includes(10)
      ? simState.completedSteps
      : [...simState.completedSteps, 10];
    setSimState((p) => ({ ...p, completedSteps: nextSteps, currentStep: 11 }));
    syncProgressToServer(nextSteps, updated, calculatedMolarityInput, simState.unknownHclMolarity);
  };

  const handleVerifyCalculation = () => {
    const entered = parseFloat(calculatedMolarityInput);
    if (Number.isNaN(entered) || entered <= 0) return;
    const pctError = Math.abs((entered - simState.unknownHclMolarity) / simState.unknownHclMolarity) * 100;
    const accurate = pctError <= 3.0;
    setCalculationFeedback({
      verified: true,
      percentError: Number(pctError.toFixed(2)),
      accurate,
    });
    const nextSteps = simState.completedSteps.includes(11)
      ? simState.completedSteps
      : [...simState.completedSteps, 11];
    setSimState((p) => ({ ...p, completedSteps: nextSteps }));
    syncProgressToServer(nextSteps, trials, calculatedMolarityInput, simState.unknownHclMolarity);
  };

  const handleAssessmentSubmit = async (result: AssessmentResult) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/student/${encodeURIComponent(currentUser.id)}/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      if (res.ok) {
        const data = (await res.json()) as { user: UserProfile };
        setCurrentUser(data.user);
        localStorage.setItem('titralab_user', JSON.stringify(data.user));
      }
    } catch {
      // Ignore offline errors
    }
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('titralab_user', JSON.stringify(user));
    setSimState(createInitialLabState(user.unknownMolarity));
    if (user.trials?.length) setTrials(user.trials);
    if (user.calculatedMolarity) setCalculatedMolarityInput(user.calculatedMolarity);
    if (user.role === 'teacher') {
      setActiveNav('teacher');
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('titralab_user');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 border-b border-slate-200 bg-white px-4 sm:px-6 py-3">
        <a
          href="#lab"
          onClick={(e) => {
            e.preventDefault();
            setActiveNav('lab');
          }}
          className="text-lg font-bold tracking-tight text-blue-700 whitespace-nowrap shrink-0"
        >
          {t.brand}
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {(
            [
              ['lab', t.nav.lab],
              ['learning', t.nav.learning],
              ['equation', t.nav.equation],
              ['assessment', t.nav.assessment],
              ['teacher', t.nav.teacher],
            ] as [NavTab, string][]
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveNav(tab)}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeNav === tab
                  ? 'border-blue-600 text-blue-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center shrink-0">
          {currentUser ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {currentUser.name} · {t.auth.signOut}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setLoginModalOpen(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.auth.signIn}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Nav Strip */}
      <div className="flex md:hidden items-center gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-1.5">
        {(
          [
            ['lab', t.nav.lab],
            ['learning', t.nav.learning],
            ['equation', t.nav.equation],
            ['assessment', t.nav.assessment],
            ['teacher', t.nav.teacher],
          ] as [NavTab, string][]
        ).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveNav(tab)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 ${
              activeNav === tab ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Workspace Utility Toolbar */}
      <div className="border-b border-slate-200 bg-slate-50/90 px-4 sm:px-6 py-2">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-semibold text-slate-700 truncate">
            {t.toolbar.experimentTitle}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bilingual English / Tamil Switch */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-0.5">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  language === 'en' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  language === 'ta' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Audio Instructions Toggle */}
            <button
              type="button"
              onClick={() => setVoiceEnabled((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium cursor-pointer ${
                voiceEnabled
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="whitespace-nowrap">
                {voiceEnabled ? t.toolbar.voiceOn : t.toolbar.voiceOff}
              </span>
            </button>

            {/* Generate New Unknown HCl Sample */}
            <button
              type="button"
              onClick={handleNewUnknownSample}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.toolbar.newSample}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Router */}
      <main className="flex-1">
        {activeNav === 'lab' && (
          <div className="max-w-[1440px] mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-8">
              <LabViewport3D
                simState={simState}
                language={language}
                onApparatusClick={handleApparatusClick}
                onFlaskPlaced={() => handleExecuteStep(6)}
                onTapSpeedChange={handleTapSpeedChange}
                onSingleDrop={handleSingleDrop}
                onSwirlFlask={() =>
                  setSimState((p) => ({ ...p, swirlTriggerCount: p.swirlTriggerCount + 1 }))
                }
                onWashBottle={handleWashBottle}
                onResetTrial={() => handleResetTrial()}
              />
            </div>
            <div className="lg:col-span-4">
              <LabWorkflowPanel
                simState={simState}
                language={language}
                trials={trials}
                calculatedMolarityInput={calculatedMolarityInput}
                onExecuteStep={handleExecuteStep}
                onSpeakStep={(script) => labAudio.speakStep(script, language)}
                onSelectTrial={(trial) => handleResetTrial(trial)}
                onUpdateTrialField={handleUpdateTrialField}
                onCaptureInitial={handleCaptureInitial}
                onCaptureFinal={handleCaptureFinal}
                onSaveTrial={handleSaveTrial}
                onCalculatedMolarityChange={setCalculatedMolarityInput}
                onVerifyCalculation={handleVerifyCalculation}
                calculationFeedback={calculationFeedback}
              />
            </div>
          </div>
        )}

        {activeNav === 'learning' && (
          <LearningDashboard
            language={language}
            trials={trials}
            calculatedMolarity={calculatedMolarityInput}
          />
        )}

        {activeNav === 'equation' && (
          <MolecularEquationView
            language={language}
            unknownMolarity={simState.unknownHclMolarity}
            liveVolumeAdded={simState.volumeAddedMl}
          />
        )}

        {activeNav === 'assessment' && (
          <AssessmentView
            language={language}
            savedResult={currentUser?.assessment || null}
            onSubmitAssessment={handleAssessmentSubmit}
          />
        )}

        {activeNav === 'teacher' && (
          <TeacherDashboard
            language={language}
            currentUser={currentUser}
            onRequestSignIn={() => setLoginModalOpen(true)}
          />
        )}
      </main>

      <LoginModal
        open={loginModalOpen}
        language={language}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
