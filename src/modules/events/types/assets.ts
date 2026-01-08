export type AssetCategory = 'AV' | 'Instruments' | 'Furniture' | 'Lighting' | 'IT' | 'Decor';
export type AssetStatus = 'available' | 'in_use' | 'maintenance' | 'lost' | 'retired';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  serialNumber?: string;
  location: string;
  status: AssetStatus;
  assignedTo?: string; // User ID or Event ID
  condition: 'new' | 'good' | 'fair' | 'poor';
  purchaseDate?: string;
  value?: number;
  imageUrl?: string;
}

export interface MovementLog {
  id: string;
  assetId: string;
  timestamp: string;
  type: 'check_out' | 'check_in' | 'maintenance_log';
  actorId: string; // Who performed the action
  notes?: string;
}
