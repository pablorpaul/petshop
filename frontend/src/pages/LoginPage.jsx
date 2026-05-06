import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../utils/http';
import LoadingScreen from '../components/common/LoadingScreen';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, bootstrapping } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = useMemo(() => location.state?.from?.pathname || '/dashboard', [location.state]);

  if (bootstrapping) {
    return <LoadingScreen fullscreen message="Validando acesso..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) nextErrors.email = 'Informe o email.';
    if (!form.password.trim()) nextErrors.password = 'Informe a senha.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      await login(form);
      toast.success('Login realizado com sucesso.');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Falha ao autenticar.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-panel login-panel--hero">
        <span className="eyebrow">Petshop Care Admin</span>
        <h1>Gerencie atendimentos, pets e clientes em um painel moderno.</h1>
        <p>
          Controle o fluxo do petshop com uma interface administrativa clara, responsiva e preparada para o dia a dia.
        </p>

        <div className="login-highlights">
          <article>
            <ShieldCheck size={18} />
            <div>
              <strong>Acesso protegido</strong>
              <span>Autenticacao com JWT e sessao persistida.</span>
            </div>
          </article>
          <article>
            <Sparkles size={18} />
            <div>
              <strong>Operacao simplificada</strong>
              <span>Cadastros, servicos e dashboard em uma unica experiencia.</span>
            </div>
          </article>
        </div>
      </section>

      <section className="login-panel login-panel--form">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card__header">
            <span className="auth-icon"><LogIn size={20} /></span>
            <div>
              <h2>Entrar no sistema</h2>
              <p>Use as credenciais do backend para acessar o painel.</p>
            </div>
          </div>

          <InputField
            label="Email"
            type="email"
            placeholder="admin@petshop.local"
            value={form.email}
            onChange={handleChange('email')}
            error={errors.email}
          />

          <InputField
            label="Senha"
            type="password"
            placeholder="Digite sua senha"
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password}
            hint="Credencial seed padrao: admin@petshop.local / admin123"
          />

          <Button type="submit" fullWidth loading={loading} icon={<LogIn size={16} />}>
            Acessar painel
          </Button>
        </form>
      </section>
    </div>
  );
}
