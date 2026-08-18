import { toast } from "sonner";

export const getInitials = (name: string) => {
    const parts = String(name).trim().split(/\s+/);
    const first = parts[0]?.[0] || "G";
    const last = parts[1]?.[0] || "";
    return (first + last).toUpperCase();
};

export const copyNumber = (number: string | null) => {
    if (!number) return;
    navigator.clipboard
        .writeText(`+${number}`)
        .then(() => toast.success(`+${number} copied`))
        .catch(() => toast.error("Copy failed"));
};
