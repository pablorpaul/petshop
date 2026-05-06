import { Menu, PawPrint, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const titles = {
  '/dashboard': 'Dashboard',
  '/owners': 'Donos',
  '/pets': 'Pets',
  '/service-types': 'Tipos de servico',
  '/services': 'Servicos realizados',
};

export default function Header({ onToggleSidebar, onLogout, user }) {
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="app-header__left">
        <button type="button" className="icon-button mobile-nav-button" onClick={onToggleSidebar}>
          <Menu size={20} />
        </button>
        <div>
          <span className="eyebrow">Painel administrativo</span>
          <h2>{titles[location.pathname] || 'Petshop'}</h2>
        </div>
      </div>
      <div className="app-header__right">
        <div className="user-chip">
          <span className="user-chip__avatar"><PawPrint size={16} /></span>
          <div>
            <strong>{user?.name || 'Usuario'}</strong>
            <small>{user?.role === 'admin' ? 'Administrador' : 'Atendente'}</small>
          </div>
        </div>
        <button type="button" className="icon-button" onClick={onLogout} aria-label="Sair">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
