import { Language } from '../types/lab';

export interface LearningContent {
  title: string;
  aim: { heading: string; text: string };
  apparatus: { heading: string; items: { name: string; detail: string }[] };
  chemicals: { heading: string; items: { name: string; role: string }[] };
  theory: { heading: string; paragraphs: string[]; keyPoints: string[] };
  procedure: { heading: string; steps: string[] };
  equation: { heading: string; balanced: string; ionic: string; explanation: string };
  precautions: { heading: string; items: string[] };
  vivaQuestions: { heading: string; qa: { q: string; a: string }[] };
}

export const LEARNING_DATA: Record<Language, LearningContent> = {
  en: {
    title: 'Determination of the Concentration of Hydrochloric Acid using Standard Sodium Hydroxide Solution',
    aim: {
      heading: '1. Aim of the Experiment',
      text: 'To determine the unknown molarity (concentration) and strength of a given Hydrochloric Acid (HCl) solution by titrating it against a standard 0.10 M Sodium Hydroxide (NaOH) solution using phenolphthalein as an indicator.',
    },
    apparatus: {
      heading: '2. Apparatus Required',
      items: [
        { name: '50 mL Burette', detail: 'Graduated glass tube with stopcock to deliver standard NaOH accurately to 0.05–0.1 mL.' },
        { name: '10 mL Volumetric Pipette', detail: 'Calibrated glass pipette to measure and transfer exactly 10.0 mL of unknown HCl.' },
        { name: '250 mL Conical Flask', detail: 'Reaction vessel whose slanted sides permit brisk swirling without spilling.' },
        { name: 'Retort Stand & Burette Clamp', detail: 'Holds the burette strictly vertical to prevent parallax reading errors.' },
        { name: 'White Porcelain Tile', detail: 'Reflective white backdrop placed beneath the flask to detect the faintest pale pink hue.' },
        { name: 'Glass Funnel & 100 mL Beaker', detail: 'Used for safely filling the burette and holding analyte HCl for pipetting.' },
        { name: 'Wash Bottle & Digital pH Meter', detail: 'Provides distilled water for rinsing and tracks continuous electrochemical pH.' },
      ],
    },
    chemicals: {
      heading: '3. Chemicals Required',
      items: [
        { name: 'Standard 0.10 M NaOH Solution', role: 'Strong base titrant placed in the burette.' },
        { name: 'Hydrochloric Acid (HCl) — Unknown M', role: 'Strong acid analyte pipetted (10.0 mL) into the conical flask.' },
        { name: 'Phenolphthalein Indicator', role: 'Weak organic acid indicator; colorless in acid (pH < 8.2), pink in base (pH 8.2–10.0).' },
        { name: 'Distilled Water', role: 'For rinsing glassware and washing inner flask walls during titration.' },
      ],
    },
    theory: {
      heading: '4. Scientific Theory',
      paragraphs: [
        'Acid-base titration is a quantitative volumetric analysis method based on complete neutralisation between an acid and a base. Hydrochloric acid (HCl) is a strong monoprotic acid that completely dissociates into H⁺ (hydronium, H₃O⁺) and Cl⁻ ions in water. Sodium hydroxide (NaOH) is a strong monoacidic base that completely dissociates into Na⁺ and OH⁻ ions.',
        'When NaOH is gradually added to HCl, OH⁻ ions combine with H⁺ ions to form neutral water molecules (H₂O). At the equivalence point, moles of H⁺ equal moles of OH⁻, yielding a neutral NaCl solution at pH 7.00 (25 °C). Because the pH rises steeply from ~3.5 to ~10.5 with a single drop right at equivalence, phenolphthalein (transition range pH 8.2–10.0) turns from colorless to permanent pale pink immediately upon reaching the endpoint.',
      ],
      keyPoints: [
        'Stoichiometric ratio: 1 mole of HCl reacts with exactly 1 mole of NaOH (n₁ = n₂ = 1).',
        'Molarity equation: M₁V₁ = M₂V₂, where M₁ is HCl molarity and M₂ = 0.10 M NaOH.',
        'Adding distilled water to the conical flask dilutes volume but does NOT change total moles of H⁺, so the titre volume V₂ remains unchanged.',
      ],
    },
    procedure: {
      heading: '5. Step-by-Step Procedure',
      steps: [
        'Wash the burette with distilled water and rinse it with a few mL of 0.1 M NaOH solution.',
        'Mount the burette vertically on the retort stand and fill it with 0.1 M NaOH via a funnel, removing air bubbles from the nozzle.',
        'Adjust the lower meniscus to the 0.00 mL mark and record the initial burette reading.',
        'Rinse the 10 mL pipette with HCl and pipette exactly 10.0 mL of unknown HCl into a clean conical flask.',
        'Add 2–3 drops of phenolphthalein indicator to the flask. The solution remains colorless.',
        'Place the conical flask on a white porcelain tile directly below the burette nozzle.',
        'Open the stopcock and run 0.1 M NaOH into the flask while continuously swirling the flask.',
        'As transient pink flashes begin lingering longer, switch to slow drop-by-drop addition.',
        'Stop immediately when a single drop produces a permanent pale pink colour that lasts at least 30 seconds.',
        'Record the final burette reading at eye level using the lower meniscus.',
        'Repeat the titration to obtain at least two concordant readings (within 0.1–0.2 mL) and compute M₁.',
      ],
    },
    equation: {
      heading: '6. Chemical Equation',
      balanced: 'HCl (aq) + NaOH (aq) → NaCl (aq) + H₂O (l)',
      ionic: 'H₃O⁺ (aq) + OH⁻ (aq) → 2 H₂O (l)',
      explanation: 'Na⁺ and Cl⁻ remain dissolved as spectator ions while hydronium and hydroxide ions neutralize into water, releasing heat of neutralisation (ΔH ≈ −57.3 kJ/mol).',
    },
    precautions: {
      heading: '10. Laboratory Precautions',
      items: [
        'Always rinse the burette with the NaOH titrant before filling, and rinse the pipette with the HCl analyte.',
        'Never rinse the conical flask with HCl; wash it only with distilled water so the exact 10.0 mL moles are preserved.',
        'Ensure no air bubble remains trapped inside the burette jet tip below the stopcock.',
        'Remove the glass funnel from the top of the burette before taking the initial reading to prevent trapped drops from falling.',
        'Read the lower meniscus of the colorless NaOH solution strictly at eye level to avoid parallax error.',
        'Swirl the conical flask continuously and add NaOH dropwise near the endpoint to avoid overshooting.',
      ],
    },
    vivaQuestions: {
      heading: '11. Viva-Voce Study Bank',
      qa: [
        {
          q: 'Why is phenolphthalein chosen as the indicator for HCl vs NaOH titration?',
          a: 'In a strong acid–strong base titration, the equivalence point occurs at pH 7.0 with a steep vertical jump from pH 3.5 to 10.5. Phenolphthalein changes sharply from colorless to pink in pH 8.2–10.0, falling squarely on that vertical jump.',
        },
        {
          q: 'Why must the burette be rinsed with NaOH before filling, instead of leaving water inside?',
          a: 'Residual distilled water in the burette would dilute the 0.10 M NaOH standard solution, lowering its effective molarity and causing a falsely high titre reading.',
        },
        {
          q: 'Why is the conical flask NOT rinsed with HCl before pipetting 10 mL into it?',
          a: 'Rinsing the conical flask with HCl would leave extra unmeasured HCl droplets on the glass walls, increasing total moles of acid beyond 10.0 mL and skewing the result.',
        },
        {
          q: 'Does adding distilled water from the wash bottle during titration affect the endpoint volume?',
          a: 'No. Distilled water changes the total volume and shifts initial pH slightly toward 7, but it does not change the number of moles of H⁺ ions present in the flask.',
        },
        {
          q: 'What is a concordant reading?',
          a: 'Two or more successive precise trial titre volumes that agree closely within ±0.1 mL (or ±0.2 mL in school labs), ensuring experimental repeatability.',
        },
      ],
    },
  },
  ta: {
    title: '0.1 M NaOH திட்டக் கரைசலைக் கொண்டு HCl அமிலத்தின் செறிவைக் கண்டறிதல்',
    aim: {
      heading: '1. ஆய்வின் நோக்கம்',
      text: 'பினாப்தலீன் நிறங்காட்டியைப் பயன்படுத்தி 0.10 M சோடியம் ஹைட்ராக்சைடு (NaOH) திட்டக் கரைசலுடன் தரம்பார்த்து, கொடுக்கப்பட்ட ஹைட்ரோகுளோரிக் அமிலத்தின் (HCl) அறியாத மோலாரிட்டி (செறிவு) மற்றும் வலிமையைக் கண்டறிதல்.',
    },
    apparatus: {
      heading: '2. தேவையான உபகரணங்கள்',
      items: [
        { name: '50 mL பியூரெட்', detail: '0.1 M NaOH கரைசலைத் துல்லியமாகச் சொட்டு சொட்டாகச் சேர்க்கப் பயன்படும் அளவுக் குழாய்.' },
        { name: '10 mL பிப்பெட்', detail: 'சரியாக 10.0 mL HCl அமிலத்தை அளந்தெடுக்கப் பயன்படும் கண்ணாடிக் குழாய்.' },
        { name: '250 mL கூம்புக் குடுவை', detail: 'தரம்பார்த்தல் வினை நடைபெறும் குடுவை; சிந்தாமல் சுழற்ற உதவுகிறது.' },
        { name: 'தாங்கி & கவ்வி', detail: 'பியூரெட்டைச் செங்குத்தாக நிலைநிறுத்த உதவுகிறது.' },
        { name: 'வெள்ளை பீங்கான் ஓடு', detail: 'வெளிர் இளஞ்சிவப்பு நிற மாற்றத்தைத் தெளிவாகக் காண உதவுகிறது.' },
        { name: 'புனல் & 100 mL பீக்கர்', detail: 'பியூரெட்டில் NaOH நிரப்பவும் HCl கரைசலை வைத்திருக்கவும் பயன்படுகிறது.' },
        { name: 'கழுவும் பாட்டில் & டிஜிட்டல் pH மீட்டர்', detail: 'காய்ச்சி வடித்த நீர் வழங்கவும் நேரடி pH மதிப்பைக் காட்டவும் உதவுகிறது.' },
      ],
    },
    chemicals: {
      heading: '3. தேவையான வேதிப்பொருட்கள்',
      items: [
        { name: 'திட்ட 0.10 M NaOH கரைசல்', role: 'பியூரெட்டில் எடுத்துக்கொள்ளப்படும் வலிமை மிகு காரம்.' },
        { name: 'ஹைட்ரோகுளோரிக் அமிலம் (HCl)', role: 'கூம்புக் குடுவையில் 10.0 mL எடுக்கப்படும் வலிமை மிகு அமிலம்.' },
        { name: 'பினாப்தலீன் நிறங்காட்டி', role: 'அமிலத்தில் நிறமற்றது (pH < 8.2); காரத்தில் இளஞ்சிவப்பு (pH 8.2–10.0).' },
        { name: 'காய்ச்சி வடித்த நீர்', role: 'உபகரணங்களைக் கழுவப் பயன்படும் தூய நீர்.' },
      ],
    },
    theory: {
      heading: '4. தத்துவம்',
      paragraphs: [
        'அமில-கார தரம்பார்த்தல் என்பது அமிலமும் காரமும் முழுமையாக நடுநிலையாக்கப்படும் அளவியல் பகுப்பாய்வு முறையாகும். HCl ஒரு வலிமை மிகு அமிலம்; NaOH ஒரு வலிமை மிகு காரம். இவை இரண்டும் நீரில் முழுமையாக அயனியாக்கம் அடைகின்றன.',
        'NaOH சேர்க்கப்படும்போது OH⁻ அயனிகள் H⁺ அயனிகளுடன் சேர்ந்து நடுநிலை நீர் மூலக்கூறுகளை (H₂O) உருவாக்குகின்றன. சமநிலை புள்ளியில் pH 7.00 ஆகும். இந்தப் புள்ளியில் ஒரு சொட்டு NaOH சேர்த்தவுடன் pH மதிப்பு 3.5-லிருந்து 10.5-க்கு வேகமாக உயரும். எனவே பினாப்தலீன் நிறங்காட்டி நிறமற்ற நிலையிலிருந்து நிலையான வெளிர் இளஞ்சிவப்பு நிறமாக மாறுகிறது.',
      ],
      keyPoints: [
        'வேதி வினை விகிதம்: 1 மோல் HCl, 1 மோல் NaOH உடன் வினைபுரிகிறது.',
        'மோலாரிட்டி சமன்பாடு: M₁V₁ = M₂V₂ (M₂ = 0.10 M NaOH, V₁ = 10.0 mL HCl).',
        'குடுவையில் காய்ச்சி வடித்த நீர் சேர்ப்பதால் H⁺ மோல்களின் எண்ணிக்கை மாறாது; எனவே இறுதி அளவு V₂ மாறாது.',
      ],
    },
    procedure: {
      heading: '5. செய்முறை',
      steps: [
        'பியூரெட்டைக் காய்ச்சி வடித்த நீராலும் பின்னர் சிறிதளவு 0.1 M NaOH கரைசலாலும் கழுவவும்.',
        'புனலைப் பயன்படுத்தி 0.1 M NaOH கரைசலை 0.00 mL சுழி குறியீடு வரை நிரப்பவும்.',
        'கீழ் மட்டக்குழியைப் பார்த்து தொடக்க பியூரெட் அளவைப் பதிவு செய்யவும்.',
        'பிப்பெட் உதவியுடன் 10.0 mL அறியாத HCl அமிலத்தைக் கூம்புக் குடுவையில் ஊற்றவும்.',
        'குடுவையில் 2–3 சொட்டு பினாப்தலீன் நிறங்காட்டி சேர்க்கவும் (நிறமற்றதாக இருக்கும்).',
        'குடுவையை பியூரெட்டுக்குக் கீழே வெள்ளை ஓட்டின் மீது வைக்கவும்.',
        'குழாயைத் திறந்து NaOH கரைசலைச் சொட்டு சொட்டாகச் சேர்த்து குடுவையைச் சுழற்றவும்.',
        'இளஞ்சிவப்பு நிறம் தோன்றி மறையும்போது ஒரு சொட்டாகச் சேர்க்கவும்.',
        'நிலையான வெளிர் இளஞ்சிவப்பு நிறம் தோன்றியவுடன் குழாயை மூடவும்.',
        'இறுதி பியூரெட் அளவைப் படித்து அட்டவணையில் சேமிக்கவும்.',
        'இரு ஒத்திசைந்த அளவுகளைப் பெற்று M₁V₁ = M₂V₂ மூலம் HCl செறிவைக் கணக்கிடவும்.',
      ],
    },
    equation: {
      heading: '6. வேதிச் சமன்பாடு',
      balanced: 'HCl (aq) + NaOH (aq) → NaCl (aq) + H₂O (l)',
      ionic: 'H₃O⁺ (aq) + OH⁻ (aq) → 2 H₂O (l)',
      explanation: 'Na⁺ மற்றும் Cl⁻ பார்வையாளர் அயனிகளாகக் கரைசலில் இருக்க, H₃O⁺ மற்றும் OH⁻ அயனிகள் இணைந்து நடுநிலை நீரை உருவாக்குகின்றன.',
    },
    precautions: {
      heading: '10. முன்னெச்சரிக்கைகள்',
      items: [
        'பியூரெட்டை NaOH கொண்டும் பிப்பெட்டை HCl கொண்டும் கழுவ வேண்டும்.',
        'கூம்புக் குடுவையை ஒருபோதும் HCl கொண்டு கழுவக் கூடாது; காய்ச்சி வடித்த நீரால் மட்டுமே கழுவ வேண்டும்.',
        'பியூரெட் முனையில் காற்றுக் குமிழ்கள் இல்லாமல் பார்த்துக் கொள்ளவும்.',
        'அளவெடுக்கும் முன் பியூரெட் மேலுள்ள புனலை அகற்றவும்.',
        'கீழ் மட்டக்குழியைச் சரியாகக் கண் மட்டத்தில் பார்க்கவும்.',
      ],
    },
    vivaQuestions: {
      heading: '11. வாய்மொழி வினா-விடை',
      qa: [
        {
          q: 'HCl vs NaOH தரம்பார்த்தலில் பினாப்தலீன் ஏன் பயன்படுத்தப்படுகிறது?',
          a: 'வலிமை மிகு அமிலம் – வலிமை மிகு காரம் தரம்பார்த்தலில் இறுதி நிலையில் pH 3.5 முதல் 10.5 வரை வேகமாக உயரும். பினாப்தலீன் நிற மாற்ற வரம்பு (pH 8.2–10.0) இதற்குள் வருவதால் தெளிவான இறுதி நிலை கிடைக்கிறது.',
        },
        {
          q: 'பியூரெட்டை NaOH கொண்டு ஏன் கழுவ வேண்டும்?',
          a: 'தண்ணீர் துளிகள் இருந்தால் NaOH கரைசல் நீர்த்துப் போய் அதன் செறிவு குறையும். அதைத் தவிர்க்க NaOH கொண்டு கழுவ வேண்டும்.',
        },
        {
          q: 'ஒத்திசைந்த அளவு (Concordant reading) என்றால் என்ன?',
          a: 'தொடர்ந்து எடுக்கப்படும் சோதனைகளில் ±0.1 முதல் ±0.2 mL வேறுபாட்டுக்குள் ஒரே மாதிரியாகக் கிடைக்கும் துல்லியமான அளவுகளாகும்.',
        },
      ],
    },
  },
};
