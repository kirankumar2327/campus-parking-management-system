export const formatDate = (dateValue) =>
  new Date(dateValue).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const getPermitCodeFromText = (rawValue) => {
  const value = String(rawValue || "").trim();

  if (!value) {
    return "";
  }

  if (value.startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      return parsed.permitCode || value;
    } catch (error) {
      return value;
    }
  }

  return value;
};
