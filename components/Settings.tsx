
import React, { useState, useEffect, useRef } from 'react';
import { Save, Store, MapPin, Phone, Mail, ShieldCheck, LogOut, User, CheckCircle, Lock, Fingerprint, Upload, Image as ImageIcon, Palette, AlertOctagon } from 'lucide-react';
import { UserProfile, BusinessDetails } from '../types';

interface SettingsProps {
  onLogout: () => void;
  user: UserProfile | null;
}

const Settings: React.FC<SettingsProps> = ({ onLogout, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [kitchenStatus, setKitchenStatus] = useState<'Open' | 'Closed' | 'Busy'>('Open');
  
  const [profile, setProfile] = useState({
    kitchenName: user?.kitchenName || "Alina's Kitchen",
    ownerName: user?.name || "Alina",
    email: user?.email || "orders@alinaskitchen.nl",
    phone: "+31 6 1234 5678",
    kvkNumber: user?.businessDetails?.kvkNumber || "12345678",
    address: user?.businessDetails?.address || "Keizersgracht 123, 1015 CJ Amsterdam",
    legalForm: user?.businessDetails?.legalForm || "Eenmanszaak",
    sector: user?.businessDetails?.sector || "Cloud Kitchen",
    twoFactorEnabled: user?.securitySettings?.twoFactorEnabled || false,
    biometricsEnabled: user?.securitySettings?.biometricsEnabled || false,
    logoUrl: user?.logoUrl || '',
    themeColor: user?.themeColor || 'teal'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setProfile(p => ({
        ...p,
        kitchenName: user.kitchenName || p.kitchenName,
        ownerName: user.name || p.ownerName,
        email: user.email || p.email,
        kvkNumber: user.businessDetails?.kvkNumber || p.kvkNumber,
        address: user.businessDetails?.address || p.address,
        legalForm: user.businessDetails?.legalForm || p.legalForm,
        sector: user.businessDetails?.sector || p.sector,
        twoFactorEnabled: user.securitySettings?.twoFactorEnabled || p.twoFactorEnabled,
        biometricsEnabled: user.securitySettings?.biometricsEnabled || p.biometricsEnabled,
        logoUrl: user.logoUrl || p.logoUrl,
        themeColor: user.themeColor || p.themeColor
      }));
    }
  }, [user]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setProfile(prev => ({...prev, logoUrl: reader.result as string}));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSave = () => {
    setIsEditing(false);
    
    const updatedBusiness: BusinessDetails = {
        ...(user?.businessDetails as BusinessDetails),
        tradeName: profile.kitchenName,
        kvkNumber: profile.kvkNumber,
        address: profile.address,
        legalForm: profile.legalForm as any,
        sector: profile.sector as any
    };

    const updatedUser: UserProfile = {
        ...user!,
        name: profile.ownerName,
        email: profile.email,
        kitchenName: profile.kitchenName,
        logoUrl: profile.logoUrl,
        themeColor: profile.themeColor as any,
        businessDetails: updatedBusiness,
        securitySettings: {
            twoFactorEnabled: profile.twoFactorEnabled,
            biometricsEnabled: profile.biometricsEnabled
        }
    };

    localStorage.setItem('kitchen_user', JSON.stringify(updatedUser));
    // Force reload to apply theme/logo changes globally without complex context for this demo
    alert("Profile & Security settings updated successfully!");
    window.location.reload(); 
  };

  const handleFactoryReset = () => {
      if(window.confirm("DANGER: This will delete ALL data (Orders, Invoices, Settings). Are you absolutely sure?")) {
          localStorage.clear();
          window.location.reload();
      }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Settings & Profile</h2>
          <p className="text-gray-500">Manage your cloud kitchen details and security</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Kitchen Status:</span>
                <select 
                    value={kitchenStatus}
                    onChange={(e) => setKitchenStatus(e.target.value as any)}
                    className={`text-sm font-bold focus:outline-none w-full md:w-auto ${
                        kitchenStatus === 'Open' ? 'text-green-600' : 
                        kitchenStatus === 'Busy' ? 'text-spice-600' : 'text-red-600'
                    }`}
                >
                    <option value="Open">Open for Orders</option>
                    <option value="Busy">High Volume (Delayed)</option>
                    <option value="Closed">Closed</option>
                </select>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Profile Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Store size={20} className="text-teal-600" />
              Business Profile {user?.role === 'admin' && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full">ADMIN</span>}
            </h3>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-teal-600 text-sm font-medium hover:text-teal-700"
              >
                Edit Details
              </button>
            ) : (
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                <Save size={16} /> Save Changes
              </button>
            )}
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-6">
                 {/* Logo Upload */}
                 <div className="flex-shrink-0 text-center">
                     <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden mb-2 relative group">
                         {profile.logoUrl ? (
                             <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                         ) : (
                             <ImageIcon className="text-gray-400" />
                         )}
                         {isEditing && (
                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                 <Upload className="text-white" size={20} />
                             </div>
                         )}
                     </div>
                     <input type="file" ref={fileInputRef} className="hidden" onChange={handleLogoUpload} accept="image/*" />
                     <p className="text-xs text-gray-500">Kitchen Logo</p>
                 </div>

                 <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Kitchen Name</label>
                        <input 
                        disabled={!isEditing}
                        value={profile.kitchenName}
                        onChange={(e) => setProfile({...profile, kitchenName: e.target.value})}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:font-medium disabled:text-gray-800 transition-all focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Owner Name</label>
                        <input 
                        disabled={!isEditing}
                        value={profile.ownerName}
                        onChange={(e) => setProfile({...profile, ownerName: e.target.value})}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:font-medium disabled:text-gray-800 transition-all focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Mail size={12}/> Contact Email</label>
                        <input 
                        disabled={!isEditing}
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:font-medium disabled:text-gray-800 transition-all focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Phone size={12}/> Phone</label>
                        <input 
                        disabled={!isEditing}
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:font-medium disabled:text-gray-800 transition-all focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                        />
                    </div>
                 </div>
            </div>
            
            <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><MapPin size={12}/> Address</label>
                <input 
                  disabled={!isEditing}
                  value={profile.address}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:font-medium disabled:text-gray-800 transition-all focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                />
            </div>

            {/* Branding Section */}
             {isEditing && (
                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                     <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-2"><Palette size={14}/> Theme Customization</h4>
                     <div className="flex gap-4">
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="theme" value="teal" checked={profile.themeColor === 'teal'} onChange={() => setProfile({...profile, themeColor: 'teal'})} />
                             <span className="text-sm">Teal (Default)</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="theme" value="orange" checked={profile.themeColor === 'orange'} onChange={() => setProfile({...profile, themeColor: 'orange'})} />
                             <span className="text-sm">Spicy Orange</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="theme" value="blue" checked={profile.themeColor === 'blue'} onChange={() => setProfile({...profile, themeColor: 'blue'})} />
                             <span className="text-sm">Royal Blue</span>
                         </label>
                     </div>
                 </div>
             )}

            <div className="pt-6 border-t border-gray-100">
               <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <ShieldCheck size={16} className="text-gray-400"/> 
                 Legal & Registration
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">KVK Number</label>
                    <input 
                      disabled={!isEditing}
                      value={profile.kvkNumber}
                      onChange={(e) => setProfile({...profile, kvkNumber: e.target.value})}
                      className="w-full font-mono text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:text-gray-800 transition-all focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </div>
                   <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Legal Form</label>
                    <select
                      disabled={!isEditing}
                      value={profile.legalForm}
                      onChange={(e) => setProfile({...profile, legalForm: e.target.value as BusinessDetails['legalForm']})}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:text-gray-800 transition-all disabled:appearance-none outline-none"
                    >
                        <option value="Eenmanszaak">Eenmanszaak</option>
                        <option value="VOF">VOF</option>
                        <option value="BV">BV</option>
                        <option value="Stichting">Stichting</option>
                    </select>
                  </div>
                   <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Sector</label>
                    <select
                      disabled={!isEditing}
                      value={profile.sector}
                      onChange={(e) => setProfile({...profile, sector: e.target.value as BusinessDetails['sector']})}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 disabled:bg-transparent disabled:border-transparent disabled:px-0 disabled:text-gray-800 transition-all disabled:appearance-none outline-none"
                    >
                        <option value="Cloud Kitchen">Cloud Kitchen</option>
                        <option value="Catering">Catering</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Retail">Retail</option>
                    </select>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Security & Actions */}
        <div className="space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <Lock size={18} className="text-teal-600" /> Security
             </h3>
             <div className="space-y-4">
                 <div className="flex items-center justify-between">
                     <div>
                         <p className="text-sm font-medium text-gray-700">Two-Factor Auth</p>
                         <p className="text-xs text-gray-500">Verify via SMS/App</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            disabled={!isEditing}
                            className="sr-only peer" 
                            checked={profile.twoFactorEnabled}
                            onChange={(e) => setProfile({...profile, twoFactorEnabled: e.target.checked})}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                     </label>
                 </div>
                 <div className="flex items-center justify-between">
                     <div>
                         <p className="text-sm font-medium text-gray-700">Biometric Login</p>
                         <p className="text-xs text-gray-500">FaceID / TouchID</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            disabled={!isEditing}
                            className="sr-only peer" 
                            checked={profile.biometricsEnabled}
                            onChange={(e) => setProfile({...profile, biometricsEnabled: e.target.checked})}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                     </label>
                 </div>
             </div>
           </div>
           
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={18} className="text-gray-400" /> Account
              </h3>
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                <LogOut size={16} /> Log Out
              </button>
           </div>
           
           {/* SUPER ADMIN ZONE */}
           {user?.role === 'admin' && (
               <div className="bg-red-50 rounded-xl border border-red-100 p-6">
                   <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                       <AlertOctagon size={18} /> Danger Zone
                   </h3>
                   <p className="text-xs text-red-600 mb-4">You have Admin access. You can reset all application data.</p>
                   <button 
                       onClick={handleFactoryReset}
                       className="w-full bg-red-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-red-700"
                   >
                       Factory Reset Data
                   </button>
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Settings;