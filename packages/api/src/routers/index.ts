import type { RouterClient } from "@orpc/server";

import { publicProcedure } from "../index";
import { accountRouter } from "./account";
import { childrenRouter } from "./children";
import { examRouter } from "./exam";
import { groupsRouter, teacherRouter } from "./groups";
import { homeworkRouter } from "./homework";
import { libraryRouter } from "./library";
import { planRouter } from "./plan";
import { questionsRouter } from "./questions";
import { rewardsRouter } from "./rewards";
import { subscriptionRouter } from "./subscription";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	account: accountRouter,
	children: childrenRouter,
	plan: planRouter,
	questions: questionsRouter,
	homework: homeworkRouter,
	exam: examRouter,
	rewards: rewardsRouter,
	subscription: subscriptionRouter,
	teacher: teacherRouter,
	groups: groupsRouter,
	library: libraryRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
