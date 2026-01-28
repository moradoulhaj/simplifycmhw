import React, { useEffect, useState } from "react";
import { createUser, deleteUser, editUser, getUsers } from "../../api/apiService";

const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user || {};
};

function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: "",
    password: "",
    roles: "USER",
  });
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const currentUser = getCurrentUser();

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError("Failed to fetch users. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser.roles?.includes("ADMIN")) {
      fetchUsers();
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (editId) {
        await editUser(editId, form);
      } else {
        await createUser(form);
      }
      resetForm();
      await fetchUsers();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      username: "",
      password: "",
      roles: "USER",
    });
    setEditId(null);
  };

  const handleAddUser = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setForm({
      username: user.username,
      password: "",
      roles: user.roles,
    });
    setEditId(user.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    setIsLoading(true);
    try {
      await deleteUser(id);
      await fetchUsers();
    } catch (err) {
      setError("Failed to delete user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser.roles?.includes("ADMIN")) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="header-section">
        <h2>User Management</h2>
        <button className="add-user-btn" onClick={handleAddUser}>
          Add User
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editId ? "Edit User" : "Add New User"}</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Password {editId && "(Leave blank to keep current)"}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required={!editId}
                />
              </div>

              <div className="form-group">
                <label htmlFor="roles">Role</label>
                <select 
                  id="roles" 
                  name="roles" 
                  value={form.roles} 
                  onChange={handleChange}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : editId ? "Update" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading && !users.length ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.roles}</td>
                  <td className={u.enabled ? "enabled" : "disabled"}>
                    {u.enabled ? "Active" : "Inactive"}
                  </td>
                  <td>{new Date(u.createdAt).toLocaleString()}</td>
                  <td className="actions">
                    <button 
                      onClick={() => handleEdit(u)} 
                      className="edit-btn"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(u.id)} 
                      className="delete-btn"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// CSS Styles
const styles = `
  .users-container {
    padding: 2rem;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 1200px;
    margin: 0 auto;
  }

  .access-denied {
    padding: 2rem;
    text-align: center;
    color: #dc3545;
  }

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .add-user-btn {
    background-color: #28a745;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    font-size: 1rem;
    transition: background-color 0.2s;
  }

  .add-user-btn:hover {
    background-color: #218838;
  }

  .error-message {
    padding: 1rem;
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }

  .loading {
    padding: 1rem;
    text-align: center;
    color: #6c757d;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6c757d;
    padding: 0 0.5rem;
  }

  .close-btn:hover {
    color: #495057;
  }

  .user-form {
    padding: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #495057;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 1rem;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .cancel-btn {
    background-color: #6c757d;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    font-size: 1rem;
    transition: background-color 0.2s;
  }

  .cancel-btn:hover {
    background-color: #5a6268;
  }

  .submit-btn {
    background-color: #007bff;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    font-size: 1rem;
    transition: background-color 0.2s;
  }

  .submit-btn:hover {
    background-color: #0069d9;
  }

  .submit-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  .users-table-container {
    overflow-x: auto;
    margin-top: 1.5rem;
  }

  .users-table {
    width: 100%;
    border-collapse: collapse;
  }

  .users-table th,
  .users-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
  }

  .users-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #495057;
  }

  .users-table tr:hover {
    background-color: #f8f9fa;
  }

  .enabled {
    color: #28a745;
    font-weight: 500;
  }

  .disabled {
    color: #dc3545;
    font-weight: 500;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .edit-btn,
  .delete-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: opacity 0.2s;
  }

  .edit-btn {
    background-color: #ffc107;
    color: #212529;
  }

  .edit-btn:hover {
    opacity: 0.9;
  }

  .delete-btn {
    background-color: #dc3545;
    color: white;
  }

  .delete-btn:hover {
    opacity: 0.9;
  }

  .edit-btn:disabled,
  .delete-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Add styles to the document
const styleElement = document.createElement("style");
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);

export default Users;