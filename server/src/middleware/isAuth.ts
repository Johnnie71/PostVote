import { MyContext } from "src/resolvers/types";
import { MiddlewareFn } from "type-graphql";

// middleware function that we can wrap our resolvers in and check if our user is authenticated

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
	if (!context.req.session.userId) {
		throw new Error("not authenticated");
	}

	return next();
};
