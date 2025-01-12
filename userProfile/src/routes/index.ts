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
/**
 * @swagger
 * /user/updateDiary:
 *   post:
 *     tags:
 *       - Diary
 *     summary: Update or create a diary entry for a user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date for the diary entry (defaults to the current date if not provided)
 *               total_calories:
 *                 type: number
 *                 description: Total calories consumed on the given day
 *               total_protein:
 *                 type: number
 *                 description: Total protein consumed on the given day
 *               total_carbs:
 *                 type: number
 *                 description: Total carbohydrates consumed on the given day
 *               total_fats:
 *                 type: number
 *                 description: Total fats consumed on the given day
 *               emission:
 *                 type: number
 *                 description: CO2 emission prevented on the given day
 *     responses:
 *       200:
 *         description: Diary updated successfully
 *       201:
 *         description: New diary entry created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('updateDiary', cors(), updateDiary);

/**
 * @swagger
 * /user/getDiary/{date}:
 *   get:
 *     tags:
 *       - Diary
 *     summary: Get a diary entry for a specific date
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for which to fetch the diary entry
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diary entry retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_calories:
 *                   type: number
 *                   description: Total calories consumed on the given day
 *                 total_protein:
 *                   type: number
 *                   description: Total protein consumed on the given day
 *                 total_carbs:
 *                   type: number
 *                   description: Total carbohydrates consumed on the given day
 *                 total_fats:
 *                   type: number
 *                   description: Total fats consumed on the given day
 *                 emission:
 *                   type: number
 *                   description: CO2 emission prevented on the given day
 *       500:
 *         description: Internal server error
 *       404:
 *         description: Diary entry not found for the specified date
 */
router.get('getDiary/:date', cors(), getDiary);


/**
 * @swagger
 * components:
 *   schemas:
 *     Recipe:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         name:
 *           type: string
 *         image_path:
 *           type: string
 *           nullable: true
 *         total_calories:
 *           type: number
 *           format: float
 *           nullable: true
 *         total_protein:
 *           type: number
 *           format: float
 *           nullable: true
 *         total_carbs:
 *           type: number
 *           format: float
 *           nullable: true
 *         total_fats:
 *           type: number
 *           format: float
 *           nullable: true
 *     RecipeDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         name:
 *           type: string
 *         image_path:
 *           type: string
 *           nullable: true
 *         total_calories:
 *           type: number
 *           format: float
 *           nullable: true
 *         total_protein:
 *           type: number
 *           format: float
 *           nullable: true
 *         total_carbs:
 *           type: number
 *           format: float
 *           nullable: true
 *         total_fats:
 *           type: number
 *           format: float
 *           nullable: true
 *     NewRecipe:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         image_path:
 *           type: string
 *           nullable: true
 *         total_calories:
 *           type: number
 *           format: float
 *           nullable: true
 *         total_protein:
 *           type: number
 *           format: float
 *           nullable: true
 *         total_carbs:
 *           type: number
 *           format: float
 *           nullable: true
 *         total_fats:
 *           type: number
 *           format: float
 *           nullable: true
 *     RecipeUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           nullable: true
 *         total_calories:
 *           type: number
 *           format: float
 *           nullable: true
 *         total_protein:
 *           type: number
 *           format: float
 *           nullable: true
 *         total_carbs:
 *           type: number
 *           format: float
 *           nullable: true
 *         total_fats:
 *           type: number
 *           format: float
 *           nullable: true
 *     IngredientAdd:
 *       type: object
 *       properties:
 *         ingredient_name:
 *           type: string
 *         amount:
 *           type: number
 *           format: float
 *         emission:
 *           type: number
 *           format: float
 *           nullable: true
 *     IngredientUpdate:
 *       type: object
 *       properties:
 *         ingredient_name:
 *           type: string
 *         amount:
 *           type: number
 *           format: float
 * 
 * /user/getRecipes:
 *   get:
 *     tags:
 *       - Recipes
 *     summary: Get all recipes for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recipes for the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 */
router.get('getRecipes', cors(), getRecipes);

/**
 * @swagger
 * /user/getRecipe/{recipe_id}:
 *   get:
 *     tags:
 *       - Recipes
 *     summary: Get details for a specific recipe
 *     parameters:
 *       - in: path
 *         name: recipe_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the recipe to retrieve
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recipe details for the specified recipe ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecipeDetails'
 *       404:
 *         description: Recipe not found
 */
router.get('getRecipe/:recipe_id', cors(), getRecipe);

/**
 * @swagger
 * /user/createRecipe:
 *   post:
 *     tags:
 *       - Recipes
 *     summary: Create a new recipe for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewRecipe'
 *     responses:
 *       200:
 *         description: Recipe created successfully for the authenticated user
 *       400:
 *         description: Validation errors in the provided recipe data
 */
router.post('createRecipe', cors(), createRecipe);

/**
 * @swagger
 * /user/updateRecipe/{recipe_id}:
 *   patch:
 *     tags:
 *       - Recipes
 *     summary: Update an existing recipe by ID
 *     parameters:
 *       - in: path
 *         name: recipe_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the recipe to update
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecipeUpdate'
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *       404:
 *         description: Recipe not found or invalid ID
 *       400:
 *         description: Validation errors in the provided data
 */
router.patch('updateRecipe/:recipe_id', cors(), updateRecipe);

/**
 * @swagger
 * /user/deleteRecipe/{recipe_id}:
 *   delete:
 *     tags:
 *       - Recipes
 *     summary: Delete a specific recipe by ID
 *     parameters:
 *       - in: path
 *         name: recipe_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the recipe to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 *       404:
 *         description: Recipe not found
 */
router.delete('deleteRecipe/:recipe_id', cors(), deleteRecipe);

/**
 * @swagger
 * /user/recipes/{recipe_id}/updateIngredient:
 *   post:
 *     tags:
 *       - Recipes
 *     summary: Update an ingredient in a specific recipe
 *     parameters:
 *       - in: path
 *         name: recipe_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the recipe to update the ingredient for
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IngredientUpdate'
 *     responses:
 *       200:
 *         description: Ingredient updated successfully in the recipe
 *       404:
 *         description: Ingredient not found in the recipe
 *       400:
 *         description: Validation errors in the provided ingredient data
 */
router.post('recipes/:recipe_id/updateIngredient', cors(), updateIngredient);

/**
 * @swagger
 * /user/recipes/{recipe_id}/addIngredient:
 *   post:
 *     tags:
 *       - Recipes
 *     summary: Add an ingredient to a specific recipe
 *     parameters:
 *       - in: path
 *         name: recipe_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the recipe to add the ingredient to
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IngredientAdd'
 *     responses:
 *       200:
 *         description: Ingredient added successfully to the recipe
 *       208:
 *         description: Ingredient already exists in the recipe
 *       404:
 *         description: Recipe not found
 *       400:
 *         description: Validation errors in the provided ingredient data
 */
router.post('recipes/:recipe_id/addIngredient', cors(), addIngredient);



// CO2-related routes
/**
 * @swagger
 * /user/co2personal:
 *   get:
 *     tags:
 *       - CO2
 *     summary: Get personal CO2 emissions for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personal CO2 emissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 co2Saved:
 *                   type: number
 *                   description: CO2 emissions prevented by the user
 *                   example: 15.5
 *       500:
 *         description: Database connection error
 *       404:
 *         description: User not found
 */
router.get('co2personal', cors(), getUserCO2);

/**
 * @swagger
 * /user/co2global:
 *   get:
 *     tags:
 *       - CO2
 *     summary: Get global CO2 emissions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Global CO2 emissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCO2:
 *                   type: number
 *                   description: Total CO2 emissions prevented across all users
 *                   example: 1000
 *       500:
 *         description: Database connection error
 */
router.get('co2global', cors(), getTotalCO2);


/**
 * @swagger
 * components:
 *   schemas:
 *     Leaderboard routes
/**
 * @swagger
 * /user/leaderboard:
 *   get:
 *     tags:
 *       - Leaderboard
 *     summary: Get leaderboard rankings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leaderboard data retrieved successfully
 */
router.get('leaderboard', cors(), getLeaderboard);


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