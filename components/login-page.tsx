'use client';

import { useState } from 'react';
import { User } from '@/lib/types';
import { authenticateUser, setAuthUser } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Building2, Lock, Mail, Eye, EyeOff, Shield, Users } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const user = authenticateUser(email, password);

    if (user) {
      setAuthUser(user);
      onLogin(user);
    } else {
      setError('Invalid email or password');
    }
    setIsLoading(false);
  };

  const fillAdminCredentials = () => {
    setEmail('admin@hexalytics.com');
    setPassword('admin123');
  };

  const fillEmployeeCredentials = () => {
    setEmail('prajwal07@gmail.com');
    setPassword('prajwal@123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Rsmart</h1>
          <p className="text-muted-foreground mt-2">LogIn Portal</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <h2 className="text-xl font-semibold text-center text-card-foreground">
              Sign in to your account
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive text-center">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Quick Login Buttons */}
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-card-foreground text-center">Quick Login:</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fillAdminCredentials}
                  className="h-auto py-3 flex flex-col items-center gap-1"
                >
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium">Admin Login</span>
                  <span className="text-xs text-muted-foreground">View all data</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={fillEmployeeCredentials}
                  className="h-auto py-3 flex flex-col items-center gap-1"
                >
                  <Users className="w-5 h-5 text-accent" />
                  <span className="text-xs font-medium">Employee Login</span>
                  <span className="text-xs text-muted-foreground">Punch in/out</span>
                </Button>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="border-b border-border pb-3">
                <p className="text-sm font-medium text-card-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Admin Credentials:
                </p>
                <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  <p>Email: admin@hexalytics.com</p>
                  <p>Password: admin123</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" />
                  Employee Credentials:
                </p>
                <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  <p>Email: rajesh.kumar@hexalytics.com</p>
                  <p>Password: password123</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          &copy; 2024 Hexalytics. All rights reserved.
        </p>
      </div>
    </div>
  );
}
