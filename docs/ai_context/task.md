# Tareas - Fase 4: Facturación AFIP/ARCA

- `[x]` Actualizar `schema.prisma` (entidad `Invoice`, actualizar `Order`, entidad `BusinessConfig`)
- `[/]` Crear migración de Prisma y actualizar base de datos
- `[x]` Instalar dependencias `@afipsdk/afip.js` y `qrcode` en backend
- `[x]` Implementar repositorios y entidades para `Invoice` y `BusinessConfig`
- `[x]` Implementar `AfipInvoicingService` (Lógica WSAA, WSFEv1 y Código QR fiscal)
- `[x]` Crear caso de uso `GenerateInvoiceUseCase` para procesar 1 o más pedidos
- `[x]` Exponer endpoints en `invoiceRoutes` y `businessConfigRoutes`
- `[x]` Actualizar servicios frontend (`invoiceService`, `configService`)
- `[x]` Implementar modal/sección de "Generar Factura" en `ClientDetailPage` con selección múltiple
- `[x]` Implementar pantalla de `InvoicesPage` (Listado de facturas emitidas)
- `[x]` Añadir diseño de comprobante con código QR (Ticket / A5)
