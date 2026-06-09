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
import ArticleDetail from './pages/ArticleDetail';
import ArticleEdit from './pages/ArticleEdit';
import ArticleEssai from './pages/ArticleEssai';
import Essayages from './pages/Essayages';
import EssayageDetail from './pages/EssayageDetail';
import MentionsLegales from './pages/MentionsLegales';
import Confidentialite from './pages/Confidentialite';
import NotFound from './pages/NotFound';

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
            <Route path="/articles/:id/essai" element={<ArticleEssai />} />
            <Route path="/garde-robe" element={<GardeRobe />} />
            <Route path="/ajout" element={<AjoutArticle />} />
            <Route path="/mannequin" element={<Mannequin />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/articles/:id/edit" element={<ArticleEdit />} />
            <Route path="/essayages" element={<ProtectedRoute><Layout><Essayages /></Layout></ProtectedRoute>} />
            <Route path="/essayages/:id" element={<ProtectedRoute><Layout><EssayageDetail /></Layout></ProtectedRoute>} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/confidentialite" element={<Confidentialite />} />
          </Route>

          <Route path="/" element={<Navigate to="/garde-robe" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;