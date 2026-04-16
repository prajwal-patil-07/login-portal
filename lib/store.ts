import { User, AttendanceRecord, RegularizationRequest } from './types';

// Admin User
export const adminUser: User = {
  id: 'admin',
  employeeId: 'ADMIN001',
  name: 'Admin User',
  email: 'admin@hexalytics.com',
  password: 'admin123',
  department: 'Administration',
  designation: 'System Administrator',
  role: 'admin',
};

// 10 Sample Users
export const users: User[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@hexalytics.com',
    password: 'password123',
    department: 'Engineering',
    designation: 'Senior Developer',
    role: 'employee',
  },
  {
    id: '2',
    employeeId: 'EMP002',
    name: 'Priya Sharma',
    email: 'priya.sharma@hexalytics.com',
    password: 'password123',
    department: 'Human Resources',
    designation: 'HR Manager',
    role: 'employee',
  },
  {
    id: '3',
    employeeId: 'EMP003',
    name: 'Amit Patel',
    email: 'amit.patel@hexalytics.com',
    password: 'password123',
    department: 'Finance',
    designation: 'Accountant',
    role: 'employee',
  },
  {
    id: '4',
    employeeId: 'EMP004',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@hexalytics.com',
    password: 'password123',
    department: 'Marketing',
    designation: 'Marketing Lead',
    role: 'employee',
  },
  {
    id: '5',
    employeeId: 'EMP005',
    name: 'Vikram Singh',
    email: 'vikram.singh@hexalytics.com',
    password: 'password123',
    department: 'Engineering',
    designation: 'Tech Lead',
    role: 'employee',
  },
  {
    id: '6',
    employeeId: 'EMP006',
    name: 'Ananya Gupta',
    email: 'ananya.gupta@hexalytics.com',
    password: 'password123',
    department: 'Design',
    designation: 'UI/UX Designer',
    role: 'employee',
  },
  {
    id: '7',
    employeeId: 'EMP007',
    name: 'Rahul Verma',
    email: 'rahul.verma@hexalytics.com',
    password: 'password123',
    department: 'Sales',
    designation: 'Sales Executive',
    role: 'employee',
  },
  {
    id: '8',
    employeeId: 'EMP008',
    name: 'Meera Nair',
    email: 'meera.nair@hexalytics.com',
    password: 'password123',
    department: 'Operations',
    designation: 'Operations Manager',
    role: 'employee',
  },
  {
    id: '9',
    employeeId: 'EMP009',
    name: 'Karthik Iyer',
    email: 'karthik.iyer@hexalytics.com',
    password: 'password123',
    department: 'Engineering',
    designation: 'Full Stack Developer',
    role: 'employee',
  },
  {
    id: '10',
    employeeId: 'EMP010',
    name: 'Divya Menon',
    email: 'divya.menon@hexalytics.com',
    password: 'password123',
    department: 'Quality Assurance',
    designation: 'QA Lead',
    role: 'employee',
  },
];

// All users including admin
export const allUsers: User[] = [adminUser, ...users];

// Helper functions for localStorage
const ATTENDANCE_KEY = 'hexalytics_attendance';
const AUTH_KEY = 'hexalytics_auth';
const INITIALIZED_KEY = 'hexalytics_initialized';
const REGULARIZATION_KEY = 'hexalytics_regularizations';

// Generate sample attendance data for all users
function generateSampleData(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  // Generate data for last 7 days for all users
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split('T')[0];
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    users.forEach((user) => {
      // Random login time between 8:30 AM and 10:30 AM
      const loginHour = 8 + Math.floor(Math.random() * 2);
      const loginMinute = Math.floor(Math.random() * 60);
      const loginTime = `${loginHour.toString().padStart(2, '0')}:${loginMinute.toString().padStart(2, '0')}:00 AM`;
      
      // Random logout time between 5:00 PM and 7:30 PM
      const logoutHour = 5 + Math.floor(Math.random() * 2);
      const logoutMinute = Math.floor(Math.random() * 60);
      const logoutTime = `${(logoutHour).toString().padStart(2, '0')}:${logoutMinute.toString().padStart(2, '0')}:00 PM`;
      
      // Calculate total hours (approximate)
      const totalHours = `${8 + Math.floor(Math.random() * 2)}h ${Math.floor(Math.random() * 60)}m`;
      
      records.push({
        id: `${user.id}-${dateStr}`,
        userId: user.id,
        date: dateStr,
        loginTime,
        logoutTime,
        totalHours,
        status: 'present',
      });
    });
  }
  
  return records;
}

export function initializeSampleData(): void {
  if (typeof window === 'undefined') return;
  
  const initialized = localStorage.getItem(INITIALIZED_KEY);
  if (!initialized) {
    const sampleData = generateSampleData();
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(sampleData));
    localStorage.setItem(INITIALIZED_KEY, 'true');
  }
}

export function getAttendanceRecords(): AttendanceRecord[] {
  if (typeof window === 'undefined') return [];
  initializeSampleData();
  const data = localStorage.getItem(ATTENDANCE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveAttendanceRecord(record: AttendanceRecord): void {
  const records = getAttendanceRecords();
  const existingIndex = records.findIndex(
    (r) => r.userId === record.userId && r.date === record.date
  );
  
  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }
  
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
}

export function getTodayRecord(userId: string): AttendanceRecord | null {
  const records = getAttendanceRecords();
  const today = new Date().toISOString().split('T')[0];
  return records.find((r) => r.userId === userId && r.date === today) || null;
}

export function getUserRecords(userId: string): AttendanceRecord[] {
  const records = getAttendanceRecords();
  return records.filter((r) => r.userId === userId).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getAllRecords(): AttendanceRecord[] {
  return getAttendanceRecords().sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getRecordsByUserId(userId: string): AttendanceRecord[] {
  const records = getAttendanceRecords();
  return records
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAuthUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

export function setAuthUser(user: User | null): void {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function authenticateUser(email: string, password: string): User | null {
  // Check admin first
  if (adminUser.email.toLowerCase() === email.toLowerCase() && adminUser.password === password) {
    return adminUser;
  }
  // Check regular users
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
}

export function calculateTotalHours(loginTime: string, logoutTime: string): string {
  const login = new Date(`2000-01-01 ${loginTime}`);
  const logout = new Date(`2000-01-01 ${logoutTime}`);
  const diff = logout.getTime() - login.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getUserById(userId: string): User | undefined {
  if (userId === 'admin') return adminUser;
  return users.find(u => u.id === userId);
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ATTENDANCE_KEY);
  localStorage.removeItem(INITIALIZED_KEY);
  initializeSampleData();
}

// Check if user has already completed attendance for today (punched out)
export function hasCompletedAttendanceToday(userId: string): boolean {
  const todayRecord = getTodayRecord(userId);
  return !!(todayRecord?.loginTime && todayRecord?.logoutTime);
}

// Check if user can punch in today
export function canPunchInToday(userId: string): boolean {
  const todayRecord = getTodayRecord(userId);
  // Can punch in if no record exists for today
  return !todayRecord?.loginTime;
}

// Regularization Functions
export function getRegularizationRequests(): RegularizationRequest[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(REGULARIZATION_KEY);
  return data ? JSON.parse(data) : [];
}

export function getUserRegularizations(userId: string): RegularizationRequest[] {
  const requests = getRegularizationRequests();
  return requests
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAllRegularizations(): RegularizationRequest[] {
  return getRegularizationRequests().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function saveRegularizationRequest(request: RegularizationRequest): void {
  const requests = getRegularizationRequests();
  const existingIndex = requests.findIndex((r) => r.id === request.id);

  if (existingIndex >= 0) {
    requests[existingIndex] = request;
  } else {
    requests.push(request);
  }

  localStorage.setItem(REGULARIZATION_KEY, JSON.stringify(requests));
}

export function submitRegularization(
  userId: string,
  date: string,
  loginTime: string,
  logoutTime: string,
  reason: string
): RegularizationRequest {
  const request: RegularizationRequest = {
    id: `reg-${userId}-${date}-${Date.now()}`,
    userId,
    date,
    loginTime,
    logoutTime,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  saveRegularizationRequest(request);
  return request;
}

export function approveRegularization(
  requestId: string,
  adminId: string
): void {
  const requests = getRegularizationRequests();
  const request = requests.find((r) => r.id === requestId);

  if (request && request.status === 'pending') {
    request.status = 'approved';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date().toISOString();

    // Create attendance record from the regularization
    const attendanceRecord: AttendanceRecord = {
      id: `${request.userId}-${request.date}`,
      userId: request.userId,
      date: request.date,
      loginTime: request.loginTime,
      logoutTime: request.logoutTime,
      totalHours: calculateTotalHours(request.loginTime, request.logoutTime),
      status: 'present',
    };

    saveAttendanceRecord(attendanceRecord);
    saveRegularizationRequest(request);
  }
}

export function rejectRegularization(requestId: string, adminId: string): void {
  const requests = getRegularizationRequests();
  const request = requests.find((r) => r.id === requestId);

  if (request && request.status === 'pending') {
    request.status = 'rejected';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date().toISOString();
    saveRegularizationRequest(request);
  }
}

export function checkExistingRegularization(userId: string, date: string): boolean {
  const requests = getRegularizationRequests();
  return requests.some(
    (r) => r.userId === userId && r.date === date && r.status !== 'rejected'
  );
}

export function checkExistingAttendance(userId: string, date: string): boolean {
  const records = getAttendanceRecords();
  return records.some((r) => r.userId === userId && r.date === date);
}

// User Management Keys
const CUSTOM_USERS_KEY = 'hexalytics_custom_users';

// Get all custom users added by admin
export function getCustomUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CUSTOM_USERS_KEY);
  return data ? JSON.parse(data) : [];
}

// Save custom users
export function saveCustomUsers(customUsers: User[]): void {
  localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(customUsers));
}

// Get all users (default + custom)
export function getAllEmployees(): User[] {
  const customUsers = getCustomUsers();
  return [...users, ...customUsers];
}

// Add new employee
export function addEmployee(employee: Omit<User, 'id'>): User {
  const customUsers = getCustomUsers();
  const newId = `custom-${Date.now()}`;
  const newEmployee: User = {
    ...employee,
    id: newId,
  };
  customUsers.push(newEmployee);
  saveCustomUsers(customUsers);
  return newEmployee;
}

// Update employee
export function updateEmployee(userId: string, updates: Partial<User>): User | null {
  // Check if it's a custom user
  const customUsers = getCustomUsers();
  const customIndex = customUsers.findIndex(u => u.id === userId);
  
  if (customIndex >= 0) {
    customUsers[customIndex] = { ...customUsers[customIndex], ...updates };
    saveCustomUsers(customUsers);
    return customUsers[customIndex];
  }
  
  // For default users, we store updates in a separate key
  const updatedDefaults = getUpdatedDefaultUsers();
  updatedDefaults[userId] = { ...updatedDefaults[userId], ...updates };
  localStorage.setItem('hexalytics_updated_defaults', JSON.stringify(updatedDefaults));
  
  const defaultUser = users.find(u => u.id === userId);
  if (defaultUser) {
    return { ...defaultUser, ...updatedDefaults[userId] };
  }
  
  return null;
}

// Get updated default users
export function getUpdatedDefaultUsers(): Record<string, Partial<User>> {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem('hexalytics_updated_defaults');
  return data ? JSON.parse(data) : {};
}

// Get employee by ID (considering updates)
export function getEmployeeById(userId: string): User | null {
  if (userId === 'admin') return adminUser;
  
  // Check custom users first
  const customUsers = getCustomUsers();
  const customUser = customUsers.find(u => u.id === userId);
  if (customUser) return customUser;
  
  // Check default users with updates
  const defaultUser = users.find(u => u.id === userId);
  if (defaultUser) {
    const updates = getUpdatedDefaultUsers();
    return { ...defaultUser, ...updates[userId] };
  }
  
  return null;
}

// Delete employee
export function deleteEmployee(userId: string): boolean {
  // Only allow deleting custom users
  const customUsers = getCustomUsers();
  const index = customUsers.findIndex(u => u.id === userId);
  
  if (index >= 0) {
    customUsers.splice(index, 1);
    saveCustomUsers(customUsers);
    
    // Also delete their attendance records
    const records = getAttendanceRecords();
    const filteredRecords = records.filter(r => r.userId !== userId);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(filteredRecords));
    
    return true;
  }
  
  return false;
}

// Update attendance record (for admin)
export function updateAttendanceRecord(
  recordId: string,
  updates: Partial<AttendanceRecord>
): AttendanceRecord | null {
  const records = getAttendanceRecords();
  const index = records.findIndex(r => r.id === recordId);
  
  if (index >= 0) {
    // Recalculate total hours if login/logout times changed
    if (updates.loginTime && updates.logoutTime) {
      updates.totalHours = calculateTotalHours(updates.loginTime, updates.logoutTime);
    }
    
    records[index] = { ...records[index], ...updates };
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
    return records[index];
  }
  
  return null;
}

// Delete attendance record (for admin)
export function deleteAttendanceRecord(recordId: string): boolean {
  const records = getAttendanceRecords();
  const index = records.findIndex(r => r.id === recordId);
  
  if (index >= 0) {
    records.splice(index, 1);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
    return true;
  }
  
  return false;
}

// Add attendance record manually (for admin)
export function addAttendanceRecord(
  userId: string,
  date: string,
  loginTime: string,
  logoutTime: string
): AttendanceRecord {
  const totalHours = calculateTotalHours(loginTime, logoutTime);
  const record: AttendanceRecord = {
    id: `${userId}-${date}-${Date.now()}`,
    userId,
    date,
    loginTime,
    logoutTime,
    totalHours,
    status: 'present',
  };
  
  saveAttendanceRecord(record);
  return record;
}

// Check if employee ID already exists
export function employeeIdExists(employeeId: string, excludeUserId?: string): boolean {
  const allEmployees = getAllEmployees();
  return allEmployees.some(u => u.employeeId === employeeId && u.id !== excludeUserId);
}

// Check if email already exists
export function emailExists(email: string, excludeUserId?: string): boolean {
  const allEmployees = getAllEmployees();
  const lowercaseEmail = email.toLowerCase();
  return allEmployees.some(u => u.email.toLowerCase() === lowercaseEmail && u.id !== excludeUserId);
}
