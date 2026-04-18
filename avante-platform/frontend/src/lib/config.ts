// Runtime configuration — simplified for Vercel deployment
export const config = {
  API_BASE_URL: '/api',
};

export function getAPIBaseURL(): string {
  return config.API_BASE_URL;
}
