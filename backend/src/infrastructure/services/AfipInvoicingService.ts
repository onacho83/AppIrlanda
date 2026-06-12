import Afip from '@afipsdk/afip.js';
import QRCode from 'qrcode';
import { IInvoicingService, InvoiceData, InvoiceResult } from '../../application/interfaces/IInvoicingService';
import { IBusinessConfigRepository } from '../../domain/repositories/IBusinessConfigRepository';
import { AppError } from '../../shared/errors/AppError';

export class AfipInvoicingService implements IInvoicingService {
  constructor(private configRepo: IBusinessConfigRepository) {}

  private async getAfipInstance() {
    const config = await this.configRepo.getConfig();
    
    // Validar configuracin
    if (!config.cuit || !config.arcaSalePoint) {
      throw new AppError('Falta configurar CUIT o Punto de Venta en el sistema', 400);
    }

    // El sdk afip.js puede usar archivos o strings pasados directamente en 'cert' y 'key'.
    // En homologacin, afip.js trae certificados de prueba por defecto si no pasamos nada.
    // As que si estamos en desarrollo y no pasamos cert, afip.js usa los propios (cuit de prueba).
    
    const options: any = {
      CUIT: Number(config.cuit),
      production: config.arcaProduction,
    };

    if (config.arcaCert && config.arcaKey) {
      options.cert = config.arcaCert;
      options.key = config.arcaKey;
    }

    return new Afip(options);
  }

  public async generateInvoice(data: InvoiceData): Promise<InvoiceResult> {
    const config = await this.configRepo.getConfig();
    const afip = await this.getAfipInstance();
    const salePoint = config.arcaSalePoint!;

    // Determinar tipo de comprobante AFIP (11 = Factura C, 1 = Factura A, 6 = Factura B, 3 = NC A, 8 = NC B, 13 = NC C)
    let tipoCmp = 11; // Factura C por defecto
    if (data.invoiceType === 'FACTURA_A') tipoCmp = 1;
    else if (data.invoiceType === 'FACTURA_B') tipoCmp = 6;
    else if (data.invoiceType === 'NOTA_CREDITO_A') tipoCmp = 3;
    else if (data.invoiceType === 'NOTA_CREDITO_B') tipoCmp = 8;
    else if (data.invoiceType === 'NOTA_CREDITO_C') tipoCmp = 13;

    let lastVoucher = 0;
    if (!config.arcaCert || !config.arcaKey) {
      lastVoucher = Math.floor(Math.random() * 1000); // MOCK
    } else {
      // Obtener último número de comprobante real
      lastVoucher = await afip.ElectronicBilling.getLastVoucher(salePoint, tipoCmp);
    }
    const invoiceNumber = lastVoucher + 1;

    // Determinar DocTipo (99 = Consumidor final/Sin DNI, 80 = CUIT, 96 = DNI)
    let docTipo = 99;
    let docNro = 0;
    
    if (data.cuit) {
      const cleanCuit = data.cuit.replace(/[^0-9]/g, '');
      if (cleanCuit.length === 11) {
        docTipo = 80; // CUIT
        docNro = Number(cleanCuit);
      } else if (cleanCuit.length > 6) {
        docTipo = 96; // DNI
        docNro = Number(cleanCuit);
      }
    }

    const fecha = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0].replace(/-/g, '');

    const afipData: any = {
      'CantReg': 1,
      'PtoVta': salePoint,
      'CbteTipo': tipoCmp, 
      'Concepto': 2, // 1 = Productos, 2 = Servicios, 3 = Prod y Serv
      'DocTipo': docTipo,
      'DocNro': docNro,
      'CbteDesde': invoiceNumber,
      'CbteHasta': invoiceNumber,
      'CbteFch': parseInt(fecha),
      'ImpTotal': data.total,
      'ImpTotConc': 0,
      'ImpNeto': data.invoiceType === 'FACTURA_C' ? data.total : data.netAmount,
      'ImpOpEx': 0,
      'ImpTrib': 0,
      'ImpIVA': data.invoiceType === 'FACTURA_C' ? 0 : data.taxAmount,
      'FchServDesde': parseInt(fecha),
      'FchServHasta': parseInt(fecha),
      'FchVtoPago': parseInt(fecha),
      'MonId': 'PES',
      'MonCotiz': 1
    };

    if (data.associatedInvoice) {
      afipData.CbtesAsoc = [
        {
          Tipo: data.associatedInvoice.cbteTipo,
          PtoVta: data.associatedInvoice.ptoVta,
          Nro: data.associatedInvoice.nro
        }
      ];
    }

    // Si es A o B con IVA (Factura o Nota de Crédito), enviamos la tabla de IVA (21% es Id=5)
    if (!data.invoiceType.includes('C') && data.taxAmount > 0) {
      afipData.Iva = [
        {
          'Id': 5, // 21%
          'BaseImp': data.netAmount,
          'Importe': data.taxAmount
        }
      ];
    }

    try {
      let cae = '';
      let caeExpirationStr = '';
      let res: any = {};

      if (!config.arcaCert || !config.arcaKey) {
        if (config.arcaProduction) {
          throw new AppError('Faltan configurar los certificados de AFIP en producción.', 400);
        }
        // MOCK para homologación sin certificados
        cae = Math.floor(Math.random() * 100000000000000).toString().padStart(14, '1');
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + 10);
        caeExpirationStr = expDate.toISOString().split('T')[0].replace(/-/g, '');
        res = { CAE: cae, CAEFchVto: caeExpirationStr, MOCK: true };
      } else {
        res = await afip.ElectronicBilling.createVoucher(afipData);
        cae = res.CAE;
        caeExpirationStr = res.CAEFchVto;
      }
      
      const caeExpiration = new Date(`${caeExpirationStr.substring(0,4)}-${caeExpirationStr.substring(4,6)}-${caeExpirationStr.substring(6,8)}T12:00:00Z`);

      // Generar string para QR
      const qrObj = {
        "ver": 1,
        "fecha": `${caeExpirationStr.substring(0,4)}-${caeExpirationStr.substring(4,6)}-${caeExpirationStr.substring(6,8)}`,
        "cuit": Number(config.cuit),
        "ptoVta": salePoint,
        "tipoCmp": tipoCmp,
        "nroCmp": invoiceNumber,
        "importe": data.total,
        "moneda": "PES",
        "ctz": 1,
        "tipoDocRec": docTipo,
        "nroDocRec": docNro,
        "tipoCodAut": "E",
        "codAut": Number(cae)
      };

      const qrBase64 = Buffer.from(JSON.stringify(qrObj)).toString('base64');
      const qrUrl = `https://www.afip.gob.ar/fe/qr/?p=${qrBase64}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl);

      // Formatear nro de factura 0000-00000000
      const formattedNumber = `${salePoint.toString().padStart(4, '0')}-${invoiceNumber.toString().padStart(8, '0')}`;

      return {
        cae,
        caeExpiration,
        invoiceNumber: formattedNumber,
        salePoint,
        qrData: qrDataUrl,
        arcaRequest: afipData,
        arcaResponse: res
      };
    } catch (err: any) {
      console.error('Error generando factura AFIP:', err);
      if (err instanceof AppError) throw err;
      throw new AppError(`Error de AFIP: ${err.message || 'Error desconocido'}`, 500);
    }
  }
}
