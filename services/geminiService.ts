import { DocketData, LineItem } from '../types';

// Using a short, valid base64 string to prevent parsing issues in some environments.
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

export const generateDocketData = async (docketId: string, isCrewDocket: boolean): Promise<DocketData> => {
  console.log(`Generating mock docket data for ID: ${docketId}, isCrew: ${isCrewDocket}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Throw an error for a specific ID to test error handling
  if (docketId.includes('FAIL')) {
    throw new Error('This is a simulated failure to fetch docket data.');
  }

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

export const submitDocketSignature = async (docketId: string, clientName: string): Promise<string> => {
    console.log(`Submitting signature for docket ${docketId} by ${clientName}`);
  
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate a submission failure
    if (clientName.toLowerCase().includes('fail')) {
        throw new Error('Simulated network error: Could not connect to the server.');
    }
  
    return `Thank you, ${clientName}. The docket ${docketId} has been successfully signed and submitted. A confirmation email has been sent.`;
};
