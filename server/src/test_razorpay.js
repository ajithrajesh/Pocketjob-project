import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

console.log("Key ID from env:", process.env.RAZORPAY_KEY_ID);
console.log("Key Secret from env:", process.env.RAZORPAY_KEY_SECRET);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

try {
  const order = await razorpay.orders.create({
    amount: 49900,
    currency: "INR",
    receipt: "test_receipt",
  });
  console.log("Success:", order);
} catch (error) {
  console.error("Error Details:", error);
}
