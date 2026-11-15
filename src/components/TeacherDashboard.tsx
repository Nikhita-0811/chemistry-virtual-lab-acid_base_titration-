import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, Users } from 'lucide-react';
import { Language, UserProfile } from '../types/lab';

interface TeacherDashboardProps {
  language: Language;
  currentUser: UserProfile | null;
  onRequestSignIn: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  language,
  currentUser,
  onRequestSignIn,
}) => {
  const isTa = language === 'ta';
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/students');
      if (res.ok) {
        const data = (await res.json()) as { students: UserProfile[] };
        setStudents(data.students);
        if (data.students.length > 0 && !selectedStudent) {
          setSelectedStudent(data.students[0]);
        }
      }
    } catch {
      // Ignore network failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const exportCsv = () => {
    const header = [
      'Name',
      'Roll Number',
      'Class',
      'Steps Completed',
      'True HCl (M)',
      'Calculated HCl (M)',
      'Percent Error (%)',
      'Assessment Score (/25)',
      'Last Active',
    ].join(',');
    const rows = students.map((s) =>
      [
        `"${s.name}"`,
        `"${s.rollNumber}"`,
        `"${s.classSection}"`,
        `${s.completedSteps.length}/11`,
        s.unknownMolarity.toFixed(3),
        s.calculatedMolarity || '',
        s.percentError !== null ? s.percentError.toFixed(2) : '',
        s.assessment ? `${s.assessment.totalScore}/25` : '',
        s.lastActive,
      ].join(','),
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'titralab_student_performance.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const completedLabs = students.filter((s) => s.completedSteps.length >= 10).length;
  const gradedStudents = students.filter((s) => s.assessment !== null);
  const avgAssessment =
    gradedStudents.length > 0
      ? (
          gradedStudents.reduce((acc, s) => acc + (s.assessment?.totalScore || 0), 0) /
          gradedStudents.length
        ).toFixed(1)
      : '--';

  const errorStudents = students.filter((s) => s.percentError !== null);
  const avgError =
    errorStudents.length > 0
      ? (
          errorStudents.reduce((acc, s) => acc + (s.percentError || 0), 0) / errorStudents.length
        ).toFixed(2)
      : '--';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-700">
            {isTa ? 'ஆசிரியர் கண்காணிப்புப் பலகை' : 'Classroom Analytics & Evaluation Monitor'}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {isTa ? 'மாணவர் செயல்பாட்டு அறிக்கை' : 'Teacher Performance Dashboard'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isTa
              ? 'உள்நுழைந்த அனைத்து மாணவர்களின் ஆய்வகப் படிகள், கணக்கீட்டுத் துல்லியம் மற்றும் தேர்வு மதிப்பெண்கள்.'
              : 'Live progress tracking across student titration runs, molarity accuracy, and 25-mark assessments.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!currentUser && (
            <button
              type="button"
              onClick={onRequestSignIn}
              className="rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer"
            >
              {isTa ? 'ஆசிரியர் / மாணவர் உள்நுழைவு' : 'Sign In'}
            </button>
          )}
          <button
            type="button"
            onClick={loadStudents}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isTa ? 'புதுப்பி' : 'Refresh'}</span>
          </button>
          <button
            type="button"
            disabled={students.length === 0}
            onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-45 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isTa ? 'CSV பதிவிறக்கம்' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">
            {isTa ? 'பதிவு செய்த மாணவர்கள்' : 'Enrolled Students'}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {students.length}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">
            {isTa ? 'ஆய்வு முடித்தவர்கள்' : 'Completed Titrations'}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-700 mt-1">
            {completedLabs}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">
            {isTa ? 'சராசரி தேர்வு மதிப்பெண்' : 'Avg Assessment Score'}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
            {avgAssessment} <span className="text-xs font-normal text-slate-400">/ 25</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">
            {isTa ? 'சராசரி கணக்கீட்டுப் பிழை' : 'Mean Molarity Error'}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {avgError}
            <span className="text-xs font-normal text-slate-400 ml-1">%</span>
          </div>
        </div>
      </div>

      {/* Student Records Table & Detail Inspector */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          {isTa ? 'மாணவர் தரவுகள் ஏற்றப்படுகின்றன...' : 'Loading classroom records...'}
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center space-y-3">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="text-sm font-semibold text-slate-800">
            {isTa ? 'இதுவரை மாணவர் பதிவுகள் இல்லை' : 'No student sessions recorded yet'}
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isTa
              ? 'மாணவராக உள்நுழைந்து தரம்பார்த்தல் மற்றும் மதிப்பீட்டைச் செய்யும்போது இங்கே நேரடியாகத் தோன்றும்.'
              : 'Sign in as a student and save titration readings or submit the assessment to view live student analytics here.'}
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{isTa ? 'மாணவர்' : 'Student'}</th>
                    <th className="px-4 py-3 font-semibold">{isTa ? 'வகுப்பு' : 'Class'}</th>
                    <th className="px-4 py-3 font-semibold">{isTa ? 'படிகள்' : 'Steps'}</th>
                    <th className="px-4 py-3 font-semibold">{isTa ? 'கணக்கிட்ட M₁' : 'Calc M₁'}</th>
                    <th className="px-4 py-3 font-semibold">{isTa ? 'பிழை %' : 'Error %'}</th>
                    <th className="px-4 py-3 font-semibold">{isTa ? 'மதிப்பெண்' : 'Quiz'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.map((st) => (
                    <tr
                      key={st.id}
                      onClick={() => setSelectedStudent(st)}
                      className={`cursor-pointer transition-colors ${
                        selectedStudent?.id === st.id ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{st.name}</div>
                        <div className="font-mono text-[11px] text-slate-500">{st.rollNumber}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{st.classSection}</td>
                      <td className="px-4 py-3 font-mono tabular-nums text-slate-800">
                        {st.completedSteps.length}/11
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums text-blue-700 font-semibold">
                        {st.calculatedMolarity ? `${st.calculatedMolarity} M` : '--'}
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums text-slate-700">
                        {st.percentError !== null ? `${st.percentError.toFixed(2)}%` : '--'}
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums font-semibold text-emerald-700">
                        {st.assessment ? `${st.assessment.totalScore}/25` : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Student Detail Panel */}
          {selectedStudent && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div>
                <div className="text-xs font-semibold text-blue-700">
                  {isTa ? 'மாணவர் விவரம்' : 'Student Lab Record'}
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedStudent.name}</h3>
                <div className="text-xs text-slate-500 font-mono">
                  {selectedStudent.rollNumber} · {selectedStudent.classSection}
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs space-y-1 font-mono">
                <div>Unknown Sample M₁: {selectedStudent.unknownMolarity.toFixed(3)} M</div>
                <div>Concordant V₂: {selectedStudent.concordantVolume || '--'} mL</div>
                <div>Student M₁: {selectedStudent.calculatedMolarity || '--'} M</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-700 mb-2">
                  {isTa ? 'பதிவு செய்யப்பட்ட சோதனைகள்' : 'Logged Observation Trials'}
                </div>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-[11px] font-mono tabular-nums">
                    <thead className="bg-slate-50 border-b border-slate-200 font-sans text-slate-500">
                      <tr>
                        <th className="px-2.5 py-1.5">Trial</th>
                        <th className="px-2.5 py-1.5">Init</th>
                        <th className="px-2.5 py-1.5">Final</th>
                        <th className="px-2.5 py-1.5">Vol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedStudent.trials.map((tr) => (
                        <tr key={tr.trialName}>
                          <td className="px-2.5 py-1.5 font-sans font-semibold">{tr.trialName}</td>
                          <td className="px-2.5 py-1.5">{tr.initialReading || '--'}</td>
                          <td className="px-2.5 py-1.5">{tr.finalReading || '--'}</td>
                          <td className="px-2.5 py-1.5 font-semibold text-blue-700">{tr.volumeUsed || '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedStudent.assessment && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-xs space-y-1">
                  <div className="font-bold text-emerald-900">
                    Assessment Breakdown: {selectedStudent.assessment.totalScore} / 25
                  </div>
                  <div className="font-mono text-emerald-800">
                    MCQ: {selectedStudent.assessment.mcqScore}/10 · Fill: {selectedStudent.assessment.fillScore}/5 · App: {selectedStudent.assessment.applicationScore}/5 · Viva: {selectedStudent.assessment.vivaScore}/5
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
