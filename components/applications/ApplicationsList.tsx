"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  CellKeyDownEvent,
  ColDef,
  GetRowIdParams,
  ICellRendererParams,
  RowClickedEvent,
} from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import dayjs from "dayjs";
import { Briefcase, Plus, Search } from "lucide-react";
import { getApplicationsAction } from "@/app/(workspace)/applications/actions";
import type { ApplicationStatus } from "@/lib/applications";
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
  status: ApplicationStatus;
  statusChangedAt: string;
};

const DATE_FORMAT = "DD MMM YY";

function Cell({ children }: { children: ReactNode }) {
  return <div className="app-cell">{children}</div>;
}

function DateValue({ value }: { value: string }) {
  return (
    <time className="app-cell-date" dateTime={dayjs(value).format("YYYY-MM-DD")}>
      {dayjs(value).format(DATE_FORMAT)}
    </time>
  );
}

function CompanyCellRenderer({ value }: ICellRendererParams<ApplicationRow>) {
  return (
    <Cell>
      <span className="app-cell-text app-cell-text-strong" title={value}>
        {value}
      </span>
    </Cell>
  );
}

function RoleCellRenderer({ value }: ICellRendererParams<ApplicationRow>) {
  return (
    <Cell>
      <span className="app-cell-text" title={value}>
        {value}
      </span>
    </Cell>
  );
}

function AppliedDateCellRenderer({ value }: ICellRendererParams<ApplicationRow>) {
  return (
    <Cell>
      <DateValue value={value} />
    </Cell>
  );
}

function StatusCellRenderer({ value }: ICellRendererParams<ApplicationRow>) {
  const status = value as ApplicationStatus;
  return (
    <Cell>
      <span className={`app-status app-status-${status}`}>{status}</span>
    </Cell>
  );
}

function StatusChangedCellRenderer({ value }: ICellRendererParams<ApplicationRow>) {
  return (
    <Cell>
      <DateValue value={value} />
    </Cell>
  );
}

const applicationColumnDefs: ColDef<ApplicationRow>[] = [
  {
    field: "company",
    headerName: "Company",
    flex: 1,
    minWidth: 180,
    cellRenderer: CompanyCellRenderer,
  },
  {
    field: "role",
    headerName: "Role",
    flex: 1,
    minWidth: 200,
    cellRenderer: RoleCellRenderer,
  },
  {
    field: "appliedAt",
    headerName: "Applied",
    width: 132,
    cellRenderer: AppliedDateCellRenderer,
  },
  {
    field: "status",
    headerName: "Status",
    width: 148,
    cellRenderer: StatusCellRenderer,
  },
  {
    field: "statusChangedAt",
    headerName: "Status changed",
    headerTooltip: "Date the status last changed",
    width: 168,
    cellRenderer: StatusChangedCellRenderer,
  },
];

const applicationDefaultColDef: ColDef<ApplicationRow> = {
  sortable: true,
  filter: false,
  resizable: true,
};

function getApplicationRowId(params: GetRowIdParams<ApplicationRow>) {
  return params.data.id;
}

export function ApplicationsList() {
  const [searchText, setSearchText] = useState("");
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editingData, setEditingData] = useState<{
    id: string;
    company: string;
    role: string;
    appliedAt: string;
    status: ApplicationStatus;
  } | null>(null);

  const fetchApplications = async () => {
    const result = await getApplicationsAction();
    if (result.data) {
      setApplications(result.data);
    }
  };

  useEffect(() => {
    let active = true;

    getApplicationsAction()
      .then((result) => {
        if (!active) return;
        if (result.data) {
          setApplications(result.data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
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

  const handleRowClick = (event: RowClickedEvent<ApplicationRow>) => {
    if (event.data) {
      handleEdit(event.data);
    }
  };

  const handleRowKeyDown = (event: CellKeyDownEvent<ApplicationRow>) => {
    const keyEvent = event.event;
    if (keyEvent instanceof KeyboardEvent && (keyEvent.key === "Enter" || keyEvent.key === " ")) {
      keyEvent.preventDefault();
      if (event.data) {
        handleEdit(event.data);
      }
    }
  };

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
    <div className="applications">
      <div className="applications-toolbar">
        <div className="applications-search">
          <label className="visually-hidden" htmlFor="applications-search">
            Search applications
          </label>
          <Search className="applications-search-icon" size={16} aria-hidden="true" />
          <input
            id="applications-search"
            type="search"
            placeholder="Search applications..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <button type="button" onClick={handleAdd} className="button button-primary button-sm">
          <Plus size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
          Add new application
        </button>
      </div>

      {isLoading ? (
        <div className="applications-loading" role="status" aria-label="Loading applications">
          <span className="visually-hidden">Loading applications…</span>
          {[0, 1, 2].map((row) => (
            <div className="applications-skeleton-row" key={row}>
              <span className="applications-skeleton-bar" />
              <span className="applications-skeleton-bar" />
              <span className="applications-skeleton-bar" />
              <span className="applications-skeleton-bar" />
              <span className="applications-skeleton-bar" />
            </div>
          ))}
        </div>
      ) : filteredData.length === 0 ? (
        <div className="applications-empty">
          <span className="applications-empty-icon">
            <Briefcase size={22} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
          </span>
          <h3>{searchText ? "No applications found" : "No applications yet"}</h3>
          <p>
            {searchText
              ? "Try a different company, role, or status."
              : "Add your first application to start tracking progress."}
          </p>
          {!searchText && (
            <button type="button" onClick={handleAdd} className="button button-primary button-sm">
              <Plus size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
              Add new application
            </button>
          )}
        </div>
      ) : (
        <div className="ag-theme-jobflow" style={{ height: 520, width: "100%" }}>
          <AgGridReact
            // The grid is themed through applications-grid.css, so opt out of the default theme.
            theme="legacy"
            rowData={filteredData}
            columnDefs={applicationColumnDefs}
            defaultColDef={applicationDefaultColDef}
            getRowId={getApplicationRowId}
            onRowClicked={handleRowClick}
            onCellKeyDown={handleRowKeyDown}
            pagination={false}
            suppressCellFocus={false}
          />
        </div>
      )}

      {isDrawerOpen ? (
        <ApplicationFormDrawer
          onClose={handleDrawerClose}
          mode={drawerMode}
          initialData={editingData ?? undefined}
          onSuccess={handleDrawerSuccess}
        />
      ) : null}
    </div>
  );
}
