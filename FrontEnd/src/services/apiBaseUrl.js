const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

export const getApiBaseUrl = () => {
  const configuredUrl = trimTrailingSlash(import.meta.env.VITE_API_URL);
  if (configuredUrl) {
    return configuredUrl;
  }

  return 'http://localhost:3000';
};
