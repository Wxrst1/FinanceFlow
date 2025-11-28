
import { WorkspaceRole, Permission } from "../types";

const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
    owner: [
        'manage_workspace',
        'manage_members',
        'manage_billing',
        'create_data',
        'edit_data',
        'delete_data',
        'view_data'
    ],
    admin: [
        'manage_members',
        'create_data',
        'edit_data',
        'delete_data',
        'view_data'
    ],
    editor: [
        'create_data',
        'edit_data',
        'view_data'
    ],
    viewer: [
        'view_data'
    ]
};

export const RoleService = {
    /**
     * Check if a role has a specific permission
     */
    can: (role: WorkspaceRole | undefined, permission: Permission): boolean => {
        if (!role) return false;
        const permissions = ROLE_PERMISSIONS[role];
        return permissions ? permissions.includes(permission) : false;
    },

    /**
     * Check if role is admin or owner
     */
    isAdmin: (role: WorkspaceRole | undefined): boolean => {
        return role === 'owner' || role === 'admin';
    },

    /**
     * Get readable label for role
     */
    getRoleLabel: (role: WorkspaceRole): string => {
        switch(role) {
            case 'owner': return 'Proprietário';
            case 'admin': return 'Administrador';
            case 'editor': return 'Editor';
            case 'viewer': return 'Visualizador';
            default: return role;
        }
    }
};
