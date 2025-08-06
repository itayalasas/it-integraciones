import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Database,
  Cloud,
  Server,
  Zap,
  Users,
  Building,
  UserCheck,
  UserX,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Download, FileText } from 'lucide-react';
import { System } from '../../types';
import { systemsService } from '../../services/systemsService';
import { departmentsService } from '../../services/departmentsService';
import { usersService } from '../../services/usersService';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { wordTemplateService } from '../../services/wordTemplateService';

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

const Settings: React.FC = () => {
  const [systems, setSystems] = useState<System[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSystem, setEditingSystem] = useState<System | null>(null);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'internal' as System['type'],
    technology: '',
    owner: ''
  });
  const [departmentFormData, setDepartmentFormData] = useState({
    name: '',
    description: ''
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const { currentUser } = useAuth();

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Verificar si el usuario es administrador
  const isAdmin = usersService.isAdmin(currentUser);

  useEffect(() => {
    loadSystems();
    loadDepartments();
  }, []);

  const loadSystems = async () => {
    try {
      setLoading(true);
      await systemsService.initializeDefaultSystems();
      const systemsList = await systemsService.getSystems();
      setSystems(systemsList);
    } catch (error) {
      console.error('Error loading systems:', error);
      showNotification(
        'error',
        'Error al cargar sistemas',
        'No se pudieron cargar los sistemas. Intenta recargar la página.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      // Limpiar duplicados antes de cargar
      await departmentsService.cleanupDuplicateDepartments();
      await departmentsService.initializeDefaultDepartments();
      const departmentsList = await departmentsService.getDepartments();
      setDepartments(departmentsList);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSystem) {
        await systemsService.updateSystem(editingSystem.id, formData);
      } else {
        await systemsService.createSystem(formData);
      }
      
      await loadSystems();
      resetForm();
      showNotification(
        'success',
        editingSystem ? 'Sistema actualizado' : 'Sistema creado',
        `El sistema ${formData.name} ha sido ${editingSystem ? 'actualizado' : 'creado'} exitosamente.`
      );
    } catch (error) {
      console.error('Error saving system:', error);
      showNotification(
        'error',
        'Error al guardar sistema',
        'Hubo un problema al guardar el sistema. Intenta nuevamente.'
      );
    }
  };

  const handleEdit = (system: System) => {
    setEditingSystem(system);
    setFormData({
      name: system.name,
      description: system.description,
      type: system.type,
      technology: system.technology,
      owner: system.owner
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este sistema?')) {
      try {
        await systemsService.deleteSystem(id);
        await loadSystems();
        showNotification(
          'success',
          'Sistema eliminado',
          'El sistema ha sido eliminado exitosamente.'
        );
      } catch (error) {
        console.error('Error deleting system:', error);
        showNotification(
          'error',
          'Error al eliminar sistema',
          'No se pudo eliminar el sistema. Intenta nuevamente.'
        );
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'internal',
      technology: '',
      owner: ''
    });
    setEditingSystem(null);
    setShowForm(false);
  };

  const handleDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDepartment) {
        await departmentsService.updateDepartment(editingDepartment.id, departmentFormData);
      } else {
        await departmentsService.createDepartment({
          ...departmentFormData,
          isActive: true
        });
      }
      
      await loadDepartments();
      resetDepartmentForm();
      showNotification(
        'success',
        editingDepartment ? 'Departamento actualizado' : 'Departamento creado',
        `El departamento ${departmentFormData.name} ha sido ${editingDepartment ? 'actualizado' : 'creado'} exitosamente.`
      );
    } catch (error) {
      console.error('Error saving department:', error);
      showNotification(
        'error',
        'Error al guardar departamento',
        'Hubo un problema al guardar el departamento. Intenta nuevamente.'
      );
    }
  };

  const handleEditDepartment = (department: any) => {
    setEditingDepartment(department);
    setDepartmentFormData({
      name: department.name,
      description: department.description
    });
    setShowDepartmentForm(true);
  };

  const handleToggleDepartmentStatus = async (department: any) => {
    const action = department.isActive ? 'desactivar' : 'activar';
    if (confirm(`¿Estás seguro de que quieres ${action} el departamento "${department.name}"?`)) {
      try {
        if (department.isActive) {
          await departmentsService.deactivateDepartment(department.id);
        } else {
          await departmentsService.activateDepartment(department.id);
        }
        await loadDepartments();
        showNotification(
          'success',
          `Departamento ${action === 'desactivar' ? 'desactivado' : 'activado'}`,
          `El departamento ${department.name} ha sido ${action === 'desactivar' ? 'desactivado' : 'activado'} exitosamente.`
        );
      } catch (error) {
        console.error(`Error ${action} department:`, error);
        showNotification(
          'error',
          `Error al ${action} departamento`,
          `No se pudo ${action} el departamento. Intenta nuevamente.`
        );
      }
    }
  };

  const handleToggleSystemStatus = async (system: System) => {
    const action = system.isActive ? 'desactivar' : 'activar';
    if (confirm(`¿Estás seguro de que quieres ${action} el sistema "${system.name}"?`)) {
      try {
        if (system.isActive) {
          await systemsService.deactivateSystem(system.id);
        } else {
          await systemsService.activateSystem(system.id);
        }
        await loadSystems();
        showNotification(
          'success',
          `Sistema ${action === 'desactivar' ? 'desactivado' : 'activado'}`,
          `El sistema ${system.name} ha sido ${action === 'desactivar' ? 'desactivado' : 'activado'} exitosamente.`
        );
      } catch (error) {
        console.error(`Error ${action} system:`, error);
        showNotification(
          'error',
          `Error al ${action} sistema`,
          `No se pudo ${action} el sistema. Intenta nuevamente.`
        );
      }
    }
  };

  const resetDepartmentForm = () => {
    setDepartmentFormData({
      name: '',
      description: ''
    });
    setEditingDepartment(null);
    setShowDepartmentForm(false);
  };

  const handleDownloadTemplate = async (simple: boolean = false) => {
    setDownloadingTemplate(true);
    try {
      if (simple) {
        await wordTemplateService.generateSimpleTemplate();
        showNotification(
          'success',
          'Plantilla descargada',
          'La plantilla simplificada ha sido descargada exitosamente en formato .doc'
        );
      } else {
        await wordTemplateService.generateTemplate();
        showNotification(
          'success',
          'Plantilla descargada',
          'La plantilla completa ha sido descargada exitosamente en formato .doc'
        );
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      showNotification(
        'error',
        'Error al descargar plantilla',
        'No se pudo descargar la plantilla. Intenta nuevamente.'
      );
    } finally {
      setDownloadingTemplate(false);
    }
  };
  const getSystemIcon = (type: string) => {
    switch (type) {
      case 'cloud': return Cloud;
      case 'legacy': return Database;
      case 'external': return Zap;
      default: return Server;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cloud': return 'bg-blue-100 text-blue-800';
      case 'legacy': return 'bg-orange-100 text-orange-800';
      case 'external': return 'bg-purple-100 text-purple-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Settings className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Acceso Denegado</p>
        <p className="text-sm text-gray-500">
          No tienes permisos para acceder a la configuración del sistema
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Notificación */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">
            Configuración del sistema y gestión de recursos
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/users"
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Users className="h-4 w-4" />
            <span>Gestión de Usuarios</span>
          </Link>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Sistema</span>
          </button>
        </div>
      </div>

      {/* Sección de Plantillas de Word */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-green-600" />
              Plantillas de Solicitud
            </h2>
            <p className="text-gray-600 mt-1">
              Descarga plantillas en formato Word para que los usuarios puedan completar solicitudes offline
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleDownloadTemplate(true)}
              disabled={downloadingTemplate}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{downloadingTemplate ? 'Descargando...' : 'Plantilla Simplificada'}</span>
            </button>
            <button
              onClick={() => handleDownloadTemplate(false)}
              disabled={downloadingTemplate}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{downloadingTemplate ? 'Descargando...' : 'Plantilla Completa'}</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">📄 Plantilla Simplificada</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Campos básicos esenciales</li>
              <li>• Formato compacto (1-2 páginas)</li>
              <li>• Ideal para integraciones simples</li>
              <li>• Fácil de completar</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">📋 Plantilla Completa</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Todos los campos del sistema</li>
              <li>• Requerimientos técnicos detallados</li>
              <li>• Casos de prueba incluidos</li>
              <li>• Formato profesional completo</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>💡 Uso recomendado:</strong> Las plantillas se descargan en formato .doc para máxima compatibilidad. 
            Después de completarlas, <strong>debes guardarlas como .docx</strong> (Archivo → Guardar como → Formato: .docx) 
            antes de subirlas al sistema. Solo se aceptan archivos .docx para el procesamiento automático.
          </p>
        </div>
      </div>
      {/* Sección de Gestión de Usuarios */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="h-6 w-6 mr-2 text-purple-600" />
              Gestión de Usuarios
            </h2>
            <p className="text-gray-600 mt-1">
              Administra usuarios, roles y permisos del sistema
            </p>
          </div>
          <Link
            to="/users"
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Users className="h-4 w-4" />
            <span>Gestionar Usuarios</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-medium text-purple-900 mb-2">Roles Disponibles</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• <strong>Administrador:</strong> Acceso completo</li>
              <li>• <strong>Aprobador:</strong> Puede aprobar solicitudes</li>
              <li>• <strong>Solicitante:</strong> Puede crear solicitudes</li>
              <li>• <strong>Visualizador:</strong> Solo lectura</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Permisos por Rol</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Dashboard personalizado por rol</li>
              <li>• Navegación adaptativa</li>
              <li>• Acceso controlado a funciones</li>
              <li>• Gestión de usuarios (solo admin)</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">Seguridad</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Autenticación Firebase</li>
              <li>• Validación de permisos</li>
              <li>• Activación/desactivación de usuarios</li>
              <li>• Auditoría de acciones</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingSystem ? 'Editar Sistema' : 'Nuevo Sistema'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Sistema *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: SAP ERP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Sistema *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as System['type'] })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="internal">Interno</option>
                  <option value="external">Externo</option>
                  <option value="cloud">Nube</option>
                  <option value="legacy">Legacy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tecnología *
                </label>
                <input
                  type="text"
                  required
                  value={formData.technology}
                  onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Java, .NET, SAP, Oracle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Propietario *
                </label>
                <select
                  required
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona un departamento</option>
                  {departments.filter(d => d.isActive).map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe la función principal del sistema..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{editingSystem ? 'Actualizar' : 'Crear'} Sistema</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Formulario de Departamentos */}
      {showDepartmentForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingDepartment ? 'Editar Departamento' : 'Nuevo Departamento'}
            </h2>
            <button
              onClick={resetDepartmentForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleDepartmentSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Departamento *
                </label>
                <input
                  type="text"
                  required
                  value={departmentFormData.name}
                  onChange={(e) => setDepartmentFormData({ ...departmentFormData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Recursos Humanos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <input
                  type="text"
                  required
                  value={departmentFormData.description}
                  onChange={(e) => setDepartmentFormData({ ...departmentFormData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Gestión de personal y nóminas"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={resetDepartmentForm}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{editingDepartment ? 'Actualizar' : 'Crear'} Departamento</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gestión de Departamentos */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Building className="h-6 w-6 mr-2 text-green-600" />
              Departamentos
            </h2>
            <button
              onClick={() => setShowDepartmentForm(true)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Departamento</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {departments.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay departamentos registrados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((department) => (
                <div key={department.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Building className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{department.name}</h3>
                        <p className="text-sm text-gray-600">{department.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditDepartment(department)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Editar departamento"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleDepartmentStatus(department)}
                        className={`p-1 ${department.isActive ? 'text-gray-400 hover:text-red-600' : 'text-gray-400 hover:text-green-600'}`}
                        title={department.isActive ? 'Desactivar departamento' : 'Activar departamento'}
                      >
                        {department.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`¿Estás seguro de que quieres eliminar permanentemente el departamento "${department.name}"?`)) {
                            try {
                              await departmentsService.deleteDepartment(department.id);
                              await loadDepartments();
                              showNotification(
                                'success',
                                'Departamento eliminado',
                                `El departamento ${department.name} ha sido eliminado exitosamente.`
                              );
                            } catch (error) {
                              console.error('Error deleting department:', error);
                              showNotification(
                                'error',
                                'Error al eliminar departamento',
                                'No se pudo eliminar el departamento. Intenta nuevamente.'
                              );
                            }
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Eliminar departamento permanentemente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      department.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {department.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lista de Sistemas */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Sistemas Registrados</h2>
        </div>
        
        <div className="p-6">
          {systems.length === 0 ? (
            <div className="text-center py-8">
              <SettingsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay sistemas registrados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systems.map((system) => {
                const Icon = getSystemIcon(system.type);
                return (
                  <div key={system.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{system.name}</h3>
                          <p className="text-sm text-gray-600">{system.technology}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEdit(system)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Editar sistema"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleSystemStatus(system)}
                          className={`p-1 ${system.isActive ? 'text-gray-400 hover:text-red-600' : 'text-gray-400 hover:text-green-600'}`}
                          title={system.isActive ? 'Desactivar sistema' : 'Activar sistema'}
                        >
                          {system.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(system.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Eliminar sistema permanentemente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{system.description}</p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(system.type)}`}>
                        {system.type}
                      </span>
                      <span className="text-xs text-gray-500">{system.owner}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        system.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {system.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            Inactivo
                          </>
                        )}
                      </span>
                      {system.updatedAt && (
                        <span className="text-xs text-gray-400">
                          Actualizado: {system.updatedAt.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;