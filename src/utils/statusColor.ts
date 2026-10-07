export type StatusColor =
    | "default" | "primary" | "secondary"
    | "error" | "info" | "success" | "warning";

export const BOOKING_STATUS_COLORS: Record<string, StatusColor> = {
    Pending: "warning",
    Approved: "info",
    Completed: "success",
    Cancelled: "error",
};

export function normalizeStatus(status: string): string {
    return status.trim().toLowerCase().replace(/\s+/g, "");
}