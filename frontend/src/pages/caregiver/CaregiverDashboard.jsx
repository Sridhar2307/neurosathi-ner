import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  ShieldCheck, User, Heart, Brain, Bell, AlertTriangle, Sparkles,
  TrendingUp, Activity, CheckCircle2, Plus,
  ChevronDown, ChevronUp, Stethoscope, MapPin, Droplets, FileText,
  LogOut, Users, Edit3, Phone, Mail, X,
  Download, FileSpreadsheet, FileType, Printer
} from 'lucide-react';

// ── Tiny helper ──────────────────────────────────────────────────────────────
function DetailRow({ icon: Icon, label, value, color = 'text-slate-200' }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="w-7 h-7 rounded-lg bg-slate-700/60 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
        <p className={`font-semibold ${color} leading-snug`}>{value}</p>
      </div>
    </div>
  );
}

// ── Export Helpers ─────────────────────────────────────────────────────────────
function exportToCSV(data, filename) {
  const headers = Object.keys(data[0] || {});
  const rows = data.map(obj => headers.map(h => `"${obj[h] ?? ''}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

function exportToJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.json`;
  link.click();
}

function generateReport(patient, data) {
  const report = {
    patient: {
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      location: patient.location,
      medical_stage: patient.medical_stage,
      blood_group: patient.blood_group,
      doctor_name: patient.doctor_name,
      doctor_phone: patient.doctor_phone,
      doctor_hospital: patient.doctor_hospital,
      emergency_contact_name: patient.emergency_contact_name,
      emergency_contact_relation: patient.emergency_contact_relation,
      emergency_contact_phone: patient.emergency_contact_phone,
      emergency_contact_email: patient.emergency_contact_email,
      caregiver_notes: patient.caregiver_notes
    },
    summary: {
      cognitive_score: `${data.average_cognitive_score}%`,
      medication_adherence: `${data.adherence_percentage}%`,
      daily_interactions: data.today_activity_count,
      total_stars: patient.total_stars,
      current_streak: `${patient.current_streak} days`,
      missed_reminders: data.missed_reminders_count,
      active_alerts: data.active_alerts?.length || 0
    },
    recent_game_scores: data.recent_game_scores?.map(g => ({
      game: g.game_type.replace('_', ' '),
      score: `${g.score}%`,
      difficulty: g.difficulty,
      date: new Date(g.timestamp).toLocaleDateString(),
      duration: `${g.duration_seconds}s`
    })) || [],
    reminders_today: data.today_reminders?.map(r => ({
      title: r.title,
      category: r.category,
      time: r.time,
      status: r.is_completed ? 'Completed' : 'Pending',
      detail: r.dosage_or_detail
    })) || [],
    alerts: data.active_alerts?.map(a => ({
      type: a.alert_type,
      severity: a.severity,
      message: a.message,
      date: new Date(a.timestamp).toLocaleDateString(),
      time: new Date(a.timestamp).toLocaleTimeString(),
      resolved: a.is_resolved
    })) || [],
    score_history: data.score_history_by_game || {},
    generated_at: new Date().toISOString()
  };
  return report;
}

// ── Edit Patient Modal ────────────────────────────────────────────────────────
function EditPatientModal({ patient, onClose, onSave }) {
  const { t } = useAccessibility();
  const [form, setForm] = useState({
    name: patient?.name || '',
    age: patient?.age || '',
    gender: patient?.gender || 'Male',
    blood_group: patient?.blood_group || '',
    location: patient?.location || '',
    medical_stage: patient?.medical_stage || '',
    allergies: patient?.allergies || '',
    doctor_name: patient?.doctor_name || '',
    doctor_phone: patient?.doctor_phone || '',
    doctor_hospital: patient?.doctor_hospital || '',
    emergency_contact_name: patient?.emergency_contact_name || '',
    emergency_contact_relation: patient?.emergency_contact_relation || '',
    emergency_contact_phone: patient?.emergency_contact_phone || '',
    emergency_contact_email: patient?.emergency_contact_email || '',
    caregiver_notes: patient?.caregiver_notes || '',
    caregiver_pin: patient?.caregiver_pin || '1234',
  });

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const INPUT = 'w-full bg-slate-900/70 border border-slate-600 rounded-xl px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm';
  const LBL = 'text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-cyan-400" /> Edit Patient Details
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Personal */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Personal Info
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={LBL}>Full Name</label>
                <input className={INPUT} value={form.name} onChange={e => upd('name', e.target.value)} />
              </div>
              <div>
                <label className={LBL}>Age</label>
                <input type="number" className={INPUT} value={form.age} onChange={e => upd('age', e.target.value)} />
              </div>
              <div>
                <label className={LBL}>Gender</label>
                <select className={INPUT} value={form.gender} onChange={e => upd('gender', e.target.value)}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className={LBL}>Blood Group</label>
                <select className={INPUT} value={form.blood_group} onChange={e => upd('blood_group', e.target.value)}>
                  <option value="">Select...</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
                </select>
              </div>
              <div>
                <label className={LBL}>Location</label>
                <input className={INPUT} value={form.location} onChange={e => upd('location', e.target.value)} />
              </div>
            </div>
          </div>
          {/* Medical */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" /> Medical Info
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={LBL}>Medical Stage</label>
                <select className={INPUT} value={form.medical_stage} onChange={e => upd('medical_stage', e.target.value)}>
                  <option>Early-stage Dementia / MCI</option>
                  <option>Moderate Alzheimer's</option>
                  <option>Advanced Dementia</option>
                  <option>Post-stroke Cognitive Impairment</option>
                  <option>Other / Undiagnosed</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className={LBL}>Known Allergies</label>
                <input className={INPUT} value={form.allergies} onChange={e => upd('allergies', e.target.value)} />
              </div>
              <div>
                <label className={LBL}>Doctor Name</label>
                <input className={INPUT} value={form.doctor_name} onChange={e => upd('doctor_name', e.target.value)} />
              </div>
              <div>
                <label className={LBL}>Doctor Phone</label>
                <input className={INPUT} value={form.doctor_phone} onChange={e => upd('doctor_phone', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className={LBL}>Hospital</label>
                <input className={INPUT} value={form.doctor_hospital} onChange={e => upd('doctor_hospital', e.target.value)} />
              </div>
            </div>
          </div>
          {/* Caregiver */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Caregiver Contact
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LBL}>Caregiver Name</label>
                <input className={INPUT} value={form.emergency_contact_name} onChange={e => upd('emergency_contact_name', e.target.value)} />
              </div>
              <div>
                <label className={LBL}>Relation</label>
                <input className={INPUT} value={form.emergency_contact_relation} onChange={e => upd('emergency_contact_relation', e.target.value)} />
              </div>
              <div>
                <label className={LBL}>Phone</label>
                <input className={INPUT} value={form.emergency_contact_phone} onChange={e => upd('emergency_contact_phone', e.target.value)} />
              </div>
              <div>
                <label className={LBL}>Email</label>
                <input type="email" className={INPUT} value={form.emergency_contact_email} onChange={e => upd('emergency_contact_email', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className={LBL}>Caregiver Login PIN (4 digits)</label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="e.g. 1234"
                  className={INPUT}
                  value={form.caregiver_pin}
                  onChange={e => upd('caregiver_pin', e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Use this PIN together with your phone number/email to log in to the Caregiver Portal.
                </p>
              </div>
              <div className="col-span-2">
                <label className={LBL}>Caregiver Notes</label>
                <textarea className={`${INPUT} h-20 resize-none`} value={form.caregiver_notes} onChange={e => upd('caregiver_notes', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 px-6 py-4 flex gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:text-white font-bold text-sm transition"
          >{t.cancel || "Cancel"}</button>
          <button
            onClick={() => onSave({ ...form, age: form.age ? parseInt(form.age) : undefined })}
            className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition"
          >{t.saveChanges || t.save || "Save Changes"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function CaregiverDashboard() {
  const {
    navigateTo, userProfile,
    caregiverSession, setCaregiverSession,
    activePatient, activePatientId,
    switchPatient, caregiverLogout, showToast
  } = useApp();
  const { t, language, changeLanguage, availableLanguages } = useAccessibility();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [showPatientSwitcher, setShowPatientSwitcher] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Patient shown in dashboard (from session or fallback)
  const patient = activePatient || data?.patient_profile || userProfile;

  // Deduplicate and filter strictly to patients belonging to this caregiver's session
  const cleanPatients = (list) => {
    const map = new Map();
    (list || []).forEach(p => {
      if (p && p.id && p.role !== 'caregiver' && !map.has(p.id)) {
        map.set(p.id, p);
      }
    });
    if (patient && patient.id && patient.role !== 'caregiver' && !map.has(patient.id)) {
      map.set(patient.id, patient);
    }
    return Array.from(map.values());
  };

  const [patientsList, setPatientsList] = useState(() => cleanPatients(caregiverSession?.allPatients));

  useEffect(() => {
    if (caregiverSession?.allPatients) {
      setPatientsList(cleanPatients(caregiverSession.allPatients));
    }
  }, [caregiverSession]);

  const allPatients = cleanPatients(patientsList.length > 0 ? patientsList : caregiverSession?.allPatients);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const dash = await api.getCaregiverDashboard(activePatientId);
      setData(dash);
      setLoading(false);
    };
    fetchData();
  }, [activePatientId]);

  const handleSavePatient = async (updates) => {
    const saved = await api.updatePatient(activePatientId, updates);
    // Update session
    const updatedSession = {
      ...caregiverSession,
      activePatient: saved,
      allPatients: (caregiverSession?.allPatients || []).map(p =>
        p.id === activePatientId ? saved : p
      ),
    };
    setCaregiverSession(updatedSession);
    setPatientsList(prev => {
      const idx = prev.findIndex(p => p.id === activePatientId);
      if (idx !== -1) return prev.map(p => p.id === activePatientId ? saved : p);
      return [...prev, saved];
    });
    setShowEditModal(false);
    // Reload dashboard
    const dash = await api.getCaregiverDashboard(activePatientId);
    setData(dash);
    showToast('Patient details updated successfully ✓');
  };

  // Export Handlers
  const handleExportCSV = () => {
    if (!data || !patient) return;
    
    // Export game scores as CSV
    const gameScores = data.recent_game_scores?.map(g => ({
      Game: g.game_type.replace('_', ' '),
      Score: `${g.score}%`,
      Difficulty: g.difficulty,
      Date: new Date(g.timestamp).toLocaleDateString(),
      Duration_Seconds: g.duration_seconds,
      Mistakes: g.mistakes
    })) || [];
    
    if (gameScores.length > 0) {
      exportToCSV(gameScores, `${patient.name}_cognitive_scores_${new Date().toISOString().split('T')[0]}`);
    }
    
    // Export reminders as CSV
    const reminders = data.today_reminders?.map(r => ({
      Title: r.title,
      Category: r.category,
      Time: r.time,
      Status: r.is_completed ? 'Completed' : 'Pending',
      Detail: r.dosage_or_detail,
      Date: new Date().toLocaleDateString()
    })) || [];
    
    if (reminders.length > 0) {
      setTimeout(() => {
        exportToCSV(reminders, `${patient.name}_reminders_${new Date().toISOString().split('T')[0]}`);
      }, 100);
    }
    
    setShowExportMenu(false);
    showToast('CSV reports downloaded ✓');
  };

  const handleExportJSON = () => {
    if (!data || !patient) return;
    
    const report = generateReport(patient, data);
    exportToJSON(report, `${patient.name}_full_report_${new Date().toISOString().split('T')[0]}`);
    
    setShowExportMenu(false);
    showToast('Complete JSON report downloaded ✓');
  };

  const handlePrintReport = () => {
    if (!data || !patient) return;
    
    const report = generateReport(patient, data);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>NeuroSathi NER - Clinical Report for ${patient.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            h1 { color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px; }
            h2 { color: #0f766e; margin-top: 30px; }
            h3 { color: #14b8a6; }
            .section { margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .label { font-weight: bold; color: #6b7280; }
            .value { color: #111827; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { padding: 8px; text-align: left; border: 1px solid #d1d5db; }
            th { background: #f0fdfa; color: #0d9488; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>NeuroSathi NER - Clinical Cognitive Report</h1>
          <div class="section">
            <h2>Patient Information</h2>
            <div class="row"><span class="label">Name:</span><span class="value">${report.patient.name}</span></div>
            <div class="row"><span class="label">Age:</span><span class="value">${report.patient.age}</span></div>
            <div class="row"><span class="label">Gender:</span><span class="value">${report.patient.gender}</span></div>
            <div class="row"><span class="label">Location:</span><span class="value">${report.patient.location}</span></div>
            <div class="row"><span class="label">Medical Stage:</span><span class="value">${report.patient.medical_stage}</span></div>
            <div class="row"><span class="label">Blood Group:</span><span class="value">${report.patient.blood_group || 'N/A'}</span></div>
            <div class="row"><span class="label">Doctor:</span><span class="value">${report.patient.doctor_name || 'N/A'} (${report.patient.doctor_phone || 'N/A'})</span></div>
            <div class="row"><span class="label">Hospital:</span><span class="value">${report.patient.doctor_hospital || 'N/A'}</span></div>
            <div class="row"><span class="label">Emergency Contact:</span><span class="value">${report.patient.emergency_contact_name} (${report.patient.emergency_contact_relation || ''}) - ${report.patient.emergency_contact_phone}</span></div>
          </div>
          
          <div class="section">
            <h2>Clinical Summary</h2>
            <div class="row"><span class="label">Cognitive Score:</span><span class="value">${report.summary.cognitive_score}</span></div>
            <div class="row"><span class="label">Medication Adherence:</span><span class="value">${report.summary.medication_adherence}</span></div>
            <div class="row"><span class="label">Daily Interactions:</span><span class="value">${report.summary.daily_interactions}</span></div>
            <div class="row"><span class="label">Total Stars:</span><span class="value">${report.summary.total_stars}</span></div>
            <div class="row"><span class="label">Current Streak:</span><span class="value">${report.summary.current_streak}</span></div>
            <div class="row"><span class="label">Missed Reminders:</span><span class="value">${report.summary.missed_reminders}</span></div>
            <div class="row"><span class="label">Active Alerts:</span><span class="value">${report.summary.active_alerts}</span></div>
          </div>
          
          <div class="section">
            <h2>Recent Game Scores</h2>
            <table>
              <thead><tr><th>Game</th><th>Score</th><th>Difficulty</th><th>Date</th><th>Duration</th></tr></thead>
              <tbody>
                ${report.recent_game_scores.map(g => `
                  <tr><td>${g.game}</td><td>${g.score}</td><td>${g.difficulty}</td><td>${g.date}</td><td>${g.duration}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h2>Today's Reminders</h2>
            <table>
              <thead><tr><th>Title</th><th>Category</th><th>Time</th><th>Status</th><th>Detail</th></tr></thead>
              <tbody>
                ${report.reminders_today.map(r => `
                  <tr><td>${r.title}</td><td>${r.category}</td><td>${r.time}</td><td>${r.status}</td><td>${r.detail}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h2>Active Alerts</h2>
            <table>
              <thead><tr><th>Type</th><th>Severity</th><th>Message</th><th>Date</th><th>Resolved</th></tr></thead>
              <tbody>
                ${report.alerts.map(a => `
                  <tr><td>${a.type}</td><td>${a.severity}</td><td>${a.message}</td><td>${a.date} ${a.time}</td><td>${a.resolved ? 'Yes' : 'No'}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            Report generated on ${new Date(report.generated_at).toLocaleString()}<br>
            NeuroSathi NER - SIH 2026 | Team Mavericks<br>
            This report is for cognitive stimulation tracking purposes only, not for clinical diagnosis.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
    
    setShowExportMenu(false);
    showToast('Print dialog opened ✓');
  };

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 font-bold">
        Loading Caregiver Clinical Hub...
      </div>
    );
  }

  // Chart data
  const gameScoreData = (data.recent_game_scores || []).map((g, idx) => ({
    name: `Session ${idx + 1}`,
    score: g.score,
    game: g.game_type.replace('_', ' ')
  })).reverse();

  const adherencePie = [
    { name: 'Completed', value: data.adherence_percentage, color: '#10B981' },
    { name: 'Pending / Missed', value: 100 - data.adherence_percentage, color: '#F59E0B' }
  ];

  return (
    <>
      {showEditModal && (
        <EditPatientModal
          patient={patient}
          onClose={() => setShowEditModal(false)}
          onSave={handleSavePatient}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 bg-slate-900 min-h-screen text-slate-100">

        {/* ── Top Patient Summary Card ─────────────────────────────────────── */}
        <div className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-cyan-600/30 border-2 border-cyan-400 p-1 flex items-center justify-center shrink-0">
                <User className="w-10 h-10 text-cyan-300" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    {patient?.name || 'Patient'}
                  </h1>
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Status: Good
                  </span>
                </div>

                <p className="text-sm text-slate-400 font-medium">
                  Age: <strong className="text-slate-200">{patient?.age || '—'}</strong>
                  {patient?.gender && <> • Gender: <strong className="text-slate-200">{patient.gender}</strong></>}
                  {patient?.blood_group && <> • Blood Group: <strong className="text-slate-200">{patient.blood_group}</strong></>}
                  {patient?.location && <> • <strong className="text-slate-200">{patient.location}</strong></>}
                </p>

                <p className="text-xs text-slate-400">
                  Caregiver: <strong className="text-cyan-300">{patient?.emergency_contact_name}</strong>
                  {patient?.emergency_contact_phone && <> ({patient.emergency_contact_phone})</>}
                </p>

                {/* Caregiver session info */}
                {caregiverSession?.caregiver?.name && (
                  <p className="text-xs text-slate-500">
                    Logged in as: <span className="text-amber-300 font-semibold">{caregiverSession.caregiver.name}</span>
                    {caregiverSession.caregiver.relation && ` (${caregiverSession.caregiver.relation})`}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
              {/* Patient Switcher (only if multiple patients) */}
              {allPatients.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setShowPatientSwitcher(!showPatientSwitcher)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-sm flex items-center gap-2 transition border border-slate-600"
                  >
                    <Users className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">{t.selectPatient || "Switch Patient"}</span>
                    {showPatientSwitcher ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {showPatientSwitcher && (
                    <div className="absolute right-0 top-full mt-2 z-30 bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl min-w-[220px] overflow-hidden">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 pt-3 pb-1">{t.selectActivePatient || "Select Patient"}</p>
                      {allPatients.map(p => (
                        <button
                          key={p.id}
                          onClick={() => { switchPatient(p); setShowPatientSwitcher(false); }}
                          className={`w-full text-left px-4 py-3 text-sm font-semibold transition flex items-center gap-2 ${
                            p.id === activePatientId
                              ? 'bg-cyan-700/30 text-cyan-300'
                              : 'text-slate-200 hover:bg-slate-700'
                          }`}
                        >
                          <User className="w-4 h-4 shrink-0" />
                          <div>
                            <p>{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{p.location || p.medical_stage}</p>
                          </div>
                          {p.id === activePatientId && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-cyan-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowEditModal(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-sm flex items-center gap-2 transition border border-slate-600"
              >
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">{t.editProfile || "Edit Patient"}</span>
              </button>

              <button
                onClick={() => navigateTo('caregiver', 'reminders_mgr')}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addReminder || "Add Med / Task"}</span>
              </button>

              <button
                onClick={() => navigateTo('elder', 'dashboard')}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm flex items-center gap-2 transition"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>{t.elderView || "Elder View"}</span>
              </button>

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-sm flex items-center gap-2 transition border border-slate-600"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">{t.exportCsv || "Export"}</span>
                  {showExportMenu ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-2 z-30 bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl min-w-[200px] overflow-hidden">
                    <button
                      onClick={handleExportCSV}
                      className="w-full text-left px-4 py-3 text-sm font-semibold transition flex items-center gap-2 text-slate-200 hover:bg-slate-700"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-green-400" />
                      <span>{t.exportCsv || "Download CSV Reports"}</span>
                    </button>
                    <button
                      onClick={handleExportJSON}
                      className="w-full text-left px-4 py-3 text-sm font-semibold transition flex items-center gap-2 text-slate-200 hover:bg-slate-700 border-t border-slate-700"
                    >
                      <FileType className="w-4 h-4 text-blue-400" />
                      <span>{t.exportJson || "Download Full JSON Report"}</span>
                    </button>
                    <button
                      onClick={handlePrintReport}
                      className="w-full text-left px-4 py-3 text-sm font-semibold transition flex items-center gap-2 text-slate-200 hover:bg-slate-700 border-t border-slate-700"
                    >
                      <Printer className="w-4 h-4 text-cyan-400" />
                      <span>{t.printReport || "Print Clinical Report"}</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={caregiverLogout}
                title={t.signOut || "Logout"}
                className="px-3 py-2.5 rounded-xl bg-slate-700/80 hover:bg-red-900/60 text-slate-400 hover:text-red-300 font-bold text-sm flex items-center gap-1.5 transition border border-slate-600 hover:border-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t.signOut || "Sign Out"}</span>
              </button>
            </div>
          </div>

          {/* Patient Details Toggle */}
          <div>
            <button
              onClick={() => setShowPatientDetails(!showPatientDetails)}
              className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
            >
              {showPatientDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showPatientDetails ? 'Hide' : 'Show'} Full Patient Details
            </button>

            {showPatientDetails && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 border-t border-slate-700 pt-5">
                {/* Personal & Medical */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Personal & Medical</p>
                  <DetailRow icon={User} label="Full Name" value={patient?.name} />
                  <DetailRow icon={Activity} label="Age & Gender" value={[patient?.age ? `${patient.age} years` : null, patient?.gender].filter(Boolean).join(' • ')} />
                  <DetailRow icon={Droplets} label="Blood Group" value={patient?.blood_group} color="text-rose-300" />
                  <DetailRow icon={MapPin} label="Location" value={patient?.location} />
                  <DetailRow icon={Brain} label="Medical Stage" value={patient?.medical_stage} color="text-purple-300" />
                  <DetailRow icon={AlertTriangle} label="Allergies" value={patient?.allergies} color="text-amber-300" />
                </div>

                {/* Doctor Info */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Doctor / Physician</p>
                  <DetailRow icon={Stethoscope} label="Doctor Name" value={patient?.doctor_name} color="text-purple-300" />
                  <DetailRow icon={Phone} label="Doctor Phone" value={patient?.doctor_phone} />
                  <DetailRow icon={MapPin} label="Hospital" value={patient?.doctor_hospital} />

                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-3">Emergency Contact</p>
                    <DetailRow icon={User} label="Contact Name" value={
                      [patient?.emergency_contact_name, patient?.emergency_contact_relation && `(${patient.emergency_contact_relation})`].filter(Boolean).join(' ')
                    } color="text-emerald-300" />
                    <DetailRow icon={Phone} label="Phone" value={patient?.emergency_contact_phone} />
                    <DetailRow icon={Mail} label="Email" value={patient?.emergency_contact_email} />
                  </div>
                </div>

                {/* Caregiver Notes */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Caregiver Notes</p>
                  {patient?.caregiver_notes ? (
                    <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 text-sm text-amber-100 leading-relaxed">
                      <FileText className="w-4 h-4 text-amber-400 mb-1.5" />
                      {patient.caregiver_notes}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm italic">No notes added yet.</p>
                  )}

                  {/* Quick Stats */}
                  <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Stats</p>
                    <div className="flex gap-3">
                      <div className="flex-1 bg-slate-700/40 rounded-xl p-3 text-center">
                        <p className="text-xl font-black text-amber-300">{patient?.total_stars || 0}⭐</p>
                        <p className="text-[10px] text-slate-400">Total Stars</p>
                      </div>
                      <div className="flex-1 bg-slate-700/40 rounded-xl p-3 text-center">
                        <p className="text-xl font-black text-cyan-300">{patient?.current_streak || 0}</p>
                        <p className="text-[10px] text-slate-400">Day Streak</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 4 Clinical KPI Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Cognitive Score</span>
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-purple-300">{data.average_cognitive_score}%</div>
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Stable &amp; Resilient
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Med Adherence</span>
              <Bell className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-300">{data.adherence_percentage}%</div>
            <p className="text-xs text-slate-400 font-semibold">{data.missed_reminders_count} pending / missed</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Daily Interactions</span>
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-cyan-300">{data.today_activity_count} Logs</div>
            <p className="text-xs text-cyan-400 font-semibold">Active stimulation ongoing</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Streak &amp; Stars</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-amber-300">
              {patient?.total_stars || data.patient_profile?.total_stars || 56} ⭐
            </div>
            <p className="text-xs text-amber-400 font-semibold">
              {patient?.current_streak || data.patient_profile?.current_streak || 4} consecutive days
            </p>
          </div>
        </div>

        {/* ── Analytics Charts ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Cognitive Performance Progression</h3>
                <p className="text-xs text-slate-400">Telemetry from Heritage Memory Match, Sequence Recall &amp; Object Recall</p>
              </div>
              <button onClick={() => navigateTo('caregiver', 'analytics')} className="text-xs font-bold text-cyan-400 hover:underline">
                Detailed Analytics →
              </button>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gameScoreData.length ? gameScoreData : [{ name: 'S1', score: 85 }, { name: 'S2', score: 92 }, { name: 'S3', score: 88 }, { name: 'S4', score: 95 }]}>
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis domain={[50, 100]} stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                  <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} dot={{ r: 6, fill: '#06b6d4' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Today's Routine Adherence</h3>
              <p className="text-xs text-slate-400">Medicine &amp; water completion rate</p>
            </div>
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={adherencePie} innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                    {adherencePie.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around text-xs font-bold pt-2 border-t border-slate-700">
              <span className="text-emerald-400">● Completed ({data.adherence_percentage}%)</span>
              <span className="text-amber-400">● Pending ({100 - data.adherence_percentage}%)</span>
            </div>
          </div>
        </div>

        {/* ── Alerts & Activity Feed ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Caregiver Alerts
              </h3>
              <span className="text-xs font-bold bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-700">
                {data.active_alerts?.length || 0} Notifications
              </span>
            </div>
            <div className="space-y-3">
              {(data.active_alerts || []).map(alt => (
                <div
                  key={alt.id}
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    alt.severity === 'warning'
                      ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                      : 'bg-slate-700/50 border-slate-600 text-slate-200'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{alt.message}</p>
                    <span className="text-[11px] text-slate-400 block">
                      {alt.timestamp ? new Date(alt.timestamp).toLocaleTimeString() : 'Recent'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Real-Time Interaction Feed
              </h3>
              <span className="text-xs font-bold text-slate-400">Live Telemetry</span>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {(data.recent_activity_timeline || []).map((log, i) => (
                <div key={log.id || i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-slate-200">{log.action}</span>
                  <span className="text-slate-400 font-mono">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
