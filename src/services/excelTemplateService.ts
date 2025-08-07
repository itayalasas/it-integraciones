import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { systemsService } from './systemsService';
import { departmentsService } from './departmentsService';

export const excelTemplateService = {
  // Generar plantilla completa de Excel
  async generateTemplate(): Promise<void> {
    try {
      // Cargar datos reales de la aplicación
      const [systemsList, departmentsList] = await Promise.all([
        systemsService.getActiveSystems(),
        departmentsService.getActiveDepartments()
      ]);

      const workbook = XLSX.utils.book_new();

      // Hoja de Instrucciones
      const instructionsData = [
        ['PLANTILLA DE SOLICITUD DE INTEGRACIÓN DE SISTEMAS'],
        [''],
        ['INSTRUCCIONES IMPORTANTES:'],
        ['1. Complete todos los campos obligatorios marcados con (*)'],
        ['2. No modifique los nombres de las columnas'],
        ['3. Use las hojas correspondientes para cada sección'],
        ['4. Guarde el archivo como .xlsx antes de subirlo al sistema'],
        ['5. Para casos de prueba, use una fila por cada caso'],
        ['6. Use las listas desplegables para seleccionar opciones válidas'],
        [''],
        ['HOJAS INCLUIDAS:'],
        ['• Información General: Datos básicos de la solicitud'],
        ['• Requerimientos: Funcionales, técnicos y no funcionales'],
        ['• Casos de Prueba: Definición de pruebas'],
        ['• Listas de Referencia: Sistemas y opciones disponibles'],
        [''],
        ['NOTAS:'],
        ['• Los campos con (*) son obligatorios'],
        ['• Use el formato de fecha DD/MM/AAAA'],
        ['• Use las listas desplegables cuando estén disponibles'],
        ['• Mantenga el formato original del archivo']
      ];

      const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
      
      // Aplicar estilos básicos
      instructionsSheet['!cols'] = [{ wch: 60 }];
      
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instrucciones');

      // Hoja de Información General
      const generalData = [
        ['INFORMACIÓN GENERAL DE LA SOLICITUD'],
        [''],
        ['Campo', 'Valor', 'Obligatorio', 'Descripción'],
        ['Título de la Integración', '', 'SÍ', 'Nombre descriptivo de la integración'],
        ['Descripción Detallada', '', 'SÍ', 'Explicación completa del proyecto'],
        ['Solicitante', '', 'SÍ', 'Nombre completo del solicitante'],
        ['Departamento', departmentsList.length > 0 ? departmentsList[0].name : 'IT', 'SÍ', 'Seleccione de la lista desplegable'],
        ['Fecha Límite', '', 'NO', 'Formato: DD/MM/AAAA'],
        ['Prioridad', 'Media', 'SÍ', 'Seleccione de la lista desplegable'],
        ['Sistema Principal a Integrar', systemsList.length > 0 ? `${systemsList[0].name} (${systemsList[0].technology})` : '', 'SÍ', 'Seleccione de la lista desplegable'],
        ['Sistema Origen', systemsList.length > 0 ? `${systemsList[0].name} (${systemsList[0].technology})` : '', 'SÍ', 'Seleccione de la lista desplegable'],
        ['Sistema Destino', systemsList.length > 1 ? `${systemsList[1].name} (${systemsList[1].technology})` : '', 'SÍ', 'Seleccione de la lista desplegable'],
        ['Sistema Intermediario', 'Sin sistema intermediario', 'NO', 'Seleccione de la lista desplegable (opcional)'],
        [''],
        ['NOTA: Use las listas desplegables en la columna "Valor" para seleccionar opciones válidas']
      ];

      const generalSheet = XLSX.utils.aoa_to_sheet(generalData);
      
      // Aplicar validaciones de datos (listas desplegables)
      if (!generalSheet['!dataValidation']) {
        generalSheet['!dataValidation'] = {};
      }

      // Lista desplegable para Departamentos (celda B7)
      generalSheet['!dataValidation']['B7'] = {
        type: 'list',
        allowBlank: false,
        formula1: departmentsList.map(d => d.name).join(',')
      };

      // Lista desplegable para Prioridad (celda B9)
      generalSheet['!dataValidation']['B9'] = {
        type: 'list',
        allowBlank: false,
        formula1: 'Baja,Media,Alta,Urgente'
      };

      // Listas desplegables para Sistemas
      const systemsOptions = systemsList.map(s => `${s.name} (${s.technology})`).join(',');
      
      // Sistema Principal a Integrar (celda B10)
      generalSheet['!dataValidation']['B10'] = {
        type: 'list',
        allowBlank: false,
        formula1: systemsOptions
      };

      // Sistema Origen (celda B11)
      generalSheet['!dataValidation']['B11'] = {
        type: 'list',
        allowBlank: false,
        formula1: systemsOptions
      };

      // Sistema Destino (celda B12)
      generalSheet['!dataValidation']['B12'] = {
        type: 'list',
        allowBlank: false,
        formula1: systemsOptions
      };

      // Sistema Intermediario (celda B13) - opcional
      generalSheet['!dataValidation']['B13'] = {
        type: 'list',
        allowBlank: true,
        formula1: `Sin sistema intermediario,${systemsOptions}`
      };

      generalSheet['!cols'] = [
        { wch: 25 }, // Campo
        { wch: 40 }, // Valor
        { wch: 12 }, // Obligatorio
        { wch: 35 }  // Descripción
      ];
      
      XLSX.utils.book_append_sheet(workbook, generalSheet, 'Información General');

      // Hoja de Requerimientos
      const requirementsData = [
        ['REQUERIMIENTOS DE LA INTEGRACIÓN'],
        [''],
        ['REQUERIMIENTOS FUNCIONALES'],
        ['Campo', 'Valor', 'Obligatorio'],
        ['Objetivos de Negocio', '', 'SÍ'],
        ['Requerimientos Funcionales', '', 'SÍ'],
        ['Criterios de Aceptación', '', 'SÍ'],
        ['Reglas de Negocio', '', 'NO'],
        [''],
        ['REQUERIMIENTOS TÉCNICOS'],
        ['Campo', 'Valor', 'Obligatorio'],
        ['Arquitectura', '', 'NO'],
        ['Tecnologías', '', 'NO'],
        ['Puntos de Integración', '', 'NO'],
        ['Flujo de Datos', '', 'NO'],
        ['URL del Servicio', '', 'NO'],
        ['Credenciales/Autenticación', '', 'NO'],
        ['Requerimientos de Seguridad', '', 'NO'],
        ['Requerimientos de Rendimiento', '', 'NO'],
        [''],
        ['REQUERIMIENTOS NO FUNCIONALES'],
        ['Campo', 'Valor', 'Obligatorio'],
        ['Disponibilidad', '', 'NO'],
        ['Escalabilidad', '', 'NO'],
        ['Usabilidad', '', 'NO'],
        ['Confiabilidad', '', 'NO'],
        ['Mantenibilidad', '', 'NO'],
        [''],
        ['NOTA: Use las listas desplegables cuando estén disponibles']
      ];

      const requirementsSheet = XLSX.utils.aoa_to_sheet(requirementsData);
      
      // Configurar listas desplegables para requerimientos
      if (!requirementsSheet['!dataValidation']) {
        requirementsSheet['!dataValidation'] = {};
      }

      // Lista desplegable para Arquitectura (celda B12)
      requirementsSheet['!dataValidation']['B12'] = {
        type: 'list',
        allowBlank: true,
        formula1: 'API REST,SOAP,Microservicios,ETL,Batch,Tiempo Real'
      };

      requirementsSheet['!cols'] = [
        { wch: 30 }, // Campo
        { wch: 50 }, // Valor
        { wch: 12 }  // Obligatorio
      ];
      
      XLSX.utils.book_append_sheet(workbook, requirementsSheet, 'Requerimientos');

      // Hoja de Casos de Prueba
      const testCasesData = [
        ['CASOS DE PRUEBA'],
        [''],
        ['Instrucciones: Agregue una fila por cada caso de prueba. Separe los pasos con punto y coma (;)'],
        [''],
        ['Título del Caso', 'Descripción', 'Precondiciones', 'Pasos (separados por ;)', 'Resultado Esperado', 'Prioridad'],
        ['Ejemplo: Validar conexión', 'Verificar que la conexión funcione', 'Sistema activo', 'Conectar al sistema;Enviar datos de prueba;Verificar respuesta', 'Conexión exitosa', 'Alta'],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        [''],
        ['NOTA: Use la lista desplegable en la columna "Prioridad" para seleccionar']
      ];

      const testCasesSheet = XLSX.utils.aoa_to_sheet(testCasesData);
      
      // Configurar listas desplegables para casos de prueba
      if (!testCasesSheet['!dataValidation']) {
        testCasesSheet['!dataValidation'] = {};
      }

      // Lista desplegable para Prioridad en casos de prueba (columna F, filas 6-10)
      for (let row = 6; row <= 10; row++) {
        const cellRef = `F${row}`;
        testCasesSheet['!dataValidation'][cellRef] = {
          type: 'list',
          allowBlank: true,
          formula1: 'Baja,Media,Alta'
        };
      }

      testCasesSheet['!cols'] = [
        { wch: 25 }, // Título
        { wch: 35 }, // Descripción
        { wch: 25 }, // Precondiciones
        { wch: 40 }, // Pasos
        { wch: 30 }, // Resultado
        { wch: 12 }  // Prioridad
      ];
      
      XLSX.utils.book_append_sheet(workbook, testCasesSheet, 'Casos de Prueba');

      // Hoja de Listas de Referencia
      const referenceData = [
        ['LISTAS DE REFERENCIA'],
        [''],
        ['SISTEMAS DISPONIBLES'],
        ['ID', 'Nombre', 'Tecnología', 'Tipo', 'Propietario'],
        ...systemsList.map(system => [
          system.id,
          system.name,
          system.technology,
          system.type,
          system.owner
        ]),
        [''],
        ['DEPARTAMENTOS DISPONIBLES'],
        ['ID', 'Nombre', 'Descripción'],
        ...departmentsList.map(dept => [
          dept.id,
          dept.name,
          dept.description
        ]),
        [''],
        ['OPCIONES DE PRIORIDAD'],
        ['Valor', 'Descripción'],
        ['Baja', 'Para integraciones no críticas'],
        ['Media', 'Para integraciones estándar'],
        ['Alta', 'Para integraciones importantes'],
        ['Urgente', 'Para integraciones críticas'],
        [''],
        ['FRENTES DE TRABAJO DISPONIBLES'],
        ['Valor', 'Descripción'],
        ['INSIS', 'Sistema de seguros INSIS'],
        ['Mulesoft', 'Plataforma de integración Mulesoft'],
        ['BAU', 'Business As Usual - Operaciones regulares'],
        ['IA', 'Inteligencia Artificial'],
        ['CCM', 'Customer Communication Management'],
        ['Nuevas iniciativas', 'Proyectos e iniciativas nuevas'],
        [''],
        ['OPCIONES DE ARQUITECTURA'],
        ['Valor', 'Descripción'],
        ['API REST', 'Servicios web RESTful'],
        ['SOAP', 'Servicios web SOAP'],
        ['Microservicios', 'Arquitectura de microservicios'],
        ['ETL', 'Extract, Transform, Load'],
        ['Batch', 'Procesamiento por lotes'],
        ['Tiempo Real', 'Procesamiento en tiempo real']
      ];

      const referenceSheet = XLSX.utils.aoa_to_sheet(referenceData);
      referenceSheet['!cols'] = [
        { wch: 15 }, // ID/Valor
        { wch: 30 }, // Nombre
        { wch: 25 }, // Tecnología/Descripción
        { wch: 15 }, // Tipo
        { wch: 20 }  // Propietario
      ];
      
      XLSX.utils.book_append_sheet(workbook, referenceSheet, 'Listas de Referencia');

      // Generar y descargar el archivo
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array'
      });
      
      const data = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const fileName = `Plantilla_Solicitud_Integracion_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(data, fileName);

    } catch (error) {
      console.error('Error generating Excel template:', error);
      throw error;
    }
  },

  // Generar plantilla simplificada
  async generateSimpleTemplate(): Promise<void> {
    try {
      // Cargar datos reales de la aplicación
      const [systemsList, departmentsList] = await Promise.all([
        systemsService.getActiveSystems(),
        departmentsService.getActiveDepartments()
      ]);

      const workbook = XLSX.utils.book_new();

      // Hoja única simplificada
      const simpleData = [
        ['SOLICITUD DE INTEGRACIÓN - FORMATO SIMPLIFICADO'],
        [''],
        ['Instrucciones: Complete los campos obligatorios (*) y guarde como .xlsx'],
        [''],
        ['Campo', 'Valor', 'Obligatorio'],
        ['Título de la Integración', '', 'SÍ'],
        ['Descripción', '', 'SÍ'],
        ['Solicitante', '', 'SÍ'],
        ['Departamento', '', 'SÍ'],
        ['Sistema Origen', '', 'SÍ'],
        ['Sistema Destino', '', 'SÍ'],
        ['Sistema Intermediario', '', 'NO'],
        ['Objetivos de Negocio', '', 'SÍ'],
        ['Requerimientos Técnicos', '', 'NO'],
        ['Fecha Límite (DD/MM/AAAA)', '', 'NO'],
        ['Prioridad', '', 'SÍ'],
        ['Comentarios Adicionales', '', 'NO'],
        [''],
        ['SISTEMAS DISPONIBLES:'],
        ...systemsList.map(system => [`${system.name} (${system.technology})`]),
        [''],
        ['DEPARTAMENTOS DISPONIBLES:'],
        ...departmentsList.map(dept => [dept.name]),
        [''],
        ['PRIORIDADES VÁLIDAS:'],
        ['Baja', 'Media', 'Alta', 'Urgente']
      ];

      const simpleSheet = XLSX.utils.aoa_to_sheet(simpleData);
      
      // Configurar listas desplegables
      // Actualizar los datos con valores por defecto
      // Encontrar las filas correctas por contenido
      for (let i = 0; i < simpleData.length; i++) {
        const row = simpleData[i];
        if (!row || !row[0]) continue;
        
        const field = String(row[0]).toLowerCase();
        if (field.includes('departamento')) {
          row[1] = departmentsList.length > 0 ? departmentsList[0].name : 'IT';
        } else if (field.includes('sistema origen')) {
          row[1] = systemsList.length > 0 ? `${systemsList[0].name} (${systemsList[0].technology})` : '';
        } else if (field.includes('sistema destino')) {
          row[1] = systemsList.length > 1 ? `${systemsList[1].name} (${systemsList[1].technology})` : '';
        } else if (field.includes('sistema intermediario')) {
          row[1] = 'Sin sistema intermediario';
        } else if (field.includes('prioridad')) {
          row[1] = 'Media';
        }
      }
      
      const updatedSimpleSheet = XLSX.utils.aoa_to_sheet(simpleData);
      
      // Aplicar las validaciones de datos
      if (!updatedSimpleSheet['!dataValidation']) {
        updatedSimpleSheet['!dataValidation'] = {};
      }

      // Encontrar las celdas correctas para aplicar validaciones
      const departmentRow = simpleData.findIndex(row => row[0] && String(row[0]).toLowerCase().includes('departamento'));
      const priorityRow = simpleData.findIndex(row => row[0] && String(row[0]).toLowerCase().includes('prioridad'));
      const systemOriginRow = simpleData.findIndex(row => row[0] && String(row[0]).toLowerCase().includes('sistema origen'));
      const systemDestinationRow = simpleData.findIndex(row => row[0] && String(row[0]).toLowerCase().includes('sistema destino'));
      const systemIntermediaryRow = simpleData.findIndex(row => row[0] && String(row[0]).toLowerCase().includes('sistema intermediario'));
      
      if (departmentRow > 0) {
        updatedSimpleSheet['!dataValidation'][`B${departmentRow + 1}`] = {
          type: 'list',
          allowBlank: false,
          formula1: departmentsList.map(d => d.name).join(',')
        };
      }

      if (priorityRow > 0) {
        updatedSimpleSheet['!dataValidation'][`B${priorityRow + 1}`] = {
          type: 'list',
          allowBlank: false,
          formula1: 'Baja,Media,Alta,Urgente'
        };
      }

      const systemsOptions = systemsList.map(s => `${s.name} (${s.technology})`).join(',');
      
      if (systemOriginRow > 0) {
        updatedSimpleSheet['!dataValidation'][`B${systemOriginRow + 1}`] = {
          type: 'list',
          allowBlank: false,
          formula1: systemsOptions
        };
      }

      if (systemDestinationRow > 0) {
        updatedSimpleSheet['!dataValidation'][`B${systemDestinationRow + 1}`] = {
          type: 'list',
          allowBlank: false,
          formula1: systemsOptions
        };
      }

      if (systemIntermediaryRow > 0) {
        updatedSimpleSheet['!dataValidation'][`B${systemIntermediaryRow + 1}`] = {
          type: 'list',
          allowBlank: true,
          formula1: `Sin sistema intermediario,${systemsOptions}`
        };
      }

      updatedSimpleSheet['!cols'] = [
        { wch: 35 }, // Campo
        { wch: 50 }, // Valor
        { wch: 12 }  // Obligatorio
      ];
      
      XLSX.utils.book_append_sheet(workbook, updatedSimpleSheet, 'Solicitud');

      // Generar y descargar el archivo
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array'
      });
      
      const data = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const fileName = `Plantilla_Simplificada_Integracion_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(data, fileName);

    } catch (error) {
      console.error('Error generating simple Excel template:', error);
      throw error;
    }
  }
};