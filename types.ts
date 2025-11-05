
export interface LineItem {
  resourceType: 'People' | 'Plant' | 'Materials' | 'Other';
  resourceID: string;
  role: string;
  quantity: string;
  uom: string;
  scope: string;
}

export interface DocketData {
  docketId: string;
  projectName: string;
  date: string;
  supervisorName: string;
  clientEmail: string;
  supervisorSignature: string;
  lineItems: LineItem[];
}
