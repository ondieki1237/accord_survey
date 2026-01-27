'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setToken, API_BASE_URL } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Lock, User, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setToken(data.token);
                router.push('/admin');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 relative overflow-hidden">

            {/* Fun Background Elements */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply blur-xl opacity-70 animate-bounce transition-all duration-3000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>

            <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-2xl border-0 overflow-hidden relative z-10 transition-all hover:shadow-purple-500/20">
                <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 w-full absolute top-0 left-0"></div>

                <CardHeader className="text-center pt-8 pb-2">
                    <div className="mx-auto mb-4 transform hover:scale-105 transition-transform">
                        <img
                            src="/accord_transparent_logo.png"
                            alt="Accord Medical Logo"
                            className="h-24 mx-auto object-contain drop-shadow-lg"
                        />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        Welcome Back!
                    </CardTitle>
                    <CardDescription className="text-gray-500 text-lg">
                        Enter your credentials to access the command center.
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2 group">
                            <Label htmlFor="username" className="text-gray-700 font-medium ml-1">Username</Label>
                            <div className="relative transition-all duration-200 focus-within:transform focus-within:scale-[1.02]">
                                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="admin"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10 h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-200 bg-gray-50/50"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <Label htmlFor="password" className="text-gray-700 font-medium ml-1">Password</Label>
                            <div className="relative transition-all duration-200 focus-within:transform focus-within:scale-[1.02]">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-200 bg-gray-50/50"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center animate-in fade-in slide-in-from-top-2">
                                <span className="mr-2">⚠️</span> {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Authenticating...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    Let's Go <ArrowRight className="ml-2 h-5 w-5" />
                                </div>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center pb-6">
                    <p className="text-xs text-gray-400 text-center">
                        Accord Survey System v1.0 <br />
                        Secure • Anonymous • Efficient
                    </p>
                </CardFooter>
            </Card>

            <div className="absolute bottom-4 text-white/50 text-sm font-light">
                Protected by Accord Security Layer
            </div>
        </div>
    );
}
