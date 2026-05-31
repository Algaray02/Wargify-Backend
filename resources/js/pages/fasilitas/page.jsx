import React, { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import DataPagination from '@/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import {
    useFacilityReports,
    useRespondFacilityReport,
    useUpdateFacilityReportStatus,
} from '@/hooks/useFacilityReports';
import {
    AlertCircle,
    CheckCircle2,
    Clock3,
    Eye,
    ImageIcon,
    Search,
    Upload,
    Wrench,
} from 'lucide-react';

const statusOptions = [
    { value: 'ALL', label: 'Semua status' },
    { value: 'SUBMITTED', label: 'Baru masuk' },
    { value: 'IN_PROGRESS', label: 'Sedang diproses' },
    { value: 'RESOLVED', label: 'Selesai' },
];

const statusMeta = {
    SUBMITTED: {
        label: 'Baru masuk',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
        icon: AlertCircle,
    },
    IN_PROGRESS: {
        label: 'Sedang diproses',
        className: 'border-blue-200 bg-blue-50 text-blue-700',
        icon: Wrench,
    },
    RESOLVED: {
        label: 'Selesai',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        icon: CheckCircle2,
    },
};

const emptyResponseForm = {
    response_message: '',
    resolved_photo_file: null,
};

const formatDate = (value) => value
    ? new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value))
    : '-';

const imageSource = (url) => {
    if (!url) return null;
    if (/^https?:\/\//.test(url)) return url;
    return url.startsWith('/') ? url : `/${url}`;
};

function StatusBadge({ status }) {
    const meta = statusMeta[status] ?? statusMeta.SUBMITTED;
    const Icon = meta.icon;

    return (
        <Badge variant="outline" className={meta.className}>
            <Icon className="mr-1 size-3" />
            {meta.label}
        </Badge>
    );
}

export default function FasilitasPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [selectedReport, setSelectedReport] = useState(null);
    const [responseForm, setResponseForm] = useState(emptyResponseForm);
    const { data: reports = [], isLoading, isError } = useFacilityReports();
    const updateStatus = useUpdateFacilityReportStatus();
    const respondReport = useRespondFacilityReport();

    const categories = useMemo(() => (
        [...new Set(reports.map((report) => report.category).filter(Boolean))].sort()
    ), [reports]);

    const filteredReports = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return reports.filter((report) => {
            const matchStatus = statusFilter === 'ALL' || report.status === statusFilter;
            const matchCategory = categoryFilter === 'ALL' || report.category === categoryFilter;
            const matchKeyword = [
                report.title,
                report.category,
                report.description,
                report.reporter?.full_name,
                report.reporter?.phone_number,
                statusMeta[report.status]?.label,
            ].some((value) => String(value ?? '').toLowerCase().includes(keyword));

            return matchStatus && matchCategory && matchKeyword;
        });
    }, [categoryFilter, reports, search, statusFilter]);

    const pagination = usePagination(filteredReports, 10);
    const selectedStatusLabel = statusOptions.find((option) => option.value === statusFilter)?.label ?? 'Semua status';
    const isMutating = updateStatus.isPending || respondReport.isPending;

    const summary = useMemo(() => ({
        total: reports.length,
        submitted: reports.filter((report) => report.status === 'SUBMITTED').length,
        progress: reports.filter((report) => report.status === 'IN_PROGRESS').length,
        resolved: reports.filter((report) => report.status === 'RESOLVED').length,
    }), [reports]);

    const openDetail = (report) => {
        setSelectedReport(report);
        setResponseForm({
            response_message: report.response_message ?? '',
            resolved_photo_file: null,
        });
    };

    const changeStatus = async (report, status) => {
        await updateStatus.mutateAsync({
            reportId: report.report_id,
            payload: { status },
        });
        setSelectedReport((current) => current?.report_id === report.report_id ? { ...current, status } : current);
    };

    const submitResponse = async (event) => {
        event.preventDefault();
        if (!selectedReport) return;

        await respondReport.mutateAsync({
            reportId: selectedReport.report_id,
            payload: responseForm,
        });
        setSelectedReport(null);
        setResponseForm(emptyResponseForm);
    };

    return (
        <DashboardLayout>
            <Head title="Laporan Fasilitas - Wargify" />

            <div className="space-y-6 p-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Laporan Fasilitas</h1>
                    <p className="mt-2 max-w-2xl text-sm text-gray-500">
                        Triage laporan warga, pantau progres pengerjaan, dan kirim bukti penyelesaian.
                    </p>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <ImageIcon className="size-9 rounded-lg bg-slate-100 p-2 text-slate-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Total laporan</p>
                                <p className="text-2xl font-semibold text-slate-900">{summary.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <AlertCircle className="size-9 rounded-lg bg-amber-50 p-2 text-amber-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Baru masuk</p>
                                <p className="text-2xl font-semibold text-slate-900">{summary.submitted}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <Wrench className="size-9 rounded-lg bg-blue-50 p-2 text-blue-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Sedang diproses</p>
                                <p className="text-2xl font-semibold text-slate-900">{summary.progress}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardContent className="flex items-center gap-3">
                            <CheckCircle2 className="size-9 rounded-lg bg-emerald-50 p-2 text-emerald-700" />
                            <div>
                                <p className="text-xs font-medium text-slate-500">Selesai</p>
                                <p className="text-2xl font-semibold text-slate-900">{summary.resolved}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="rounded-lg border bg-white p-4">
                    <div className="grid gap-3 lg:grid-cols-[1fr_190px_190px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Cari judul, kategori, pelapor, telepon, atau status"
                                className="pl-9"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue>{selectedStatusLabel}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger>
                                <SelectValue>{categoryFilter === 'ALL' ? 'Semua kategori' : categoryFilter}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua kategori</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border bg-white">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Laporan</TableHead>
                                <TableHead>Pelapor</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Dibuat</TableHead>
                                <TableHead className="w-44">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">Memuat laporan fasilitas...</TableCell>
                                </TableRow>
                            )}
                            {isError && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-red-600">Gagal memuat laporan fasilitas.</TableCell>
                                </TableRow>
                            )}
                            {!isLoading && !isError && filteredReports.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-slate-500">Tidak ada laporan yang cocok.</TableCell>
                                </TableRow>
                            )}
                            {pagination.paginatedItems.map((report) => (
                                <TableRow key={report.report_id}>
                                    <TableCell>
                                        <div className="max-w-lg">
                                            <p className="font-semibold text-slate-900">{report.title}</p>
                                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{report.description}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-slate-900">{report.reporter?.full_name ?? '-'}</p>
                                            <p className="text-xs text-slate-500">{report.reporter?.phone_number ?? '-'}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{report.category}</TableCell>
                                    <TableCell><StatusBadge status={report.status} /></TableCell>
                                    <TableCell>{formatDate(report.created_at)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-2">
                                            {report.status === 'SUBMITTED' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isMutating}
                                                    onClick={() => changeStatus(report, 'IN_PROGRESS')}
                                                >
                                                    <Wrench className="size-4" />
                                                    Proses
                                                </Button>
                                            )}
                                            <Button
                                                size="icon"
                                                className="size-9 bg-[#00468B] text-white hover:bg-[#003366]"
                                                title="Detail laporan"
                                                onClick={() => openDetail(report)}
                                            >
                                                <Eye className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <DataPagination
                    from={pagination.from}
                    onPageChange={pagination.setPage}
                    page={pagination.page}
                    to={pagination.to}
                    totalItems={pagination.totalItems}
                    totalPages={pagination.totalPages}
                />

                <Dialog open={Boolean(selectedReport)} onOpenChange={(open) => !open && setSelectedReport(null)}>
                    <DialogContent className="max-h-[90vh] overflow-hidden bg-white p-0 sm:max-w-5xl">
                        {selectedReport && (
                            <div className="flex max-h-[90vh] flex-col">
                                <div className="border-b bg-white px-6 py-5">
                                    <DialogHeader className="pr-8">
                                        <DialogTitle className="text-xl leading-7">{selectedReport.title}</DialogTitle>
                                    </DialogHeader>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <StatusBadge status={selectedReport.status} />
                                        <Badge variant="outline" className="bg-white">{selectedReport.category}</Badge>
                                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                            {formatDate(selectedReport.created_at)}
                                        </span>
                                    </div>
                                </div>

                                <div className="overflow-y-auto p-6">
                                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                                        <div className="min-w-0 space-y-6">
                                            <div className="rounded-lg border bg-slate-50 p-4">
                                                <p className="text-sm font-semibold text-slate-900">Pelapor</p>
                                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                    <div>
                                                        <p className="text-xs font-medium uppercase text-slate-500">Nama</p>
                                                        <p className="mt-1 text-sm font-medium text-slate-800">{selectedReport.reporter?.full_name ?? '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium uppercase text-slate-500">Telepon</p>
                                                        <p className="mt-1 text-sm font-medium text-slate-800">{selectedReport.reporter?.phone_number ?? '-'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <section className="space-y-3">
                                                <p className="text-sm font-semibold text-slate-900">Deskripsi laporan</p>
                                                <div className="rounded-lg border bg-white p-4">
                                                    <p className="whitespace-pre-line text-sm leading-7 text-slate-600">{selectedReport.description}</p>
                                                </div>
                                            </section>

                                            <section className="grid gap-5 lg:grid-cols-2">
                                                <div className="space-y-3">
                                                    <p className="text-sm font-semibold text-slate-900">Foto laporan</p>
                                                    {imageSource(selectedReport.image_url) ? (
                                                        <img
                                                            src={imageSource(selectedReport.image_url)}
                                                            alt="Foto laporan fasilitas"
                                                            className="h-64 w-full rounded-lg border object-cover"
                                                        />
                                                    ) : (
                                                        <div className="grid h-64 place-items-center rounded-lg border border-dashed bg-slate-50 text-sm text-slate-500">
                                                            Tidak ada foto laporan
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-sm font-semibold text-slate-900">Foto penyelesaian</p>
                                                    {imageSource(selectedReport.resolved_photo_url) ? (
                                                        <img
                                                            src={imageSource(selectedReport.resolved_photo_url)}
                                                            alt="Foto bukti penyelesaian"
                                                            className="h-64 w-full rounded-lg border object-cover"
                                                        />
                                                    ) : (
                                                        <div className="grid h-64 place-items-center rounded-lg border border-dashed bg-slate-50 text-sm text-slate-500">
                                                            Belum ada bukti selesai
                                                        </div>
                                                    )}
                                                </div>
                                            </section>

                                            {selectedReport.response_message && (
                                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                                                    <p className="text-sm font-semibold text-emerald-900">Tanggapan pengurus</p>
                                                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-emerald-800">{selectedReport.response_message}</p>
                                                </div>
                                            )}
                                        </div>

                                        <aside className="rounded-lg border bg-slate-50 p-5">
                                            <div className="mb-5">
                                                <p className="text-sm font-semibold text-slate-900">Tindak lanjut</p>
                                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                                    Gunakan status untuk progres pengerjaan. Isi tanggapan saat pekerjaan sudah selesai.
                                                </p>
                                            </div>
                                            <div className="mb-5 grid gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    disabled={isMutating || selectedReport.status !== 'SUBMITTED'}
                                                    onClick={() => changeStatus(selectedReport, 'IN_PROGRESS')}
                                                >
                                                    <Clock3 className="size-4" />
                                                    Tandai Diproses
                                                </Button>
                                            </div>
                                            <form onSubmit={submitResponse} className="space-y-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="response_message">Tanggapan penyelesaian</Label>
                                                    <Textarea
                                                        id="response_message"
                                                        className="min-h-32 bg-white"
                                                        value={responseForm.response_message}
                                                        onChange={(event) => setResponseForm((current) => ({ ...current, response_message: event.target.value }))}
                                                        placeholder="Contoh: Lampu sudah diganti dan area sudah dicek ulang."
                                                        required
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="resolved_photo_file">Foto bukti selesai</Label>
                                                    <Input
                                                        id="resolved_photo_file"
                                                        type="file"
                                                        accept="image/*"
                                                        className="bg-white"
                                                        onChange={(event) => setResponseForm((current) => ({ ...current, resolved_photo_file: event.target.files?.[0] ?? null }))}
                                                    />
                                                    <p className="text-xs leading-5 text-slate-500">Opsional, tersimpan ke bucket laporan fasilitas.</p>
                                                </div>
                                                <Button
                                                    type="submit"
                                                    disabled={isMutating}
                                                    className="w-full bg-[#00468B] text-white hover:bg-[#003366]"
                                                >
                                                    <Upload className="size-4" />
                                                    {respondReport.isPending ? 'Mengirim...' : 'Selesaikan Laporan'}
                                                </Button>
                                            </form>
                                        </aside>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
