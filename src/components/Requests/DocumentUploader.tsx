import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Loader2,
  Download,
  Eye
} from 'lucide-react';
import { documentProcessorService, ProcessedRequestData } from '../../services/documentProcessorService';

interface DocumentUploaderProps {
  onDataProcessed: (data: ProcessedRequestData) => void;
  onClose: () => void;
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

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onDataProcessed, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedRequestData | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validar tipo de archivo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];

    // Validar por extensión si el tipo MIME no es reconocido
    const fileName = file.name.toLowerCase();
    const hasValidExtension = fileName.endsWith('.docx');
    
    if (!validTypes.includes(file.type) && !hasValidExtension) {
      showNotification(
        'error',
        'Tipo de archivo no válido',
        'Por favor, sube un archivo de Word en formato .docx'
      );
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showNotification(
        'error',
        'Archivo muy grande',
        'El archivo no puede ser mayor a 10MB'
      );
      return;
    }

    try {
      setProcessing(true);
      setProcessedData(null);
      setValidationErrors([]);

      // Procesar el documento
      const data = await documentProcessorService.processWordDocument(file);
      
      // Validar los datos procesados
      const validation = documentProcessorService.validateProcessedData(data);
      
      setProcessedData(data);
      setValidationErrors(validation.errors);
      
      if (validation.isValid) {
        showNotification(
          'success',
          'Documento procesado exitosamente',
          'Los datos han sido extraídos correctamente del documento'
        );
      } else {
        showNotification(
          'warning',
          'Documento procesado con advertencias',
          `Se encontraron ${validation.errors.length} campos faltantes que deberás completar manualmente`
        );
      }
      
    } catch (error) {
      console.error('Error processing document:', error);
      showNotification(
        'error',
        'Error al procesar documento',
        error instanceof Error ? error.message : 'No se pudo procesar el documento'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleUseData = () => {
    if (processedData) {
      onDataProcessed(processedData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Notificación */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Cargar Documento de Solicitud
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Sube un documento Word completado para generar automáticamente la solicitud
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {!processedData ? (
            <div className="space-y-6">
              {/* Área de carga */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {processing ? (
                  <div className="space-y-4">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">Procesando documento...</p>
                      <p className="text-sm text-gray-600">Extrayendo información del archivo</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Arrastra tu documento aquí o haz clic para seleccionar
                      </p>
                      <p className="text-sm text-gray-600">
                        Archivos soportados: .docx (máximo 10MB)
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Nota: Las plantillas ahora se descargan en formato .docx
                      </p>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileInput}
                      accept=".docx"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      <FileText className="h-5 w-5" />
                      <span>Seleccionar Archivo</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Instrucciones */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">📋 Instrucciones:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Usa las plantillas descargadas desde Configuración</li>
                  <li>• Completa todos los campos posibles en el documento</li>
                  <li>• El sistema extraerá automáticamente la información</li>
                  <li>• Podrás revisar y editar los datos antes de crear la solicitud</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Resumen de datos procesados */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-900">Documento procesado exitosamente</h4>
                </div>
                <p className="text-sm text-green-800">
                  Se han extraído los siguientes datos del documento:
                </p>
              </div>

              {/* Errores de validación */}
              {validationErrors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-900">Campos faltantes</h4>
                  </div>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-yellow-800 mt-2">
                    Podrás completar estos campos manualmente en el formulario.
                  </p>
                </div>
              )}

              {/* Vista previa de datos */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Datos extraídos</h4>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{showPreview ? 'Ocultar' : 'Ver'} detalles</span>
                  </button>
                </div>
                
                {showPreview && (
                  <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Título:</label>
                        <p className="text-sm text-gray-900">{processedData.title || 'No especificado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Prioridad:</label>
                        <p className="text-sm text-gray-900">{processedData.priority}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Sistema Origen:</label>
                        <p className="text-sm text-gray-900">{processedData.sourceSystem || 'No especificado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Sistema Destino:</label>
                        <p className="text-sm text-gray-900">{processedData.targetSystem || 'No especificado'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Descripción:</label>
                      <p className="text-sm text-gray-900 mt-1">{processedData.description || 'No especificada'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Objetivos de Negocio:</label>
                      <p className="text-sm text-gray-900 mt-1">{processedData.functionalRequirements.businessGoals || 'No especificados'}</p>
                    </div>
                    
                    {processedData.testCases.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Casos de Prueba:</label>
                        <p className="text-sm text-gray-900 mt-1">{processedData.testCases.length} casos encontrados</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => {
                    setProcessedData(null);
                    setValidationErrors([]);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cargar Otro Documento
                </button>
                <button
                  onClick={handleUseData}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Usar Estos Datos</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentUploader;