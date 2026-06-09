import { PrismaClient, PricingType, IvaCondition } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando carga de datos de prueba...');

  // 1. Crear un Cliente de prueba
  const client = await prisma.client.create({
    data: {
      name: 'Juan Perez (Cliente Prueba)',
      email: 'juan@prueba.com',
      phone: '1123456789',
      cuit: '20123456789',
      iva_condition: IvaCondition.RESPONSABLE_INSCRIPTO,
    },
  });
  console.log(`✅ Cliente creado: ${client.name}`);

  // 2. Obtener categorías
  const categories = await prisma.productCategory.findMany();
  if (categories.length === 0) {
    console.error('❌ No hay categorías. Ejecuta "npm run prisma:seed" primero.');
    return;
  }

  // 3. Crear Productos de prueba
  const productsData = [
    { name: 'Tarjetas de Presentación (1000u)', categoryName: 'Tarjetas', base_price: 15000, pricing_type: PricingType.FIJO },
    { name: 'Volantes A5 (5000u)', categoryName: 'Volantes/Flyers', base_price: 45000, pricing_type: PricingType.FIJO },
    { name: 'Lona Front 1x1m', categoryName: 'Banners/Lonas', base_price: 8500, pricing_type: PricingType.FIJO },
    { name: 'Talonario Facturas A (50x3)', categoryName: 'Papelería Corporativa', base_price: 12000, pricing_type: PricingType.FIJO },
    { name: 'Sello Automático Trodat', categoryName: 'Sellos', base_price: 5500, pricing_type: PricingType.FIJO },
  ];

  for (const pData of productsData) {
    const category = categories.find(c => c.name === pData.categoryName) || categories[0];
    
    await prisma.product.create({
      data: {
        name: pData.name,
        category_id: category.id,
        base_price: pData.base_price,
        pricing_type: pData.pricing_type as any,
        description: `Descripción excelente para ${pData.name}`,
      }
    });
  }
  
  console.log('✅ Productos de prueba creados.');
  console.log('🎉 Datos de prueba cargados con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
