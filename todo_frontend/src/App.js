import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { fetchTodos, addTodo, updateTodo, toggleTodo, deleteTodo, getApiBaseUrl } from './api';
import TodoItem from './components/TodoItem.jsx';

// PUBLIC_INTERFACE
function App() {
  /** Root todo app with add, list, edit, delete, toggle capabilities connected to REST API. */
  const [theme, setTheme] = useState('light');
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchTodos();
        if (mounted) setTodos(data || []);
      } catch (e) {
        // Show error but keep UI functional
        if (mounted) setError(`Failed to load todos: ${e.message}`);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    /** Toggle between light and dark themes. */
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    try {
      setAdding(true);
      const created = await addTodo(title);
      // Fallback if backend returns nothing: create local item
      const item = created || {
        id: Date.now(),
        title,
        completed: false
      };
      setTodos(prev => [item, ...prev]);
      setNewTitle('');
      setError('');
    } catch (e1) {
      setError(`Failed to add: ${e1.message}`);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
      setError('');
    } catch (e1) {
      setError(`Failed to delete: ${e1.message}`);
    }
  };

  const handleToggle = async (id) => {
    try {
      const updated = await toggleTodo(id);
      if (updated) {
        setTodos(prev => prev.map(t => (t.id === id ? updated : t)));
      } else {
        // If backend returns no body, flip locally
        setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
      }
      setError('');
    } catch (e1) {
      setError(`Failed to toggle: ${e1.message}`);
    }
  };

  const handleSave = async (id, title) => {
    try {
      const updated = await updateTodo(id, { title });
      if (updated) {
        setTodos(prev => prev.map(t => (t.id === id ? updated : t)));
      } else {
        setTodos(prev => prev.map(t => (t.id === id ? { ...t, title } : t)));
      }
      setError('');
    } catch (e1) {
      setError(`Failed to update: ${e1.message}`);
    }
  };

  const remaining = useMemo(() => todos.filter(t => !t.completed).length, [todos]);
  const apiUrl = useMemo(() => getApiBaseUrl(), []);

  return (
    <div className="App">
      <header className="cyber-navbar">
        <div className="brand">
          <span className="logo">✓</span>
          <span className="title">Neon Todo</span>
        </div>
        <div className="controls">
          <span className="api-hint" title="Current API base URL">{apiUrl}</span>
          <button
            className="btn theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      <main className="container">
        <section className="composer">
          <form onSubmit={handleAdd} className="composer-form" aria-label="Add todo form">
            <input
              className="todo-input"
              placeholder="What needs to be done?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              aria-label="New todo title"
            />
            <button className="btn primary" type="submit" disabled={adding || !newTitle.trim()}>
              {adding ? 'Adding...' : 'Add'}
            </button>
          </form>
          <div className="meta">
            <span className="badge">Remaining: {remaining}</span>
            {loading && <span className="loading">Loading todos...</span>}
            {error && <span className="error">{error}</span>}
          </div>
        </section>

        <section className="list" role="list" aria-label="Todo list">
          {todos.length === 0 && !loading ? (
            <div className="empty">
              <div className="empty-icon">🗒️</div>
              <div className="empty-text">No todos yet. Add your first task above.</div>
            </div>
          ) : (
            todos.map((t) => (
              <TodoItem
                key={t.id}
                todo={t}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onSave={handleSave}
              />
            ))
          )}
        </section>
      </main>

      <footer className="footer">
        <span>Built with <span className="accent">Neon Cyber</span> theme</span>
      </footer>
    </div>
  );
}

export default App;
