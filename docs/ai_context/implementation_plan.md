# Fase 4: Integración de Facturación Electrónica AFIP/ARCA

Este plan detalla cómo implementaremos el módulo de facturación electrónica dentro del backend para conectarnos a los servidores de AFIP, autorizar facturas y generar el código QR fiscal obligatorio. 

El sistema utilizará el **Entorno de Homologación (Pruebas)** para el desarrollo y permitirá agrupar **múltiples pedidos de un mismo cliente** en una única factura.

## Proposed Changes

### 1. Base de Datos (Prisma)
- **Tabla `invoices`:** Se creará esta tabla con los campos: `invoiceNumber` (Ej: 0001-00000012), `clientId`, `subtotal`, `taxAmount`, `total`, `cae` (Código AFIP), `caeDueDate`, `qrData` y `status`.
- **Modificación en tabla `orders`:** Añadiremos una relación opcional `invoiceId`. Un pedido puede estar asociado a una factura. Una factura puede tener muchos pedidos.
- **Tabla `business_config`:** Almacenaremos allí los certificados (path o base64), el CUIT emisor, el Punto de Venta (PtoVta) y un flag `arcaProduction` (booleano).

### 2. Backend
- **Librería:** Instalaremos `@afipsdk/afip.js` y `qrcode`.
- **`AfipInvoicingService`:** Servicio de infraestructura que inicializará el SDK de AFIP usando las credenciales guardadas en la base de datos.
- **`GenerateInvoiceUseCase`:** Recibirá un `clientId` y un array de `orderIds`. 
  - Validará que todos los pedidos pertenezcan a ese cliente y no estén ya facturados.
  - Sumará los totales de los pedidos.
  - Generará la factura en AFIP (A, B o C según la condición de IVA del cliente).
  - Actualizará la base de datos guardando el `cae` y enlazando los pedidos.

### 3. Frontend

#### [MODIFY] `src/pages/orders/OrderDetailPage.tsx`
- Si el pedido no está facturado, mostrará el botón **"Facturar"** (para facturar ese único pedido).
- Si ya está facturado, mostrará el botón **"Ver Factura"** y ocultará el botón "Facturar".

#### [NEW] `src/pages/invoices/NewInvoiceModal.tsx` o Modificación en `ClientDetailPage.tsx`
- Dado que necesitas poder **juntar varios pedidos en una factura**, agregaremos una funcionalidad en la pantalla del **Cliente**.
- Se añadirá una sección o modal "Generar Factura", que listará todos los pedidos "No Facturados" de ese cliente con *checkboxes*.
- Podrás seleccionar 1, 2 o todos los pedidos que desees y hacer clic en **"Generar Factura Combinada"**.

#### [NEW] `src/pages/invoices/InvoicesPage.tsx`
- Crearemos la vista principal de Facturación (que actualmente es un placeholder). Aquí habrá un listado de todas las facturas emitidas, con su CAE y la posibilidad de descargar el PDF o ver el comprobante para la impresora.

## Verification Plan

### Manual Verification
1. Ingresar al detalle de un cliente que tenga al menos 2 pedidos finalizados y no facturados.
2. Seleccionar ambos pedidos y hacer clic en "Generar Factura Combinada".
3. Verificar en el listado de facturas que se haya creado un solo comprobante fiscal por la suma total de ambos pedidos.
4. Escanear el código QR impreso en el ticket de la factura y constatar que contiene los datos correctos enviados a AFIP.
