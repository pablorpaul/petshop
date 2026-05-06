import { useEffect, useState } from 'react';
import { ownersService } from '../services/resourcesService';

const emptyForm = {
  name: '',
  document: '',
  phone: '',
  email: '',
  address: ''
};

export default function OwnersPage() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingOwner, setEditingOwner] = useState(null);
  const [detailOwner, setDetailOwner] = useState(null);
  const [message, setMessage] = useState('');

  async function loadOwners() {
    try {
      setLoading(true);
      const data = await ownersService.list();
      setOwners(data);
    } catch (error) {
      setMessage('Erro ao carregar donos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOwners();
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
    setEditingOwner(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name || !form.document || !form.phone || !form.email || !form.address) {
      setMessage('Preencha todos os campos.');
      return;
    }

    try {
      if (editingOwner) {
        await ownersService.update(editingOwner.id, form);
        setMessage('Dono atualizado com sucesso.');
      } else {
        await ownersService.create(form);
        setMessage('Dono cadastrado com sucesso.');
      }

      clearForm();
      loadOwners();
    } catch (error) {
      setMessage('Erro ao salvar dono.');
    }
  }

  function handleEdit(owner) {
    setEditingOwner(owner);

    setForm({
      name: owner.name || '',
      document: owner.document || '',
      phone: owner.phone || '',
      email: owner.email || '',
      address: owner.address || ''
    });
  }

  async function handleDetails(owner) {
    try {
      const data = await ownersService.getById(owner.id);
      setDetailOwner(data);
    } catch (error) {
      setMessage('Erro ao carregar detalhes.');
    }
  }

  async function handleDelete(owner) {
    const confirmDelete = window.confirm(`Deseja excluir ${owner.name}?`);

    if (!confirmDelete) return;

    try {
      await ownersService.remove(owner.id);
      setMessage('Dono excluído com sucesso.');
      loadOwners();
    } catch (error) {
      setMessage('Erro ao excluir dono.');
    }
  }

  const filteredOwners = owners.filter((owner) => {
    const term = search.toLowerCase();

    return (
      owner.name?.toLowerCase().includes(term) ||
      owner.document?.toLowerCase().includes(term) ||
      owner.phone?.toLowerCase().includes(term) ||
      owner.email?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <p>Carregando donos...</p>;
  }

  return (
    <div>
      <h1>Donos</h1>
      <p>Gerencie os responsáveis pelos pets cadastrados.</p>

      {message && <p>{message}</p>}

      <hr />

      <h2>{editingOwner ? 'Editar dono' : 'Novo dono'}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome</label>
          <br />
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Documento</label>
          <br />
          <input
            name="document"
            value={form.document}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Telefone</label>
          <br />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Email</label>
          <br />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Endereço</label>
          <br />
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        <br />

        <button type="submit">
          {editingOwner ? 'Salvar alterações' : 'Cadastrar dono'}
        </button>

        {editingOwner && (
          <button type="button" onClick={clearForm}>
            Cancelar
          </button>
        )}
      </form>

      <hr />

      <h2>Lista de donos</h2>

      <input
        placeholder="Buscar por nome, documento, telefone ou email"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <br />
      <br />

      {filteredOwners.length === 0 ? (
        <p>Nenhum dono encontrado.</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Documento</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filteredOwners.map((owner) => (
              <tr key={owner.id}>
                <td>{owner.name}</td>
                <td>{owner.document}</td>
                <td>{owner.phone}</td>
                <td>{owner.email}</td>
                <td>
                  <button onClick={() => handleDetails(owner)}>
                    Detalhes
                  </button>

                  <button onClick={() => handleEdit(owner)}>
                    Editar
                  </button>

                  <button onClick={() => handleDelete(owner)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {detailOwner && (
        <div>
          <hr />

          <h2>Detalhes do dono</h2>

          <p><strong>Nome:</strong> {detailOwner.name}</p>
          <p><strong>Documento:</strong> {detailOwner.document}</p>
          <p><strong>Telefone:</strong> {detailOwner.phone}</p>
          <p><strong>Email:</strong> {detailOwner.email}</p>
          <p><strong>Endereço:</strong> {detailOwner.address}</p>

          <h3>Pets vinculados</h3>

          {detailOwner.pets?.length > 0 ? (
            <ul>
              {detailOwner.pets.map((pet) => (
                <li key={pet.id}>{pet.name}</li>
              ))}
            </ul>
          ) : (
            <p>Nenhum pet vinculado.</p>
          )}

          <button onClick={() => setDetailOwner(null)}>
            Fechar detalhes
          </button>
        </div>
      )}
    </div>
  );
}