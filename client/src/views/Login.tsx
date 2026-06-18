"use client";

import React, { useState, useEffect } from 'react';
import { RotateCcw, Ghost, Mail, ArrowRight, Check, Loader2, X, CheckCircle2, AlertCircle, Lock, Eye, EyeOff, Fingerprint, GraduationCap, Shield, Sparkles } from 'lucide-react';
import { NeonInput, NeonButton } from '../components/Common';
import { useRouter as useNavigate } from 'next/navigation';
import Link from 'next/link';
import { authService } from '../services/auth';
import { analytics } from '../utils/analytics';
import { supabase } from '../lib/supabase';

export const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  // Auto-dismiss success messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) setError(null);
  }, [identifier, password]);

  // Email validation regex
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin && !agreedToTerms) {
      setError('You must agree to the Terms and Conditions to continue.');
      return;
    }

    if (!identifier.trim()) {
      setError('Please enter a username or email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      let finalEmail = identifier.trim().toLowerCase();

      // If it doesn't look like an email, assume it's a username and look it up
      if (!isValidEmail(finalEmail)) {
        if (!isLogin) {
           setError('Please enter a valid email address to sign up.');
           setIsLoading(false);
           return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('university_email')
          .eq('username', finalEmail)
          .maybeSingle();

        if (profileError) {
          if (profileError.message.includes('Failed to fetch') || profileError.message.includes('Network Error')) {
            throw new Error('Database connection failed. Please ensure the Supabase project is active and not paused.');
          }
          console.error('Profile lookup error:', profileError);
          throw new Error('Username not found. Please try logging in with your email or Google.');
        }

        if (!profile) {
          throw new Error('Username not found. Please try logging in with your email or Google.');
        }

        finalEmail = profile.university_email;
      }

      if (isLogin) {
        await authService.signInWithPassword(finalEmail, password);
        analytics.login('Password');
        setSuccess('Logged in successfully! Redirecting...');
        // Let the normal app layout handle the routing
        setTimeout(() => navigate.push('/home'), 500);
      } else {
        await authService.signUp(finalEmail, password, '');
        analytics.login('Signup');
        setSuccess('Account created! Redirecting to setup...');
        setTimeout(() => navigate.push('/onboarding'), 500);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkFallback = async () => {
    if (!isValidEmail(identifier.trim())) {
      setError('Please enter your valid email address to use a magic link.');
      return;
    }
    setIsLoading(true);
    try {
      await authService.signInWithMagicLink(identifier.trim());
      setSuccess('Magic Link sent! Check your email inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);

    if (!isLogin && !agreedToTerms) {
      setError('You must agree to the Terms and Conditions to continue.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.signInWithGoogle();
      analytics.login('Google');
    } catch (error: any) {
      console.error('Google login error:', error);
      setError(error.message || 'Failed to initialize Google login. Please try again.');
      setIsLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { data, error } = await supabase.auth.signInWithPasskey();
      if (error) throw error;
      setSuccess('Logged in successfully with Passkey! Redirecting...');
      analytics.login('Passkey');
      setTimeout(() => navigate.push('/home'), 500);
    } catch (err: any) {
      console.error('Passkey authentication error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Passkey authentication canceled or timed out.');
      } else {
        setError(err.message || 'Failed to authenticate with Passkey. Make sure you have registered a passkey on this device.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-12 bg-[#030303] text-white relative overflow-hidden select-none">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-neon opacity-[0.08] blur-[150px] rounded-full animate-float-1 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600 opacity-[0.08] blur-[150px] rounded-full animate-float-2 pointer-events-none" style={{ animationDelay: '3s' }} />
      <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-purple-600 opacity-[0.04] blur-[120px] rounded-full pointer-events-none" />

      {/* Dotted Grid Pattern Overlay for Depth */}
      <div className="absolute inset-0 bg-dots-pattern opacity-[0.15] pointer-events-none" />

      <button
        onClick={() => navigate.push('/')}
        className="absolute top-6 left-6 text-zinc-500 hover:text-white flex items-center gap-2 z-20 transition-colors bg-white/5 hover:bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/5"
      >
        <RotateCcw className="w-4 h-4" /> Back to Home
      </button>

      {/* Left Column: Premium Brand/University Panel (Desktop Only) */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 relative border-r border-white/5 bg-gradient-to-b from-[#050508]/60 via-zinc-900/10 to-[#050508]/60 backdrop-blur-md z-10 overflow-hidden">
        {/* Ambient light streak behind left panel */}
        <div className="absolute top-[20%] left-[-20%] w-[300px] h-[300px] bg-neon opacity-[0.06] blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-20%] w-[300px] h-[300px] bg-blue-500 opacity-[0.05] blur-[100px] rounded-full pointer-events-none" />

        {/* Top Branding Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/[0.03] rounded-xl flex items-center justify-center border border-white/10 shadow-neon-sm">
            <Ghost className="w-5 h-5 text-neon" />
          </div>
          <span className="text-lg font-black tracking-widest text-white">OTHRHALFF</span>
        </div>

        {/* Middle Value Proposition Section with Floating Interactive Cards */}
        <div className="my-auto space-y-12 max-w-sm relative">
          <div className="space-y-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-neon px-3 py-1 rounded-full bg-neon/10 border border-neon/20 inline-block">
              University Network Only
            </span>
            <h2 className="text-5xl font-black tracking-tight leading-[1.1] text-white uppercase font-display">
              Find your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon via-purple-500 to-blue-500 font-black">
                other half
              </span>
            </h2>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-xs">
              No generic swiping. Match on university campuses, connect via live video date rooms, sync music, and share glimpses.
            </p>
          </div>

          {/* Floating UI Elements Showcase */}
          <div className="relative h-64 w-full flex items-center justify-center">
            {/* Card A: Verified Student Profile */}
            <div className="absolute top-0 left-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-64 transform rotate-[-4deg] transition-all hover:rotate-0 hover:scale-[1.02] duration-300 group cursor-default">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon to-purple-500 flex items-center justify-center text-[10px] font-black text-white border border-white/10">
                    A
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-100">Aria</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <span className="text-[9px] text-zinc-500 block">Stanford University</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Verified
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="text-[8px] font-bold text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">House Music</span>
                <span className="text-[8px] font-bold text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">Late Night Vibes</span>
              </div>
            </div>

            {/* Card B: Watch Party Room */}
            <div className="absolute bottom-2 right-4 p-4 rounded-2xl bg-[#0c0c0e]/95 border border-neon/20 backdrop-blur-xl shadow-neon-sm w-64 transform rotate-[4deg] transition-all hover:rotate-0 hover:scale-[1.02] duration-300 cursor-default">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-100 uppercase tracking-wide">Live Watch Party</h4>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">Watching: Interstellar</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[8px] text-zinc-500">4 classmates active</span>
                <span className="text-[8px] font-bold text-neon uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-neon" /> Live
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-zinc-600 flex justify-between items-center">
          <span>Othrhalff &copy; {new Date().getFullYear()}</span>
          <span className="text-[9px] uppercase tracking-wider text-zinc-500">Student Lounge</span>
        </div>
      </div>

      {/* Right Column: High-fidelity Login Card Container */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 z-10 w-full min-h-screen">
        <div className="w-full max-w-md bg-[#0c0c0e]/80 backdrop-blur-2xl p-8 lg:p-10 rounded-[32px] border border-white/5 shadow-[0_0_80px_rgba(255,0,127,0.06),0_0_30px_rgba(0,0,0,0.8)] animate-fade-in relative overflow-hidden">
          {/* Subtle neon glow underlay behind the card */}
          <div className="absolute -top-[50%] -right-[50%] w-[250px] h-[250px] bg-neon opacity-[0.05] blur-[80px] rounded-full pointer-events-none" />

          {/* Top Header inside card */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-neon/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/10 shadow-neon-sm relative group">
              <div className="absolute inset-0 bg-neon/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <Ghost className="w-7 h-7 text-neon relative z-10 animate-float-1" style={{ animationDuration: '6s' }} />
            </div>
            <h1 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase leading-none font-display">
              {isLogin ? (
                <>Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon to-purple-400">Back</span></>
              ) : (
                <>Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon to-purple-400">Account</span></>
              )}
            </h1>
            <p className="text-zinc-400 text-xs tracking-wide">
              {isLogin ? 'Sign in to find your campus connection.' : 'Verify your email to enter the lounge.'}
            </p>
          </div>

          {/* Toast Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300 flex-1">{error}</p>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/5 border border-green-500/20 rounded-2xl flex items-start gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-300 flex-1">{success}</p>
              <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Authentication Action Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={(!isLogin && !agreedToTerms) || isLoading}
              className="w-full flex items-center justify-center gap-3 bg-zinc-950 text-white font-bold py-3.5 rounded-2xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(255,255,255,0.02)] text-xs uppercase tracking-wider"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              {isLogin ? 'Continue with Google' : 'Sign up with Google'}
            </button>

            {isLogin && (
              <button
                type="button"
                onClick={handlePasskeyLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-zinc-900/60 backdrop-blur-md text-white font-bold py-3.5 rounded-2xl border border-zinc-800 hover:border-neon/40 hover:bg-neon/5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(0,0,0,0.2)] group text-xs uppercase tracking-wider"
              >
                <Fingerprint className="w-4.5 h-4.5 text-neon group-hover:scale-110 transition-transform" />
                Sign in with Passkey
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] bg-zinc-900/85 flex-1"></div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Or continue with</span>
            <div className="h-[1px] bg-zinc-900/85 flex-1"></div>
          </div>

          <form onSubmit={handleEmailContinue} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
              <NeonInput
                type="text"
                placeholder={isLogin ? "Username or Email" : "name@example.com"}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                disabled={isLoading}
                className="pl-12 bg-zinc-950/80 border-zinc-900 hover:border-zinc-850 focus:border-neon rounded-2xl text-sm"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
              <NeonInput
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pl-12 pr-12 bg-zinc-950/80 border-zinc-900 hover:border-zinc-850 focus:border-neon rounded-2xl text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>

            {/* Mandatory Checkbox for Signup */}
            {!isLogin && (
              <div className="flex items-start gap-3 px-1 py-1 animate-fade-in">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    disabled={isLoading}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-zinc-800 bg-zinc-950 transition-all checked:border-neon checked:bg-neon hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-neon/30"
                  />
                  <Check className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                </div>
                <label htmlFor="terms" className="text-[10px] text-zinc-500 leading-relaxed cursor-pointer select-none">
                  I agree to the <Link href="/terms" target="_blank" className="text-neon hover:underline">Terms of Service</Link>, <Link href="/privacy" target="_blank" className="text-neon hover:underline">Privacy Policy</Link>, and acknowledge I am a current university student.
                </label>
              </div>
            )}

            <NeonButton
              disabled={(!isLogin && !agreedToTerms) || isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 mt-2 bg-gradient-to-r from-neon to-purple-600 hover:from-neon/90 hover:to-purple-600/90 text-xs uppercase tracking-wider font-bold transition-all shadow-[0_0_20px_rgba(255,0,127,0.2)] hover:shadow-[0_0_30px_rgba(255,0,127,0.4)]"
            >
              {isLoading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Continue' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </NeonButton>
          </form>

          {isLogin && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={handleMagicLinkFallback}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-4"
                disabled={isLoading}
              >
                Forgot or don't have a password? Use Magic Link
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-zinc-900 text-center space-y-4">
            <div className="text-xs text-zinc-400">
              {isLogin ? (
                <>
                  New to Othrhalff?{' '}
                  <button
                    onClick={() => { setIsLogin(false); setAgreedToTerms(false); }}
                    className="text-neon font-bold hover:underline"
                    disabled={isLoading}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-neon font-bold hover:underline"
                    disabled={isLoading}
                  >
                    Log in
                  </button>
                </>
              )}
            </div>

            {isLogin && (
              <p className="text-[9px] text-zinc-600 max-w-xs mx-auto leading-relaxed">
                By logging in, you agree to our Terms & Conditions and Privacy Policy. Verified student email is required for university network access.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};