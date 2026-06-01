import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import NewListings from './pages/NewListings';
import Companies from './pages/Companies';
import CompanyJobs from './pages/CompanyJobs';
import About from './pages/About';
import Contact from './pages/Contact';
import Job from './pages/Job';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/theme.css';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Pipelines from './pages/admin/Pipelines';
import CompaniesAdmin from './pages/admin/CompaniesAdmin';
import LinksAdmin from './pages/admin/LinksAdmin';
import './styles/App.css';

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Job />} />
            <Route path="/new-listings" element={<NewListings />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/company-jobs" element={<CompanyJobs />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="pipelines" element={<Pipelines />} />
              <Route path="companies" element={<CompaniesAdmin />} />
              <Route path="links" element={<LinksAdmin />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}
