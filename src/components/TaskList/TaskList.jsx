
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import api from '../../services/api';
import TaskItem from '../TaskItem/TaskItem';
import TaskModal from '../TaskModal/TaskModal';
import DeleteConfirmation from '../DeleteConfirmation/DeleteConfirmation';
import { formatCurrency } from '../../utils/formatters';
import './TaskList.css';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [modalServerError, setModalServerError] = useState(null);

    // Delete Modal State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await api.get();
            // Sort by presentationOrder just in case backend doesn't,
            // though requirements imply backend handling order.
            // We'll trust backend order for initial render.
            setTasks(response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch tasks", err);
            setError('Falha ao carregar tarefas. Verifique se o backend está rodando.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleCreateClick = () => {
        setCurrentTask(null);
        setModalServerError(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (task) => {
        setCurrentTask(task);
        setModalServerError(null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (task) => {
        setTaskToDelete(task);
        setIsDeleteOpen(true);
    };

    const handleSaveTask = async (taskData) => {
        setModalServerError(null);
        try {
            if (currentTask) {
                await api.put(`/${currentTask.id}`, taskData);
            } else {
                await api.post('', taskData);
            }
            setIsModalOpen(false);
            fetchTasks();
        } catch (err) {
            if (err.response) {
                // Pass the StandardError object to the modal
                setModalServerError(err.response.data);
            } else {
                setModalServerError({ message: 'Erro de conexão com o servidor.' });
            }
        }
    };

    const handleConfirmDelete = async () => {
        if (!taskToDelete) return;
        try {
            await api.delete(`/${taskToDelete.id}`);
            setIsDeleteOpen(false);
            setTaskToDelete(null);
            fetchTasks();
        } catch (err) {
            if (err.response && err.response.status === 404) {
                // Graceful refresh
                setIsDeleteOpen(false);
                setTaskToDelete(null);
                fetchTasks();
                alert('Tarefa não encontrada, a lista foi atualizada.');
            } else {
                alert('Erro ao excluir tarefa.');
            }
        }
    };

    const handleMove = async (taskId, newOrder) => {
        // Optimistic UI update could be tricky if we don't know exact index logic of backend.
        // We will call API and refresh for safety, or implement simple optimistic swap.
        // Requirement B.2 says: "Calculate newOrder and call PATCH .../move".

        try {
            // Optimistic update locally to prevent jumpiness
            const oldTasks = [...tasks];
            // But we'll wait for API for "Calculate newOrder" part to be precise.
            // If dragging, we get the destination index directly.

            await api.patch(`/${taskId}/move`, { newOrder });
            fetchTasks();
        } catch (err) {
            console.error("Failed to move task", err);
            // Revert or show error
            fetchTasks();
        }
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        if (sourceIndex === destinationIndex) return;

        const movedTask = tasks[sourceIndex];

        // Optimistic update for UI smoothness
        const newTasks = Array.from(tasks);
        newTasks.splice(sourceIndex, 1);
        newTasks.splice(destinationIndex, 0, movedTask);
        setTasks(newTasks);

        // Call backend with destinationIndex + 1 (if backend is 1-based) or just index.
        // Prompt example says `presentationOrder: 1`. 
        // Usually list index 0 maps to presentationOrder 1.
        // We will send destinationIndex + 1 assuming 1-based presentationOrder 
        // OR we just send the raw index if backend expects 1-based 
        // but typically typical algorithms handle 0-based.
        // Looking at backend response `presentationOrder: 1`, it seems 1-based.
        // Let's assume sending the target (1-based) new position is what it wants.

        // Actually, let's verify if `newOrder` in `PATCH /{id}/move` expects 1-based or 0-based.
        // Standard pattern for such "move" endpoints often mimics the list index.
        // If I assume 1-based, I should send destinationIndex + 1.
        handleMove(movedTask.id, destinationIndex + 1);
    };

    const onMoveUp = (task) => {
        const index = tasks.findIndex(t => t.id === task.id);
        if (index > 0) {
            // Swap with previous. New index is current index - 1. 
            // 1-based: (index + 1) - 1 = index.
            handleMove(task.id, index); // index is the *new* 1-based position (current 0-based index)
        }
    };

    const onMoveDown = (task) => {
        const index = tasks.findIndex(t => t.id === task.id);
        if (index < tasks.length - 1) {
            // Swap with next. New index is current index + 1
            // 1-based: (index + 1) + 1 = index + 2.
            handleMove(task.id, index + 2);
        }
    };

    // Calculate Total Cost
    const totalCost = tasks.reduce((sum, task) => sum + task.cost, 0);

    return (
        <div className="task-list-container">
            <header className="task-header">
                <h1>Lista de Tarefas</h1>
                <button className="btn-add" onClick={handleCreateClick}>+ Nova Tarefa</button>
            </header>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
                <div className="loading">Carregando...</div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="tasks">
                        {(provided) => (
                            <div
                                className="task-list"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {tasks.map((task, index) => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        index={index}
                                        onEdit={handleEditClick}
                                        onDelete={handleDeleteClick}
                                        onMoveUp={onMoveUp}
                                        onMoveDown={onMoveDown}
                                        isFirst={index === 0}
                                        isLast={index === tasks.length - 1}
                                    />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}

            <footer className="task-footer">
                <strong>Custo Total: </strong> {formatCurrency(totalCost)}
            </footer>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTask}
                taskToEdit={currentTask}
                serverError={modalServerError}
            />

            <DeleteConfirmation
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                taskName={taskToDelete?.name}
            />
        </div>
    );
};

export default TaskList;
