import React, { useState } from 'react';
import { 
  Wand2, 
  Copy, 
  Download, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Sparkles,
  Code,
  TestTube,
  Target,
  Users,
  Zap,
  X,
  Loader2
} from 'lucide-react';
import { IntegrationRequest } from '../../types';
import { systemsService } from '../../services/systemsService';

interface UserStoryGeneratorProps {
  request: IntegrationRequest;
  onGenerate: (userStory: string) => void;
}

// Componente para notificaciones
interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, title, message, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'info': return <AlertCircle className="h-5 w-5 text-blue-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColors = () => {
    switch (type) {
      case 'success': return 'text-green-800';
      case 'error': return 'text-red-800';
      case 'warning': return 'text-yellow-800';
      case 'info': return 'text-blue-800';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md w-full ${getColors()} border rounded-lg p-4 shadow-lg animate-in slide-in-from-top-2 duration-300`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${getTextColors()}`}>
            {title}
          </h3>
          <p className={`mt-1 text-sm ${getTextColors()} opacity-90`}>
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClose}
            className={`inline-flex ${getTextColors()} hover:opacity-75`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const UserStoryGenerator: React.FC<UserStoryGeneratorProps> = ({ request, onGenerate }) => {
  const [generating, setGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [systems, setSystems] = useState<any>({});
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  React.useEffect(() => {
    loadSystems();
  }, []);

  const loadSystems = async () => {
    try {
      const systemsList = await systemsService.getSystems();
      const systemsMap = systemsList.reduce((acc, system) => {
        acc[system.id] = system.name;
        return acc;
      }, {} as any);
      setSystems(systemsMap);
    } catch (error) {
      console.error('Error loading systems:', error);
    }
  };

  const getSystemName = (systemId: string) => {
    return systems[systemId] || systemId;
  };

  const generateUserStory = async () => {
    setGenerating(true);
    
    try {
      // Simular llamada a API de IA (aquí integrarías con OpenAI, Claude, etc.)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Obtener información del Sprint si existe
      const sprintInfo = request.approvalHistory?.find(h => h.action === 'approved');
      
      const userStory = `# 📋 Historia de Usuario: ${request.title}

## 🎯 Historia Principal

**Como** usuario del sistema ${getSystemName(request.sourceSystem)}  
**Quiero** integrar datos con ${getSystemName(request.targetSystem)}  
**Para** ${request.functionalRequirements.businessGoals}

---

## 📝 Descripción Detallada

${request.description}

### 🔄 Flujo de Integración
- **Sistema Origen:** ${getSystemName(request.sourceSystem)}
${request.intermediarySystem ? `- **Sistema Intermediario:** ${getSystemName(request.intermediarySystem)}` : ''}
- **Sistema Destino:** ${getSystemName(request.targetSystem)}

---

## ✅ Criterios de Aceptación

### Funcionales
${request.functionalRequirements.acceptanceCriteria.split('\n').map(criteria => `- [ ] ${criteria.trim()}`).join('\n')}

### Requerimientos Específicos
${request.functionalRequirements.functionalRequirements.split('\n').map(req => `- [ ] ${req.trim()}`).join('\n')}

### Técnicos
- [ ] **Arquitectura implementada:** ${request.technicalRequirements.architecture}
- [ ] **Tecnologías utilizadas:** ${Array.isArray(request.technicalRequirements.technologies) ? request.technicalRequirements.technologies.join(', ') : request.technicalRequirements.technologies}
- [ ] **Puntos de integración configurados:** ${request.technicalRequirements.integrationPoints}
${request.technicalRequirements.dataFlow ? `- [ ] **Flujo de datos validado:** ${request.technicalRequirements.dataFlow}` : ''}
${request.technicalRequirements.securityRequirements ? `- [ ] **Seguridad implementada:** ${request.technicalRequirements.securityRequirements}` : ''}
${request.technicalRequirements.performanceRequirements ? `- [ ] **Rendimiento validado:** ${request.technicalRequirements.performanceRequirements}` : ''}

### No Funcionales
${request.nonFunctionalRequirements.availability ? `- [ ] **Disponibilidad:** ${request.nonFunctionalRequirements.availability}` : ''}
${request.nonFunctionalRequirements.scalability ? `- [ ] **Escalabilidad:** ${request.nonFunctionalRequirements.scalability}` : ''}
${request.nonFunctionalRequirements.reliability ? `- [ ] **Confiabilidad:** ${request.nonFunctionalRequirements.reliability}` : ''}
${request.nonFunctionalRequirements.usability ? `- [ ] **Usabilidad:** ${request.nonFunctionalRequirements.usability}` : ''}
${request.nonFunctionalRequirements.maintenance ? `- [ ] **Mantenibilidad:** ${request.nonFunctionalRequirements.maintenance}` : ''}

---

## 🏁 Definición de Terminado (Definition of Done)

- [ ] Análisis técnico completado y documentado
- [ ] Diseño de arquitectura aprobado por el equipo técnico
- [ ] Desarrollo de la integración completado
- [ ] Casos de prueba unitarias implementados y pasando
- [ ] Casos de prueba de integración ejecutados exitosamente
- [ ] Pruebas de seguridad completadas sin vulnerabilidades críticas
- [ ] Pruebas de rendimiento validadas según requerimientos
- [ ] Documentación técnica actualizada
- [ ] Code review completado y aprobado
- [ ] Despliegue en ambiente de testing exitoso
- [ ] Validación de usuario final completada
- [ ] Despliegue en ambiente de producción
- [ ] Monitoreo y alertas configurados
- [ ] Handover al equipo de soporte completado

---

## 🧪 Casos de Prueba

${request.testCases.length > 0 ? request.testCases.map((testCase, index) => `
### Caso ${index + 1}: ${testCase.title}
**🎯 Objetivo:** ${testCase.description}  
**📋 Precondiciones:** ${testCase.preconditions}  
**🔄 Pasos a ejecutar:**
${testCase.steps.map((step, stepIndex) => `${stepIndex + 1}. ${step}`).join('\n')}
**✅ Resultado esperado:** ${testCase.expectedResult}  
**⚡ Prioridad:** ${testCase.priority.toUpperCase()}
`).join('\n') : '- No se han definido casos de prueba específicos'}

---

## 📊 Información del Proyecto

| Campo | Valor |
|-------|-------|
| **Prioridad** | ${request.priority.toUpperCase()} |
| **Sistema Principal** | ${getSystemName(request.systemToIntegrate)} |
| **Fecha Límite** | ${request.dueDate ? request.dueDate.toLocaleDateString('es-ES') : 'No especificada'} |
| **Solicitante** | ${request.requesterName} |
| **Departamento** | ${request.department} |
| **Estado** | ${request.status.toUpperCase()} |
| **Fecha de Aprobación** | ${request.approvedAt ? request.approvedAt.toLocaleDateString('es-ES') : 'N/A'} |
${sprintInfo?.sprintName ? `| **Sprint Asignado** | ${sprintInfo.sprintName} |` : ''}
${sprintInfo?.sprintStartDate ? `| **Sprint - Inicio** | ${sprintInfo.sprintStartDate.toLocaleDateString('es-ES')} |` : ''}
${sprintInfo?.sprintEndDate ? `| **Sprint - Fin** | ${sprintInfo.sprintEndDate.toLocaleDateString('es-ES')} |` : ''}

---

## 📋 Reglas de Negocio

${request.functionalRequirements.businessRules || 'No se han especificado reglas de negocio particulares'}

---

## 🔗 Dependencias y Consideraciones

### Sistemas Involucrados
- **Origen:** ${getSystemName(request.sourceSystem)}
${request.intermediarySystem ? `- **Intermediario:** ${getSystemName(request.intermediarySystem)}` : ''}
- **Destino:** ${getSystemName(request.targetSystem)}

### Consideraciones Técnicas
- La integración debe mantener la integridad de los datos en todo momento
- Se debe implementar manejo de errores y reintentos automáticos
- Los logs de transacciones deben ser auditables
- Se requiere documentación de APIs y endpoints utilizados

### Riesgos Identificados
- Posibles interrupciones durante la sincronización de datos
- Dependencia de la disponibilidad de sistemas externos
- Necesidad de coordinación entre equipos para despliegues

---

## 📈 Métricas de Éxito

- [ ] Tiempo de respuesta de la integración < 5 segundos
- [ ] Tasa de éxito de sincronización > 99%
- [ ] Cero pérdida de datos durante la migración
- [ ] Disponibilidad del servicio > 99.9%
- [ ] Tiempo de recuperación ante fallos < 15 minutos

---

## 🏷️ Etiquetas (Tags)

\`integration\` \`${getSystemName(request.sourceSystem).toLowerCase().replace(/\s+/g, '-')}\` \`${getSystemName(request.targetSystem).toLowerCase().replace(/\s+/g, '-')}\` \`${request.priority}\` \`${request.department.toLowerCase()}\`

---

*📅 Historia generada automáticamente el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}*  
*🤖 Generada con IA para Azure DevOps - Lista para importar como Work Item*
      `;
      
      setGeneratedStory(userStory);
      onGenerate(userStory);
    } catch (error) {
      console.error('Error generating user story:', error);
     showNotification(
       'error',
       'Error al generar historia',
       'No se pudo generar la historia de usuario. Intenta nuevamente.'
     );
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedStory);
      setCopied(true);
     showNotification(
       'success',
       'Historia copiada',
       'La historia de usuario ha sido copiada al portapapeles.'
     );
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
     showNotification(
       'error',
       'Error al copiar',
       'No se pudo copiar la historia al portapapeles.'
     );
    }
  };

  const downloadAsFile = () => {
    const blob = new Blob([generatedStory], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historia-usuario-${request.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
   
   showNotification(
     'success',
     'Archivo descargado',
     'La historia de usuario ha sido descargada como archivo Markdown.'
   );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      {/* Notificación */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Generador de Historia de Usuario con IA
            </h3>
            <p className="text-sm text-gray-600">
              Metodología ágil optimizada para Azure DevOps
            </p>
          </div>
        </div>
        
        {!generatedStory && (
          <button
            onClick={generateUserStory}
            disabled={generating}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 shadow-lg"
          >
            <Wand2 className="h-5 w-5" />
            <span className="font-medium">
              {generating ? 'Generando con IA...' : 'Generar Historia de Usuario'}
            </span>
          </button>
        )}
      </div>

      {generating && (
        <div className="text-center py-12">
          <div className="relative">
            <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
            <Sparkles className="absolute top-3 left-1/2 transform -translate-x-1/2 h-6 w-6 text-purple-600 animate-pulse" />
          </div>
          <p className="text-gray-700 font-medium">Generando historia de usuario con IA...</p>
          <p className="text-sm text-gray-500 mt-2">
            Analizando requerimientos, casos de prueba y criterios de aceptación
          </p>
          
          {/* Indicadores de progreso */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Target className="h-4 w-4 text-green-500" />
              <span>Analizando objetivos de negocio</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Code className="h-4 w-4 text-blue-500" />
              <span>Procesando requerimientos técnicos</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <TestTube className="h-4 w-4 text-purple-500" />
              <span>Estructurando casos de prueba</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4 text-orange-500" />
              <span>Optimizando para metodologías ágiles</span>
            </div>
          </div>
        </div>
      )}

      {generatedStory && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <div>
                <span className="font-semibold text-lg">Historia generada exitosamente</span>
                <p className="text-sm text-gray-600">Lista para copiar en Azure DevOps</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Copy className="h-4 w-4" />
                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
              </button>
              
              <button
                onClick={downloadAsFile}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Descargar .md</span>
              </button>
              
              <button
                onClick={generateUserStory}
                disabled={generating}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Wand2 className="h-4 w-4" />
                <span>Regenerar</span>
              </button>
            </div>
          </div>

          {/* Vista previa de la historia */}
          <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Vista Previa</h4>
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                Formato Markdown
              </span>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
              {generatedStory}
            </pre>
          </div>

          {/* Información sobre Azure DevOps */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-900 mb-2">
                  Optimizada para Azure DevOps
                </h4>
                <p className="text-blue-800 mb-3">
                  Esta historia de usuario está estructurada siguiendo las mejores prácticas de metodologías ágiles 
                  y optimizada para Azure DevOps Work Items.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-blue-900 mb-2">✅ Incluye:</h5>
                    <ul className="text-blue-800 space-y-1">
                      <li>• Formato estándar "Como... Quiero... Para..."</li>
                      <li>• Criterios de aceptación detallados</li>
                      <li>• Definición de terminado (DoD)</li>
                      <li>• Casos de prueba estructurados</li>
                      <li>• Métricas de éxito</li>
                      <li>• Información del Sprint</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-900 mb-2">🚀 Listo para:</h5>
                    <ul className="text-blue-800 space-y-1">
                      <li>• Importar como Work Item</li>
                      <li>• Asignar a Sprint</li>
                      <li>• Tracking de progreso</li>
                      <li>• Estimación de Story Points</li>
                      <li>• Vinculación con tareas</li>
                      <li>• Reportes de avance</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> Copia el contenido y pégalo directamente en la descripción 
                    de un nuevo Work Item en Azure DevOps. El formato Markdown se renderizará automáticamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStoryGenerator;