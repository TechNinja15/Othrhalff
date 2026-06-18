"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Ghost, Mail, ArrowRight, Check, Loader2, X, CheckCircle2,
  AlertCircle, Lock, Eye, EyeOff, Fingerprint, Zap, Shield,
  Users, ChevronLeft, Sparkles, Heart, Star
} from 'lucide-react';
import { NeonInput } from '../components/Common';
import { useRouter as useNavigate } from 'next/navigation';
import Link from 'next/link';
import { authService } from '../services/auth';
import { analytics } from '../utils/analytics';
import { supabase } from '../lib/supabase';

// Animated floating particle
const Particle: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    className="absolute w-1 h-1 rounded-full bg-neon pointer-events-none"
    style={style}
  />
);

// Trust badge pill
const TrustBadge: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 whitespace-nowrap">
    <span className="text-neon">{icon}</span>
    {label}
  </div>
);

// Feature highlight row
const FeatureRow: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex items-start gap-4 group">
    <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center flex-shrink-0 group-hover:bg-neon/20 transition-colors">
      <span className="text-neon">{icon}</span>
    </div>
    <div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
    </div>
  </div>
);

// Google SVG logo
const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);
  const navigate = useNavigate();

  // Generate floating particles for left panel
  useEffect(() => {
    const ps = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        opacity: Math.random() * 0.4 + 0.1,
        animation: `float-slow-${(i % 2) + 1} ${14 + Math.random() * 10}s infinite ease-in-out`,
        animationDelay: `${Math.random() * 8}s`,
        width: `${Math.random() * 3 + 1}px`,
        height: `${Math.random() * 3 + 1}px`,
      } as React.CSSProperties,
    }));
    setParticles(ps);
  }, []);

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

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
          throw new Error('Username not found. Please try logging in with your email or Google.');
        }

        if (!profile) throw new Error('Username not found. Please try logging in with your email or Google.');
        finalEmail = profile.university_email;
      }

      if (isLogin) {
        await authService.signInWithPassword(finalEmail, password);
        analytics.login('Password');
        setSuccess('Logged in! Redirecting...');
        setTimeout(() => navigate.push('/home'), 500);
      } else {
        await authService.signUp(finalEmail, password, '');
        analytics.login('Signup');
        setSuccess('Account created! Redirecting to setup...');
        setTimeout(() => navigate.push('/onboarding'), 500);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in. Please check your credentials.');
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
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Failed to initialize Google login. Please try again.');
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
      setSuccess('Logged in with Passkey! Redirecting...');
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
    <div className="min-h-screen w-full flex bg-[#040404] overflow-auto">

      {/* ─── LEFT PANEL (desktop only) ─── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden">
        {/* Deep atmospheric gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0010] via-[#04000a] to-black" />
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-neon opacity-[0.07] blur-[130px] rounded-full animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-800 opacity-[0.06] blur-[120px] rounded-full animate-pulse-slow pointer-events-none" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[40%] right-[15%] w-[300px] h-[300px] bg-blue-700 opacity-[0.04] blur-[100px] rounded-full animate-pulse-slow pointer-events-none" style={{ animationDelay: '1.5s' }} />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,0,127,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,127,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating particles */}
        {particles.map(p => <Particle key={p.id} style={p.style} />)}

        {/* Content layer */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center shadow-neon-sm">
              <Ghost className="w-5 h-5 text-neon" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">Othrhalff</span>
          </div>
        </div>

        {/* Center statement */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          <div className="mb-2">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-neon/70">
              {isLogin ? 'Welcome back' : 'Join the network'}
            </span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-black text-white leading-[1.05] tracking-tight mb-6">
            {isLogin ? (
              <>Your campus<br /><span className="text-neon">connections</span><br />are waiting.</>
            ) : (
              <>Find your<br /><span className="text-neon">Othrhalff</span><br />on campus.</>
            )}
          </h2>

          <p className="text-gray-400 text-base leading-relaxed max-w-xs mb-10">
            {isLogin
              ? 'Sign back in and pick up exactly where your vibe left off — your matches, your chats, your sparx.'
              : 'The exclusive student network built around authentic connections. University verified, always anonymous until you choose otherwise.'}
          </p>

          {/* Feature list */}
          <div className="space-y-5">
            <FeatureRow
              icon={<Shield className="w-4 h-4" />}
              title="University-verified only"
              desc="Every account is tied to a real .edu email. No bots, no strangers."
            />
            <FeatureRow
              icon={<Zap className="w-4 h-4" />}
              title="Real-time sparx"
              desc="Instant matches, live reactions, and story glimpses that expire in 24 hours."
            />
            <FeatureRow
              icon={<Heart className="w-4 h-4" />}
              title="Your data stays yours"
              desc="Messages auto-delete after 10 days. No tracking, no data selling."
            />
          </div>
        </div>

        {/* Bottom trust bar */}
        <div className="relative z-10">
          <div className="flex flex-wrap gap-2 mb-6">
            <TrustBadge icon={<Users className="w-3 h-3" />} label="Campus-only network" />
            <TrustBadge icon={<Shield className="w-3 h-3" />} label="End-to-end private" />
            <TrustBadge icon={<Star className="w-3 h-3" />} label="Student verified" />
          </div>
          <p className="text-[11px] text-gray-700">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-gray-500 hover:text-gray-400 underline underline-offset-2">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-gray-500 hover:text-gray-400 underline underline-offset-2">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* ─── RIGHT PANEL / Mobile full-screen ─── */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 relative">
        {/* Mobile atmospheric background */}
        <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-[#040404] via-[#06000f] to-[#040404]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-neon opacity-[0.06] blur-[100px] rounded-full lg:hidden pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-blue-800 opacity-[0.05] blur-[80px] rounded-full lg:hidden pointer-events-none" />

        {/* Desktop: subtle right-side gradient */}
        <div className="absolute inset-0 hidden lg:block bg-gradient-to-l from-[#040404] via-[#05000a]/80 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate.push('/')}
          className="absolute top-5 left-5 z-20 flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-sm font-medium group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="lg:hidden">Back</span>
          <span className="hidden lg:inline">Back to Home</span>
        </button>

        {/* Auth card */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-5 pt-16 pb-8 lg:p-10 lg:pt-10">
          <div className="w-full max-w-[420px] lg:max-w-[400px]">

            {/* Mobile-only logo + title */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-14 h-14 bg-gray-900 rounded-2xl border border-gray-800 shadow-neon-sm flex items-center justify-center mx-auto mb-5">
                <Ghost className="w-7 h-7 text-neon" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase mb-1">
                {isLogin ? <>Welcome <span className="text-neon">Back</span></> : <>Create <span className="text-neon">Account</span></>}
              </h1>
              <p className="text-gray-500 text-sm">
                {isLogin ? 'Sign in to find your Othrhalff.' : 'Join the exclusive student network.'}
              </p>
            </div>

            {/* Desktop title */}
            <div className="hidden lg:block mb-8">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-neon/60 mb-3">
                {isLogin ? 'Secure Sign-In' : 'Create Account'}
              </p>
              <h2 className="text-2xl font-black text-white tracking-tight mb-1.5">
                {isLogin ? 'Sign in to your account' : 'Start your journey'}
              </h2>
              <p className="text-gray-500 text-sm">
                {isLogin ? 'Choose your preferred method below.' : 'University email required.'}
              </p>
            </div>

            {/* Alert: error */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-500/8 border border-red-500/25 rounded-2xl flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300 flex-1 leading-snug">{error}</p>
                <button onClick={() => setError(null)} className="text-red-500 hover:text-red-300 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Alert: success */}
            {success && (
              <div className="mb-5 p-3.5 bg-green-500/8 border border-green-500/25 rounded-2xl flex items-start gap-3 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-300 flex-1 leading-snug">{success}</p>
                <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-300 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* ─── OAuth buttons ─── */}
            <div className="space-y-3 mb-6">
              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={(!isLogin && !agreedToTerms) || isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3 rounded-2xl hover:bg-gray-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-sm"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                <span>{isLogin ? 'Continue with Google' : 'Sign up with Google'}</span>
              </button>

              {/* Passkey — login only */}
              {isLogin && (
                <button
                  type="button"
                  onClick={handlePasskeyLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border border-gray-700/60 bg-gray-900/40 hover:border-neon/50 hover:bg-neon/5 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white group relative overflow-hidden"
                >
                  {/* Subtle glow on hover */}
                  <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_20px_rgba(255,0,127,0.06)]" />
                  <Fingerprint className="w-4 h-4 text-neon group-hover:scale-110 transition-transform duration-200 relative z-10" />
                  <span className="relative z-10">Sign in with Passkey</span>
                  <span className="ml-auto relative z-10 text-[10px] font-bold tracking-wider uppercase text-neon/60 bg-neon/10 px-2 py-0.5 rounded-full border border-neon/20">
                    Beta
                  </span>
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px bg-white/6 flex-1" />
              <span className="text-[11px] text-gray-600 uppercase tracking-[0.15em] font-medium">or continue with email</span>
              <div className="h-px bg-white/6 flex-1" />
            </div>

            {/* ─── Email form ─── */}
            <form onSubmit={handleEmailContinue} className="space-y-4">
              {/* Email / username field */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-neon/70 transition-colors" />
                <NeonInput
                  type="text"
                  placeholder={isLogin ? 'Username or email' : 'name@university.edu'}
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-11 py-3 text-sm"
                />
              </div>

              {/* Password field */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-neon/70 transition-colors" />
                <NeonInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-11 pr-12 py-3 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Sign-up: forgot password placeholder & terms */}
              {isLogin && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleMagicLinkFallback}
                    disabled={isLoading}
                    className="text-[11px] text-gray-600 hover:text-neon transition-colors underline underline-offset-2"
                  >
                    Forgot password? Use Magic Link
                  </button>
                </div>
              )}

              {/* Terms checkbox (sign-up) */}
              {!isLogin && (
                <div className="flex items-start gap-3 px-1 animate-fade-in">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={e => setAgreedToTerms(e.target.checked)}
                      disabled={isLoading}
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-600 bg-gray-900 transition-all checked:border-neon checked:bg-neon hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-neon/40"
                    />
                    <Check className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                  </div>
                  <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer select-none">
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" className="text-neon hover:underline">Terms of Service</Link>
                    {', '}
                    <Link href="/privacy" target="_blank" className="text-neon hover:underline">Privacy Policy</Link>
                    {' '}and confirm I am a current university student.
                  </label>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={(!isLogin && !agreedToTerms) || isLoading}
                className="w-full flex items-center justify-center gap-2 bg-neon text-white font-bold py-3.5 rounded-2xl text-sm tracking-wide shadow-neon hover:shadow-[0_0_28px_#ff007f] hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100 uppercase"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* ─── Switch mode ─── */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? (
                  <>
                    New here?{' '}
                    <button
                      onClick={() => { setIsLogin(false); setAgreedToTerms(false); setError(null); }}
                      disabled={isLoading}
                      className="text-neon font-semibold hover:underline underline-offset-2 transition-colors"
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => { setIsLogin(true); setError(null); }}
                      disabled={isLoading}
                      className="text-neon font-semibold hover:underline underline-offset-2 transition-colors"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>

            {/* Mobile-only trust badges */}
            <div className="lg:hidden mt-8 pt-6 border-t border-white/5">
              <div className="flex flex-wrap justify-center gap-2">
                <TrustBadge icon={<Users className="w-3 h-3" />} label="Campus-only" />
                <TrustBadge icon={<Shield className="w-3 h-3" />} label="Verified students" />
                <TrustBadge icon={<Zap className="w-3 h-3" />} label="Real-time matching" />
              </div>
              <p className="text-center text-[10px] text-gray-700 mt-4">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="hover:text-gray-500 underline underline-offset-2">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="hover:text-gray-500 underline underline-offset-2">Privacy Policy</Link>.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};