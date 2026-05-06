import { useEffect, useState } from 'react';
import {
  petsService,
  serviceTypesService,
  servicesService
} from '../services/resourcesService';

const emptyForm = {
  petId: '',
  serviceTypeId: '',
  serviceDate: '',
  chargedAmount: '',
  notes: '',
  status: 'scheduled'
};

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [pets, setPets] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState(emptyForm);
  const [editingService, setEditingService] = useState(null);
  const [message, setMessage] = useState('');

  async function loadData() {
    try {
      setLoading(true);

      const servicesData = await servicesService.list();
      const petsData = await petsService.list();
      const typesData = await serviceTypesService.list();

      setServices(servicesData);
      setPets(petsData);
      setServiceTypes(typesData);
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
    setEditingService(null);
  }

  function formatDateForInput(date) {
    if (!date) return '';

    const convertedDate = new Date(date);
    return convertedDate.toISOString().slice(0, 16);
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

    if (!form.petId || !form.serviceTypeId || !form.serviceDate || !form.chargedAmount) {
      setMessage('Preencha os campos obrigatórios.');
      return;
    }

    const payload = {
      petId: Number(form.petId),
      serviceTypeId: Number(form.serviceTypeId),
      serviceDate: new Date(form.serviceDate).toISOString(),
      chargedAmount: Number(form.chargedAmount),
      notes: form.notes,
      status: form.status
    };

    try {
      if (editingService) {
        await servicesService.update(editingService.id, payload);
        setMessage('Serviço atualizado com sucesso.');
      } else {
        await servicesService.create(payload);
        setMessage('Serviço cadastrado com sucesso.');
      }

      clearForm();
      loadData();
    } catch (error) {
      setMessage('Erro ao salvar serviço.');
    }
  }

  function handleEdit(service) {
    setEditingService(service);

    setForm({
      petId: String(service.petId || ''),
      serviceTypeId: String(service.serviceTypeId || ''),
      serviceDate: formatDateForInput(service.serviceDate),
      chargedAmount: String(service.chargedAmount || ''),
      notes: service.notes || '',
      status: service.status || 'scheduled'
    });
  }

  async function handleDelete(service) {
    const confirmDelete = window.confirm(
      `Deseja excluir o serviço de ${service.pet?.name || 'um pet'}?`
    );

    if (!confirmDelete) return;

    try {
      await servicesService.remove(service.id);
      setMessage('Serviço excluído com sucesso.');
      loadData();
    } catch (error) {
      setMessage('Erro ao excluir serviço.');
    }
  }

  const filteredServices = services.filter((service) => {
    const term = search.toLowerCase();

    const matchesSearch =
      service.pet?.name?.toLowerCase().includes(term) ||
      service.serviceType?.name?.toLowerCase().includes(term) ||
      service.notes?.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'all' || service.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <p>Carregando serviços realizados...</p>;
  }

  return (
    <div>
      <h1>Serviços realizados</h1>
      <p>Registre e acompanhe os atendimentos feitos no petshop.</p>

      {message && <p>{message}</p>}

      <hr />

      <h2>{editingService ? 'Editar serviço' : 'Novo serviço'}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Pet</label>
          <br />
          <select
            name="petId"
            value={form.petId}
            onChange={handleChange}
          >
            <option value="">Selecione</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Tipo de serviço</label>
          <br />
          <select
            name="serviceTypeId"
            value={form.serviceTypeId}
            onChange={handleChange}
          >
            <option value="">Selecione</option>
            {serviceTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Data e hora</label>
          <br />
          <input
            type="datetime-local"
            name="serviceDate"
            value={form.serviceDate}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Valor cobrado</label>
          <br />
          <input
            type="number"
            name="chargedAmount"
            min="0"
            step="0.01"
            value={form.chargedAmount}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Status</label>
          <br />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="scheduled">Agendado</option>
            <option value="in_progress">Em andamento</option>
            <option value="completed">Concluído</option>
            <option value="canceled">Cancelado</option>
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
          {editingService ? 'Salvar alterações' : 'Cadastrar serviço'}
        </button>

        {editingService && (
          <button type="button" onClick={clearForm}>
            Cancelar
          </button>
        )}
      </form>

      <hr />

      <h2>Lista de serviços</h2>

      <input
        placeholder="Buscar por pet, tipo ou observações"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <br />
      <br />

      <select
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
      >
        <option value="all">Todos</option>
        <option value="scheduled">Agendado</option>
        <option value="in_progress">Em andamento</option>
        <option value="completed">Concluído</option>
        <option value="canceled">Cancelado</option>
      </select>

      <br />
      <br />

      {filteredServices.length === 0 ? (
        <p>Nenhum serviço encontrado.</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Pet</th>
              <th>Tipo</th>
              <th>Data</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filteredServices.map((service) => (
              <tr key={service.id}>
                <td>{service.pet?.name || '-'}</td>
                <td>{service.serviceType?.name || '-'}</td>
                <td>{formatDate(service.serviceDate)}</td>
                <td>{formatMoney(service.chargedAmount)}</td>
                <td>{getStatusText(service.status)}</td>
                <td>
                  <button onClick={() => handleEdit(service)}>
                    Editar
                  </button>

                  <button onClick={() => handleDelete(service)}>
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