// backend/controllers/user.controller.js
import User from '../models/user.model.js';

// Get a list of all users for the admin panel
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password"); // Find all users, exclude password
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Server error fetching users" });
    }
};

// Activate a meal plan for a specific user
export const activateMealPlan = async (req, res) => {
    try {
        const { userId } = req.params;
        const { planType, planName, durationInDays } = req.body;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + parseInt(durationInDays));

        const updatedUser = await User.findByIdAndUpdate(userId, {
            $set: {
                activeMealPlan: {
                    planType,
                    planName,
                    startDate,
                    endDate,
                }
            }
        }, { new: true }); // { new: true } returns the updated document

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: "Server error activating plan" });
    }
};