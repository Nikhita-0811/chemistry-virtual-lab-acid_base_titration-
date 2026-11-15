import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Droplet,
  RotateCcw,
  Sparkles,
  Waves,
} from 'lucide-react';
import { HoverInfo, TitrationLabScene } from '../three/TitrationLabScene';
import { ApparatusId, CameraPreset, LabSimulationState, Language, TapSpeed } from '../types/lab';
import { TRANSLATIONS } from '../i18n/translations';

interface LabViewport3DProps {
  simState: LabSimulationState;
  language: Language;
  onApparatusClick: (id: ApparatusId) => void;
  onFlaskPlaced: () => void;
  onTapSpeedChange: (speed: TapSpeed) => void;
  onSingleDrop: () => void;
  onSwirlFlask: () => void;
  onWashBottle: () => void;
  onResetTrial: () => void;
}

export const LabViewport3D: React.FC<LabViewport3DProps> = ({
  simState,
  language,
  onApparatusClick,
  onFlaskPlaced,
  onTapSpeedChange,
  onSingleDrop,
  onSwirlFlask,
  onWashBottle,
  onResetTrial,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<TitrationLabScene | null>(null);

  const callbacksRef = useRef({ onApparatusClick, onFlaskPlaced });
  callbacksRef.current = { onApparatusClick, onFlaskPlaced };

  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const labScene = new TitrationLabScene(el, simState, {
      onHoverChange: (info) => setHoverInfo(info),
      onApparatusClick: (id) => callbacksRef.current.onApparatusClick(id),
      onFlaskPlacedUnderBurette: () => callbacksRef.current.onFlaskPlaced(),
    });
    sceneRef.current = labScene;

    return () => {
      labScene.dispose();
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    sceneRef.current?.syncState(simState);
  }, [simState]);

  const handlePreset = (preset: CameraPreset) => {
    setCameraPreset(preset);
    sceneRef.current?.setCameraPreset(preset);
  };

  const handleSingleDropClick = () => {
    sceneRef.current?.triggerSingleDrop();
    onSingleDrop();
  };

  const hoveredTooltip = hoverInfo ? t.apparatus[hoverInfo.apparatusId] : null;
  const tapDisabled = !simState.buretteFilled || !simState.flaskUnderBurette;

  return (
    <div className="relative w-full h-[540px] lg:h-[calc(100vh-140px)] min-h-[520px] rounded-xl border border-slate-200 bg-gradient-to-b from-blue-50 to-slate-100 overflow-hidden select-none">
      {/* Dedicated isolated WebGL mount container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top-left subtle 3D scene hint */}
      <div className="pointer-events-none absolute top-3 left-3 z-10 rounded-lg border border-slate-200 bg-white/95 px-3 py-1.5 text-xs text-slate-700 shadow-sm">
        <span className="font-semibold text-blue-700">
          {t.procedure.stepOf} {simState.currentStep}/11
        </span>
        <span className="mx-2 text-slate-300">|</span>
        <span>{t.procedure.steps[simState.currentStep - 1]?.title}</span>
      </div>

      {/* Interactive 3D Apparatus Hover Tooltip */}
      {hoverInfo && hoveredTooltip && (
        <div
          className="pointer-events-none fixed z-30 max-w-xs rounded-lg border border-blue-200 bg-white px-3 py-2 shadow-lg"
          style={{
            left: Math.min(window.innerWidth - 270, hoverInfo.x + 14),
            top: Math.max(12, hoverInfo.y - 12),
          }}
        >
          <div className="text-xs font-semibold text-blue-700">{hoveredTooltip.name}</div>
          <div className="text-[11px] font-medium text-slate-600 mt-0.5">{hoveredTooltip.role}</div>
          <div className="text-[11px] text-slate-500 mt-1 leading-snug">{hoveredTooltip.usage}</div>
        </div>
      )}

      {/* Collapsible Unified Bottom Control Dock */}
      <div
        className={`absolute left-1/2 bottom-3 z-20 -translate-x-1/2 transition-transform duration-200 w-[95%] max-w-[820px] ${
          dockCollapsed ? 'translate-y-[calc(100%-26px)]' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((v) => !v)}
            className="flex items-center gap-1.5 rounded-t-lg border border-b-0 border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:text-blue-700 shadow-sm cursor-pointer whitespace-nowrap"
          >
            {dockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{dockCollapsed ? t.dock.showControls : t.dock.hideControls}</span>
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Camera Presets */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <Camera className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5 shrink-0" />
              {(
                [
                  ['overview', t.dock.camOverview],
                  ['meniscus', t.dock.camMeniscus],
                  ['flask', t.dock.camFlask],
                  ['phmeter', t.dock.camPh],
                ] as [CameraPreset, string][]
              ).map(([preset, label]) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePreset(preset)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    cameraPreset === preset
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-white hover:text-blue-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Stopcock Control */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <span className="text-[11px] font-medium text-slate-500 px-1.5 whitespace-nowrap">
                {t.dock.tapLabel}:
              </span>
              {(
                [
                  ['closed', t.dock.tapClosed],
                  ['slow', t.dock.tapSlow],
                  ['medium', t.dock.tapMedium],
                  ['fast', t.dock.tapFast],
                ] as [TapSpeed, string][]
              ).map(([speed, label]) => (
                <button
                  key={speed}
                  type="button"
                  disabled={tapDisabled && speed !== 'closed'}
                  onClick={() => onTapSpeedChange(speed)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                    simState.tapSpeed === speed
                      ? speed === 'closed'
                        ? 'bg-slate-800 text-white'
                        : 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Precision Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={tapDisabled}
                onClick={handleSingleDropClick}
                className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0"
              >
                <Droplet className="w-3.5 h-3.5" />
                <span>{t.dock.addDrop}</span>
              </button>

              <button
                type="button"
                disabled={!simState.hclTransferred}
                onClick={onSwirlFlask}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0"
              >
                <Waves className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.dock.swirl}</span>
              </button>

              <button
                type="button"
                disabled={!simState.hclTransferred}
                onClick={onWashBottle}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>{t.dock.washBottle}</span>
              </button>

              <button
                type="button"
                onClick={onResetTrial}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.dock.resetTrial}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
