import * as XLSX from 'xlsx';

export interface ProcessedRequestData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  systemToIntegrate: string;
  sourceSystem: string;
  targetSystem: string;
  intermediarySystem?: string;
  functionalRequirements: {
    businessGoals: string;
    functionalRequirements: string;
    acceptanceCriteria: string;
    businessRules: string;
  };
  technicalRequirements: {
    architecture: string;
    technologies: string[];
    integrationPoints: string;
    dataFlow: string;
    securityRequirements: string;
    performanceRequirements: string;
    serviceUrl: string;
    credentials: string;
  };
  nonFunctionalRequirements: {
    availability: string;
    scalability: string;
    usability: string;
    reliability: string;
    maintenance: string;
  };
  testCases: Array<{
    title: string;
    description: string;
    preconditions: string;
    steps: string[];
    expectedResult: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

export const excelProcessorService = {
  // Procesar archivo Excel y extraer datos
  async processExcelFile(file: File): Promise<ProcessedRequestData> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Determinar si es plantilla completa o simplificada
      const sheetNames = workbook.SheetNames;
      const isSimple = sheetNames.includes('Solicitud') && sheetNames.length === 1;
      
      if (isSimple) {
        return this.processSimpleTemplate(workbook);
      } else {
        return this.processCompleteTemplate(workbook);
      }
    } catch (error) {
      console.error('Error processing Excel file:', error);
      throw new Error('No se pudo procesar el archivo Excel. Verifica que sea un archivo .xlsx válido.');
    }
  },

  // Procesar plantilla simplificada
  processSimpleTemplate(workbook: XLSX.WorkBook): ProcessedRequestData {
    const sheet = workbook.Sheets['Solicitud'];
    if (!sheet) {
      throw new Error('No se encontró la hoja "Solicitud" en el archivo.');
    }

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    const processedData: ProcessedRequestData = {
      title: '',
      description: '',
      priority: 'medium',
      systemToIntegrate: '',
      sourceSystem: '',
      targetSystem: '',
      functionalRequirements: {
        businessGoals: '',
        functionalRequirements: '',
        acceptanceCriteria: '',
        businessRules: ''
      },
      technicalRequirements: {
        architecture: '',
        technologies: [],
        integrationPoints: '',
        dataFlow: '',
        securityRequirements: '',
        performanceRequirements: '',
        serviceUrl: '',
        credentials: ''
      },
      nonFunctionalRequirements: {
        availability: '',
        scalability: '',
        usability: '',
        reliability: '',
        maintenance: ''
      },
      testCases: []
    };

    // Buscar y extraer valores
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 2) continue;
      
      const field = String(row[0] || '').toLowerCase();
      const value = String(row[1] || '').trim();
      
      if (!value) continue;

      if (field.includes('título')) {
        processedData.title = value;
      } else if (field.includes('descripción')) {
        processedData.description = value;
      } else if (field.includes('solicitante')) {
        // No se guarda en el modelo, se asigna automáticamente
      } else if (field.includes('departamento')) {
        // No se guarda en el modelo, se asigna automáticamente
      } else if (field.includes('sistema origen')) {
        // Extraer solo el nombre del sistema (antes del paréntesis)
        const systemName = value.split(' (')[0].trim();
        const systemName = value.split(' (')[0].trim();
        processedData.sourceSystem = systemName;
      } else if (field.includes('sistema destino')) {
        const systemName = value.split(' (')[0].trim();
        const systemName = value.split(' (')[0].trim();
        processedData.targetSystem = systemName;
      } else if (field.includes('sistema intermediario')) {
        if (value !== 'Sin sistema intermediario') {
          const systemName = value.split(' (')[0].trim();
          processedData.intermediarySystem = systemName;
        }
          const systemName = value.split(' (')[0].trim();
          processedData.intermediarySystem = systemName;
        }
      } else if (field.includes('sistema principal') || field.includes('sistema a integrar')) {
        const systemName = value.split(' (')[0].trim();
        processedData.systemToIntegrate = systemName;
      } else if (field.includes('objetivos de negocio')) {
        processedData.functionalRequirements.businessGoals = value;
      } else if (field.includes('requerimientos técnicos')) {
        const systemName = value.split(' (')[0].trim();
        processedData.systemToIntegrate = systemName;
      } else if (field.includes('fecha límite')) {
        processedData.dueDate = this.parseDate(value);
      } else if (field.includes('prioridad')) {
        processedData.priority = this.parsePriority(value);
      } else if (field.includes('comentarios')) {
        processedData.functionalRequirements.acceptanceCriteria = value;
      }
    }

    return processedData;
  },

  // Procesar plantilla completa
  processCompleteTemplate(workbook: XLSX.WorkBook): ProcessedRequestData {
    const processedData: ProcessedRequestData = {
      title: '',
      description: '',
      priority: 'medium',
      systemToIntegrate: '',
      sourceSystem: '',
      targetSystem: '',
      functionalRequirements: {
        businessGoals: '',
        functionalRequirements: '',
        acceptanceCriteria: '',
        businessRules: ''
      },
      technicalRequirements: {
        architecture: '',
        technologies: [],
        integrationPoints: '',
        dataFlow: '',
        securityRequirements: '',
        performanceRequirements: '',
        serviceUrl: '',
        credentials: ''
      },
      nonFunctionalRequirements: {
        availability: '',
        scalability: '',
        usability: '',
        reliability: '',
        maintenance: ''
      },
      testCases: []
    };

    // Procesar hoja de Información General
    if (workbook.Sheets['Información General']) {
      const generalData = XLSX.utils.sheet_to_json(workbook.Sheets['Información General'], { header: 1 }) as any[][];
      
      for (let i = 0; i < generalData.length; i++) {
        const row = generalData[i];
        if (!row || row.length < 2) continue;
        
        const field = String(row[0] || '').toLowerCase();
        const value = String(row[1] || '').trim();
        
        if (!value) continue;

        if (field.includes('título')) {
          processedData.title = value;
        } else if (field.includes('descripción')) {
          processedData.description = value;
        } else if (field.includes('sistema principal')) {
          processedData.systemToIntegrate = value;
        } else if (field.includes('sistema origen')) {
          processedData.sourceSystem = value;
        } else if (field.includes('sistema destino')) {
          processedData.targetSystem = value;
        } else if (field.includes('sistema intermediario')) {
          processedData.intermediarySystem = value;
        } else if (field.includes('fecha límite')) {
          processedData.dueDate = this.parseDate(value);
        } else if (field.includes('prioridad')) {
          processedData.priority = this.parsePriority(value);
        }
      }
    }

    // Procesar hoja de Requerimientos
    if (workbook.Sheets['Requerimientos']) {
      const reqData = XLSX.utils.sheet_to_json(workbook.Sheets['Requerimientos'], { header: 1 }) as any[][];
      
      for (let i = 0; i < reqData.length; i++) {
        const row = reqData[i];
        if (!row || row.length < 2) continue;
        
        const field = String(row[0] || '').toLowerCase();
        const value = String(row[1] || '').trim();
        
        if (!value) continue;

        // Requerimientos funcionales
        if (field.includes('objetivos de negocio')) {
          processedData.functionalRequirements.businessGoals = value;
        } else if (field.includes('requerimientos funcionales')) {
          processedData.functionalRequirements.functionalRequirements = value;
        } else if (field.includes('criterios de aceptación')) {
          processedData.functionalRequirements.acceptanceCriteria = value;
        } else if (field.includes('reglas de negocio')) {
          processedData.functionalRequirements.businessRules = value;
        }
        // Requerimientos técnicos
        else if (field.includes('arquitectura')) {
          processedData.technicalRequirements.architecture = value;
        } else if (field.includes('tecnologías')) {
          processedData.technicalRequirements.technologies = value.split(',').map(t => t.trim()).filter(t => t);
        } else if (field.includes('puntos de integración')) {
          processedData.technicalRequirements.integrationPoints = value;
        } else if (field.includes('flujo de datos')) {
          processedData.technicalRequirements.dataFlow = value;
        } else if (field.includes('url del servicio')) {
          processedData.technicalRequirements.serviceUrl = value;
        } else if (field.includes('credenciales')) {
          processedData.technicalRequirements.credentials = value;
        } else if (field.includes('seguridad')) {
          processedData.technicalRequirements.securityRequirements = value;
        } else if (field.includes('rendimiento')) {
          processedData.technicalRequirements.performanceRequirements = value;
        }
        // Requerimientos no funcionales
        else if (field.includes('disponibilidad')) {
          processedData.nonFunctionalRequirements.availability = value;
        } else if (field.includes('escalabilidad')) {
          processedData.nonFunctionalRequirements.scalability = value;
        } else if (field.includes('usabilidad')) {
          processedData.nonFunctionalRequirements.usability = value;
        } else if (field.includes('confiabilidad')) {
          processedData.nonFunctionalRequirements.reliability = value;
        } else if (field.includes('mantenibilidad')) {
          processedData.nonFunctionalRequirements.maintenance = value;
        }
      }
    }

    // Procesar casos de prueba
    if (workbook.Sheets['Casos de Prueba']) {
      const testData = XLSX.utils.sheet_to_json(workbook.Sheets['Casos de Prueba'], { header: 1 }) as any[][];
      
      for (let i = 5; i < testData.length; i++) { // Empezar después de las cabeceras
        const row = testData[i];
        if (!row || row.length < 6) continue;
        
        const title = String(row[0] || '').trim();
        const description = String(row[1] || '').trim();
        const preconditions = String(row[2] || '').trim();
        const stepsStr = String(row[3] || '').trim();
        const expectedResult = String(row[4] || '').trim();
        const priority = String(row[5] || '').trim();
        
        if (!title || title.toLowerCase().includes('ejemplo')) continue;

        const steps = stepsStr ? stepsStr.split(';').map(s => s.trim()).filter(s => s) : [];
        
        processedData.testCases.push({
          title,
          description,
          preconditions,
          steps,
          expectedResult,
          priority: this.parsePriority(priority)
        });
      }
    }

    return processedData;
  },

  // Parsear fecha
  parseDate(dateStr: string): Date | undefined {
    if (!dateStr) return undefined;
    
    // Intentar varios formatos
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
    ];
    
    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format === formats[0]) { // DD/MM/YYYY
          return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
        } else { // YYYY-MM-DD
          return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        }
      }
    }
    
    return undefined;
  },

  // Parsear prioridad
  parsePriority(priorityStr: string): 'low' | 'medium' | 'high' | 'urgent' {
    const priority = priorityStr.toLowerCase();
    if (priority.includes('urgente')) return 'urgent';
    if (priority.includes('alta')) return 'high';
    if (priority.includes('baja')) return 'low';
    return 'medium';
  },

  // Validar datos procesados
  validateProcessedData(data: ProcessedRequestData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title.trim()) {
      errors.push('El título de la integración es requerido');
    }

    if (!data.description.trim()) {
      errors.push('La descripción es requerida');
    }

    if (!data.systemToIntegrate.trim()) {
      errors.push('El sistema a integrar es requerido');
    }

    if (!data.sourceSystem.trim()) {
      errors.push('El sistema origen es requerido');
    }

    if (!data.targetSystem.trim()) {
      errors.push('El sistema destino es requerido');
    }

    if (!data.functionalRequirements.businessGoals.trim()) {
      errors.push('Los objetivos de negocio son requeridos');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};