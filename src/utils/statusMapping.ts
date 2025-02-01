import { URLStatus, URLStatusStep } from "@/types/url-management";

export const mapStatusToEnum = (status: URLStatus): URLStatusStep => {
  const statusMap: Record<URLStatus, URLStatusStep> = {
    "received": "received",
    "in_progress": "case_started",
    "completed": "removal_approved",
    "failed": "received"
  };

  return statusMap[status] || "received";
};