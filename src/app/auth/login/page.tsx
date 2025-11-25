'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // check localStorage for existing login
        const logged = localStorage.getItem('isLoggedIn') === 'true';
        if (logged) {
            toast.success('Welcome back!');
            router.replace('/dashboard');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });


            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');

            localStorage.setItem('isLoggedIn', 'true');
            if (data.user?.id) localStorage.setItem('userId', data.user.id);

            window.dispatchEvent(new Event('authChange'));
            toast.success('Logged in successfully!');
            setEmail('');
            setPassword('');
            router.push('/dashboard');

        } catch (err: any) {
            toast.error(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };



    return (
        <>
            <Navbar />
            <main className="min-h-screen flex items-start justify-center bg-linear-to-br from-gray-50 to-indigo-50 pt-24">
                <form
                    className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4"
                    onSubmit={handleSubmit}
                >
                    <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>

                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />

                    <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowPassword(prev => !prev)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>

                    <p className="text-sm text-center text-gray-600 mt-2">
                        Don't have an account?{' '}
                        <Link href="/auth/register" className="text-indigo-600 hover:underline">
                            Register
                        </Link>
                    </p>
                </form>
            </main>
            <Footer />
        </>
    );
}
