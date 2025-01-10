import express from "express";
import cors from 'cors';
import {
	createRecipe,
	updateRecipe,
	getRecipe,
	getRecipes,
	deleteRecipe,
	updateIngredient,
	addIngredient
} from "../controllers/recipesController";
import { updateDiary , getDiary} from "../controllers/diateryController";
import { authUser } from "../middleware/authUser";
import { getUserCO2, getTotalCO2 } from "../controllers/co2Controller";
import { getLeaderboard } from "../controllers/leaderboardController";
import { getCO2Metrics, generateShareUrl, createSocialShare } from '../controllers/socialShareController';
import { Request, Response } from 'express';


// Define valid platforms
type Platform = 'TWITTER' | 'FACEBOOK' | 'LINKEDIN';

const router = express.Router();

router.get("/", (req, res, next) => {
	res.json("hi");
});

// Diary routes
router.post('/updateDiary',cors(),updateDiary);
router.get('/getDiary/:date',cors(),getDiary);

// Recipes routes
router.get("/getRecipes",cors(), getRecipes);
router.get("/getRecipe/:recipe_id", cors(), getRecipe);
router.post("/createRecipe", cors(), createRecipe);
router.post("/recipes/:recipe_id/updateIngredient",cors(),updateIngredient)
router.post("/recipes/:recipe_id/addIngredient",cors(),addIngredient)
router.patch("/updateRecipe/:recipe_id", cors(), updateRecipe);
router.delete("/deleteRecipe/:recipe_id", cors(), deleteRecipe);

// CO2-related routes
router.get("/co2personal", [cors(), authUser], getUserCO2);
router.get("/co2global", cors(), getTotalCO2);

//Leaderboard routes
router.get("/leaderboard", cors(), getLeaderboard);

// Social share routes
router.get('/share', [authUser], async (req: Request, res: Response) => {
    console.log('1. Share request received');
    console.log('2. User ID:', req.user_id);
    console.log('3. Platform:', req.query.platform);
    
    try {
        const userId = req.user_id;
        const platform = req.query.platform as Platform;

        if (!platform) {
            console.log('Error: Platform is missing');
            return res.status(400).json({ error: 'Platform parameter is required' });
        }

        const co2Data = await getCO2Metrics(userId);
        console.log('4. CO2 data:', co2Data);

        const message = `🌱 I've prevented ${co2Data.total}kg of CO2 emissions with sustainable food choices!`;
        console.log('5. Message:', message);

        const shareUrl = generateShareUrl(platform, message);
        console.log('6. Share URL:', shareUrl);

        res.status(200).json({ shareUrl, message });
    } catch (error) {
        console.error('Share failed:', error);
        res.status(500).json({ error: 'Share failed' });
    }
});

export default router;