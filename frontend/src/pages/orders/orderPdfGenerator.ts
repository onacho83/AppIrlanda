import jsPDF from 'jspdf';
import type { Order, Client } from '../../types';
import type { BusinessConfig } from '../../services/configService';

// ══════════════════════════════════════════════════════════════════
//  LAYOUT A5 APAISADO (Landscape) — 210 × 148 mm
//  Dividido en: Parte Principal (Izquierda) y Talón Cliente (Derecha)
// ══════════════════════════════════════════════════════════════════

const PW = 210;
const PH = 148;
const ML = 10;           // Margen izquierdo general
const MT = 10;           // Margen superior general
const STUB_WIDTH = 58;   // Ancho del talón (lado derecho - reducido 10%)
const MAIN_WIDTH = PW - ML * 2 - STUB_WIDTH - 5; // Ancho zona principal
const DIVIDER_X = ML + MAIN_WIDTH + 2.5; // Coordenada X de la línea de corte

// ── Paleta de color corporativa ──
const ACCENT: [number, number, number] = [22, 40, 72];    // Navy corporativo
const DARK: [number, number, number] = [30, 30, 35];      // Textos principales
const MID: [number, number, number] = [100, 100, 110];    // Textos secundarios
const LIGHT: [number, number, number] = [200, 200, 208];  // Líneas sutiles
const SOFTER: [number, number, number] = [245, 246, 248]; // Fondos sutiles
const WHITE: [number, number, number] = [255, 255, 255];

// ── Tipografía ──
const FS_MICRO = 6;
const FS_XS    = 8;
const FS_SM    = 9;
const FS_BASE  = 10;
const FS_MD    = 12;
const FS_LG    = 14;
const FS_XL    = 18;
const FS_LETTER= 22;

// ══════════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════════

function money(n: number): string { return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function date(s: string): string { return new Date(s).toLocaleDateString('es-AR'); }

function drawWrapped(d: jsPDF, text: string, x: number, y: number, maxW: number, align: 'left'|'right'|'center' = 'left'): number {
  const lines = d.splitTextToSize(text || '-', maxW);
  d.text(lines, x, y, { align });
  const lh = (d.getFontSize() * d.getLineHeightFactor()) / d.internal.scaleFactor;
  return y + lines.length * lh;
}

function labelValue(d: jsPDF, label: string, value: string, lx: number, y: number, vx: number, vMaxW: number): number {
  d.setFont('helvetica', 'normal');
  d.setTextColor(...MID);
  d.text(label, lx, y);
  d.setFont('helvetica', 'bold');
  d.setTextColor(...DARK);
  return drawWrapped(d, value || '-', vx, y, vMaxW);
}

// ══════════════════════════════════════════════════════════════════
//  1. ZONA PRINCIPAL (Empresa, Cliente, Detalles)
// ══════════════════════════════════════════════════════════════════

function drawMainSection(d: jsPDF, order: Order, client: Client | null, cfg: BusinessConfig | null | undefined, logo: string | null) {
  let y = MT;
  
  // -- CUADRO DE LETRA (P de Pedido) --
  const boxW = 16;
  const boxH = 16;
  const boxX = ML + MAIN_WIDTH / 2 - boxW / 2;
  
  d.setDrawColor(...DARK);
  d.setLineWidth(0.4);
  d.roundedRect(ML, y, MAIN_WIDTH, 30, 2, 2, 'S');
  
  d.setFillColor(...WHITE);
  d.rect(boxX - 2, y - 2, boxW + 4, boxH + 4, 'F');
  
  d.setFillColor(...ACCENT);
  d.setDrawColor(...ACCENT);
  d.roundedRect(boxX, y - 2, boxW, boxH, 2, 2, 'FD');
  
  d.setTextColor(...WHITE);
  d.setFontSize(FS_LETTER);
  d.setFont('helvetica', 'bold');
  d.text('P', boxX + boxW / 2, y + 9.5, { align: 'center' });
  
  d.setTextColor(...MID);
  d.setFontSize(FS_MICRO);
  d.setFont('helvetica', 'normal');
  d.text('ORDEN TRABAJO', boxX + boxW / 2, y + boxH + 1, { align: 'center' });

  // -- EMISOR (Izquierda del cuadro) --
  const lPad = ML + 4;
  let ly = y + 4;
  
  if (logo) {
    try {
      d.addImage(logo, 'PNG', lPad, ly - 1, 14, 14);
      d.setFontSize(FS_LG);
      d.setFont('helvetica', 'bold');
      d.setTextColor(...DARK);
      d.text(cfg?.businessName || 'Imprenta Irlanda', lPad + 16, ly + 5);
    } catch {
      d.setFontSize(FS_LG);
      d.setFont('helvetica', 'bold');
      d.setTextColor(...DARK);
      d.text(cfg?.businessName || 'Imprenta Irlanda', lPad, ly + 5);
    }
  } else {
    d.setFontSize(FS_LG);
    d.setFont('helvetica', 'bold');
    d.setTextColor(...DARK);
    d.text(cfg?.businessName || 'Imprenta Irlanda', lPad, ly + 5);
  }

  // -- PEDIDO INFO (Derecha del cuadro) --
  const rPad = boxX + boxW + 5;
  let ry = y + 8;
  d.setFontSize(FS_LG); // Reducido para evitar cruzar la línea punteada
  d.setFont('helvetica', 'bold');
  d.setTextColor(...ACCENT);
  d.text(`N° ${order.orderNumber}`, rPad, ry);
  
  ry += 7;
  d.setFontSize(FS_SM);
  d.setTextColor(...DARK);
  labelValue(d, 'Fecha:', date(order.createdAt), rPad, ry, rPad + 14, 50);
  
  y += 35;

  // -- CLIENTE --
  d.setFillColor(...SOFTER);
  d.roundedRect(ML, y, MAIN_WIDTH, 6, 1, 1, 'F');
  d.setFontSize(FS_XS);
  d.setFont('helvetica', 'bold');
  d.setTextColor(...ACCENT);
  d.text('DATOS DEL CLIENTE', ML + 3, y + 4);
  y += 10;

  const col2 = ML + MAIN_WIDTH / 2;
  const v1 = ML + 18;
  const v2 = col2 + 18;
  
  let cy = y;
  const cy1 = labelValue(d, 'Señor(es):', client?.name || 'Consumidor Final', ML, cy, v1, MAIN_WIDTH / 2 - 20);
  const cy2 = labelValue(d, 'Teléfono:', client?.phone || '-', col2, cy, v2, MAIN_WIDTH / 2 - 20);
  cy = Math.max(cy1, cy2) + 2;
  
  const cy3 = labelValue(d, 'Email:', client?.email || '-', ML, cy, v1, MAIN_WIDTH / 2 - 20);
  y = cy3 + 6;

  // -- DETALLES DEL PRODUCTO --
  d.setFillColor(...SOFTER);
  d.roundedRect(ML, y, MAIN_WIDTH, 6, 1, 1, 'F');
  d.setFontSize(FS_XS);
  d.setFont('helvetica', 'bold');
  d.setTextColor(...ACCENT);
  d.text('ESPECIFICACIONES DEL TRABAJO', ML + 3, y + 4);
  y += 10;

  const py1 = labelValue(d, 'Producto:', order.product?.name || order.productDescription, ML, y, v1, MAIN_WIDTH - 20);
  y = py1 + 2;
  const py2 = labelValue(d, 'Detalle:', order.productDescription, ML, y, v1, MAIN_WIDTH - 20);
  y = py2 + 2;
  const py3 = labelValue(d, 'Cantidad:', order.quantity.toString(), ML, y, v1, MAIN_WIDTH - 20);
  y = py3 + 2;

  // Render spec list if any
  if (order.specifications && Object.keys(order.specifications).length > 0) {
    d.setFont('helvetica', 'normal');
    d.setTextColor(...MID);
    d.text('Extras:', ML, y);
    
    let specText = '';
    for (const [k, v] of Object.entries(order.specifications)) {
      specText += `${k}: ${v}   |   `;
    }
    
    d.setFont('helvetica', 'bold');
    d.setTextColor(...DARK);
    y = drawWrapped(d, specText.substring(0, specText.length - 7), v1, y, MAIN_WIDTH - 20);
    y += 2;
  }
  
  if (order.notes) {
    const ny = labelValue(d, 'Notas:', order.notes, ML, y, v1, MAIN_WIDTH - 20);
    y = ny + 2;
  }
  
  // -- TOTALES --
  const tY = PH - MT - 22;
  d.setDrawColor(...LIGHT);
  d.setLineWidth(0.5);
  d.line(ML, tY - 4, ML + MAIN_WIDTH, tY - 4);
  
  d.setFontSize(FS_BASE);
  labelValue(d, 'Subtotal:', `$ ${money(Number(order.subtotal))}`, ML + MAIN_WIDTH - 60, tY, ML + MAIN_WIDTH - 30, 30);
  
  d.setFontSize(FS_LG);
  d.setTextColor(...ACCENT);
  d.text('TOTAL:', ML + MAIN_WIDTH - 60, tY + 10);
  d.setTextColor(...DARK);
  d.text(`$ ${money(Number(order.total))}`, ML + MAIN_WIDTH - 30, tY + 10);
  
  // Pagos a la izquierda
  d.setFontSize(FS_SM);
  labelValue(d, 'Abonado:', `$ ${money(Number(order.paidAmount))}`, ML, tY + 8, ML + 22, 40);
  const saldo = Number(order.total) - Number(order.paidAmount);
  d.setTextColor(saldo > 0 ? 200 : 50, saldo > 0 ? 0 : 150, 50); // Rojo si debe, verde si no
  labelValue(d, 'Saldo Pdt:', `$ ${money(saldo)}`, ML, tY + 14, ML + 22, 40);
  
  // -- LEYENDAS LEGALES --
  d.setFontSize(FS_MICRO);
  d.setTextColor(...MID);
  d.setFont('helvetica', 'italic');
  d.text('Documento no válido como factura. Los precios no incluyen IVA.', ML, PH - MT - 2);
}

// ══════════════════════════════════════════════════════════════════
//  2. TALÓN PARA CLIENTE (Derecha)
// ══════════════════════════════════════════════════════════════════

function drawStubSection(d: jsPDF, order: Order, client: Client | null, cfg: BusinessConfig | null | undefined, logo: string | null) {
  const sX = DIVIDER_X + 2.5;
  let y = MT;
  
  // Logo pequeño centrado
  if (logo) {
    try {
      d.addImage(logo, 'PNG', sX + STUB_WIDTH / 2 - 7, y, 14, 14);
      y += 18;
    } catch {
      y += 5;
    }
  } else {
    y += 5;
  }
  
  d.setFontSize(FS_MD);
  d.setFont('helvetica', 'bold');
  d.setTextColor(...ACCENT);
  d.text('TALÓN CLIENTE', sX + STUB_WIDTH / 2, y, { align: 'center' });
  y += 6;
  
  d.setFontSize(FS_SM);
  d.setTextColor(...DARK);
  d.text(cfg?.businessName || 'Imprenta Irlanda', sX + STUB_WIDTH / 2, y, { align: 'center' });
  y += 10;
  
  d.setFillColor(...SOFTER);
  d.roundedRect(sX, y, STUB_WIDTH, 18, 1, 1, 'F');
  
  d.setFontSize(FS_MD); // Reducido acorde al resto
  d.setFont('helvetica', 'bold');
  d.setTextColor(...ACCENT);
  d.text(`Pedido N° ${order.orderNumber}`, sX + STUB_WIDTH / 2, y + 7, { align: 'center' });
  
  d.setFontSize(FS_SM);
  d.setTextColor(...DARK);
  d.text(`Fecha: ${date(order.createdAt)}`, sX + STUB_WIDTH / 2, y + 13, { align: 'center' });
  y += 24;
  
  d.setFontSize(FS_XS);
  const vx = sX + 18;
  const cy1 = labelValue(d, 'Cliente:', client?.name || 'Consumidor Final', sX, y, vx, STUB_WIDTH - 18);
  y = cy1 + 3;
  const cy2 = labelValue(d, 'Trabajo:', order.productDescription, sX, y, vx, STUB_WIDTH - 18);
  y = cy2 + 3;
  
  const cy3 = labelValue(d, 'Cantidad:', order.quantity.toString(), sX, y, vx, STUB_WIDTH - 18);
  y = cy3 + 10;
  
  const tY = PH - MT - 22;
  
  d.setFontSize(FS_SM);
  d.setTextColor(...DARK);
  d.setFont('helvetica', 'bold');
  d.text('TOTAL:', sX, tY);
  d.text(`$ ${money(Number(order.total))}`, sX + STUB_WIDTH, tY, { align: 'right' });
  
  const saldo = Number(order.total) - Number(order.paidAmount);
  d.setFontSize(FS_MD);
  d.setTextColor(...ACCENT);
  d.text('SALDO:', sX, tY + 8);
  d.text(`$ ${money(saldo)}`, sX + STUB_WIDTH, tY + 8, { align: 'right' });
  
  // Footer text
  d.setFontSize(FS_MICRO);
  d.setTextColor(...MID);
  d.setFont('helvetica', 'normal');
  d.text('Presente este talón para retirar su trabajo.', sX + STUB_WIDTH / 2, PH - MT - 8, { align: 'center' });
  
  d.setFontSize(FS_MICRO + 1);
  d.setFont('helvetica', 'bold');
  d.setTextColor(...DARK);
  d.text('No válido como factura.', sX + STUB_WIDTH / 2, PH - MT - 4, { align: 'center' });
  d.text('Los precios no incluyen IVA.', sX + STUB_WIDTH / 2, PH - MT, { align: 'center' });
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

export async function generateOrderPdf(
  order: Order, client: Client | null, config: BusinessConfig | null | undefined
): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [PW, PH] });
  const logo = config?.logoPath ? await loadImage(config.logoPath) : null;

  // Línea de corte punteada en el medio
  doc.setDrawColor(...LIGHT);
  doc.setLineWidth(0.4);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(DIVIDER_X, 0, DIVIDER_X, PH);
  doc.setLineDashPattern([], 0); // reset

  drawMainSection(doc, order, client, config, logo);
  drawStubSection(doc, order, client, config, logo);

  doc.save(`Pedido_${order.orderNumber}.pdf`);
}
