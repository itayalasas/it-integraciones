import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  CheckCircle,
  BarChart3,
  Settings,
  LogOut,
  GitBranch,
  Wand2,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usersService } from '../../services/usersService';

const Sidebar: React.FC = () => {
  const { logout, currentUser } = useAuth();
  const location = useLocation();

  // Verificar permisos del usuario
  const isAdmin = usersService.isAdmin(currentUser);
  const canApprove = usersService.canApprove(currentUser);
  const canCreateRequests = usersService.canCreateRequests(currentUser);
  const isTechnical = usersService.isTechnical(currentUser);

  // Navegación base para todos los usuarios
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
  ];

  // Agregar opciones según permisos
  const navigation = [
    ...baseNavigation,
    ...(canCreateRequests ? [
      { name: 'Nueva Solicitud', href: '/requests/new', icon: FileText },
      { name: 'Mis Solicitudes', href: '/requests', icon: GitBranch },
    ] : []),
    ...(canApprove ? [
      { name: 'Aprobaciones', href: '/approvals', icon: CheckCircle },
      { name: 'Historias de Usuario', href: '/approved-requests', icon: Wand2 },
    ] : []),
    ...(isTechnical ? [
      { name: 'Técnico', href: '/technical', icon: Settings },
    ] : []),
    ...(isAdmin ? [
      { name: 'Reportes', href: '/reports', icon: BarChart3 },
      { name: 'Configuración', href: '/settings', icon: Settings },
      { name: 'Usuarios', href: '/users', icon: Users },
    ] : [])
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white w-64 fixed left-0 top-0 z-50 flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <GitBranch className="h-8 w-8 text-blue-400" />
          <h1 className="text-xl font-bold">IT Integration Hub</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {currentUser?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{currentUser?.name}</p>
              <p className="text-xs text-gray-400">
                {currentUser?.role ? usersService.getRoleText(currentUser.role) : 'Usuario'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;