import { Plan } from "../models/plan.models.js"

const getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.find({});
        res.status(200).json(plans)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}


export {getAllPlans}