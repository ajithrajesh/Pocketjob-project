import api from "./api";

export const getDashboardStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

export const getAllUsers = async (params) => {
  const response = await api.get("/admin/users", { params });
  return response.data;
};

export const blockUser = async (userId) => {
  const response = await api.put(`/admin/users/${userId}/block`);
  return response.data;
};

export const unblockUser = async (userId) => {
  const response = await api.put(`/admin/users/${userId}/unblock`);
  return response.data;
};

export const verifyUser = async (userId) => {
  const response = await api.put(`/admin/users/${userId}/verify`);
  return response.data;
};

export const unverifyUser = async (userId) => {
  const response = await api.put(`/admin/users/${userId}/unverify`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const getAllJobs = async (params) => {
  const response = await api.get("/admin/jobs", { params });
  return response.data;
};