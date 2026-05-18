import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, LockKeyhole, UserRound } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const { login, isPending } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login({ username, password });
    };

    return (
        <>
            <Head title="Login - Wargify" />
            <div className="grid min-h-screen w-full overflow-hidden bg-[#ebf3f9] md:grid-cols-[60fr_40fr]">
                <div className="hidden flex-col items-center justify-center bg-[#00468B] px-10 py-12 text-center text-white md:flex lg:px-16">
                    <div className="flex max-w-xl flex-col items-center">
                        <div className="mb-10 flex h-64 w-64 items-center justify-center rounded-[2rem] bg-white/10 shadow-2xl shadow-blue-950/30 ring-1 ring-white/18 lg:h-72 lg:w-72">
                            <img 
                                src="/logo.png" 
                                alt="Wargify Logo" 
                                className="h-52 w-52 object-contain drop-shadow-2xl lg:h-60 lg:w-60"
                            />
                        </div>
                        <h1 className="text-5xl font-black leading-tight tracking-tight lg:text-6xl">
                            Wargify
                        </h1>
                        <p className="mt-5 max-w-lg text-base font-medium leading-7 text-white/82 lg:text-lg">
                            Platform administrasi warga untuk mengelola data, iuran, fasilitas, kegiatan, pengumuman, dan ronda dalam satu dashboard.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center bg-[#ebf3f9] p-6 md:p-10">
                    <div className="w-full max-w-md">
                        <div className="mb-9 md:hidden">
                            <img src="/logo.png" alt="Wargify Logo" className="mb-5 h-32 w-32 object-contain" />
                            <h1 className="text-4xl font-black tracking-tight text-[#00468B]">Wargify</h1>
                        </div>

                        <div className="mb-10">
                            <p className="mb-3 text-base font-bold uppercase text-[#00468B]">Admin Area</p>
                            <h2 className="text-4xl font-black tracking-tight text-slate-950">Masuk ke dashboard</h2>
                            <p className="mt-4 text-base font-medium leading-7 text-slate-500">
                                Gunakan akun admin yang sudah terdaftar.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-7">
                            <div className="space-y-3">
                                <Label htmlFor="username" className="text-base font-semibold text-gray-900">
                                    Username
                                </Label>
                                <div className="relative">
                                    <UserRound className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="h-14 rounded-xl pl-12 text-base text-black"
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="password" className="text-base font-semibold text-gray-900">
                                    Password
                                </Label>
                                <div className="relative">
                                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-14 rounded-xl pl-12 pr-12 text-base text-black"
                                        disabled={isPending}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((value) => !value)}
                                        className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-[#E6F6FF] hover:text-[#00468B]"
                                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                        disabled={isPending}
                                    >
                                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                    </button>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="mt-9 h-14 w-full rounded-xl bg-[#00468B] text-lg font-bold text-white transition-colors"
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
