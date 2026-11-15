import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Language } from '../types/lab';
import { calculateTitrationPh, getEquivalenceVolume, HCL_PIPETTE_VOLUME, STANDARD_NAOH_MOLARITY } from '../utils/chemistry';

interface MolecularEquationViewProps {
  language: Language;
  unknownMolarity: number;
  liveVolumeAdded: number;
}

interface IonParticle {
  id: number;
  kind: 'H' | 'Cl' | 'Na' | 'OH' | 'H2O';
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const MolecularEquationView: React.FC<MolecularEquationViewProps> = ({
  language,
  unknownMolarity,
  liveVolumeAdded,
}) => {
  const [syncLive, setSyncLive] = useState(false);
  const [manualVol, setManualVol] = useState(0);
  const [playing, setPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeVol = syncLive ? liveVolumeAdded : manualVol;
  const eqVol = getEquivalenceVolume(unknownMolarity, HCL_PIPETTE_VOLUME, STANDARD_NAOH_MOLARITY);
  const pH = calculateTitrationPh(unknownMolarity, HCL_PIPETTE_VOLUME, STANDARD_NAOH_MOLARITY, activeVol);

  // Compute representative ion counts out of 12 initial HCl pairs
  const totalAcidIons = 12;
  const ratio = activeVol / eqVol;
  const neutralizedCount = Math.min(totalAcidIons, Math.floor(ratio * totalAcidIons));
  const remainingH = Math.max(0, totalAcidIons - neutralizedCount);
  const addedNaCount = Math.min(20, Math.round(ratio * totalAcidIons));
  const excessOH = Math.max(0, addedNaCount - totalAcidIons);
  const isPink = pH >= 8.2;

  useEffect(() => {
    if (!playing || syncLive) return;
    const id = window.setInterval(() => {
      setManualVol((v) => {
        if (v >= 20) {
          setPlaying(false);
          return 20;
        }
        return Number((v + 0.15).toFixed(2));
      });
    }, 90);
    return () => clearInterval(id);
  }, [playing, syncLive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: IonParticle[] = [];
    let nextId = 1;
    const pushKind = (kind: IonParticle['kind'], count: number) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          id: nextId++,
          kind,
          x: 40 + ((nextId * 97) % 560),
          y: 40 + ((nextId * 61) % 240),
          vx: ((nextId % 5) - 2) * 0.45 || 0.4,
          vy: (((nextId * 3) % 5) - 2) * 0.45 || -0.35,
        });
      }
    };

    pushKind('Cl', totalAcidIons);
    pushKind('H', remainingH);
    pushKind('Na', addedNaCount);
    pushKind('OH', excessOH);
    pushKind('H2O', neutralizedCount);

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Solution background tint based on pH
      ctx.fillStyle = isPink ? 'rgba(251, 207, 232, 0.38)' : 'rgba(239, 246, 255, 0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 24 || p.x > canvas.width - 24) p.vx *= -1;
        if (p.y < 24 || p.y > canvas.height - 24) p.vy *= -1;

        ctx.beginPath();
        if (p.kind === 'H') {
          ctx.fillStyle = '#dc2626';
          ctx.arc(p.x, p.y, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = '700 11px "IBM Plex Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('H⁺', p.x, p.y);
        } else if (p.kind === 'OH') {
          ctx.fillStyle = '#0284c7';
          ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = '700 11px "IBM Plex Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('OH⁻', p.x, p.y);
        } else if (p.kind === 'Cl') {
          ctx.fillStyle = '#059669';
          ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = '700 11px "IBM Plex Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Cl⁻', p.x, p.y);
        } else if (p.kind === 'Na') {
          ctx.fillStyle = '#475569';
          ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = '700 11px "IBM Plex Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Na⁺', p.x, p.y);
        } else {
          // Neutral H2O molecule
          ctx.fillStyle = '#e0f2fe';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#0369a1';
          ctx.font = '700 10px "IBM Plex Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('H₂O', p.x, p.y);
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [remainingH, addedNaCount, excessOH, neutralizedCount, isPink]);

  const isTa = language === 'ta';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Balanced Equation Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="text-xs font-semibold text-blue-700">
          {isTa ? 'சமன் செய்யப்பட்ட நடுநிலையாக்கல் வினை' : 'Balanced Neutralisation Reaction'}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 rounded-lg border border-blue-200 bg-blue-50/60 p-5 font-mono text-lg sm:text-2xl font-bold text-slate-900">
          <span className="text-rose-700">HCl (aq)</span>
          <span className="text-slate-400">+</span>
          <span className="text-blue-700">NaOH (aq)</span>
          <span className="text-slate-500">→</span>
          <span className="text-emerald-700">NaCl (aq)</span>
          <span className="text-slate-400">+</span>
          <span className="text-sky-700">H₂O (l)</span>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="font-semibold text-slate-900">
              {isTa ? 'நிகர அயனிச் சமன்பாடு' : 'Net Ionic Equation'}
            </div>
            <div className="font-mono text-base font-semibold text-blue-700 mt-1">
              H₃O⁺ (aq) + OH⁻ (aq) → 2 H₂O (l)
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {isTa
                ? 'அமிலத்திலிருந்து வரும் H⁺ அயனிகள் காரத்திலிருந்து வரும் OH⁻ அயனிகளுடன் இணைந்து நடுநிலை நீர் மூலக்கூறுகளை உருவாக்குகின்றன.'
                : 'Hydronium ions (H⁺) from HCl react stoichiometrically 1:1 with hydroxide ions (OH⁻) from NaOH to form neutral water molecules.'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="font-semibold text-slate-900">
              {isTa ? 'பினாப்தலீன் நிறமாற்ற வேதியியல்' : 'Phenolphthalein Indicator Mechanism'}
            </div>
            <div className="font-mono text-sm font-semibold text-pink-700 mt-1">
              H₂In (colorless, pH &lt; 8.2) ⇌ In²⁻ (pink, pH ≥ 8.2)
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {isTa
                ? 'அனைத்து H⁺ அயனிகளும் நடுநிலையான பிறகு, அடுத்த ஒரு சொட்டு NaOH கரைசலின் pH மதிப்பை 8.2-க்கு மேல் உயர்த்துவதால் நிறங்காட்டி இளஞ்சிவப்பாக மாறுகிறது.'
                : 'Once every H⁺ ion is neutralised, the very next drop of OH⁻ pushes pH past 8.2, converting phenolphthalein into its pink quinonoid dianion (In²⁻).'}
            </p>
          </div>
        </div>
      </div>

      {/* Animated Molecular Chamber */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isTa ? 'அயனி நிலை நேரடி இயங்குபடம்' : 'Animated Molecular Neutralisation Chamber'}
              </h3>
              <p className="text-xs text-slate-500">
                {isTa
                  ? 'NaOH சேர்க்கும்போது H⁺ மற்றும் OH⁻ எவ்வாறு H₂O ஆக மாறுகின்றன என்பதைக் காண்க.'
                  : 'Watch H⁺ and OH⁻ combine into H₂O molecules while Na⁺ and Cl⁻ act as spectator ions.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSyncLive((s) => !s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                  syncLive
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {syncLive
                  ? isTa
                    ? 'ஆய்வக அளவு இணைக்கப்பட்டது'
                    : 'Synced with Live Lab'
                  : isTa
                  ? 'ஆய்வக அளவுடன் இணை'
                  : 'Sync with Live Lab'}
              </button>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={640}
            height={320}
            className="w-full h-72 rounded-lg border border-slate-200"
          />

          {/* Controls */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              disabled={syncLive}
              onClick={() => setPlaying((p) => !p)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-45 cursor-pointer"
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{playing ? (isTa ? 'நிறுத்து' : 'Pause') : isTa ? 'இயக்கு' : 'Animate Titration'}</span>
            </button>
            <button
              type="button"
              disabled={syncLive}
              onClick={() => {
                setPlaying(false);
                setManualVol(0);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-45 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isTa ? 'மீட்டமை' : 'Reset'}</span>
            </button>

            <div className="flex-1 min-w-[200px]">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-600">0.1 M NaOH Added:</span>
                <span className="font-bold text-blue-700">{activeVol.toFixed(2)} mL</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={0.2}
                disabled={syncLive}
                value={activeVol}
                onChange={(e) => setManualVol(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Live Species Count Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-900">
            {isTa ? 'கரைசலில் உள்ள அயனிகள்' : 'Species Inventory in Flask'}
          </h4>

          <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-slate-500">H⁺ (Acidic)</div>
              <div className="text-xl font-bold text-rose-600 mt-0.5">{remainingH}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-slate-500">OH⁻ (Excess Base)</div>
              <div className="text-xl font-bold text-sky-600 mt-0.5">{excessOH}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-slate-500">H₂O Formed</div>
              <div className="text-xl font-bold text-blue-700 mt-0.5">{neutralizedCount}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-slate-500">Na⁺ & Cl⁻ Salt</div>
              <div className="text-xl font-bold text-emerald-700 mt-0.5">
                {addedNaCount} / {totalAcidIons}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Solution pH:</span>
              <span className="font-mono text-base font-bold text-slate-900">{pH.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span
                className="w-4 h-4 rounded border border-slate-300"
                style={{ backgroundColor: isPink ? '#f9a8d4' : '#eff6ff' }}
              />
              <span className="font-semibold text-slate-800">
                {isPink
                  ? isTa
                    ? 'இளஞ்சிவப்பு (பினாப்தலீன் In²⁻)'
                    : 'Pink (Phenolphthalein In²⁻)'
                  : isTa
                  ? 'நிறமற்றது (H₂In)'
                  : 'Colorless (Neutral/Acidic H₂In)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
