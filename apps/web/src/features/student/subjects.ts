import type { Subject } from "@ivmeapp/core";
import {
	BookOpen,
	Calculator,
	FlaskConical,
	Globe,
	Languages,
} from "lucide-react";

export const SUBJECTS: Record<
	Subject,
	{ label: string; icon: typeof Calculator; tile: string; text: string }
> = {
	matematik: {
		label: "Matematik",
		icon: Calculator,
		tile: "bg-subject-matematik",
		text: "text-subject-matematik",
	},
	turkce: {
		label: "Türkçe",
		icon: BookOpen,
		tile: "bg-subject-turkce",
		text: "text-subject-turkce",
	},
	fen: {
		label: "Fen Bilimleri",
		icon: FlaskConical,
		tile: "bg-subject-fen",
		text: "text-subject-fen",
	},
	sosyal: {
		label: "Sosyal Bilgiler",
		icon: Globe,
		tile: "bg-subject-sosyal",
		text: "text-subject-sosyal",
	},
	ingilizce: {
		label: "İngilizce",
		icon: Languages,
		tile: "bg-subject-ingilizce",
		text: "text-subject-ingilizce",
	},
};
