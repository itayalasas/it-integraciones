import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Mail, Lock, Eye, EyeOff, AlertCircle, User, Building, CheckCircle } from 'lucide-react';
import { departmentsService } from '../../services/departmentsService';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const { login, register, firebaseUser } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (firebaseUser) {
      console.log('User already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [firebaseUser, navigate]);

  React.useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      await departmentsService.initializeDefaultDepartments();
      const departmentsList = await departmentsService.getActiveDepartments();
      setDepartments(departmentsList);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || (!isLogin && (!name || !department))) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isLogin) {
        console.log('Attempting login...');
        await login(email, password);
        console.log('Login successful, will redirect automatically');
        // La redirección se maneja en el useEffect de arriba
      } else {
        console.log('Attempting registration...');
        await register(email, password, name, department);
        console.log('Registration successful, switching to login');
        setSuccessMessage('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
        setIsLogin(true);
        setEmail('');
        setPassword('');
        setName('');
        setDepartment('');
      }
    } catch (error: any) {
      console.error(isLogin ? 'Login failed:' : 'Registration failed:', error);
      setError(error.message || (isLogin ? 'Error al iniciar sesión. Verifica tus credenciales.' : 'Error al registrar usuario.'));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
    setName('');
    setDepartment('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <GitBranch className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            IT Integration Hub
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? 'Gestión de solicitudes de integraciones' : 'Crear nueva cuenta'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="space-y-6">
              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        id="name"
                        type="text"
                        required={!isLogin}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Tu nombre completo"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <select
                        id="department"
                        required={!isLogin}
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        disabled={loading}
                      >
                        <option value="">Selecciona tu departamento</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="usuario@empresa.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={isLogin ? "Tu contraseña" : "Mínimo 6 caracteres"}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                    <p className="text-sm text-green-600">{successMessage}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
                  </div>
                ) : (
                  isLogin ? 'Iniciar sesión' : 'Crear cuenta'
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button 
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-500 font-medium"
              disabled={loading}
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>

        {isLogin && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Problemas para acceder?{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                Contacta a IT
              </a>
            </p>
          </div>
        )}

        {/* Updated debug info */}
        <div className="bg-gray-100 p-4 rounded-lg text-xs text-gray-600">
          <p><strong>Para usuarios existentes:</strong></p>
          <p>• Si ya tienes cuenta en Firebase, simplemente inicia sesión</p>
          <p>• El sistema creará automáticamente tu perfil si no existe</p>
          <p><strong>Para nuevos usuarios:</strong></p>
          <p>• Usa "Regístrate aquí" para crear una cuenta nueva</p>
          <p>• Después del registro, inicia sesión con tus credenciales</p>
        </div>
      </div>
    </div>
  );
};

export default Login;