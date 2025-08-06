import { saveAs } from 'file-saver';

export const wordTemplateService = {
  // Generar plantilla de Word para solicitud de integración
  async generateTemplate(): Promise<void> {
    try {
      // Crear el contenido HTML que se convertirá a Word
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Plantilla - Solicitud de Integración</title>
          <style>
            body {
              font-family: 'Calibri', Arial, sans-serif;
              font-size: 11pt;
              line-height: 1.4;
              margin: 1in;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #0066cc;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #0066cc;
              font-size: 18pt;
              font-weight: bold;
              margin: 0;
            }
            .header p {
              color: #666;
              font-size: 10pt;
              margin: 5px 0 0 0;
            }
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .section-title {
              background-color: #0066cc;
              color: white;
              padding: 8px 12px;
              font-size: 12pt;
              font-weight: bold;
              margin-bottom: 15px;
            }
            .field-group {
              margin-bottom: 15px;
            }
            .field-label {
              font-weight: bold;
              color: #0066cc;
              margin-bottom: 5px;
              display: block;
            }
            .field-input {
              border: 1px solid #ccc;
              padding: 8px;
              min-height: 20px;
              background-color: #f9f9f9;
              margin-bottom: 10px;
              display: block;
              width: 100%;
              box-sizing: border-box;
            }
            .field-textarea {
              min-height: 60px;
            }
            .field-large {
              min-height: 100px;
            }
            .two-column {
              display: flex;
              gap: 20px;
            }
            .two-column .field-group {
              flex: 1;
            }
            .checkbox-group {
              display: flex;
              flex-wrap: wrap;
              gap: 15px;
              margin-top: 5px;
            }
            .checkbox-item {
              display: flex;
              align-items: center;
              gap: 5px;
            }
            .checkbox {
              width: 15px;
              height: 15px;
              border: 1px solid #666;
              display: inline-block;
            }
            .priority-options {
              display: flex;
              gap: 20px;
              margin-top: 5px;
            }
            .priority-item {
              display: flex;
              align-items: center;
              gap: 5px;
            }
            .radio {
              width: 12px;
              height: 12px;
              border: 1px solid #666;
              border-radius: 50%;
              display: inline-block;
            }
            .test-case {
              border: 1px solid #ddd;
              padding: 15px;
              margin-bottom: 15px;
              background-color: #fafafa;
            }
            .test-case-title {
              font-weight: bold;
              color: #0066cc;
              margin-bottom: 10px;
            }
            .instructions {
              background-color: #e8f4fd;
              border: 1px solid #b3d9ff;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 4px;
            }
            .instructions h3 {
              color: #0066cc;
              margin-top: 0;
              font-size: 12pt;
            }
            .instructions ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .instructions li {
              margin-bottom: 5px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ccc;
              text-align: center;
              font-size: 9pt;
              color: #666;
            }
            @media print {
              body { margin: 0.5in; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SOLICITUD DE INTEGRACIÓN DE SISTEMAS</h1>
            <p>IT Integration Management Application</p>
            <p>Fecha: ________________</p>
          </div>

          <div class="instructions">
            <h3>📋 Instrucciones para completar la solicitud</h3>
            <ul>
              <li><strong>Complete todos los campos obligatorios</strong> marcados con (*)</li>
              <li><strong>Sea específico y detallado</strong> en las descripciones para facilitar el análisis</li>
              <li><strong>Adjunte documentación técnica</strong> relevante (diagramas, especificaciones, etc.)</li>
              <li><strong>Revise la información</strong> antes de enviar la solicitud</li>
              <li><strong>Una vez completado,</strong> envíe este documento al equipo de IT para su procesamiento</li>
            </ul>
          </div>

          <!-- INFORMACIÓN GENERAL -->
          <div class="section">
            <div class="section-title">1. INFORMACIÓN GENERAL</div>
            
            <div class="field-group">
              <span class="field-label">Título de la Integración *</span>
              <div class="field-input"></div>
            </div>

            <div class="field-group">
              <span class="field-label">Descripción Detallada *</span>
              <div class="field-input field-large"></div>
            </div>

            <div class="two-column">
              <div class="field-group">
                <span class="field-label">Solicitante *</span>
                <div class="field-input"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Departamento *</span>
                <div class="field-input"></div>
              </div>
            </div>

            <div class="two-column">
              <div class="field-group">
                <span class="field-label">Fecha Límite</span>
                <div class="field-input"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Prioridad *</span>
                <div class="priority-options">
                  <div class="priority-item">
                    <span class="radio"></span>
                    <span>Baja</span>
                  </div>
                  <div class="priority-item">
                    <span class="radio"></span>
                    <span>Media</span>
                  </div>
                  <div class="priority-item">
                    <span class="radio"></span>
                    <span>Alta</span>
                  </div>
                  <div class="priority-item">
                    <span class="radio"></span>
                    <span>Urgente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SISTEMAS INVOLUCRADOS -->
          <div class="section">
            <div class="section-title">2. SISTEMAS INVOLUCRADOS</div>
            
            <div class="field-group">
              <span class="field-label">Sistema Principal a Integrar *</span>
              <div class="field-input"></div>
            </div>

            <div class="two-column">
              <div class="field-group">
                <span class="field-label">Sistema Origen *</span>
                <div class="field-input"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Sistema Destino *</span>
                <div class="field-input"></div>
              </div>
            </div>

            <div class="field-group">
              <span class="field-label">Sistema Intermediario (opcional)</span>
              <div class="field-input"></div>
            </div>
          </div>

          <!-- REQUERIMIENTOS FUNCIONALES -->
          <div class="section">
            <div class="section-title">3. REQUERIMIENTOS FUNCIONALES</div>
            
            <div class="field-group">
              <span class="field-label">Objetivos de Negocio *</span>
              <div class="field-input field-large"></div>
            </div>

            <div class="field-group">
              <span class="field-label">Requerimientos Funcionales Específicos *</span>
              <div class="field-input field-large"></div>
            </div>

            <div class="field-group">
              <span class="field-label">Criterios de Aceptación *</span>
              <div class="field-input field-large"></div>
            </div>

            <div class="field-group">
              <span class="field-label">Reglas de Negocio</span>
              <div class="field-input field-textarea"></div>
            </div>
          </div>

          <!-- REQUERIMIENTOS TÉCNICOS -->
          <div class="section">
            <div class="section-title">4. REQUERIMIENTOS TÉCNICOS</div>
            
            <div class="field-group">
              <span class="field-label">Arquitectura Propuesta *</span>
              <div class="checkbox-group">
                <div class="checkbox-item">
                  <span class="checkbox"></span>
                  <span>API REST</span>
                </div>
                <div class="checkbox-item">
                  <span class="checkbox"></span>
                  <span>SOAP</span>
                </div>
                <div class="checkbox-item">
                  <span class="checkbox"></span>
                  <span>Microservicios</span>
                </div>
                <div class="checkbox-item">
                  <span class="checkbox"></span>
                  <span>ETL</span>
                </div>
                <div class="checkbox-item">
                  <span class="checkbox"></span>
                  <span>Batch</span>
                </div>
                <div class="checkbox-item">
                  <span class="checkbox"></span>
                  <span>Tiempo Real</span>
                </div>
                <div class="checkbox-item">
                  <span class="checkbox"></span>
                  <span>Otra: ________________</span>
                </div>
              </div>
            </div>

            <div class="field-group">
              <span class="field-label">Tecnologías Requeridas *</span>
              <div class="checkbox-group">
                <div class="checkbox-item">
                  <span class="checkbox"></span>
                  <span>Java</span>
                </div>
                <div class="checkbox-item">
                  <span class="checkbox"></span>
                  <span>.NET</span>
                </div>
                <div class="checkbox-item">
                  <span class="checkbox"></span>
                  <span>Python</span>
                </div>
                <div class="checkbox-item">
                  <span class="checkbox"></span>
                  <span>Node.js</span>
                </div>
                <div class="checkbox-item">
                  <span class="checkbox"></span>
                  <span>SQL Server</span>
                </div>
                <div class="checkbox-item">
                  <span class="checkbox"></span>
                  <span>Oracle</span>
                </div>
                <div class="checkbox-item">
                  <span class="checkbox"></span>
                  <span>MongoDB</span>
                </div>
                <div class="checkbox-item">
                  <span class="checkbox"></span>
                  <span>Otra: ________________</span>
                </div>
              </div>
            </div>

            <div class="field-group">
              <span class="field-label">Puntos de Integración *</span>
              <div class="field-input field-textarea"></div>
            </div>

            <div class="field-group">
              <span class="field-label">Flujo de Datos</span>
              <div class="field-input field-textarea"></div>
            </div>

            <div class="field-group">
              <span class="field-label">URL del Servicio (si aplica)</span>
              <div class="field-input"></div>
            </div>

            <div class="field-group">
              <span class="field-label">Credenciales/Autenticación</span>
              <div class="field-input field-textarea"></div>
            </div>

            <div class="field-group">
              <span class="field-label">Requerimientos de Seguridad</span>
              <div class="field-input field-textarea"></div>
            </div>

            <div class="field-group">
              <span class="field-label">Requerimientos de Rendimiento</span>
              <div class="field-input field-textarea"></div>
            </div>
          </div>

          <!-- REQUERIMIENTOS NO FUNCIONALES -->
          <div class="section">
            <div class="section-title">5. REQUERIMIENTOS NO FUNCIONALES</div>
            
            <div class="two-column">
              <div class="field-group">
                <span class="field-label">Disponibilidad</span>
                <div class="field-input"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Escalabilidad</span>
                <div class="field-input"></div>
              </div>
            </div>

            <div class="two-column">
              <div class="field-group">
                <span class="field-label">Confiabilidad</span>
                <div class="field-input"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Usabilidad</span>
                <div class="field-input"></div>
              </div>
            </div>

            <div class="field-group">
              <span class="field-label">Mantenibilidad</span>
              <div class="field-input"></div>
            </div>
          </div>

          <!-- CASOS DE PRUEBA -->
          <div class="section">
            <div class="section-title">6. CASOS DE PRUEBA</div>
            
            <div class="test-case">
              <div class="test-case-title">Caso de Prueba #1</div>
              <div class="field-group">
                <span class="field-label">Título del Caso</span>
                <div class="field-input"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Descripción</span>
                <div class="field-input field-textarea"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Precondiciones</span>
                <div class="field-input field-textarea"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Pasos a Ejecutar</span>
                <div class="field-input field-large"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Resultado Esperado</span>
                <div class="field-input field-textarea"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Prioridad</span>
                <div class="priority-options">
                  <div class="priority-item">
                    <span class="radio"></span>
                    <span>Baja</span>
                  </div>
                  <div class="priority-item">
                    <span class="radio"></span>
                    <span>Media</span>
                  </div>
                  <div class="priority-item">
                    <span class="radio"></span>
                    <span>Alta</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="test-case">
              <div class="test-case-title">Caso de Prueba #2</div>
              <div class="field-group">
                <span class="field-label">Título del Caso</span>
                <div class="field-input"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Descripción</span>
                <div class="field-input field-textarea"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Precondiciones</span>
                <div class="field-input field-textarea"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Pasos a Ejecutar</span>
                <div class="field-input field-large"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Resultado Esperado</span>
                <div class="field-input field-textarea"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Prioridad</span>
                <div class="priority-options">
                  <div class="priority-item">
                    <span class="radio"></span>
                    <span>Baja</span>
                  </div>
                  <div class="priority-item">
                    <span class="radio"></span>
                    <span>Media</span>
                  </div>
                  <div class="priority-item">
                    <span class="radio"></span>
                    <span>Alta</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="test-case">
              <div class="test-case-title">Caso de Prueba #3</div>
              <div class="field-group">
                <span class="field-label">Título del Caso</span>
                <div class="field-input"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Descripción</span>
                <div class="field-input field-textarea"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Precondiciones</span>
                <div class="field-input field-textarea"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Pasos a Ejecutar</span>
                <div class="field-input field-large"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Resultado Esperado</span>
                <div class="field-input field-textarea"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Prioridad</span>
                <div class="priority-options">
                  <div class="priority-item">
                    <span class="radio"></span>
                    <span>Baja</span>
                  </div>
                  <div class="priority-item">
                    <span class="radio"></span>
                    <span>Media</span>
                  </div>
                  <div class="priority-item">
                    <span class="radio"></span>
                    <span>Alta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- DOCUMENTOS ADJUNTOS -->
          <div class="section">
            <div class="section-title">7. DOCUMENTOS ADJUNTOS</div>
            
            <div class="field-group">
              <span class="field-label">Lista de Documentos Adjuntos</span>
              <div class="field-input field-textarea"></div>
              <p style="font-size: 9pt; color: #666; margin-top: 5px;">
                Ejemplo: Diagrama de arquitectura, especificaciones técnicas, mockups, etc.
              </p>
            </div>
          </div>

          <!-- APROBACIONES -->
          <div class="section">
            <div class="section-title">8. APROBACIONES (Para uso interno)</div>
            
            <div class="two-column">
              <div class="field-group">
                <span class="field-label">Revisado por</span>
                <div class="field-input"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Fecha de Revisión</span>
                <div class="field-input"></div>
              </div>
            </div>

            <div class="two-column">
              <div class="field-group">
                <span class="field-label">Aprobado por</span>
                <div class="field-input"></div>
              </div>
              <div class="field-group">
                <span class="field-label">Fecha de Aprobación</span>
                <div class="field-input"></div>
              </div>
            </div>

            <div class="field-group">
              <span class="field-label">Comentarios de Aprobación</span>
              <div class="field-input field-textarea"></div>
            </div>

            <div class="field-group">
              <span class="field-label">Sprint Asignado</span>
              <div class="field-input"></div>
            </div>
          </div>

          <div class="footer">
            <p><strong>IT Integration Management Application</strong></p>
            <p>Para soporte técnico, contacte al equipo de IT</p>
            <p>Documento generado automáticamente - Versión 1.0</p>
          </div>
        </body>
        </html>
      `;

      // Crear un blob con el contenido HTML
      const blob = new Blob([htmlContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      // Generar nombre del archivo con fecha
      const fileName = `Plantilla_Solicitud_Integracion_${new Date().toISOString().split('T')[0]}.docx`;
      
      // Descargar el archivo
      saveAs(blob, fileName);

    } catch (error) {
      console.error('Error generating Word template:', error);
      throw error;
    }
  },

  // Generar plantilla simplificada (versión corta)
  async generateSimpleTemplate(): Promise<void> {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Plantilla Simplificada - Solicitud de Integración</title>
          <style>
            body {
              font-family: 'Calibri', Arial, sans-serif;
              font-size: 11pt;
              line-height: 1.4;
              margin: 1in;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #0066cc;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #0066cc;
              font-size: 18pt;
              font-weight: bold;
              margin: 0;
            }
            .section-title {
              background-color: #0066cc;
              color: white;
              padding: 8px 12px;
              font-size: 12pt;
              font-weight: bold;
              margin: 20px 0 15px 0;
            }
            .field-label {
              font-weight: bold;
              color: #0066cc;
              margin: 15px 0 5px 0;
              display: block;
            }
            .field-input {
              border: 1px solid #ccc;
              padding: 8px;
              min-height: 20px;
              background-color: #f9f9f9;
              margin-bottom: 10px;
              display: block;
              width: 100%;
              box-sizing: border-box;
            }
            .field-textarea {
              min-height: 60px;
            }
            .instructions {
              background-color: #e8f4fd;
              border: 1px solid #b3d9ff;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SOLICITUD DE INTEGRACIÓN - FORMATO SIMPLIFICADO</h1>
            <p>Fecha: ________________</p>
          </div>

          <div class="instructions">
            <strong>Instrucciones:</strong> Complete los campos obligatorios (*) y envíe este documento al equipo de IT.
          </div>

          <div class="section-title">INFORMACIÓN BÁSICA</div>
          
          <span class="field-label">1. Título de la Integración *</span>
          <div class="field-input"></div>

          <span class="field-label">2. Descripción *</span>
          <div class="field-input field-textarea"></div>

          <span class="field-label">3. Solicitante *</span>
          <div class="field-input"></div>

          <span class="field-label">4. Departamento *</span>
          <div class="field-input"></div>

          <span class="field-label">5. Sistema Origen *</span>
          <div class="field-input"></div>

          <span class="field-label">6. Sistema Destino *</span>
          <div class="field-input"></div>

          <span class="field-label">7. Objetivo de la Integración *</span>
          <div class="field-input field-textarea"></div>

          <span class="field-label">8. Requerimientos Técnicos</span>
          <div class="field-input field-textarea"></div>

          <span class="field-label">9. Fecha Límite</span>
          <div class="field-input"></div>

          <span class="field-label">10. Prioridad</span>
          <div style="margin: 10px 0;">
            ☐ Baja &nbsp;&nbsp;&nbsp; ☐ Media &nbsp;&nbsp;&nbsp; ☐ Alta &nbsp;&nbsp;&nbsp; ☐ Urgente
          </div>

          <span class="field-label">11. Comentarios Adicionales</span>
          <div class="field-input field-textarea"></div>

          <div style="margin-top: 40px; text-align: center; font-size: 9pt; color: #666;">
            <p>IT Integration Management Application</p>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { 
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