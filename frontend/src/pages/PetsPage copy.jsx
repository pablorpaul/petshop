import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { ownersService, petsService } from '../services/resourcesService';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { getErrorMessage } from '../utils/http';

const emptyForm = { name: '', species: '', breed: '', size: 'small', age: '', weight: '', notes: '', ownerId: '' };

export default function PetsPage() {
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentPet, setCurrentPet] = useState(null);
  const [detailPet, setDetailPet] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { success, error: showError } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [petsData, ownersData] = await Promise.all([petsService.list(), ownersService.list()]);
      setPets(petsData);
      setOwners(ownersData);
    } catch (error) {
      showError(getErrorMessage(error, 'Nao foi possivel carregar os pets.'));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredPets = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pets;

    return pets.filter((pet) =>
      [pet.name, pet.species, pet.breed, pet.owner?.name].some((value) => String(value || '').toLowerCase().includes(term))
    );
  }, [pets, search]);

  const openCreate = () => {
    setCurrentPet(null);
    setErrors({});
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (pet) => {
    setCurrentPet(pet);
    setErrors({});
    setForm({
      name: pet.name || '',
      species: pet.species || '',
      breed: pet.breed || '',
      size: pet.size || 'small',
      age: String(pet.age || ''),
      weight: String(pet.weight || ''),
      notes: pet.notes || '',
      ownerId: String(pet.ownerId || ''),
    });
    setModalOpen(true);
  };

  const openDetails = async (pet) => {
    try {
      const detailed = await petsService.getById(pet.id);
      setDetailPet(detailed);
      setDetailsOpen(true);
    } catch (error) {
      showError(getErrorMessage(error, 'Nao foi possivel carregar os detalhes do pet.'));
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Informe o nome.';
    if (!form.species.trim()) nextErrors.species = 'Informe a especie.';
    if (!form.breed.trim()) nextErrors.breed = 'Informe a raca.';
    if (!form.ownerId) nextErrors.ownerId = 'Selecione o dono.';
    if (!form.age) nextErrors.age = 'Informe a idade.';
    if (!form.weight) nextErrors.weight = 'Informe o peso.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...form,
      age: Number(form.age),
      weight: Number(form.weight),
      ownerId: Number(form.ownerId),
    };

    try {
      setSaving(true);
      if (currentPet) {
        await petsService.update(currentPet.id, payload);
        success('Pet atualizado com sucesso.');
      } else {
        await petsService.create(payload);
        success('Pet cadastrado com sucesso.');
      }
      setModalOpen(false);
      setForm(emptyForm);
      await loadData();
    } catch (error) {
      showError(getErrorMessage(error, 'Falha ao salvar pet.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSaving(true);
      await petsService.remove(deleteTarget.id);
      success('Pet removido com sucesso.');
      setDeleteTarget(null);
      await loadData();
    } catch (error) {
      showError(getErrorMessage(error, 'Falha ao remover pet.'));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'species', label: 'Especie' },
    { key: 'breed', label: 'Raca' },
    { key: 'size', label: 'Porte', render: (pet) => pet.size },
    { key: 'owner', label: 'Dono', render: (pet) => pet.owner?.name || '-' },
  ];

  if (loading) {
    return <LoadingScreen message="Carregando pets..." />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Pets"
        description="Cadastre e acompanhe os animais atendidos pelo petshop."
        actions={<Button icon={<Plus size={16} />} onClick={openCreate}>Novo pet</Button>}
      />

      <div className="toolbar-card">
        <InputField
          label="Buscar"
          placeholder="Nome do pet, especie, raca ou dono"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        items={filteredPets}
        emptyState={<EmptyState title="Nenhum pet encontrado" description="Cadastre um pet para comecar a operacao." action={<Button onClick={openCreate}>Cadastrar pet</Button>} />}
        actions={(pet) => (
          <>
            <Button size="sm" variant="ghost" icon={<Eye size={14} />} onClick={() => openDetails(pet)}>Detalhes</Button>
            <Button size="sm" variant="secondary" icon={<Pencil size={14} />} onClick={() => openEdit(pet)}>Editar</Button>
            <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => setDeleteTarget(pet)}>Excluir</Button>
          </>
        )}
      />

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={currentPet ? 'Editar pet' : 'Novo pet'} description="Preencha os dados do animal.">
        <form className="form-grid" onSubmit={handleSubmit}>
          <InputField label="Nome" value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <InputField label="Especie" value={form.species} error={errors.species} onChange={(e) => setForm({ ...form, species: e.target.value })} />
          <InputField label="Raca" value={form.breed} error={errors.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
          <SelectField label="Porte" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>
            <option value="small">Pequeno</option>
            <option value="medium">Medio</option>
            <option value="large">Grande</option>
          </SelectField>
          <InputField label="Idade" type="number" min="0" value={form.age} error={errors.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          <InputField label="Peso (kg)" type="number" min="0" step="0.1" value={form.weight} error={errors.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          <SelectField label="Dono" value={form.ownerId} error={errors.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })}>
            <option value="">Selecione</option>
            {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
          </SelectField>
          <div className="form-grid__full">
            <TextareaField label="Observacoes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="modal__footer form-grid__full">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{currentPet ? 'Salvar alteracoes' : 'Cadastrar pet'}</Button>
          </div>
        </form>
      </FormModal>

      <FormModal open={detailsOpen} onClose={() => setDetailsOpen(false)} title="Detalhes do pet">
        {detailPet ? (
          <div className="details-stack">
            <div className="details-grid">
              <div><span>Nome</span><strong>{detailPet.name}</strong></div>
              <div><span>Dono</span><strong>{detailPet.owner?.name || '-'}</strong></div>
              <div><span>Especie</span><strong>{detailPet.species}</strong></div>
              <div><span>Raca</span><strong>{detailPet.breed}</strong></div>
              <div><span>Porte</span><strong>{detailPet.size}</strong></div>
              <div><span>Peso</span><strong>{detailPet.weight} kg</strong></div>
            </div>
            <div>
              <span className="details-label">Observacoes</span>
              <p>{detailPet.notes || 'Sem observacoes.'}</p>
            </div>
            <div>
              <span className="details-label">Historico recente</span>
              {detailPet.services?.length ? (
                <div className="activity-list compact">
                  {detailPet.services.slice(0, 4).map((service) => (
                    <article key={service.id} className="activity-item">
                      <div>
                        <strong>{service.serviceType?.name || 'Servico'}</strong>
                        <span>{formatDateTime(service.serviceDate)} • {formatCurrency(service.chargedAmount)}</span>
                      </div>
                      <StatusBadge status={service.status} />
                    </article>
                  ))}
                </div>
              ) : (
                <p>Nenhum atendimento registrado.</p>
              )}
            </div>
          </div>
        ) : null}
      </FormModal>

      <ConfirmDialog open={Boolean(deleteTarget)} title="Excluir pet" description={`Tem certeza que deseja excluir ${deleteTarget?.name || 'este pet'}?`} loading={saving} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
