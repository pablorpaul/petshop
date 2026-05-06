import { Link } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <span className="auth-icon"><SearchX size={20} /></span>
        <h1>Pagina nao encontrada</h1>
        <p>A rota solicitada nao existe ou pode ter sido movida.</p>
        <Link to="/dashboard">
          <Button icon={<ArrowLeft size={16} />}>Voltar ao painel</Button>
        </Link>
      </div>
    </div>
  );
}
