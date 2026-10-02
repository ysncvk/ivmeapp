import { createFileRoute, redirect } from "@tanstack/react-router";

import { mockStudent, mockToday, mockWeek } from "@/features/student/mock";
import { TodayScreen } from "@/features/student/today-screen";

/** Tasarım önizlemesi: yalnızca geliştirme ortamında, giriş gerektirmez. */
export const Route = createFileRoute("/onizleme/ogrenci")({
	beforeLoad: () => {
		if (!import.meta.env.DEV) throw redirect({ to: "/" });
	},
	component: () => (
		<TodayScreen
			studentName={mockStudent.name}
			tasks={mockToday}
			week={mockWeek}
		/>
	),
});
