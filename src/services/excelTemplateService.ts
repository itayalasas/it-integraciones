import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const excelTemplateService = {
  // Generar plantilla completa de Excel
  async generateTemplate(): Promise<void> {
    try {
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
        [''],
        ['HOJAS INCLUIDAS:'],
        ['• Información General: Datos básicos de la solicitud'],
        ['• Requerimientos: Funcionales, técnicos y no funcionales'],
        ['• Casos de Prueba: Definición de pruebas'],
        [''],
        ['NOTAS:'],
        ['• Los campos con (*) son obligatorios'],
        ['• Use el formato de fecha DD/MM/AAAA'],
        ['• Para listas, separe elementos con comas'],
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
        ['Departamento', '', 'SÍ', 'Departamento del solicitante'],
        ['Fecha Límite', '', 'NO', 'Formato: DD/MM/AAAA'],
        ['Prioridad', '', 'SÍ', 'Opciones: Baja, Media, Alta, Urgente'],
        ['Sistema Principal a Integrar', '', 'SÍ', 'Sistema principal del proyecto'],
        ['Sistema Origen', '', 'SÍ', 'Sistema que envía los datos'],
        ['Sistema Destino', '', 'SÍ', 'Sistema que recibe los datos'],
        ['Sistema Intermediario', '', 'NO', 'Sistema intermedio (si aplica)'],
        [''],
        ['OPCIONES VÁLIDAS PARA PRIORIDAD:'],
        ['Baja', 'Media', 'Alta', 'Urgente']
      ];

      const generalSheet = XLSX.utils.aoa_to_sheet(generalData);
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
        ['OPCIONES PARA ARQUITECTURA:'],
        ['API REST', 'SOAP', 'Microservicios', 'ETL', 'Batch', 'Tiempo Real'],
        [''],
        ['TECNOLOGÍAS COMUNES:'],
        ['Java', '.NET', 'Python', 'Node.js', 'SQL Server', 'Oracle', 'MongoDB']
      ];

      const requirementsSheet = XLSX.utils.aoa_to_sheet(requirementsData);
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
        ['OPCIONES PARA PRIORIDAD DE CASOS:'],
        ['Baja', 'Media', 'Alta']
      ];

      const testCasesSheet = XLSX.utils.aoa_to_sheet(testCasesData);
      testCasesSheet['!cols'] = [
        { wch: 25 }, // Título
        { wch: 35 }, // Descripción
        { wch: 25 }, // Precondiciones
        { wch: 40 }, // Pasos
        { wch: 30 }, // Resultado
        { wch: 12 }  // Prioridad
      ];
      
      XLSX.utils.book_append_sheet(workbook, testCasesSheet, 'Casos de Prueba');

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
        ['Prioridad (Baja/Media/Alta/Urgente)', '', 'SÍ'],
        ['Comentarios Adicionales', '', 'NO'],
        [''],
        ['NOTAS:'],
        ['• Complete solo los campos necesarios'],
        ['• Mantenga el formato .xlsx'],
        ['• Sea específico en las descripciones']
      ];

      const simpleSheet = XLSX.utils.aoa_to_sheet(simpleData);
      simpleSheet['!cols'] = [
        { wch: 35 }, // Campo
        { wch: 50 }, // Valor
        { wch: 12 }  // Obligatorio
      ];
      
      XLSX.utils.book_append_sheet(workbook, simpleSheet, 'Solicitud');

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