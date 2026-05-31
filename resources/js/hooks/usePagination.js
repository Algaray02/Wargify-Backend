import { useEffect, useMemo, useState } from 'react';

export function usePagination(items, pageSize = 10) {
    const [page, setPage] = useState(1);
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const paginatedItems = useMemo(() => {
        const start = (page - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [items, page, pageSize]);

    const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalItems);

    return {
        from,
        page,
        pageSize,
        paginatedItems,
        setPage,
        to,
        totalItems,
        totalPages,
    };
}
