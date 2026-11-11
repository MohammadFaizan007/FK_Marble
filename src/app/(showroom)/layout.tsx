import type { ReactNode } from "react";
import { ShowroomFrame } from "@/components/layout/ShowroomFrame";

export default function ShowroomLayout({ children }: { children: ReactNode }) {
  return <ShowroomFrame>{children}</ShowroomFrame>;
}
