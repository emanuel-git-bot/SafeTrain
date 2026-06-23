import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import QRCode from 'qrcode';

export async function generateCertificatePDF(certificate: any, template: any, user: any, course: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([842, 595]); // A4 landscape

  // Load available fonts
  const fonts: Record<string, PDFFont> = {
    'Helvetica-normal': await pdfDoc.embedFont(StandardFonts.Helvetica),
    'Helvetica-bold': await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    'Times-normal': await pdfDoc.embedFont(StandardFonts.TimesRoman),
    'Times-bold': await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
    'Courier-normal': await pdfDoc.embedFont(StandardFonts.Courier),
    'Courier-bold': await pdfDoc.embedFont(StandardFonts.CourierBold),
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? rgb(
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    ) : rgb(0, 0, 0);
  };

  // If template has a background image, draw it
  if (template?.backgroundImageUrl) {
    try {
      // Use native fetch to get the image buffer
      const res = await fetch(template.backgroundImageUrl);
      if (res.ok) {
        const imgBytes = await res.arrayBuffer();
        try {
          const img = await pdfDoc.embedPng(imgBytes);
          page.drawImage(img, { x: 0, y: 0, width: 842, height: 595 });
        } catch (e) {
          try {
            const img = await pdfDoc.embedJpg(imgBytes);
            page.drawImage(img, { x: 0, y: 0, width: 842, height: 595 });
          } catch (e2) {
             console.error('Failed to embed image format', e2);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load certificate background image', err);
    }
  }

  // Parse elements
  let elements = [];
  if (template?.elements) {
    try {
      elements = typeof template.elements === 'string' ? JSON.parse(template.elements) : template.elements;
    } catch (e) {
      console.error('Failed to parse elements', e);
    }
  }
  
  if (elements.length === 0) {
    elements = [
      { type: 'student_name', x: 421, y: 300, fontSize: 36, textAlign: 'center' },
      { type: 'course_name', x: 421, y: 250, fontSize: 24, textAlign: 'center' },
      { type: 'issue_date', x: 421, y: 200, fontSize: 16, textAlign: 'center' },
      { type: 'qr_code', x: 50, y: 50, size: 100 },
      { type: 'validation_code', x: 50, y: 30, fontSize: 12 }
    ];
  }

  for (const el of elements) {
    let textToDraw = '';
    
    if (el.type === 'student_name') textToDraw = user.name;
    else if (el.type === 'course_name') textToDraw = course.title;
    else if (el.type === 'issue_date') {
      const d = new Date(certificate.issuedAt);
      textToDraw = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    }
    else if (el.type === 'workload') textToDraw = course.duration || '0 horas';
    else if (el.type === 'validation_code') textToDraw = `Código de Validação: ${certificate.code}`;
    else if (el.type === 'qr_code') {
      try {
        const validationUrl = `http://localhost:5173/validar/${certificate.code}`;
        const qrCodeDataUrl = await QRCode.toDataURL(validationUrl);
        const base64Data = qrCodeDataUrl.split(',')[1];
        const qrImageBytes = Buffer.from(base64Data, 'base64');
        const qrImage = await pdfDoc.embedPng(qrImageBytes);
        page.drawImage(qrImage, {
          x: el.x,
          y: 595 - el.y - (el.size || 100), // Invert Y for pdf-lib (bottom-up)
          width: el.size || 100,
          height: el.size || 100
        });
      } catch (err) {
        console.error('Failed to generate QR Code', err);
      }
      continue;
    }
    else if (el.type === 'static_text') textToDraw = el.text || '';

    if (textToDraw) {
      const fontSize = el.fontSize || 16;
      let xPos = el.x;
      // pdf-lib Y coordinate starts from bottom, so we invert it relative to 595 (A4 height)
      let yPos = 595 - el.y;

      const fontFamily = el.fontFamily || 'Helvetica';
      const fontWeight = el.fontWeight || 'normal';
      const fontKey = `${fontFamily}-${fontWeight}`;
      const fontToUse = fonts[fontKey] || fonts['Helvetica-normal'];
      const textColor = el.color ? hexToRgb(el.color) : rgb(0, 0, 0);

      if (el.textAlign === 'center') {
        const textWidth = fontToUse.widthOfTextAtSize(textToDraw, fontSize);
        xPos = el.x - textWidth / 2;
      }

      page.drawText(textToDraw, {
        x: xPos,
        y: yPos,
        size: fontSize,
        font: fontToUse,
        color: textColor
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
