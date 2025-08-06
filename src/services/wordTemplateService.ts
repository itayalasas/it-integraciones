import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle } from 'docx';

export const wordTemplateService = {
  // Generar plantilla de Word real en formato .docx
  async generateTemplate(): Promise<void> {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Header
            new Paragraph({
              children: [
                new TextRun({
                  text: "SOLICITUD DE INTEGRACIÓN DE SISTEMAS",
                  bold: true,
                  size: 32,
                  color: "0066CC"
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: "IT Integration Management Application",
                  size: 20,
                  color: "666666"
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Fecha: ________________",
                  size: 20
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 }
            }),

            // Instructions
            new Paragraph({
              children: [
                new TextRun({
                  text: "📋 INSTRUCCIONES PARA COMPLETAR LA SOLICITUD",
                  bold: true,
                  size: 24,
                  color: "0066CC"
                })
              ],
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "• Complete todos los campos obligatorios marcados con (*)",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "• Sea específico y detallado en las descripciones para facilitar el análisis",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "• Adjunte documentación técnica relevante (diagramas, especificaciones, etc.)",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "• Revise la información antes de enviar la solicitud",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "• Una vez completado, guarde como .docx y súbalo al sistema para procesamiento automático",
                  size: 20,
                  bold: true,
                  color: "CC0000"
                })
              ],
              spacing: { after: 600 }
            }),

            // Section 1: General Information
            new Paragraph({
              children: [
                new TextRun({
                  text: "1. INFORMACIÓN GENERAL",
                  bold: true,
                  size: 24,
                  color: "FFFFFF"
                })
              ],
              shading: {
                fill: "0066CC"
              },
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Título de la Integración *",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Descripción Detallada *",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Solicitante *: ________________________    Departamento *: ________________________",
                  size: 20
                })
              ],
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Fecha Límite: ________________________    Prioridad *: ☐ Baja  ☐ Media  ☐ Alta  ☐ Urgente",
                  size: 20
                })
              ],
              spacing: { after: 600 }
            }),

            // Section 2: Systems
            new Paragraph({
              children: [
                new TextRun({
                  text: "2. SISTEMAS INVOLUCRADOS",
                  bold: true,
                  size: 24,
                  color: "FFFFFF"
                })
              ],
              shading: {
                fill: "0066CC"
              },
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Sistema Principal a Integrar *",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Sistema Origen *: ________________________    Sistema Destino *: ________________________",
                  size: 20
                })
              ],
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Sistema Intermediario (opcional)",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 600 }
            }),

            // Section 3: Functional Requirements
            new Paragraph({
              children: [
                new TextRun({
                  text: "3. REQUERIMIENTOS FUNCIONALES",
                  bold: true,
                  size: 24,
                  color: "FFFFFF"
                })
              ],
              shading: {
                fill: "0066CC"
              },
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Objetivos de Negocio *",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Requerimientos Funcionales Específicos *",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Criterios de Aceptación *",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Reglas de Negocio",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 600 }
            }),

            // Section 4: Technical Requirements
            new Paragraph({
              children: [
                new TextRun({
                  text: "4. REQUERIMIENTOS TÉCNICOS",
                  bold: true,
                  size: 24,
                  color: "FFFFFF"
                })
              ],
              shading: {
                fill: "0066CC"
              },
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Arquitectura Propuesta * (marque una o más opciones)",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ API REST    ☐ SOAP    ☐ Microservicios    ☐ ETL    ☐ Batch    ☐ Tiempo Real",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Otra: ________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Tecnologías Requeridas * (marque una o más opciones)",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "☐ Java    ☐ .NET    ☐ Python    ☐ Node.js    ☐ SQL Server    ☐ Oracle    ☐ MongoDB",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Otra: ________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Puntos de Integración *",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Flujo de Datos",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "URL del Servicio (si aplica): ________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Credenciales/Autenticación",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Requerimientos de Seguridad",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Requerimientos de Rendimiento",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 600 }
            }),

            // Section 5: Non-functional Requirements
            new Paragraph({
              children: [
                new TextRun({
                  text: "5. REQUERIMIENTOS NO FUNCIONALES",
                  bold: true,
                  size: 24,
                  color: "FFFFFF"
                })
              ],
              shading: {
                fill: "0066CC"
              },
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Disponibilidad: ________________________    Escalabilidad: ________________________",
                  size: 20
                })
              ],
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Confiabilidad: ________________________    Usabilidad: ________________________",
                  size: 20
                })
              ],
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Mantenibilidad: ________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 600 }
            }),

            // Section 6: Test Cases
            new Paragraph({
              children: [
                new TextRun({
                  text: "6. CASOS DE PRUEBA",
                  bold: true,
                  size: 24,
                  color: "FFFFFF"
                })
              ],
              shading: {
                fill: "0066CC"
              },
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Caso de Prueba #1",
                  bold: true,
                  size: 22,
                  color: "0066CC"
                })
              ],
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Título del Caso: ________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Descripción: ________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Precondiciones: ________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Pasos a Ejecutar:",
                  size: 20,
                  bold: true
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "1. ________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "2. ________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "3. ________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Resultado Esperado: ________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Prioridad: ☐ Baja    ☐ Media    ☐ Alta",
                  size: 20
                })
              ],
              spacing: { after: 400 }
            }),

            // Footer
            new Paragraph({
              children: [
                new TextRun({
                  text: "IT Integration Management Application",
                  bold: true,
                  size: 20
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 600, after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Para soporte técnico, contacte al equipo de IT",
                  size: 18,
                  color: "666666"
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Documento generado automáticamente - ${new Date().toLocaleDateString('es-ES')}`,
                  size: 16,
                  color: "666666"
                })
              ],
              alignment: AlignmentType.CENTER
            })
          ]
        }]
      });

      // Generate and save the document
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      const fileName = `Plantilla_Solicitud_Integracion_${new Date().toISOString().split('T')[0]}.docx`;
      saveAs(blob, fileName);

    } catch (error) {
      console.error('Error generating Word template:', error);
      throw error;
    }
  },

  // Generar plantilla simplificada
  async generateSimpleTemplate(): Promise<void> {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Header
            new Paragraph({
              children: [
                new TextRun({
                  text: "SOLICITUD DE INTEGRACIÓN - FORMATO SIMPLIFICADO",
                  bold: true,
                  size: 28,
                  color: "0066CC"
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Fecha: ________________",
                  size: 20
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 }
            }),

            // Instructions
            new Paragraph({
              children: [
                new TextRun({
                  text: "Instrucciones: Complete los campos obligatorios (*) y guarde como .docx antes de subir al sistema.",
                  bold: true,
                  size: 20,
                  color: "CC0000"
                })
              ],
              spacing: { after: 400 }
            }),

            // Basic Information
            new Paragraph({
              children: [
                new TextRun({
                  text: "INFORMACIÓN BÁSICA",
                  bold: true,
                  size: 24,
                  color: "FFFFFF"
                })
              ],
              shading: {
                fill: "0066CC"
              },
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "1. Título de la Integración *",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "2. Descripción *",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "3. Solicitante *: ________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "4. Departamento *: ________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "5. Sistema Origen *: ________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "6. Sistema Destino *: ________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "7. Objetivo de la Integración *",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "8. Requerimientos Técnicos",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "9. Fecha Límite: ________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 200 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "10. Prioridad: ☐ Baja    ☐ Media    ☐ Alta    ☐ Urgente",
                  size: 20
                })
              ],
              spacing: { after: 300 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "11. Comentarios Adicionales",
                  bold: true,
                  color: "0066CC"
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________",
                  size: 20
                })
              ],
              spacing: { after: 400 }
            }),

            // Footer
            new Paragraph({
              children: [
                new TextRun({
                  text: "IT Integration Management Application",
                  size: 18,
                  color: "666666"
                })
              ],
              alignment: AlignmentType.CENTER
            })
          ]
        }]
      });

      // Generate and save the document
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      const fileName = `Plantilla_Simplificada_Integracion_${new Date().toISOString().split('T')[0]}.docx`;
      saveAs(blob, fileName);

    } catch (error) {
      console.error('Error generating simple template:', error);
      throw error;
    }
  }
};