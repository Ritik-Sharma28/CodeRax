const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');
const isBrowser = typeof window !== 'undefined';

const getConfiguredUrl = () =>
  trimTrailingSlash(import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '');

const isLocalBrowser = () =>
  isBrowser && ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const getApiBaseUrl = () => {
  const configuredUrl = getConfiguredUrl();
  if (configuredUrl) {
    return configuredUrl;
  }

  if (isLocalBrowser()) {
    return 'http://localhost:3000';
  }

  if (isBrowser) {
    return '/server-api';
  }

  return 'http://localhost:3000';
};

export const getSocketConfig = () => {
  const configuredUrl = getConfiguredUrl();
  if (configuredUrl) {
    return {
      url: configuredUrl,
      path: '/socket.io',
    };
  }

  if (isLocalBrowser()) {
    return {
      url: 'http://localhost:3000',
      path: '/socket.io',
    };
  }

  if (isBrowser) {
    return {
      url: window.location.origin,
      path: '/server-api/socket.io',
    };
  }

  return {
    url: 'http://localhost:3000',
    path: '/socket.io',
  };
};
