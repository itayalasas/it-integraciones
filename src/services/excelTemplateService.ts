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
        ['Departamento', '', 'SÍ', 'Seleccione de la lista desplegable'],
        ['Fecha Límite', '', 'NO', 'Formato: DD/MM/AAAA'],
        ['Prioridad', '', 'SÍ', 'Seleccione de la lista desplegable'],
        ['Sistema Principal a Integrar', '', 'SÍ', 'Seleccione de la lista desplegable'],
        ['Sistema Origen', '', 'SÍ', 'Seleccione de la lista desplegable'],
        ['Sistema Destino', '', 'SÍ', 'Seleccione de la lista desplegable'],
        ['Sistema Intermediario', '', 'NO', 'Seleccione de la lista desplegable (opcional)'],
        [''],
        ['NOTA: Use las listas desplegables en la columna "Valor" para seleccionar opciones válidas']
      ];

      const generalSheet = XLSX.utils.aoa_to_sheet(generalData);
      
      // Configurar validaciones de datos (listas desplegables)
      // Cambiar el texto de las celdas para mostrar las opciones disponibles
      generalData[6][1] = departmentsList.length > 0 ? departmentsList[0].name : 'IT'; // Departamento por defecto
      generalData[8][1] = 'Media'; // Prioridad por defecto
      generalData[9][1] = systemsList.length > 0 ? `${systemsList[0].name} (${systemsList[0].technology})` : ''; // Sistema principal
      generalData[10][1] = systemsList.length > 0 ? `${systemsList[0].name} (${systemsList[0].technology})` : ''; // Sistema origen
      generalData[11][1] = systemsList.length > 1 ? `${systemsList[1].name} (${systemsList[1].technology})` : ''; // Sistema destino
      generalData[12][1] = 'Sin sistema intermediario'; // Sistema intermediario
      
      // Recrear la hoja con los datos actualizados
      const updatedGeneralSheet = XLSX.utils.aoa_to_sheet(generalData);
      
      // Ahora aplicar las validaciones de datos
      if (!updatedGeneralSheet['!dataValidation']) {
        updatedGeneralSheet['!dataValidation'] = {};
      }

      // Lista desplegable para Departamentos (celda B9)
      updatedGeneralSheet['!dataValidation']['B9'] = {
        type: 'list',
        allowBlank: false,
        formula1: `"${departmentsList.map(d => d.name).join(',')}"`,
        showDropDown: true
      };

      // Lista desplegable para Prioridad (celda B16)
      updatedGeneralSheet['!dataValidation']['B16'] = {
        type: 'list',
        allowBlank: false,
        formula1: '"Baja,Media,Alta,Urgente"',
        showDropDown: true
      };

      // Listas desplegables para Sistemas
      const systemsFormula = `"${systemsList.map(s => `${s.name} (${s.technology})`).join(',')}"`;
      
      // Sistema Principal a Integrar (celda B10)
      updatedGeneralSheet['!dataValidation']['B10'] = {
        type: 'list',
        allowBlank: false,
        formula1: systemsFormula,
        showDropDown: true
      };

      // Sistema Origen (celda B11)
      updatedGeneralSheet['!dataValidation']['B11'] = {
        type: 'list',
        allowBlank: false,
        formula1: systemsFormula,
        showDropDown: true
      };

      // Sistema Destino (celda B12)
      updatedGeneralSheet['!dataValidation']['B12'] = {
        type: 'list',
        allowBlank: false,
        formula1: systemsFormula,
        showDropDown: true
      };

      // Sistema Intermediario (celda B13) - opcional
      updatedGeneralSheet['!dataValidation']['B13'] = {
        type: 'list',
        allowBlank: true,
        formula1: `"Sin sistema intermediario,${systemsList.map(s => `${s.name} (${s.technology})`).join(',')}"`,
        showDropDown: true
      };

      updatedGeneralSheet['!cols'] = [
        { wch: 25 }, // Campo
        { wch: 40 }, // Valor
        { wch: 12 }, // Obligatorio
        { wch: 35 }  // Descripción
      ];
      
      XLSX.utils.book_append_sheet(workbook, updatedGeneralSheet, 'Información General');

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
        formula1: '"API REST,SOAP,Microservicios,ETL,Batch,Tiempo Real"',
        showDropDown: true
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
          formula1: '"Baja,Media,Alta"',
          showDropDown: true
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
      simpleData[8][1] = departmentsList.length > 0 ? departmentsList[0].name : 'IT'; // Departamento
      simpleData[9][1] = systemsList.length > 0 ? `${systemsList[0].name} (${systemsList[0].technology})` : ''; // Sistema Origen
      simpleData[10][1] = systemsList.length > 1 ? `${systemsList[1].name} (${systemsList[1].technology})` : ''; // Sistema Destino
      simpleData[11][1] = 'Sin sistema intermediario'; // Sistema Intermediario
      simpleData[15][1] = 'Media'; // Prioridad
      
      // Recrear la hoja con datos actualizados
      const updatedSimpleSheet = XLSX.utils.aoa_to_sheet(simpleData);
      
      // Ahora aplicar las validaciones de datos
      if (!updatedSimpleSheet['!dataValidation']) {
        updatedSimpleSheet['!dataValidation'] = {};
      }

      // Lista desplegable para Departamento (celda B9)
      updatedSimpleSheet['!dataValidation']['B9'] = {
        type: 'list',
        allowBlank: false,
        formula1: `"${departmentsList.map(d => d.name).join(',')}"`,
        showDropDown: true
      };

      // Listas desplegables para Sistemas
      const systemsFormula = `"${systemsList.map(s => `${s.name} (${s.technology})`).join(',')}"`;
      
      // Sistema Origen (celda B10)
      updatedSimpleSheet['!dataValidation']['B10'] = {
        type: 'list',
        allowBlank: false,
        formula1: systemsFormula,
        showDropDown: true
      };

      // Sistema Destino (celda B11)
      updatedSimpleSheet['!dataValidation']['B11'] = {
        type: 'list',
        allowBlank: false,
        formula1: systemsFormula,
        showDropDown: true
      };

      // Sistema Intermediario (celda B12) - con opción "Sin sistema"
      updatedSimpleSheet['!dataValidation']['B12'] = {
        type: 'list',
        allowBlank: true,
        formula1: `"Sin sistema intermediario,${systemsList.map(s => `${s.name} (${s.technology})`).join(',')}"`,
        showDropDown: true
      };

      // Lista desplegable para Prioridad (celda B16)
      updatedSimpleSheet['!dataValidation']['B16'] = {
        type: 'list',
        allowBlank: false,
        formula1: '"Baja,Media,Alta,Urgente"',
        showDropDown: true
      };

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