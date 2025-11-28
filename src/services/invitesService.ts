
import { WorkspaceInvite, WorkspaceRole } from "../types";
export const InvitesService = {
    sendInvite: async (workspaceId: string, email: string, role: WorkspaceRole): Promise<void> => {},
    revokeInvite: async (inviteId: string): Promise<void> => {},
    respondToInvite: async (inviteId: string, accept: boolean): Promise<void> => {},
    getWorkspaceInvites: async (workspaceId: string): Promise<WorkspaceInvite[]> => []
};
