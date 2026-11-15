import { ApparatusId, Language } from '../types/lab';

export interface StepDefinition {
  step: number;
  title: string;
  instruction: string;
  audioScript: string;
  actionLabel: string;
  hint: string;
}

export interface ApparatusTooltip {
  name: string;
  role: string;
  usage: string;
}

export const TRANSLATIONS: Record<
  Language,
  {
    brand: string;
    nav: {
      lab: string;
      learning: string;
      equation: string;
      assessment: string;
      teacher: string;
    };
    auth: {
      signIn: string;
      signOut: string;
      student: string;
      teacher: string;
      nameLabel: string;
      rollLabel: string;
      classLabel: string;
      teacherCodeLabel: string;
      teacherCodeHint: string;
      submit: string;
      cancel: string;
    };
    toolbar: {
      experimentTitle: string;
      voiceOn: string;
      voiceOff: string;
      newSample: string;
      trialLabel: string;
    };
    dock: {
      hideControls: string;
      showControls: string;
      cameraLabel: string;
      camOverview: string;
      camMeniscus: string;
      camFlask: string;
      camPh: string;
      tapLabel: string;
      tapClosed: string;
      tapSlow: string;
      tapMedium: string;
      tapFast: string;
      addDrop: string;
      swirl: string;
      washBottle: string;
      resetTrial: string;
    };
    telemetry: {
      buretteReading: string;
      volumeAdded: string;
      livePh: string;
      solutionColor: string;
      colorStates: {
        empty: string;
        colorless: string;
        transient_pink: string;
        pale_pink: string;
        deep_pink: string;
      };
      curveTitle: string;
    };
    procedure: {
      heading: string;
      stepOf: string;
      listenStep: string;
      completed: string;
      steps: StepDefinition[];
    };
    observation: {
      heading: string;
      trialCol: string;
      initialCol: string;
      finalCol: string;
      volumeCol: string;
      captureInitial: string;
      captureFinal: string;
      saveTrial: string;
      concordantLabel: string;
      noConcordant: string;
    };
    calculation: {
      heading: string;
      formulaTitle: string;
      v1Label: string;
      m2Label: string;
      v2Label: string;
      m1Label: string;
      enterM1: string;
      checkAnswer: string;
      stepByStep: string;
      accurateMsg: string;
      offMsg: string;
      actualLabel: string;
      errorLabel: string;
    };
    apparatus: Record<ApparatusId, ApparatusTooltip>;
  }
> = {
  en: {
    brand: 'TitraLab 3D',
    nav: {
      lab: 'Virtual Lab',
      learning: 'Learning Hub',
      equation: 'Equation & Ions',
      assessment: 'Assessment',
      teacher: 'Teacher Portal',
    },
    auth: {
      signIn: 'Student Sign In',
      signOut: 'Sign Out',
      student: 'Student',
      teacher: 'Teacher',
      nameLabel: 'Full Name',
      rollLabel: 'Roll Number / Staff ID',
      classLabel: 'Class & Section',
      teacherCodeLabel: 'Teacher Access Code',
      teacherCodeHint: 'Demo passcode: CHEM-TEACHER',
      submit: 'Enter Laboratory',
      cancel: 'Cancel',
    },
    toolbar: {
      experimentTitle: 'Determination of HCl Concentration using Standard 0.1 M NaOH',
      voiceOn: 'Voice Guide On',
      voiceOff: 'Voice Guide Off',
      newSample: 'New Unknown Sample',
      trialLabel: 'Active Trial',
    },
    dock: {
      hideControls: 'Hide Controls',
      showControls: 'Show Controls',
      cameraLabel: 'Camera',
      camOverview: 'Bench Overview',
      camMeniscus: 'Meniscus Zoom',
      camFlask: 'Flask Close-up',
      camPh: 'pH Meter',
      tapLabel: 'Burette Stopcock',
      tapClosed: 'Closed',
      tapSlow: 'Dropwise',
      tapMedium: 'Medium',
      tapFast: 'Fast',
      addDrop: '+1 Drop',
      swirl: 'Swirl Flask',
      washBottle: 'Distilled Water',
      resetTrial: 'Reset Trial',
    },
    telemetry: {
      buretteReading: 'Burette Scale',
      volumeAdded: 'NaOH Added',
      livePh: 'Digital pH',
      solutionColor: 'Flask Solution',
      colorStates: {
        empty: 'Empty Flask',
        colorless: 'Colorless (Acidic)',
        transient_pink: 'Transient Pink Swirl',
        pale_pink: 'Permanent Pale Pink (Endpoint)',
        deep_pink: 'Deep Magenta (Overshot)',
      },
      curveTitle: 'Live Titration Curve (pH vs Volume of NaOH)',
    },
    procedure: {
      heading: 'Experimental Procedure',
      stepOf: 'Step',
      listenStep: 'Listen',
      completed: 'Done',
      steps: [
        {
          step: 1,
          title: 'Rinse the Burette with NaOH',
          instruction: 'Select the 0.1 M NaOH bottle or click "Rinse Burette" to coat the clean burette with standard NaOH.',
          audioScript: 'Step 1: Take the clean burette and rinse its inner walls with a small amount of 0.1 molar sodium hydroxide solution.',
          actionLabel: 'Rinse Burette with NaOH',
          hint: 'Click the 0.1 M NaOH bottle or Burette in 3D, or press the button below.',
        },
        {
          step: 2,
          title: 'Fill Burette with 0.1 M NaOH',
          instruction: 'Place the glass funnel on the burette and fill it with 0.1 M NaOH solution up to the 0.00 mL zero mark.',
          audioScript: 'Step 2: Use the glass funnel to fill the burette with 0.1 molar sodium hydroxide solution up to the zero mark and remove air bubbles.',
          actionLabel: 'Fill Burette to 0.00 mL',
          hint: 'Click the Glass Funnel or press Fill Burette.',
        },
        {
          step: 3,
          title: 'Record Initial Burette Reading',
          instruction: 'Zoom to the burette meniscus and record the initial reading (0.00 mL) in your observation table.',
          audioScript: 'Step 3: Read the lower meniscus at eye level and record the initial burette reading in the observation table.',
          actionLabel: 'Record Initial Reading (0.00 mL)',
          hint: 'Use Meniscus Zoom to verify 0.00 mL, then record it.',
        },
        {
          step: 4,
          title: 'Pipette 10 mL of HCl into Flask',
          instruction: 'Use the 10 mL volumetric pipette to draw unknown HCl from the beaker and transfer it into the conical flask.',
          audioScript: 'Step 4: Use the 10 milliliter volumetric pipette to transfer exactly 10 milliliters of hydrochloric acid into the clean conical flask.',
          actionLabel: 'Pipette 10 mL HCl into Flask',
          hint: 'Click the Volumetric Pipette or HCl Beaker in 3D.',
        },
        {
          step: 5,
          title: 'Add Phenolphthalein Indicator',
          instruction: 'Add 2–3 drops of phenolphthalein indicator from the amber dropper bottle into the conical flask.',
          audioScript: 'Step 5: Add 2 to 3 drops of phenolphthalein indicator into the conical flask. Notice the acidic solution remains colorless.',
          actionLabel: 'Add 3 Drops Phenolphthalein',
          hint: 'Click the Phenolphthalein dropper bottle in 3D.',
        },
        {
          step: 6,
          title: 'Place Flask Under Burette',
          instruction: 'Move the conical flask onto the white porcelain tile directly beneath the burette tip.',
          audioScript: 'Step 6: Place the conical flask on the white porcelain tile directly below the burette nozzle for clear endpoint visibility.',
          actionLabel: 'Place Flask on White Tile',
          hint: 'Click the Conical Flask or White Tile in 3D.',
        },
        {
          step: 7,
          title: 'Open Burette Tap & Titrate',
          instruction: 'Open the burette stopcock to add NaOH drop by drop while swirling the flask gently.',
          audioScript: 'Step 7: Open the burette stopcock slowly to add sodium hydroxide drop by drop while continuously swirling the conical flask.',
          actionLabel: 'Open Stopcock (Dropwise)',
          hint: 'Use the Stopcock controls in the bottom dock or click the tap in 3D.',
        },
        {
          step: 8,
          title: 'Observe Colour Near Endpoint',
          instruction: 'Slow down to single drops as transient pink flashes appear and fade when swirling.',
          audioScript: 'Step 8: Observe closely as you near the endpoint. A brief pink flash appears where the drop hits and disappears on swirling. Switch to single drops.',
          actionLabel: 'Add 1 Drop & Swirl',
          hint: 'Watch the transient pink flashes in the flask and slow down.',
        },
        {
          step: 9,
          title: 'Stop at Permanent Pale Pink',
          instruction: 'Close the burette stopcock immediately when a permanent pale pink colour persists for 30 seconds.',
          audioScript: 'Step 9: Stop the titration immediately by closing the tap as soon as a permanent pale pink color appears.',
          actionLabel: 'Close Stopcock at Endpoint',
          hint: 'When solution turns permanent pale pink (pH >= 8.2), close the tap!',
        },
        {
          step: 10,
          title: 'Record Final Burette Reading',
          instruction: 'Read the final meniscus level and save the reading to the active trial row in the observation table.',
          audioScript: 'Step 10: Read the final burette reading at the lower meniscus and save it in your observation table.',
          actionLabel: 'Record Final Reading',
          hint: 'Capture the final burette reading into your observation table.',
        },
        {
          step: 11,
          title: 'Calculate Volume & Molarity',
          instruction: 'Compute the volume of NaOH used (Final − Initial) and determine unknown HCl molarity using M₁V₁ = M₂V₂.',
          audioScript: 'Step 11: Subtract the initial reading from the final reading to find the volume of sodium hydroxide used, then calculate the molarity of hydrochloric acid.',
          actionLabel: 'Go to Calculation Panel',
          hint: 'Complete concordant trials and verify M1 using M1V1 = M2V2.',
        },
      ],
    },
    observation: {
      heading: 'Observation Table',
      trialCol: 'Trial',
      initialCol: 'Initial (mL)',
      finalCol: 'Final (mL)',
      volumeCol: 'NaOH Used (mL)',
      captureInitial: 'Set Initial',
      captureFinal: 'Set Final',
      saveTrial: 'Save Trial',
      concordantLabel: 'Concordant Titre Volume (V₂)',
      noConcordant: 'Record at least Trial I to compute V₂',
    },
    calculation: {
      heading: 'Stoichiometric Calculation',
      formulaTitle: 'Neutralisation Formula: M₁V₁ = M₂V₂',
      v1Label: 'Volume of HCl (V₁)',
      m2Label: 'Molarity of NaOH (M₂)',
      v2Label: 'Volume of NaOH (V₂)',
      m1Label: 'Calculated Molarity of HCl (M₁)',
      enterM1: 'Enter calculated M₁ (mol/L)',
      checkAnswer: 'Verify Calculation',
      stepByStep: 'Step-by-Step Solution',
      accurateMsg: 'Accurate result within lab tolerance.',
      offMsg: 'Check your titre readings or arithmetic.',
      actualLabel: 'True Unknown M₁',
      errorLabel: 'Percentage Error',
    },
    apparatus: {
      workbench: {
        name: 'Epoxy Lab Workbench',
        role: 'Chemical-resistant experimental surface',
        usage: 'Supports all titration glassware safely.',
      },
      burette: {
        name: '50 mL Graduated Burette',
        role: 'Precision volumetric titrant dispenser',
        usage: 'Dispenses 0.1 M NaOH with 0.1 mL resolution. Click stopcock to control flow.',
      },
      retort_stand: {
        name: 'Retort Stand & Burette Clamp',
        role: 'Rigid vertical support assembly',
        usage: 'Holds the burette strictly vertical for accurate meniscus readings.',
      },
      conical_flask: {
        name: '250 mL Conical (Erlenmeyer) Flask',
        role: 'Titration reaction vessel',
        usage: 'Holds 10 mL HCl + phenolphthalein. Tapered walls prevent splashing while swirling.',
      },
      pipette: {
        name: '10 mL Volumetric Pipette',
        role: 'Fixed-volume precision glass transfer tool',
        usage: 'Click to draw and transfer exactly 10.0 mL of unknown HCl into the conical flask.',
      },
      beaker: {
        name: '100 mL Borosilicate Beaker',
        role: 'Acid holding vessel',
        usage: 'Holds unknown HCl sample ready for pipetting.',
      },
      funnel: {
        name: 'Glass Filter Funnel',
        role: 'Safe burette filling guide',
        usage: 'Click to mount on top of the burette while pouring 0.1 M NaOH.',
      },
      white_tile: {
        name: 'White Porcelain Tile',
        role: 'High-contrast colour backdrop',
        usage: 'Placed under the flask so the faint pale pink endpoint is clearly visible.',
      },
      wash_bottle: {
        name: 'Distilled Water Wash Bottle',
        role: 'Rinsing & wall-wash dispenser',
        usage: 'Click to rinse inner flask walls with distilled water (does not alter H⁺ moles).',
      },
      ph_meter: {
        name: 'Digital pH Meter & Glass Electrode',
        role: 'Real-time electrochemical pH sensor',
        usage: 'Continuously measures solution pH from acidic (~1.0) through pH 7.00 equivalence to basic.',
      },
      naoh_bottle: {
        name: '0.1 M NaOH Reagent Bottle',
        role: 'Standard basic titrant stock',
        usage: 'Contains standardized 0.10 mol/L Sodium Hydroxide. Click to rinse/fill burette.',
      },
      hcl_bottle: {
        name: 'Unknown HCl Stock Bottle',
        role: 'Analyte acid source',
        usage: 'Contains Hydrochloric Acid of unknown molarity.',
      },
      indicator_bottle: {
        name: 'Phenolphthalein Indicator Bottle',
        role: 'Acid-base visual endpoint indicator',
        usage: 'Click to add 3 drops to the flask. Colorless below pH 8.2, pale pink at pH 8.2–10.0.',
      },
    },
  },
  ta: {
    brand: 'TitraLab 3D',
    nav: {
      lab: 'மெய்நிகர் ஆய்வகம்',
      learning: 'கற்றல் மையம்',
      equation: 'சமன்பாடு & அயனிகள்',
      assessment: 'மதிப்பீடு',
      teacher: 'ஆசிரியர் தளம்',
    },
    auth: {
      signIn: 'மாணவர் உள்நுழைவு',
      signOut: 'வெளியேறு',
      student: 'மாணவர்',
      teacher: 'ஆசிரியர்',
      nameLabel: 'முழுப் பெயர்',
      rollLabel: 'வரிசை எண் / ஆசிரியர் எண்',
      classLabel: 'வகுப்பு & பிரிவு',
      teacherCodeLabel: 'ஆசிரியர் அணுகல் குறியீடு',
      teacherCodeHint: 'மாதிரி குறியீடு: CHEM-TEACHER',
      submit: 'ஆய்வகத்தில் நுழைக',
      cancel: 'ரத்து செய்',
    },
    toolbar: {
      experimentTitle: '0.1 M NaOH திட்டக் கரைசலைக் கொண்டு HCl செறிவைக் கண்டறிதல்',
      voiceOn: 'குரல் வழிகாட்டி இயக்கம்',
      voiceOff: 'குரல் வழிகாட்டி நிறுத்தம்',
      newSample: 'புதிய அறியாத மாதிரி',
      trialLabel: 'நடப்பு சோதனை',
    },
    dock: {
      hideControls: 'கட்டுப்பாடுகளை மறை',
      showControls: 'கட்டுப்பாடுகளைக் காட்டு',
      cameraLabel: 'கேமரா',
      camOverview: 'முழுப் பார்வை',
      camMeniscus: 'மட்டக்குழி பெரிதாக்கம்',
      camFlask: 'குடுவை அருகாமை',
      camPh: 'pH மீட்டர்',
      tapLabel: 'பியூரெட் குழாய்',
      tapClosed: 'மூடியது',
      tapSlow: 'சொட்டு சொட்டாக',
      tapMedium: 'மித வேகம்',
      tapFast: 'வேகமாக',
      addDrop: '+1 சொட்டு',
      swirl: 'குடுவையை சுழற்று',
      washBottle: 'காய்ச்சி வடித்த நீர்',
      resetTrial: 'மீட்டமை',
    },
    telemetry: {
      buretteReading: 'பியூரெட் அளவு',
      volumeAdded: 'சேர்க்கப்பட்ட NaOH',
      livePh: 'நேரடி pH',
      solutionColor: 'கரைசல் நிறம்',
      colorStates: {
        empty: 'காலி குடுவை',
        colorless: 'நிறமற்றது (அமிலம்)',
        transient_pink: 'மறையும் இளஞ்சிவப்பு',
        pale_pink: 'நிலையான வெளிர் இளஞ்சிவப்பு (இறுதி நிலை)',
        deep_pink: 'அடர் இளஞ்சிவப்பு (மிகை அளவு)',
      },
      curveTitle: 'நேரடி தரம்பார்த்தல் வளைவு (pH vs NaOH கன அளவு)',
    },
    procedure: {
      heading: 'செய்முறைப் படிகள்',
      stepOf: 'படி',
      listenStep: 'கேட்க',
      completed: 'முடிந்தது',
      steps: [
        {
          step: 1,
          title: 'பியூரெட்டை NaOH கொண்டு கழுவுதல்',
          instruction: 'சுத்தமான பியூரெட்டை சிறிதளவு 0.1 M NaOH கரைசலால் கழுவவும்.',
          audioScript: 'படி 1: சுத்தமான பியூரெட்டை 0.1 மோலார் சோடியம் ஹைட்ராக்சைடு கரைசலால் கழுவவும்.',
          actionLabel: 'பியூரெட்டை NaOH-ஆல் கழுவுக',
          hint: '3D-யில் NaOH பாட்டில் அல்லது கீழே உள்ள பொத்தானை அழுத்தவும்.',
        },
        {
          step: 2,
          title: 'பியூரெட்டில் 0.1 M NaOH நிரப்புதல்',
          instruction: 'புனலைப் பயன்படுத்தி 0.1 M NaOH கரைசலை 0.00 mL சுழி குறியீடு வரை நிரப்பவும்.',
          audioScript: 'படி 2: புனலைப் பயன்படுத்தி 0.1 மோலார் NaOH கரைசலை பியூரெட்டில் சுழி குறியீடு வரை நிரப்பவும்.',
          actionLabel: '0.00 mL வரை நிரப்புக',
          hint: 'புனல் அல்லது நிரப்பு பொத்தானை அழுத்தவும்.',
        },
        {
          step: 3,
          title: 'தொடக்க பியூரெட் அளவைப் பதிவு செய்தல்',
          instruction: 'கீழ் மட்டக்குழியைப் பார்த்து தொடக்க அளவை (0.00 mL) அட்டவணையில் பதிவு செய்யவும்.',
          audioScript: 'படி 3: பியூரெட்டின் கீழ் மட்டக்குழியைக் கண் மட்டத்தில் பார்த்து தொடக்க அளவைப் பதிவு செய்யவும்.',
          actionLabel: 'தொடக்க அளவைப் பதிவு செய்க (0.00 mL)',
          hint: 'மட்டக்குழி பெரிதாக்கம் மூலம் 0.00 mL என்பதைச் சரிபார்க்கவும்.',
        },
        {
          step: 4,
          title: '10 mL HCl குடுவையில் எடுத்தல்',
          instruction: 'பிப்பெட் உதவியுடன் 10 mL அறியாத HCl அமிலத்தைக் கூம்புக் குடுவைக்கு மாற்றவும்.',
          audioScript: 'படி 4: 10 மில்லிலிட்டர் பிப்பெட் மூலம் 10 மில்லிலிட்டர் ஹைட்ரோகுளோரிக் அமிலத்தை கூம்புக் குடுவையில் ஊற்றவும்.',
          actionLabel: '10 mL HCl குடுவையில் சேர்',
          hint: '3D-யில் பிப்பெட் அல்லது பொத்தானை அழுத்தவும்.',
        },
        {
          step: 5,
          title: 'பினாப்தலீன் நிறங்காட்டி சேர்த்தல்',
          instruction: 'பினாப்தலீன் நிறங்காட்டியிலிருந்து 2–3 சொட்டுகள் குடுவையில் சேர்க்கவும்.',
          audioScript: 'படி 5: பினாப்தலீன் நிறங்காட்டியை 2 முதல் 3 சொட்டுகள் சேர்க்கவும். அமிலக் கரைசல் நிறமற்றதாக இருக்கும்.',
          actionLabel: '3 சொட்டு பினாப்தலீன் சேர்',
          hint: '3D-யில் பினாப்தலீன் பாட்டிலை அழுத்தவும்.',
        },
        {
          step: 6,
          title: 'குடுவையை பியூரெட் கீழ் வைத்தல்',
          instruction: 'கூம்புக் குடுவையை பியூரெட் முனைக்குக் கீழே வெள்ளை ஓட்டின் மீது வைக்கவும்.',
          audioScript: 'படி 6: கூம்புக் குடுவையை பியூரெட்டுக்குக் கீழே உள்ள வெள்ளை ஓட்டின் மீது வைக்கவும்.',
          actionLabel: 'வெள்ளை ஓட்டின் மீது வைக்கவும்',
          hint: '3D-யில் குடுவை அல்லது வெள்ளை ஓட்டை அழுத்தவும்.',
        },
        {
          step: 7,
          title: 'குழாயைத் திறந்து தரம்பார்த்தல்',
          instruction: 'பியூரெட் குழாயைத் திறந்து NaOH கரைசலைச் சொட்டு சொட்டாகச் சேர்த்து குடுவையைச் சுழற்றவும்.',
          audioScript: 'படி 7: பியூரெட் குழாயை மெதுவாகத் திறந்து NaOH கரைசலைச் சொட்டு சொட்டாகச் சேர்க்கவும்.',
          actionLabel: 'குழாயைத் திறக்கவும் (சொட்டு)',
          hint: 'கீழே உள்ள குழாய் கட்டுப்பாட்டைப் பயன்படுத்தவும்.',
        },
        {
          step: 8,
          title: 'இறுதி நிலைக்கு முன் நிற மாற்றம்',
          instruction: 'இளஞ்சிவப்பு நிறம் தோன்றி மறையும்போது ஒரு சொட்டாகச் சேர்க்கவும்.',
          audioScript: 'படி 8: இறுதி நிலை அருகில் இளஞ்சிவப்பு நிறம் தோன்றி மறையும். ஒரு சொட்டாகச் சேர்க்கவும்.',
          actionLabel: '1 சொட்டு சேர்த்து சுழற்று',
          hint: 'குடுவையில் தோன்றும் இளஞ்சிவப்பைக் கவனிக்கவும்.',
        },
        {
          step: 9,
          title: 'நிலையான வெளிர் இளஞ்சிவப்பில் நிறுத்துதல்',
          instruction: 'நிலையான வெளிர் இளஞ்சிவப்பு நிறம் தோன்றியவுடன் குழாயை உடனே மூடவும்.',
          audioScript: 'படி 9: நிலையான வெளிர் இளஞ்சிவப்பு நிறம் தோன்றியவுடன் குழாயை மூடி தரம்பார்த்தலை நிறுத்தவும்.',
          actionLabel: 'குழாயை மூடுக',
          hint: 'pH 8.2-க்கு மேல் வெளிர் இளஞ்சிவப்பு தோன்றும்போது நிறுத்தவும்!',
        },
        {
          step: 10,
          title: 'இறுதி பியூரெட் அளவைப் பதிவு செய்தல்',
          instruction: 'இறுதி மட்டக்குழி அளவைப் படித்து அட்டவணையில் சேமிக்கவும்.',
          audioScript: 'படி 10: இறுதி பியூரெட் அளவைப் படித்து அட்டவணையில் பதிவு செய்யவும்.',
          actionLabel: 'இறுதி அளவைப் பதிவு செய்க',
          hint: 'அட்டவணையில் இறுதி அளவைச் சேமிக்கவும்.',
        },
        {
          step: 11,
          title: 'கன அளவு & செறிவு கணக்கீடு',
          instruction: 'பயன்படுத்தப்பட்ட NaOH கன அளவு மற்றும் M₁V₁ = M₂V₂ மூலம் HCl செறிவைக் கணக்கிடவும்.',
          audioScript: 'படி 11: M1V1 சமன்பாடு M2V2 என்ற வாய்ப்பாட்டைப் பயன்படுத்தி ஹைட்ரோகுளோரிக் அமிலத்தின் மோலாரிட்டியைக் கணக்கிடவும்.',
          actionLabel: 'கணக்கீட்டுப் பகுதிக்குச் செல்',
          hint: 'சோதனை அளவுகளைக் கொண்டு M₁ கணக்கிடுக.',
        },
      ],
    },
    observation: {
      heading: 'உற்றுநோக்கல் அட்டவணை',
      trialCol: 'சோதனை',
      initialCol: 'தொடக்கம் (mL)',
      finalCol: 'இறுதி (mL)',
      volumeCol: 'NaOH அளவு (mL)',
      captureInitial: 'தொடக்க அளவு',
      captureFinal: 'இறுதி அளவு',
      saveTrial: 'சேமி',
      concordantLabel: 'ஒத்திசைந்த கன அளவு (V₂)',
      noConcordant: 'V₂ பெற குறைந்தது சோதனை I-ஐ பதிவு செய்யவும்',
    },
    calculation: {
      heading: 'கணக்கீடு',
      formulaTitle: 'நடுநிலையாக்கல் வாய்ப்பாடு: M₁V₁ = M₂V₂',
      v1Label: 'HCl கன அளவு (V₁)',
      m2Label: 'NaOH மோலாரிட்டி (M₂)',
      v2Label: 'NaOH கன அளவு (V₂)',
      m1Label: 'கணக்கிடப்பட்ட HCl மோலாரிட்டி (M₁)',
      enterM1: 'கணக்கிட்ட M₁ மதிப்பை உள்ளிடவும்',
      checkAnswer: 'சரிபார்க்கவும்',
      stepByStep: 'படிப்படியான தீர்வு',
      accurateMsg: 'மிகச் சரியான கணக்கீடு!',
      offMsg: 'உங்கள் அளவீடுகள் அல்லது கணக்கீட்டைச் சரிபார்க்கவும்.',
      actualLabel: 'உண்மையான HCl M₁',
      errorLabel: 'சதவீதப் பிழை',
    },
    apparatus: {
      workbench: {
        name: 'ஆய்வக மேசை',
        role: 'வேதிப்பொருள் எதிர்ப்புப் பரப்பு',
        usage: 'அனைத்து கண்ணாடி உபகரணங்களையும் தாங்குகிறது.',
      },
      burette: {
        name: '50 mL அளவுக் குழாய் (பியூரெட்)',
        role: 'துல்லியமான காரம் சேர்க்கும் கருவி',
        usage: '0.1 M NaOH கரைசலைச் சொட்டு சொட்டாகச் சேர்க்க உதவுகிறது.',
      },
      retort_stand: {
        name: 'தாங்கி & கவ்வி',
        role: 'செங்குத்து நிலைப்படுத்தி',
        usage: 'பியூரெட்டை நேராகப் பிடித்து மட்டக்குழி அளவைத் துல்லியமாக்குகிறது.',
      },
      conical_flask: {
        name: '250 mL கூம்புக் குடுவை',
        role: 'வினைக் கலன்',
        usage: '10 mL HCl மற்றும் பினாப்தலீன் இதில் எடுத்து சுழற்றப்படுகிறது.',
      },
      pipette: {
        name: '10 mL பிப்பெட்',
        role: 'நிலையான கன அளவு மாற்றி',
        usage: 'சரியாக 10.0 mL HCl அமிலத்தை அளந்தெடுக்கப் பயன்படுகிறது.',
      },
      beaker: {
        name: '100 mL பீக்கர்',
        role: 'அமிலம் வைக்கும் கலன்',
        usage: 'அறியாத HCl கரைசலைக் கொண்டுள்ளது.',
      },
      funnel: {
        name: 'கண்ணாடிப் புனல்',
        role: 'பாதுகாப்பான ஊற்றி',
        usage: 'பியூரெட்டில் NaOH ஊற்றப் பயன்படுகிறது.',
      },
      white_tile: {
        name: 'வெள்ளை பீங்கான் ஓடு',
        role: 'நிற வேறுபாடு காட்டி',
        usage: 'வெளிர் இளஞ்சிவப்பு இறுதி நிலையைத் தெளிவாகக் காண உதவுகிறது.',
      },
      wash_bottle: {
        name: 'காய்ச்சி வடித்த நீர் பாட்டில்',
        role: 'கழுவும் பாட்டில்',
        usage: 'குடுவையின் உட்சுவர்களைக் கழுவப் பயன்படுகிறது.',
      },
      ph_meter: {
        name: 'டிஜிட்டல் pH மீட்டர்',
        role: 'நேரடி pH அளவி',
        usage: 'வினையின் pH மாற்றத்தை 1.0 முதல் 14.0 வரை நேரடியாகக் காட்டுகிறது.',
      },
      naoh_bottle: {
        name: '0.1 M NaOH பாட்டில்',
        role: 'திட்டக் காரக் கரைசல்',
        usage: '0.10 mol/L சோடியம் ஹைட்ராக்சைடு கரைசல்.',
      },
      hcl_bottle: {
        name: 'அறியாத HCl பாட்டில்',
        role: 'ஆய்வு அமிலக் கரைசல்',
        usage: 'செறிவு கண்டறியப்பட வேண்டிய ஹைட்ரோகுளோரிக் அமிலம்.',
      },
      indicator_bottle: {
        name: 'பினாப்தலீன் நிறங்காட்டி',
        role: 'இறுதி நிலை நிறங்காட்டி',
        usage: 'அமிலத்தில் நிறமற்றது; pH 8.2-க்கு மேல் இளஞ்சிவப்பு நிறமாக மாறும்.',
      },
    },
  },
};
