export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  bdayDate: string;
  mobile: string;
  address: string;
  password: string;
  department: string;
  designation: string;
  avatar?: string;
  role: 'employee' | 'admin';
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  loginTime: string | null;
  logoutTime: string | null;
  totalHours: string | null;
  status: 'present' | 'absent' | 'half-day' | 'on-leave';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface RegularizationRequest {
  id: string;
  userId: string;
  date: string;
  loginTime: string;
  logoutTime: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
