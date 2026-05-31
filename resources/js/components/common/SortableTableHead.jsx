import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableHead } from '@/components/ui/table';

export default function SortableTableHead({
    children,
    className = '',
    field,
    onSort,
    sortField,
    sortDirection,
}) {
    const isActive = sortField === field;
    const Icon = !isActive ? ArrowUpDown : sortDirection === 'asc' ? ArrowUp : ArrowDown;

    return (
        <TableHead className={`font-semibold text-muted-foreground ${className}`}>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto gap-1 px-0 py-0 font-semibold text-muted-foreground hover:bg-transparent hover:text-slate-900"
                onClick={() => onSort(field)}
            >
                {children}
                <Icon className="size-3.5" />
            </Button>
        </TableHead>
    );
}
