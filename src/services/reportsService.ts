import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { IntegrationRequest } from '../types';

export const reportsService = {
  async exportToExcel(requests: IntegrationRequest[], systems: any = {}): Promise<void> {
    try {
      const getSystemName = (systemId: string) => {
        return systems[systemId] || systemId;
      };

      // Preparar los datos para Excel
      const excelData = requests.map((request, index) => ({
        'No.': index + 1,
        'Nombre de la Integración': request.title,
        'Sistema a Integrar': getSystemName(request.systemToIntegrate),
        'Sistema Origen': getSystemName(request.sourceSystem),
        'Sistema Intermediario': request.intermediarySystem ? getSystemName(request.intermediarySystem) : 'N/A',
        'Sistema Destino': getSystemName(request.targetSystem),
        'Fecha de Solicitud': request.createdAt.toLocaleDateString('es-ES'),
        'Fecha Límite': request.dueDate ? request.dueDate.toLocaleDateString('es-ES') : 'N/A',
        'Estado': this.getStatusText(request.status),
        'Prioridad': this.getPriorityText(request.priority),
        'Solicitante': request.requesterName,
        'Departamento': request.department,
        'Sprint Asignado': this.getSprintName(request),
        'Sprint Inicio': this.getSprintStartDate(request),
        'Sprint Fin': this.getSprintEndDate(request),
        'Descripción': request.description,
        'Objetivos de Negocio': request.functionalRequirements.businessGoals,
        'Requerimientos Funcionales': request.functionalRequirements.functionalRequirements,
        'Criterios de Aceptación': request.functionalRequirements.acceptanceCriteria,
        'Reglas de Negocio': request.functionalRequirements.businessRules || 'N/A',
        'Arquitectura': request.technicalRequirements.architecture,
        'Tecnologías': Array.isArray(request.technicalRequirements.technologies) 
          ? request.technicalRequirements.technologies.join(', ') 
          : request.technicalRequirements.technologies,
        'Puntos de Integración': request.technicalRequirements.integrationPoints,
        'Flujo de Datos': request.technicalRequirements.dataFlow || 'N/A',
        'Requerimientos de Seguridad': request.technicalRequirements.securityRequirements || 'N/A',
        'Requerimientos de Rendimiento': request.technicalRequirements.performanceRequirements || 'N/A',
        'Disponibilidad': request.nonFunctionalRequirements.availability || 'N/A',
        'Escalabilidad': request.nonFunctionalRequirements.scalability || 'N/A',
        'Usabilidad': request.nonFunctionalRequirements.usability || 'N/A',
        'Confiabilidad': request.nonFunctionalRequirements.reliability || 'N/A',
        'Mantenibilidad': request.nonFunctionalRequirements.maintenance || 'N/A',
        'Casos de Prueba': request.testCases.length,
        'Documentos Adjuntos': request.documents?.length || 0,
        'Fecha de Aprobación': request.approvedAt ? request.approvedAt.toLocaleDateString('es-ES') : 'N/A',
        'Aprobado Por': request.approvedBy || 'N/A',
        'Sprint Asignado': request.sprintInfo?.sprintName || 'Sin asignar',
        'Sprint Inicio': request.sprintInfo?.sprintStartDate ? request.sprintInfo.sprintStartDate.toLocaleDateString('es-ES') : 'N/A',
        'Sprint Fin': request.sprintInfo?.sprintEndDate ? request.sprintInfo.sprintEndDate.toLocaleDateString('es-ES') : 'N/A',
        'Historia de Usuario': request.userStoryGenerated ? 'Generada' : (request.status === 'approved' ? 'Pendiente' : 'N/A'),
        'Fecha Generación HU': request.generatedAt ? request.generatedAt.toLocaleDateString('es-ES') : 'N/A',
        'Fecha de Actualización': request.updatedAt.toLocaleDateString('es-ES')
      }));

      // Crear el libro de trabajo
      const workbook = XLSX.utils.book_new();

      // Hoja principal con resumen
      const summaryData = [
        ['REPORTE DE SOLICITUDES DE INTEGRACIÓN'],
        [''],
        ['Fecha de Generación:', new Date().toLocaleDateString('es-ES')],
        ['Total de Solicitudes:', requests.length],
        [''],
        ['RESUMEN POR ESTADO:'],
        ['Borradores:', requests.filter(r => r.status === 'draft').length],
        ['Enviadas:', requests.filter(r => r.status === 'submitted').length],
        ['En Revisión:', requests.filter(r => r.status === 'in_review').length],
        ['Aprobadas:', requests.filter(r => r.status === 'approved').length],
        ['Rechazadas:', requests.filter(r => r.status === 'rejected').length],
        ['En Desarrollo:', requests.filter(r => r.status === 'in_development').length],
        ['Completadas:', requests.filter(r => r.status === 'completed').length],
        [''],
        ['GESTIÓN DE SPRINTS:'],
        ['Con Sprint asignado:', requests.filter(r => r.sprintInfo).length],
        ['Sin Sprint asignado:', requests.filter(r => !r.sprintInfo && r.status === 'approved').length],
        [''],
        ['HISTORIAS DE USUARIO:'],
        ['Generadas:', requests.filter(r => r.userStoryGenerated).length],
        ['Pendientes:', requests.filter(r => r.status === 'approved' && !r.userStoryGenerated).length],
        [''],
        ['RESUMEN POR PRIORIDAD:'],
        ['Urgente:', requests.filter(r => r.priority === 'urgent').length],
        ['Alta:', requests.filter(r => r.priority === 'high').length],
        ['Media:', requests.filter(r => r.priority === 'medium').length],
        ['Baja:', requests.filter(r => r.priority === 'low').length],
        [''],
        ['RESUMEN POR DEPARTAMENTO:'],
        ...this.getDepartmentSummary(requests)
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Aplicar estilos al resumen
      summarySheet['A1'] = { 
        v: 'REPORTE DE SOLICITUDES DE INTEGRACIÓN', 
        s: { 
          font: { bold: true, sz: 16 },
          alignment: { horizontal: 'center' }
        }
      };

      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

      // Hoja con datos detallados
      const detailSheet = XLSX.utils.json_to_sheet(excelData);
      
      // Configurar el ancho de las columnas
      const columnWidths = [
        { wch: 5 },   // No.
        { wch: 30 },  // Nombre de la Integración
        { wch: 20 },  // Sistema a Integrar
        { wch: 20 },  // Sistema Origen
        { wch: 20 },  // Sistema Intermediario
        { wch: 20 },  // Sistema Destino
        { wch: 15 },  // Fecha de Solicitud
        { wch: 15 },  // Fecha Límite
        { wch: 15 },  // Estado
        { wch: 12 },  // Prioridad
        { wch: 20 },  // Solicitante
        { wch: 15 },  // Departamento
        { wch: 20 },  // Sprint Asignado
        { wch: 15 },  // Sprint Inicio
        { wch: 15 },  // Sprint Fin
        { wch: 40 },  // Descripción
        { wch: 40 },  // Objetivos de Negocio
        { wch: 40 },  // Requerimientos Funcionales
        { wch: 40 },  // Criterios de Aceptación
        { wch: 30 },  // Reglas de Negocio
        { wch: 30 },  // Arquitectura
        { wch: 30 },  // Tecnologías
        { wch: 30 },  // Puntos de Integración
        { wch: 30 },  // Flujo de Datos
        { wch: 30 },  // Requerimientos de Seguridad
        { wch: 30 },  // Requerimientos de Rendimiento
        { wch: 20 },  // Disponibilidad
        { wch: 20 },  // Escalabilidad
        { wch: 20 },  // Usabilidad
        { wch: 20 },  // Confiabilidad
        { wch: 20 },  // Mantenibilidad
        { wch: 15 },  // Casos de Prueba
        { wch: 15 },  // Documentos Adjuntos
        { wch: 18 },  // Fecha de Aprobación
        { wch: 20 },  // Aprobado Por
        { wch: 20 },  // Sprint Asignado
        { wch: 15 },  // Sprint Inicio
        { wch: 15 },  // Sprint Fin
        { wch: 18 },  // Historia de Usuario
        { wch: 18 },  // Fecha Generación HU
        { wch: 18 }   // Fecha de Actualización
      ];
      
      detailSheet['!cols'] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, detailSheet, 'Solicitudes Detalladas');

      // Hoja con casos de prueba
      if (requests.some(r => r.testCases.length > 0)) {
        const testCasesData = requests.flatMap(request => 
          request.testCases.map(testCase => ({
            'Solicitud': request.title,
            'Caso de Prueba': testCase.title,
            'Descripción': testCase.description,
            'Precondiciones': testCase.preconditions,
            'Pasos': testCase.steps.join(' | '),
            'Resultado Esperado': testCase.expectedResult,
            'Prioridad': this.getPriorityText(testCase.priority),
            'Solicitante': request.requesterName
          }))
        );

        const testCasesSheet = XLSX.utils.json_to_sheet(testCasesData);
        testCasesSheet['!cols'] = [
          { wch: 30 }, // Solicitud
          { wch: 25 }, // Caso de Prueba
          { wch: 40 }, // Descripción
          { wch: 30 }, // Precondiciones
          { wch: 50 }, // Pasos
          { wch: 30 }, // Resultado Esperado
          { wch: 12 }, // Prioridad
          { wch: 20 }  // Solicitante
        ];

        XLSX.utils.book_append_sheet(workbook, testCasesSheet, 'Casos de Prueba');
      }

      // Generar el archivo
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array',
        cellStyles: true
      });
      
      const data = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `Reporte_Integraciones_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(data, fileName);

    } catch (error) {
      console.error('Error exporting to Excel:', error);
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

  getPriorityText(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'urgent': 'Urgente',
      'high': 'Alta',
      'medium': 'Media',
      'low': 'Baja'
    };
    return priorityMap[priority] || priority;
  },

  getDepartmentSummary(requests: IntegrationRequest[]): string[][] {
    const departments = [...new Set(requests.map(r => r.department))];
    return departments.map(dept => [
      `${dept}:`,
      requests.filter(r => r.department === dept).length.toString()
    ]);
  },

  getSprintName(request: IntegrationRequest): string {
    return request.sprintInfo?.sprintName || 'Sin asignar';
  },

  getSprintStartDate(request: IntegrationRequest): string {
    return request.sprintInfo?.sprintStartDate 
      ? request.sprintInfo.sprintStartDate.toLocaleDateString('es-ES') 
      : 'N/A';
  },

  getSprintEndDate(request: IntegrationRequest): string {
    return request.sprintInfo?.sprintEndDate 
      ? request.sprintInfo.sprintEndDate.toLocaleDateString('es-ES') 
      : 'N/A';
  }
};
