import { LayoutDashboard, Users, PawPrint, Scissors, ClipboardList, X, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/owners', label: 'Donos', icon: Users },
  { to: '/pets', label: 'Pets', icon: PawPrint },
  { to: '/service-types', label: 'Tipos de servico', icon: Scissors },
  { to: '/services', label: 'Servicos realizados', icon: ClipboardList },
];

export default function Sidebar({ open, onClose, onLogout }) {
  return (
    <>
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <div>
            <span className="eyebrow">Petshop</span>
            <strong>Care Admin</strong>
          </div>
          <button type="button" className="icon-button sidebar__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button type="button" className="sidebar__logout" onClick={onLogout}>
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </aside>
      {open ? <button type="button" className="sidebar-backdrop" onClick={onClose} aria-label="Fechar menu" /> : null}
    </>
  );
}
