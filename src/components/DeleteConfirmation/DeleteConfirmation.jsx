
import React from 'react';
import './DeleteConfirmation.css';

const DeleteConfirmation = ({ isOpen, onClose, onConfirm, taskName }) => {
    if (!isOpen) return null;

    return (
        <div className="delete-modal-overlay">
            <div className="delete-modal">
                <h3>Tem certeza?</h3>
                <p>Deseja realmente excluir a tarefa <strong>{taskName}</strong>?</p>
                <div className="delete-modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Cancelar</button>
                    <button className="btn-confirm" onClick={onConfirm}>Excluir</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmation;
