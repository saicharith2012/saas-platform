import {Router} from "express"
import { getAllProducts } from "../controllers/product.controllers.js";

const router = Router()

// get all products
router.route("/all").get(getAllProducts)

export default router;