import { useEffect } from "react";
import { useRouter } from "next/router";
import { useMeQuery } from "../generated/graphql";

const useIsAuth = () => {
	const [{ data, fetching }] = useMeQuery(); // to check whether they are logged in or not
	const router = useRouter();
	useEffect(() => {
		if (!fetching && !data?.me) {
			// if it's not loading and there is no user and push to login then after login send to create post page
			router.replace(`/login?next=${router.pathname}`);
		}
	}, [fetching, data, router]);
};

export default useIsAuth;
