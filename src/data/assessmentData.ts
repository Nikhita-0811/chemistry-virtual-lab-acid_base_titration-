import { Language } from '../types/lab';

export interface McqQuestion {
  id: string;
  question: Record<Language, string>;
  options: Record<Language, string[]>;
  correctIndex: number;
  explanation: Record<Language, string>;
}

export interface FillBlankQuestion {
  id: string;
  prompt: Record<Language, string>;
  acceptedAnswers: string[];
  displayAnswer: string;
  explanation: Record<Language, string>;
}

export interface ApplicationQuestion {
  id: string;
  question: Record<Language, string>;
  options: Record<Language, string[]>;
  correctIndex: number;
  explanation: Record<Language, string>;
}

export interface VivaEvalQuestion {
  id: string;
  question: Record<Language, string>;
  keywords: string[];
  modelAnswer: Record<Language, string>;
}

export const MCQ_QUESTIONS: McqQuestion[] = [
  {
    id: 'mcq1',
    question: {
      en: 'What is the colour of phenolphthalein indicator in an acidic HCl solution?',
      ta: 'அமில HCl கரைசலில் பினாப்தலீன் நிறங்காட்டியின் நிறம் என்ன?',
    },
    options: {
      en: ['Colorless', 'Deep Pink', 'Yellow', 'Blue'],
      ta: ['நிறமற்றது', 'அடர் இளஞ்சிவப்பு', 'மஞ்சள்', 'நீலம்'],
    },
    correctIndex: 0,
    explanation: {
      en: 'Phenolphthalein remains colorless below pH 8.2 in acidic and neutral media.',
      ta: 'pH 8.2-க்கு கீழ் அமில மற்றும் நடுநிலை கரைசல்களில் பினாப்தலீன் நிறமற்றதாக இருக்கும்.',
    },
  },
  {
    id: 'mcq2',
    question: {
      en: 'Which meniscus should be read for a colorless 0.1 M NaOH solution in a burette?',
      ta: 'பியூரெட்டில் உள்ள நிறமற்ற 0.1 M NaOH கரைசலுக்கு எந்த மட்டக்குழியைப் பார்க்க வேண்டும்?',
    },
    options: {
      en: ['Upper meniscus', 'Lower meniscus', 'Middle curve', 'Outer glass edge'],
      ta: ['மேல் மட்டக்குழி', 'கீழ் மட்டக்குழி', 'நடு வளைவு', 'வெளி விளிம்பு'],
    },
    correctIndex: 1,
    explanation: {
      en: 'For transparent or colorless aqueous solutions, the lower meniscus is read at eye level.',
      ta: 'நிறமற்ற தெளிவான கரைசல்களுக்குக் கீழ் மட்டக்குழியைக் கண் மட்டத்தில் படிக்க வேண்டும்.',
    },
  },
  {
    id: 'mcq3',
    question: {
      en: 'What is the exact pH at the equivalence point when 10 mL of HCl is completely neutralised by NaOH?',
      ta: '10 mL HCl முழுமையாக NaOH-ஆல் நடுநிலையாக்கப்படும்போது சமநிலை புள்ளியில் pH மதிப்பு என்ன?',
    },
    options: {
      en: ['1.00', '5.50', '7.00', '8.50'],
      ta: ['1.00', '5.50', '7.00', '8.50'],
    },
    correctIndex: 2,
    explanation: {
      en: 'Strong acid + strong base produces neutral NaCl and H₂O, giving pH = 7.00 at 25 °C.',
      ta: 'வலிமை மிகு அமிலம் + வலிமை மிகு காரம் நடுநிலை NaCl மற்றும் H₂O தருவதால் pH = 7.00 ஆகும்.',
    },
  },
  {
    id: 'mcq4',
    question: {
      en: 'Which solution is used to rinse the burette before filling it with standard 0.1 M NaOH?',
      ta: '0.1 M NaOH நிரப்புவதற்கு முன் பியூரெட்டை எந்தக் கரைசலால் கழுவ வேண்டும்?',
    },
    options: {
      en: ['Unknown HCl', '0.1 M NaOH', 'Phenolphthalein', 'Tap water'],
      ta: ['அறியாத HCl', '0.1 M NaOH', 'பினாப்தலீன்', 'குழாய் நீர்'],
    },
    correctIndex: 1,
    explanation: {
      en: 'Rinsing with the titrant (0.1 M NaOH) prevents dilution of the standard solution by residual water.',
      ta: 'தண்ணீர் எச்சம் NaOH கரைசலை நீர்த்துப் போகச் செய்வதைத் தவிர்க்க 0.1 M NaOH கொண்டு கழுவ வேண்டும்.',
    },
  },
  {
    id: 'mcq5',
    question: {
      en: 'Why is a white porcelain tile placed underneath the conical flask during titration?',
      ta: 'தரம்பார்த்தலின்போது கூம்புக் குடுவைக்குக் கீழே வெள்ளை ஓடு ஏன் வைக்கப்படுகிறது?',
    },
    options: {
      en: [
        'To heat the conical flask',
        'To clearly observe the faint pale pink endpoint',
        'To increase reaction rate',
        'To hold the burette stand',
      ],
      ta: [
        'குடுவையை சூடாக்க',
        'வெளிர் இளஞ்சிவப்பு இறுதி நிலையைத் தெளிவாகக் காண',
        'வினை வேகத்தை அதிகரிக்க',
        'பியூரெட் தாங்கியை நிறுத்த',
      ],
    },
    correctIndex: 1,
    explanation: {
      en: 'The white surface provides high visual contrast to spot the very first permanent pale pink tint.',
      ta: 'வெள்ளை நிறம் முதல் வெளிர் இளஞ்சிவப்பு நிற மாற்றத்தைத் துல்லியமாகக் காண உதவுகிறது.',
    },
  },
  {
    id: 'mcq6',
    question: {
      en: 'What is the balanced chemical equation for the reaction between HCl and NaOH?',
      ta: 'HCl மற்றும் NaOH இடையேயான சமன் செய்யப்பட்ட வேதிச் சமன்பாடு எது?',
    },
    options: {
      en: [
        'HCl + NaOH → NaCl + H₂O',
        '2HCl + NaOH → NaCl₂ + H₂O',
        'HCl + 2NaOH → Na₂Cl + H₂O',
        'HCl + NaOH → NaH + ClOH',
      ],
      ta: [
        'HCl + NaOH → NaCl + H₂O',
        '2HCl + NaOH → NaCl₂ + H₂O',
        'HCl + 2NaOH → Na₂Cl + H₂O',
        'HCl + NaOH → NaH + ClOH',
      ],
    },
    correctIndex: 0,
    explanation: {
      en: 'One mole of monoprotic HCl reacts 1:1 with one mole of NaOH to form sodium chloride and water.',
      ta: '1 மோல் HCl, 1 மோல் NaOH உடன் 1:1 விகிதத்தில் வினைபுரிந்து NaCl மற்றும் H₂O தருகிறது.',
    },
  },
  {
    id: 'mcq7',
    question: {
      en: 'Which apparatus transfers exactly 10.0 mL of unknown HCl into the conical flask?',
      ta: 'சரியாக 10.0 mL HCl அமிலத்தைக் கூம்புக் குடுவைக்கு மாற்றப் பயன்படும் கருவி எது?',
    },
    options: {
      en: ['100 mL Beaker', '10 mL Volumetric Pipette', 'Glass Funnel', 'Wash Bottle'],
      ta: ['100 mL பீக்கர்', '10 mL பிப்பெட்', 'கண்ணாடிப் புனல்', 'கழுவும் பாட்டில்'],
    },
    correctIndex: 1,
    explanation: {
      en: 'A 10 mL volumetric pipette is calibrated to deliver an exact fixed volume of 10.0 mL.',
      ta: '10 mL பிப்பெட் சரியான 10.0 mL கன அளவைத் துல்லியமாக மாற்ற வடிவமைக்கப்பட்டுள்ளது.',
    },
  },
  {
    id: 'mcq8',
    question: {
      en: 'At what pH range does phenolphthalein change from colorless to pink?',
      ta: 'பினாப்தலீன் நிறமற்றதிலிருந்து இளஞ்சிவப்பாக மாறும் pH வரம்பு என்ன?',
    },
    options: {
      en: ['pH 3.1 – 4.4', 'pH 4.5 – 6.0', 'pH 8.2 – 10.0', 'pH 12.0 – 13.5'],
      ta: ['pH 3.1 – 4.4', 'pH 4.5 – 6.0', 'pH 8.2 – 10.0', 'pH 12.0 – 13.5'],
    },
    correctIndex: 2,
    explanation: {
      en: 'Phenolphthalein transitions between pH 8.2 (colorless) and pH 10.0 (pink/magenta).',
      ta: 'பினாப்தலீன் pH 8.2 முதல் 10.0 வரை நிற மாற்றம் அடைகிறது.',
    },
  },
  {
    id: 'mcq9',
    question: {
      en: 'Which ions act as spectator ions in the HCl + NaOH neutralisation reaction?',
      ta: 'HCl + NaOH நடுநிலையாக்கல் வினையில் பார்வையாளர் அயனிகள் எவை?',
    },
    options: {
      en: ['H⁺ and OH⁻', 'Na⁺ and Cl⁻', 'H⁺ and Cl⁻', 'Na⁺ and OH⁻'],
      ta: ['H⁺ மற்றும் OH⁻', 'Na⁺ மற்றும் Cl⁻', 'H⁺ மற்றும் Cl⁻', 'Na⁺ மற்றும் OH⁻'],
    },
    correctIndex: 1,
    explanation: {
      en: 'Na⁺ and Cl⁻ remain unchanged as dissolved ions in solution while H⁺ and OH⁻ form water.',
      ta: 'H⁺ மற்றும் OH⁻ நீர் உருவாக்க, Na⁺ மற்றும் Cl⁻ மாற்றமின்றி கரைசலில் உள்ளன.',
    },
  },
  {
    id: 'mcq10',
    question: {
      en: 'What happens if the conical flask turns deep magenta-pink instead of pale pink?',
      ta: 'குடுவையில் வெளிர் இளஞ்சிவப்புக்குப் பதிலாக அடர் இளஞ்சிவப்பு தோன்றினால் என்ன அர்த்தம்?',
    },
    options: {
      en: [
        'More HCl is needed',
        'The endpoint has been overshot with excess NaOH',
        'The indicator expired',
        'Neutralisation has not started',
      ],
      ta: [
        'இன்னும் HCl தேவை',
        'அதிக NaOH சேர்க்கப்பட்டு இறுதி நிலை கடந்துவிட்டது',
        'நிறங்காட்டி கெட்டுவிட்டது',
        'வினை தொடங்கவில்லை',
      ],
    },
    correctIndex: 1,
    explanation: {
      en: 'Deep magenta indicates excess OH⁻ (pH > 9.5), meaning too much NaOH was added past the endpoint.',
      ta: 'அடர் இளஞ்சிவப்பு மிகையான NaOH சேர்க்கப்பட்டதைக் குறிக்கிறது.',
    },
  },
];

export const FILL_QUESTIONS: FillBlankQuestion[] = [
  {
    id: 'fill1',
    prompt: {
      en: 'The standard molarity equation used to calculate unknown HCl concentration is ________.',
      ta: 'அறியாத HCl செறிவைக் கணக்கிடப் பயன்படும் சமன்பாடு ________ ஆகும்.',
    },
    acceptedAnswers: ['m1v1=m2v2', 'm1v1 = m2v2', 'm1*v1=m2*v2'],
    displayAnswer: 'M₁V₁ = M₂V₂',
    explanation: {
      en: 'For a 1:1 acid-base reaction, M₁V₁ = M₂V₂ equates moles of acid and base.',
      ta: '1:1 அமில-கார வினைக்கு M₁V₁ = M₂V₂ பயன்படுகிறது.',
    },
  },
  {
    id: 'fill2',
    prompt: {
      en: 'The indicator used in this HCl vs NaOH titration is ________.',
      ta: 'இந்த HCl மற்றும் NaOH தரம்பார்த்தலில் பயன்படுத்தப்படும் நிறங்காட்டி ________ ஆகும்.',
    },
    acceptedAnswers: ['phenolphthalein', 'பினாப்தலீன்'],
    displayAnswer: 'Phenolphthalein',
    explanation: {
      en: 'Phenolphthalein provides a sharp colorless-to-pale-pink transition at the endpoint.',
      ta: 'பினாப்தலீன் இறுதி நிலையில் தெளிவான வெளிர் இளஞ்சிவப்பு நிறத்தைத் தருகிறது.',
    },
  },
  {
    id: 'fill3',
    prompt: {
      en: 'The salt formed when Hydrochloric acid neutralises Sodium hydroxide is ________ (chemical formula).',
      ta: 'ஹைட்ரோகுளோரிக் அமிலம் சோடியம் ஹைட்ராக்சைடுடன் வினைபுரிந்து உருவாகும் உப்பின் வாய்ப்பாடு ________.',
    },
    acceptedAnswers: ['nacl', 'sodium chloride', 'சோடியம் குளோரைடு'],
    displayAnswer: 'NaCl',
    explanation: {
      en: 'HCl + NaOH → NaCl + H₂O produces Sodium Chloride (NaCl) and water.',
      ta: 'HCl + NaOH → NaCl + H₂O மூலம் சோடியம் குளோரைடு (NaCl) உருவாகிறது.',
    },
  },
  {
    id: 'fill4',
    prompt: {
      en: 'The volume of unknown HCl transferred using the volumetric pipette in each trial is ________ mL.',
      ta: 'ஒவ்வொரு சோதனையிலும் பிப்பெட் மூலம் எடுக்கப்படும் HCl அமிலத்தின் கன அளவு ________ mL.',
    },
    acceptedAnswers: ['10', '10.0', '10ml', '10 ml'],
    displayAnswer: '10 mL',
    explanation: {
      en: 'Each titration trial uses exactly 10.0 mL of unknown HCl.',
      ta: 'ஒவ்வொரு சோதனையிலும் 10.0 mL HCl எடுக்கப்படுகிறது.',
    },
  },
  {
    id: 'fill5',
    prompt: {
      en: 'At the exact equivalence point of HCl and NaOH at 25 °C, the pH meter reads ________.',
      ta: '25 °C வெப்பநிலையில் HCl மற்றும் NaOH சமநிலை புள்ளியில் pH மீட்டர் காட்டும் மதிப்பு ________.',
    },
    acceptedAnswers: ['7', '7.0', '7.00'],
    displayAnswer: '7.00',
    explanation: {
      en: 'Complete neutralisation of a strong acid by a strong base gives a neutral pH of 7.00.',
      ta: 'நடுநிலைக் கரைசலின் pH மதிப்பு 7.00 ஆகும்.',
    },
  },
];

export const APPLICATION_QUESTIONS: ApplicationQuestion[] = [
  {
    id: 'app1',
    question: {
      en: 'If 10.0 mL of HCl requires 12.5 mL of 0.10 M NaOH to reach the pale pink endpoint, what is the molarity of HCl?',
      ta: '10.0 mL HCl-ஐ நடுநிலையாக்க 12.5 mL அளவுள்ள 0.10 M NaOH தேவைப்பட்டால், HCl-இன் மோலாரிட்டி என்ன?',
    },
    options: {
      en: ['0.080 M', '0.100 M', '0.125 M', '0.250 M'],
      ta: ['0.080 M', '0.100 M', '0.125 M', '0.250 M'],
    },
    correctIndex: 2,
    explanation: {
      en: 'M₁ = (M₂ × V₂) / V₁ = (0.10 × 12.5) / 10.0 = 0.125 M.',
      ta: 'M₁ = (0.10 × 12.5) / 10.0 = 0.125 M.',
    },
  },
  {
    id: 'app2',
    question: {
      en: 'A student adds 15 mL of distilled water from the wash bottle to the conical flask containing 10 mL HCl before starting titration. How does this affect the volume of 0.1 M NaOH needed?',
      ta: 'தரம்பார்த்தலுக்கு முன் 10 mL HCl உள்ள குடுவையில் 15 mL காய்ச்சி வடித்த நீர் சேர்த்தால் தேவைப்படும் NaOH கன அளவு எவ்வாறு மாறும்?',
    },
    options: {
      en: [
        'Requires 15 mL more NaOH',
        'Requires half as much NaOH',
        'Remains exactly the same',
        'Cannot reach endpoint',
      ],
      ta: [
        '15 mL அதிக NaOH தேவைப்படும்',
        'பாதி அளவு NaOH போதும்',
        'சிறிதும் மாறாது (அதே அளவு)',
        'இறுதி நிலையை அடையாது',
      ],
    },
    correctIndex: 2,
    explanation: {
      en: 'Adding distilled water does not change the number of moles of H⁺ in the flask, so the equivalence volume V₂ stays identical.',
      ta: 'நீர் சேர்ப்பதால் H⁺ மோல்களின் எண்ணிக்கை மாறாததால் தேவைப்படும் NaOH அளவு மாறாது.',
    },
  },
  {
    id: 'app3',
    question: {
      en: 'A student obtains titre readings of: Rough = 14.8 mL, Trial I = 14.2 mL, Trial II = 14.1 mL, Trial III = 14.2 mL. Which concordant value V₂ should be used for calculation?',
      ta: 'ஒரு மாணவர் பெற்ற அளவுகள்: Rough = 14.8, I = 14.2, II = 14.1, III = 14.2 mL. கணக்கீட்டிற்கு எந்த V₂ மதிப்பைப் பயன்படுத்த வேண்டும்?',
    },
    options: {
      en: ['14.8 mL', '14.17 mL (≈ 14.2 mL)', '15.0 mL', '13.5 mL'],
      ta: ['14.8 mL', '14.17 mL (≈ 14.2 mL)', '15.0 mL', '13.5 mL'],
    },
    correctIndex: 1,
    explanation: {
      en: 'The rough trial is excluded from precision averaging; Trials I, II, III are concordant around 14.17–14.2 mL.',
      ta: 'தோராய அளவைத் தவிர்த்து, ஒத்திசைந்த சோதனைகள் I, II, III-இன் சராசரி (~14.2 mL) எடுக்கப்பட வேண்டும்.',
    },
  },
  {
    id: 'app4',
    question: {
      en: 'If an air bubble trapped inside the burette tip escapes during the titration, how will the recorded final reading appear?',
      ta: 'தரம்பார்த்தலின்போது பியூரெட் முனையிலிருந்த காற்றுக் குமிழ் வெளியேறினால் இறுதி அளவு எவ்வாறு தோன்றும்?',
    },
    options: {
      en: [
        'Lower than the true volume',
        'Higher than the true volume of NaOH delivered',
        'Unaffected',
        'Zero mL',
      ],
      ta: [
        'உண்மை அளவை விடக் குறைவாக',
        'உண்மையில் சேர்த்த அளவை விட அதிகமாக',
        'மாற்றமில்லை',
        '0 mL',
      ],
    },
    correctIndex: 1,
    explanation: {
      en: 'Liquid fills the space once occupied by the air bubble, inflating the apparent burette volume drop.',
      ta: 'காற்றுக் குமிழின் இடத்தை NaOH நிரப்புவதால் அளவு உண்மையை விட அதிகமாகக் காட்டும்.',
    },
  },
  {
    id: 'app5',
    question: {
      en: 'If 10.0 mL of 0.15 M HCl is titrated with 0.10 M NaOH, at what burette volume will the solution turn permanent pale pink?',
      ta: '10.0 mL அளவுள்ள 0.15 M HCl-ஐ 0.10 M NaOH உடன் தரம்பார்க்கும்போது எந்தக் கன அளவில் வெளிர் இளஞ்சிவப்பு தோன்றும்?',
    },
    options: {
      en: ['10.0 mL', '12.0 mL', '15.0 mL', '20.0 mL'],
      ta: ['10.0 mL', '12.0 mL', '15.0 mL', '20.0 mL'],
    },
    correctIndex: 2,
    explanation: {
      en: 'V₂ = (M₁ × V₁) / M₂ = (0.15 × 10.0) / 0.10 = 15.0 mL.',
      ta: 'V₂ = (0.15 × 10.0) / 0.10 = 15.0 mL.',
    },
  },
];

export const VIVA_QUESTIONS: VivaEvalQuestion[] = [
  {
    id: 'viva1',
    question: {
      en: 'Why should the glass funnel be removed from the burette before taking the initial reading?',
      ta: 'தொடக்க அளவைப் படிப்பதற்கு முன் பியூரெட்டிலிருந்து புனலை ஏன் அகற்ற வேண்டும்?',
    },
    keywords: ['drop', 'drain', 'fall', 'reading', 'accurate', 'error', 'சொட்டு', 'அளவு'],
    modelAnswer: {
      en: 'Remaining NaOH drops clinging to the funnel stem can slowly drip down into the burette, changing the liquid level and causing a reading error.',
      ta: 'புனலில் ஒட்டியிருக்கும் NaOH சொட்டுகள் கீழே விழுந்து பியூரெட் அளவை மாற்றக்கூடும் என்பதால் அகற்ற வேண்டும்.',
    },
  },
  {
    id: 'viva2',
    question: {
      en: 'Why must the conical flask NOT be rinsed with HCl solution before adding 10 mL HCl?',
      ta: '10 mL HCl சேர்ப்பதற்கு முன் கூம்புக் குடுவையை ஏன் HCl கொண்டு கழுவக் கூடாது?',
    },
    keywords: ['extra', 'mole', 'volume', 'increase', '10', 'error', 'அதிகம்', 'மோல்'],
    modelAnswer: {
      en: 'Rinsing with HCl leaves extra acid droplets inside the flask, increasing the actual volume and moles of HCl above 10.0 mL.',
      ta: 'கழுவினால் கூடுதல் HCl துளிகள் குடுவையில் தங்கி 10 mL-க்கு மேல் அமில அளவை அதிகரித்துவிடும்.',
    },
  },
  {
    id: 'viva3',
    question: {
      en: 'What causes the brief pink colour flashes that disappear upon swirling near the endpoint?',
      ta: 'இறுதி நிலைக்கு அருகில் தோன்றி சுழற்றும்போது மறையும் இளஞ்சிவப்பு நிறத்திற்குக் காரணம் என்ன?',
    },
    keywords: ['local', 'excess', 'oh', 'neutral', 'mix', 'hcl', 'மிகை', 'கல'],
    modelAnswer: {
      en: 'Where each NaOH drop lands, local OH⁻ concentration temporarily exceeds pH 8.2, turning phenolphthalein pink until swirling mixes it with remaining H⁺.',
      ta: 'NaOH சொட்டு விழும் இடத்தில் தற்காலிகமாக pH 8.2-க்கு மேல் உயர்ந்து இளஞ்சிவப்பாக மாறி, சுழற்றும்போது மீதமுள்ள அமிலத்துடன் கலந்து மறைகிறது.',
    },
  },
  {
    id: 'viva4',
    question: {
      en: 'Define "standard solution" in volumetric analysis.',
      ta: 'திட்டக் கரைசல் (Standard solution) என்றால் என்ன?',
    },
    keywords: ['known', 'concentration', 'molarity', 'exact', 'தெரிந்த', 'செறிவு'],
    modelAnswer: {
      en: 'A standard solution is a solution whose exact concentration (molarity) is accurately known, such as 0.10 M NaOH.',
      ta: 'செறிவு (மோலாரிட்டி) துல்லியமாகத் தெரிந்த கரைசல் திட்டக் கரைசல் எனப்படும் (எ.கா. 0.10 M NaOH).',
    },
  },
  {
    id: 'viva5',
    question: {
      en: 'Why do we stop titration at the first permanent pale pink colour instead of deep magenta?',
      ta: 'அடர் இளஞ்சிவப்புக்குப் பதிலாக முதல் நிலையான வெளிர் இளஞ்சிவப்பில் ஏன் நிறுத்த வேண்டும்?',
    },
    keywords: ['endpoint', 'overshoot', 'excess', 'accurate', 'first', 'இறுதி', 'அதிகம்'],
    modelAnswer: {
      en: 'The first faint permanent pale pink occurs right after pH 8.2 (within 1 drop of exact equivalence), whereas deep magenta means excess NaOH was added.',
      ta: 'முதல் வெளிர் இளஞ்சிவப்பு சரியான சமநிலை புள்ளிக்கு மிக அருகில் தோன்றும்; அடர் நிறம் அதிக காரம் சேர்க்கப்பட்டதைக் குறிக்கும்.',
    },
  },
];
