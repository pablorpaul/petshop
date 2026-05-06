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
import TextareaField from '../components/common/TextareaField';
import { useToast } from '../hooks/useToast';
import { serviceTypesService } from '../services/resourcesService';
import { formatCurrency } from '../utils/formatters';
import { getErrorMessage } from '../utils/http';

const emptyForm = { name: '', description: '', basePrice: '' };

export default function ServiceTypesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { success, error: showError } = useToast();

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await serviceTypesService.list();
      setItems(data);
    } catch (error) {
      showError(getErrorMessage(error, 'Nao foi possivel carregar os tipos de servico.'));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => [item.name, item.description].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [items, search]);

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
      name: item.name || '',
      description: item.description || '',
      basePrice: String(item.basePrice || ''),
    });
    setModalOpen(true);
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Informe o nome.';
    if (!form.basePrice) nextErrors.basePrice = 'Informe o preco base.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: form.name,
      description: form.description,
      basePrice: Number(form.basePrice),
    };

    try {
      setSaving(true);
      if (currentItem) {
        await serviceTypesService.update(currentItem.id, payload);
        success('Tipo de servico atualizado com sucesso.');
      } else {
        await serviceTypesService.create(payload);
        success('Tipo de servico criado com sucesso.');
      }
      setModalOpen(false);
      setForm(emptyForm);
      await loadItems();
    } catch (error) {
      showError(getErrorMessage(error, 'Falha ao salvar tipo de servico.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSaving(true);
      await serviceTypesService.remove(deleteTarget.id);
      success('Tipo de servico removido com sucesso.');
      setDeleteTarget(null);
      await loadItems();
    } catch (error) {
      showError(getErrorMessage(error, 'Falha ao remover tipo de servico.'));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'description', label: 'Descricao', render: (item) => item.description || '-' },
    { key: 'basePrice', label: 'Preco base', render: (item) => formatCurrency(item.basePrice) },
  ];

  if (loading) {
    return <LoadingScreen message="Carregando tipos de servico..." />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Tipos de servico"
        description="Mantenha o catalogo de servicos do petshop atualizado."
        actions={<Button icon={<Plus size={16} />} onClick={openCreate}>Novo tipo</Button>}
      />

      <div className="toolbar-card">
        <InputField label="Buscar" placeholder="Nome ou descricao" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <DataTable
        columns={columns}
        items={filteredItems}
        emptyState={<EmptyState title="Nenhum tipo de servico encontrado" description="Cadastre um servico para compor o catalogo." action={<Button onClick={openCreate}>Cadastrar tipo</Button>} />}
        actions={(item) => (
          <>
            <Button size="sm" variant="secondary" icon={<Pencil size={14} />} onClick={() => openEdit(item)}>Editar</Button>
            <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => setDeleteTarget(item)}>Excluir</Button>
          </>
        )}
      />

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={currentItem ? 'Editar tipo de servico' : 'Novo tipo de servico'} description="Defina nome, descricao e preco base.">
        <form className="form-grid" onSubmit={handleSubmit}>
          <InputField label="Nome" value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <InputField label="Preco base" type="number" min="0" step="0.01" value={form.basePrice} error={errors.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
          <div className="form-grid__full">
            <TextareaField label="Descricao" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="modal__footer form-grid__full">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{currentItem ? 'Salvar alteracoes' : 'Cadastrar tipo'}</Button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog open={Boolean(deleteTarget)} title="Excluir tipo de servico" description={`Deseja realmente excluir ${deleteTarget?.name || 'este item'}?`} loading={saving} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
