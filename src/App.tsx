import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Report } from './pages/Report';
import { CaseDetail } from './pages/CaseDetail';
import { Chat } from './pages/Chat';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { AuthProvider } from './components/auth/AuthProvider';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
          <Navbar />
          <main className="pt-16 sm:pt-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/report" element={<Report />} />
              <Route path="/case/:id" element={<CaseDetail />} />
              <Route path="/ai-help" element={<Chat />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="bottom-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}
