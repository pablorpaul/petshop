import { useEffect, useState } from 'react';
import { ownersService, petsService } from '../../services/resourcesService';
import MainLayout from '../../layouts/MainLayout';
import "../../styles/Pets/style.css"

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

export default function Pets() {
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
            pet.owner?.name?.toLowerCase().includes(term) ||
            pet.notes?.toLowerCase().includes(term)
        );
    });

    if (loading) {
        return <p>Carregando pets...</p>;
    }

    return (
        <MainLayout>
            <div className="pets-container">
            
            {/* Cabeçalho da Página */}
            <div className="page-header">
                <h1>Pets</h1>
                <p className="page-subtitle">Cadastre e acompanhe os animais atendidos pelo petshop.</p>
            </div>

            {/* Mensagens de Alerta com botão de fechar herdado */}
            {message && (
                <div className="alert-message">
                <span>{message}</span>
                <button className="btn-close-alert" onClick={() => setMessage('')}>×</button>
                </div>
            )}

            {/* Card de Cadastro / Edição */}
            <div className="pets-card">
                <h2>{editingPet ? 'Editar Pet' : 'Novo Pet'}</h2>
                <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="input-field">
                    <label>Nome</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Ex: Thor" />
                    </div>
                    
                    <div className="input-field">
                    <label>Espécie</label>
                    <input name="species" value={form.species} onChange={handleChange} placeholder="Ex: Cão" />
                    </div>
                    
                    <div className="input-field">
                    <label>Raça</label>
                    <input name="breed" value={form.breed} onChange={handleChange} placeholder="Ex: Golden Retriever" />
                    </div>
                    
                    <div className="input-field">
                    <label>Porte</label>
                    <select name="size" value={form.size} onChange={handleChange}>
                        <option value="small">Pequeno</option>
                        <option value="medium">Médio</option>
                        <option value="large">Grande</option>
                    </select>
                    </div>
                    
                    <div className="input-field">
                    <label>Idade (anos)</label>
                    <input type="number" name="age" min="0" value={form.age} onChange={handleChange} placeholder="0" />
                    </div>
                    
                    <div className="input-field">
                    <label>Peso (kg)</label>
                    <input type="number" name="weight" min="0" step="0.1" value={form.weight} onChange={handleChange} placeholder="0.0" />
                    </div>
                    
                    <div className="input-field">
                    <label>Tutor / Dono</label>
                    <select name="ownerId" value={form.ownerId} onChange={handleChange}>
                        <option value="">Selecione um tutor</option>
                        {owners.map((owner) => (
                        <option key={owner.id} value={owner.id}>{owner.name}</option>
                        ))}
                    </select>
                    </div>

                    <div className="input-field full-width">
                    <label>Observações Clínicas / Restrições</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Alergias, temperamento, restrições alimentares..." />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary">
                    {editingPet ? 'Salvar Alterações' : 'Cadastrar Pet'}
                    </button>
                    {editingPet && (
                    <button type="button" onClick={clearForm} className="btn-secondary">
                        Cancelar
                    </button>
                    )}
                </div>
                </form>
            </div>

            {/* Listagem de Pets */}
            <div className="pets-card">
                <div className="list-header">
                <h2>Lista de Pets registrados</h2>
                <span className="badge-count">
                    {filteredPets.length} {filteredPets.length === 1 ? 'pet' : 'pets'}
                </span>
                </div>

                <div className="search-box">
                <input
                    placeholder="Buscar por nome, espécie, raça ou tutor..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
                </div>

                {loading ? (
                <div className="loading-container">Carregando dados dos pets...</div>
                ) : filteredPets.length === 0 ? (
                <div className="no-data">Nenhum pet encontrado com os critérios de busca.</div>
                ) : (
                <div className="table-wrapper">
                    <table className="pets-table">
                    <thead>
                        <tr>
                        <th>Nome</th>
                        <th>Espécie</th>
                        <th>Raça</th>
                        <th>Porte</th>
                        <th>Tutor</th>
                        <th style={{ textAlign: 'center' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPets.map((pet) => (
                        <tr key={pet.id}>
                            <td className="font-semibold">{pet.name}</td>
                            <td>{pet.species}</td>
                            <td>{pet.breed}</td>
                            <td>{getSizeText(pet.size)}</td>
                            <td>{pet.owner?.name || '-'}</td>
                            <td>
                                <div className="table-actions">
                                    <button onClick={() => handleDetails(pet)} className="btn-action btn-info" title="Ver Detalhes">👁️</button>
                                    <button onClick={() => handleEdit(pet)} className="btn-action btn-edit" title="Editar">✏️</button>
                                    <button onClick={() => handleDelete(pet)} className="btn-action btn-danger" title="Excluir">🗑️</button>
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </div>

            {detailPet && (
                <div className="details-overlay" onClick={() => setDetailPet(null)}>
                <div className="details-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="list-header" style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Ficha Clínica: {detailPet.name}</h2>
                    <button className="btn-close-alert" style={{ fontSize: '1.5rem' }} onClick={() => setDetailPet(null)}>×</button>
                    </div>
                    
                    <div className="details-grid">
                    <p><strong>Espécie:</strong> {detailPet.species}</p>
                    <p><strong>Raça:</strong> {detailPet.breed}</p>
                    <p><strong>Porte:</strong> {getSizeText(detailPet.size)}</p>
                    <p><strong>Peso:</strong> {detailPet.weight} kg</p>
                    <p className="full-width"><strong>Tutor responsável:</strong> {detailPet.owner?.name || '-'}</p>
                    <p className="full-width"><strong>Observações:</strong> {detailPet.notes || 'Nenhuma observação registrada para este animal.'}</p>
                    </div>

                    <div className="linked-services">
                    <h3>Histórico de Atendimentos</h3>
                    {detailPet.services && detailPet.services.length > 0 ? (
                        <ul>
                        {detailPet.services.slice(0, 5).map((service) => (
                            <li key={service.id}>
                            <div>
                                <span className="font-semibold">{service.serviceType?.name || 'Atendimento'}</span>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {formatDate(service.serviceDate)}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>{formatMoney(service.chargedAmount)}</span>
                                <span className={`status-badge status-${service.status}`}>
                                {getStatusText(service.status)}
                                </span>
                            </div>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0 }}>Nenhum serviço prestado a este pet ainda.</p>
                    )}
                    </div>

                    <button onClick={() => setDetailPet(null)} className="btn-secondary full-width">
                    Fechar Ficha
                    </button>
                </div>
                </div>
            )}

            </div>
        </MainLayout>
    );
}

