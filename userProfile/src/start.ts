import express from "express";
import { auth } from "express-openid-connect";
import { requiresAuth } from "express-openid-connect";
import * as dotenv from "dotenv";
import router from "./routes";
import { authUser } from "./middleware/authUser";
dotenv.config({ path: require("path").resolve(__dirname, "../.env") });

const config = {
	authRequired: false,
	auth0Logout: true,
	secret: process.env.SECRET,
	baseURL: "http://localhost:3011", //will change upon hoating ??
	clientID: process.env.CLIENTID,
	issuerBaseURL: "https://dev-v85ldbuj2bj2iv0y.us.auth0.com",
};

const app = express();

// support json encoded and url-encoded bodies, mainly used for post and update
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

app.use("/user", requiresAuth(),authUser, router)


app.set("port", 3011);

// this just redirects to the main page, can be edited.
app.get("/", (req, res) => {
	//idk man
	res.redirect("./");
});

const server = app.listen(app.get("port"), () => {
	console.log(`🍿 Express running`);
});
