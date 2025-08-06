import mammoth from 'mammoth';

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

export const documentProcessorService = {
  // Procesar documento Word y extraer datos
  async processWordDocument(file: File): Promise<ProcessedRequestData> {
    try {
      // Convertir Word a HTML usando mammoth
      const arrayBuffer = await file.arrayBuffer();
      
      let result;
      try {
        result = await mammoth.extractRawText({ arrayBuffer });
      } catch (mammothError) {
        console.error('Mammoth processing error:', mammothError);
        // Intentar con convertToHtml como fallback
        try {
          const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
          // Extraer texto del HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlResult.value;
          result = { value: tempDiv.textContent || tempDiv.innerText || '' };
        } catch (htmlError) {
          console.error('HTML conversion error:', htmlError);
          throw new Error('No se pudo leer el contenido del documento. Verifica que el archivo no esté corrupto.');
        }
      }
      
      const text = result.value;
      
      if (!text || text.trim().length === 0) {
        throw new Error('El documento parece estar vacío o no contiene texto legible.');
      }

      // Procesar el texto extraído
      const processedData = this.parseDocumentText(text);
      
      return processedData;
    } catch (error) {
      console.error('Error processing Word document:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('No se pudo procesar el documento. Asegúrate de que sea un archivo Word válido y no esté protegido con contraseña.');
    }
  },

  // Parsear texto del documento y extraer campos
  parseDocumentText(text: string): ProcessedRequestData {
    const data: ProcessedRequestData = {
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

    // Normalizar texto para búsqueda
    const normalizedText = text.toLowerCase().replace(/\s+/g, ' ');

    // Extraer información básica
    data.title = this.extractField(text, [
      'título de la integración',
      'nombre de la integración',
      'título del proyecto'
    ]) || 'Integración procesada desde documento';

    data.description = this.extractField(text, [
      'descripción detallada',
      'descripción',
      'resumen del proyecto'
    ]) || '';

    // Extraer prioridad
    const priorityText = this.extractField(text, ['prioridad']).toLowerCase();
    if (priorityText.includes('urgente')) data.priority = 'urgent';
    else if (priorityText.includes('alta')) data.priority = 'high';
    else if (priorityText.includes('baja')) data.priority = 'low';
    else data.priority = 'medium';

    // Extraer fecha límite
    const dueDateText = this.extractField(text, ['fecha límite', 'fecha de entrega']);
    if (dueDateText) {
      const dateMatch = dueDateText.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
      if (dateMatch) {
        data.dueDate = new Date(parseInt(dateMatch[3]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[1]));
      }
    }

    // Extraer sistemas
    data.systemToIntegrate = this.extractField(text, [
      'sistema principal a integrar',
      'sistema a integrar'
    ]) || '';

    data.sourceSystem = this.extractField(text, [
      'sistema origen',
      'sistema fuente'
    ]) || '';

    data.targetSystem = this.extractField(text, [
      'sistema destino',
      'sistema objetivo'
    ]) || '';

    data.intermediarySystem = this.extractField(text, [
      'sistema intermediario',
      'sistema intermedio'
    ]);

    // Extraer requerimientos funcionales
    data.functionalRequirements.businessGoals = this.extractField(text, [
      'objetivos de negocio',
      'objetivos del negocio'
    ]) || '';

    data.functionalRequirements.functionalRequirements = this.extractField(text, [
      'requerimientos funcionales específicos',
      'requerimientos funcionales'
    ]) || '';

    data.functionalRequirements.acceptanceCriteria = this.extractField(text, [
      'criterios de aceptación'
    ]) || '';

    data.functionalRequirements.businessRules = this.extractField(text, [
      'reglas de negocio'
    ]) || '';

    // Extraer requerimientos técnicos
    data.technicalRequirements.architecture = this.extractArchitecture(text);
    data.technicalRequirements.technologies = this.extractTechnologies(text);
    
    data.technicalRequirements.integrationPoints = this.extractField(text, [
      'puntos de integración'
    ]) || '';

    data.technicalRequirements.dataFlow = this.extractField(text, [
      'flujo de datos'
    ]) || '';

    data.technicalRequirements.securityRequirements = this.extractField(text, [
      'requerimientos de seguridad',
      'requisitos de seguridad'
    ]) || '';

    data.technicalRequirements.performanceRequirements = this.extractField(text, [
      'requerimientos de rendimiento',
      'requisitos de rendimiento'
    ]) || '';

    data.technicalRequirements.serviceUrl = this.extractField(text, [
      'url del servicio',
      'endpoint'
    ]) || '';

    data.technicalRequirements.credentials = this.extractField(text, [
      'credenciales',
      'autenticación'
    ]) || '';

    // Extraer requerimientos no funcionales
    data.nonFunctionalRequirements.availability = this.extractField(text, [
      'disponibilidad'
    ]) || '';

    data.nonFunctionalRequirements.scalability = this.extractField(text, [
      'escalabilidad'
    ]) || '';

    data.nonFunctionalRequirements.reliability = this.extractField(text, [
      'confiabilidad'
    ]) || '';

    data.nonFunctionalRequirements.usability = this.extractField(text, [
      'usabilidad'
    ]) || '';

    data.nonFunctionalRequirements.maintenance = this.extractField(text, [
      'mantenibilidad'
    ]) || '';

    // Extraer casos de prueba
    data.testCases = this.extractTestCases(text);

    return data;
  },

  // Extraer campo específico del texto
  extractField(text: string, fieldNames: string[]): string {
    for (const fieldName of fieldNames) {
      const regex = new RegExp(`${fieldName}[:\\s]*([^\\n\\r]+)`, 'i');
      const match = text.match(regex);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  },

  // Extraer arquitectura seleccionada
  extractArchitecture(text: string): string {
    const architectures = ['API REST', 'SOAP', 'Microservicios', 'ETL', 'Batch', 'Tiempo Real'];
    const normalizedText = text.toLowerCase();
    
    for (const arch of architectures) {
      if (normalizedText.includes(arch.toLowerCase())) {
        return arch;
      }
    }
    return '';
  },

  // Extraer tecnologías seleccionadas
  extractTechnologies(text: string): string[] {
    const technologies = ['Java', '.NET', 'Python', 'Node.js', 'SQL Server', 'Oracle', 'MongoDB'];
    const found: string[] = [];
    const normalizedText = text.toLowerCase();
    
    for (const tech of technologies) {
      if (normalizedText.includes(tech.toLowerCase())) {
        found.push(tech);
      }
    }
    return found;
  },

  // Extraer casos de prueba
  extractTestCases(text: string): Array<{
    title: string;
    description: string;
    preconditions: string;
    steps: string[];
    expectedResult: string;
    priority: 'low' | 'medium' | 'high';
  }> {
    const testCases: Array<{
      title: string;
      description: string;
      preconditions: string;
      steps: string[];
      expectedResult: string;
      priority: 'low' | 'medium' | 'high';
    }> = [];

    // Buscar patrones de casos de prueba
    const testCaseRegex = /caso de prueba #?(\d+)[:\s]*([^]*?)(?=caso de prueba #?\d+|$)/gi;
    let match;

    while ((match = testCaseRegex.exec(text)) !== null) {
      const caseNumber = match[1];
      const caseContent = match[2];

      const testCase = {
        title: this.extractField(caseContent, ['título del caso', 'título']) || `Caso de Prueba ${caseNumber}`,
        description: this.extractField(caseContent, ['descripción']) || '',
        preconditions: this.extractField(caseContent, ['precondiciones']) || '',
        steps: this.extractSteps(caseContent),
        expectedResult: this.extractField(caseContent, ['resultado esperado']) || '',
        priority: this.extractPriority(caseContent)
      };

      testCases.push(testCase);
    }

    return testCases;
  },

  // Extraer pasos de un caso de prueba
  extractSteps(text: string): string[] {
    const stepsText = this.extractField(text, ['pasos a ejecutar', 'pasos']);
    if (!stepsText) return [];

    // Dividir por números o guiones
    const steps = stepsText.split(/\d+\.|[-•]/).filter(step => step.trim().length > 0);
    return steps.map(step => step.trim());
  },

  // Extraer prioridad de caso de prueba
  extractPriority(text: string): 'low' | 'medium' | 'high' {
    const priorityText = this.extractField(text, ['prioridad']).toLowerCase();
    if (priorityText.includes('alta')) return 'high';
    if (priorityText.includes('baja')) return 'low';
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