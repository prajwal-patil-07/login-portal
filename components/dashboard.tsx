'use client';

import { useState, useEffect } from 'react';
import { User, AttendanceRecord, RegularizationRequest } from '@/lib/types';
import {
  getTodayRecord,
  saveAttendanceRecord,
  getUserRecords,
  setAuthUser,
  formatTime,
  formatDate,
  calculateTotalHours,
  hasCompletedAttendanceToday,
  canPunchInToday,
  getUserRegularizations,
  submitRegularization,
  checkExistingRegularization,
  checkExistingAttendance,
} from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Building2,
  LogOut,
  Clock,
  Calendar,
  User as UserIcon,
  CheckCircle,
  XCircle,
  Timer,
  History,
  Briefcase,
  Mail,
  BadgeCheck,
  FileEdit,
  AlertCircle,
  Plus,
  Lock,
} from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [userRecords, setUserRecords] = useState<AttendanceRecord[]>([]);
  const [regularizations, setRegularizations] = useState<RegularizationRequest[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'attendance' | 'regularizations'>('attendance');
  const [isRegDialogOpen, setIsRegDialogOpen] = useState(false);

  // Regularization form state
  const [regDate, setRegDate] = useState('');
  const [regLoginTime, setRegLoginTime] = useState('09:00');
  const [regLogoutTime, setRegLogoutTime] = useState('18:00');
  const [regReason, setRegReason] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadRecords();
  }, [user.id]);

  const loadRecords = () => {
    const today = getTodayRecord(user.id);
    setTodayRecord(today);
    setUserRecords(getUserRecords(user.id));
    setRegularizations(getUserRegularizations(user.id));
  };

  const handleLogin = async () => {
    if (!canPunchInToday(user.id)) {
      return;
    }

    setIsLoggingIn(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const now = new Date();
    const record: AttendanceRecord = {
      id: `${user.id}-${now.toISOString().split('T')[0]}`,
      userId: user.id,
      date: now.toISOString().split('T')[0],
      loginTime: formatTime(now),
      logoutTime: null,
      totalHours: null,
      status: 'present',
    };

    saveAttendanceRecord(record);
    loadRecords();
    setIsLoggingIn(false);
  };

  const handleAttendanceLogout = async () => {
    if (!todayRecord || !todayRecord.loginTime) return;

    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const now = new Date();
    const logoutTime = formatTime(now);
    const totalHours = calculateTotalHours(todayRecord.loginTime, logoutTime);

    const updatedRecord: AttendanceRecord = {
      ...todayRecord,
      logoutTime,
      totalHours,
      status: parseFloat(totalHours) >= 4 ? 'present' : 'half-day',
    };

    saveAttendanceRecord(updatedRecord);
    loadRecords();
    setIsLoggingOut(false);
  };

  const handleSystemLogout = () => {
    setAuthUser(null);
    onLogout();
  };

  const handleSubmitRegularization = () => {
    setRegError('');
    setRegSuccess('');

    if (!regDate || !regLoginTime || !regLogoutTime || !regReason) {
      setRegError('Please fill all fields');
      return;
    }

    // Check if date is in the future
    const selectedDate = new Date(regDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate >= today) {
      setRegError('Regularization can only be submitted for past dates');
      return;
    }

    // Check if attendance already exists for this date
    if (checkExistingAttendance(user.id, regDate)) {
      setRegError('Attendance already exists for this date');
      return;
    }

    // Check if regularization request already exists
    if (checkExistingRegularization(user.id, regDate)) {
      setRegError('A regularization request already exists for this date');
      return;
    }

    // Format times to 12-hour format
    const formatTo12Hour = (time24: string) => {
      const [hours, minutes] = time24.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12.toString().padStart(2, '0')}:${minutes}:00 ${ampm}`;
    };

    submitRegularization(
      user.id,
      regDate,
      formatTo12Hour(regLoginTime),
      formatTo12Hour(regLogoutTime),
      regReason
    );

    setRegSuccess('Regularization request submitted successfully!');
    setRegDate('');
    setRegLoginTime('09:00');
    setRegLogoutTime('18:00');
    setRegReason('');
    loadRecords();

    setTimeout(() => {
      setIsRegDialogOpen(false);
      setRegSuccess('');
    }, 1500);
  };

  const isLoggedIn = todayRecord?.loginTime && !todayRecord?.logoutTime;
  const isLoggedOut = todayRecord?.logoutTime;
  const hasCompletedToday = hasCompletedAttendanceToday(user.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-card-foreground">Rsmart</h1>
                <p className="text-xs text-muted-foreground">Employee Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(currentTime)}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-card-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.employeeId}</p>
                </div>
              </div>
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSystemLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            Welcome Back, {user.name}
            {/* Welcome Back, {user.name.split(' ')[0]} */}
          </h2>
          <p className="text-muted-foreground mt-1">{formatDate(currentTime)}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'attendance'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Attendance
            </div>
          </button>
          <button
            onClick={() => setActiveTab('regularizations')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'regularizations'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileEdit className="w-4 h-4" />
              My Regularizations
              {regularizations.filter((r) => r.status === 'Pending').length > 0 && (
                <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {regularizations.filter((r) => r.status === 'Pending').length}
                </span>
              )}
            </div>
          </button>
        </div>

        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Attendance Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Punch In/Out Card */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-4">
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Timer className="w-5 h-5" />
                    Today&apos;s Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-center sm:text-left">
                      <p className="text-4xl font-bold font-mono text-foreground">
                        {formatTime(currentTime)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Current Time</p>
                    </div>

                    <div className="flex gap-4">
                      {!todayRecord?.loginTime && (
                        <Button
                          size="lg"
                          className="h-16 px-8 gap-3 bg-accent hover:bg-accent/90 text-accent-foreground"
                          onClick={handleLogin}
                          disabled={isLoggingIn}
                        >
                          <CheckCircle className="w-6 h-6" />
                          <div className="text-left">
                            <p className="font-semibold">Punch In</p>
                            <p className="text-xs opacity-80">Start your day</p>
                          </div>
                        </Button>
                      )}

                      {isLoggedIn && (
                        <Button
                          size="lg"
                          variant="destructive"
                          className="h-16 px-8 gap-3"
                          onClick={handleAttendanceLogout}
                          disabled={isLoggingOut}
                        >
                          <XCircle className="w-6 h-6" />
                          <div className="text-left">
                            <p className="font-semibold">Punch Out</p>
                            <p className="text-xs opacity-80">End your day</p>
                          </div>
                        </Button>
                      )}

                      {isLoggedOut && (
                        <div className="flex items-center gap-3 bg-accent/10 px-6 py-4 rounded-lg">
                          <BadgeCheck className="w-8 h-8 text-accent" />
                          <div>
                            <p className="font-semibold text-foreground">Completed</p>
                            <p className="text-sm text-muted-foreground">
                              Worked {todayRecord?.totalHours}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notice when attendance is completed */}
                  {hasCompletedToday && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg flex items-start gap-3">
                      <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Attendance completed for today
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          You can punch in again tomorrow. If you need to modify today&apos;s
                          attendance, please contact HR.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Today's Status */}
                  {todayRecord && (
                    <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-border">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-accent mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Login Time</p>
                        <p className="font-semibold text-foreground">
                          {todayRecord.loginTime || '--:--'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <XCircle className="w-5 h-5 text-destructive mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Logout Time</p>
                        <p className="font-semibold text-foreground">
                          {todayRecord.logoutTime || '--:--'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Total Hours</p>
                        <p className="font-semibold text-foreground">
                          {todayRecord.totalHours || '--'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Attendance History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <History className="w-5 h-5" />
                    Attendance History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userRecords.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No attendance records yet</p>
                      <p className="text-sm">Punch in to start tracking</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                              Date
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                              Login
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                              Logout
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                              Total Hours
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {userRecords.slice(0, 10).map((record) => (
                            <tr
                              key={record.id}
                              className="border-b border-border last:border-0 hover:bg-muted/50"
                            >
                              <td className="py-3 px-4 text-sm text-foreground">
                                {new Date(record.date).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>
                              <td className="py-3 px-4 text-sm font-mono text-foreground">
                                {record.loginTime || '--'}
                              </td>
                              <td className="py-3 px-4 text-sm font-mono text-foreground">
                                {record.logoutTime || '--'}
                              </td>
                              <td className="py-3 px-4 text-sm font-semibold text-foreground">
                                {record.totalHours || '--'}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    record.status === 'present'
                                      ? 'bg-accent/10 text-accent'
                                      : record.status === 'half-day'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-destructive/10 text-destructive'
                                  }`}
                                >
                                  {record.status === 'present'
                                    ? 'Present'
                                    : record.status === 'half-day'
                                    ? 'Half Day'
                                    : 'Absent'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Profile */}
            <div className="space-y-6">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <UserIcon className="w-5 h-5" />
                    My Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary-foreground">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.designation}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <BadgeCheck className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Employee ID</p>
                        <p className="text-sm font-medium text-card-foreground">{user.employeeId}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium text-card-foreground break-all">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Briefcase className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Department</p>
                        <p className="text-sm font-medium text-card-foreground">{user.department}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Calendar className="w-5 h-5" />
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-accent/10 rounded-lg">
                      <p className="text-2xl font-bold text-accent">
                        {userRecords.filter((r) => r.status === 'present').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Present Days</p>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{userRecords.length}</p>
                      <p className="text-xs text-muted-foreground">Total Records</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'regularizations' && (
          <div className="space-y-6">
            {/* Regularization Info Card */}
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      About Regularizations
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      If you missed punching in on any day, you can submit a regularization
                      request. Your request will be reviewed by HR/Admin and once Approved,
                      it will be added to your attendance records.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Regularization Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">My Regularization Requests</h3>
              <Dialog open={isRegDialogOpen} onOpenChange={setIsRegDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Submit Regularization Request</DialogTitle>
                    <DialogDescription>
                      Request attendance regularization for a missed day. Admin approval is
                      required.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Date</label>
                      <Input
                        type="date"
                        value={regDate}
                        onChange={(e) => setRegDate(e.target.value)}
                        max={new Date(Date.now() - 86400000).toISOString().split('T')[0]}
                        className="w-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Login Time</label>
                        <Input
                          type="time"
                          value={regLoginTime}
                          onChange={(e) => setRegLoginTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Logout Time</label>
                        <Input
                          type="time"
                          value={regLogoutTime}
                          onChange={(e) => setRegLogoutTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Reason</label>
                      <Textarea
                        placeholder="Explain why you missed punching in..."
                        value={regReason}
                        onChange={(e) => setRegReason(e.target.value)}
                        rows={3}
                      />
                    </div>
                    {regError && (
                      <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        {regError}
                      </div>
                    )}
                    {regSuccess && (
                      <div className="p-3 bg-accent/10 text-accent rounded-lg text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {regSuccess}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSubmitRegularization}>Submit Request</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Regularization List */}
            <Card>
              <CardContent className="p-0">
                {regularizations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileEdit className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No regularization requests</p>
                    <p className="text-sm">Submit a request if you missed punching in</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {regularizations.map((req) => (
                      <div key={req.id} className="p-4 hover:bg-muted/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground">
                              {new Date(req.date).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {req.loginTime} - {req.logoutTime}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Reason: {req.reason}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Submitted:{' '}
                              {new Date(req.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              req.status === 'Approved'
                                ? 'bg-accent/10 text-accent'
                                : req.status === 'Rejected'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {req.status === 'Approved'
                              ? 'Approved'
                              : req.status === 'Rejected'
                              ? 'Rejected'
                              : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-muted-foreground">
            &copy; 2024 Rsmart. All rights reserved. | Powered by greytHR
          </p>
        </div>
      </footer>
    </div>
  );
}
