export function localizedField(record, field, language) {
  if (!record) return "";
  const english = String(language || "").toLowerCase().startsWith("en");
  const translated = english ? record[`${field}En`] : "";
  return String(translated || record[field] || "");
}
