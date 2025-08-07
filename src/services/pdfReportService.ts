import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { IntegrationRequest } from '../types';

export const pdfReportService = {
  async generateExecutiveReport(requests: IntegrationRequest[], systems: any = {}): Promise<void> {
    try {
      // Crear un contenedor temporal para el reporte
      const reportContainer = document.createElement('div');
      reportContainer.style.position = 'absolute';
      reportContainer.style.left = '-9999px';
      reportContainer.style.top = '0';
      reportContainer.style.width = '210mm'; // A4 width
      reportContainer.style.backgroundColor = 'white';
      reportContainer.style.fontFamily = 'Arial, sans-serif';
      reportContainer.style.padding = '20px';
      
      document.body.appendChild(reportContainer);

      const getSystemName = (systemId: string) => {
        return systems[systemId] || systemId;
      };

      const getStats = () => {
        return {
          total: requests.length,
          pendientes: requests.filter(r => ['submitted', 'in_review'].includes(r.status)).length,
          aprobadas: requests.filter(r => r.status === 'approved').length,
          enDesarrollo: requests.filter(r => r.status === 'in_development').length,
          completadas: requests.filter(r => r.status === 'completed').length,
          rechazadas: requests.filter(r => r.status === 'rejected').length,
          conSprint: requests.filter(r => r.sprintInfo).length,
          sinSprint: requests.filter(r => !r.sprintInfo && r.status === 'approved').length,
          huGeneradas: requests.filter(r => r.userStoryGenerated).length,
          huPendientes: requests.filter(r => r.status === 'approved' && !r.userStoryGenerated).length
        };
      };

      const stats = getStats();

      // Crear el HTML del reporte
      reportContainer.innerHTML = `
        <div style="max-width: 100%; margin: 0 auto; background: white;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0066CC; padding-bottom: 20px;">
            <h1 style="color: #0066CC; font-size: 28px; margin: 0; font-weight: bold;">
              📊 REPORTE EJECUTIVO DE INTEGRACIONES
            </h1>
            <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">
              IT Integration Management Application
            </p>
            <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">
              Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}
            </p>
          </div>

          <!-- Dashboard Cards -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px;">
            <!-- Fila 1 -->
            <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 8px;">📄</div>
              <div style="font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 4px;">${stats.total}</div>
              <div style="font-size: 14px; color: #64748b; font-weight: 600;">Total</div>
            </div>
            
            <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 8px;">⏰</div>
              <div style="font-size: 24px; font-weight: bold; color: #92400e; margin-bottom: 4px;">${stats.pendientes}</div>
              <div style="font-size: 14px; color: #92400e; font-weight: 600;">Pendientes</div>
            </div>
            
            <div style="background: #dcfce7; border: 2px solid #22c55e; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 8px;">✅</div>
              <div style="font-size: 24px; font-weight: bold; color: #166534; margin-bottom: 4px;">${stats.aprobadas}</div>
              <div style="font-size: 14px; color: #166534; font-weight: 600;">Aprobadas</div>
            </div>

            <!-- Fila 2 -->
            <div style="background: #f3e8ff; border: 2px solid #a855f7; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 8px;">📈</div>
              <div style="font-size: 24px; font-weight: bold; color: #7c2d12; margin-bottom: 4px;">${stats.enDesarrollo}</div>
              <div style="font-size: 14px; color: #7c2d12; font-weight: 600;">En Desarrollo</div>
            </div>
            
            <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 8px;">✅</div>
              <div style="font-size: 24px; font-weight: bold; color: #065f46; margin-bottom: 4px;">${stats.completadas}</div>
              <div style="font-size: 14px; color: #065f46; font-weight: 600;">Completadas</div>
            </div>
            
            <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 8px;">❌</div>
              <div style="font-size: 24px; font-weight: bold; color: #991b1b; margin-bottom: 4px;">${stats.rechazadas}</div>
              <div style="font-size: 14px; color: #991b1b; font-weight: 600;">Rechazadas</div>
            </div>
          </div>

          <!-- Segunda fila de estadísticas -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
            <div style="background: #dbeafe; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 28px; margin-bottom: 8px;">📅</div>
              <div style="font-size: 20px; font-weight: bold; color: #1e40af; margin-bottom: 4px;">${stats.conSprint}</div>
              <div style="font-size: 12px; color: #1e40af; font-weight: 600;">Con Sprint</div>
            </div>
            
            <div style="background: #fed7aa; border: 2px solid #f97316; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 28px; margin-bottom: 8px;">⚠️</div>
              <div style="font-size: 20px; font-weight: bold; color: #c2410c; margin-bottom: 4px;">${stats.sinSprint}</div>
              <div style="font-size: 12px; color: #c2410c; font-weight: 600;">Sin Sprint</div>
            </div>
            
            <div style="background: #e0e7ff; border: 2px solid #6366f1; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 28px; margin-bottom: 8px;">🪄</div>
              <div style="font-size: 20px; font-weight: bold; color: #4338ca; margin-bottom: 4px;">${stats.huGeneradas}</div>
              <div style="font-size: 12px; color: #4338ca; font-weight: 600;">HU Generadas</div>
            </div>
            
            <div style="background: #e0f2fe; border: 2px solid #0891b2; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 28px; margin-bottom: 8px;">⏳</div>
              <div style="font-size: 20px; font-weight: bold; color: #0c4a6e; margin-bottom: 4px;">${stats.huPendientes}</div>
              <div style="font-size: 12px; color: #0c4a6e; font-weight: 600;">HU Pendientes</div>
            </div>
          </div>

          <!-- Título de la tabla -->
          <div style="margin-bottom: 20px;">
            <h2 style="color: #1e293b; font-size: 20px; margin: 0; font-weight: bold;">
              Solicitudes de Integración (${requests.length})
            </h2>
          </div>

          <!-- Tabla de solicitudes -->
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #475569; border-right: 1px solid #e2e8f0;">INTEGRACIÓN</th>
                  <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #475569; border-right: 1px solid #e2e8f0;">ORIGEN</th>
                  <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #475569; border-right: 1px solid #e2e8f0;">INTERMEDIARIO</th>
                  <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #475569; border-right: 1px solid #e2e8f0;">DESTINO</th>
                  <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #475569; border-right: 1px solid #e2e8f0;">FECHA SOLICITUD</th>
                  <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #475569; border-right: 1px solid #e2e8f0;">FECHA FIN</th>
                  <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #475569; border-right: 1px solid #e2e8f0;">SPRINT</th>
                  <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #475569; border-right: 1px solid #e2e8f0;">HISTORIA USUARIO</th>
                  <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #475569; border-right: 1px solid #e2e8f0;">ESTADO</th>
                  <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #475569;">SOLICITANTE</th>
                </tr>
              </thead>
              <tbody>
                ${requests.map((request, index) => {
                  const getStatusBadge = (status: string) => {
                    const statusConfig = {
                      'draft': { bg: '#f1f5f9', color: '#475569', text: 'Borrador' },
                      'submitted': { bg: '#dbeafe', color: '#1e40af', text: 'Enviada' },
                      'in_review': { bg: '#fed7aa', color: '#c2410c', text: 'En Revisión' },
                      'approved': { bg: '#dcfce7', color: '#166534', text: 'Aprobada' },
                      'rejected': { bg: '#fee2e2', color: '#991b1b', text: 'Rechazada' },
                      'in_development': { bg: '#f3e8ff', color: '#7c2d12', text: 'En Desarrollo' },
                      'completed': { bg: '#d1fae5', color: '#065f46', text: 'Completada' }
                    };
                    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
                    return `<span style="background: ${config.bg}; color: ${config.color}; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">${config.text}</span>`;
                  };

                  const getHUBadge = (request: IntegrationRequest) => {
                    if (request.userStoryGenerated) {
                      return '<span style="background: #e0e7ff; color: #4338ca; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">✨ Generada</span>';
                    } else if (request.status === 'approved') {
                      return '<span style="background: #fed7aa; color: #c2410c; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">⏳ Pendiente</span>';
                    } else {
                      return '<span style="background: #f1f5f9; color: #64748b; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">N/A</span>';
                    }
                  };

                  return `
                    <tr style="border-bottom: 1px solid #f1f5f9; ${index % 2 === 0 ? 'background: #fafafa;' : 'background: white;'}">
                      <td style="padding: 12px 8px; border-right: 1px solid #e2e8f0;">
                        <div style="font-weight: 600; color: #1e293b; margin-bottom: 2px;">${request.title}</div>
                        <div style="font-size: 10px; color: #64748b;">${getSystemName(request.systemToIntegrate)}</div>
                      </td>
                      <td style="padding: 12px 8px; border-right: 1px solid #e2e8f0; color: #374151;">${getSystemName(request.sourceSystem)}</td>
                      <td style="padding: 12px 8px; border-right: 1px solid #e2e8f0; color: #374151;">${request.intermediarySystem ? getSystemName(request.intermediarySystem) : '-'}</td>
                      <td style="padding: 12px 8px; border-right: 1px solid #e2e8f0; color: #374151;">${getSystemName(request.targetSystem)}</td>
                      <td style="padding: 12px 8px; border-right: 1px solid #e2e8f0; color: #374151;">${request.createdAt.toLocaleDateString('es-ES')}</td>
                      <td style="padding: 12px 8px; border-right: 1px solid #e2e8f0; color: #374151;">${request.dueDate ? request.dueDate.toLocaleDateString('es-ES') : '-'}</td>
                      <td style="padding: 12px 8px; border-right: 1px solid #e2e8f0;">
                        <div style="font-weight: 600; color: #1e293b; margin-bottom: 2px;">${request.sprintInfo?.sprintName || 'Sin asignar'}</div>
                        ${request.sprintInfo ? `<div style="font-size: 10px; color: #64748b;">${request.sprintInfo.sprintStartDate.toLocaleDateString('es-ES')} - ${request.sprintInfo.sprintEndDate.toLocaleDateString('es-ES')}</div>` : ''}
                      </td>
                      <td style="padding: 12px 8px; border-right: 1px solid #e2e8f0; text-align: center;">${getHUBadge(request)}</td>
                      <td style="padding: 12px 8px; border-right: 1px solid #e2e8f0; text-align: center;">${getStatusBadge(request.status)}</td>
                      <td style="padding: 12px 8px;">
                        <div style="font-weight: 600; color: #1e293b; margin-bottom: 2px;">${request.requesterName}</div>
                        <div style="font-size: 10px; color: #64748b;">${request.department}</div>
                        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Frente: ${request.workFront}</div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              Este reporte fue generado automáticamente por IT Integration Management Application
            </p>
            <p style="color: #94a3b8; font-size: 10px; margin: 5px 0 0 0;">
              Para más información, contacte al equipo de IT
            </p>
          </div>
        </div>
      `;

      // Generar el PDF
      const canvas = await html2canvas(reportContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: reportContainer.offsetWidth,
        height: reportContainer.offsetHeight
      });

      // Limpiar el DOM
      document.body.removeChild(reportContainer);

      // Crear PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Si la imagen es muy alta, dividir en páginas
      if (imgHeight > 297) { // A4 height in mm
        let position = 0;
        const pageHeight = 297;
        
        while (position < imgHeight) {
          const pageCanvas = document.createElement('canvas');
          const pageCtx = pageCanvas.getContext('2d')!;
          
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.min(canvas.height - (position * canvas.width / imgWidth), canvas.width * pageHeight / imgWidth);
          
          pageCtx.drawImage(
            canvas,
            0, position * canvas.width / imgWidth,
            canvas.width, pageCanvas.height,
            0, 0,
            canvas.width, pageCanvas.height
          );
          
          const pageImgData = pageCanvas.toDataURL('image/png');
          
          if (position > 0) {
            pdf.addPage();
          }
          
          pdf.addImage(pageImgData, 'PNG', 0, 0, imgWidth, Math.min(pageHeight, imgHeight - position));
          position += pageHeight;
        }
      } else {
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      // Descargar el PDF
      const fileName = `Reporte_Ejecutivo_Integraciones_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  }
};