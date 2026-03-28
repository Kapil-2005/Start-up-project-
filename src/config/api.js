
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const API_URL = API_BASE_URL;

export const endpoints = {
    login: `${API_BASE_URL}/api/login`,
    register: `${API_BASE_URL}/api/register`,
    generate: `${API_BASE_URL}/api/generate-form`,
    forms: `${API_BASE_URL}/api/forms`,
    submit: (id) => `${API_BASE_URL}/api/forms/${id}/submit`,
    responses: (id) => `${API_BASE_URL}/api/forms/${id}/responses`
};
