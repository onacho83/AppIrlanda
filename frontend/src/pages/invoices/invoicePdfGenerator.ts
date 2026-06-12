import jsPDF from 'jspdf';
import type { Invoice, Client, Order } from '../../types';
import type { BusinessConfig } from '../../services/configService';

// ══════════════════════════════════════════════════════════════════
//  LAYOUT A5 — 148 × 210 mm
// ══════════════════════════════════════════════════════════════════

const PW = 148;
const PH = 210;
const ML = 7;           // Margen izquierdo
const MR = 7;           // Margen derecho
const MT = 5;           // Margen superior
const CW = PW - ML - MR; // Ancho útil
const CX = PW / 2;      // Centro horizontal
const RX = ML + CW;     // Extremo derecho del contenido

// ── Paleta de color corporativa ──
// Un tinte azul oscuro sofisticado para acentos (no negro puro)
const ACCENT: [number, number, number] = [22, 40, 72];    // Navy corporativo
const DARK: [number, number, number] = [30, 30, 35];      // Textos principales
const MID: [number, number, number] = [100, 100, 110];    // Textos secundarios
const LIGHT: [number, number, number] = [200, 200, 208];  // Líneas sutiles
const SOFTER: [number, number, number] = [235, 237, 242]; // Fondos sutiles
const WHITE: [number, number, number] = [255, 255, 255];

// ── Tipografía ──
const FS_MICRO = 5;
const FS_TINY  = 6;
const FS_XS    = 6.5;
const FS_SM    = 7.5;
const FS_BASE  = 8;
const FS_MD    = 9;
const FS_LG    = 11;
const FS_XL    = 14;
const FS_LETTER = 19;

// ══════════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════════

function afipCode(t: string): string {
  return ({ FACTURA_A:'001', FACTURA_B:'006', FACTURA_C:'011', NOTA_CREDITO_A:'003', NOTA_CREDITO_B:'008', NOTA_CREDITO_C:'013' }[t]) || '006';
}
function getLetter(t: string): string { return t.split('_').pop() || 'B'; }
function getTitle(t: string): string { return t.startsWith('NOTA_CREDITO') ? 'NOTA DE CRÉDITO' : 'FACTURA'; }
function money(n: number): string { return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function date(s: string): string { return new Date(s).toLocaleDateString('es-AR'); }
function ivaText(c: string | null | undefined): string {
  if (!c) return 'Consumidor Final';
  return ({ RESPONSABLE_INSCRIPTO:'IVA Responsable Inscripto', MONOTRIBUTISTA:'Responsable Monotributo', CONSUMIDOR_FINAL:'Consumidor Final', EXENTO:'IVA Sujeto Exento' }[c]) || c.replace(/_/g, ' ');
}

// ── Primitivas de alto nivel ──

function hRule(d: jsPDF, y: number, x1 = ML, x2 = RX, w = 0.25) { d.setLineWidth(w); d.line(x1, y, x2, y); }
function vRule(d: jsPDF, x: number, y1: number, y2: number, w = 0.25) { d.setLineWidth(w); d.line(x, y1, x, y2); }



/** Dibuja texto multilínea y devuelve la Y inferior del bloque */
function drawWrapped(d: jsPDF, text: string, x: number, y: number, maxW: number, align: 'left'|'right'|'center' = 'left'): number {
  const lines = d.splitTextToSize(text || '-', maxW);
  d.text(lines, x, y, { align });
  const lh = (d.getFontSize() * d.getLineHeightFactor()) / d.internal.scaleFactor;
  return y + lines.length * lh;
}

/** Dibuja un par etiqueta/valor. El label en gris y el valor en negro bold. */
function labelValue(d: jsPDF, label: string, value: string, lx: number, y: number, vx: number, vMaxW: number): number {
  d.setFont('helvetica', 'normal');
  d.setTextColor(...MID);
  d.text(label, lx, y);
  d.setFont('helvetica', 'bold');
  d.setTextColor(...DARK);
  return drawWrapped(d, value || '-', vx, y, vMaxW);
}

// ══════════════════════════════════════════════════════════════════
//  ① BANNER DE COPIA (ORIGINAL / DUPLICADO)
// ══════════════════════════════════════════════════════════════════

function drawBanner(d: jsPDF, y: number, label: string): number {
  // Franja delgada con fondo accent
  const h = 4.5;
  d.setFillColor(...ACCENT);
  d.roundedRect(ML, y, CW, h, 1, 1, 'F');

  d.setTextColor(...WHITE);
  d.setFontSize(FS_TINY);
  d.setFont('helvetica', 'bold');
  d.text(label, CX, y + 3, { align: 'center' });

  return y + h + 1.5;
}

// ══════════════════════════════════════════════════════════════════
//  ② ENCABEZADO (Emisor + Letra + Comprobante)
// ══════════════════════════════════════════════════════════════════

function drawHeader(d: jsPDF, y: number, inv: Invoice, cfg: BusinessConfig | null | undefined, logo: string | null): number {
  const top = y;
  const H = 35;
  const bot = y + H;

  // ── Marco exterior ──
  d.setDrawColor(...DARK);
  d.roundedRect(ML, top, CW, H, 1.5, 1.5, 'S');

  // ── Divisor central vertical ──
  d.setDrawColor(...LIGHT);
  vRule(d, CX, top + 1, bot - 1, 0.2);

  // ── CUADRO DE LA LETRA ──
  const boxW = 14;
  const boxH = 14;
  const boxX = CX - boxW / 2;
  const boxY = top - 2;

  // Fondo blanco para cubrir la línea del marco
  d.setFillColor(...WHITE);
  d.roundedRect(boxX - 1, boxY, boxW + 2, boxH + 2, 1, 1, 'F');

  // Cuadro accent con borde
  d.setFillColor(...ACCENT);
  d.setDrawColor(...ACCENT);
  d.roundedRect(boxX, boxY, boxW, boxH, 1.5, 1.5, 'FD');

  d.setTextColor(...WHITE);
  d.setFontSize(FS_LETTER);
  d.setFont('helvetica', 'bold');
  d.text(getLetter(inv.invoiceType), CX, boxY + 10.5, { align: 'center' });

  // Código debajo
  d.setTextColor(...MID);
  d.setFontSize(FS_MICRO);
  d.setFont('helvetica', 'normal');
  d.text(`Cód. ${afipCode(inv.invoiceType)}`, CX, boxY + boxH + 3, { align: 'center' });

  // ══ COLUMNA IZQUIERDA: EMISOR ══
  const lPad = ML + 4;
  const lMaxW = CX - boxW / 2 - lPad - 3;
  let ly = top + 4;

  if (logo) {
    try {
      d.addImage(logo, 'PNG', lPad, ly - 1, 11, 11);
      d.setFontSize(FS_LG);
      d.setFont('helvetica', 'bold');
      d.setTextColor(...DARK);
      const nameW = lMaxW - 14;
      const nameLines = d.splitTextToSize(cfg?.businessName || 'Empresa', nameW);
      d.text(nameLines, lPad + 13, ly + 4);
    } catch {
      d.setFontSize(FS_LG);
      d.setFont('helvetica', 'bold');
      d.setTextColor(...DARK);
      drawWrapped(d, cfg?.businessName || 'Empresa', lPad, ly + 4, lMaxW);
    }
  } else {
    d.setFontSize(FS_LG);
    d.setFont('helvetica', 'bold');
    d.setTextColor(...DARK);
    drawWrapped(d, cfg?.businessName || 'Empresa', lPad, ly + 4, lMaxW);
  }

  // Datos fiscales del emisor
  d.setFontSize(FS_XS);
  const lVx = lPad + 22;
  const lFw = lMaxW - 22;
  let bottomLy = bot - 11;
  bottomLy = labelValue(d, 'Razón Social:', cfg?.businessName || '-', lPad, bottomLy, lVx, lFw);
  bottomLy += 0.5;
  bottomLy = labelValue(d, 'Domicilio:', cfg?.address || '-', lPad, bottomLy, lVx, lFw);
  bottomLy += 0.5;
  labelValue(d, 'Cond. IVA:', ivaText(cfg?.ivaCondition), lPad, bottomLy, lVx, lFw);

  // ══ COLUMNA DERECHA: COMPROBANTE ══
  const rPad = CX + boxW / 2 + 3;
  const rMaxW = RX - rPad - 3;
  let ry = top + 4;

  // Título grande
  d.setFontSize(FS_XL);
  d.setFont('helvetica', 'bold');
  d.setTextColor(...DARK);
  d.text(getTitle(inv.invoiceType), rPad, ry + 4);
  ry += 9;

  // Número
  const [pv, cn] = inv.invoiceNumber ? inv.invoiceNumber.split('-') : ['00000', '00000000'];
  d.setFontSize(FS_SM);
  d.setFont('helvetica', 'bold');
  d.setTextColor(...ACCENT);
  d.text(`N° ${pv}-${cn}`, rPad, ry);
  ry += 5;

  // Datos fiscales
  d.setFontSize(FS_XS);
  const rVx = rPad + 26;
  const rFw = rMaxW - 26;
  labelValue(d, 'Fecha de Emisión:', date(inv.createdAt), rPad, ry, rVx, rFw);
  
  let bottomRy = bot - 11;
  bottomRy = labelValue(d, 'C.U.I.T.:', cfg?.cuit || '-', rPad, bottomRy, rVx, rFw);
  bottomRy += 0.5;
  bottomRy = labelValue(d, 'Ingresos Brutos:', cfg?.grossIncome || '-', rPad, bottomRy, rVx, rFw);
  bottomRy += 0.5;
  labelValue(d, 'Inicio Actividad:', cfg?.activityStartDate || '-', rPad, bottomRy, rVx, rFw);

  return bot + 1;
}

// ══════════════════════════════════════════════════════════════════
//  ③ DATOS DEL RECEPTOR (Cliente)
// ══════════════════════════════════════════════════════════════════

function drawClient(d: jsPDF, y: number, client: Client): number {
  // Título de sección
  d.setFillColor(...SOFTER);
  d.roundedRect(ML, y, CW, 5, 0.8, 0.8, 'F');
  d.setFontSize(FS_TINY);
  d.setFont('helvetica', 'bold');
  d.setTextColor(...ACCENT);
  d.text('DATOS DEL RECEPTOR', ML + 3, y + 3.5);
  y += 7;

  const lPad = ML + 3;
  const col2 = CX + 2;
  const lVx = lPad + 20;
  const rVx = col2 + 18;
  const w1 = CX - lPad - 20 - 2;
  const w2 = RX - rVx - 2;

  d.setFontSize(FS_XS);

  // Fila 1: Nombre + Domicilio
  const y1a = labelValue(d, 'Señor(es):', client.fiscalName || client.name, lPad, y, lVx, w1);
  const y1b = labelValue(d, 'Domicilio:', client.address || '-', col2, y, rVx, w2);
  y = Math.max(y1a, y1b) + 1;

  // Fila 2: IVA + CUIT
  const y2a = labelValue(d, 'Cond. IVA:', ivaText(client.ivaCondition), lPad, y, lVx, w1);
  const y2b = labelValue(d, 'C.U.I.T.:', client.cuit || 'Consumidor Final', col2, y, rVx, w2);
  y = Math.max(y2a, y2b) + 1;

  // Fila 3: Condición de venta
  labelValue(d, 'Cond. Venta:', 'Cuenta Corriente', lPad, y, lVx, w1);
  y += 5;

  // Separador inferior
  d.setDrawColor(...LIGHT);
  hRule(d, y, ML, RX, 0.3);

  return y + 2;
}

// ══════════════════════════════════════════════════════════════════
//  ④ TABLA DE PRODUCTOS
// ══════════════════════════════════════════════════════════════════

function drawTable(d: jsPDF, y: number, orders: Order[], isFactA: boolean, tableBot: number): number {
  const headerH = 6;
  const rowH = 5.5;

  let colW: number[];
  let headers: string[];

  if (isFactA) {
    colW = [16, 12, 0, 22, 12, 18, 22]; // 7 columnas
    colW[2] = CW - colW[0] - colW[1] - colW[3] - colW[4] - colW[5] - colW[6];
    headers = ['Código', 'Cant.', 'Descripción', 'P. Unitario', '% IVA', 'IVA', 'Subtotal'];
  } else {
    colW = [18, 12, 0, 26, 26]; // 5 columnas
    colW[2] = CW - colW[0] - colW[1] - colW[3] - colW[4];
    headers = ['Código', 'Cant.', 'Descripción', 'P. Unitario', 'Subtotal'];
  }

  // ── Header de tabla con fondo accent ──
  d.setFillColor(...ACCENT);
  d.rect(ML, y, CW, headerH, 'F');

  d.setTextColor(...WHITE);
  d.setFontSize(FS_XS);
  d.setFont('helvetica', 'bold');

  let cx = ML;
  for (let i = 0; i < headers.length; i++) {
    const tx = i <= 2 ? cx + 3 : cx + colW[i] - 3;
    const al: 'left' | 'right' = i <= 2 ? 'left' : 'right';
    d.text(headers[i], tx, y + 4, { align: al });
    cx += colW[i];
  }

  const dataTop = y + headerH;
  let ry = dataTop + 3.5;

  // ── Filas de datos ──
  d.setTextColor(...DARK);

  for (let idx = 0; idx < orders.length; idx++) {
    const order = orders[idx];
    if (ry + rowH > tableBot - 2) break;

    const basePrice = Number(order.unitPrice); // Base price without IVA
    const qty = Number(order.quantity);
    
    const lineNet = basePrice * qty;
    const lineIva = lineNet * 0.21;
    const lineSubA = lineNet;
    
    const priceWithIva = basePrice * 1.21;
    const lineSubB = lineNet * 1.21;

    d.setFontSize(FS_XS);

    if (idx % 2 === 1) {
      d.setFillColor(...SOFTER);
      d.rect(ML, ry - 3, CW, rowH, 'F');
    }

    cx = ML;

    // Código
    d.setFont('helvetica', 'normal');
    d.setTextColor(...MID);
    const code = order.id ? order.id.substring(0, 6).toUpperCase() : '-';
    d.text(code, cx + 2, ry);
    cx += colW[0];

    // Cantidad
    d.setTextColor(...DARK);
    d.text(qty.toString(), cx + colW[1] / 2, ry, { align: 'center' });
    cx += colW[1];

    // Descripción
    d.setFont('helvetica', 'bold');
    const descLines = d.splitTextToSize(order.productDescription, colW[2] - 6);
    d.text(descLines, cx + 3, ry);
    d.setFont('helvetica', 'normal');
    const extraH = descLines.length > 1 ? (descLines.length - 1) * 3 : 0;
    cx += colW[2];

    if (isFactA) {
      d.text(money(basePrice), cx + colW[3] - 3, ry, { align: 'right' });
      cx += colW[3];
      d.text('21,00', cx + colW[4] - 3, ry, { align: 'right' });
      cx += colW[4];
      d.text(money(lineIva), cx + colW[5] - 3, ry, { align: 'right' });
      cx += colW[5];
      d.setFont('helvetica', 'bold');
      d.text(money(lineSubA), cx + colW[6] - 3, ry, { align: 'right' });
    } else {
      d.text(money(priceWithIva), cx + colW[3] - 3, ry, { align: 'right' });
      cx += colW[3];
      d.setFont('helvetica', 'bold');
      d.text(money(lineSubB), cx + colW[4] - 3, ry, { align: 'right' });
    }

    ry += rowH + extraH;
  }

  // ── Borde inferior de la tabla ──
  d.setDrawColor(...LIGHT);
  hRule(d, tableBot, ML, RX, 0.3);

  // Bordes verticales laterales
  d.setDrawColor(...DARK);
  vRule(d, ML, y, tableBot, 0.3);
  vRule(d, RX, y, tableBot, 0.3);

  return tableBot;
}

// ══════════════════════════════════════════════════════════════════
//  ⑤ TOTALES (IVA se SUMA al importe neto)
// ══════════════════════════════════════════════════════════════════

function drawTotals(d: jsPDF, y: number, orders: Order[], isFactA: boolean): number {
  const top = y;

  let netoGravado = 0;
  for (const o of orders) {
    netoGravado += Number(o.unitPrice) * Number(o.quantity);
  }
  const ivaTotal = netoGravado * 0.21;
  const totalConIva = netoGravado + ivaTotal;
  const displayTotal = totalConIva;

  const lblCol = ML + CW * 0.58;
  const valCol = RX - 3;
  const gap = 5;
  let ty = top + 6;

  d.setFontSize(FS_SM);

  if (isFactA) {
    d.setFont('helvetica', 'normal');
    d.setTextColor(...MID);
    d.text('Importe Neto Gravado', lblCol, ty, { align: 'right' });
    d.setTextColor(...DARK);
    d.text(`$ ${money(netoGravado)}`, valCol, ty, { align: 'right' });
    ty += gap;

    d.setTextColor(...MID);
    d.text('IVA 21,00%', lblCol, ty, { align: 'right' });
    d.setTextColor(...DARK);
    d.text(`$ ${money(ivaTotal)}`, valCol, ty, { align: 'right' });
    ty += gap;

    d.setTextColor(...MID);
    d.text('Otros Tributos', lblCol, ty, { align: 'right' });
    d.setTextColor(...DARK);
    d.text('$ 0,00', valCol, ty, { align: 'right' });
    ty += 3;

    d.setDrawColor(...ACCENT);
    hRule(d, ty, lblCol - 20, RX, 0.4);
    ty += 6;
  } else {
    d.setFont('helvetica', 'normal');
    d.setTextColor(...MID);
    d.text('Subtotal', lblCol, ty, { align: 'right' });
    d.setTextColor(...DARK);
    d.text(`$ ${money(displayTotal)}`, valCol, ty, { align: 'right' });
    ty += 3;

    d.setDrawColor(...ACCENT);
    hRule(d, ty, lblCol - 20, RX, 0.4);
    ty += 6;
  }

  // ── TOTAL PROMINENTE ──
  d.setFillColor(...ACCENT);
  const boxX = lblCol - 22;
  const boxW = RX - boxX;
  d.roundedRect(boxX, ty - 4.5, boxW, 9, 1, 1, 'F');

  d.setTextColor(...WHITE);
  d.setFontSize(FS_MD);
  d.setFont('helvetica', 'bold');
  d.text('TOTAL', lblCol - 2, ty + 1.5, { align: 'right' });
  d.setFontSize(FS_LG);
  d.text(`$ ${money(displayTotal)}`, valCol, ty + 1.5, { align: 'right' });

  const sectionBot = ty + 8;

  d.setDrawColor(...DARK);
  vRule(d, ML, top, sectionBot, 0.3);
  vRule(d, RX, top, sectionBot, 0.3);
  hRule(d, sectionBot, ML, RX, 0.3);

  return sectionBot;
}

// ══════════════════════════════════════════════════════════════════
//  ⑥ TRANSPARENCIA FISCAL (Ley 27.743 — Solo Facturas B/C)
// ══════════════════════════════════════════════════════════════════

function drawTransparencia(d: jsPDF, y: number, orders: Order[], isFactA: boolean): number {
  if (isFactA) return y;

  let netoGravado = 0;
  for (const o of orders) {
    netoGravado += Number(o.unitPrice) * Number(o.quantity);
  }
  const ivaContenido = netoGravado * 0.21;

  const h = 6;
  d.setFillColor(...SOFTER);
  d.rect(ML, y, CW, h, 'F');

  d.setFontSize(FS_MICRO);
  d.setTextColor(...ACCENT);
  d.setFont('helvetica', 'bold');
  d.text('Régimen de Transparencia Fiscal al Consumidor (Ley 27.743)', ML + 3, y + 4);

  d.setTextColor(...DARK);
  d.text(`IVA Contenido: $ ${money(ivaContenido)}`, RX - 3, y + 4, { align: 'right' });

  // Bordes
  d.setDrawColor(...DARK);
  vRule(d, ML, y, y + h, 0.3);
  vRule(d, RX, y, y + h, 0.3);
  hRule(d, y + h, ML, RX, 0.3);

  return y + h;
}

// ══════════════════════════════════════════════════════════════════
//  ⑦ PIE DE PÁGINA (QR + CAE + Leyendas)
// ══════════════════════════════════════════════════════════════════

function drawFooter(d: jsPDF, y: number, inv: Invoice, legend?: string | null): void {
  const footH = 25;
  const top = y;
  const bot = top + footH;
  const qrS = 21;

  // ── Bordes ──
  d.setDrawColor(...DARK);
  vRule(d, ML, top, bot, 0.3);
  vRule(d, RX, top, bot, 0.3);
  hRule(d, bot, ML, RX, 0.4);

  // ── Código QR ──
  if (inv.qrData) {
    try {
      d.addImage(inv.qrData, 'PNG', ML + 2, top + 2, qrS, qrS);
    } catch { /* sin QR */ }
  } else {
    d.setDrawColor(...LIGHT);
    d.setLineWidth(0.2);
    d.roundedRect(ML + 2, top + 2, qrS, qrS, 1, 1, 'S');
    d.setFontSize(FS_MICRO);
    d.setTextColor(0, 140, 80);
    d.setFont('helvetica', 'normal');
    d.text('Espacio', ML + 2 + qrS / 2, top + 10, { align: 'center' });
    d.text('reservado', ML + 2 + qrS / 2, top + 13, { align: 'center' });
    d.text('ARCA', ML + 2 + qrS / 2, top + 16, { align: 'center' });
  }

  // ── Leyenda comercial ──
  const midX = ML + qrS + 6;
  if (legend) {
    d.setFontSize(FS_MICRO);
    d.setTextColor(...MID);
    d.setFont('helvetica', 'italic');
    d.text(legend, midX, top + 6, { maxWidth: CW / 2 - qrS });
  }

  // ── CAE y Autorización ──
  d.setTextColor(...ACCENT);
  d.setFontSize(FS_BASE);
  d.setFont('helvetica', 'bold');
  d.text('Comprobante Autorizado', RX - 3, top + 5, { align: 'right' });

  if (inv.cae) {
    d.setFontSize(FS_XS);
    d.setTextColor(...MID);
    d.setFont('helvetica', 'normal');
    d.text('CAE N°:', RX - 35, top + 10);
    d.setTextColor(...DARK);
    d.setFont('helvetica', 'bold');
    d.text(inv.cae, RX - 3, top + 10, { align: 'right' });

    d.setTextColor(...MID);
    d.setFont('helvetica', 'normal');
    d.text('Fecha Vto:', RX - 35, top + 14);
    d.setTextColor(...DARK);
    d.text(inv.caeExpiration ? date(inv.caeExpiration) : '-', RX - 3, top + 14, { align: 'right' });
  }

  // ── Pie legal ──
  d.setFontSize(FS_MICRO);
  d.setTextColor(...MID);
  d.setFont('helvetica', 'italic');
  d.text(
    'Esta Administración Federal no se responsabiliza por los datos ingresados en el detalle de la operación.',
    CX, bot - 2, { align: 'center', maxWidth: CW - 6 }
  );
}

// ══════════════════════════════════════════════════════════════════
//  COMPOSITOR PRINCIPAL
// ══════════════════════════════════════════════════════════════════

function drawPage(
  d: jsPDF, inv: Invoice, client: Client, orders: Order[],
  cfg: BusinessConfig | null | undefined, copyType: string, logo: string | null
): void {
  const isFactA = inv.invoiceType === 'FACTURA_A' || inv.invoiceType === 'NOTA_CREDITO_A';

  let y = MT;

  // ① Banner
  y = drawBanner(d, y, copyType);

  // ② Header
  y = drawHeader(d, y, inv, cfg, logo);

  // ③ Cliente
  y = drawClient(d, y, client);

  // Calcular espacio reservado para secciones inferiores
  const totalsH = isFactA ? 30 : 20;
  const transpH = isFactA ? 0 : 6;
  const footerH = 25;
  const reserved = totalsH + transpH + footerH + 3;
  const tableMaxBot = PH - MT - reserved;

  // ④ Tabla
  y = drawTable(d, y, orders, isFactA, tableMaxBot);

  // ⑤ Totales
  y = drawTotals(d, y, orders, isFactA);

  // ⑥ Transparencia Fiscal
  y = drawTransparencia(d, y, orders, isFactA);

  // ⑦ Footer
  drawFooter(d, y, inv, cfg?.commercialLegend);
}

// ══════════════════════════════════════════════════════════════════
//  UTILS DE IMAGEN
// ══════════════════════════════════════════════════════════════════

async function loadImage(url: string): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise(r => {
      const fr = new FileReader();
      fr.onloadend = () => r(fr.result as string);
      fr.onerror = () => r(null);
      fr.readAsDataURL(blob);
    });
  } catch { return null; }
}

// ══════════════════════════════════════════════════════════════════
//  EXPORT PÚBLICO
// ══════════════════════════════════════════════════════════════════

export async function generateInvoicePdf(
  invoice: Invoice, client: Client, orders: Order[],
  config: BusinessConfig | null | undefined
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [PW, PH] });

  const logo = config?.logoPath ? await loadImage(config.logoPath) : null;

  // Página 1: ORIGINAL
  drawPage(doc, invoice, client, orders, config, 'ORIGINAL', logo);

  // Página 2: DUPLICADO
  doc.addPage([PW, PH]);
  drawPage(doc, invoice, client, orders, config, 'DUPLICADO', logo);

  const typeName = invoice.invoiceType.includes('NOTA_CREDITO') ? 'Nota_de_Credito' : 'Factura';
  doc.save(`${typeName}_${invoice.invoiceNumber}.pdf`);
}
