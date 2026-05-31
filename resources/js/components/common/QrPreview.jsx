import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function QrPreview({ label, value }) {
    const qrValue = value || '-';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrValue)}`;

    const copyValue = async () => {
        await navigator.clipboard.writeText(qrValue);
        toast.success('Data QR berhasil disalin.');
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="grid size-44 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <img src={qrUrl} alt={`QR ${label}`} className="size-36 object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-900">{label}</p>
                    <p className="mt-2 break-all rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-600">
                        {qrValue}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={copyValue}>
                            <Copy className="mr-2 size-4" />
                            Salin data
                        </Button>
                        <a href={qrUrl} download={`${label}.png`} target="_blank" rel="noreferrer">
                            <Button type="button" size="sm" className="bg-[#00468B] text-white hover:bg-[#003366]">
                                <Download className="mr-2 size-4" />
                                Unduh QR
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
