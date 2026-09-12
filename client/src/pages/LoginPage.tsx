import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import logoSrc from '../assets/logo.png';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      showToast('Signed in successfully.', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Brand / Value Column */}
        <div className="lg:col-span-6 space-y-6">
          <img src={logoSrc} alt="FutureHub" className="w-16 h-16 object-contain" />

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Sign In to Your FutureHub Account
          </h1>

          <p className="text-base text-slate-600 leading-relaxed max-w-md">
            Access your personalized career matches, tracked skill roadmaps, saved bookmarks, and portfolio milestones.
          </p>

          <div className="space-y-3 pt-2">
            {[
              '100% Deterministic match score updates',
              'Semester-by-semester milestone progress tracking',
              'Strict zero-IDOR privacy: your data remains isolated'
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Login Card */}
        <div className="lg:col-span-6">
          <Card className="p-8 sm:p-10 space-y-6 max-w-md mx-auto">
            <div>
              <h2 className="text-xl font-black text-slate-900">Sign In</h2>
              <p className="text-xs text-slate-500 mt-1">Enter your registered student credentials</p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs font-medium" role="alert">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  className="w-full"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
                Create Account
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
