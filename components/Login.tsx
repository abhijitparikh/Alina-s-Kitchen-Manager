
import React, { useState } from 'react';
import { ArrowRight, Store, Mail, Lock, User, Building2, CheckCircle2, FileText, Beer, Users, Calculator, Fingerprint, ShieldCheck, ScanFace } from 'lucide-react';
import { UserProfile, BusinessDetails } from '../types';

interface LoginProps {
  onLogin: (profile: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'auth' | 'details' | '2fa'>('auth');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  // Auth State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    kitchenName: '',
  });

  // Business Details State (For Compliance)
  const [businessData, setBusinessData] = useState<BusinessDetails>({
    kvkNumber: '',
    tradeName: '',
    legalForm: 'Eenmanszaak',
    address: '',
    sector: 'Cloud Kitchen',
    hasStaff: false,
    servesAlcohol: false,
    isKorEligible: false
  });

  const validatePassword = (password: string) => {
    // Min 8 chars, 1 number, 1 special char
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  // Step 1: Handle Sign In / Sign Up
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (mode === 'signup') {
      if (!validatePassword(formData.password)) {
        setError('Password must be 8+ chars, include a number and a special character.');
        return;
      }
      if (!formData.name || !formData.kitchenName) {
        setError('Please provide your name and kitchen name');
        return;
      }
      // If Signing Up, move to Business Details step
      setBusinessData(prev => ({...prev, tradeName: formData.kitchenName}));
      setStep('details');
    } else {
      // Check for Super Admin Credential
      if (formData.email === 'admin@alinaskitchen.nl' && formData.password === 'admin123!') {
           const adminProfile: UserProfile = {
              email: formData.email,
              name: 'Super Admin',
              kitchenName: "Alina's Kitchen (Admin)",
              role: 'admin',
              businessDetails: {
                  kvkNumber: 'ADMIN-001',
                  tradeName: "Alina's Kitchen",
                  legalForm: 'BV',
                  sector: 'Cloud Kitchen',
                  address: 'Admin HQ, Amsterdam',
                  hasStaff: true,
                  servesAlcohol: true,
                  isKorEligible: false
              },
              securitySettings: { twoFactorEnabled: false, biometricsEnabled: false }
           };
           localStorage.setItem('kitchen_user', JSON.stringify(adminProfile));
           onLogin(adminProfile);
           return;
      }

      // Standard User Sign In Flow
      const storedUser = localStorage.getItem('kitchen_user');
      if (storedUser) {
        const user: UserProfile = JSON.parse(storedUser);
        // Mock password check (accept any password for demo if emails match)
        if (user.email === formData.email) {
          if (user.securitySettings?.twoFactorEnabled) {
            setStep('2fa');
          } else {
            onLogin(user);
          }
        } else {
          // Demo Fallback
          completeDemoLogin();
        }
      } else {
         // Demo Fallback
         completeDemoLogin();
      }
    }
  };

  const completeDemoLogin = () => {
     setTimeout(() => {
        const profile: UserProfile = {
          email: formData.email,
          name: 'Alina', 
          kitchenName: "Alina's Kitchen",
          role: 'user',
          businessDetails: {
            kvkNumber: '87654321',
            tradeName: "Alina's Kitchen",
            legalForm: 'Eenmanszaak',
            sector: 'Cloud Kitchen',
            address: 'Keizersgracht 123, Amsterdam',
            hasStaff: false,
            servesAlcohol: false,
            isKorEligible: false
          },
          securitySettings: {
            twoFactorEnabled: false,
            biometricsEnabled: false
          }
        };
        localStorage.setItem('kitchen_user', JSON.stringify(profile));
        onLogin(profile);
      }, 800);
  };

  const handleBiometricLogin = () => {
    // Simulation
    alert("Scanning Face ID...");
    setTimeout(() => {
       const storedUser = localStorage.getItem('kitchen_user');
       if (storedUser) {
         onLogin(JSON.parse(storedUser));
       } else {
         completeDemoLogin();
       }
    }, 1000);
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode === '123456') {
      const storedUser = localStorage.getItem('kitchen_user');
      if (storedUser) onLogin(JSON.parse(storedUser));
    } else {
      setError('Invalid code. Try 123456');
    }
  };

  // Step 2: Finalize Profile
  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if(!businessData.kvkNumber || !businessData.address) {
        setError("Please enter KVK number and Address.");
        return;
    }

    const profile: UserProfile = {
      email: formData.email,
      name: formData.name,
      kitchenName: businessData.tradeName,
      role: 'user',
      businessDetails: businessData,
      securitySettings: {
        twoFactorEnabled: false,
        biometricsEnabled: false
      }
    };
    
    localStorage.setItem('kitchen_user', JSON.stringify(profile));
    onLogin(profile);
  };

  return (
    <div className="min-h-screen bg-teal-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="inline-flex bg-white/20 p-4 rounded-full mb-4 backdrop-blur-sm border border-white/30">
             <img 
               src="logo.png" 
               alt="Logo" 
               className="w-16 h-16 object-contain"
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.parentElement!.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" x2="18" y1="17" y2="17"/></svg>';
               }}
             />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Alina's Kitchen Manager</h1>
          <p className="text-teal-100 mt-2 text-sm">Authentic Taste, Secure Management</p>
          
          {/* Step Progress */}
          {mode === 'signup' && (
             <div className="flex items-center justify-center gap-2 mt-4">
                <div className={`h-2 w-8 rounded-full transition-all ${step === 'auth' ? 'bg-white' : 'bg-teal-300/50'}`}></div>
                <div className={`h-2 w-8 rounded-full transition-all ${step === 'details' ? 'bg-white' : 'bg-teal-300/50'}`}></div>
             </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          {step === '2fa' ? (
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div className="text-center">
                <div className="bg-teal-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500 mb-4">Enter the 6-digit code sent to your device.</p>
              </div>
              <input 
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="000000"
                className="w-full text-center text-2xl tracking-widest border border-gray-200 rounded-xl py-3 focus:ring-2 focus:ring-teal-500 outline-none"
                maxLength={6}
              />
               {error && <p className="text-red-500 text-xs text-center">{error}</p>}
               <button type="submit" className="w-full bg-teal-800 text-white py-3 rounded-xl font-medium">Verify</button>
            </form>
          ) : step === 'auth' ? (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input 
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                        placeholder="Your Name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Kitchen Name</label>
                    <div className="relative">
                      <Store className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input 
                        type="text"
                        value={formData.kitchenName}
                        onChange={e => setFormData({...formData, kitchenName: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                        placeholder="e.g. Curry Express"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    placeholder="name@kitchen.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                {mode === 'signup' && (
                  <p className="text-[10px] text-gray-400 mt-1 ml-1">
                    Must contain 8+ chars, 1 number, 1 special character.
                  </p>
                )}
              </div>

              {error && (
                <div className="text-red-500 text-xs text-center bg-red-50 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-teal-800 text-white py-3 rounded-xl font-medium hover:bg-teal-900 transition-colors flex items-center justify-center gap-2 mt-2 shadow-lg shadow-teal-200"
              >
                {mode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
              </button>

              {mode === 'signin' && (
                <button 
                  type="button"
                  onClick={handleBiometricLogin}
                  className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ScanFace size={18} /> Login with Face ID
                </button>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  {mode === 'signin' ? "New to Kitchen Manager?" : "Already have an account?"}
                  <button 
                    type="button"
                    onClick={() => {
                      setMode(mode === 'signin' ? 'signup' : 'signin');
                      setError('');
                    }}
                    className="ml-2 text-teal-600 font-bold hover:underline"
                  >
                    {mode === 'signin' ? "Create Profile" : "Log In"}
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCompleteProfile} className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Compliance Setup</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Enter your business details so we can generate an accurate checklist for Dutch regulations.
                </p>
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="block text-xs font-bold text-gray-700 mb-1">Legal Form</label>
                       <select 
                         className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500 outline-none"
                         value={businessData.legalForm}
                         onChange={e => setBusinessData({...businessData, legalForm: e.target.value as any})}
                       >
                         <option value="Eenmanszaak">Eenmanszaak</option>
                         <option value="VOF">VOF (Partnership)</option>
                         <option value="BV">BV (Limited Company)</option>
                         <option value="Stichting">Stichting</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-700 mb-1">Sector</label>
                       <select 
                         className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500 outline-none"
                         value={businessData.sector}
                         onChange={e => setBusinessData({...businessData, sector: e.target.value as any})}
                       >
                         <option value="Cloud Kitchen">Cloud Kitchen</option>
                         <option value="Catering">Catering</option>
                         <option value="Restaurant">Restaurant</option>
                         <option value="Retail">Retail</option>
                       </select>
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">KVK Number</label>
                    <input 
                        type="text" 
                        value={businessData.kvkNumber}
                        onChange={e => setBusinessData({...businessData, kvkNumber: e.target.value})}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500 outline-none"
                        placeholder="8 digits (e.g. 12345678)"
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Business Address</label>
                    <input 
                        type="text" 
                        value={businessData.address}
                        onChange={e => setBusinessData({...businessData, address: e.target.value})}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500 outline-none"
                        placeholder="Street, Postcode, City"
                    />
                 </div>

                 <div className="bg-gray-50 p-3 rounded-xl space-y-3 border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Operational Details</h4>
                    
                    <label className="flex items-center justify-between cursor-pointer">
                       <div className="flex items-center gap-2">
                         <Beer size={16} className="text-orange-500" />
                         <span className="text-sm text-gray-700">Do you serve Alcohol?</span>
                       </div>
                       <input 
                         type="checkbox" 
                         className="w-5 h-5 text-teal-600 rounded"
                         checked={businessData.servesAlcohol}
                         onChange={e => setBusinessData({...businessData, servesAlcohol: e.target.checked})}
                       />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                       <div className="flex items-center gap-2">
                         <Users size={16} className="text-blue-500" />
                         <span className="text-sm text-gray-700">Do you hire Staff?</span>
                       </div>
                       <input 
                         type="checkbox" 
                         className="w-5 h-5 text-teal-600 rounded"
                         checked={businessData.hasStaff}
                         onChange={e => setBusinessData({...businessData, hasStaff: e.target.checked})}
                       />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                       <div className="flex items-center gap-2">
                         <Calculator size={16} className="text-green-500" />
                         <span className="text-sm text-gray-700">Revenue &lt; €20,000/yr? (KOR)</span>
                       </div>
                       <input 
                         type="checkbox" 
                         className="w-5 h-5 text-teal-600 rounded"
                         checked={businessData.isKorEligible}
                         onChange={e => setBusinessData({...businessData, isKorEligible: e.target.checked})}
                       />
                    </label>
                 </div>
              </div>

              {error && <p className="text-red-500 text-xs text-center">{error}</p>}

              <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setStep('auth')}
                    className="flex-1 bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    className="flex-2 w-full bg-teal-800 text-white py-3 rounded-xl font-medium hover:bg-teal-900 transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    Generate Dashboard <CheckCircle2 size={18} />
                  </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-gray-400 text-xs text-center">
        &copy; 2024 Alina's Kitchen Operations.
      </p>
    </div>
  );
};

export default Login;