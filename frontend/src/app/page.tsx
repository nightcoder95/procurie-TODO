'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Todo } from '../types';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Plus, LogOut, ClipboardList, Pencil, Search } from 'lucide-react';
import TodoModal from '../components/TodoModal';

// Import the toast function
import { toast } from 'react-toastify';

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
  onEdit,
}: {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (todo: Todo) => void;
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
      <button
        onClick={() => onToggle(todo.id)}
        className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
          todo.is_completed
            ? 'bg-blue-500 border-blue-500'
            : 'border-gray-300 dark:border-gray-500 hover:border-blue-500'
        }`}
      >
        {todo.is_completed && <Check className="w-4 h-4 text-white" />}
      </button>

      <div className="ml-4 flex-grow">
        <span
          className={`font-medium transition-colors duration-300 ${
            todo.is_completed
              ? 'line-through text-gray-500 dark:text-gray-400/80'
              : 'text-gray-800 dark:text-gray-100'
          }`}
        >
          {todo.title}
        </span>
        {todo.description && (
          <p className={`text-sm mt-1 transition-colors duration-300 ${
            todo.is_completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {todo.description}
          </p>
        )}
      </div>
      
      <div className="flex items-center ml-4 space-x-2">
        <button
          onClick={() => onEdit(todo)}
          className="p-1.5 rounded-full text-gray-400 hover:bg-green-500/10 hover:text-green-500 transition-all duration-200"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="p-1.5 rounded-full text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.li>
  );
}


// ===================================
// Main Page Component
// ===================================
export default function HomePage() {
  const { user, loading, logout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoadingTodos, setIsLoadingTodos] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<Todo | null>(null);

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
        if (user) {
            fetchTodos();
        }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filter, user]);

  const fetchTodos = async () => {
    setIsLoadingTodos(true);
    try {
        let url = '/api/todos/';
        const params = new URLSearchParams();
        if (filter !== 'all') {
            params.append('is_completed', filter === 'completed' ? 'true' : 'false');
        }
        if (searchTerm) {
            params.append('search', searchTerm);
        }
        const response = await api.get(`${url}?${params.toString()}`);
        setTodos(response.data.results);
    } catch (error) {
      console.error('Failed to fetch todos', error);
      toast.error('Failed to load your tasks.');
      setTodos([]);
    } finally {
      setIsLoadingTodos(false);
    }
  };
  
  const handleOpenEditModal = (todo: Todo) => {
    setTodoToEdit(todo);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (title: string, description: string) => {
    setIsModalLoading(true);
    const isEditing = !!todoToEdit;
    try {
        if (isEditing) {
            const response = await api.patch(`/api/todos/${todoToEdit.id}/`, { title, description });
            setTodos(todos.map(t => t.id === todoToEdit.id ? response.data : t));
            toast.success('Task updated successfully!');
        } else {
            const response = await api.post('/api/todos/', { title, description });
            setTodos([response.data, ...todos]);
            toast.success('New task added!');
        }
        setIsModalOpen(false);
        setTodoToEdit(null);
    } catch (error) {
        console.error('Failed to save todo', error);
        toast.error(isEditing ? 'Failed to update task.' : 'Failed to add task.');
    } finally {
        setIsModalLoading(false);
    }
  };

  const handleToggleTodo = async (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, is_completed: !t.is_completed } : t));
    try {
      await api.post(`/api/todos/${id}/toggle_complete/`);
      toast.info('Task status updated.');
    } catch (error) {
      console.error('Failed to toggle todo', error);
      toast.error('Could not update task status.');
      fetchTodos();
    }
  };

  const handleDeleteTodo = async (id: number) => {
    const originalTodos = [...todos];
    setTodos(todos.filter((todo) => todo.id !== id));
    try {
      await api.delete(`/api/todos/${id}/`);
      toast.success('Task deleted.');
    } catch (error) {
      console.error('Failed to delete todo', error);
      toast.error('Failed to delete the task.');
      setTodos(originalTodos);
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
    <>
      <TodoModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setTodoToEdit(null); }}
        onSubmit={handleModalSubmit}
        todoToEdit={todoToEdit}
        isLoading={isModalLoading}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
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

        <main className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            >
                <Plus size={18} />
                <span className="font-semibold">Add New Task</span>
            </button>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-8 p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-lg">
            {(['all', 'pending', 'completed'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors w-full ${
                        filter === f ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-500' : 'text-gray-500 hover:text-blue-500'
                    }`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
            ))}
          </div>

          <div>
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
                        onEdit={handleOpenEditModal}
                      />
                    ))}
                  </ul>
                ) : (
                  <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="text-center py-10 px-4">
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No tasks found!</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {searchTerm ? `No results for "${searchTerm}".` : "Try adding a new task to get started."}
                      </p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
    </>
  );
}