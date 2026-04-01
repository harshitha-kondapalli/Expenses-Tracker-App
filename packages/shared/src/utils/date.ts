export const getMonthKey = (date: string | Date) => {
  const value = typeof date === "string" ? new Date(date) : date;
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  return `${value.getFullYear()}-${month}`;
};

export const getDayKey = (date: string | Date) => {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toISOString().slice(0, 10);
};
