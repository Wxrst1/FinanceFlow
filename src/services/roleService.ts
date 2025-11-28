
import { WorkspaceRole, Permission } from "../types";
export const RoleService = {
    can: (role: WorkspaceRole | undefined, permission: Permission): boolean => false,
    isAdmin: (role: WorkspaceRole | undefined): boolean => role === 'owner' || role === 'admin',
    getRoleLabel: (role: WorkspaceRole): string => role
};
