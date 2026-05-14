import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ClassRoom } from './pages/ClassRoom';
import { LandingPage } from './pages/LandingPage';
import { Verify } from './pages/Verify';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<LandingPage />} /> {/* <-- 2. LA NUEVA RUTA PRINCIPAL */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clases/:clase_id" element={<ClassRoom />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} /> {/* <-- 3. REDIRIGE AL INICIO SI HAY ERROR */}
      
        <Route path="/verificar" element={<Verify />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
