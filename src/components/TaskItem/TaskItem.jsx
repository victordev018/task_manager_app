
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './TaskItem.css';

const TaskItem = ({ task, index, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
    const isHighCost = task.cost >= 1000;

    return (
        <Draggable draggableId={task.id.toString()} index={index}>
            {(provided) => (
                <div
                    className={`task-item ${isHighCost ? 'high-cost' : ''}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                >
                    <div className="task-info">
                        <span className="task-name">#{task.id} - {task.name}</span>
                        <span className="task-cost">Custo: {formatCurrency(task.cost)}</span>
                        <span className="task-date">Prazo final: {formatDate(task.deadline)}</span>
                    </div>
                    <div className="task-actions">
                        <button
                            className="btn-icon"
                            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                            title="Edit"
                        >
                            ✎
                        </button>
                        <button
                            className="btn-icon btn-delete"
                            onClick={(e) => { e.stopPropagation(); onDelete(task); }}
                            title="Delete"
                        >
                            🗑
                        </button>
                        <div className="reorder-buttons">
                            <button
                                className="btn-icon"
                                onClick={(e) => { e.stopPropagation(); onMoveUp(task); }}
                                disabled={isFirst}
                                title="Move Up"
                            >
                                ↑
                            </button>
                            <button
                                className="btn-icon"
                                onClick={(e) => { e.stopPropagation(); onMoveDown(task); }}
                                disabled={isLast}
                                title="Move Down"
                            >
                                ↓
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default TaskItem;
