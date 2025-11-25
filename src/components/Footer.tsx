export default function Footer() {
    const links = [
        { label: 'GitHub', href: 'https://github.com/zh012948/uptimepulse' },
        { label: 'Contact', href: 'mailto:zh012948@gmail.com' },
        { label: 'Portfolio', href: 'https://m-zeeshan-haider.vercel.app' },
    ];

    const date = new Date().getFullYear();

    return (
        <footer className="bg-white border-t py-8 mt-20">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
                <p>© {date} UptimePulse. Made for developers.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    {links.map((l) => (
                        <a
                            key={l.label}
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-indigo-600 transition-colors"
                        >
                            {l.label}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}