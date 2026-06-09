import { PrismaClient } from '@prisma/client';
import { IBusinessConfigRepository } from '../../../domain/repositories/IBusinessConfigRepository';
import { BusinessConfig } from '../../../domain/entities/BusinessConfig';

export class PrismaBusinessConfigRepository implements IBusinessConfigRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToDomain(record: any): BusinessConfig {
    return new BusinessConfig(
      record.id,
      record.business_name,
      record.cuit,
      record.iva_condition,
      record.address,
      record.phone,
      record.email,
      record.logo_path,
      record.arca_sale_point,
      record.arca_cert,
      record.arca_key,
      record.arca_production,
      record.updated_at
    );
  }

  async getConfig(): Promise<BusinessConfig> {
    const record = await this.prisma.businessConfig.findFirst();
    if (record) {
      return this.mapToDomain(record);
    }
    
    // Si no existe, crear la configuracin por defecto
    const newConfig = await this.prisma.businessConfig.create({
      data: {
        business_name: 'Imprenta Irlanda',
        arca_production: false
      }
    });
    return this.mapToDomain(newConfig);
  }

  async updateConfig(data: Partial<Omit<BusinessConfig, 'id' | 'updatedAt'>>): Promise<BusinessConfig> {
    const config = await this.getConfig();
    
    const record = await this.prisma.businessConfig.update({
      where: { id: config.id },
      data: {
        ...(data.businessName !== undefined && { business_name: data.businessName }),
        ...(data.cuit !== undefined && { cuit: data.cuit }),
        ...(data.ivaCondition !== undefined && { iva_condition: data.ivaCondition }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.logoPath !== undefined && { logo_path: data.logoPath }),
        ...(data.arcaSalePoint !== undefined && { arca_sale_point: data.arcaSalePoint }),
        ...(data.arcaCert !== undefined && { arca_cert: data.arcaCert }),
        ...(data.arcaKey !== undefined && { arca_key: data.arcaKey }),
        ...(data.arcaProduction !== undefined && { arca_production: data.arcaProduction }),
      }
    });

    return this.mapToDomain(record);
  }
}
