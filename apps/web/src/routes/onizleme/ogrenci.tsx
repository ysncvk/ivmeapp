import { rewardProgress } from "@ivmeapp/core";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { mockStudent, mockToday, mockWeek } from "@/features/student/mock";
import { TodayScreen } from "@/features/student/today-screen";

/** Tasarım önizlemesi: yalnızca geliştirme ortamında, giriş gerektirmez. */
export const Route = createFileRoute("/onizleme/ogrenci")({
	beforeLoad: () => {
		if (!import.meta.env.DEV) throw redirect({ to: "/" });
	},
	component: Preview,
});

function Preview() {
	const [done, setDone] = useState<ReadonlySet<string>>(new Set());
	const tasks = mockToday.map((t) => ({ ...t, done: done.has(t.id) }));
	return (
		<TodayScreen
			studentName={mockStudent.name}
			tasks={tasks}
			reward={{
				title: mockWeek.rewardTitle,
				tier: "weekly",
				progress: rewardProgress({
					completed: mockWeek.completedBeforeToday + done.size,
					total: mockWeek.totalTasks,
					threshold: mockWeek.threshold,
				}),
			}}
			onToggleTask={(id, value) =>
				setDone((prev) => {
					const next = new Set(prev);
					if (value) next.add(id);
					else next.delete(id);
					return next;
				})
			}
		/>
	);
}
