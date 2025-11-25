'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const readState = () => {
            const logged = localStorage.getItem('isLoggedIn') === 'true';
            setIsLoggedIn(logged);
        };

        readState();
        const onAuthChange = () => readState();
        window.addEventListener('authChange', onAuthChange);

        const onStorage = (e: StorageEvent) => {
            if (e.key === 'isLoggedIn') readState();
        };
        window.addEventListener('storage', onStorage);

        return () => {
            window.removeEventListener('authChange', onAuthChange);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    const handleLogout = () => {
        localStorage.setItem('isLoggedIn', 'false');
        window.dispatchEvent(new Event('authChange'));
        setIsLoggedIn(false);
        toast.success('Logged out Successfully!');
        router.replace('/auth/login');
    };

    return (
        <nav className="bg-white border-b">
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-indigo-600">UptimePulse</Link>

                {isLoggedIn ? (
                    <Button onClick={handleLogout}>Logout</Button>
                ) : (
                    <Button asChild>
                        <Link href="/auth/register">Get Started</Link>
                    </Button>
                )}
            </div>
        </nav>
    );
}
