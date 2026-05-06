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
import TextareaField from '../components/common/TextareaField';
import { useToast } from '../hooks/useToast';
import { ownersService } from '../services/resourcesService';
import { getErrorMessage } from '../utils/http';

const emptyForm = { name: '', document: '', phone: '', email: '', address: '' };

export default function OwnersPage() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentOwner, setCurrentOwner] = useState(null);
  const [detailOwner, setDetailOwner] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { success, error: showError } = useToast();

  const loadOwners = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ownersService.list();
      setOwners(data);
    } catch (error) {
      showError(getErrorMessage(error, 'Nao foi possivel carregar os donos.'));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadOwners();
  }, [loadOwners]);

  const filteredOwners = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return owners;

    return owners.filter((owner) =>
      [owner.name, owner.document, owner.email, owner.phone].some((value) => String(value || '').toLowerCase().includes(term))
    );
  }, [owners, search]);

  const openCreate = () => {
    setCurrentOwner(null);
    setErrors({});
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (owner) => {
    setCurrentOwner(owner);
    setErrors({});
    setForm({
      name: owner.name || '',
      document: owner.document || '',
      phone: owner.phone || '',
      email: owner.email || '',
      address: owner.address || '',
    });
    setModalOpen(true);
  };

  const openDetails = async (owner) => {
    try {
      const detailed = await ownersService.getById(owner.id);
      setDetailOwner(detailed);
      setDetailsOpen(true);
    } catch (error) {
      showError(getErrorMessage(error, 'Nao foi possivel carregar os detalhes do dono.'));
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Informe o nome.';
    if (!form.document.trim()) nextErrors.document = 'Informe o documento.';
    if (!form.phone.trim()) nextErrors.phone = 'Informe o telefone.';
    if (!form.email.trim()) nextErrors.email = 'Informe o email.';
    if (!form.address.trim()) nextErrors.address = 'Informe o endereco.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      if (currentOwner) {
        await ownersService.update(currentOwner.id, form);
        success('Dono atualizado com sucesso.');
      } else {
        await ownersService.create(form);
        success('Dono criado com sucesso.');
      }
      setModalOpen(false);
      setForm(emptyForm);
      await loadOwners();
    } catch (error) {
      showError(getErrorMessage(error, 'Falha ao salvar dono.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSaving(true);
      await ownersService.remove(deleteTarget.id);
      success('Dono removido com sucesso.');
      setDeleteTarget(null);
      await loadOwners();
    } catch (error) {
      showError(getErrorMessage(error, 'Falha ao remover dono.'));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'document', label: 'Documento' },
    { key: 'phone', label: 'Telefone' },
    { key: 'email', label: 'Email' },
  ];

  if (loading) {
    return <LoadingScreen message="Carregando donos..." />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Donos"
        description="Gerencie os responsaveis pelos pets cadastrados."
        actions={<Button icon={<Plus size={16} />} onClick={openCreate}>Novo dono</Button>}
      />

      <div className="toolbar-card">
        <InputField
          label="Buscar"
          placeholder="Nome, documento, email ou telefone"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        items={filteredOwners}
        emptyState={
          <EmptyState
            title="Nenhum dono encontrado"
            description="Cadastre o primeiro responsavel para iniciar o uso do sistema."
            action={<Button onClick={openCreate}>Cadastrar dono</Button>}
          />
        }
        actions={(owner) => (
          <>
            <Button size="sm" variant="ghost" icon={<Eye size={14} />} onClick={() => openDetails(owner)}>Detalhes</Button>
            <Button size="sm" variant="secondary" icon={<Pencil size={14} />} onClick={() => openEdit(owner)}>Editar</Button>
            <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => setDeleteTarget(owner)}>Excluir</Button>
          </>
        )}
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentOwner ? 'Editar dono' : 'Novo dono'}
        description="Preencha os dados principais do responsavel."
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <InputField label="Nome" value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <InputField label="Documento" value={form.document} error={errors.document} onChange={(e) => setForm({ ...form, document: e.target.value })} />
          <InputField label="Telefone" value={form.phone} error={errors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <InputField label="Email" type="email" value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="form-grid__full">
            <TextareaField label="Endereco" rows={3} value={form.address} error={errors.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="modal__footer form-grid__full">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{currentOwner ? 'Salvar alteracoes' : 'Cadastrar dono'}</Button>
          </div>
        </form>
      </FormModal>

      <FormModal open={detailsOpen} onClose={() => setDetailsOpen(false)} title="Detalhes do dono">
        {detailOwner ? (
          <div className="details-stack">
            <div className="details-grid">
              <div><span>Nome</span><strong>{detailOwner.name}</strong></div>
              <div><span>Documento</span><strong>{detailOwner.document}</strong></div>
              <div><span>Telefone</span><strong>{detailOwner.phone}</strong></div>
              <div><span>Email</span><strong>{detailOwner.email}</strong></div>
            </div>
            <div>
              <span className="details-label">Endereco</span>
              <p>{detailOwner.address}</p>
            </div>
            <div>
              <span className="details-label">Pets vinculados</span>
              {detailOwner.pets?.length ? (
                <div className="chip-list">
                  {detailOwner.pets.map((pet) => <span key={pet.id} className="chip">{pet.name}</span>)}
                </div>
              ) : (
                <p>Nenhum pet vinculado.</p>
              )}
            </div>
          </div>
        ) : null}
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir dono"
        description={`Tem certeza que deseja excluir ${deleteTarget?.name || 'este dono'}?`}
        loading={saving}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
