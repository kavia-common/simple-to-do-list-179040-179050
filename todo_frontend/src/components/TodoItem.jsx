import React, { useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * TodoItem component representing a single todo with edit, toggle, and delete.
 */
export default function TodoItem({ todo, onToggle, onDelete, onSave }) {
  /** This is a public function. */
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);

  const handleSave = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== todo.title) {
      onSave(todo.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setTitle(todo.title);
      setIsEditing(false);
    }
  };

  return (
    <div className={`todo-card ${todo.completed ? 'completed' : ''}`} role="listitem" aria-checked={todo.completed}>
      <button
        className={`toggle ${todo.completed ? 'on' : 'off'}`}
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {todo.completed ? '✓' : ''}
      </button>

      {isEditing ? (
        <input
          className="todo-input edit"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          autoFocus
          aria-label="Edit todo title"
        />
      ) : (
        <span className="todo-title" onDoubleClick={() => setIsEditing(true)} title="Double click to edit">
          {todo.title}
        </span>
      )}

      <div className="actions">
        {!isEditing && (
          <button className="btn secondary" onClick={() => setIsEditing(true)} aria-label="Edit todo">Edit</button>
        )}
        <button className="btn danger" onClick={() => onDelete(todo.id)} aria-label="Delete todo">Delete</button>
      </div>
    </div>
  );
}
