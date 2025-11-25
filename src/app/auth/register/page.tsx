'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const payload = { name, email, password };

        try {
            const res = await fetch(
                '/api/auth/register',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    credentials: 'include',
                }
            );

            let data: any;
            try {
                data = await res.json();
            } catch {
                data = { message: 'Invalid server response' };
            }

            if (!res.ok) {
                if (res.status === 409) {
                    toast.error(data.message || 'Email already registered');
                } else {
                    toast.error(data.message || 'Registration failed');
                }
                return;
            }

            toast.success('Account created successfully!');

            setName('');
            setEmail('');
            setPassword('');

            if (data?.accessToken) {
                sessionStorage.setItem('accessToken', data.accessToken);
            }

            router.push('/dashboard');

        } catch (err: any) {
            console.error('Registration Error:', err);
            toast.error(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="min-h-screen flex items-start justify-center bg-linear-to-br from-gray-50 to-indigo-50 pt-24">
                <form className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4"
                    onSubmit={handleSubmit}>
                    <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
                        Register
                    </h2>

                    <Input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required />

                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required />

                    <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required />

                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowPassword(p => !p)}>
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </Button>

                    <p className="text-sm text-center text-gray-600 mt-2">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-indigo-600 hover:underline">
                            Login
                        </Link>
                    </p>
                </form>
            </main>

            <Footer />
        </>
    );
}
