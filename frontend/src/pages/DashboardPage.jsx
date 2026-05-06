import { useEffect, useState } from 'react';
import { ClipboardList, PawPrint, Scissors, Users } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import LoadingScreen from '../components/common/LoadingScreen';
import EmptyState from '../components/common/EmptyState';
import { ownersService, petsService, serviceTypesService, servicesService } from '../services/resourcesService';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { getErrorMessage } from '../utils/http';
import { useToast } from '../hooks/useToast';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ owners: 0, pets: 0, serviceTypes: 0, services: 0, recent: [] });
  const toast = useToast();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [owners, pets, serviceTypes, services] = await Promise.all([
          ownersService.list(),
          petsService.list(),
          serviceTypesService.list(),
          servicesService.list(),
        ]);

        setStats({
          owners: owners.length,
          pets: pets.length,
          serviceTypes: serviceTypes.length,
          services: services.length,
          recent: services.slice(0, 5),
          completed: services.filter((item) => item.status === 'completed').length,
        });
      } catch (error) {
        toast.error(getErrorMessage(error, 'Nao foi possivel carregar a dashboard.'));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingScreen message="Carregando indicadores..." />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard"
        description="Acompanhe rapidamente o panorama operacional do petshop."
      />

      <section className="stats-grid">
        <StatCard title="Donos cadastrados" value={stats.owners} icon={<Users size={20} />} />
        <StatCard title="Pets ativos" value={stats.pets} icon={<PawPrint size={20} />} />
        <StatCard title="Tipos de servico" value={stats.serviceTypes} icon={<Scissors size={20} />} />
        <StatCard
          title="Atendimentos registrados"
          value={stats.services}
          icon={<ClipboardList size={20} />}
          trend={`${stats.completed} concluidos`}
        />
      </section>

      <section className="dashboard-grid">
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h2>Ultimos servicos</h2>
              <p>Visao resumida das movimentacoes mais recentes.</p>
            </div>
          </div>

          {stats.recent.length ? (
            <div className="activity-list">
              {stats.recent.map((service) => (
                <article key={service.id} className="activity-item">
                  <div>
                    <strong>{service.pet?.name || 'Pet nao informado'}</strong>
                    <span>{service.serviceType?.name || 'Tipo de servico'} • {formatDateTime(service.serviceDate)}</span>
                  </div>
                  <div className="activity-item__meta">
                    <StatusBadge status={service.status} />
                    <strong>{formatCurrency(service.chargedAmount)}</strong>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem movimentacoes" description="Cadastre um servico realizado para visualizar atividades recentes." />
          )}
        </article>

        <article className="panel-card panel-card--accent">
          <div className="panel-card__header">
            <div>
              <h2>Indicadores rapidos</h2>
              <p>Resumo util para acompanhamento diario.</p>
            </div>
          </div>

          <div className="summary-list">
            <div>
              <span>Taxa de conclusao</span>
              <strong>{stats.services ? Math.round((stats.completed / stats.services) * 100) : 0}%</strong>
            </div>
            <div>
              <span>Media de pets por dono</span>
              <strong>{stats.owners ? (stats.pets / stats.owners).toFixed(1) : '0.0'}</strong>
            </div>
            <div>
              <span>Catalogo ativo</span>
              <strong>{stats.serviceTypes} servicos</strong>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
