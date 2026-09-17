const STORAGE_KEY = "activeContext";

export const getActiveContext = () => {
  try {
    const savedContext = localStorage.getItem(STORAGE_KEY);
    return savedContext ? JSON.parse(savedContext) : null;
  } catch {
    return null;
  }
};

export const saveActiveContext = (mode, entityId = null) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ mode, entityId }),
  );
};

export const clearActiveContext = () => {
  localStorage.removeItem(STORAGE_KEY);
};
