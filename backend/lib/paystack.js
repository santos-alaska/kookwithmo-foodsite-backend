// backend/lib/paystack.js
import Paystack from 'paystack';
import dotenv from 'dotenv';

dotenv.config();

export const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);