import { useEffect, useState } from 'react';
import { ownersService, petsService } from '../services/resourcesService';

const emptyForm = {
  name: '',
  species: '',
  breed: '',
  size: 'small',
  age: '',
  weight: '',
  notes: '',
  ownerId: ''
};

export default function PetsPage() {
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingPet, setEditingPet] = useState(null);
  const [detailPet, setDetailPet] = useState(null);
  const [message, setMessage] = useState('');

  async function loadData() {
    try {
      setLoading(true);

      const petsData = await petsService.list();
      const ownersData = await ownersService.list();

      setPets(petsData);
      setOwners(ownersData);
    } catch (error) {
      setMessage('Erro ao carregar os dados.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
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
    setEditingPet(null);
  }

  function getSizeText(size) {
    if (size === 'small') return 'Pequeno';
    if (size === 'medium') return 'Médio';
    if (size === 'large') return 'Grande';

    return size;
  }

  function formatDate(date) {
    if (!date) return '-';

    return new Date(date).toLocaleString('pt-BR');
  }

  function formatMoney(value) {
    if (!value) return 'R$ 0,00';

    return Number(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function getStatusText(status) {
    if (status === 'scheduled') return 'Agendado';
    if (status === 'in_progress') return 'Em andamento';
    if (status === 'completed') return 'Concluído';
    if (status === 'canceled') return 'Cancelado';

    return status;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.name ||
      !form.species ||
      !form.breed ||
      !form.ownerId ||
      !form.age ||
      !form.weight
    ) {
      setMessage('Preencha os campos obrigatórios.');
      return;
    }

    const payload = {
      name: form.name,
      species: form.species,
      breed: form.breed,
      size: form.size,
      age: Number(form.age),
      weight: Number(form.weight),
      notes: form.notes,
      ownerId: Number(form.ownerId)
    };

    try {
      if (editingPet) {
        await petsService.update(editingPet.id, payload);
        setMessage('Pet atualizado com sucesso.');
      } else {
        await petsService.create(payload);
        setMessage('Pet cadastrado com sucesso.');
      }

      clearForm();
      loadData();
    } catch (error) {
      setMessage('Erro ao salvar pet.');
    }
  }

  function handleEdit(pet) {
    setEditingPet(pet);

    setForm({
      name: pet.name || '',
      species: pet.species || '',
      breed: pet.breed || '',
      size: pet.size || 'small',
      age: String(pet.age || ''),
      weight: String(pet.weight || ''),
      notes: pet.notes || '',
      ownerId: String(pet.ownerId || '')
    });
  }

  async function handleDetails(pet) {
    try {
      const data = await petsService.getById(pet.id);
      setDetailPet(data);
    } catch (error) {
      setMessage('Erro ao carregar detalhes do pet.');
    }
  }

  async function handleDelete(pet) {
    const confirmDelete = window.confirm(
      `Deseja excluir ${pet.name}?`
    );

    if (!confirmDelete) return;

    try {
      await petsService.remove(pet.id);
      setMessage('Pet excluído com sucesso.');
      loadData();
    } catch (error) {
      setMessage('Erro ao excluir pet.');
    }
  }

  const filteredPets = pets.filter((pet) => {
    const term = search.toLowerCase();

    return (
      pet.name?.toLowerCase().includes(term) ||
      pet.species?.toLowerCase().includes(term) ||
      pet.breed?.toLowerCase().includes(term) ||
      pet.owner?.name?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <p>Carregando pets...</p>;
  }

  return (
    <div>
      <h1>Pets</h1>
      <p>Cadastre e acompanhe os animais atendidos pelo petshop.</p>

      {message && <p>{message}</p>}

      <hr />

      <h2>{editingPet ? 'Editar pet' : 'Novo pet'}</h2>

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
          <label>Espécie</label>
          <br />
          <input
            name="species"
            value={form.species}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Raça</label>
          <br />
          <input
            name="breed"
            value={form.breed}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Porte</label>
          <br />
          <select
            name="size"
            value={form.size}
            onChange={handleChange}
          >
            <option value="small">Pequeno</option>
            <option value="medium">Médio</option>
            <option value="large">Grande</option>
          </select>
        </div>

        <div>
          <label>Idade</label>
          <br />
          <input
            type="number"
            name="age"
            min="0"
            value={form.age}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Peso kg</label>
          <br />
          <input
            type="number"
            name="weight"
            min="0"
            step="0.1"
            value={form.weight}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Dono</label>
          <br />
          <select
            name="ownerId"
            value={form.ownerId}
            onChange={handleChange}
          >
            <option value="">Selecione</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Observações</label>
          <br />
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
          />
        </div>

        <br />

        <button type="submit">
          {editingPet ? 'Salvar alterações' : 'Cadastrar pet'}
        </button>

        {editingPet && (
          <button type="button" onClick={clearForm}>
            Cancelar
          </button>
        )}
      </form>

      <hr />

      <h2>Lista de pets</h2>

      <input
        placeholder="Buscar por nome, espécie, raça ou dono"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <br />
      <br />

      {filteredPets.length === 0 ? (
        <p>Nenhum pet encontrado.</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Espécie</th>
              <th>Raça</th>
              <th>Porte</th>
              <th>Dono</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filteredPets.map((pet) => (
              <tr key={pet.id}>
                <td>{pet.name}</td>
                <td>{pet.species}</td>
                <td>{pet.breed}</td>
                <td>{getSizeText(pet.size)}</td>
                <td>{pet.owner?.name || '-'}</td>
                <td>
                  <button onClick={() => handleDetails(pet)}>
                    Detalhes
                  </button>

                  <button onClick={() => handleEdit(pet)}>
                    Editar
                  </button>

                  <button onClick={() => handleDelete(pet)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {detailPet && (
        <div>
          <hr />

          <h2>Detalhes do pet</h2>

          <p><strong>Nome:</strong> {detailPet.name}</p>
          <p><strong>Dono:</strong> {detailPet.owner?.name || '-'}</p>
          <p><strong>Espécie:</strong> {detailPet.species}</p>
          <p><strong>Raça:</strong> {detailPet.breed}</p>
          <p><strong>Porte:</strong> {getSizeText(detailPet.size)}</p>
          <p><strong>Peso:</strong> {detailPet.weight} kg</p>
          <p><strong>Observações:</strong> {detailPet.notes || 'Sem observações.'}</p>

          <h3>Histórico recente</h3>

          {detailPet.services?.length > 0 ? (
            <ul>
              {detailPet.services.slice(0, 4).map((service) => (
                <li key={service.id}>
                  {service.serviceType?.name || 'Serviço'} -{' '}
                  {formatDate(service.serviceDate)} -{' '}
                  {formatMoney(service.chargedAmount)} -{' '}
                  {getStatusText(service.status)}
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum atendimento registrado.</p>
          )}

          <button onClick={() => setDetailPet(null)}>
            Fechar detalhes
          </button>
        </div>
      )}
    </div>
  );
}

