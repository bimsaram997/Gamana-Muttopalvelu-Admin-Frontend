import { Chip } from "@mui/material";
import type { StatusColor } from "../../utils/statusColor";
import { normalizeStatus } from "../../utils/statusColor";

interface StatusChipProps {
  status: string;
  colorMap: Record<string, StatusColor>;
  size?: "small" | "medium";
}

export default function StatusChip({
  status,
  colorMap,
  size = "small",
}: StatusChipProps) {
  const color =
    colorMap[status] ??
    colorMap[normalizeStatus(status)] ??
    "default";

  return <Chip label={status} size={size} color={color} />;
}