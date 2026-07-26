import { Chip, Stack } from "@mui/material";
import { useMemo } from "react";
import type { ReactNode } from "react";
import type { DataTableColumn } from "../../../@types/dataTable";
import DataTable from "../../DataTable";
import type { SettingsBadgeColor } from "./SettingsAccordionSection";
import {
  settingsSectionTableContainerSx,
  settingsSectionTableSx,
  toPersianDigits,
} from "./styles";

export interface SettingsTableRow {
  id: string;
  title: string;
  value: ReactNode;
  status?: { label: string; color?: SettingsBadgeColor };
  action?: ReactNode;
}

export interface SettingsRowsTableProps {
  rows: SettingsTableRow[];
  isLoading?: boolean;
  /** Hide the status column for sections that have nothing to report. */
  showStatus?: boolean;
  /** Hide the action column for read-only sections. */
  showAction?: boolean;
}

/**
 * Table used inside an expanded settings section.
 *
 * Keeps the exact look of the previous flat settings table (same DataTable,
 * same header row, same hover behaviour) but scoped to a single section, so
 * every section stays readable and comparable.
 */
const SettingsRowsTable = ({
  rows,
  isLoading = false,
  showStatus = true,
  showAction = true,
}: SettingsRowsTableProps) => {
  const columns = useMemo<DataTableColumn<SettingsTableRow>[]>(() => {
    const base: DataTableColumn<SettingsTableRow>[] = [
      {
        id: "index",
        header: "#",
        width: 56,
        renderCell: (_row, index) => toPersianDigits(index + 1),
      },
      {
        id: "title",
        header: "تنظیم",
        width: "26%",
        cellSx: { fontWeight: 700 },
        renderCell: (row) => row.title,
      },
      {
        id: "value",
        header: "مقدار",
        renderCell: (row) => row.value,
      },
    ];

    if (showStatus) {
      base.push({
        id: "status",
        header: "وضعیت",
        width: "18%",
        renderCell: (row) =>
          row.status ? (
            <Chip
              size="small"
              variant="outlined"
              label={row.status.label}
              color={row.status.color ?? "default"}
              sx={{ fontWeight: 700, fontSize: "0.72rem" }}
            />
          ) : (
            "—"
          ),
      });
    }

    if (showAction) {
      base.push({
        id: "action",
        header: "عملیات",
        align: "center",
        width: 110,
        renderCell: (row) =>
          row.action ? (
            <Stack direction="row" gap={0.5} justifyContent="center">
              {row.action}
            </Stack>
          ) : (
            "—"
          ),
      });
    }

    return base;
  }, [showAction, showStatus]);

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
