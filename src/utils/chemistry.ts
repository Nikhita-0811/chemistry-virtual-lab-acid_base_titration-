import { LabSimulationState, TrialRecord } from '../types/lab';

export const STANDARD_NAOH_MOLARITY = 0.1; // 0.10 M NaOH
export const HCL_PIPETTE_VOLUME = 10.0; // 10.0 mL HCl
export const BURETTE_CAPACITY = 50.0; // 50.0 mL burette
export const KW = 1e-14;

/**
 * Computes exact pH for strong acid (HCl) titrated with strong base (NaOH)
 * including auto-ionization of water (Kw = 1e-14) for smooth continuity through pH 7.00.
 */
export function calculateTitrationPh(
  hclMolarity: number,
  hclVolumeMl: number,
  naohMolarity: number,
  naohAddedMl: number,
  waterAddedMl = 0,
): number {
  if (hclVolumeMl <= 0) {
    // Pure water or NaOH only
    if (naohAddedMl <= 0) return 7.0;
    const totalVol = Math.max(0.1, waterAddedMl + naohAddedMl);
    const cBase = (naohMolarity * naohAddedMl) / totalVol;
    const oh = (cBase + Math.sqrt(cBase * cBase + 4 * KW)) / 2;
    return Number((14 + Math.log10(oh)).toFixed(2));
  }

  const mmolH = hclMolarity * hclVolumeMl;
  const mmolOH = naohMolarity * naohAddedMl;
  const totalVolumeMl = Math.max(0.1, hclVolumeMl + waterAddedMl + naohAddedMl);
  const delta = (mmolH - mmolOH) / totalVolumeMl; // excess [H+] in mol/L if > 0

  let hPlus: number;
  if (delta >= 0) {
    hPlus = (delta + Math.sqrt(delta * delta + 4 * KW)) / 2;
  } else {
    const excessOH = -delta;
    const ohMinus = (excessOH + Math.sqrt(excessOH * excessOH + 4 * KW)) / 2;
    hPlus = KW / ohMinus;
  }

  const ph = -Math.log10(Math.max(hPlus, 1e-15));
  return Number(Math.min(14, Math.max(0, ph)).toFixed(2));
}

/**
 * Returns the exact equivalence volume (mL of NaOH required to neutralize HCl).
 */
export function getEquivalenceVolume(
  hclMolarity: number,
  hclVolumeMl = HCL_PIPETTE_VOLUME,
  naohMolarity = STANDARD_NAOH_MOLARITY,
): number {
  return (hclMolarity * hclVolumeMl) / naohMolarity;
}

/**
 * Phenolphthalein indicator color transition:
 * - pH < 8.2: colorless (clear aqueous)
 * - 8.2 <= pH <= 10.0: pale pink transitioning to deep magenta
 * - pH > 10.0: deep magenta-pink
 */
export function getSolutionColorState(
  pH: number,
  indicatorAdded: boolean,
  hasHcl: boolean,
  pinkFlashIntensity = 0,
): {
  hex: number;
  cssColor: string;
  opacity: number;
  labelKey: 'empty' | 'colorless' | 'transient_pink' | 'pale_pink' | 'deep_pink';
} {
  if (!hasHcl) {
    return {
      hex: 0xe0f2fe,
      cssColor: '#e0f2fe',
      opacity: 0.15,
      labelKey: 'empty',
    };
  }

  if (!indicatorAdded) {
    return {
      hex: 0xdbeafe,
      cssColor: '#eff6ff',
      opacity: 0.28,
      labelKey: 'colorless',
    };
  }

  // Transient swirl flash right near endpoint before permanent pink
  if (pH < 8.2) {
    if (pinkFlashIntensity > 0.08) {
      const f = Math.min(1, pinkFlashIntensity);
      const r = Math.round(219 + (244 - 219) * f);
      const g = Math.round(234 + (114 - 234) * f);
      const b = Math.round(254 + (182 - 254) * f);
      const hex = (r << 16) | (g << 8) | b;
      return {
        hex,
        cssColor: `rgb(${r}, ${g}, ${b})`,
        opacity: 0.3 + f * 0.25,
        labelKey: 'transient_pink',
      };
    }
    return {
      hex: 0xdbeafe,
      cssColor: '#eff6ff',
      opacity: 0.28,
      labelKey: 'colorless',
    };
  }

  // Permanent pale pink endpoint: pH 8.2 to 9.4
  if (pH <= 9.4) {
    const t = Math.min(1, Math.max(0, (pH - 8.2) / 1.2));
    // Soft pale pink (#fbcfe8) -> medium rose pink (#f472b6)
    const r = Math.round(251 + (244 - 251) * t);
    const g = Math.round(207 + (114 - 207) * t);
    const b = Math.round(232 + (182 - 232) * t);
    const hex = (r << 16) | (g << 8) | b;
    return {
      hex,
      cssColor: `rgb(${r}, ${g}, ${b})`,
      opacity: 0.48 + t * 0.14,
      labelKey: 'pale_pink',
    };
  }

  // Overshot: deep magenta-pink
  const t = Math.min(1, (pH - 9.4) / 2.0);
  const r = Math.round(244 + (219 - 244) * t);
  const g = Math.round(114 + (39 - 114) * t);
  const b = Math.round(182 + (119 - 182) * t);
  const hex = (r << 16) | (g << 8) | b;
  return {
    hex,
    cssColor: `rgb(${r}, ${g}, ${b})`,
    opacity: 0.65 + t * 0.15,
    labelKey: 'deep_pink',
  };
}

/**
 * Generates theoretical titration curve points for comparison or plotting.
 */
export function generateTheoreticalCurve(
  hclMolarity: number,
  maxVol = 25,
): { volumeAdded: number; pH: number }[] {
  const pts: { volumeAdded: number; pH: number }[] = [];
  const eq = getEquivalenceVolume(hclMolarity);
  for (let v = 0; v <= maxVol; v += 0.5) {
    pts.push({
      volumeAdded: Number(v.toFixed(2)),
      pH: calculateTitrationPh(hclMolarity, HCL_PIPETTE_VOLUME, STANDARD_NAOH_MOLARITY, v),
    });
  }
  // Ensure sharp points right around equivalence
  const sharpOffsets = [-0.2, -0.05, 0, 0.05, 0.2];
  for (const off of sharpOffsets) {
    const v = Number((eq + off).toFixed(2));
    if (v >= 0 && v <= maxVol) {
      pts.push({
        volumeAdded: v,
        pH: calculateTitrationPh(hclMolarity, HCL_PIPETTE_VOLUME, STANDARD_NAOH_MOLARITY, v),
      });
    }
  }
  return pts.sort((a, b) => a.volumeAdded - b.volumeAdded);
}

/**
 * Computes concordant volume from Trial I, II, III (excluding Rough).
 */
export function computeConcordantVolume(trials: TrialRecord[]): number | null {
  const valid = trials
    .filter((t) => t.trialName !== 'Rough')
    .map((t) => parseFloat(t.volumeUsed))
    .filter((n) => !Number.isNaN(n) && n > 0);

  if (valid.length === 0) {
    const rough = parseFloat(trials.find((t) => t.trialName === 'Rough')?.volumeUsed || '');
    return !Number.isNaN(rough) && rough > 0 ? Number(rough.toFixed(2)) : null;
  }

  // Look for two readings within 0.2 mL
  for (let i = 0; i < valid.length; i++) {
    for (let j = i + 1; j < valid.length; j++) {
      if (Math.abs(valid[i] - valid[j]) <= 0.25) {
        return Number(((valid[i] + valid[j]) / 2).toFixed(2));
      }
    }
  }

  // Fallback: average of recorded precise trials
  const sum = valid.reduce((acc, v) => acc + v, 0);
  return Number((sum / valid.length).toFixed(2));
}

export function createInitialLabState(unknownMolarity = 0.12): LabSimulationState {
  return {
    unknownHclMolarity: unknownMolarity,
    standardNaohMolarity: STANDARD_NAOH_MOLARITY,
    hclTransferred: false,
    hclPipetteVolume: HCL_PIPETTE_VOLUME,
    buretteRinsed: false,
    buretteFilled: false,
    initialReadingRecorded: false,
    indicatorAdded: false,
    indicatorDrops: 0,
    flaskUnderBurette: false,
    distilledWaterAddedMl: 0,
    buretteReadingMl: 50.0, // empty before filling
    initialBuretteReadingMl: 0.0,
    volumeAddedMl: 0.0,
    tapSpeed: 'closed',
    currentPh: 7.0,
    pinkFlashIntensity: 0,
    isEndpointReached: false,
    isOvershot: false,
    currentStep: 1,
    completedSteps: [],
    activeTrial: 'Rough',
    swirlTriggerCount: 0,
    washSquirtCount: 0,
    curveHistory: [],
  };
}
