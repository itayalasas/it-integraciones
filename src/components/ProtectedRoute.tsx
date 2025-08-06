import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GitBranch } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading, firebaseUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <GitBranch className="h-12 w-12 text-blue-600 animate-pulse" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  console.log('ProtectedRoute - currentUser:', currentUser);
  console.log('ProtectedRoute - firebaseUser:', firebaseUser);
  console.log('ProtectedRoute - location:', location.pathname);

  // Si no hay usuario autenticado, redirigir al login
  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario autenticado, mostrar el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;