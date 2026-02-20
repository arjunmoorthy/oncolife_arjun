import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">OncoLife</h1>
        <p className="mt-2 text-muted-foreground">Patient Portal</p>
        <p className="mt-4 text-sm text-muted-foreground">
          Your AI-powered symptom management companion
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
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<div>Chat - Coming Soon</div>} />
          <Route path="/diary" element={<div>Diary - Coming Soon</div>} />
          <Route path="/education" element={<div>Education - Coming Soon</div>} />
          <Route path="/profile" element={<div>Profile - Coming Soon</div>} />
          <Route path="/login" element={<div>Login - Coming Soon</div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

