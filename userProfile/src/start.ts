import express, { Request, Response } from "express";
import { auth } from "express-openid-connect";
import { requiresAuth } from "express-openid-connect";
import * as dotenv from "dotenv";
import cors from 'cors';
import router from "./routes";
import { authUser } from "./middleware/authUser";
import swaggerDocs from "./utils/swagger";

dotenv.config({ path: require("path").resolve(__dirname, "../.env") });



const config = {
	authRequired: false,
	auth0Logout: true,
	secret: process.env.SECRET,
	baseURL: "http://localhost:3011",
	clientID: process.env.CLIENTID,
	issuerBaseURL: "https://dev-v85ldbuj2bj2iv0y.us.auth0.com",
	routes: {
		login: '/user/login',
		logout: '/user/logout'
	},
	
};

const app = express();
// support json encoded and url-encoded bodies, mainly used for post and updateapp.use(express.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
// Redirect to frontend
app.get("/", (req: Request, res: Response) => {
	res.redirect('http://localhost:5173/');
});





app.get("/user/profile", requiresAuth(), (req: Request, res: Response) => {
	res.send(JSON.stringify(req.oidc.user));
});

app.get("/user/isLoggedIn", (req: Request, res: Response) => {
	res.send(JSON.stringify(req.oidc.isAuthenticated()));
});


app.use("/user", requiresAuth(), authUser, router);

	//demonstrates how to access thr user data
app.set("port", 3011);

const server = app.listen(app.get("port"), () => {
	console.log(`🍿 Express running`);

	swaggerDocs(app,3011);
});
