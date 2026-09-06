import React from 'react';
import { X, ShieldCheck, Lock, Key, Server, Database, CheckCircle2, Cloud } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityArchitectureModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const securityItems = [
    {
      title: 'Zero Client Credential Exposure',
      icon: <Key className="w-4 h-4 text-emerald-600" />,
      desc: 'Gemini API keys and Google Cloud service credentials never exist in the client bundle. All AI requests proxy through an authenticated server-side API endpoint.',
    },
    {
      title: 'Firebase Auth & Google Sign-In',
      icon: <Lock className="w-4 h-4 text-indigo-600" />,
      desc: 'Users authenticate via official Google OAuth with Firebase Authentication. Client requests send cryptographic Bearer ID tokens to the server.',
    },
    {
      title: 'Server-Side Bearer Token Verification',
      icon: <Server className="w-4 h-4 text-amber-600" />,
      desc: 'The Node.js Express backend validates the user identity token using Firebase Admin SDK public keys before processing any task.',
    },
    {
      title: 'User-Isolated Cloud Firestore Rules',
      icon: <Database className="w-4 h-4 text-cyan-600" />,
      desc: 'Firestore rules strictly enforce path-level isolation (users/{userId}/tasks/{taskId}) matching request.auth.uid == userId. Insecure rules (allow read, write: if true) are prohibited.',
    },
    {
      title: 'Untrusted Content Sanitization & Delimiters',
      icon: <ShieldCheck className="w-4 h-4 text-rose-600" />,
      desc: 'User operational tasks, emails, and notes are treated as untrusted data, enclosed in strict XML delimiters with schema-constrained JSON outputs to prevent prompt injection.',
    },
    {
      title: 'Cloud Run & Secret Manager Ready',
      icon: <Cloud className="w-4 h-4 text-violet-600" />,
      desc: 'Production deployment utilizes Google Cloud Secret Manager to mount GEMINI_API_KEY as an environment variable into Cloud Run container instances.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Security & Cloud Architecture Specification
              </h3>
              <p className="text-xs text-slate-500">
                Production-grade compliance for Google Cloud, Gemini, and Firebase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {securityItems.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-md bg-white border border-slate-200 shadow-2xs">
                    {item.icon}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Firestore rules snippet preview */}
          <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span>Deployed Firestore Security Rules: /firestore.rules</span>
              <span className="text-emerald-400 font-sans font-semibold">Active & Enforced</span>
            </div>
            <pre className="text-[11px] leading-relaxed overflow-x-auto text-slate-300">
{`match /users/{userId}/tasks/{taskId} {
  allow read, delete: if request.auth != null && request.auth.uid == userId;
  allow create: if request.auth != null && request.auth.uid == userId
                && request.resource.data.keys().hasAll([...schema])
                && request.resource.data.priority in ['High', 'Medium', 'Low'];
  allow update: if request.auth != null && request.auth.uid == userId;
}`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            Close Specification
          </button>
        </div>
      </div>
    </div>
  );
};
