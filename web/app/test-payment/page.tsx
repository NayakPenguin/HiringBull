// @ts-nocheck
"use client";
import React, { useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.hiringbull.org";

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Razorpay is only available in the browser"));
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Razorpay script")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });

const TestPayment = () => {
  // Load Razorpay script once
  useEffect(() => {
    loadRazorpay()
      .then(() => console.log("✅ Razorpay script loaded"))
      .catch((error) => console.error("❌", error));
  }, []);

  const handlePay = async () => {
    try {
      console.log("🟡 Starting test payment...");
      await loadRazorpay();

      // 1️⃣ Create order from backend
      const res = await fetch(
        `${API_BASE_URL}/api/payment/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test.user@gmail.com",
            planType: "STARTER",
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to create order");
      }

      const data = await res.json();

      console.log("✅ Order created:", data);
      // data.amount is in PAISE (₹100 → 10000)

      // 2️⃣ Open Razorpay Checkout
      const options = {
        key: data.key,                 // rzp_test_...
        amount: data.amountInPaise || data.amount,           // in paise
        currency: "INR",
        order_id: data.orderId,

        name: "HiringBull",
        description: "Starter Membership",

        prefill: {
          name: "Test User",
          email: "test.user@gmail.com",
        },

        handler: async function (response) {
          console.log("🟢 Razorpay success:", response);

          // 3️⃣ Verify payment
          const verifyRes = await fetch(
            `${API_BASE_URL}/api/payment/verify`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            }
          );

          const verifyData = await verifyRes.json();
          console.log("🔐 Verify response:", verifyData);

          if (!verifyRes.ok || !verifyData.success) {
            alert("❌ Payment verification failed");
            return;
          }

          alert("✅ Payment successful");
        },

        modal: {
          ondismiss: () => {
            console.log("⚠️ Payment popup closed by user");
            alert("❌ Payment cancelled");
          },
        },

        theme: {
          color: "#000000",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("❌ Payment error:", err);
      alert("Something went wrong. Check console.");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Razorpay Test Payment</h2>
      <p>Amount: ₹249 (Starter Plan)</p>

      <button
        onClick={handlePay}
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Pay ₹249
      </button>
    </div>
  );
};

export default TestPayment;
