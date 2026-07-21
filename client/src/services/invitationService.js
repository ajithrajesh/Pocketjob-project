import api from "./api";

export const sendInvitation = async (jobId, seekerId) => {
  const response = await api.post("/invitations", { jobId, seekerId });
  return response.data;
};

export const getInvitations = async () => {
  const response = await api.get("/invitations");
  return response.data;
};

export const updateInvitationStatus = async (invitationId, status) => {
  const response = await api.put(`/invitations/${invitationId}`, { status });
  return response.data;
};
