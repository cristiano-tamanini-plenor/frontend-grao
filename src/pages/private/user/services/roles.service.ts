import { apiClient } from '@/lib/api/client';
import type { AppRole } from '@/modules/auth/types';
import { UserWithRole } from '../types';


/**
 * Service for managing user roles
 * Only OWNER users can modify roles
 */
export const rolesService = {
  /**
   * Get role for a specific user
   * TODO: Implement via API endpoint when available
   */
  async getUserRole(userId: string): Promise<AppRole | null> {
    // TODO: Replace with API call: GET /users/:userId/role
    try {
      const response = await apiClient.get<{ role: AppRole }>(`/users/${userId}/role`);
      return response.role || null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  },

  /**
   * Update user role (only OWNER can do this)
   * TODO: Implement via API endpoint when available
   */
  async updateUserRole(userId: string, role: AppRole): Promise<void> {
    // TODO: Replace with API call: PATCH /users/:userId/role
    await apiClient.patch(`/users/${userId}/role`, { role });
  },

  /**
   * List all users with their roles
   * Only returns active users (is_active = true)
   * TODO: Implement via API endpoint when available
   */
  async listUsersWithRoles(): Promise<UserWithRole[]> {
    // TODO: Replace with API call: GET /users?includeRoles=true&active=true
    const response = await apiClient.get<UserWithRole[]>('/users?includeRoles=true&active=true');
    return response || [];
  },
};
