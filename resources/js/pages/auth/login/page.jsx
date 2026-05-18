import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const { login, isPending } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login({ username, password });
    };

    return (
        <>
            <Head title="Login - Wargify" />
            <div className="flex min-h-screen w-full">
                {/* Left Side - Blue Background */}
                <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-[#00468B] p-8">
                    <div className="flex flex-col items-center justify-center max-w-md text-center space-y-6">
                        <img 
                            src="/logo.png" 
                            alt="Wargify Logo" 
                            className="w-68 h-auto object-contain"
                        />
                        <h1 className="text-2xl font-bold text-white tracking-wide">
                            SELAMAT DATANG DI WARGIFY
                        </h1>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex flex-col items-center justify-center w-full md:w-1/2 bg-[#ebf3f9] p-8">
                    <div className="w-full max-w-sm space-y-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-sm font-semibold text-gray-900">
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="h-12 bg-[#dcdcdc] border-none text-black rounded-xl focus-visible:ring-[#00468B]"
                                    disabled={isPending}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold text-gray-900">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 bg-[#dcdcdc] border-none text-black rounded-xl focus-visible:ring-[#00468B]"
                                    disabled={isPending}
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-12 bg-[#00468B] hover:bg-[#003870] text-white rounded-xl text-lg font-medium mt-8 transition-colors"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Logging in...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
