import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

function DashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">OncoLife</h1>
        <p className="mt-2 text-muted-foreground">Clinician Dashboard</p>
        <p className="mt-4 text-sm text-muted-foreground">
          Patient monitoring and care coordination
        </p>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">404</h1>
        <p className="text-muted-foreground">Page not found</p>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/patients" element={<div>Patients - Coming Soon</div>} />
          <Route path="/patients/:id" element={<div>Patient Detail - Coming Soon</div>} />
          <Route path="/alerts" element={<div>Alerts - Coming Soon</div>} />
          <Route path="/staff" element={<div>Staff - Coming Soon</div>} />
          <Route path="/login" element={<div>Login - Coming Soon</div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

