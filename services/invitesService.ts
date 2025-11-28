
import { ApiService } from "./api";
import { WorkspaceInvite, WorkspaceRole } from "../types";

export const InvitesService = {
    /**
     * Send an invitation to an email
     */
    sendInvite: async (workspaceId: string, email: string, role: WorkspaceRole): Promise<void> => {
        // Logic handled in ApiService for consistency with the mock/real hybrid structure
        await ApiService.inviteMember(workspaceId, email, role);
    },

    /**
     * Revoke a pending invitation
     */
    revokeInvite: async (inviteId: string): Promise<void> => {
        await ApiService.revokeInvite(inviteId);
    },

    /**
     * Accept or Reject an invitation
     */
    respondToInvite: async (inviteId: string, accept: boolean): Promise<void> => {
        await ApiService.respondToInvite(inviteId, accept);
    },

    /**
     * Get pending invites for a workspace (Admin view)
     */
    getWorkspaceInvites: async (workspaceId: string): Promise<WorkspaceInvite[]> => {
        return await ApiService.getSentInvites(workspaceId);
    }
};
