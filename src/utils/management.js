export const roleLabels = { admin: "administrador", editor: "editor", member: "membro" };
export const requestLabels = { pending: "Pendente", accepted: "Aceita", rejected: "Recusada", canceled: "Cancelada" };

export const getErrorMessage = (error, fallback = "Não foi possível concluir a ação. Tente novamente.") => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join(" ");
  return fallback;
};

export const canManageVacancy = (membership, vacancy) =>
  Boolean(membership?.entity?.id === vacancy?.entity?.id && ["admin", "editor"].includes(membership?.position));

export const formatDate = (value) => {
  if (!value) return "Data não informada";
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
  const parsed = new Date(hasZone ? value : `${value}Z`);
  return Number.isNaN(parsed.getTime()) ? "Data não informada" : parsed.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
};

export const validateEntity = (data) => {
  const errors = {};
  for (const [key, label, min, max] of [["name", "Nome", 3, 100], ["slug", "Identificador", 3, 100], ["sector", "Área de atuação", 2, 100], ["description", "Descrição", 3, 2000], ["city", "Cidade", 2, 100]]) {
    const length = [...(data[key] ?? "").trim()].length;
    if (length < min || length > max) errors[key] = `${label}: informe de ${min} a ${max} caracteres.`;
  }
  if (data.slug && !/^[a-zA-Z0-9_.-]+$/.test(data.slug.trim())) errors.slug = "Use apenas letras sem acento, números, ponto, hífen ou sublinhado.";
  if (!/^[a-zA-Z]{2}$/.test((data.uf ?? "").trim())) errors.state = "Escolha um estado.";
  return errors;
};
