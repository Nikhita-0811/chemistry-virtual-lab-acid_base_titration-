import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Language, UserProfile } from '../types/lab';
import { TRANSLATIONS } from '../i18n/translations';

interface LoginModalProps {
  open: boolean;
  language: Language;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  open,
  language,
  onClose,
  onLoginSuccess,
}) => {
  const t = TRANSLATIONS[language];
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [classSection, setClassSection] = useState('Grade 11-A');
  const [teacherCode, setTeacherCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          rollNumber,
          classSection,
          role,
          teacherCode: role === 'teacher' ? teacherCode : undefined,
        }),
      });
      const data = (await res.json()) as { user?: UserProfile; error?: string };
      if (!res.ok || !data.user) {
        setError(data.error || 'Sign in failed.');
      } else {
        onLoginSuccess(data.user);
        onClose();
      }
    } catch {
      setError('Unable to reach laboratory server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{t.auth.signIn}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector */}
        <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`rounded-md py-1.5 text-xs font-semibold cursor-pointer ${
              role === 'student' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            {t.auth.student}
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`rounded-md py-1.5 text-xs font-semibold cursor-pointer ${
              role === 'teacher' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            {t.auth.teacher}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.auth.nameLabel}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ananya Krishnan"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.auth.rollLabel}
            </label>
            <input
              type="text"
              required
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder={role === 'student' ? 'e.g. 11A-024' : 'e.g. STAFF-07'}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.auth.classLabel}
            </label>
            <input
              type="text"
              value={classSection}
              onChange={(e) => setClassSection(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          {role === 'teacher' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.auth.teacherCodeLabel}
              </label>
              <input
                type="password"
                required
                value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value)}
                placeholder="CHEM-TEACHER"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
              />
              <div className="text-[11px] text-slate-500 mt-1">{t.auth.teacherCodeHint}</div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {t.auth.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {t.auth.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
