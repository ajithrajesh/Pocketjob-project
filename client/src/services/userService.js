import api from "./api";

export const getProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put("/users/profile", profileData);
  return response.data;
};

export const uploadProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append("profilePhoto", file);

  const response = await api.put("/users/profile/photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const uploadAadhaarFront = async (file) => {
  const formData = new FormData();
  formData.append("aadhaarFront", file);

  const response = await api.put("/users/aadhaar/front", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const uploadAadhaarBack = async (file) => {
  const formData = new FormData();
  formData.append("aadhaarBack", file);

  const response = await api.put("/users/aadhaar/back", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const uploadLicense = async (file) => {
  const formData = new FormData();
  formData.append("license", file);

  const response = await api.put("/users/license", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await api.put("/users/resume", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getJobSeekers = async (params) => {
  const response = await api.get("/users/seekers", { params });
  return response.data;
};

export const getCompanies = async (params) => {
  const response = await api.get("/users/companies", { params });
  return response.data;
};
