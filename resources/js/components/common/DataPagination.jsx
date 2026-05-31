import React from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

export default function DataPagination({
    from,
    onPageChange,
    page,
    to,
    totalItems,
    totalPages,
}) {
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
                Menampilkan {from}-{to} dari {totalItems} baris
            </div>

            <Pagination className="mx-0 w-auto">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(event) => {
                                event.preventDefault();
                                onPageChange(Math.max(1, page - 1));
                            }}
                            className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>

                    {pages.map((pageNumber) => (
                        <PaginationItem key={pageNumber}>
                            <PaginationLink
                                href="#"
                                isActive={pageNumber === page}
                                onClick={(event) => {
                                    event.preventDefault();
                                    onPageChange(pageNumber);
                                }}
                                className={pageNumber === page ? 'bg-[#00468B] text-white hover:bg-[#003366] hover:text-white' : ''}
                            >
                                {pageNumber}
                            </PaginationLink>
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(event) => {
                                event.preventDefault();
                                onPageChange(Math.min(totalPages, page + 1));
                            }}
                            className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
