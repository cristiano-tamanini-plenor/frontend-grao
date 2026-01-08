import { apiClient } from '@/lib/api/client';

/**
 * Service to create the initial OWNER user
 * This uses admin functions that require proper permissions
 */
export const createOwnerService = {
  /**
   * Create owner user with specific credentials
   * Note: This will only work if called with proper permissions
   * TODO: Implement via API endpoint when available
   */
  async createOwner(data: {
    email: string;
    password: string;
    name: string;
    phone_e164?: string;
  }) {
    // TODO: Replace with API call: POST /auth/setup/owner
    const response = await apiClient.post('/auth/setup/owner', {
      email: data.email,
      password: data.password,
      name: data.name,
      phone_e164: data.phone_e164,
      role: 'OWNER',
    });

    return response.user;
  },
};
