"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({
  className,
  ...props
}) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto rounded-2xl border border-slate-200/70 bg-white/90 p-2 shadow-sm ring-1 ring-white/70"
    >
      <table
        data-slot="table"
        className={cn("w-full min-w-max border-separate border-spacing-y-2 caption-bottom text-sm", className)}
        {...props} />
    </div>
  );
}

function TableHeader({
  className,
  ...props
}) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&_tr]:border-0 [&_th]:!bg-[#F4FAFF] [&_th]:!text-[#00468B] [&_th:first-child]:rounded-l-xl [&_th:last-child]:rounded-r-xl",
        className
      )}
      {...props} />
  );
}

function TableBody({
  className,
  ...props
}) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props} />
  );
}

function TableFooter({
  className,
  ...props
}) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("font-semibold [&>tr]:last:border-b-0", className)}
      {...props} />
  );
}

function TableRow({
  className,
  ...props
}) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "group/row border-0 transition-all duration-200 has-aria-expanded:bg-[#E6F6FF] data-[state=selected]:bg-[#E6F6FF] [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl",
        className
      )}
      {...props} />
  );
}

function TableHead({
  className,
  ...props
}) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-12 bg-[#F4FAFF] px-5 text-left align-middle text-xs font-black uppercase tracking-normal text-[#00468B] whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props} />
  );
}

function TableCell({
  className,
  ...props
}) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "bg-white px-5 py-4 align-middle font-medium text-slate-700 whitespace-nowrap shadow-[0_1px_0_rgba(15,23,42,0.06),0_-1px_0_rgba(15,23,42,0.03)] transition-colors group-hover/row:bg-[#F8FCFF] [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props} />
  );
}

function TableCaption({
  className,
  ...props
}) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props} />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
