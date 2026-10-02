import { jobs } from "./jobs";
import { nextRun } from "./schedule";

const log = (message: string) =>
	console.log(`${new Date().toISOString()} ${message}`);

async function runOnce(name: string) {
	const job = jobs.find((j) => j.name === name);
	if (!job) {
		console.error(
			`Bilinmeyen iş: ${name}. Kayıtlı: ${jobs.map((j) => j.name).join(", ") || "(yok)"}`,
		);
		process.exit(1);
	}
	await job.run({ now: Date.now(), log });
}

function loop() {
	const timers = jobs.map((job) => {
		const arm = () => {
			const at = nextRun(job.schedule, Date.now());
			return setTimeout(async () => {
				try {
					await job.run({ now: Date.now(), log });
				} catch (error) {
					// Bir işin hatası diğer işleri ve sonraki çalışmayı durdurmaz.
					console.error(`[${job.name}]`, error);
				}
				handle.current = arm();
			}, at - Date.now());
		};
		const handle = { current: arm() };
		return handle;
	});

	log(`Worker başladı, ${jobs.length} iş kayıtlı`);

	const stop = () => {
		for (const t of timers) clearTimeout(t.current);
		process.exit(0);
	};
	process.on("SIGINT", stop);
	process.on("SIGTERM", stop);

	// Kayıtlı iş yoksa süreç kendiliğinden çıkmasın (dev:worker watch modu için).
	setInterval(() => {}, 1 << 30);
}

const [flag, name] = process.argv.slice(2);
if (flag === "--once" && name) {
	await runOnce(name);
} else {
	loop();
}
