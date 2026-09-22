import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Key, 
  History, 
  Plus, 
  Search, 
  ShieldAlert, 
  Save, 
  Mail,
  Phone
} from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

interface UserAccount {
  id: number;
  username: string;
  email: string;
  mobile: string;
  role: string;
  status: 'Active' | 'Inactive';
  last_login: string;
}

interface RoleInfo {
  id: number;
  name: string;
  description: string;
  users_count: number;
}

interface ActivityLogItem {
  id: number;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  status: 'Success' | 'Warning' | 'Info';
}

type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export';

const MODULES_LIST = [
  'Dashboard',
  'Sales',
  'Purchase',
  'Products / Inventory',
  'Customers',
  'Vendors',
  'Pending Payments',
  'Banking',
  'Returns',
  'Expenses',
  'Reports',
  'Invoices',
  'Users',
  'Settings'
];

const UsersRoles: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions' | 'activity'>('users');
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [permissions, setPermissions] = useState<Record<string, Record<string, Record<PermissionAction, boolean>>>>({});
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Role for Permission Matrix
  const [selectedRole, setSelectedRole] = useState('Admin');

  // Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newRole, setNewRole] = useState('Sales Staff');
  const [newStatus, setNewStatus] = useState<'Active' | 'Inactive'>('Active');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, permsRes, logsRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles'),
        api.get('/permissions'),
        api.get('/activity-logs')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
      setActivityLogs(logsRes.data);
    } catch (err) {
      console.error(err);
      showToast('Error loading users & roles data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (mod: string, action: PermissionAction) => {
    const updated = { ...permissions };
    if (!updated[selectedRole]) updated[selectedRole] = {};
    if (!updated[selectedRole][mod]) {
      updated[selectedRole][mod] = { view: false, create: false, edit: false, delete: false, export: false };
    }
    updated[selectedRole][mod][action] = !updated[selectedRole][mod][action];
    setPermissions(updated);
  };

  const handleSavePermissions = async () => {
    try {
      await api.post('/permissions', permissions);
      showToast(`Permissions updated for role "${selectedRole}"!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save permissions', 'error');
    }
  };

  const handleToggleUserStatus = async (user: UserAccount) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/users/${user.id}`, { status: nextStatus });
      showToast(`User "${user.username}" marked as ${nextStatus}`, 'success');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to update status', 'error');
    }
  };

  const handleAddUser = async () => {
    const errs: Record<string, string> = {};
    if (!newUsername.trim()) errs.username = 'Username is required';
    if (!newEmail.trim()) errs.email = 'Email address is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      await api.post('/users', {
        username: newUsername.trim(),
        email: newEmail.trim(),
        mobile: newMobile.trim(),
        role: newRole,
        status: newStatus
      });
      showToast(`User account "${newUsername}" created successfully!`, 'success');
      setIsAddUserModalOpen(false);
      setNewUsername('');
      setNewEmail('');
      setNewMobile('');
      setNewRole('Sales Staff');
      setNewStatus('Active');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to add user account', 'error');
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-pulse">
        <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
        <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Users, Roles & Security Permissions
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage user accounts, assign enterprise roles, customize module access rights and audit staff activities.
          </p>
        </div>

        <button
          onClick={() => {
            setErrors({});
            setIsAddUserModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Users className="w-4 h-4" />
          User Accounts ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'roles'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Key className="w-4 h-4" />
          System Roles ({roles.length})
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'permissions'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Permission Matrix
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <History className="w-4 h-4" />
          Staff Activity Log
        </button>
      </div>

      {/* TAB 1: USERS LIST */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search users by name, email or role..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <span className="text-xs font-semibold text-zinc-500">
              {filteredUsers.length} staff accounts registered
            </span>
          </div>

          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Contact Details</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4">Last Login</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                            {u.username.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100">{u.username}</p>
                            <span className="text-[10px] text-zinc-400 font-mono">UID: #{u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{u.email}</span>
                        </div>
                        {u.mobile && (
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            <span>{u.mobile}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          u.role === 'Admin'
                            ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
                            : u.role === 'Manager'
                            ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                            : u.role === 'Accountant'
                            ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                          u.status === 'Active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">
                        {u.last_login}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            u.status === 'Active'
                              ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                          }`}
                        >
                          {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map(role => (
            <div key={role.id} className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {role.name}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400">
                    {role.users_count} Users
                  </span>
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-3">{role.name} Role</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {role.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedRole(role.name);
                    setActiveTab('permissions');
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Configure Permissions →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: PERMISSION MATRIX */}
      {activeTab === 'permissions' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-150 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">Role-Based Access Control Matrix</h2>
              <p className="text-xs text-zinc-500">Enable or disable granular CRUD permissions for each role across all modules.</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="px-3 py-2 text-xs font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-800 dark:text-zinc-200"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.name}>{r.name} Role</option>
                ))}
              </select>

              <button
                onClick={handleSavePermissions}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">ERP Module</th>
                  <th className="py-3.5 px-4 text-center">View</th>
                  <th className="py-3.5 px-4 text-center">Create</th>
                  <th className="py-3.5 px-4 text-center">Edit</th>
                  <th className="py-3.5 px-4 text-center">Delete</th>
                  <th className="py-3.5 px-4 text-center">Export</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
                {MODULES_LIST.map(mod => {
                  const rolePerms = permissions[selectedRole]?.[mod] || {
                    view: false,
                    create: false,
                    edit: false,
                    delete: false,
                    export: false
                  };

                  return (
                    <tr key={mod} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {mod}
                      </td>
                      {(['view', 'create', 'edit', 'delete', 'export'] as PermissionAction[]).map(action => (
                        <td key={action} className="py-3.5 px-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rolePerms[action] || false}
                              onChange={() => handleTogglePermission(mod, action)}
                              className="w-4 h-4 rounded text-indigo-600 bg-zinc-100 border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 focus:ring-indigo-500 cursor-pointer"
                            />
                          </label>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVITY LOG */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Audit Trail & Activity Log</h3>
            <p className="text-xs text-zinc-500">Live stream of critical system transactions, edits and administrative events.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Action Performed</th>
                  <th className="py-3.5 px-4">Module</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60">
                {activityLogs.map(log => (
                  <tr key={log.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                    <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {log.user}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300 font-medium">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        log.status === 'Success'
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : log.status === 'Warning'
                          ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          : 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Add Staff User Profile"
        onConfirm={handleAddUser}
        confirmLabel="Create Account"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Username *
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              placeholder="e.g. kiran.kumar"
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 font-semibold"
            />
            {errors.username && <p className="text-rose-500 text-[11px] mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="kiran@shopmanager.in"
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
            {errors.email && <p className="text-rose-500 text-[11px] mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Mobile Number
            </label>
            <input
              type="text"
              value={newMobile}
              onChange={e => setNewMobile(e.target.value)}
              placeholder="9876543210"
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Assign Role
              </label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 font-semibold"
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Sales Staff">Sales Staff</option>
                <option value="Purchase Staff">Purchase Staff</option>
                <option value="Accountant">Accountant</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Initial Status
              </label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersRoles;
