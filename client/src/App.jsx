import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import GardeRobe from './pages/GardeRobe';
import AjoutArticle from './pages/AjoutArticle';
import Mannequin from './pages/Mannequin';
import Profil from './pages/Profil';

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/garde-robe" element={<GardeRobe />} />
            <Route path="/ajout" element={<AjoutArticle />} />
            <Route path="/mannequin" element={<Mannequin />} />
            <Route path="/profil" element={<Profil />} />
          </Route>

          <Route path="/" element={<Navigate to="/garde-robe" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;