'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Todo } from '../types';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Plus, LogOut, ClipboardList } from 'lucide-react';

// ===================================
// Skeleton Loader Component
// ===================================
function SkeletonLoader() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg animate-pulse">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="ml-4 h-4 w-48 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
      ))}
    </div>
  );
}


// ===================================
// Todo Item Component
// ===================================
function TodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center p-4 rounded-lg transition-colors duration-300 ${
        todo.is_completed
          ? 'bg-white/50 dark:bg-gray-800/50'
          : 'bg-white dark:bg-gray-800'
      } shadow-sm`}
    >
      {/* Custom Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 ${
          todo.is_completed
            ? 'bg-blue-500 border-blue-500'
            : 'border-gray-300 dark:border-gray-500 hover:border-blue-500'
        }`}
      >
        {todo.is_completed && <Check className="w-4 h-4 text-white" />}
      </button>

      {/* Todo Title */}
      <span
        className={`ml-4 flex-grow font-medium transition-colors duration-300 ${
          todo.is_completed
            ? 'line-through text-gray-500 dark:text-gray-400/80'
            : 'text-gray-800 dark:text-gray-100'
        }`}
      >
        {todo.title}
      </span>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(todo.id)}
        className="ml-4 p-1.5 rounded-full text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
      >
        <Trash2 size={18} />
      </button>
    </motion.li>
  );
}


// ===================================
// Main Page Component
// ===================================
export default function HomePage() {
  const { user, loading, logout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isLoadingTodos, setIsLoadingTodos] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const fetchTodos = async () => {
    setIsLoadingTodos(true);
    try {
      const response = await api.get('/api/todos/');
      setTodos(response.data.results.sort((a: Todo, b: Todo) => Number(a.is_completed) - Number(b.is_completed)));
    } catch (error) {
      console.error('Failed to fetch todos', error);
    } finally {
      setIsLoadingTodos(false);
    }
  };

  const handleAddTodo = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      const response = await api.post('/api/todos/', { title: newTodoTitle });
      setTodos([response.data, ...todos]);
      setNewTodoTitle('');
    } catch (error) {
      console.error('Failed to add todo', error);
    }
  };

  const handleToggleTodo = async (id: number) => {
    // Optimistic update for better UX
    setTodos(prevTodos => {
        const newTodos = prevTodos.map(todo =>
            todo.id === id ? { ...todo, is_completed: !todo.is_completed } : todo
        );
        return newTodos.sort((a, b) => Number(a.is_completed) - Number(b.is_completed));
    });

    try {
      await api.post(`/api/todos/${id}/toggle_complete/`);
      // Optionally refetch or trust the optimistic update
    } catch (error) {
      console.error('Failed to toggle todo', error);
      // Revert on error
      fetchTodos();
    }
  };

  const handleDeleteTodo = async (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    try {
      await api.delete(`/api/todos/${id}/`);
    } catch (error) {
      console.error('Failed to delete todo', error);
      // Revert on error
      fetchTodos();
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <ClipboardList className="h-8 w-8 text-blue-500" />
                <h1 className="text-xl font-bold hidden sm:block">
                    Hello, {user?.first_name || user?.username}!
                </h1>
            </div>
            <button
                onClick={logout}
                className="flex items-center space-x-2 text-sm font-semibold px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
            >
                <LogOut size={16} />
                <span>Logout</span>
            </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 mt-4">
        {/* Add Todo Form */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
            <form onSubmit={handleAddTodo} className="flex gap-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <input
                    type="text"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    placeholder="What's on your mind today?"
                    className="flex-grow px-4 py-2 bg-transparent focus:outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400"
                />
                <button
                    type="submit"
                    className="flex-shrink-0 flex items-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                >
                    <Plus size={18} />
                    <span className="font-semibold">Add</span>
                </button>
            </form>
        </motion.div>

        {/* Todos List */}
        <div className="mt-8">
          {isLoadingTodos ? (
            <SkeletonLoader />
          ) : (
            <AnimatePresence>
              {todos.length > 0 ? (
                <ul className="space-y-4">
                  {todos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={handleToggleTodo}
                      onDelete={handleDeleteTodo}
                    />
                  ))}
                </ul>
              ) : (
                <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="text-center py-10 px-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">All clear!</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Looks like you have no tasks. Add one above to get started.</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}