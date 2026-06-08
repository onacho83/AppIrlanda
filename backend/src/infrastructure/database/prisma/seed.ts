import { PrismaClient, Role, IvaCondition, PricingType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de base de datos...');

  // 1. Crear Usuario Admin
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash: adminPasswordHash,
      name: 'Administrador del Sistema',
      role: Role.ADMIN,
    },
  });
  console.log('✅ Usuario admin creado.');

  // 2. Configuración del Negocio
  const businessConfig = await prisma.businessConfig.create({
    data: {
      business_name: 'Imprenta Irlanda',
      cuit: '20111111112', // Reemplazar luego con CUIT real
      iva_condition: IvaCondition.RESPONSABLE_INSCRIPTO,
      address: 'Dirección de la Imprenta',
      arca_production: false,
    },
  });
  console.log('✅ Configuración de negocio creada.');

  // 3. Categorías Base
  const categories = [
    'Tarjetas', 'Volantes/Flyers', 'Banners/Lonas', 'Folletos', 
    'Invitaciones', 'Stickers', 'Papelería Corporativa', 
    'Impresión Gran Formato', 'Sellos'
  ];

  for (const [index, catName] of categories.entries()) {
    await prisma.productCategory.upsert({
      where: { name: catName },
      update: {},
      create: {
        name: catName,
        sort_order: index,
      },
    });
  }
  console.log('✅ Categorías de productos creadas.');

  console.log('🎉 Seed completado con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
