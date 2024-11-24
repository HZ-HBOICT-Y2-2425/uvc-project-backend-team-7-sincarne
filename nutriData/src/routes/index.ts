import express from "express";
import cors from 'cors';
import { searchFoodsOptionsByName } from "../controllers/nameSearchController";

const router = express.Router();



router.get('/',(req,res,next) => {
	res.json("hi");
})

router.get('/search/:ingredient',cors(),searchFoodsOptionsByName)


export default router;