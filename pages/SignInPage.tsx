import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../App';
import { authenticateUser } from '../lib/database';

const SignInPage: React.FC = () => {
    const navigate = useNavigate();
    const { setCurrentTenantId } = useContext(DataContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authenticateUser(email, password);
            
            if (result.success && result.user) {
                // Store user info
                localStorage.setItem('token', 'authenticated');
                localStorage.setItem('user', JSON.stringify(result.user));
                
                // Set tenant and navigate
                setCurrentTenantId(result.user.tenantId);
                navigate('/dashboard');
            } else {
                setError(result.error || 'Invalid credentials');
            }
        } catch (err) {
            console.error('Sign in error:', err);
            setError('Failed to sign in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-pink/20 to-lavender-purple/20">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <img src="https://sopkcpmuhwktnrkbgabx.supabase.co/storage/v1/object/sign/Logo/GenZ%20salon%20logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80MDY0MDM1OC1mYWIwLTRlN2MtYmExNy0yYTZjZDc1N2UwNTAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMb2dvL0dlblogc2Fsb24gbG9nby5wbmciLCJpYXQiOjE3NjIwMDg3OTIsImV4cCI6MTg0ODQwODc5Mn0._eh1bvBGE3w5fAnZxsNAEAgJWIZbLo8PnjHEAESmwF0" alt="GenZ Salon Logo" className="w-20 h-20 mx-auto mb-4 rounded-full" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2" style={{fontFamily: "'Playfair Display', serif"}}>Sign In</h1>
                    <p className="text-gray-600">Enter your credentials to continue</p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4" autoComplete="off">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent"
                            placeholder="Enter your email"
                            required
                            autoComplete="username"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-pink focus:border-transparent"
                                placeholder="Enter your password"
                                required
                                autoComplete="current-password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full px-6 py-3 text-gray-600 font-medium hover:text-gray-800 transition-colors"
                        disabled={loading}
                    >
                        Back to Home
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignInPage;
