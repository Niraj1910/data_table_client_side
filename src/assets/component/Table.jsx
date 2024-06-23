import React, { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

import sample_data from "../../../sample_data.json";

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

const Table = () => {
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
        accessorFn: (originalRow) => new Date(originalRow.createdAt), //convert to date for sorting and filtering
        Cell: ({ cell }) => formatDate(cell.getValue()), // convert back to string for display
      },
      {
        header: "UpdatedAt",
        id: "updatedAt",
        filterVariant: "date-range",
        accessorFn: (originalRow) => new Date(originalRow.updatedAt), //convert to date for sorting and filtering
        Cell: ({ cell }) => formatDate(cell.getValue()), // convert back to string for display
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
    sample_data,
    columns,
    enableFacetedValues: true,
    initialState: { showColumnFilters: true },
  });

  return <MaterialReactTable table={table} />;
};

export default Table;
