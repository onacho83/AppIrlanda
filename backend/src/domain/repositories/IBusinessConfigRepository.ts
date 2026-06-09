import { BusinessConfig } from '../entities/BusinessConfig';

export interface IBusinessConfigRepository {
  getConfig(): Promise<BusinessConfig>;
  updateConfig(data: Partial<Omit<BusinessConfig, 'id' | 'updatedAt'>>): Promise<BusinessConfig>;
}
