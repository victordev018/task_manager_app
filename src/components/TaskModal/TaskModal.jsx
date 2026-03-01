import React, { useState, useEffect, useRef } from 'react';
import './TaskModal.css';

const TaskModal = ({ isOpen, onClose, onSave, taskToEdit, serverError }) => {
    const [formData, setFormData] = useState({
        name: '',
        cost: '',
        deadline: ''
    });

    // 1. Criamos a referência para o input de nome
    const nameInputRef = useRef(null);

    useEffect(() => {
        if (taskToEdit) {
            setFormData({
                name: taskToEdit.name,
                cost: taskToEdit.cost,
                deadline: taskToEdit.deadline
            });
        } else {
            setFormData({
                name: '',
                cost: '',
                deadline: ''
            });
        }
    }, [taskToEdit, isOpen]);

    // 2. Efeito para focar no input quando o modal abrir
    useEffect(() => {
        if (isOpen && nameInputRef.current) {
            // Um pequeno timeout garante que a animação/renderização do modal terminou
            setTimeout(() => {
                nameInputRef.current.focus();
            }, 50);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            cost: parseFloat(formData.cost)
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>

                {serverError && (
                    <div className="error-alert">
                        {serverError.message || 'Ocorreu um erro.'}
                        {serverError.errors && (
                            <ul className="field-errors">
                                {serverError.errors.map((err, idx) => (
                                    <li key={idx}>{err.field}: {err.message}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nome da Tarefa</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            ref={nameInputRef} /* 3. Adicionamos a ref aqui */
                            maxLength={255} /* 4. Trava de tamanho máximo */
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cost">Custo (R$)</label>
                        <input
                            type="number"
                            id="cost"
                            name="cost"
                            step="0.01"
                            max="9999999999999" /* 5. Trava para evitar overflow no banco */
                            value={formData.cost}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="deadline">Data Limite</label>
                        <input
                            type="date"
                            id="deadline"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-save">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;