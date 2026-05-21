import  { Outlet, Link, useNavigate } from "react-router-dom";
import { Context } from "express-validator/lib/context";
import { AuthContext } from "../contexts/AuthContext";
import { useContext } from "react";
import "../styles/MainLayout/style.css";

function MainLayout({ children }){
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    function handleLogout(){
        logout();
        navigate('/');
    }

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <h2>PetShop</h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="nav-item">Dashboard</Link>
                    <Link to="/pets" className="nav-item">Pets</Link>
                    <Link to="/owners" className="nav-item">Donos</Link>
                    <Link to="/#" className="nav-item">Serviços</Link>
                    <Link to="/#" className="nav-item">Tipos de Serviços</Link>
                    <Link to="/#" className="nav-item">Usuários</Link>
                </nav>
            </aside>
            
            <main className="main-content">
                <header className="main-header">
                    <div className="user-info">
                        <span>Painel Administrativo</span>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}>
                        Sair
                    </button>
                </header>
                
                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>

    )
}

export default MainLayout