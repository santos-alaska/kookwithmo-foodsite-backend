import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";

// export const createCheckoutSession = async (req, res) => {
//     try {
//         const { products, couponCode } = req.body;

//         if (!Array.isArray(products) || products.length === 0) {
//             return res.status(400).json({ error: "Invalid or empty products array" });
//         }

//         let totalAmount = 0;

//         const lineItems = products.map((product) => {
//             const amount = Math.round(product.price * 100); // stripe wants u to send in the format of cents
//             totalAmount += amount * product.quantity;

//             return {
//                 price_data: {
//                     currency: "usd",
//                     product_data: {
//                         name: product.name,
//                         images: [product.image],
//                     },
//                     unit_amount: amount,
//                 },
//                 quantity: product.quantity || 1,
//             };
//         });

//         let coupon = null;
//         if (couponCode) {
//             coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
//             if (coupon) {
//                 totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
//             }
//         }

//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ["card"],
//             line_items: lineItems,
//             mode: "payment",
//             success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
//             cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
//             discounts: coupon
//                 ? [
//                     {
//                         coupon: await createStripeCoupon(coupon.discountPercentage),
//                     },
//                 ]
//                 : [],
//             metadata: {
//                 userId: req.user._id.toString(),
//                 couponCode: couponCode || "",
//                 products: JSON.stringify(
//                     products.map((p) => ({
//                         id: p._id,
//                         quantity: p.quantity,
//                         price: p.price,
//                     }))
//                 ),
//             },
//         });

//         if (totalAmount >= 20000) {
//             await createNewCoupon(req.user._id);
//         }
//         // res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
// res.status(200).json({
//     id: session.id,
//     url: session.url,                    // ADD THIS LINE
//     totalAmount: totalAmount / 100
// });
//     } catch (error) {
//         console.error("Error processing checkout:", error);
//         res.status(500).json({ message: "Error processing checkout", error: error.message });
//     }
// };

export const createCheckoutSession = async (req, res) => {
    try {
        const { products, couponCode } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Invalid or empty products array" });
        }

        let totalAmount = 0;

        const lineItems = products.map((product) => {
            const amount = Math.round(product.price * 100); // stripe wants u to send in the format of cents
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image],
                    },
                    unit_amount: amount,
                },
                quantity: product.quantity || 1,
            };
        });

        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
            if (coupon) {
                totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
            }
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon
                ? [
                    {
                        coupon: await createStripeCoupon(coupon.discountPercentage),
                    },
                ]
                : [],
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "",
                products: JSON.stringify(
                    products.map((p) => ({
                        id: p._id,
                        quantity: p.quantity,
                        price: p.price,
                    }))
                ),
            },
        });

        if (totalAmount >= 20000) {
            await createNewCoupon(req.user._id);
        }
        // res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
        res.status(200).json({
            id: session.id,
            url: session.url,                    // ADD THIS LINE
            totalAmount: totalAmount / 100
        });
    } catch (error) {
        console.error("Error processing checkout:", error);
        res.status(500).json({ message: "Error processing checkout", error: error.message });
    }
};
export const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {
            if (session.metadata.couponCode) {
                await Coupon.findOneAndUpdate(
                    {
                        code: session.metadata.couponCode,
                        userId: session.metadata.userId,
                    },
                    {
                        isActive: false,
                    }
                );
            }

            // create a new Order
            const products = JSON.parse(session.metadata.products);
            const newOrder = new Order({
                user: session.metadata.userId,
                products: products.map((product) => ({
                    product: product.id,
                    quantity: product.quantity,
                    price: product.price,
                })),
                totalAmount: session.amount_total / 100, // convert from cents to dollars,
                stripeSessionId: sessionId,
            });

            await newOrder.save();

            res.status(200).json({
                success: true,
                message: "Payment successful, order created, and coupon deactivated if used.",
                orderId: newOrder._id,
            });
        }
    } catch (error) {
        console.error("Error processing successful checkout:", error);
        res.status(500).json({ message: "Error processing successful checkout", error: error.message });
    }
};

async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    });

    return coupon.id;
}

async function createNewCoupon(userId) {
    await Coupon.findOneAndDelete({ userId });

    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        userId: userId,
    });

    await newCoupon.save();

    return newCoupon;
}














// backend/controllers/payment.controller.js

import { paystack } from '../lib/paystack.js';
import User from '../models/user.model.js';

export const verifyPaystackPayment = async (req, res) => {
    try {
        const { reference, orderPayload } = req.body;

        if (!reference || !orderPayload) {
            return res.status(400).json({ error: 'Reference and order payload are required.' });
        }

        // 1. Verify the transaction with Paystack
        const verificationResponse = await paystack.transaction.verify({ reference });

        const { status, data } = verificationResponse;

        if (!status || data.status !== 'success') {
            return res.status(400).json({ error: 'Payment verification failed.' });
        }

        // 2. If verification is successful, create the order in your database
        const { customerDetails, items, specialNotes, totalAmount } = orderPayload;

        // --- FIX: Use the correct model name 'Order' ---
        const newOrder = new Order({
            user: req.user._id, // User ID comes from the protectRoute middleware
            items: items.map(item => ({
                menuItem: item._id, // Assuming items have _id
                quantity: item.quantity,
                price: item.price,
            })),
            totalAmount: totalAmount,
            deliveryAddress: customerDetails.address,
            phoneNumber: customerDetails.phone,
            specialNotes: specialNotes,
            status: 'Pending',
            // You can save the Paystack reference for your records
            paymentReference: reference,
        });

        await newOrder.save();

        // 3. Clear the user's current order after successful payment
        await User.findByIdAndUpdate(req.user._id, {
            $set: { currentOrderItems: [] }
        });

        res.status(200).json({
            success: true,
            message: "Payment successful and order created.",
            orderId: newOrder._id,
        });

    } catch (error) {
        console.error("Error verifying Paystack payment:", error);
        res.status(500).json({ message: "Server error during payment verification", error: error.message });
    }
};