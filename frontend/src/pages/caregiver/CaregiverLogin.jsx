import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  ShieldCheck, Eye, EyeOff, LogIn, UserPlus, ChevronDown, ChevronUp,
  Phone, Mail, Lock, User, MapPin, Heart, Stethoscope, AlertCircle,
  Loader2, ArrowLeft, Sparkles
} from 'lucide-react';

const INPUT_BASE =
  'w-full bg-slate-800/70 border border-slate-600 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-sm';

const LABEL = 'text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block';

function Field({ label, children }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  );
}

export default function CaregiverLogin() {
  const { navigateTo, setCaregiverSession, showToast } = useApp();

  // Login form
  const [contact, setContact] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Register patient toggle
  const [showRegister, setShowRegister] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Patient registration form
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    blood_group: '',
    location: '',
    medical_stage: 'Early-stage Dementia / MCI',
    allergies: '',
    doctor_name: '',
    doctor_phone: '',
    doctor_hospital: '',
    emergency_contact_name: '',
    emergency_contact_relation: '',
    emergency_contact_phone: '',
    emergency_contact_email: '',
    caregiver_notes: '',
    caregiver_pin: '1234',
    language_preference: 'en',
  });

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // --- Login ---
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!contact.trim()) { setError('Please enter your phone number or email.'); return; }
    if (!pin.trim()) { setError('Please enter your 4-digit PIN.'); return; }

    setLoading(true);
    setError('');

    const result = await api.caregiverLogin(contact.trim(), pin.trim());

    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Invalid credentials. Please try again.');
      return;
    }

    // Store session
    setCaregiverSession({
      caregiver: result.caregiver,
      activePatient: result.active_patient,
      allPatients: result.all_patients || [result.active_patient],
    });

    showToast(`Welcome back, ${result.caregiver?.name || 'Caregiver'}! 👋`);
    navigateTo('caregiver', 'dashboard');
  };

  // --- Register Patient ---
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Patient name is required.'); return; }
    if (!form.emergency_contact_phone.trim()) { setError('Caregiver phone number is required.'); return; }

    setRegistering(true);
    setError('');

    const result = await api.registerPatient({
      ...form,
      age: form.age ? parseInt(form.age) : 70,
      role: 'elder',
    });

    setRegistering(false);

    if (result.success) {
      setRegisterSuccess(true);
      setContact(form.emergency_contact_phone || form.emergency_contact_email || '');
      setPin(form.caregiver_pin || '1234');
      showToast(`Patient "${form.name}" registered successfully! You can now log in.`);
      setShowRegister(false);
    } else {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg space-y-6">
        {/* Back to landing */}
        <button
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        {/* Header Card */}
        <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-3xl p-8 shadow-2xl space-y-6">
          {/* Logo & Title */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-600/20 border-2 border-cyan-500/40 mx-auto">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Caregiver Portal</h1>
              <p className="text-slate-400 text-sm mt-1">
                Sign in to monitor your patient's health &amp; progress
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-700/40 rounded-full px-3 py-1 text-[11px] text-cyan-300 font-semibold">
              <Sparkles className="w-3 h-3" />
              Demo: contact <span className="font-mono mx-1">demo@care.in</span> • PIN <span className="font-mono mx-1">1234</span>
            </div>
          </div>

          {/* Registration success banner */}
          {registerSuccess && (
            <div className="bg-emerald-950/60 border border-emerald-700 rounded-xl px-4 py-3 text-emerald-300 text-sm font-semibold flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              Patient registered! Your credentials have been filled in below.
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-red-950/60 border border-red-700 rounded-xl px-4 py-3 text-red-300 text-sm font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Field label="Phone Number or Email">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. 9876543210 or caregiver@email.com"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  className={`${INPUT_BASE} pl-10`}
                  autoComplete="username"
                />
              </div>
            </Field>

            <Field label="Caregiver PIN (4 digits)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPin ? 'text' : 'password'}
                  placeholder="Enter your PIN"
                  value={pin}
                  maxLength={6}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  className={`${INPUT_BASE} pl-10 pr-10 tracking-[0.4em] text-lg`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-900/30"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</>
              ) : (
                <><LogIn className="w-5 h-5" /> Sign In to Portal</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          {/* Register Toggle */}
          <button
            type="button"
            onClick={() => { setShowRegister(!showRegister); setError(''); }}
            className="w-full py-3 rounded-xl border border-slate-600 hover:border-cyan-500 text-slate-300 hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <UserPlus className="w-4 h-4 text-cyan-400" />
            Register a New Patient
            {showRegister ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </button>
        </div>

        {/* Patient Registration Form */}
        {showRegister && (
          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600/20 border border-teal-500/40 flex items-center justify-center">
                <User className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">New Patient Registration</h2>
                <p className="text-slate-400 text-xs">Fill in the patient's medical &amp; contact information</p>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              {/* Section: Patient Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <Heart className="w-3.5 h-3.5" /> Patient Information
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Full Name *">
                    <input
                      className={INPUT_BASE}
                      placeholder="e.g. Bhaben Kalita"
                      value={form.name}
                      onChange={e => updateForm('name', e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Age">
                    <input
                      type="number"
                      className={INPUT_BASE}
                      placeholder="e.g. 74"
                      value={form.age}
                      onChange={e => updateForm('age', e.target.value)}
                      min={40} max={120}
                    />
                  </Field>
                  <Field label="Gender">
                    <select
                      className={INPUT_BASE}
                      value={form.gender}
                      onChange={e => updateForm('gender', e.target.value)}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </Field>
                  <Field label="Blood Group">
                    <select
                      className={INPUT_BASE}
                      value={form.blood_group}
                      onChange={e => updateForm('blood_group', e.target.value)}
                    >
                      <option value="">Select...</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                        <option key={bg}>{bg}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Location">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        className={`${INPUT_BASE} pl-10`}
                        placeholder="e.g. Guwahati, Assam"
                        value={form.location}
                        onChange={e => updateForm('location', e.target.value)}
                      />
                    </div>
                  </Field>
                  <Field label="Language Preference">
                    <select
                      className={INPUT_BASE}
                      value={form.language_preference}
                      onChange={e => updateForm('language_preference', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="as">Assamese</option>
                      <option value="bn">Bengali</option>
                      <option value="hi">Hindi</option>
                      <option value="mni">Manipuri</option>
                      <option value="lus">Mizo</option>
                    </select>
                  </Field>
                </div>
              </div>

              {/* Section: Medical Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                  <Stethoscope className="w-3.5 h-3.5" /> Medical Information
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Medical Stage">
                    <select
                      className={INPUT_BASE}
                      value={form.medical_stage}
                      onChange={e => updateForm('medical_stage', e.target.value)}
                    >
                      <option>Early-stage Dementia / MCI</option>
                      <option>Moderate Alzheimer's</option>
                      <option>Advanced Dementia</option>
                      <option>Post-stroke Cognitive Impairment</option>
                      <option>Other / Undiagnosed</option>
                    </select>
                  </Field>
                  <Field label="Known Allergies">
                    <input
                      className={INPUT_BASE}
                      placeholder="e.g. Penicillin, Nuts"
                      value={form.allergies}
                      onChange={e => updateForm('allergies', e.target.value)}
                    />
                  </Field>
                  <Field label="Doctor Name">
                    <input
                      className={INPUT_BASE}
                      placeholder="e.g. Dr. Anupam Sarma"
                      value={form.doctor_name}
                      onChange={e => updateForm('doctor_name', e.target.value)}
                    />
                  </Field>
                  <Field label="Doctor Phone">
                    <input
                      className={INPUT_BASE}
                      placeholder="+91 98640 12345"
                      value={form.doctor_phone}
                      onChange={e => updateForm('doctor_phone', e.target.value)}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Doctor Hospital">
                      <input
                        className={INPUT_BASE}
                        placeholder="e.g. Guwahati Neurological Center, Assam"
                        value={form.doctor_hospital}
                        onChange={e => updateForm('doctor_hospital', e.target.value)}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Section: Caregiver Contact */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" /> Caregiver &amp; Emergency Contact
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Caregiver Name">
                    <input
                      className={INPUT_BASE}
                      placeholder="e.g. Priya Sharma"
                      value={form.emergency_contact_name}
                      onChange={e => updateForm('emergency_contact_name', e.target.value)}
                    />
                  </Field>
                  <Field label="Relation to Patient">
                    <input
                      className={INPUT_BASE}
                      placeholder="e.g. Daughter, Nurse"
                      value={form.emergency_contact_relation}
                      onChange={e => updateForm('emergency_contact_relation', e.target.value)}
                    />
                  </Field>
                  <Field label="Caregiver Phone *">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        className={`${INPUT_BASE} pl-10`}
                        placeholder="+91 98765 43210"
                        value={form.emergency_contact_phone}
                        onChange={e => updateForm('emergency_contact_phone', e.target.value)}
                        required
                      />
                    </div>
                  </Field>
                  <Field label="Caregiver Email">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        className={`${INPUT_BASE} pl-10`}
                        placeholder="caregiver@email.com"
                        type="email"
                        value={form.emergency_contact_email}
                        onChange={e => updateForm('emergency_contact_email', e.target.value)}
                      />
                    </div>
                  </Field>
                  <Field label="Login PIN (4 digits)">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        className={`${INPUT_BASE} pl-10 tracking-[0.3em]`}
                        placeholder="e.g. 1234"
                        maxLength={6}
                        value={form.caregiver_pin}
                        onChange={e => updateForm('caregiver_pin', e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </Field>
                </div>
                <Field label="Caregiver Notes">
                  <textarea
                    className={`${INPUT_BASE} h-20 resize-none`}
                    placeholder="Any special care instructions, behavioural notes, or daily routine details..."
                    value={form.caregiver_notes}
                    onChange={e => updateForm('caregiver_notes', e.target.value)}
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={registering}
                className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-bold text-base flex items-center justify-center gap-2 transition shadow-lg"
              >
                {registering ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Registering Patient...</>
                ) : (
                  <><UserPlus className="w-5 h-5" /> Register Patient</>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
