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
  const context = { mode, entityId };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(context));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("active-context-updated", { detail: context }));
  }
};

export const clearActiveContext = () => {
  localStorage.removeItem(STORAGE_KEY);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("active-context-updated", { detail: null }));
  }
};
