import { useEffect, useState } from 'react';
import { ownersService } from '../../services/resourcesService';
import MainLayout from '../../layouts/MainLayout';
import "../../styles/Owners/style.css"

const emptyForm = {
    name: '',
    document: '',
    phone: '',
    email: '',
    address: ''
};

export default function Owners() {
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

    function clearMessage() {
        setMessage(null);
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
            owner.email?.toLowerCase().includes(term) ||
            owner.address.toLowerCase().includes(term)
        );
    });

    if (loading) {
    return <p>Carregando donos...</p>;
    }

    return (
        <MainLayout>
            <div className="page-header">
                <div>
                    <h1>Gerenciamento de Donos</h1>
                    <p className="page-subtitle">Gerencie os responsáveis pelos pets cadastrados.</p>
                </div>
            </div>

            {message && (
                <div className="alert-message">
                    <span>{message}</span>
                    <button onClick={clearMessage} className="btn-close-alert">✕</button>
                </div>
            )}

            <div className="owners-card form-section">
                <h2>{editingOwner ? 'Editar Dono' : 'Novo Dono'}</h2>
                <form onSubmit={handleSubmit} className="owners-form">
                    <div className="form-grid">
                        <div className="input-field">
                            <label>Nome Completo</label>
                            <input name="name" value={form.name} onChange={handleChange} placeholder="Ex: João Silva" />
                        </div>
                        <div className="input-field">
                            <label>Documento (CPF/RG)</label>
                            <input name="document" value={form.document} onChange={handleChange} placeholder="000.000.000-00" />
                        </div>
                        <div className="input-field">
                            <label>Telefone</label>
                            <input name="phone" value={form.phone} onChange={handleChange} placeholder="(47) 99999-9999" />
                        </div>
                        <div className="input-field">
                            <label>E-mail</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="joao@email.com" />
                        </div>
                        <div className="input-field full-width">
                            <label>Endereço Residencial</label>
                            <textarea name="address" value={form.address} onChange={handleChange} placeholder="Rua, número, bairro e cidade" rows="2" />
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">
                            {editingOwner ? 'Salvar alterações' : 'Cadastrar Dono'}
                        </button>
                        {editingOwner && (
                            <button type="button" onClick={clearForm} className="btn-secondary">
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Bloco da Tabela / Lista */}
            <div className="owners-card list-section">
                <div className="list-header">
                    <h2>Lista de Donos</h2>
                    <span className="badge-count">Total: {owners.length}</span>
                </div>

                <div className="search-box">
                    <input
                        placeholder="Buscar por nome, documento, telefone, email ou endereço..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                {filteredOwners.length === 0 ? (
                    <p className="no-data">Nenhum dono encontrado.</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="owners-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Documento</th>
                                    <th>Telefone</th>
                                    <th>E-mail</th>
                                    <th className="text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOwners.map((owner) => (
                                    <tr key={owner.id}>
                                        <td className="font-semibold">{owner.name}</td>
                                        <td>{owner.document}</td>
                                        <td>{owner.phone}</td>
                                        <td>{owner.email}</td>
                                        <td className="table-actions">
                                            <button onClick={() => handleDetails(owner)} className="btn-action btn-info" title="Detalhes">👁️</button>
                                            <button onClick={() => handleEdit(owner)} className="btn-action btn-edit" title="Editar">✏️</button>
                                            <button onClick={() => handleDelete(owner)} className="btn-action btn-danger" title="Excluir">🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Painel Lateral / Modal de Detalhes */}
            {detailOwner && (
                <div className="details-overlay">
                    <div className="details-modal">
                        <h2>Detalhes do Responsável</h2>
                        <div className="details-grid">
                            <p><strong>Nome:</strong> {detailOwner.name}</p>
                            <p><strong>Documento:</strong> {detailOwner.document}</p>
                            <p><strong>Telefone:</strong> {detailOwner.phone}</p>
                            <p><strong>Email:</strong> {detailOwner.email}</p>
                            <p className="full-width"><strong>Endereço:</strong> {detailOwner.address}</p>
                        </div>

                        <div className="linked-pets">
                            <h3>🐾 Pets Vinculados</h3>
                            {detailOwner.pets?.length > 0 ? (
                                <ul>
                                    {detailOwner.pets.map((pet) => (
                                        <li key={pet.id}>{pet.name}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-data-small">Nenhum pet vinculado a este dono.</p>
                            )}
                        </div>

                        <button onClick={() => setDetailOwner(null)} className="btn-primary full-width">
                            Fechar detalhes
                        </button>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}


