import express from "express";
import { Request, Response } from "express";
import { auth } from "express-openid-connect";
import { requiresAuth } from "express-openid-connect";
import cors from "cors";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";

const router = express.Router();

// create a proxy for each microservice
const userProxy = createProxyMiddleware({
	target: "http://localhost:3011", //will change when we host to heroku
	changeOrigin: true,
	onProxyReq: fixRequestBody   //this erases the user/login route for some reason
});

const nutriProxy = createProxyMiddleware({
	target: "http://localhost:3010", //will change when we host to heroku
	changeOrigin: true,
	onProxyReq: fixRequestBody
});

router.use("/nutri", cors(), nutriProxy);
router.use("/user", cors(), userProxy);

//put all proxy mappings that require authentication below this
//EVERYTHING ELSE ABOVE IT!
router.use(
	auth({
		authRequired: false,
		secret: process.env.SECRET,
		baseURL: "http://localhost:3000", //will change upon hoating
		clientID: process.env.CLIENTID,
		issuerBaseURL: "https://dev-v85ldbuj2bj2iv0y.us.auth0.com",
		routes: {
			login: false,
			logout: false,
		},
	})
);

export default router;
