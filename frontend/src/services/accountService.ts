import api from './api';
import type { AccountMovement } from '../types';

export interface ClientStatement {
  clientId: string;
  balance: number;
  movements: AccountMovement[];
}

export const accountService = {
  getClientStatement: async (clientId: string): Promise<ClientStatement> => {
    const response = await api.get(`/accounts/client/${clientId}/statement`);
    return response.data;
  },
};
