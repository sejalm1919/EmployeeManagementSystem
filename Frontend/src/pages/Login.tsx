import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, UserCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { GlassCard } from '@/components/ui/glass-card';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';
import axios from 'axios';

const ADMIN_EMAIL = 'admin@company.com';
const ADMIN_PASSWORD = 'admin@123';

export default function Login() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [email, setEmail] = useState<string>(ADMIN_EMAIL);
  const [password, setPassword] = useState<string>(ADMIN_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const login = useStore((state) => state.login);

  const handleToggle = () => {
    const nextIsAdmin = !isAdmin;
    setIsAdmin(nextIsAdmin);

    // Clear state when toggling between modes
    if (nextIsAdmin) {
      setEmail(ADMIN_EMAIL);
      setPassword(ADMIN_PASSWORD);
    } else {
      setEmail('');
      setPassword('');
    }
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isAdmin) {
        const success = await login(email, password, 'admin');
        if (success) {
          toast.success('Welcome Admin!');
          navigate('/admin');
        } else {
          toast.error('Invalid admin credentials');
        }
      } else {
        console.log('🔍 Calling backend (employee login):', email, password);

        const response = await axios.post(
          'http://localhost:8081/api/employee/login',
          {
            companyEmail: email,
            employeePassword: password,
          }
        );

        console.log('🔍 Backend returned:', response.data);
        const raw = String(response.data || '');

        const parts = raw.trim().split(/\s+/);
        const employmentCode = parts[parts.length - 1];

        console.log('✅ Parsed employmentCode =', employmentCode);

        if (!employmentCode || !employmentCode.startsWith('EMP')) {
          toast.error('Invalid employee response from server');
          setLoading(false);
          return;
        }

        const success = await login(email, password, 'employee', employmentCode);
        if (success) {
          toast.success(`Welcome ${employmentCode}!`);
          navigate('/employee');
        } else {
          toast.error('Invalid employee credentials');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />

      <GlassCard className="w-full max-w-md relative z-10">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-accent mb-4 shadow-glow">
              <UserCircle size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Employee Management System
            </h1>
            <p className="text-muted-foreground">Sign in to continue</p>
          </div>

          {/* Toggle Admin / Employee */}
          <div className="relative mb-8">
            <div className="flex bg-muted rounded-xl p-1">
              <button
                onClick={() => !isAdmin && handleToggle()}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium smooth-transition ${
                  isAdmin
                    ? 'gradient-accent text-white shadow-glow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Shield size={18} />
                Admin
              </button>
              <button
                onClick={() => isAdmin && handleToggle()}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium smooth-transition ${
                  !isAdmin
                    ? 'gradient-accent text-white shadow-glow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserCircle size={18} />
                Employee
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              key={isAdmin ? 'admin' : 'employee'}
              className={isAdmin ? 'animate-slide-in-left' : 'animate-slide-in-right'}
            >
              {/* 🔥 MODIFIED: Added autocomplete="off" to prevent browser autofill */}
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAdmin ? 'Admin email' : 'Employee company email'}
                icon={<Mail size={18} />}
                autocomplete="off" 
                required
              />
            </div>

            {/* Password with show/hide eye */}
            <div className="space-y-1">
              <div className="relative">
                {/* 🔥 MODIFIED: Added autocomplete="new-password" to aggressively prevent browser password fill */}
                <InputField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isAdmin ? 'Admin password' : 'Enter your password'}
                  icon={<Lock size={18} />}
                  autocomplete="new-password" 
                  required
                />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 mt-0.5 top-10 text-muted-foreground hover:text-foreground smooth-transition"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gradient-accent smooth-transition hover:scale-[1.02] shadow-glow"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}