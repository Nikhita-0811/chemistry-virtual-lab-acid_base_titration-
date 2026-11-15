export type Language = 'en' | 'ta';

export type NavTab = 'lab' | 'learning' | 'equation' | 'assessment' | 'teacher';

export type CameraPreset = 'overview' | 'meniscus' | 'flask' | 'phmeter';

export type TapSpeed = 'closed' | 'slow' | 'medium' | 'fast';

export type ApparatusId =
  | 'workbench'
  | 'burette'
  | 'retort_stand'
  | 'conical_flask'
  | 'pipette'
  | 'beaker'
  | 'funnel'
  | 'white_tile'
  | 'wash_bottle'
  | 'ph_meter'
  | 'naoh_bottle'
  | 'hcl_bottle'
  | 'indicator_bottle';

export type TrialName = 'Rough' | 'I' | 'II' | 'III';

export interface TrialRecord {
  trialName: TrialName;
  initialReading: string;
  finalReading: string;
  volumeUsed: string;
  savedAt: string;
}

export interface AssessmentResult {
  totalScore: number;
  maxScore: number;
  mcqScore: number;
  fillScore: number;
  applicationScore: number;
  vivaScore: number;
  submittedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  rollNumber: string;
  classSection: string;
  role: 'student' | 'teacher';
  unknownMolarity: number;
  completedSteps: number[];
  trials: TrialRecord[];
  calculatedMolarity: string;
  concordantVolume: string;
  percentError: number | null;
  assessment: AssessmentResult | null;
  lastActive: string;
}

export interface TitrationPoint {
  volumeAdded: number;
  pH: number;
}

export interface LabSimulationState {
  // Experiment configuration
  unknownHclMolarity: number; // M1 (true hidden value, e.g., 0.120 M)
  standardNaohMolarity: number; // M2 = 0.100 M
  hclPipetteVolume: number; // V1 = 10.0 mL

  // Apparatus preparation flags (Steps 1-6)
  buretteRinsed: boolean;
  buretteFilled: boolean;
  initialReadingRecorded: boolean;
  hclTransferred: boolean;
  indicatorAdded: boolean;
  indicatorDrops: number;
  flaskUnderBurette: boolean;
  distilledWaterAddedMl: number;

  // Burette & Titration real-time quantities
  buretteReadingMl: number; // 0.00 to 50.00 mL scale reading
  initialBuretteReadingMl: number; // Typically 0.00 mL
  volumeAddedMl: number; // buretteReadingMl - initialBuretteReadingMl
  tapSpeed: TapSpeed;

  // Derived real-time chemistry
  currentPh: number;
  pinkFlashIntensity: number; // 0..1 transient swirl flash
  isEndpointReached: boolean;
  isOvershot: boolean;

  // Procedure tracking
  currentStep: number; // 1 to 11
  completedSteps: number[];
  activeTrial: TrialName;
  swirlTriggerCount: number;
  washSquirtCount: number;

  // Live curve points
  curveHistory: TitrationPoint[];
}
