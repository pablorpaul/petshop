import { useEffect, useState } from 'react';
import { serviceTypesService } from '../services/resourcesService';

const emptyForm = {
  name: '',
  description: '',
  basePrice: ''
};

export default function ServiceTypesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingItem, setEditingItem] = useState(null);
  const [message, setMessage] = useState('');

  async function loadItems() {
    try {
      setLoading(true);

      const data = await serviceTypesService.list();
      setItems(data);
    } catch (error) {
      setMessage('Erro ao carregar tipos de serviço.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value
    });
  }

  function clearForm() {
    setForm(emptyForm);
    setEditingItem(null);
  }

  function formatMoney(value) {
    if (!value) return 'R$ 0,00';

    return Number(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name || !form.basePrice) {
      setMessage('Preencha nome e preço base.');
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      basePrice: Number(form.basePrice)
    };

    try {
      if (editingItem) {
        await serviceTypesService.update(editingItem.id, payload);
        setMessage('Tipo de serviço atualizado com sucesso.');
      } else {
        await serviceTypesService.create(payload);
        setMessage('Tipo de serviço cadastrado com sucesso.');
      }

      clearForm();
      loadItems();
    } catch (error) {
      setMessage('Erro ao salvar tipo de serviço.');
    }
  }

  function handleEdit(item) {
    setEditingItem(item);

    setForm({
      name: item.name || '',
      description: item.description || '',
      basePrice: String(item.basePrice || '')
    });
  }

  async function handleDelete(item) {
    const confirmDelete = window.confirm(
      `Deseja excluir ${item.name}?`
    );

    if (!confirmDelete) return;

    try {
      await serviceTypesService.remove(item.id);

      setMessage('Tipo de serviço excluído com sucesso.');

      loadItems();
    } catch (error) {
      setMessage('Erro ao excluir tipo de serviço.');
    }
  }

  const filteredItems = items.filter((item) => {
    const term = search.toLowerCase();

    return (
      item.name?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <p>Carregando tipos de serviço...</p>;
  }

  return (
    <div>
      <h1>Tipos de serviço</h1>

      <p>Mantenha o catálogo de serviços atualizado.</p>

      {message && <p>{message}</p>}

      <hr />

      <h2>
        {editingItem
          ? 'Editar tipo de serviço'
          : 'Novo tipo de serviço'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome</label>
          <br />

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Preço base</label>
          <br />

          <input
            type="number"
            name="basePrice"
            min="0"
            step="0.01"
            value={form.basePrice}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Descrição</label>
          <br />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <br />

        <button type="submit">
          {editingItem
            ? 'Salvar alterações'
            : 'Cadastrar tipo'}
        </button>

        {editingItem && (
          <button type="button" onClick={clearForm}>
            Cancelar
          </button>
        )}
      </form>

      <hr />

      <h2>Lista de tipos de serviço</h2>

      <input
        type="text"
        placeholder="Buscar por nome ou descrição"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <br />
      <br />

      {filteredItems.length === 0 ? (
        <p>Nenhum tipo de serviço encontrado.</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Preço base</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>

                <td>{item.description || '-'}</td>

                <td>{formatMoney(item.basePrice)}</td>

                <td>
                  <button onClick={() => handleEdit(item)}>
                    Editar
                  </button>

                  <button onClick={() => handleDelete(item)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}