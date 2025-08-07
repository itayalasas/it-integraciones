export interface WorkFrontStats {
  frente: string;
  totalIntegraciones: number;
  totalEntregadas: number;
  totalPendientes: number;
  totalBloqueadas: number;
  totalProceso: number;
  totalSinEstado: number;
}

export const workFrontReportService = {
  // Generar estadísticas por frente de trabajo
  generateWorkFrontStats(requests: any[]): WorkFrontStats[] {
    const frentes = ['INSIS', 'Mulesoft', 'BAU', 'IA', 'CCM', 'Nuevas iniciativas'];
    
    return frentes.map(frente => {
      const frenteRequests = requests.filter(r => r.workFront === frente);
      
      return {
        frente,
        totalIntegraciones: frenteRequests.length,
        totalEntregadas: frenteRequests.filter(r => 
          r.status === 'completed' || r.detailedStatus === 'delivered'
        ).length,
        totalPendientes: frenteRequests.filter(r => 
          ['submitted', 'in_review'].includes(r.status)
        ).length,
        totalBloqueadas: frenteRequests.filter(r => 
          r.detailedStatus === 'blocked'
        ).length,
        totalProceso: frenteRequests.filter(r => 
          r.status === 'in_development' || r.detailedStatus === 'in_process'
        ).length,
        totalSinEstado: frenteRequests.filter(r => 
          r.status === 'draft' || r.detailedStatus === 'analysis' || r.detailedStatus === 'no_status'
        ).length
      };
    });
  },

  // Exportar reporte de frentes a Excel
  async exportWorkFrontReport(requests: any[]): Promise<void> {
    try {
      const { default: XLSX } = await import('xlsx');
      const { saveAs } = await import('file-saver');
      
      const stats = this.generateWorkFrontStats(requests);
      
      // Crear el libro de trabajo
      const workbook = XLSX.utils.book_new();

      // Datos para la hoja principal
      const reportData = [
        ['REPORTE POR FRENTES DE TRABAJO'],
        [''],
        ['Fecha de Generación:', new Date().toLocaleDateString('es-ES')],
        [''],
        ['Frente', 'Total Integraciones', 'Total Entregadas', 'Total Pendientes', 'Total Bloqueadas', 'Total Proceso', 'Total Sin estado o Análisis'],
        ...stats.map(stat => [
          stat.frente,
          stat.totalIntegraciones,
          stat.totalEntregadas,
          stat.totalPendientes,
          stat.totalBloqueadas,
          stat.totalProceso,
          stat.totalSinEstado
        ]),
        [''],
        ['DEFINICIONES:'],
        ['Total integraciones: Suma total de todas las integraciones del frente'],
        ['Total Entregadas: Suma total de integraciones entregada o finalizada por cada frente'],
        ['Total Bloqueadas: Suma total de integración bloqueada en desarrollo por frente'],
        ['Total Proceso: Suma total de integraciones en proceso de desarrollo'],
        ['Total Sin estado o en Análisis: Cantidad de integraciones en análisis o sin ningún estado (esto es solo en INSIS)']
      ];

      const reportSheet = XLSX.utils.aoa_to_sheet(reportData);
      
      // Configurar el ancho de las columnas
      reportSheet['!cols'] = [
        { wch: 20 }, // Frente
        { wch: 18 }, // Total Integraciones
        { wch: 16 }, // Total Entregadas
        { wch: 16 }, // Total Pendientes
        { wch: 16 }, // Total Bloqueadas
        { wch: 14 }, // Total Proceso
        { wch: 25 }  // Total Sin estado o Análisis
      ];

      // Aplicar estilos al header
      const headerRange = XLSX.utils.decode_range(reportSheet['!ref'] || 'A1');
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 4, c: col }); // Fila 5 (índice 4)
        if (!reportSheet[cellRef]) reportSheet[cellRef] = { v: '' };
        reportSheet[cellRef].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "0066CC" } },
          font: { color: { rgb: "FFFFFF" } }
        };
      }

      XLSX.utils.book_append_sheet(workbook, reportSheet, 'Reporte por Frentes');

      // Hoja detallada con todas las solicitudes
      const detailedData = requests.map((request, index) => ({
        'No.': index + 1,
        'Frente de Trabajo': request.workFront,
        'Título': request.title,
        'Estado Principal': this.getStatusText(request.status),
        'Estado Detallado': this.getDetailedStatusText(request.detailedStatus),
        'Prioridad': this.getPriorityText(request.priority),
        'Solicitante': request.requesterName,
        'Departamento': request.department,
        'Fecha Solicitud': request.createdAt.toLocaleDateString('es-ES'),
        'Fecha Límite': request.dueDate ? request.dueDate.toLocaleDateString('es-ES') : 'N/A',
        'Sprint': request.sprintInfo?.sprintName || 'Sin asignar',
        'Historia Usuario': request.userStoryGenerated ? 'Generada' : (request.status === 'approved' ? 'Pendiente' : 'N/A')
      }));

      const detailedSheet = XLSX.utils.json_to_sheet(detailedData);
      detailedSheet['!cols'] = [
        { wch: 5 },  // No.
        { wch: 18 }, // Frente de Trabajo
        { wch: 30 }, // Título
        { wch: 15 }, // Estado Principal
        { wch: 15 }, // Estado Detallado
        { wch: 12 }, // Prioridad
        { wch: 20 }, // Solicitante
        { wch: 15 }, // Departamento
        { wch: 15 }, // Fecha Solicitud
        { wch: 15 }, // Fecha Límite
        { wch: 20 }, // Sprint
        { wch: 15 }  // Historia Usuario
      ];

      XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Detalle por Solicitud');

      // Generar el archivo
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array'
      });
      
      const data = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `Reporte_Frentes_Trabajo_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(data, fileName);

    } catch (error) {
      console.error('Error exporting work front report:', error);
      throw error;
    }
  },

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'draft': 'Borrador',
      'submitted': 'Enviada',
      'in_review': 'En Revisión',
      'approved': 'Aprobada',
      'rejected': 'Rechazada',
      'in_development': 'En Desarrollo',
      'completed': 'Completada'
    };
    return statusMap[status] || status;
  },

  getDetailedStatusText(detailedStatus?: string): string {
    if (!detailedStatus) return 'N/A';
    
    const statusMap: { [key: string]: string } = {
      'delivered': 'Entregada',
      'blocked': 'Bloqueada',
      'in_process': 'En Proceso',
      'analysis': 'En Análisis',
      'no_status': 'Sin Estado'
    };
    return statusMap[detailedStatus] || detailedStatus;
  },

  getPriorityText(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'urgent': 'Urgente',
      'high': 'Alta',
      'medium': 'Media',
      'low': 'Baja'
    };
    return priorityMap[priority] || priority;
  }
};