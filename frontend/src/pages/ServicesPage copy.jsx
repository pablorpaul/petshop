import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DataTable from '../components/common/DataTable';
import EmptyState from '../components/common/EmptyState';
import FormModal from '../components/common/FormModal';
import InputField from '../components/common/InputField';
import LoadingScreen from '../components/common/LoadingScreen';
import PageHeader from '../components/common/PageHeader';
import SelectField from '../components/common/SelectField';
import StatusBadge from '../components/common/StatusBadge';
import TextareaField from '../components/common/TextareaField';
import { useToast } from '../hooks/useToast';
import { petsService, serviceTypesService, servicesService } from '../services/resourcesService';
import { formatCurrency, formatDateInput, formatDateTime } from '../utils/formatters';
import { getErrorMessage } from '../utils/http';

const emptyForm = { petId: '', serviceTypeId: '', serviceDate: '', chargedAmount: '', notes: '', status: 'scheduled' };

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [pets, setPets] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { success, error: showError } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [servicesData, petsData, typesData] = await Promise.all([
        servicesService.list(),
        petsService.list(),
        serviceTypesService.list(),
      ]);
      setServices(servicesData);
      setPets(petsData);
      setServiceTypes(typesData);
    } catch (error) {
      showError(getErrorMessage(error, 'Nao foi possivel carregar os servicos realizados.'));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return services.filter((item) => {
      const matchesSearch = !term || [item.pet?.name, item.serviceType?.name, item.notes].some((value) => String(value || '').toLowerCase().includes(term));
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, services, statusFilter]);

  const openCreate = () => {
    setCurrentItem(null);
    setErrors({});
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setCurrentItem(item);
    setErrors({});
    setForm({
      petId: String(item.petId || ''),
      serviceTypeId: String(item.serviceTypeId || ''),
      serviceDate: formatDateInput(item.serviceDate),
      chargedAmount: String(item.chargedAmount || ''),
      notes: item.notes || '',
      status: item.status || 'scheduled',
    });
    setModalOpen(true);
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!form.petId) nextErrors.petId = 'Selecione o pet.';
    if (!form.serviceTypeId) nextErrors.serviceTypeId = 'Selecione o tipo de servico.';
    if (!form.serviceDate) nextErrors.serviceDate = 'Informe a data.';
    if (!form.chargedAmount) nextErrors.chargedAmount = 'Informe o valor.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload = {
      petId: Number(form.petId),
      serviceTypeId: Number(form.serviceTypeId),
      serviceDate: new Date(form.serviceDate).toISOString(),
      chargedAmount: Number(form.chargedAmount),
      notes: form.notes,
      status: form.status,
    };

    try {
      setSaving(true);
      if (currentItem) {
        await servicesService.update(currentItem.id, payload);
        success('Servico atualizado com sucesso.');
      } else {
        await servicesService.create(payload);
        success('Servico cadastrado com sucesso.');
      }
      setModalOpen(false);
      setForm(emptyForm);
      await loadData();
    } catch (error) {
      showError(getErrorMessage(error, 'Falha ao salvar servico.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSaving(true);
      await servicesService.remove(deleteTarget.id);
      success('Servico removido com sucesso.');
      setDeleteTarget(null);
      await loadData();
    } catch (error) {
      showError(getErrorMessage(error, 'Falha ao remover servico.'));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'pet', label: 'Pet', render: (item) => item.pet?.name || '-' },
    { key: 'serviceType', label: 'Tipo', render: (item) => item.serviceType?.name || '-' },
    { key: 'serviceDate', label: 'Data', render: (item) => formatDateTime(item.serviceDate) },
    { key: 'chargedAmount', label: 'Valor', render: (item) => formatCurrency(item.chargedAmount) },
    { key: 'status', label: 'Status', render: (item) => <StatusBadge status={item.status} /> },
  ];

  if (loading) {
    return <LoadingScreen message="Carregando servicos realizados..." />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Servicos realizados"
        description="Registre e acompanhe os atendimentos feitos no petshop."
        actions={<Button icon={<Plus size={16} />} onClick={openCreate}>Novo servico</Button>}
      />

      <div className="toolbar-card toolbar-card--split">
        <InputField label="Buscar" placeholder="Pet, tipo de servico ou observacoes" value={search} onChange={(e) => setSearch(e.target.value)} />
        <SelectField label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Todos</option>
          <option value="scheduled">Agendado</option>
          <option value="in_progress">Em andamento</option>
          <option value="completed">Concluido</option>
          <option value="canceled">Cancelado</option>
        </SelectField>
      </div>

      <DataTable
        columns={columns}
        items={filteredItems}
        emptyState={<EmptyState title="Nenhum servico encontrado" description="Cadastre um atendimento para visualizar a agenda e o historico." action={<Button onClick={openCreate}>Cadastrar servico</Button>} />}
        actions={(item) => (
          <>
            <Button size="sm" variant="secondary" icon={<Pencil size={14} />} onClick={() => openEdit(item)}>Editar</Button>
            <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => setDeleteTarget(item)}>Excluir</Button>
          </>
        )}
      />

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={currentItem ? 'Editar servico' : 'Novo servico'} description="Associe um pet, um tipo de servico e as informacoes do atendimento.">
        <form className="form-grid" onSubmit={handleSubmit}>
          <SelectField label="Pet" value={form.petId} error={errors.petId} onChange={(e) => setForm({ ...form, petId: e.target.value })}>
            <option value="">Selecione</option>
            {pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
          </SelectField>
          <SelectField label="Tipo de servico" value={form.serviceTypeId} error={errors.serviceTypeId} onChange={(e) => setForm({ ...form, serviceTypeId: e.target.value })}>
            <option value="">Selecione</option>
            {serviceTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </SelectField>
          <InputField label="Data e hora" type="datetime-local" value={form.serviceDate} error={errors.serviceDate} onChange={(e) => setForm({ ...form, serviceDate: e.target.value })} />
          <InputField label="Valor cobrado" type="number" min="0" step="0.01" value={form.chargedAmount} error={errors.chargedAmount} onChange={(e) => setForm({ ...form, chargedAmount: e.target.value })} />
          <SelectField label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="scheduled">Agendado</option>
            <option value="in_progress">Em andamento</option>
            <option value="completed">Concluido</option>
            <option value="canceled">Cancelado</option>
          </SelectField>
          <div className="form-grid__full">
            <TextareaField label="Observacoes" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="modal__footer form-grid__full">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{currentItem ? 'Salvar alteracoes' : 'Cadastrar servico'}</Button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog open={Boolean(deleteTarget)} title="Excluir servico" description={`Deseja realmente excluir o servico de ${deleteTarget?.pet?.name || 'um pet'}?`} loading={saving} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
