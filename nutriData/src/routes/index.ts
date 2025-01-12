import express from "express";
import cors from 'cors';
import { searchFoodsOptionsByName, searchVegeFoodsOptionsByName, searchCarnivorousFoodOptionsByName} from "../controllers/nameSearchController";
import { getNutritionsByCode, getNutritionsByName } from "../controllers/getNutrionsController";
import { getMeatlessSuggestionsKcal, getMeatlessSuggestionsProtein } from '../controllers/meatSwitchController'
import { isMeat } from "../controllers/isMeatController";
import {getEmission} from '../controllers/CO2Controller';

const router = express.Router();
/**
 * @swagger
 * /nutri/search/{ingredient}:
 *   get:
 *     summary: Search for food options by ingredient name
 *     parameters:
 *       - in: path
 *         name: ingredient
 *         required: true
 *         description: The ingredient to search for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of food options
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ingredient_code:
 *                     type: integer
 *                     description: The ingredient code
 *                   ingredient_description:
 *                     type: string
 *                     description: The ingredient description
 *       500:
 *         description: Internal server error
 */
router.get('/search/:ingredient', cors(), searchFoodsOptionsByName);

/**
 * @swagger
 * /nutri/searchVege/{ingredient}:
 *   get:
 *     summary: Search for vegetarian food options by ingredient name
 *     parameters:
 *       - in: path
 *         name: ingredient
 *         required: true
 *         description: The ingredient to search for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of vegetarian food options
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ingredient_code:
 *                     type: integer
 *                   ingredient_description:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
router.get('/searchVege/:ingredient', cors(), searchVegeFoodsOptionsByName);

/**
 * @swagger
 * /nutri/searchCarni/{ingredient}:
 *   get:
 *     summary: Search for carnivorous food options by ingredient name
 *     parameters:
 *       - in: path
 *         name: ingredient
 *         required: true
 *         description: The ingredient to search for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of carnivorous food options
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ingredient_code:
 *                     type: integer
 *                   ingredient_description:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
router.get('/searchCarni/:ingredient', cors(), searchCarnivorousFoodOptionsByName);

/**
 * @swagger
 * /nutri/getNutritions/ByCode/{ingredient_code}:
 *   get:
 *     summary: Get nutrition details for an ingredient by code
 *     parameters:
 *       - in: path
 *         name: ingredient_code
 *         required: true
 *         description: The ingredient code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nutrition details for the ingredient
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 nutrient_value:
 *                   type: number
 *                 unit_name:
 *                   type: string
 *       500:
 *         description: Internal server error
 *       404:
 *         description: Ingredient not found
 */
router.get('/getNutritions/ByCode/:ingredient_code', cors(), getNutritionsByCode);

/**
 * @swagger
 * /nutri/getNutritions/ByName/{ingredient_description}:
 *   get:
 *     summary: Get nutrition details for an ingredient by name
 *     parameters:
 *       - in: path
 *         name: ingredient_description
 *         required: true
 *         description: The ingredient description
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nutrition details for the ingredient
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 nutrient_value:
 *                   type: number
 *                 unit_name:
 *                   type: string
 *       500:
 *         description: Internal server error
 *       404:
 *         description: Ingredient not found
 */
router.get('/getNutritions/ByName/:ingredient_description', cors(), getNutritionsByName);

/**
 * @swagger
 * /nutri/getSuggestions/protein/{ingredient_code}:
 *   get:
 *     summary: Get meatless suggestions based on protein content
 *     parameters:
 *       - in: path
 *         name: ingredient_code
 *         required: true
 *         description: The ingredient code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of meatless suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ingredient_code:
 *                     type: integer
 *                   ingredient_description:
 *                     type: string
 *                   nutrient_value:
 *                     type: number
 *       500:
 *         description: Internal server error
 */
router.get('/getSuggestions/protein/:ingredient_code', cors(), getMeatlessSuggestionsProtein);

/**
 * @swagger
 * /nutri/getSuggestions/calories/{ingredient_code}:
 *   get:
 *     summary: Get meatless suggestions based on calorie content
 *     parameters:
 *       - in: path
 *         name: ingredient_code
 *         required: true
 *         description: The ingredient code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of meatless suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ingredient_code:
 *                     type: integer
 *                   ingredient_description:
 *                     type: string
 *                   nutrient_value:
 *                     type: number
 *       500:
 *         description: Internal server error
 */
router.get('/getSuggestions/calories/:ingredient_code', cors(), getMeatlessSuggestionsKcal);

/**
 * @swagger
 * /nutri/isMeat/{ingredient_name}:
 *   get:
 *     summary: Check if an ingredient is meat
 *     parameters:
 *       - in: path
 *         name: ingredient_name
 *         required: true
 *         description: The ingredient name
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Whether the ingredient is meat or not
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ingredient_code:
 *                   type: integer
 *                 is_meat:
 *                   type: boolean
 *       500:
 *         description: Internal server error
 *       404:
 *         description: Ingredient not found
 */
router.get('/isMeat/:ingredient_name', cors(), isMeat);

/**
 * @swagger
 * /nutri/getEmission/{ingredient_code}:
 *   get:
 *     summary: Get the CO2 emission for an ingredient
 *     parameters:
 *       - in: path
 *         name: ingredient_code
 *         required: true
 *         description: The ingredient code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The CO2 emission for the ingredient
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 amount:
 *                   type: number
 *       500:
 *         description: Internal server error
 *       404:
 *         description: Ingredient code not found
 */
router.get('/getEmission/:ingredient_code', cors(), getEmission);

 
export default router;