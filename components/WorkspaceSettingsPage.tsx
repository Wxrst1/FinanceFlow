
import React, { useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { RoleService } from '../services/roleService';
import { InvitesService } from '../services/invitesService';
import { ApiService } from '../services/api';
import { WorkspaceMember, WorkspaceInvite, WorkspaceRole } from '../types';
import { t } from '../utils';
import { 
    Users, Settings, CreditCard, Mail, Trash2, Shield, 
    Check, X, UserPlus, Crown, AlertCircle, LogOut 
} from 'lucide-react';
import Modal from './Modal';

const WorkspaceSettingsPage = () => {
    const { currentWorkspace, user, language, switchWorkspace } = useFinance();
    const { addNotification } = useNotification();
    
    const [activeTab, setActiveTab] = useState<'general' | 'members' | 'billing'>('members');
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Invite Modal State
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<WorkspaceRole>('editor');

    const userRole = currentWorkspace?.role || 'viewer';
    const isAdmin = RoleService.isAdmin(userRole);
    const isOwner = userRole === 'owner';

    useEffect(() => {
        if (currentWorkspace) {
            loadData();
        }
    }, [currentWorkspace]);

    const loadData = async () => {
        if (!currentWorkspace) return;
        setIsLoading(true);
        try {
            const [m, i] = await Promise.all([
                ApiService.getWorkspaceMembers(currentWorkspace.id),
                InvitesService.getWorkspaceInvites(currentWorkspace.id)
            ]);
            setMembers(m);
            setInvites(i);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentWorkspace) return;
        try {
            await InvitesService.sendInvite(currentWorkspace.id, inviteEmail, inviteRole);
            addNotification(t('invite_sent_success', language), 'success');
            setInviteEmail('');
            setIsInviteModalOpen(false);
            loadData();
        } catch (e: any) {
            addNotification(e.message || 'Erro ao enviar convite', 'error');
        }
    };

    const handleRevokeInvite = async (id: string) => {
        if (window.confirm(t('confirm_revoke', language))) {
            await InvitesService.revokeInvite(id);
            addNotification('Convite cancelado', 'info');
            loadData();
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (window.confirm(t('confirm_remove_member', language))) {
            await ApiService.removeMember(memberId);
            addNotification('Membro removido', 'info');
            loadData();
        }
    };

    const handleChangeRole = async (memberId: string, newRole: WorkspaceRole) => {
        await ApiService.updateMemberRole(memberId, newRole);
        addNotification('Permissões atualizadas', 'success');
        loadData();
    };

    const handleLeaveWorkspace = async () => {
        if (window.confirm(t('confirm_leave_workspace', language))) {
            if (!user || !currentWorkspace) return;
            const myMember = members.find(m => m.userId === user.id);
            if (myMember) {
                await ApiService.removeMember(myMember.id);
                switchWorkspace(null); // Go back to personal
            }
        }
    };

    if (!currentWorkspace) return <div className="p-8 text-center text-text-muted">Selecione um espaço primeiro.</div>;

    return (
        <div className="p-8 animate-fade-in max-w-5xl mx-auto pb-24">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2 text-text-muted text-sm uppercase tracking-wider font-bold">
                    Espaço
                </div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    {currentWorkspace.name}
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded border border-primary/20">
                        {RoleService.getRoleLabel(userRole)}
                    </span>
                </h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-border overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('members')}
                    className={`pb-3 px-1 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'members' ? 'border-primary text-white' : 'border-transparent text-text-muted hover:text-white'}`}
                >
                    <Users size={18} />
                    {t('members', language)}
                </button>
                <button 
                    onClick={() => setActiveTab('general')}
                    className={`pb-3 px-1 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'general' ? 'border-primary text-white' : 'border-transparent text-text-muted hover:text-white'}`}
                >
                    <Settings size={18} />
                    {t('general', language)}
                </button>
                <button 
                    onClick={() => setActiveTab('billing')}
                    className={`pb-3 px-1 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'billing' ? 'border-primary text-white' : 'border-transparent text-text-muted hover:text-white'}`}
                >
                    <CreditCard size={18} />
                    {t('billing', language)}
                </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
                
                {/* MEMBERS TAB */}
                {activeTab === 'members' && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">{t('team_members', language)}</h2>
                            {isAdmin && (
                                <button 
                                    onClick={() => setIsInviteModalOpen(true)}
                                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                                >
                                    <UserPlus size={16} />
                                    {t('invite_member', language)}
                                </button>
                            )}
                        </div>

                        {/* Active Members List */}
                        <div className="bg-surface border border-border rounded-xl overflow-hidden">
                            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-black/20 text-xs font-bold text-text-muted uppercase tracking-wider">
                                <div className="col-span-5">Utilizador</div>
                                <div className="col-span-4">Permissão</div>
                                <div className="col-span-3 text-right">Ações</div>
                            </div>
                            <div className="divide-y divide-border">
                                {members.map(member => (
                                    <div key={member.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors">
                                        <div className="col-span-5 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold text-xs">
                                                {member.email[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-white truncate">{member.name || member.email}</div>
                                                <div className="text-xs text-text-muted truncate">{member.email}</div>
                                            </div>
                                            {member.role === 'owner' && <Crown size={14} className="text-yellow-500 ml-1" />}
                                        </div>
                                        <div className="col-span-4">
                                            {isAdmin && member.role !== 'owner' ? (
                                                <select 
                                                    value={member.role}
                                                    onChange={(e) => handleChangeRole(member.id, e.target.value as WorkspaceRole)}
                                                    className="bg-black/30 border border-border rounded px-2 py-1 text-xs text-white outline-none focus:border-primary cursor-pointer"
                                                >
                                                    <option value="admin">Admin</option>
                                                    <option value="editor">Editor</option>
                                                    <option value="viewer">Viewer</option>
                                                </select>
                                            ) : (
                                                <span className="text-sm text-zinc-300 capitalize">{RoleService.getRoleLabel(member.role)}</span>
                                            )}
                                        </div>
                                        <div className="col-span-3 flex justify-end">
                                            {isAdmin && member.userId !== user?.id && member.role !== 'owner' && (
                                                <button 
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    className="text-text-muted hover:text-red-500 p-1.5 hover:bg-red-500/10 rounded transition-colors"
                                                    title="Remover Membro"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pending Invites */}
                        {isAdmin && invites.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">{t('pending_invites', language)}</h3>
                                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                                    <div className="divide-y divide-border">
                                        {invites.map(invite => (
                                            <div key={invite.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                                        <Mail size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-white">{invite.email}</div>
                                                        <div className="text-xs text-text-muted">
                                                            Convidado como <span className="text-zinc-300 font-bold capitalize">{invite.role}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleRevokeInvite(invite.id)}
                                                    className="text-xs text-red-400 hover:text-red-300 hover:underline"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* GENERAL TAB */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <div className="bg-surface border border-border rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">{t('workspace_details', language)}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-text-muted block mb-1">Nome do Espaço</label>
                                    <input 
                                        type="text" 
                                        defaultValue={currentWorkspace.name}
                                        disabled={!isAdmin}
                                        className="w-full bg-black/30 border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                {isAdmin && (
                                    <div className="flex justify-end">
                                        <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                            Guardar Alterações
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-surface border border-border rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Zona de Perigo</h3>
                            <div className="space-y-4">
                                {!isOwner && (
                                    <div className="flex items-center justify-between p-4 border border-red-500/20 bg-red-500/5 rounded-lg">
                                        <div>
                                            <h4 className="text-red-400 font-bold text-sm">Sair do Espaço</h4>
                                            <p className="text-red-200/60 text-xs">Perderá o acesso a todos os dados deste espaço.</p>
                                        </div>
                                        <button onClick={handleLeaveWorkspace} className="text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded text-sm font-bold transition-colors flex items-center gap-2">
                                            <LogOut size={14} /> Sair
                                        </button>
                                    </div>
                                )}
                                {isOwner && (
                                    <div className="flex items-center justify-between p-4 border border-red-500/20 bg-red-500/5 rounded-lg">
                                        <div>
                                            <h4 className="text-red-400 font-bold text-sm">Apagar Espaço</h4>
                                            <p className="text-red-200/60 text-xs">Ação irreversível. Todos os dados serão perdidos.</p>
                                        </div>
                                        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-red-900/20">
                                            Apagar Permanentemente
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* BILLING TAB */}
                {activeTab === 'billing' && (
                    <div className="bg-surface border border-border rounded-xl p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">Plano e Faturação</h3>
                                <p className="text-text-muted text-sm">Gerencie a subscrição deste espaço.</p>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-sm font-bold uppercase tracking-wider">
                                {currentWorkspace.plan || 'Starter'}
                            </div>
                        </div>

                        <div className="p-4 bg-black/30 rounded-lg border border-border mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="text-green-500" size={20} />
                                <span className="font-bold text-white">Funcionalidades Ativas</span>
                            </div>
                            <ul className="space-y-2 ml-8 text-sm text-zinc-400 list-disc">
                                <li>Membros ilimitados</li>
                                <li>Histórico ilimitado</li>
                                <li>Exportação de dados</li>
                            </ul>
                        </div>

                        {isAdmin && (
                            <button className="w-full bg-white text-black font-bold py-2.5 rounded-lg hover:bg-zinc-200 transition-colors">
                                Gerir Subscrição
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Invite Modal */}
            <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title={t('invite_member', language)}>
                <form onSubmit={handleSendInvite} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted">{t('invite_email_label', language)}</label>
                        <input 
                            type="email" 
                            required
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                            placeholder="colaborador@empresa.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted">Permissão</label>
                        <select 
                            value={inviteRole}
                            onChange={e => setInviteRole(e.target.value as WorkspaceRole)}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                        >
                            <option value="admin">Admin (Controlo Total)</option>
                            <option value="editor">Editor (Gerir Dados)</option>
                            <option value="viewer">Viewer (Apenas Leitura)</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-lg transition-colors mt-2">
                        Enviar Convite
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default WorkspaceSettingsPage;
