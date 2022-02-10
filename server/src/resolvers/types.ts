import { Request, Response } from "express";
import { Redis } from "ioredis";
import { createUserLoader } from "src/utils/createUserLoader";
import { createVoteLoader } from "src/utils/createVoteLoader";

export type MyContext = {
	req: Request & { session: { userId?: number } };
	redis: Redis;
	res: Response;
	userLoader: ReturnType<typeof createUserLoader>;
	theVoteLoader: ReturnType<typeof createVoteLoader>;
};
