'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Loader2, ExternalLink, Plus, Search, MoreHorizontal } from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface APIStatus {
    _id?: string;
    name: string;
    url: string;
    endpoint?: string;
    status?: 'UP' | 'DOWN';
    responseTime?: number | null;
    createdAt?: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [statuses, setStatuses] = useState<APIStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [pinging, setPinging] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [currentApi, setCurrentApi] = useState<APIStatus | null>(null);
    const [newApi, setNewApi] = useState({ name: '', url: '', endpoint: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [sortNewest, setSortNewest] = useState(true);
    const [adding, setAdding] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ show: boolean; id?: string }>({ show: false });

    const MIN_LOADING_DELAY = 1000;

    // -------------------------------
    // Helper functions
    // -------------------------------
    const normalizeUrl = (url: string) => url?.trim().replace(/\/+$/g, '');
    const normalizeEndpoint = (endpoint?: string) => {
        if (!endpoint) return '';
        const trimmed = endpoint.trim();
        if (!trimmed) return '';
        return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    };
    const fullUrlForDisplay = (api: APIStatus) => {
        const u = normalizeUrl(api.url);
        const e = normalizeEndpoint(api.endpoint);
        return `${u}${e}`;
    };

    // -------------------------------
    // Auth check
    // -------------------------------
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) router.replace('/auth/login');
        else setAuthChecked(true);
    }, [router]);

    // -------------------------------
    // Fetch statuses + click outside menu handler
    // -------------------------------
    useEffect(() => {
        if (!authChecked) return;
        fetchStatuses();

        const handleClickOutside = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('.menu-container')) setMenuOpen(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [authChecked]);

    // -------------------------------
    // Fetch APIs
    // -------------------------------
    const fetchStatuses = async () => {
        setLoading(true);
        const startTime = Date.now();
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            const res = await fetch(`/api/url/mine?userId=${userId}`, { cache: 'no-store' });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();

            if (Array.isArray(data.urls)) {
                const normalized = data.urls.map((u: APIStatus) => ({
                    ...u,
                    url: normalizeUrl(u.url),
                    endpoint: normalizeEndpoint(u.endpoint),
                }));
                setStatuses(normalized);

                // ping all for status
                const pingPromises = normalized.map((api: APIStatus) => (api._id ? pingApi(api) : Promise.resolve()));
                await Promise.allSettled(pingPromises);
            }
        } catch (err) {
            toast.error('Failed to fetch APIs');
        } finally {
            const elapsed = Date.now() - startTime;
            const remaining = MIN_LOADING_DELAY - elapsed;
            if (remaining > 0) await new Promise(res => setTimeout(res, remaining));
            setLoading(false);
        }
    };

    // -------------------------------
    // Ping API
    // -------------------------------
    const pingApi = async (api: APIStatus) => {
        if (!api._id) return;
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            const url = normalizeUrl(api.url);
            const endpoint = normalizeEndpoint(api.endpoint);

            const res = await fetch(`/api/ping?userId=${userId}&url=${encodeURIComponent(url)}&endpoint=${encodeURIComponent(endpoint)}`, { cache: 'no-store' });
            if (!res.ok) throw new Error(await res.text());

            const data: { results: APIStatus[] } = await res.json();
            const updated = data.results.find(r => r._id === api._id);
            if (updated) {
                const normalized: APIStatus = {
                    ...updated,
                    url: normalizeUrl(updated.url),
                    endpoint: normalizeEndpoint(updated.endpoint),
                };
                setStatuses(prev => prev.map(s => (s._id === normalized._id ? normalized : s)));
            }
        } catch {
            // silent ping failure
        }
    };

    const handlePingNow = async (api: APIStatus) => {
        if (!api._id) return;
        setPinging(api._id);
        try {
            await pingApi(api);
            toast.success('Ping complete');
        } catch {
            toast.error('Ping failed');
        } finally {
            setPinging(null);
        }
    };

    // -------------------------------
    // Add API
    // -------------------------------
    const handleAddApi = async () => {
        if (!newApi.name || !newApi.url) {
            toast.error('Name and URL are required');
            return;
        }
        setAdding(true);
        setLoading(true); // trigger loading UI
        try {
            const userId = localStorage.getItem('userId');
            const payload = {
                name: newApi.name.trim(),
                url: normalizeUrl(newApi.url),
                endpoint: normalizeEndpoint(newApi.endpoint),
                userId,
            };
            const res = await fetch(`/api/url/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();

            toast.success(data.message || 'API added successfully');
            setShowAddModal(false);
            setNewApi({ name: '', url: '', endpoint: '' });

            // fetch all APIs for smooth transition
            await fetchStatuses();
        } catch (err) {
            toast.error('Failed to add API');
        } finally {
            setAdding(false);
            setLoading(false);
        }
    };

    // -------------------------------
    // Update API
    // -------------------------------
    const handleEdit = (api: APIStatus) => {
        setCurrentApi(api);
        setNewApi({ name: api.name, url: api.url, endpoint: api.endpoint || '' });
        setShowUpdateModal(true);
        setMenuOpen(null);
    };

    const handleUpdateApi = async () => {
        if (!currentApi) return;
        setUpdating(true);
        try {
            const updatedPayload = {
                id: currentApi._id,
                name: newApi.name.trim(),
                url: normalizeUrl(newApi.url),
                endpoint: normalizeEndpoint(newApi.endpoint),
            };

            // optimistically update
            setStatuses(prev => prev.map(s => (s._id === currentApi._id ? { ...s, ...updatedPayload } as APIStatus : s)));

            const res = await fetch(`/api/url/edit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPayload),
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();

            toast.success(data.message || 'API updated successfully');
            setShowUpdateModal(false);
            setCurrentApi(null);
            setNewApi({ name: '', url: '', endpoint: '' });

            await pingApi({ _id: updatedPayload.id, url: updatedPayload.url, endpoint: updatedPayload.endpoint } as APIStatus);
        } catch (err) {
            toast.error('Failed to update API');
            fetchStatuses();
        } finally {
            setUpdating(false);
        }
    };

    // -------------------------------
    // Delete API
    // -------------------------------
    const handleDelete = async (id: string) => {
        const backup = statuses;
        setDeleteModal({ show: false });
        setStatuses(prev => prev.filter(s => s._id !== id));

        try {
            const res = await fetch(`/api/url/delete?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            toast.success(data.message || 'API deleted successfully');
        } catch {
            toast.error('Failed to delete API');
            setStatuses(backup);
        }
    };

    const filteredStatuses = statuses
        .filter(api =>
            api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fullUrlForDisplay(api).toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return sortNewest ? tb - ta : ta - tb;
        });

    if (!authChecked) return <div className="flex items-center justify-center min-h-screen">Checking authentication...</div>;

    return (
        <>
            <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
            <Navbar />
            <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 py-12 px-6">
                <div className="max-w-6xl mx-auto flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-800">API Uptime Dashboard</h1>
                        <Button size="sm" onClick={() => setShowAddModal(true)} className="flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Add URL
                        </Button>
                    </div>

                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search APIs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-3 py-2 border rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>

                    <p className="text-sm text-gray-500">{`You have ${statuses.length} API${statuses.length !== 1 ? 's' : ''}`}</p>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                            <p className="text-gray-500 text-sm">Loading your APIs...</p>
                        </div>
                    ) : filteredStatuses.length === 0 ? (
                        <div className="flex items-center justify-center py-24 text-center text-gray-500">
                            <p className="text-lg font-medium">No APIs found.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredStatuses.map(api => (
                                <Card key={api._id} className="p-5 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 rounded-2xl relative">
                                    <div className="absolute top-3 right-3 menu-container translate-y-2">
                                        <button onClick={() => setMenuOpen(menuOpen === api._id ? null : api._id || null)} className="p-1 rounded-full hover:bg-gray-100">
                                            <MoreHorizontal className="w-4 h-4 text-gray-600" />
                                        </button>
                                        {menuOpen === api._id && (
                                            <div className="absolute right-0 w-28 bg-white border rounded shadow-md flex flex-col z-50">
                                                <button className="px-2 py-1 text-sm hover:bg-gray-100 text-gray-700" onClick={() => handleEdit(api)}>Edit</button>
                                                <button className="px-2 py-1 text-sm hover:bg-red-100 text-red-600" onClick={() => setDeleteModal({ show: true, id: api._id })}>Delete</button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-gray-800">{api.name}</h3>
                                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 -translate-x-5 ${api.status === 'UP' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            <span className={`w-2 h-2 rounded-full ${api.status === 'UP' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {api.status || '--'}
                                        </div>
                                    </div>
                                    <a href={fullUrlForDisplay(api)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-3 underline">
                                        {fullUrlForDisplay(api)}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                    <p className="text-xs text-gray-500 font-mono mb-4">
                                        Response time: <span className="text-gray-700 font-semibold">{api.responseTime ? `${api.responseTime} ms` : '--'}</span>
                                    </p>
                                    <Button size="sm" variant="outline" className={`w-full text-sm font-medium ${pinging === api._id ? 'cursor-not-allowed opacity-60' : 'hover:bg-blue-50 hover:text-blue-700'}`} onClick={() => handlePingNow(api)} disabled={pinging === api._id}>
                                        {pinging === api._id ? 'Pinging...' : 'Ping Now'}
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />

            {showAddModal && (
                <Modal title="Add New API" onClose={() => setShowAddModal(false)} actionText="Add" loading={adding} onAction={handleAddApi} api={newApi} setApi={setNewApi} />
            )}

            {showUpdateModal && currentApi && (
                <Modal title="Update API" onClose={() => setShowUpdateModal(false)} actionText="Update" loading={updating} onAction={handleUpdateApi} api={newApi} setApi={setNewApi} />
            )}

            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-96 flex flex-col gap-4 animate-fade-in">
                        <h2 className="text-xl font-semibold text-gray-800">Confirm Delete</h2>
                        <p className="text-gray-600 text-sm">Are you sure you want to delete this API? This action cannot be undone.</p>
                        <div className="flex justify-end gap-2 mt-2">
                            <Button variant="outline" onClick={() => setDeleteModal({ show: false })}>Cancel</Button>
                            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDelete(deleteModal.id!)}>Delete</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const Modal = ({ title, onClose, actionText, loading, onAction, api, setApi }: any) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg p-6 w-96 flex flex-col gap-4 animate-fade-in">
            <h2 className="text-xl font-semibold">{title}</h2>
            <InputFields api={api} setApi={setApi} />
            <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={onAction}>{loading ? `${actionText}ing...` : actionText}</Button>
            </div>
        </div>
    </div>
);

const InputFields = ({ api, setApi }: { api: { name: string; url: string; endpoint: string }, setApi: any }) => (
    <>
        <div className="flex flex-col gap-1">
            <label className="text-gray-700 text-sm font-medium">Project Name</label>
            <input type="text" placeholder="Enter project name" className="border rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" value={api.name} onChange={e => setApi((prev: any) => ({ ...prev, name: e.target.value }))} />
        </div>
        <div className="flex flex-col gap-1">
            <label className="text-gray-700 text-sm font-medium">Backend URL</label>
            <input type="text" placeholder="https://example.com" className="border rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" value={api.url} onChange={e => setApi((prev: any) => ({ ...prev, url: e.target.value }))} />
        </div>
        <div className="flex flex-col gap-1">
            <label className="text-gray-700 text-sm font-medium">Endpoint (optional)</label>
            <input type="text" placeholder="/health" className="border rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" value={api.endpoint} onChange={e => setApi((prev: any) => ({ ...prev, endpoint: e.target.value }))} />
        </div>
    </>
);
