import api from './api';

export interface BusinessConfig {
  id: string;
  businessName: string;
  cuit: string | null;
  ivaCondition: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoPath: string | null;
  arcaSalePoint: number | null;
  arcaCert: string | null;
  arcaKey: string | null;
  arcaProduction: boolean;
  grossIncome: string | null;
  activityStartDate: string | null;
}

export const configService = {
  getConfig: async (): Promise<BusinessConfig> => {
    const response = await api.get('/config');
    return response.data.data;
  },

  updateConfig: async (data: Partial<BusinessConfig>): Promise<BusinessConfig> => {
    const response = await api.put('/config', data);
    return response.data.data;
  }
};
