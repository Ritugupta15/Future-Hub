import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, User, GraduationCap, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import logoSrc from '../assets/logo.png';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [education, setEducation] = useState('B.Sc Computer Science (TYCS / SYCS / FYCS)');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name,
        email,
        password,
        education,
        experience_level: 'Beginner'
      });
      showToast('Account created.', 'success');
      navigate('/assessment');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
            Create Your FutureHub Student Account
          </h1>

          <p className="text-base text-slate-600 leading-relaxed max-w-md">
            Join computer science and IT students discovering verified career pathways with transparent mathematical guidance.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'Tailored recommendations for 15+ technology careers',
              'Curated 5-stage milestones with verified learning docs',
              'Resume-ready portfolio project suggestions'
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Registration Card */}
        <div className="lg:col-span-6">
          <Card className="p-8 sm:p-10 space-y-6 max-w-md mx-auto">
            <div>
              <h2 className="text-xl font-black text-slate-900">Create Account</h2>
              <p className="text-xs text-slate-500 mt-1">Get started in seconds — take assessment immediately</p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs font-medium" role="alert">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                leftIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@university.edu"
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                />
              </div>

              <Select
                label="Degree Program (Optional)"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                leftIcon={<GraduationCap className="w-4 h-4" />}
              >
                <option value="B.Sc Computer Science (TYCS / SYCS / FYCS)">B.Sc Computer Science (TYCS / SYCS / FYCS)</option>
                <option value="Bachelor of Computer Applications (BCA)">Bachelor of Computer Applications (BCA)</option>
                <option value="B.Tech / B.E. Computer Science / IT">B.Tech / B.E. Computer Science / IT</option>
                <option value="Master of Computer Applications (MCA)">Master of Computer Applications (MCA)</option>
                <option value="Diploma / Other Technical Degree">Diploma / Other Technical Degree</option>
              </Select>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  className="w-full"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Create Account & Start
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
                Sign In
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
