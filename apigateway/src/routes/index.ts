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
	pathRewrite: {
		"^user/login": "/login", // Forward /user/login to /login
		"^/user/logout": "/logout", // Forward /user/logout to /logout
		"^/user/profile": "/profile", // Forward /user/profile to /profile
	},
	onProxyReq: fixRequestBody
});

const nutriProxy = createProxyMiddleware({
	target: "http://localhost:3010", //will change when we host to heroku
	changeOrigin: true,
	onProxyReq: fixRequestBody
});


//put all proxy mappings that require authentication below this
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

router.use("/nutri", cors(), nutriProxy);
router.use("/user", requiresAuth(), cors(), userProxy);

export default router;
