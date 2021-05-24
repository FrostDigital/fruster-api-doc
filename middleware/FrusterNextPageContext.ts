import { IncomingMessage } from "http";
import { NextPageContext } from "next";

export interface FrusterNextPageContext extends NextPageContext {
	req: {
		cookies: any;
		loggedIn: boolean;
		user: {
			[x: string]: any
		};
	} & IncomingMessage;
};
