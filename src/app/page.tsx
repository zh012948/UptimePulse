'use client'
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
        <section className="max-w-6xl mx-auto px-6 py-20 text-center">
          <Badge className="mb-4" variant="secondary">
            Free Tier? No Problem.
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Keep Your API <span className="text-indigo-600">Awake</span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Render / Heroku free tier sleeps after 15 min.{' '}
            <code className="bg-gray-200 px-2 rounded">UptimePulse</code> pings
            your <code className="bg-gray-200 px-2 rounded">/health</code>{' '}
            endpoint every 5 min – <strong>for free</strong>.
          </p>

          <div className="flex gap-4 justify-center">

            {/* Dashboard Button */}
            <Link href="/dashboard">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                Open Dashboard
              </Button>
            </Link>

            {/* GitHub Button */}
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                window.open("https://github.com/zh012948/uptimepulse", "_blank")
              }
            >
              GitHub
            </Button>

          </div>

          <div className="mt-20 grid md:grid-cols-3 gap-8 text-left">
            {[
              { title: 'Never Sleep', desc: 'Auto-ping every 5-15 min' },
              { title: 'Live Status', desc: 'Up/Down + countdown' },
              { title: 'Dev-First UI', desc: 'Next.js + Tailwind + shadcn' },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <Analytics />
    </>
  );
}
