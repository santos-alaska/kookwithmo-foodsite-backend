// Seed script: inserts all menuOptions items into MongoDB as products
// Run with: node backend/seedMenu.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./backend/models/product.model.js";

dotenv.config();

const menuOptions = [
    {
        category: 'Main Meals',
        items: [
            { name: 'Efo Riro Soup', price: 9500 },
            { name: 'Egusi Soup', price: 7000 },
            { name: 'Ogbono Soup', price: 7000 },
            { name: 'Okro Soup', price: 7000 },
            { name: 'Ewedu Soup', price: 6000 },
            { name: 'Obe (Yoruba Red Stew)', price: 6000 },
            { name: 'Home Made Peppersoup', price: 8600 },
            { name: 'Ofada Sauce (Ayamase)', price: 10000 },
            { name: 'Bukka Stew (Naija style)', price: 9500 },
            { name: 'Grilled Tiger Prawns', price: 25000 },
            { name: 'Salmon Fillet', price: 27000 },
            { name: 'Honey Glazed Spicy Chicken Wings', price: 10000 },
            { name: 'Peppered Snail', price: 15000 },
            { name: 'Grilled Chicken Breast', price: 10000 },
            { name: 'Turkey Fingers', price: 9000 },
            { name: 'Turkey Wings', price: 9000 },
            { name: 'Spicy Chicken Wings', price: 8000 },
            { name: '1 wrap of eba', price: 600 },
            { name: '1 wrap of wheat', price: 1050 },
            { name: '1 wrap of oats swallow', price: 1050 },
            { name: '1 wrap of semo', price: 1050 },
            { name: '1 wrap of amala', price: 6000 },
            { name: '1 wrap of poundo', price: 800 },
        ],
    },
    {
        category: "Chef's Special",
        items: [
            { name: 'High Protein Bowl', price: 13700 },
            { name: 'Honey-buttered corn-cob', price: 12500 },
            { name: 'Ultimate Bukka Combo', price: 8800 },
            { name: 'Beef gomiti Pasta (Asun pasta style)', price: 8500 },
        ],
    },
    {
        category: 'Breakfast',
        items: [
            { name: 'Boiled yam with sauce of choice', price: 5500 },
            { name: 'Fried yam with sauce of choice', price: 5500 },
            { name: 'Boiled plantain with sauce of choice', price: 5500 },
            { name: 'Fried plantain with sauce of choice', price: 5500 },
            { name: 'Nigerian egg sauce', price: 3300 },
            { name: 'Plain fried eggs', price: 1500 },
            { name: 'Boiled eggs', price: 600 },
            { name: 'Sunny-side-up egg', price: 1900 },
            { name: 'Poached egg', price: 1400 },
            { name: 'Avocado Toast', price: 13000 },
        ],
    },
    {
        category: 'Sides',
        items: [
            { name: 'Smoky Jollof Rice', price: 3000 },
            { name: 'Fried Rice', price: 3500 },
            { name: 'Steamed Basmati Rice', price: 2500 },
            { name: 'Fries (sweet potatoes, yam)', price: 2500 },
            { name: 'Steamed Vegetable', price: 3500 },
            { name: 'Mashed Potatoes', price: 6500 },
            { name: 'Stir-fry veggie', price: 3800 },
            { name: 'Fried Plantain (dodo)', price: 1500 },
            { name: 'Creamy Corn-cobs', price: 2700 },
            { name: 'Coleslaw', price: 1500 },
            { name: 'Guacamole', price: 1500 },
            { name: 'Steamed broccoli', price: 6500 },
        ],
    },
    {
        category: 'Sauce',
        items: [
            { name: 'Smoked Chicken Sauce', price: 4500 },
            { name: 'Fish Sauce', price: 3400 },
            { name: 'Naija Pepper Sauce', price: 950 },
            { name: 'Gizdodo/Beefdodo', price: 5500 },
            { name: 'Mixed Herb Sauce', price: 2600 },
        ],
    },
    {
        category: 'Salad',
        items: [
            { name: 'Mixed Veggies Salad', price: 7500 },
            { name: 'Prawn Salad', price: 10500 },
            { name: 'Fruit Salad', price: 11700 },
            { name: 'Potato and chicken salad', price: 8300 },
            { name: 'Cucumber & avocado salad', price: 6500 },
        ],
    },
    {
        category: 'Raw-Cold Pressed Juices',
        items: [
            { name: 'Natural Retinol', price: 5000 },
            { name: 'Green Juice', price: 5500 },
            { name: 'Pineapple ginger juice', price: 5500 },
            { name: 'Watermelon refresher', price: 4500 },
            { name: 'Immunity Booster', price: 5500 },
            { name: 'Sweet Sunshine', price: 6500 },
        ],
    },
    {
        category: 'Yoghurt Bowls',
        items: [
            { name: 'Morning Fuel', price: 8500 },
            { name: 'Yoghurt Parfait', price: 8500 },
            { name: 'Chia Pudding Bowl', price: 7500 },
            { name: 'Super Food Bowl', price: 10000 },
        ],
    },
    {
        category: 'Oatmeal Bowls',
        items: [
            { name: 'Oats Porridge', price: 8000 },
            { name: 'Mango Sticky Oats', price: 6500 },
            { name: 'Overnight Oats', price: 6500 },
            { name: 'Oatmeal with toppings', price: 8000 },
        ],
    },
];

const PLACEHOLDER_IMAGE = "https://res.cloudinary.com/dpzynrp4i/image/upload/v1/products/placeholder";

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    let inserted = 0;
    let skipped = 0;

    for (const group of menuOptions) {
        for (const item of group.items) {
            const exists = await Product.findOne({ name: item.name });
            if (exists) {
                console.log(`⏭  Skipped (already exists): ${item.name}`);
                skipped++;
                continue;
            }
            await Product.create({
                name: item.name,
                description: `${group.category} item`,
                price: item.price,
                image: PLACEHOLDER_IMAGE,
                category: group.category,
                isFeatured: false,
            });
            console.log(`✅ Inserted: ${item.name} — ₦${item.price.toLocaleString()} [${group.category}]`);
            inserted++;
        }
    }

    console.log(`\n🎉 Done! Inserted: ${inserted}, Skipped: ${skipped}`);
    await mongoose.disconnect();
}

seed().catch(err => {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
});
