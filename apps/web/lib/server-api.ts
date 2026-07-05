export const SERVER_API_URL = (() => {
  const base = process.env.API_URL ?? 'http://localhost:4000';
  return `${base.replace(/\/$/, '')}/api/v1`;
})();
