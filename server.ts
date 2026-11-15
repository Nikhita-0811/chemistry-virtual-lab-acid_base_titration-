import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'lab-records.json');

interface TrialRecord {
  trialName: 'Rough' | 'I' | 'II' | 'III';
  initialReading: string;
  finalReading: string;
  volumeUsed: string;
  savedAt: string;
}

interface AssessmentResult {
  totalScore: number;
  maxScore: number;
  mcqScore: number;
  fillScore: number;
  applicationScore: number;
  vivaScore: number;
  submittedAt: string;
}

interface StudentRecord {
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

interface DatabaseSchema {
  students: Record<string, StudentRecord>;
}

function ensureDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = { students: {} };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch {
    return { students: {} };
  }
}

function saveDb(db: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Login or register student / teacher
  app.post('/api/auth/login', (req, res) => {
    const { name, rollNumber, classSection, role, teacherCode } = req.body as {
      name?: string;
      rollNumber?: string;
      classSection?: string;
      role?: 'student' | 'teacher';
      teacherCode?: string;
    };

    const cleanName = (name || '').trim();
    const cleanRoll = (rollNumber || '').trim();
    const cleanClass = (classSection || 'Grade 11-A').trim();

    if (!cleanName || !cleanRoll) {
      res.status(400).json({ error: 'Name and Roll / Staff ID are required.' });
      return;
    }

    if (role === 'teacher' && teacherCode !== 'CHEM-TEACHER') {
      res.status(403).json({ error: 'Invalid Teacher Access Code. Use CHEM-TEACHER.' });
      return;
    }

    const db = ensureDb();
    const id = `${role === 'teacher' ? 'teacher' : 'student'}_${cleanRoll.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;
    const existing = db.students[id];

    const unknownSamples = [0.085, 0.095, 0.11, 0.12, 0.135, 0.145];
    const randomSample = unknownSamples[Math.floor(Math.random() * unknownSamples.length)];

    const record: StudentRecord = existing
      ? {
          ...existing,
          name: cleanName,
          classSection: cleanClass,
          lastActive: new Date().toISOString(),
        }
      : {
          id,
          name: cleanName,
          rollNumber: cleanRoll,
          classSection: cleanClass,
          role: role === 'teacher' ? 'teacher' : 'student',
          unknownMolarity: randomSample,
          completedSteps: [],
          trials: [
            { trialName: 'Rough', initialReading: '', finalReading: '', volumeUsed: '', savedAt: '' },
            { trialName: 'I', initialReading: '', finalReading: '', volumeUsed: '', savedAt: '' },
            { trialName: 'II', initialReading: '', finalReading: '', volumeUsed: '', savedAt: '' },
            { trialName: 'III', initialReading: '', finalReading: '', volumeUsed: '', savedAt: '' },
          ],
          calculatedMolarity: '',
          concordantVolume: '',
          percentError: null,
          assessment: null,
          lastActive: new Date().toISOString(),
        };

    db.students[id] = record;
    saveDb(db);
    res.json({ user: record });
  });

  // Get single student record
  app.get('/api/student/:id', (req, res) => {
    const db = ensureDb();
    const student = db.students[req.params.id];
    if (!student) {
      res.status(404).json({ error: 'Student record not found.' });
      return;
    }
    res.json({ user: student });
  });

  // Save experiment progress
  app.post('/api/student/:id/progress', (req, res) => {
    const db = ensureDb();
    const existing = db.students[req.params.id];
    if (!existing) {
      res.status(404).json({ error: 'Student record not found.' });
      return;
    }

    const {
      completedSteps,
      trials,
      calculatedMolarity,
      concordantVolume,
      unknownMolarity,
    } = req.body as Partial<StudentRecord>;

    const targetUnknown = typeof unknownMolarity === 'number' ? unknownMolarity : existing.unknownMolarity;
    let percentError = existing.percentError;
    if (calculatedMolarity && !Number.isNaN(Number(calculatedMolarity)) && targetUnknown > 0) {
      const calcNum = Number(calculatedMolarity);
      percentError = Number((Math.abs((calcNum - targetUnknown) / targetUnknown) * 100).toFixed(2));
    }

    const updated: StudentRecord = {
      ...existing,
      unknownMolarity: targetUnknown,
      completedSteps: Array.isArray(completedSteps) ? completedSteps : existing.completedSteps,
      trials: Array.isArray(trials) ? trials : existing.trials,
      calculatedMolarity: typeof calculatedMolarity === 'string' ? calculatedMolarity : existing.calculatedMolarity,
      concordantVolume: typeof concordantVolume === 'string' ? concordantVolume : existing.concordantVolume,
      percentError,
      lastActive: new Date().toISOString(),
    };

    db.students[req.params.id] = updated;
    saveDb(db);
    res.json({ user: updated });
  });

  // Save assessment score
  app.post('/api/student/:id/assessment', (req, res) => {
    const db = ensureDb();
    const existing = db.students[req.params.id];
    if (!existing) {
      res.status(404).json({ error: 'Student record not found.' });
      return;
    }

    const assessment = req.body as AssessmentResult;
    const updated: StudentRecord = {
      ...existing,
      assessment: {
        ...assessment,
        submittedAt: new Date().toISOString(),
      },
      lastActive: new Date().toISOString(),
    };

    db.students[req.params.id] = updated;
    saveDb(db);
    res.json({ user: updated });
  });

  // Teacher dashboard: list all student records
  app.get('/api/teacher/students', (_req, res) => {
    const db = ensureDb();
    const students = Object.values(db.students)
      .filter((s) => s.role === 'student')
      .sort((a, b) => b.lastActive.localeCompare(a.lastActive));
    res.json({ students });
  });

  // Vite middleware in development, static assets in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TitraLab 3D server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
