import React, { useState, useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { IconButton, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

function formatDate(dateString) {
  let date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")}-${
    [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ][date.getMonth()]
  }-${String(date.getFullYear()).slice(-2)}`;
}

const ServerSideTable = () => {
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: { data = [], meta } = {},
    isError,
    isRefetching,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "table-data",
      columnFilters,
      globalFilter,
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
    ],
    queryFn: async () => {
      const fetchURL = new URL(
        "/api/data", // Adjust the URL to your server endpoint
        process.env.NODE_ENV === "production"
          ? "https://your-production-url.com"
          : "http://localhost:5173/"
      );

      fetchURL.searchParams.set(
        "start",
        `${pagination.pageIndex * pagination.pageSize}`
      );
      fetchURL.searchParams.set("size", `${pagination.pageSize}`);
      fetchURL.searchParams.set("filters", JSON.stringify(columnFilters ?? []));
      fetchURL.searchParams.set("globalFilter", globalFilter ?? "");
      fetchURL.searchParams.set("sorting", JSON.stringify(sorting ?? []));

      const response = await fetch(fetchURL.href);
      const json = await response.json();
      return json;
    },
    keepPreviousData: true,
  });

  const columns = useMemo(
    () => [
      {
        header: "ID",
        accessorKey: "id",
      },
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Category",
        accessorKey: "category",
        filterVariant: "multi-select",
      },
      {
        header: "Subcategory",
        accessorKey: "subcategory",
        filterVariant: "multi-select",
      },
      {
        header: "CreatedAt",
        id: "createdAt",
        filterVariant: "date-range",
        accessorFn: (originalRow) => new Date(originalRow.createdAt),
        Cell: ({ cell }) => formatDate(cell.getValue()),
      },
      {
        header: "UpdatedAt",
        id: "updatedAt",
        filterVariant: "date-range",
        accessorFn: (originalRow) => new Date(originalRow.updatedAt),
        Cell: ({ cell }) => formatDate(cell.getValue()),
      },
      {
        header: "Price",
        accessorKey: "price",
        filterVariant: "range-slider",
        filterFn: "betweenInclusive",
        muiFilterSliderProps: {
          marks: true,
          min: 11,
          max: 200,
        },
      },
      {
        header: "Sale price",
        accessorKey: "sale_price",
        filterVariant: "range-slider",
        filterFn: "betweenInclusive",
        muiFilterSliderProps: {
          marks: true,
          min: 0,
          max: 100,
        },
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data,
    enableFacetedValues: true,
    initialState: { showColumnFilters: true },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    renderTopToolbarCustomActions: () => (
      <Tooltip arrow title="Refresh Data">
        <IconButton onClick={() => refetch()}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    ),
    rowCount: meta?.totalRowCount ?? 0,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
  });

  return <MaterialReactTable table={table} />;
};

const queryClient = new QueryClient();

const ServerSideFilter = () => (
  <QueryClientProvider client={queryClient}>
    <ServerSideTable />
  </QueryClientProvider>
);

export default ServerSideFilter;
