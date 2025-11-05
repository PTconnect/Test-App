
import React, { useState } from 'react';
import SigningPage from './pages/SigningPage';
import { LogoIcon } from './components/Icons';

type DocketSelection = {
  id: string;
  type: 'docket' | 'crew';
} | null;

const App: React.FC = () => {
  const [docketToSign, setDocketToSign] = useState<DocketSelection>(null);

  if (docketToSign) {
    return <SigningPage 
             docketId={docketToSign.id} 
             isCrewDocket={docketToSign.type === 'crew'} 
             onBack={() => setDocketToSign(null)}
           />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <header className="absolute top-0 left-0 right-0 bg-[#1e528c] text-white shadow-md p-4 flex items-center space-x-4">
        <LogoIcon className="h-8 w-auto" />
        <h1 className="text-xl sm:text-2xl font-bold">PT-CONNECT | Demo</h1>
      </header>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Docket Signature Demo</h1>
        <p className="text-gray-600 mb-8">Select a document type to begin the signing process.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => setDocketToSign({ id: 'H-123_Docket_2024-07-29', type: 'docket' })}
            className="w-full sm:w-auto bg-[#ffbc0d] text-[#1f2937] font-bold py-3 px-6 rounded-lg shadow-lg text-lg transition duration-150 hover:bg-[#e6a900] flex items-center justify-center gap-2"
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

export default App;
