"use client";

import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import dayjs from "dayjs";
import { Briefcase, Plus, Search } from "lucide-react";
import { getApplicationsAction } from "@/app/(workspace)/applications/actions";
import { ApplicationFormDrawer } from "./ApplicationFormDrawer";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

import "ag-grid-community/styles/ag-grid.css";
import "./applications-grid.css";

type ApplicationRow = {
  id: string;
  company: string;
  role: string;
  appliedAt: string;
  status: string;
  statusChangedAt: string;
};

function formatDate(dateStr: string) {
  return dayjs(dateStr).format("DDMMMYY");
}

function CompanyCellRenderer(props: ICellRendererParams<ApplicationRow>) {
  return (
    <div style={{ padding: "16px 20px", width: "100%" }}>
      <div style={{ color: "var(--text)", fontWeight: 500, fontSize: "14px" }}>
        {props.value}
      </div>
    </div>
  );
}

function RoleCellRenderer(props: ICellRendererParams<ApplicationRow>) {
  return (
    <div style={{ padding: "16px 20px", width: "100%" }}>
      <div style={{ color: "var(--text)", fontSize: "14px" }}>
        {props.value}
      </div>
    </div>
  );
}

function DateCellRenderer(props: ICellRendererParams<ApplicationRow>) {
  return (
    <div style={{ padding: "16px 20px", width: "100%" }}>
      <div style={{ color: "var(--text)", fontSize: "13px", fontVariantNumeric: "tabular-nums" }}>
        {formatDate(props.value)}
      </div>
    </div>
  );
}

function StatusCellRenderer(props: ICellRendererParams<ApplicationRow>) {
  const status = props.value as string;
  const statusColors: Record<string, string> = {
    applied: "var(--text-muted)",
    screening: "var(--accent-text)",
    interview: "var(--success)",
    offer: "var(--accent)",
    rejected: "var(--danger)",
    withdrawn: "var(--text-muted)",
  };
  return (
    <div style={{ padding: "16px 20px", width: "100%" }}>
      <span
        style={{
          color: statusColors[status] || "var(--text)",
          textTransform: "capitalize",
          fontWeight: 500,
          fontSize: "13px",
        }}
      >
        {status}
      </span>
    </div>
  );
}

function ActionsCellRenderer(props: ICellRendererParams<ApplicationRow>) {
  const onEdit = (props as any).context?.onEdit;
  return (
    <div style={{ padding: "16px 20px", width: "100%", display: "flex", alignItems: "center" }}>
      <button
        type="button"
        onClick={() => onEdit?.(props.data)}
        className="px-3 py-1.5 text-xs rounded-md border border-border bg-surface hover:bg-surface-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
        style={{ color: "var(--text)" }}
      >
        Edit
      </button>
    </div>
  );
}

export function ApplicationsList() {
  const [searchText, setSearchText] = useState("");
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editingData, setEditingData] = useState<any>(null);

  const fetchApplications = async () => {
    setIsLoading(true);
    const result = await getApplicationsAction();
    if (result.data) {
      setApplications(result.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAdd = () => {
    setDrawerMode("create");
    setEditingData(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (row: ApplicationRow) => {
    setDrawerMode("edit");
    setEditingData({
      id: row.id,
      company: row.company,
      role: row.role,
      appliedAt: dayjs(row.appliedAt).format("YYYY-MM-DD"),
      status: row.status,
    });
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setEditingData(null);
  };

  const handleDrawerSuccess = () => {
    fetchApplications();
  };

  const columnDefs = useMemo<ColDef<ApplicationRow>[]>(
    () => [
      { field: "company", headerName: "Company", flex: 1, minWidth: 180, cellRenderer: CompanyCellRenderer },
      { field: "role", headerName: "Role", flex: 1, minWidth: 180, cellRenderer: RoleCellRenderer },
      {
        field: "appliedAt",
        headerName: "Applied",
        width: 140,
        cellRenderer: DateCellRenderer,
      },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        cellRenderer: StatusCellRenderer,
      },
      {
        field: "statusChangedAt",
        headerName: "Status changed",
        width: 160,
        cellRenderer: DateCellRenderer,
      },
      {
        headerName: "Actions",
        width: 120,
        cellRenderer: ActionsCellRenderer,
        sortable: false,
        filter: false,
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: false,
      resizable: true,
    }),
    []
  );

  const context = useMemo(() => ({ onEdit: handleEdit }), []);

  const filteredData = useMemo(() => {
    if (!searchText) return applications;
    const lower = searchText.toLowerCase();
    return applications.filter(
      (app) =>
        app.company.toLowerCase().includes(lower) ||
        app.role.toLowerCase().includes(lower) ||
        app.status.toLowerCase().includes(lower)
    );
  }, [applications, searchText]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: "var(--text-muted)" }}
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-surface text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            style={{ color: "var(--text)" }}
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          style={{ backgroundColor: "var(--primary)", color: "var(--canvas)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--primary-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--primary)")}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span style={{ color: "var(--canvas)" }}>Add new application</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 border border-border rounded-xl bg-surface">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Loading...
          </p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-xl bg-surface">
          <Briefcase
            className="mx-auto h-12 w-12 mb-4"
            style={{ color: "var(--text-muted)" }}
            aria-hidden="true"
          />
          <h3 className="text-lg font-medium mb-2" style={{ color: "var(--text)" }}>
            {searchText ? "No applications found" : "No applications yet"}
          </h3>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            {searchText ? "Try adjusting your search." : "Get started by adding your first application."}
          </p>
          {!searchText && (
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              style={{ backgroundColor: "var(--primary)", color: "var(--canvas)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--primary-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--primary)")}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span style={{ color: "var(--canvas)" }}>Add new application</span>
            </button>
          )}
        </div>
      ) : (
        <div className="ag-theme-jobflow" style={{ height: 520, width: "100%" }}>
          <AgGridReact
            rowData={filteredData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            context={context}
            pagination={false}
            suppressCellFocus={false}
          />
        </div>
      )}

      <ApplicationFormDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        mode={drawerMode}
        initialData={editingData}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
}
