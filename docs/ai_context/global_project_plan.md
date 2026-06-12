# Plan Global del Proyecto: Imprenta Irlanda

Este documento describe de forma detallada las 6 fases de implementación del sistema integral para Imprenta Irlanda, cubriendo la arquitectura del proyecto y las correcciones añadidas a lo largo del desarrollo.

## Arquitectura Base
- **Backend:** Node.js con Fastify, TypeScript, Prisma ORM y PostgreSQL.
- **Frontend:** React.js con Vite, TypeScript, Zustand (estado global) y CSS puro (con variables CSS).
- **Arquitectura de Software:** Clean Architecture (Capas: Domain, Application, Infrastructure, Shared).
- **Despliegue Local:** Docker Compose para la Base de Datos PostgreSQL (puerto 5433).

---

## Fase 1: Setup Inicial, Autenticación y Catálogo (Completada)
**Objetivos:**
1. Inicializar el backend y frontend con la estructura base.
2. Crear esquema base en Prisma (`users`, `clients`, `products`, `product_categories`).
3. Implementar inicio de sesión (Login) con JWT para roles Admin y Operador.
4. Implementar módulo base de gestión de productos.

**Correcciones/Ajustes Añadidos:**
- Se corrigieron problemas de anidamiento HTML inválido en los botones del catálogo de productos.
- Implementación de un script seed (`seedMockData.ts`) con categorías completas y usuarios por defecto (admin).

---

## Fase 2: Gestión de Clientes, Cuentas Corrientes y Presupuestos (Completada)
**Objetivos:**
1. **Módulo de Clientes:** Altas, bajas, modificaciones y búsqueda. Soporte para cuentas corrientes y límites de crédito.
2. Generación automática del `trackingToken` único por cliente.
3. **Módulo de Presupuestos (Quotes):** Generación de presupuestos a clientes, conversión de presupuestos a Pedidos.

**Correcciones/Ajustes Añadidos:**
- Ajuste en los estados y botones de acción en los detalles de Cliente.
- Prevención de fallos en el manejo y persistencia de cuentas corrientes en Prisma.

---

## Fase 3: Flujo de Pedidos (Orders) y Pagos (Completada)
**Objetivos:**
1. **Flujo de Pedidos:** Creación de Pedidos enlazados al Cliente y al Producto. Subida/Link de archivos de diseño ("examinar").
2. **Máquina de Estados de Pedidos:** Historial auditable de cambios de estado (Recibido, Esperando Diseño, Confirmación, Producción, Terminado, Entregado, Cancelado).
3. **Pagos:** Módulo de caja y cobros parciales/totales. Vinculación de pagos a la cuenta corriente del cliente.

**Correcciones/Ajustes Añadidos:**
- *Preferencia del Usuario:* Al hacer clic en "Examinar" para cargar el diseño, solo se captura y muestra la ruta/referencia como string en lugar de intentar subir el archivo real al servidor.
- *Preferencia del Usuario:* En la pestaña de Pedidos global no existe el botón de "Nuevo Pedido". Los pedidos siempre deben generarse desde el perfil de un Cliente específico para evitar desvinculaciones.

---

## Fase 4: Facturación Electrónica AFIP/ARCA y PDFs (Completada)
**Objetivos:**
1. Módulo para emitir facturas legales interactuando con los Web Services de AFIP.
2. Capacidad de facturar múltiples pedidos finalizados de un mismo cliente en una única Factura Combinada.
3. Generación del comprobante visual (PDF) para el cliente con código QR fiscal.

**Correcciones/Ajustes Añadidos:**
- **Mock de Desarrollo:** Se implementó un fallback para permitir la facturación local (generación simulada del CAE y ticket) sin requerir el certificado oficial local de AFIP configurado.
- **Layout del PDF:** El diseño del documento PDF de la factura se genera estrictamente en **Formato A5 Apaisado (Landscape)** usando `jspdf` y `html2canvas`, respetando el formato original ideado al principio del proyecto.
- **Fix UI:** Corrección en el Frontend para prevenir caídas (crashes) al procesar clientes con propiedades vacías como la condición de IVA al imprimir la factura.
- Se añadió un mapeo explícito de `invoiceId` en los Data Transfer Objects (DTO) y repositorio para asegurar que los productos de la factura se listen correctamente en el PDF.

---

## Fase 5: Seguimiento de Pedidos para Clientes (Pendiente)
**Objetivos:**
1. Crear una ruta pública en el Frontend (`/track/:trackingToken`).
2. Permitir que el cliente, enviándole ese link único, vea el estado actual de su pedido, el historial de producción, el saldo pendiente de pago y el nombre del producto pedido.
3. La interfaz deberá ser mobile-friendly y solo en modo "Solo Lectura". No requiere usuario ni contraseña, depende netamente de la aleatoriedad del token autogenerado por Prisma al crear el cliente.

---

## Fase 6: Dashboard, Calendario, Reportes y Pulido (Pendiente)
**Objetivos:**
1. **Dashboard Administrativo:** Vista rápida de pedidos urgentes del día, ingresos mensuales, saldos en cuentas corrientes y cantidad de pedidos por estado.
2. **Calendario:** Vista tipo calendario (o grilla mensual/semanal) para visualizar visualmente las fechas prometidas de entrega de cada pedido en producción.
3. **Reportes:** Generación de Excel/PDF de las ventas mensuales, cuentas a cobrar y facturas emitidas para contabilidad.
4. **Settings/Configuraciones:** Pantalla para actualizar CUIT, Razón Social, Puntos de Venta, logos y credenciales (AFIP). *(Parcialmente iniciada)*.
