import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastViewport from './components/common/ToastViewport';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
        <ToastViewport />
      </ToastProvider>
    </AuthProvider>
  );
}
