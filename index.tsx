// FIX: Replaced UMD global 'React' with module import.
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback, StrictMode } from 'react';
// FIX: Added import for ReactDOM to fix UMD global and createRoot errors.
import ReactDOM from 'react-dom/client';

// --- TYPES ---
// Defined interfaces for our data structures.
interface LineItem {
  resourceType: 'People' | 'Plant' | 'Materials' | 'Other';
  resourceID: string;
  role: string;
  quantity: string;
  uom: string;
  scope: string;
}

interface DocketData {
  docketId: string;
  projectName: string;
  date: string;
  supervisorName: string;
  clientEmail: string;
  supervisorSignature: string;
  lineItems: LineItem[];
}


// --- MOCK DATA SERVICE ---
// This replaces the Gemini API service. It provides hardcoded mock data instantly.

const mockSupervisorSignature = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const supervisorLineItems: LineItem[] = [
  { resourceType: 'People', resourceID: 'John Doe', role: 'Supervisor', quantity: '8', uom: 'hrs', scope: 'Site Supervision' },
  { resourceType: 'Plant', resourceID: 'UTR-01', role: 'Ute', quantity: '1', uom: 'each', scope: 'Site Transport' },
  { resourceType: 'Materials', resourceID: 'Concrete', role: '32 MPa', quantity: '5', uom: 'm3', scope: 'Footings' },
];

const crewLineItems: LineItem[] = [
  { resourceType: 'People', resourceID: 'Jane Smith', role: 'Operator', quantity: '10', uom: 'hrs', scope: 'Excavation' },
  { resourceType: 'People', resourceID: 'Peter Pan', role: 'Laborer', quantity: '10', uom: 'hrs', scope: 'Site Cleanup' },
  { resourceType: 'Plant', resourceID: 'EXC-05', role: '5t Excavator', quantity: '8', uom: 'hrs', scope: 'Trenching' },
];

const generateDocketData = (docketId: string, isCrewDocket: boolean): DocketData => {
  console.log(`Generating mock docket data for ID: ${docketId}, isCrew: ${isCrewDocket}`);
  
  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

  if (isCrewDocket) {
    return {
      docketId,
      projectName: 'City Tunnel Project',
      date: formattedDate,
      supervisorName: 'Crew Team Alpha',
      clientEmail: 'approver@clientcorp.com',
      supervisorSignature: mockSupervisorSignature,
      lineItems: crewLineItems,
    };
  }
  
  return {
    docketId,
    projectName: 'Western Freeway Upgrade',
    date: formattedDate,
    supervisorName: 'John Doe',
    clientEmail: 'client.contact@majorroads.gov',
    supervisorSignature: mockSupervisorSignature,
    lineItems: supervisorLineItems,
  };
};

// FIX: Added types for function parameters and a Promise return type to resolve type inference issues.
const submitDocketSignature = (docketId: string, clientName: string): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const message = `Thank you, ${clientName}. The docket ${docketId} has been successfully signed and submitted. A confirmation email has been sent.`;
            resolve(message);
        }, 1000);
    });
};


// --- COMPONENTS ---

const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" {...props}>
        <rect width="200" height="100" fill="#1e528c"/>
        <text x="10" y="70" fontFamily="Arial, sans-serif" fontSize="60" fill="#ffbc0d" fontWeight="bold">PT</text>
        <path d="M110 20 L130 50 L110 80" stroke="#ffbc0d" strokeWidth="10" fill="none"/>
        <path d="M140 20 L160 50 L140 80" stroke="#ffbc0d" strokeWidth="10" fill="none"/>
        <text x="165" y="70" fontFamily="Arial, sans-serif" fontSize="60" fill="#fff" fontWeight="bold">C</text>
    </svg>
);

const Loader = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div className="flex flex-col justify-center items-center p-10 h-full">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1e528c] rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600 font-semibold">{message}</p>
    </div>
  );
};

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark';

  return (
    <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-4 w-full max-w-sm p-4 rounded-lg shadow-lg text-white ${bgColor} z-50 animate-fade-in-up`}>
      <i className={`fa-solid ${icon} text-xl`}></i>
      <p className="flex-grow">{message}</p>
      <button onClick={onClose} className="text-xl leading-none">&times;</button>
    </div>
  );
};

const SignaturePadWrapper = forwardRef((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<any>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // FIX: Cast window to `any` to access SignaturePad, which is loaded from a script tag.
      signaturePadRef.current = new (window as any).SignaturePad(canvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)',
      });

      const resizeCanvas = () => {
        if (canvasRef.current) {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          canvasRef.current.width = canvasRef.current.offsetWidth * ratio;
          canvasRef.current.height = canvasRef.current.offsetHeight * ratio;
          canvasRef.current.getContext("2d")?.scale(ratio, ratio);
          signaturePadRef.current.clear(); 
        }
      };

      window.addEventListener("resize", resizeCanvas);
      setTimeout(resizeCanvas, 0);

      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }
  }, []);

  useImperativeHandle(ref, () => ({
    clear: () => signaturePadRef.current?.clear(),
    isEmpty: () => signaturePadRef.current?.isEmpty(),
    toDataURL: () => signaturePadRef.current?.toDataURL('image/png'),
    off: () => signaturePadRef.current?.off(),
    on: () => signaturePadRef.current?.on(),
  }));

  return (
    <canvas ref={canvasRef} className="signature-pad-canvas"></canvas>
  );
});


// --- SIGNING PAGE ---

const SigningPage = ({ docketId, isCrewDocket, onBack }: { docketId: string; isCrewDocket: boolean; onBack: () => void; }) => {
  const [docketData, setDocketData] = useState<DocketData | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [isSignatureAccepted, setIsSignatureAccepted] = useState(false);
  const signaturePadRef = useRef<any>(null);
  
  const [submissionStatus, setSubmissionStatus] = useState('pending');
  const [successMessage, setSuccessMessage] = useState('');
  const [toast, setToast] = useState<{ id: number, message: string, type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    // Data is now fetched synchronously from our mock service
    const data = generateDocketData(docketId, isCrewDocket);
    setDocketData(data);
  }, [docketId, isCrewDocket]);

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
        const message = await submitDocketSignature(docketId, clientName);
        setSuccessMessage(message);
        setSubmissionStatus('success');
    } catch (e) {
        setSubmissionStatus('error');
        // FIX: The caught error `e` is of type `unknown`. Added `instanceof Error` check to safely access the error message.
        if (e instanceof Error) {
            showToast(e.message || 'Failed to submit signature.', 'error');
        } else {
            showToast('Failed to submit signature.', 'error');
        }
    }
  };

  const renderHeader = () => (
    <header className="brand-header text-white shadow-md p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <LogoIcon className="h-8 w-auto text-[#ffbc0d]" />
        <h1 className="text-xl sm:text-2xl font-bold">PT-CONNECT | Client Signature</h1>
      </div>
       <button onClick={onBack} className="text-sm font-semibold hover:bg-white/10 px-3 py-1 rounded-md transition-colors">
        <i className="fa-solid fa-arrow-left mr-2"></i>Back
      </button>
    </header>
  );

  if (!docketData) {
    return (
      <>
        {renderHeader()}
        <main className="p-4 sm:p-6 lg:p-8"><Loader message="Loading Docket..." /></main>
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
                <div><label className="form-label">Docket ID</label><input type="text" value={docketData.docketId} className="form-input mt-1 disabled-field" readOnly /></div>
                <div><label className="form-label">Project</label><input type="text" value={docketData.projectName} className="form-input mt-1 disabled-field" readOnly /></div>
                <div><label className="form-label">Date</label><input type="text" value={docketData.date} className="form-input mt-1 disabled-field" readOnly /></div>
                <div><label className="form-label">{supervisorLabel}</label><input type="text" value={docketData.supervisorName} className="form-input mt-1 disabled-field" readOnly /></div>
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
                <input type="text" id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} required className="form-input mt-1" placeholder="Please print your name" />
              </div>
              <div>
                <label htmlFor="clientEmail" className="form-label">{approverTerm} Email <span className="text-red-500">*</span></label>
                <input type="email" id="clientEmail" value={docketData.clientEmail} className="form-input mt-1 disabled-field" readOnly />
              </div>
              <div>
                <label htmlFor="clientNotes" className="form-label">Notes / Comments (Optional)</label>
                <textarea id="clientNotes" value={clientNotes} onChange={(e) => setClientNotes(e.target.value)} rows={2} className="form-input mt-1" placeholder="e.g., Approved, pending verification of..."></textarea>
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
              <button type="submit" disabled={submissionStatus === 'submitting'} className="w-full brand-button font-bold py-3 px-6 rounded-lg shadow-lg text-lg transition duration-150 flex items-center justify-center gap-2 hover:bg-[#e6a900] disabled:opacity-50 disabled:cursor-not-allowed">
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


// --- APP CONTAINER ---

const App = () => {
  const [docketToSign, setDocketToSign] = useState<{ id: string; type: 'docket' | 'crew' } | null>(null);

  if (docketToSign) {
    return <SigningPage 
             docketId={docketToSign.id} 
             isCrewDocket={docketToSign.type === 'crew'} 
             onBack={() => setDocketToSign(null)}
           />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <header className="absolute top-0 left-0 right-0 brand-header text-white shadow-md p-4 flex items-center space-x-4">
        <LogoIcon className="h-8 w-auto" />
        <h1 className="text-xl sm:text-2xl font-bold">PT-CONNECT | Demo</h1>
      </header>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Docket Signature Demo</h1>
        <p className="text-gray-600 mb-8">Select a document type to begin the signing process.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => setDocketToSign({ id: 'H-123_Docket_2024-07-29', type: 'docket' })}
            className="w-full sm:w-auto brand-button font-bold py-3 px-6 rounded-lg shadow-lg text-lg transition duration-150 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-file-invoice"></i>
            Load Supervisor Docket
          </button>
          <button 
            onClick={() => setDocketToSign({ id: 'P-456_CREW_Docket_2024-07-29', type: 'crew' })}
            className="w-full sm:w-auto bg-white text-[#1e528c] border-2 border-[#1e528c] font-bold py-3 px-6 rounded-lg shadow-lg text-lg transition duration-150 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-user-clock"></i>
            Load Crew Timesheet
          </button>
        </div>
      </div>
    </div>
  );
}


// --- RENDER APP ---

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
