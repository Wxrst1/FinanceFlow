
import React, { useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useNotification } from '../contexts/NotificationContext';
import { Users, UserPlus, Mail, CheckCircle2, Shield, Crown, Send } from 'lucide-react';
import { t } from '../utils';
import { ApiService } from '../services/api';
import { WorkspaceMember } from '../types';
import Modal from './Modal';

const SharedFinances = () => {
  const { currentWorkspace, language, sentInvites, sendInvite } = useFinance();
  const { addNotification } = useNotification();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      if (currentWorkspace) {
          loadMembers();
      }
  }, [currentWorkspace]);

  const loadMembers = async () => {
      if (!currentWorkspace) return;
      const data = await ApiService.getWorkspaceMembers(currentWorkspace.id);
      setMembers(data);
  };

  const handleInvite = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentWorkspace) return;
      
      setIsLoading(true);
      try {
          await sendInvite(inviteEmail, 'editor');
          addNotification('Convite enviado com sucesso!', 'success');
          setInviteEmail('');
          setIsInviteModalOpen(false);
          loadMembers(); 
      } catch (e) {
          addNotification('Erro ao enviar convite.', 'error');
      } finally {
          setIsLoading(false);
      }
  };

  if (!currentWorkspace) {
      return (
          <div className="p-8 flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                  <Users size={40} className="text-zinc-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('personal_finance_title', language)}</h2>
              <p className="text-text-muted max-w-md">
                  {t('personal_finance_msg', language)}
              </p>
          </div>
      );
  }

  return (
    <div className="p-8 animate-fade-in max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
                    <Users className="text-purple-500" />
                    {t('members_title', language)}
                </h1>
                <p className="text-text-muted">{t('members_desc', language)}: <span className="text-white font-bold">"{currentWorkspace.name}"</span></p>
            </div>
            <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-green-900/20"
            >
                <UserPlus size={20} />
                <span>{t('invite_member', language)}</span>
            </button>
        </div>

        {/* Members List */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-8">
            <div className="p-4 border-b border-border bg-black/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">{t('active_members', language)}</h3>
            </div>
            <div className="divide-y divide-border">
                {members.map(member => (
                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold uppercase">
                                {member.email[0]}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-white">{member.email}</h4>
                                    {member.role === 'admin' && <Crown size={14} className="text-yellow-500" />}
                                    {member.userId === currentWorkspace.ownerId && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/30">OWNER</span>}
                                </div>
                                <p className="text-xs text-text-muted capitalize flex items-center gap-1">
                                    <Shield size={10} /> {t(`role_${member.role}`, language)}
                                </p>
                            </div>
                        </div>
                        <div>
                            {member.status === 'pending' ? (
                                <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded border border-orange-500/30 flex items-center gap-1">
                                    <Mail size={10} /> {t('status_pending', language)}
                                </span>
                            ) : (
                                <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded border border-green-500/30 flex items-center gap-1">
                                    <CheckCircle2 size={10} /> {t('status_joined', language)}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Sent Invites List */}
        {sentInvites.length > 0 && (
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border bg-black/20">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">{t('pending_invites', language)}</h3>
                </div>
                <div className="divide-y divide-border">
                    {sentInvites.map(invite => (
                        <div key={invite.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">{invite.email}</h4>
                                    <p className="text-xs text-text-muted">Enviado em {new Date(invite.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 flex items-center gap-1">
                                <Send size={10} /> Enviado
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title={t('invite_member', language)}>
            <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-muted">{t('invite_email_label', language)}</label>
                    <input 
                        type="email" 
                        required
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="exemplo@email.com"
                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <p className="text-xs text-text-muted">{t('invite_email_desc', language)}</p>
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-lg transition-colors"
                >
                    {isLoading ? t('sending', language) : t('send_invite', language)}
                </button>
            </form>
        </Modal>
    </div>
  );
};

export default SharedFinances;
