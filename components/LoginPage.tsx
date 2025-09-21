import React, { useState } from 'react';
import { View } from '../types';
import Spinner from './Spinner';

interface LoginPageProps {
    onAttemptLogin: (email: string, pass: string) => Promise<string | void>;
    onSetView: (view: View) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onAttemptLogin, onSetView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('يرجى ملء جميع الحقول.');
            return;
        }
        setLoading(true);
        const result = await onAttemptLogin(email, password);
        setLoading(false);
        if (result) {
            setError(result);
        }
    };

    return (
        <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto">
                    ج
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    تسجيل الدخول إلى حسابك
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    أو{' '}
                    <button onClick={() => onSetView('signup')} className="font-medium text-teal-600 hover:text-teal-500">
                        أنشئ حساباً جديداً
                    </button>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-slate-200">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                البريد الإلكتروني
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-gray-700">
                                كلمة المرور
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        
                        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-md border border-transparent bg-teal-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:bg-teal-400"
                            >
                                {loading ? <Spinner /> : 'تسجيل الدخول'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;