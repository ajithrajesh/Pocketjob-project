import dotenv from "dotenv";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import { forgotPasswordService, resetPasswordService } from "../services/authService.js";

dotenv.config();

const testEmail = "forgotpassword-test@pocketjob.com";
const testPassword = "oldpassword123";
const newPassword = "newpassword123";

const runTest = async () => {
  await connectDB();

  console.log("🧹 Cleaning up old test users...");
  await User.deleteOne({ email: testEmail });

  console.log("👤 Creating test user...");
  const tempPasswordHash = await bcrypt.hash(testPassword, 10);
  const testUser = await User.create({
    fullName: "FP Test User",
    email: testEmail,
    password: tempPasswordHash,
    phone: "1234567890",
    role: "user",
  });
  console.log(`Test user created with ID: ${testUser._id}`);

  // Test 1: Forgot Password Service
  console.log("\n🧪 Running Test 1: Forgot Password Service...");
  let mockResetUrl = "";
  
  // Intercept sendMail by overriding process.env or just letting it run (it will log to console / Ethereal)
  // Let's call the forgotPasswordService
  const forgotMsg = await forgotPasswordService(testEmail);
  console.log(`forgotPasswordService returned message: "${forgotMsg}"`);

  // Let's fetch the user from database including the hidden reset fields
  const updatedUser = await User.findOne({ email: testEmail }).select("+resetPasswordToken +resetPasswordExpires");
  console.log("Token stored in DB (SHA-256 hash):", updatedUser.resetPasswordToken);
  console.log("Expiry stored in DB:", updatedUser.resetPasswordExpires);

  if (!updatedUser.resetPasswordToken) {
    throw new Error("❌ FAIL: Reset password token was not saved to DB!");
  }
  if (!updatedUser.resetPasswordExpires) {
    throw new Error("❌ FAIL: Reset password expiry was not saved to DB!");
  }
  if (updatedUser.resetPasswordExpires < new Date()) {
    throw new Error("❌ FAIL: Reset password expiry is in the past!");
  }
  console.log("✅ Test 1 Passed: Fields set correctly in DB.");

  // Test 2: Generic message for non-existent user (prevention of email enumeration)
  console.log("\n🧪 Running Test 2: Email Enumeration Prevention...");
  const nonExistentMsg = await forgotPasswordService("doesnotexist@pocketjob.com");
  console.log(`forgotPasswordService (non-existent email) returned message: "${nonExistentMsg}"`);
  if (nonExistentMsg !== forgotMsg) {
    throw new Error("❌ FAIL: Endpoint returned different messages for existing vs non-existing emails!");
  }
  console.log("✅ Test 2 Passed: Messages are identical.");

  // Let's get the raw token since we need it to reset password.
  // In the real flow, the raw token is in the email.
  // We can't easily intercept the return value since forgotPasswordService returns a string.
  // But wait! We can temporarily mock sendPasswordResetEmail to capture the raw token!
  // Let's do a trick or let's create a raw token manually for testing, but wait, the SHA-256 hash is in the DB.
  // Can we test the resetPasswordService by extracting the token from the console log?
  // Wait, let's look at emailService.js:
  // console.log("================ PRESET EMAIL DISPATCH ================");
  // or Ethereal logging.
  // To make it easy and reliable, we can run forgotPasswordService using a mock of sendPasswordResetEmail.
  // Or we can just mock sendPasswordResetEmail directly in the script before running the test!
  // Let's edit forgotPasswordService's dependency, but wait, ESM imports are read-only bindings, so we can't easily override them unless we export a setter or mock them.
  // Since we want to test resetPasswordService, we can modify the user in DB directly or mock the token.
  // Let's do this: generate a raw token in the test script, hash it, update the user in DB manually, and then call resetPasswordService. This tests the service logic exactly.
  console.log("\n🧪 Running Test 3: Reset Password Service...");
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  updatedUser.resetPasswordToken = hashedToken;
  updatedUser.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
  await updatedUser.save({ validateBeforeSave: false });

  // Now call resetPasswordService
  const resetResult = await resetPasswordService(rawToken, newPassword, newPassword);
  console.log("resetPasswordService successful. Token generated:", resetResult.token);

  // Check that password in DB was hashed and updated
  const userAfterReset = await User.findOne({ email: testEmail }).select("+password +resetPasswordToken +resetPasswordExpires");
  
  const isOldMatch = await bcrypt.compare(testPassword, userAfterReset.password);
  const isNewMatch = await bcrypt.compare(newPassword, userAfterReset.password);
  console.log("Old password matches:", isOldMatch);
  console.log("New password matches:", isNewMatch);

  if (isOldMatch) {
    throw new Error("❌ FAIL: Old password still works!");
  }
  if (!isNewMatch) {
    throw new Error("❌ FAIL: New password does not work!");
  }

  // Check that reset token and expiry are cleared
  console.log("Token after reset:", userAfterReset.resetPasswordToken);
  console.log("Expiry after reset:", userAfterReset.resetPasswordExpires);
  if (userAfterReset.resetPasswordToken !== undefined && userAfterReset.resetPasswordToken !== null) {
    throw new Error("❌ FAIL: resetPasswordToken was not cleared!");
  }
  if (userAfterReset.resetPasswordExpires !== undefined && userAfterReset.resetPasswordExpires !== null) {
    throw new Error("❌ FAIL: resetPasswordExpires was not cleared!");
  }
  console.log("✅ Test 3 Passed: Password updated, token cleared.");

  // Test 4: Single-use token (using the same token again should fail)
  console.log("\n🧪 Running Test 4: Single-use token validation...");
  try {
    await resetPasswordService(rawToken, newPassword, newPassword);
    throw new Error("❌ FAIL: Re-using the same token did not throw an error!");
  } catch (error) {
    console.log("Caught expected error:", error.message);
    if (error.message !== "Invalid or expired reset link. Please request a new one.") {
      throw new Error(`❌ FAIL: Unexpected error message: ${error.message}`);
    }
  }
  console.log("✅ Test 4 Passed: Re-using token failed as expected.");

  // Test 5: Expired token validation
  console.log("\n🧪 Running Test 5: Expired token validation...");
  const expiredRawToken = crypto.randomBytes(32).toString("hex");
  const expiredHashedToken = crypto.createHash("sha256").update(expiredRawToken).digest("hex");
  
  userAfterReset.resetPasswordToken = expiredHashedToken;
  userAfterReset.resetPasswordExpires = Date.now() - 1000; // 1 second ago
  await userAfterReset.save({ validateBeforeSave: false });

  try {
    await resetPasswordService(expiredRawToken, newPassword, newPassword);
    throw new Error("❌ FAIL: Expired token did not throw an error!");
  } catch (error) {
    console.log("Caught expected error:", error.message);
    if (error.message !== "Invalid or expired reset link. Please request a new one.") {
      throw new Error(`❌ FAIL: Unexpected error message: ${error.message}`);
    }
  }
  console.log("✅ Test 5 Passed: Expired token failed as expected.");

  // Clean up
  console.log("\n🧹 Cleaning up test user...");
  await User.deleteOne({ email: testEmail });

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉");
  await mongoose.disconnect();
  process.exit(0);
};

runTest().catch(async (error) => {
  console.error("\n❌ TEST FAILED:", error);
  try {
    await User.deleteOne({ email: testEmail });
    await mongoose.disconnect();
  } catch (e) {}
  process.exit(1);
});
