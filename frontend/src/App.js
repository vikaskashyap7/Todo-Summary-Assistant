import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/todos');
      setTodos(res.data);
    } catch (err) {
      console.error('Error fetching todos:', err);
    }
  };

  const addOrUpdateTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/todos/${editingId}`, { text: newTodo });
        setEditingId(null);
      } else {
        await axios.post('http://localhost:5000/api/todos', { text: newTodo });
      }
      setNewTodo('');
      fetchTodos();
    } catch (err) {
      console.error('Error adding/updating todo:', err);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteModal({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/todos/${deleteModal.id}`);
      setDeleteModal({ open: false, id: null });
      fetchTodos();
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ open: false, id: null });
  };

  const editTodo = (todo) => {
    setNewTodo(todo.text);
    setEditingId(todo._id);
  };

  const summarizeTodos = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/summarize');
      setMessage(res.data.message || ' Summary sent successfully to Slack!');
    } catch (err) {
      setMessage('Failed to send summary to Slack. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo Summary Assistant</h1>

      <div className="flex mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Enter your task"
          className="border p-2 flex-grow"
        />
        <button
          onClick={addOrUpdateTodo}
          className="bg-blue-500 text-white px-4 py-2 ml-2"
        >
          {editingId ? 'Update' : 'Add'}
        </button>
        {editingId && (
          <button
            onClick={() => {
              setEditingId(null);
              setNewTodo('');
            }}
            className="ml-2 px-4 py-2 bg-gray-400 text-white"
          >
            Cancel
          </button>
        )}
      </div>

      <ul className="mb-4">
        {todos.map((todo) => (
          <li key={todo._id} className="flex justify-between items-center border-b py-2">
            <span>{todo.text}</span>
            <div>
              <button
                onClick={() => editTodo(todo)}
                className="text-yellow-500 mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => openDeleteModal(todo._id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={summarizeTodos}
        disabled={loading}
        className={`px-4 py-2 text-white rounded ${
          loading ? 'bg-green-300 cursor-not-allowed' : 'bg-green-500'
        }`}
      >
        {loading ? 'Sending...' : 'Summarize & Send to Slack'}
      </button>

      {message && (
        <p className={`mt-4 font-medium ${message.startsWith('❌') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}

      {deleteModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-md text-center">
            <p className="mb-4 text-lg font-semibold">Are you sure you want to delete this task?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
