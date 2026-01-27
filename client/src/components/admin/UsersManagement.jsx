import React, { useState, useEffect } from 'react';
import { Search, Lock, Unlock, Trash2, Eye, Shield } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export function UsersManagement({ accessToken }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search }),
      });

      const res = await fetch(`${API_BASE}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setSelectedUser(data);
      setShowDetails(true);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    setRoleLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert('Error: ' + (data.message || 'Failed to change role'));
        return;
      }

      // Update user in list and details
      setUsers(users.map((u) => (u._id === userId ? data.user : u)));
      if (selectedUser && selectedUser.user._id === userId) {
        setSelectedUser({
          ...selectedUser,
          user: data.user,
        });
      }
      setShowRoleModal(false);
      alert(`✅ Role changed to ${newRole === 'admin' ? 'Admin' : 'User'}\n\nNote: User needs to logout and login again to apply the new role.`);
    } catch (err) {
      console.error('Failed to change role:', err);
      alert('Error: ' + (err.message || 'Connection failed'));
    } finally {
      setRoleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-600 mt-2">Manage and monitor all users in the system.</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No users found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Joined</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-6 py-3 text-slate-900">{user.email}</td>
                      <td className="px-6 py-3 text-slate-700">{user.name || '-'}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 flex gap-2">
                        <button
                          onClick={() => handleViewDetails(user._id)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye size={18} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser({ user }); // Wrap in { user } for consistent structure
                            setShowRoleModal(true);
                          }}
                          className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                          title="Change role"
                        >
                          <Shield size={18} className="text-purple-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total users)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border border-slate-300 rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                    className="px-3 py-1 border border-slate-300 rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Details Modal */}
      {showDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-screen overflow-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">User Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-semibold text-slate-900">{selectedUser.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Name</p>
                  <p className="font-semibold text-slate-900">{selectedUser.user.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Role</p>
                  <p className="font-semibold text-slate-900 capitalize">{selectedUser.user.role}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Joined</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(selectedUser.user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Learning Stats */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-slate-900 mb-3">Learning Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600">Lessons Completed</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedUser.stats.totalLessonsCompleted}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600">Quizzes Completed</p>
                    <p className="text-2xl font-bold text-green-600">{selectedUser.stats.totalQuizzesCompleted}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600">Average Score</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedUser.stats.averageScore}%</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600">Total Study Time</p>
                    <p className="text-2xl font-bold text-orange-600">{selectedUser.stats.totalStudyTime}m</p>
                  </div>
                </div>
              </div>

              {/* Recent Quiz Attempts */}
              {selectedUser.quizAttempts.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Recent Quiz Attempts</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedUser.quizAttempts.map((attempt) => (
                      <div key={attempt._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-700">Score: {attempt.score}/{attempt.total}</span>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          attempt.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {attempt.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Change User Role</h2>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-2">User: <span className="font-semibold">{selectedUser.user.email}</span></p>
                <p className="text-sm text-slate-600 mb-4">Current Role: <span className="font-semibold capitalize">{selectedUser.user.role}</span></p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-slate-900 mb-3">Select New Role:</p>
                <div className="space-y-2">
                  <button
                    onClick={() => handleChangeRole(selectedUser.user._id, 'user')}
                    disabled={selectedUser.user.role === 'user' || roleLoading}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      selectedUser.user.role === 'user'
                        ? 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed'
                        : 'border-slate-300 hover:bg-blue-50 hover:border-blue-500'
                    }`}
                  >
                    <p className="font-medium">👤 User</p>
                    <p className="text-xs text-slate-600">Regular learning user</p>
                  </button>

                  <button
                    onClick={() => handleChangeRole(selectedUser.user._id, 'admin')}
                    disabled={selectedUser.user.role === 'admin' || roleLoading}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      selectedUser.user.role === 'admin'
                        ? 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed'
                        : 'border-slate-300 hover:bg-purple-50 hover:border-purple-500'
                    }`}
                  >
                    <p className="font-medium">👑 Admin</p>
                    <p className="text-xs text-slate-600">Full system access</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowRoleModal(false)}
                disabled={roleLoading}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
