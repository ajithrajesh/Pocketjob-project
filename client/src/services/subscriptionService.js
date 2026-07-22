import api from "./api";

export const createSubscriptionOrder = async (plan) => {
  const response = await api.post("/subscriptions/create-order", { plan });
  return response.data;
};

export const verifySubscriptionPayment = async (paymentData) => {
  const response = await api.post("/subscriptions/verify-payment", paymentData);
  return response.data;
};
