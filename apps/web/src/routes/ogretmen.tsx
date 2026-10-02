import { createFileRoute } from "@tanstack/react-router";

import { TeacherApp } from "@/features/teacher/teacher-app";
import { requireRole } from "@/lib/me";

export const Route = createFileRoute("/ogretmen")({
	beforeLoad: () => requireRole("teacher", "/ogretmen"),
	component: TeacherApp,
});
