import axiosInstance from "./axiosInstance";

// Fetch all entities
export const fetchEntities = async () => {
  try {
    const response = await axiosInstance.get("/dep"); // Adjust endpoint if needed
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch details for a specific entity
export const fetchEntityId = async (entityId) => {
  try {
    const response = await axiosInstance.get(`/dep/${entityId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error("Entity not found");
    } else {
      throw new Error("Failed to fetch entity data");
    }
  }
};


// Update multiple session statuses
export const updateSessionStatuses = async (sessionsStatus) => {
  try {
    const response = await axiosInstance.put(
      "/session/updateMultipleStatus",
      sessionsStatus
    ); // Adjust the endpoint if needed
    return response.data;
  } catch (error) {
    throw error;
  }
};
//Update entity time drops

export const updateEntity = async (entityId, entityInfos) => {
  try {
    const response = await axiosInstance.put(`/dep/${entityId}`, entityInfos);
    return response.data;
  } catch (error) {
    throw error;
  }
};
// Fetch sessions by ID entity

export const fetchSessions = async (entityId) => {
  try {
    const response = await axiosInstance.get(`/session/getByDepId/${entityId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// to delete session

export const deleteSession = async (sessionId) => {
  try {
    const response = await axiosInstance.delete(`/session/delete/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
// to delete session

export const deletePlan = async (planId) => {
  try {
    const response = await axiosInstance.delete(`/dep/${planId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// to create session

export const createSession = async (sessionData) => {
  try {
    const response = await axiosInstance.post(`/session/create`,sessionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
// to create Entity

export const createEntity = async (entityData) => {
  try {
    const response = await axiosInstance.post(`/dep`,entityData);
    return response.data;
  } catch (error) {
    throw error;
  }
};



// to update session

export const updateSession = async (sessionId,sessionData) => {
  try {
    const response = await axiosInstance.put(`/session/update/${sessionId}`,sessionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// To move session from entity to other 
export const moveSession = async (sessionId, depId) => {
  try {
    // The request body will send the new depId to the backend
    const response = await axiosInstance.put(`/session/move/${sessionId}`, { depId });
    return response.data;
  } catch (error) {
    throw error;
  }
};


// Function to post ticket
export const postTicket = async (message) => {
  try {
    // The request body will send the message to the backend
    const response = await axiosInstance.post('/telegram/send', { message });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to remove deplucate emails
export const removeDup = async (emailList) => {
  try {
    // The request body will send the message to the backend
    const response = await axiosInstance.post('/email/deduplicate', { emails: emailList });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const handleLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post("/user/login", credentials);
    const { token, user } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user)); // Convert object to string

  } catch (err) {
    throw new Error("Login failed");
  }
};



export const getUsers = async () => {
  try {
    const response = await axiosInstance.get("/user");
    return response.data
 
  } catch (err) {
    throw new Error("Can't get Users");  // <-- add this line
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post("/user", userData);
    return response.data;
  } catch (err) {
    throw new Error("Can't create User");
  }
};

export const deleteUser = async (id) => {
  try {
    await axiosInstance.delete(`/user/${id}`);
  } catch (err) {
    throw new Error("Can't delete User");
  }
};

export const editUser = async (id, userData) => {
  try {
    const response = await axiosInstance.put(`/user/${id}`, userData);
    return response.data;
  } catch (err) {
    throw new Error("Can't edit User");
  }
};


