'use client';

import { useState, useEffect } from 'react';
import { User, AttendanceRecord, RegularizationRequest } from '@/lib/types';
import {
  users,
  getAllRecords,
  getAuthUser,
  setAuthUser,
  getRecordsByUserId,
  clearAllData,
  initializeSampleData,
  getAllRegularizations,
  approveRegularization,
  rejectRegularization,
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  addAttendanceRecord,
  employeeIdExists,
  emailExists,
  getCustomUsers,
} from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Building2,
  Users as UsersIcon,
  Clock,
  Calendar,
  ArrowLeft,
  Download,
  User as UserIcon,
  LogOut,
  Shield,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Mail,
  Briefcase,
  BadgeCheck,
  FileEdit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  UserPlus,
  ClipboardList,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { LoginPage } from '@/components/login-page';

type TabType = 'employees' | 'records' | 'regularizations' | 'user-management' | 'login-details';

interface EmployeeFormData {
  employeeId: string;
  name: string;
  email: string;
  password: string;
  department: string;
  designation: string;
  bdayDate: string;
}

const initialFormData: EmployeeFormData = {
  employeeId: '',
  name: '',
  email: '',
  password: '',
  department: '',
  designation: '',
  bdayDate: "",
};

const departments = [
  'Engineering',
  'Human Resources',
  'Finance',
  'Marketing',
  'Design',
  'Sales',
  'Operations',
  'Quality Assurance',
  'Administration',
];

export default function AdminPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [regularizations, setRegularizations] = useState<RegularizationRequest[]>([]);
  const [allEmployees, setAllEmployees] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('employees');

  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = allEmployees.filter((employee) => {
    const term = searchTerm.toLowerCase();

    return (
      employee.name.toLowerCase().includes(term) ||
      employee.employeeId.toLowerCase().includes(term)
    );
  });

  // User management state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<EmployeeFormData>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Attendance editing state
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editRecordData, setEditRecordData] = useState<{ loginTime: string; logoutTime: string }>({ loginTime: '', logoutTime: '' });

  // Add attendance state
  const [showAddAttendance, setShowAddAttendance] = useState(false);
  const [addAttendanceData, setAddAttendanceData] = useState({ userId: '', date: '', loginTime: '', logoutTime: '' });

  useEffect(() => {
    initializeSampleData();
    const user = getAuthUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadData();
    }
  }, [currentUser]);

  const loadData = () => {
    setRecords(getAllRecords());
    setRegularizations(getAllRegularizations());
    setAllEmployees(getAllEmployees());
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role !== 'admin') {
      window.location.href = '/';
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
    setCurrentUser(null);
  };

  const handleRefreshData = () => {
    clearAllData();
    loadData();
  };

  const handleApproveRegularization = (requestId: string) => {
    if (currentUser) {
      approveRegularization(requestId, currentUser.id);
      loadData();
    }
  };

  const handleRejectRegularization = (requestId: string) => {
    if (currentUser) {
      rejectRegularization(requestId, currentUser.id);
      loadData();
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<EmployeeFormData> = {};

    if (!formData.employeeId.trim()) {
      errors.employeeId = 'Employee ID is required';
    } else if (employeeIdExists(formData.employeeId, editingUserId || undefined)) {
      errors.employeeId = 'Employee ID already exists';
    }

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    } else if (emailExists(formData.email, editingUserId || undefined)) {
      errors.email = 'Email already exists';
    }

    if (!editingUserId && !formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (!editingUserId && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.department.trim()) {
      errors.department = 'Department is required';
    }

    if (!formData.designation.trim()) {
      errors.designation = 'Designation is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add new employee
  const handleAddEmployee = () => {
    if (!validateForm()) return;

    addEmployee({
      employeeId: formData.employeeId,
      name: formData.name,
      email: formData.email,
      bdayDate: formData.bdayDate,
      password: formData.password,
      department: formData.department,
      designation: formData.designation,
      role: 'employee',
    });

    setFormData(initialFormData);
    setShowAddForm(false);
    loadData();
  };

  // Edit employee
  const handleEditEmployee = (user: User) => {
    setEditingUserId(user.id);
    setFormData({
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      password: '',
      department: user.department,
      designation: user.designation,
      bdayDate: "1995-06-15",
    });
    setFormErrors({});
  };

  // Save edited employee
  const handleSaveEmployee = () => {
    if (!editingUserId || !validateForm()) return;

    const updates: Partial<User> = {
      employeeId: formData.employeeId,
      name: formData.name,
      email: formData.email,
      department: formData.department,
      designation: formData.designation,
    };

    if (formData.password.trim()) {
      updates.password = formData.password;
    }

    updateEmployee(editingUserId, updates);
    setEditingUserId(null);
    setFormData(initialFormData);
    loadData();
  };

  // Delete employee
  const handleDeleteEmployee = (userId: string) => {
    if (confirm('Are you sure you want to delete this employee? All their attendance records will also be deleted.')) {
      deleteEmployee(userId);
      loadData();
    }
  };

  // Edit attendance record
  const handleEditRecord = (record: AttendanceRecord) => {
    setEditingRecordId(record.id);
    setEditRecordData({
      loginTime: record.loginTime || '',
      logoutTime: record.logoutTime || '',
    });
  };

  // Save edited record
  const handleSaveRecord = () => {
    if (!editingRecordId) return;

    updateAttendanceRecord(editingRecordId, {
      loginTime: editRecordData.loginTime,
      logoutTime: editRecordData.logoutTime,
    });

    setEditingRecordId(null);
    setEditRecordData({ loginTime: '', logoutTime: '' });
    loadData();
  };

  // Delete attendance record
  const handleDeleteRecord = (recordId: string) => {
    if (confirm('Are you sure you want to delete this attendance record?')) {
      deleteAttendanceRecord(recordId);
      loadData();
    }
  };

  // Add attendance record
  const handleAddAttendanceRecord = () => {
    if (!addAttendanceData.userId || !addAttendanceData.date || !addAttendanceData.loginTime || !addAttendanceData.logoutTime) {
      alert('Please fill all fields');
      return;
    }

    addAttendanceRecord(
      addAttendanceData.userId,
      addAttendanceData.date,
      addAttendanceData.loginTime,
      addAttendanceData.logoutTime
    );

    setAddAttendanceData({ userId: '', date: '', loginTime: '', logoutTime: '' });
    setShowAddAttendance(false);
    loadData();
  };

  const filteredRecords = selectedUser
    ? records.filter((r) => r.userId === selectedUser)
    : records;

  const pendingRegularizations = regularizations.filter(r => r.status === 'pending');

  const downloadCSV = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Date', 'Login Time', 'Logout Time', 'Total Hours', 'Status'];
    const rows = filteredRecords.map((record) => {
      const user = getEmployeeById(record.userId);
      return [
        user?.employeeId || '',
        user?.name || '',
        user?.email || '',
        user?.department || '',
        record.date,
        record.loginTime || '',
        record.logoutTime || '',
        record.totalHours || '',
        record.status,
      ];
    });

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getUserStats = (userId: string) => {
    const userRecords = getRecordsByUserId(userId);
    const presentDays = userRecords.filter(r => r.status === 'present').length;
    const halfDays = userRecords.filter(r => r.status === 'half-day').length;
    return { total: userRecords.length, presentDays, halfDays };
  };

  const customUsers = getCustomUsers();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div>
        <LoginPage onLogin={handleLogin} />
        {currentUser && currentUser.role !== 'admin' && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="pt-6 text-center">
                <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
                <p className="text-muted-foreground mb-4">
                  You need admin privileges to access this page.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/">
                    <Button variant="outline">Go to Employee Portal</Button>
                  </Link>
                  <Button onClick={handleLogout}>Login as Admin</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-card-foreground">Hexalytics Admin</h1>
                <p className="text-xs text-muted-foreground">Attendance Management System</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleRefreshData} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button variant="outline" size="sm" onClick={downloadCSV} className="gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Portal</span>
                </Button>
              </Link>
              <ThemeToggle />
              <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Info */}
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Logged in as: {currentUser.name}</p>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
            Administrator
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{allEmployees.length}</p>
                  <p className="text-sm text-muted-foreground">Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{records.length}</p>
                  <p className="text-sm text-muted-foreground">Records</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {records.filter((r) => r.status === 'present').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Present</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {records.filter((r) => r.status === 'half-day').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Half Days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={pendingRegularizations.length > 0 ? 'border-yellow-400' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FileEdit className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {pendingRegularizations.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'employees'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              Employees
            </div>
          </button>
          <button
            onClick={() => setActiveTab('user-management')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'user-management'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Manage Users
            </div>
          </button>
          <button
            onClick={() => setActiveTab('login-details')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'login-details'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Login Details
            </div>
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'records'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              All Records
            </div>
          </button>
          <button
            onClick={() => setActiveTab('regularizations')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'regularizations'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            <div className="flex items-center gap-2">
              <FileEdit className="w-4 h-4" />
              Regularizations
              {pendingRegularizations.length > 0 && (
                <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {pendingRegularizations.length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* User Management Tab */}
        {activeTab === 'user-management' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                User Management
              </CardTitle>
              <div className='flex items-center gap-3'>
                <div><Input placeholder="Search employees..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} /></div>
                <Button onClick={() => { setShowAddForm(true); setEditingUserId(null); setFormData(initialFormData); setFormErrors({}); }} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Employee
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add/Edit Form */}
              {(showAddForm || editingUserId) && (
                <div className="mb-6 p-4 bg-muted/30 border border-border rounded-lg">
                  <h3 className="font-semibold text-foreground mb-4">
                    {editingUserId ? 'Edit Employee' : 'Add New Employee'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Employee ID</label>
                      <Input
                        value={formData.employeeId}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        placeholder="EMP011"
                        className={formErrors.employeeId ? 'border-destructive' : ''}
                      />
                      {formErrors.employeeId && <p className="text-xs text-destructive mt-1">{formErrors.employeeId}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className={formErrors.name ? 'border-destructive' : ''}
                      />
                      {formErrors.name && <p className="text-xs text-destructive mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john.doe@hexalytics.com"
                        className={formErrors.email ? 'border-destructive' : ''}
                      />
                      {formErrors.email && <p className="text-xs text-destructive mt-1">{formErrors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Password {editingUserId && <span className="text-muted-foreground">(leave blank to keep current)</span>}
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="******"
                          className={formErrors.password ? 'border-destructive pr-10' : 'pr-10'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {formErrors.password && <p className="text-xs text-destructive mt-1">{formErrors.password}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Birthday Date
                      </label>
                      <Input
                        type="date"
                        value={formData.bdayDate}
                        onChange={(e) =>
                          setFormData({ ...formData, bdayDate: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Department</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className={`w-full h-10 px-3 rounded-md border ${formErrors.department ? 'border-destructive' : 'border-input'} bg-background text-foreground`}
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      {formErrors.department && <p className="text-xs text-destructive mt-1">{formErrors.department}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Designation</label>
                      <Input
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        placeholder="Software Engineer"
                        className={formErrors.designation ? 'border-destructive' : ''}
                      />
                      {formErrors.designation && <p className="text-xs text-destructive mt-1">{formErrors.designation}</p>}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button onClick={editingUserId ? handleSaveEmployee : handleAddEmployee} className="gap-2">
                      <Save className="w-4 h-4" />
                      {editingUserId ? 'Save Changes' : 'Add Employee'}
                    </Button>
                    <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingUserId(null); setFormData(initialFormData); setFormErrors({}); }}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Employees Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Employee ID</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Birthday Date</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Department</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Designation</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td className="text-center p-3">
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((employee) => {
                        const isCustom = employee.id.startsWith("custom-");

                        return (
                          <tr key={employee.id}>
                            <td className="py-3 px-4 text-foreground font-mono">{employee.employeeId}</td>
                            <td className="py-3 px-4 text-foreground">{employee.name}</td>
                            <td className="py-3 px-4 text-foreground">{employee.email}</td>
                            <td className="py-3 px-4 text-foreground">{employee.bdayDate || "-"}</td>
                            <td className="py-3 px-4 text-foreground">{employee.department}</td>
                            <td className="py-3 px-4 text-foreground">{employee.designation}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${isCustom ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'}`}>
                                {isCustom ? 'Custom' : 'Default'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditEmployee(employee)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                {isCustom && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteEmployee(employee.id)}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Login Details Tab */}
        {activeTab === 'login-details' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                All Users Login Credentials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This table shows login credentials for all users. Use the &quot;Manage Users&quot; tab to edit credentials.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Employee ID</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email (Username)</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Password</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Role</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Admin User */}
                    <tr className="border-b border-border bg-primary/5">
                      <td className="py-3 px-4 text-foreground font-mono">ADMIN001</td>
                      <td className="py-3 px-4 text-foreground font-medium">Admin User</td>
                      <td className="py-3 px-4 text-foreground">admin@hexalytics.com</td>
                      <td className="py-3 px-4 text-foreground font-mono">admin123</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">Admin</span>
                      </td>
                      <td className="py-3 px-4 text-foreground">Administration</td>
                    </tr>
                    {/* Employee Users */}
                    {allEmployees.map((employee) => (
                      <tr key={employee.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="py-3 px-4 text-foreground font-mono">{employee.employeeId}</td>
                        <td className="py-3 px-4 text-foreground">{employee.name}</td>
                        <td className="py-3 px-4 text-foreground">{employee.email}</td>
                        <td className="py-3 px-4 text-foreground font-mono">{employee.password}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">Employee</span>
                        </td>
                        <td className="py-3 px-4 text-foreground">{employee.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <UsersIcon className="w-5 h-5" />
                All Employees &amp; Attendance Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allEmployees.map((user) => {
                  const stats = getUserStats(user.id);
                  const userRecords = getRecordsByUserId(user.id);
                  const isExpanded = expandedUser === user.id;

                  return (
                    <div
                      key={user.id}
                      className="border border-border rounded-lg overflow-hidden"
                    >
                      <div
                        className="p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                              <span className="text-lg font-bold text-primary-foreground">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{user.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <BadgeCheck className="w-3.5 h-3.5" />
                                  {user.employeeId}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-3.5 h-3.5" />
                                  {user.department}
                                </span>
                                <span className="hidden md:flex items-center gap-1">
                                  <Mail className="w-3.5 h-3.5" />
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-3">
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                {stats.presentDays} Present
                              </span>
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                {stats.halfDays} Half-day
                              </span>
                              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                                {stats.total} Total
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 border-t border-border bg-card">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">Employee ID</p>
                              <p className="font-medium text-foreground">{user.employeeId}</p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">Designation</p>
                              <p className="font-medium text-foreground">{user.designation}</p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">Department</p>
                              <p className="font-medium text-foreground">{user.department}</p>
                            </div>
                          </div>

                          <h4 className="font-medium text-foreground mb-3">Attendance Records</h4>
                          {userRecords.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                              No attendance records found for this employee
                            </p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-border">
                                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Login Time</th>
                                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Logout Time</th>
                                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Total Hours</th>
                                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {userRecords.map((record) => (
                                    <tr key={record.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                      <td className="py-2 px-3 text-foreground">
                                        {new Date(record.date).toLocaleDateString('en-IN', {
                                          weekday: 'short',
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric',
                                        })}
                                      </td>
                                      <td className="py-2 px-3 text-foreground">{record.loginTime || '-'}</td>
                                      <td className="py-2 px-3 text-foreground">{record.logoutTime || '-'}</td>
                                      <td className="py-2 px-3 text-foreground">{record.totalHours || '-'}</td>
                                      <td className="py-2 px-3">
                                        <span
                                          className={`px-2 py-1 text-xs rounded-full ${record.status === 'present'
                                            ? 'bg-green-100 text-green-700'
                                            : record.status === 'half-day'
                                              ? 'bg-yellow-100 text-yellow-700'
                                              : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                          {record.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Records Tab */}
        {activeTab === 'records' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                All Attendance Records
              </CardTitle>
              <Button onClick={() => setShowAddAttendance(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Record
              </Button>
            </CardHeader>
            <CardContent>
              {/* Add Attendance Form */}
              {showAddAttendance && (
                <div className="mb-6 p-4 bg-muted/30 border border-border rounded-lg">
                  <h3 className="font-semibold text-foreground mb-4">Add Attendance Record</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Employee</label>
                      <select
                        value={addAttendanceData.userId}
                        onChange={(e) => setAddAttendanceData({ ...addAttendanceData, userId: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                      >
                        <option value="">Select Employee</option>
                        {allEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Date</label>
                      <Input
                        type="date"
                        value={addAttendanceData.date}
                        onChange={(e) => setAddAttendanceData({ ...addAttendanceData, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Login Time</label>
                      <Input
                        type="time"
                        value={addAttendanceData.loginTime}
                        onChange={(e) => setAddAttendanceData({ ...addAttendanceData, loginTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Logout Time</label>
                      <Input
                        type="time"
                        value={addAttendanceData.logoutTime}
                        onChange={(e) => setAddAttendanceData({ ...addAttendanceData, logoutTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button onClick={handleAddAttendanceRecord} className="gap-2">
                      <Save className="w-4 h-4" />
                      Add Record
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddAttendance(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Filter */}
              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  variant={selectedUser === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  All
                </Button>
                {allEmployees.map((user) => (
                  <Button
                    key={user.id}
                    variant={selectedUser === user.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedUser(user.id)}
                  >
                    {user.name.split(' ')[0]}
                  </Button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Employee</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Login Time</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Logout Time</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Total Hours</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => {
                      const employee = getEmployeeById(record.userId);
                      const isEditing = editingRecordId === record.id;

                      return (
                        <tr key={record.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="py-3 px-4 text-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">
                                  {employee?.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{employee?.name}</p>
                                <p className="text-xs text-muted-foreground">{employee?.employeeId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-foreground">
                            {new Date(record.date).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </td>
                          <td className="py-3 px-4 text-foreground">
                            {isEditing ? (
                              <Input
                                type="time"
                                value={editRecordData.loginTime}
                                onChange={(e) => setEditRecordData({ ...editRecordData, loginTime: e.target.value })}
                                className="w-32"
                              />
                            ) : (
                              record.loginTime || '-'
                            )}
                          </td>
                          <td className="py-3 px-4 text-foreground">
                            {isEditing ? (
                              <Input
                                type="time"
                                value={editRecordData.logoutTime}
                                onChange={(e) => setEditRecordData({ ...editRecordData, logoutTime: e.target.value })}
                                className="w-32"
                              />
                            ) : (
                              record.logoutTime || '-'
                            )}
                          </td>
                          <td className="py-3 px-4 text-foreground">{record.totalHours || '-'}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${record.status === 'present'
                                ? 'bg-green-100 text-green-700'
                                : record.status === 'half-day'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                                }`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {isEditing ? (
                                <>
                                  <Button variant="ghost" size="sm" onClick={handleSaveRecord} className="h-8 w-8 p-0 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => setEditingRecordId(null)} className="h-8 w-8 p-0">
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button variant="ghost" size="sm" onClick={() => handleEditRecord(record)} className="h-8 w-8 p-0">
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteRecord(record.id)}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Regularizations Tab */}
        {activeTab === 'regularizations' && (
          <div className="space-y-6">
            {/* Pending Regularizations */}
            <Card className={pendingRegularizations.length > 0 ? 'border-yellow-400' : ''}>
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Pending Regularization Requests
                  {pendingRegularizations.length > 0 && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      {pendingRegularizations.length}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingRegularizations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending requests</p>
                ) : (
                  <div className="space-y-4">
                    {pendingRegularizations.map((request) => {
                      const employee = getEmployeeById(request.userId);
                      return (
                        <div key={request.id} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {employee?.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{employee?.name}</p>
                                <p className="text-sm text-muted-foreground">{employee?.employeeId} - {employee?.department}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveRegularization(request.id)}
                                className="gap-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectRegularization(request.id)}
                                className="gap-1"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </Button>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Date</p>
                              <p className="font-medium text-foreground">
                                {new Date(request.date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Login Time</p>
                              <p className="font-medium text-foreground">{request.loginTime}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Logout Time</p>
                              <p className="font-medium text-foreground">{request.logoutTime}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Submitted</p>
                              <p className="font-medium text-foreground">
                                {new Date(request.createdAt).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-white rounded border border-yellow-100">
                            <p className="text-sm text-muted-foreground">Reason:</p>
                            <p className="text-sm text-foreground">{request.reason}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Regularizations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <FileEdit className="w-5 h-5" />
                  All Regularization Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Employee</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Login</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Logout</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Reason</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regularizations.map((request) => {
                        const employee = getEmployeeById(request.userId);
                        return (
                          <tr key={request.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                            <td className="py-3 px-4 text-foreground">
                              <div>
                                <p className="font-medium">{employee?.name}</p>
                                <p className="text-xs text-muted-foreground">{employee?.employeeId}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-foreground">
                              {new Date(request.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </td>
                            <td className="py-3 px-4 text-foreground">{request.loginTime}</td>
                            <td className="py-3 px-4 text-foreground">{request.logoutTime}</td>
                            <td className="py-3 px-4 text-foreground max-w-xs truncate">{request.reason}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${request.status === 'approved'
                                  ? 'bg-green-100 text-green-700'
                                  : request.status === 'rejected'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                  }`}
                              >
                                {request.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(request.createdAt).toLocaleDateString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
