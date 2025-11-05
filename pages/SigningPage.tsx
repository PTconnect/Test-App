import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DocketData, LineItem } from '../types';
import { generateDocketData, submitDocketSignature } from '../services/geminiService';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import SignaturePadWrapper, { SignaturePadHandle } from '../components/SignaturePadWrapper';
import { LogoIcon } from '../components/Icons';


interface SigningPageProps {
  docketId: string;
  isCrewDocket: boolean;
  onBack: () => void;
}

type SubmissionStatus = 'pending' | 'submitting' | 'success' | 'error';
type ToastState = { id: number; message: string; type: 'success' | 'error' } | null;

const SigningPage: React.FC<SigningPageProps> = ({ docketId, isCrewDocket, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docketData, setDocketData] = useState<DocketData | null>(null);
  
  const [clientName, setClientName] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [isSignatureAccepted, setIsSignatureAccepted] = useState(false);
  const signaturePadRef = useRef<SignaturePadHandle>(null);
  
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('pending');
  const [successMessage, setSuccessMessage] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    const fetchDocketData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await generateDocketData(docketId, isCrewDocket);
        setDocketData(data);
      } catch (e: any) {
        setError(e.message || 'An unknown error occurred.');
        showToast(e.message || 'Failed to load data.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDocketData();
  }, [docketId, isCrewDocket, showToast]);

  const handleClearSignature = () => {
    signaturePadRef.current?.clear();
    signaturePadRef.current?.on();
    setIsSignatureAccepted(false);
  };
  
  const handleAcceptSignature = () => {
    if (signaturePadRef.current?.isEmpty()) {
        showToast('Please sign before accepting.', 'error');
        return;
    }
    signaturePadRef.current?.off();
    setIsSignatureAccepted(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
        showToast('Please enter your full name.', 'error');
        return;
    }
    if (signaturePadRef.current?.isEmpty()) {
        showToast('Please provide your signature.', 'error');
        return;
    }
    if (!isSignatureAccepted) {
        showToast('Please click "Accept" to lock in your signature.', 'error');
        return;
    }

    setSubmissionStatus('submitting');
    try {
        const signatureDataUrl = signaturePadRef.current?.toDataURL();
        console.log({
            docketId,
            clientName,
            clientEmail: docketData?.clientEmail,
            clientNotes,
            clientSignature: signatureDataUrl,
            clientSignTimestamp: new Date().toISOString()
        });
        const message = await submitDocketSignature(docketId, clientName);
        setSuccessMessage(message);
        setSubmissionStatus('success');
    } catch (e: any) {
        setSubmissionStatus('error');
        showToast(e.message || 'Failed to submit signature.', 'error');
    }
  };

  const renderHeader = () => (
    <header className="bg-[#1e528c] text-white shadow-md p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <LogoIcon className="h-8 w-auto text-[#ffbc0d]" />
        <h1 className="text-xl sm:text-2xl font-bold">PT-CONNECT | Client Signature</h1>
      </div>
       <button onClick={onBack} className="text-sm font-semibold hover:bg-white/10 px-3 py-1 rounded-md transition-colors">
        <i className="fa-solid fa-arrow-left mr-2"></i>Back
      </button>
    </header>
  );

  if (loading) {
    return (
      <>
        {renderHeader()}
        <main className="p-4 sm:p-6 lg:p-8"><Loader message="Loading Docket for Signing..." /></main>
      </>
    );
  }

  if (error || !docketData) {
    return (
      <>
        {renderHeader()}
        <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md text-center">
                <i className="fa-solid fa-circle-xmark text-red-500 text-6xl mb-4"></i>
                <h2 className="text-2xl font-bold text-red-600">Error Loading Docket</h2>
                <p className="mt-2 text-gray-600">{error || 'Could not retrieve docket data.'}</p>
                <p className="mt-1 text-gray-500 text-sm">This link may be invalid. Please try again or request a new link.</p>
            </div>
        </main>
      </>
    );
  }
  
  if (submissionStatus === 'success') {
    return (
      <>
        {renderHeader()}
        <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md text-center">
                <i className="fa-solid fa-circle-check text-green-500 text-6xl mb-4"></i>
                <h2 className="text-2xl font-bold text-green-600">Submission Successful!</h2>
                <p className="mt-2 text-gray-700">{successMessage}</p>
                <p className="mt-4 text-gray-500">You may now close this window.</p>
            </div>
        </main>
      </>
    );
  }

  const approverTerm = isCrewDocket ? "Approver's" : "Your";
  const submitButtonText = isCrewDocket ? 'Approve & Submit Timesheet' : 'Approve & Submit Signature';
  const supervisorLabel = isCrewDocket ? 'Employee' : 'Supervisor';

  return (
    <div className="min-h-screen bg-gray-100">
      {renderHeader()}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-4 mb-6">
              <h3 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">Docket Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="form-label">Docket ID</label><input type="text" value={docketData.docketId} className="form-input mt-1 bg-gray-100" readOnly /></div>
                <div><label className="form-label">Project</label><input type="text" value={docketData.projectName} className="form-input mt-1 bg-gray-100" readOnly /></div>
                <div><label className="form-label">Date</label><input type="text" value={docketData.date} className="form-input mt-1 bg-gray-100" readOnly /></div>
                <div><label className="form-label">{supervisorLabel}</label><input type="text" value={docketData.supervisorName} className="form-input mt-1 bg-gray-100" readOnly /></div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-4 mb-6">
              <h3 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">Docket Line Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scope</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {docketData.lineItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.resourceType}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.resourceID}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.role}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.quantity} {item.uom}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.scope}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-4 mb-6">
              <h3 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">{supervisorLabel} Signature</h3>
              <div className="flex justify-center p-4 bg-gray-100 rounded-lg">
                <img src={docketData.supervisorSignature} alt={`${supervisorLabel} Signature`} className="h-20 w-auto border border-gray-300 bg-white" />
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-4 mb-6">
              <h3 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">{approverTerm} Approval</h3>
              <div>
                <label htmlFor="clientName" className="form-label">{approverTerm} Full Name <span className="text-red-500">*</span></label>
                <input type="text" id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} required className="form-input mt-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Please print your name" />
              </div>
              <div>
                <label htmlFor="clientEmail" className="form-label">{approverTerm} Email <span className="text-red-500">*</span></label>
                <input type="email" id="clientEmail" value={docketData.clientEmail} className="form-input mt-1 bg-gray-100" readOnly />
              </div>
              <div>
                <label htmlFor="clientNotes" className="form-label">Notes / Comments (Optional)</label>
                <textarea id="clientNotes" value={clientNotes} onChange={(e) => setClientNotes(e.target.value)} rows={2} className="form-input mt-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., Approved, pending verification of..."></textarea>
              </div>
              <div>
                <label className="form-label">{approverTerm} Signature <span className="text-red-500">*</span></label>
                <div className="relative mt-1">
                  <SignaturePadWrapper ref={signaturePadRef} />
                  <div className="text-xs absolute top-1 right-1 space-x-2">
                    {isSignatureAccepted ? (
                        <>
                            <span className="text-green-600 font-bold"><i className="fa-solid fa-check-circle"></i> Accepted</span>
                            <span className="text-gray-300">|</span>
                            <button type="button" onClick={handleClearSignature} className="text-red-600 hover:text-red-800 font-medium">Reset</button>
                        </>
                    ) : (
                        <>
                            <button type="button" onClick={handleAcceptSignature} className="text-green-600 hover:text-green-800 font-medium">Accept</button>
                            <span className="text-gray-300">|</span>
                            <button type="button" onClick={handleClearSignature} className="text-red-600 hover:text-red-800 font-medium">Clear</button>
                        </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pb-12">
              <button type="submit" disabled={submissionStatus === 'submitting'} className="w-full bg-[#ffbc0d] text-[#1f2937] font-bold py-3 px-6 rounded-lg shadow-lg text-lg transition duration-150 flex items-center justify-center gap-2 hover:bg-[#e6a900] disabled:opacity-50 disabled:cursor-not-allowed">
                {submissionStatus === 'submitting' ? 
                  <><div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>Submitting...</> : 
                  <><i className="fa-solid fa-check-circle"></i>{submitButtonText}</>
                }
              </button>
            </div>
          </form>
        </div>
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default SigningPage;
