import React, { useEffect } from "react";
import { CloseOutlined, LoadingOutlined } from "@ant-design/icons";
import type { ContactTagRef, CampaignStatus, TemplateStatus } from "../types/crm.types";

// ---------------------------------------------------------------- Avatar

export const Avatar: React.FC<{
  name?: string | null;
  size?: "sm" | "md" | "lg";
}> = ({ name, size = "md" }) => {
  const text = (name || "?").trim().charAt(0).toUpperCase() || "?";
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700 ${sizes[size]}`}
    >
      {text}
    </div>
  );
};

// ----------------------------------------------------------------- Badges

export const TagPill: React.FC<{ name: string; color?: string; small?: boolean }> = ({
  name,
  color,
  small,
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
      small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
    }`}
    style={{
      backgroundColor: color ? `${color}1a` : "#6b72801a",
      color: color || "#6b7280",
    }}
  >
    {color && (
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    )}
    {name}
  </span>
);

export const GreenBadge: React.FC<{ children: React.ReactNode; small?: boolean }> = ({
  children,
  small,
}) => (
  <span
    className={`inline-flex items-center rounded-full bg-emerald-50 font-medium text-emerald-700 ${
      small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
    }`}
  >
    {children}
  </span>
);

export const GrayBadge: React.FC<{ children: React.ReactNode; small?: boolean }> = ({
  children,
  small,
}) => (
  <span
    className={`inline-flex items-center rounded-full bg-gray-100 font-medium text-gray-600 ${
      small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
    }`}
  >
    {children}
  </span>
);

export const RedBadge: React.FC<{ children: React.ReactNode; small?: boolean }> = ({
  children,
  small,
}) => (
  <span
    className={`inline-flex items-center rounded-full bg-red-50 font-medium text-red-600 ${
      small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
    }`}
  >
    {children}
  </span>
);

export const AmberBadge: React.FC<{ children: React.ReactNode; small?: boolean }> = ({
  children,
  small,
}) => (
  <span
    className={`inline-flex items-center rounded-full bg-amber-50 font-medium text-amber-700 ${
      small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
    }`}
  >
    {children}
  </span>
);

export const BlueBadge: React.FC<{ children: React.ReactNode; small?: boolean }> = ({
  children,
  small,
}) => (
  <span
    className={`inline-flex items-center rounded-full bg-blue-50 font-medium text-blue-700 ${
      small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
    }`}
  >
    {children}
  </span>
);

export const TemplateStatusBadge: React.FC<{ status: TemplateStatus }> = ({ status }) => {
  if (status === "active") return <GreenBadge>Active</GreenBadge>;
  if (status === "draft") return <AmberBadge>Draft</AmberBadge>;
  return <GrayBadge>Inactive</GrayBadge>;
};

export const campaignStatusMap: Record<
  CampaignStatus,
  { label: string; Comp: React.FC<{ children: React.ReactNode }> }
> = {
  draft: { label: "Draft", Comp: GrayBadge },
  scheduled: { label: "Scheduled", Comp: BlueBadge },
  queued: { label: "Queued", Comp: AmberBadge },
  running: { label: "Running", Comp: GreenBadge },
  paused: { label: "Paused", Comp: AmberBadge },
  completed: { label: "Completed", Comp: GreenBadge },
  cancelled: { label: "Cancelled", Comp: RedBadge },
  failed: { label: "Failed", Comp: RedBadge },
};

export const CampaignStatusBadge: React.FC<{ status: CampaignStatus }> = ({ status }) => {
  const cfg = campaignStatusMap[status] || campaignStatusMap.draft;
  const Comp = cfg.Comp;
  return <Comp>{cfg.label}</Comp>;
};

export const recipientStatusBadge = (status: string) => {
  const map: Record<string, React.ReactNode> = {
    pending: <GrayBadge small>Pending</GrayBadge>,
    queued: <AmberBadge small>Queued</AmberBadge>,
    sending: <BlueBadge small>Sending</BlueBadge>,
    sent: <BlueBadge small>Sent</BlueBadge>,
    delivered: <GreenBadge small>Delivered</GreenBadge>,
    read: <GreenBadge small>Read</GreenBadge>,
    failed: <RedBadge small>Failed</RedBadge>,
    skipped: <GrayBadge small>Skipped</GrayBadge>,
  };
  return map[status] || <GrayBadge small>{status}</GrayBadge>;
};

export const tagsOf = (tags: ContactTagRef[] = []) =>
  tags.map((t) => <TagPill key={t._id} name={t.name} color={t.color} small />);

// -------------------------------------------------------------- Page header

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, actions }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

// ----------------------------------------------------------------- Spinner

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingOutlined className={className || "text-emerald-500 text-lg"} spin />
);

export const CenteredSpinner: React.FC<{ label?: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
    <Spinner />
    {label && <p className="text-sm">{label}</p>}
  </div>
);

// ----------------------------------------------------------------- Empty

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16 text-center">
    {icon && <div className="text-3xl text-gray-300">{icon}</div>}
    <p className="text-sm font-medium text-gray-600">{title}</p>
    {description && <p className="max-w-sm text-xs text-gray-400">{description}</p>}
    {action}
  </div>
);

// ------------------------------------------------------------------ Modal

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}> = ({ open, onClose, title, children, footer, wide }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative my-8 w-full rounded-2xl bg-white shadow-2xl ${
          wide ? "max-w-2xl" : "max-w-lg"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <CloseOutlined />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------- Form fields

export const Field: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}> = ({ label, required, children, hint }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-gray-600">
      {label} {required && <span className="text-red-500">*</span>}
    </span>
    {children}
    {hint && <span className="mt-1 block text-[11px] text-gray-400">{hint}</span>}
  </label>
);

export const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export const selectCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", children, ...rest }) => (
  <button
    {...rest}
    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
  >
    {children}
  </button>
);

export const SecondaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", children, ...rest }) => (
  <button
    {...rest}
    className={`inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
  >
    {children}
  </button>
);

export const DangerButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", children, ...rest }) => (
  <button
    {...rest}
    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
  >
    {children}
  </button>
);

// ------------------------------------------------------------- Date helpers

export const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const fmtDateTime = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const fmtPhone = (p?: string | null) => (p ? `+${p}` : "—");

// -------------------------------------------------------------- Download CSV

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
