
import React, { useState, useEffect } from 'react';
import { UserProfile, ComplianceItem, BusinessDetails } from '../types';
import { generateComplianceChecklist } from '../services/geminiService';
import { ShieldCheck, CheckCircle2, Download, Loader2, ExternalLink, Beer, Users, Calculator, Briefcase, AlertCircle } from 'lucide-react';

interface ComplianceManagerProps {
  user: UserProfile | null;
}

const ComplianceManager: React.FC<ComplianceManagerProps> = ({ user }) => {
  const [complianceList, setComplianceList] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompliance = async () => {
      if (!user?.businessDetails) {
        // Fallback default if missing
        const mockDetails: BusinessDetails = {
          kvkNumber: 'Unknown',
          tradeName: user?.kitchenName || 'My Kitchen',
          legalForm: 'Eenmanszaak',
          sector: 'Cloud Kitchen',
          address: 'Netherlands',
          hasStaff: false,
          servesAlcohol: false,
          isKorEligible: false
        };
        const items = await generateComplianceChecklist(mockDetails);
        mapAiToState(items);
      } else {
        const items = await generateComplianceChecklist(user.businessDetails);
        mapAiToState(items);
      }
      setLoading(false);
    };

    fetchCompliance();
  }, [user]);

  const mapAiToState = (aiItems: any[]) => {
    const mapped: ComplianceItem[] = aiItems.map((item, index) => ({
      id: index.toString(),
      title: item.title,
      description: item.description,
      priority: item.priority,
      category: item.category,
      status: 'Pending'
    }));
    setComplianceList(mapped);
  };

  const updateStatus = (id: string, newStatus: 'Pending' | 'In Progress' | 'Compliant') => {
    setComplianceList(prev => prev.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Compliant': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
     switch(priority) {
       case 'High': return 'text-red-600 bg-red-50 border-red-100';
       case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-100';
       default: return 'text-gray-600 bg-gray-50 border-gray-100';
     }
  };

  const downloadReport = () => {
    const report = `
COMPLIANCE REPORT - ALINA'S KITCHEN
Date: ${new Date().toLocaleDateString()}
KVK: ${user?.businessDetails?.kvkNumber || 'N/A'}
Legal Form: ${user?.businessDetails?.legalForm || 'N/A'}
Activity: ${user?.businessDetails?.sector || 'N/A'}

STATUS SUMMARY:
----------------
${complianceList.map(item => `[${item.status.toUpperCase()}] ${item.title}\nPriority: ${item.priority}\nNotes: ${item.description}\n`).join('\n')}
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Compliance_Report_Alinas_Kitchen.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const business = user?.businessDetails;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="text-teal-600" /> Compliance & Legal
          </h2>
          <p className="text-gray-500">
             Regulatory requirements for <span className="font-medium text-gray-700">{business?.tradeName}</span> ({business?.legalForm})
          </p>
        </div>
        <button 
          onClick={downloadReport}
          className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 font-medium flex items-center gap-2 transition-colors"
        >
           <Download size={18} /> Export Report
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-100">
          <Loader2 className="animate-spin text-teal-600 mb-3" size={32} />
          <p className="text-gray-500">Analyzing Dutch Regulations for your profile...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            {complianceList.map((item) => (
              <div key={item.id} className={`bg-white p-5 rounded-xl shadow-sm border border-l-4 transition-all ${
                item.priority === 'High' && item.status !== 'Compliant' ? 'border-l-red-500 border-gray-100' : 
                item.status === 'Compliant' ? 'border-l-green-500 border-gray-100' : 'border-l-gray-300 border-gray-100'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                       <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(item.priority)}`}>
                         {item.priority} Priority
                       </span>
                       <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{item.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">{item.description}</p>
                  </div>
                  
                  {/* Status Dropdown */}
                  <div className="ml-4">
                    <select 
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value as any)}
                      className={`text-xs font-bold py-1.5 px-3 rounded-lg cursor-pointer outline-none border ${getStatusColor(item.status)}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Compliant">Compliant</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
             <div className="bg-teal-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Briefcase size={100} />
                </div>
                <h3 className="text-lg font-bold mb-4 relative z-10">Registered Profile</h3>
                
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="text-teal-200 text-xs uppercase">Legal Form</div>
                        <div className="font-medium">{business?.legalForm}</div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="text-teal-200 text-xs uppercase">KVK Number</div>
                        <div className="font-mono bg-teal-800 px-2 py-0.5 rounded text-xs">{business?.kvkNumber || 'Pending'}</div>
                    </div>
                    <div className="border-t border-teal-800 pt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Beer size={14} className={business?.servesAlcohol ? "text-orange-400" : "text-gray-500"} />
                            <span className={business?.servesAlcohol ? "text-white" : "text-teal-300"}>
                                {business?.servesAlcohol ? "Serves Alcohol" : "No Alcohol"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Users size={14} className={business?.hasStaff ? "text-blue-400" : "text-gray-500"} />
                            <span className={business?.hasStaff ? "text-white" : "text-teal-300"}>
                                {business?.hasStaff ? "Has Staff" : "No Staff"}
                            </span>
                        </div>
                         <div className="flex items-center gap-2 text-sm">
                            <Calculator size={14} className={business?.isKorEligible ? "text-green-400" : "text-gray-500"} />
                            <span className={business?.isKorEligible ? "text-white" : "text-teal-300"}>
                                {business?.isKorEligible ? "KOR Eligible (<20k)" : "Standard VAT"}
                            </span>
                        </div>
                    </div>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <ExternalLink size={16} /> Official Resources
               </h3>
               <ul className="space-y-3">
                 <li>
                   <a href="#" className="flex items-center justify-between text-sm text-gray-600 hover:text-teal-600 group">
                     <span>NVWA Registration Portal</span>
                     <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                   </a>
                 </li>
                 <li>
                   <a href="#" className="flex items-center justify-between text-sm text-gray-600 hover:text-teal-600 group">
                     <span>HACCP Hygiene Code Download</span>
                     <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                   </a>
                 </li>
                 <li>
                   <a href="#" className="flex items-center justify-between text-sm text-gray-600 hover:text-teal-600 group">
                     <span>Belastingdienst (Tax) Login</span>
                     <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                   </a>
                 </li>
               </ul>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceManager;