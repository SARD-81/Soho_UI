import { Stack, Tooltip } from "@mui/material";
import { useMemo } from "react";
import type { ReactNode } from "react";
import type { DataTableColumn } from "../../../@types/dataTable";
import DataTable from "../../DataTable";
import {
  settingsSectionTableContainerSx,
  settingsSectionTableSx,
  toPersianDigits,
} from "./styles";

export interface SettingsTableRow {
  id: string;
  title: string;
  /** Optional tooltip that explains the row title. */
  hint?: string;
  value: ReactNode;
  /**
   * Inline control rendered right next to the value (edit icon, status chip).
   * The table has no dedicated action column any more, so every interaction
   * lives here.
   */
  valueAdornment?: ReactNode;
}

export interface SettingsRowsTableProps {
  rows: SettingsTableRow[];
  isLoading?: boolean;
}

/**
 * Table used inside an expanded settings section.
 *
 * Only three columns are rendered: the row number, the setting name and its
 * value. Status chips and edit icons sit inside the value cell, next to the
 * data they belong to.
 */
const SettingsRowsTable = ({
  rows,
  isLoading = false,
}: SettingsRowsTableProps) => {
  const columns = useMemo<DataTableColumn<SettingsTableRow>[]>(
    () => [
      {
        id: "index",
        header: "#",
        width: 56,
        renderCell: (_row, index) => toPersianDigits(index + 1),
      },
      {
        id: "title",
        header: "تنطیم",
        width: "30%",
        cellSx: { fontWeight: 700 },
        renderCell: (row) =>
          row.hint ? (
            <Tooltip title={row.hint} arrow>
              <span
                style={{
                  textDecoration: "underline dotted",
                  textUnderlineOffset: "4px",
                  cursor: "help",
                }}
              >
                {row.title}
              </span>
            </Tooltip>
          ) : (
            row.title
          ),
      },
      {
        id: "value",
        header: "مقدار",
        renderCell: (row) => (
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ minWidth: 0, flexWrap: "wrap" }}
          >
            <Stack sx={{ minWidth: 0 }}>{row.value}</Stack>
            {row.valueAdornment}
          </Stack>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable<SettingsTableRow>
      columns={columns}
      data={rows}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      containerSx={settingsSectionTableContainerSx}
      tableSx={settingsSectionTableSx}
    />
  );
};

export default SettingsRowsTable;
