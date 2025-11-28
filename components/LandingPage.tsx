
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, CheckCircle2, Shield, Zap, BarChart3, Wallet, 
  Globe, ChevronDown, Star, Lock, Smartphone, CreditCard,
  Sparkles, TrendingUp, PieChart, BrainCircuit, Target
} from 'lucide-react';
import { SubscriptionPlan } from '../types';

interface LandingPageProps {
  onLogin: (plan?: SubscriptionPlan) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const pricingPlans: { 
    name: string; 
    id: SubscriptionPlan; 
    price: string; 
    description: string; 
    features: string[]; 
    cta: string; 
    popular: boolean; 
    period?: string; 
    billingNote?: string 
  }[] = [
    {
      name: "Starter",
      id: "starter",
      price: "0",
      description: "Essencial para organização manual.",
      features: [
        "Registo manual ilimitado",
        "2 Contas Virtuais",
        "Dashboard Básico",
        "Exportação PDF"
      ],
      cta: "Começar Grátis",
      popular: false
    },
    {
      name: "Pro",
      id: "pro",
      price: billingCycle === 'monthly' ? "9" : "7",
      period: "/mês",
      billingNote: billingCycle === 'yearly' ? "€84 cobrado anualmente" : "",
      description: "IA e automação total.",
      features: [
        "Sincronização Bancária (PSD2)",
        "Financial Coach IA",
        "Previsão de Saldo (30 dias)",
        "Smart Reports Mensais",
        "Contas Ilimitadas"
      ],
      cta: "Começar Trial de 14 Dias",
      popular: true
    },
    {
      name: "Business",
      id: "business",
      price: "29",
      period: "/mês",
      description: "Para gestão avançada.",
      features: [
        "Tudo do plano Pro",
        "Espaços Partilhados (Teams)",
        "Gestão de Ativos/Passivos",
        "Análise de Fluxo de Caixa",
        "Suporte Prioritário"
      ],
      cta: "Contactar Vendas",
      popular: false
    }
  ];

  const features = [
    {
      title: "Sincronização Bancária",
      desc: "Conecte qualquer banco europeu em segundos. As suas transações aparecem automaticamente, categorizadas e limpas.",
      icon: Globe,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      colSpan: "md:col-span-2"
    },
    {
      title: "Financial Coach IA",
      desc: "Um consultor pessoal que analisa os seus gastos e cria planos de ação passo-a-passo para sair de dívidas ou investir.",
      icon: BrainCircuit,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      colSpan: "md:col-span-1"
    },
    {
      title: "Previsão Inteligente",
      desc: "Não olhe apenas para o passado. O nosso motor de previsão projeta o seu saldo para os próximos 30 dias baseado nos seus hábitos.",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      colSpan: "md:col-span-1"
    },
    {
      title: "Smart Reports 2.0",
      desc: "Relatórios mensais gerados por IA que explicam para onde foi o seu dinheiro em linguagem natural, não apenas gráficos.",
      icon: FileTextIcon,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      colSpan: "md:col-span-2"
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-50 selection:bg-primary/30 font-sans overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="bg-primary p-1.5 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <Wallet className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">FinanceFlow</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
              <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
              <a href="#pricing" className="hover:text-white transition-colors">Preços</a>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onLogin()}
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors hidden sm:block"
              >
                Entrar
              </button>
              <button 
                onClick={() => onLogin('starter')}
                className="bg-white text-black hover:bg-zinc-200 text-sm font-bold px-4 py-2 rounded-full transition-all shadow-lg shadow-white/5"
              >
                Começar
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-[100%] blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-medium mb-8 animate-fade-in-up hover:bg-white/10 transition-colors cursor-default">
              <Sparkles size={12} />
              <span>Novo: Módulo Financial Coach IA</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
              Domine o seu dinheiro com <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-300 to-teal-500">
                Inteligência Artificial
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Mais do que um gestor de despesas. O FinanceFlow conecta-se aos seus bancos, prevê o seu futuro financeiro e cria planos personalizados para atingir a liberdade financeira.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => onLogin('starter')}
              className="h-14 px-8 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-lg transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] hover:scale-105 active:scale-95"
            >
              Criar Conta Grátis
              <ArrowRight size={20} />
            </button>
            <button className="h-14 px-8 rounded-full bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 transition-all font-medium flex items-center gap-2">
              <Smartphone size={20} className="text-zinc-400" />
              Ver Demonstração
            </button>
          </motion.div>

          {/* Dashboard Preview / Abstract Graphic */}
          <motion.div 
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.4 }}
             className="mt-20 relative mx-auto max-w-5xl"
          >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-[#121214] border border-white/10 rounded-2xl shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] group">
                  {/* Simulated Interface */}
                  <div className="absolute inset-0 flex flex-col">
                      <div className="h-12 border-b border-white/5 bg-[#09090b] flex items-center px-4 gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                      </div>
                      <div className="flex-1 flex">
                          <div className="w-64 border-r border-white/5 bg-[#09090b] hidden md:block p-4 space-y-3">
                              <div className="h-8 w-full bg-white/5 rounded animate-pulse"></div>
                              <div className="h-8 w-3/4 bg-white/5 rounded animate-pulse delay-75"></div>
                              <div className="h-8 w-5/6 bg-white/5 rounded animate-pulse delay-100"></div>
                          </div>
                          <div className="flex-1 p-6 bg-gradient-to-br from-[#121214] to-[#000]">
                              <div className="flex gap-4 mb-6">
                                  <div className="flex-1 h-32 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden">
                                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary/20 to-transparent"></div>
                                  </div>
                                  <div className="flex-1 h-32 rounded-xl bg-white/5 border border-white/5"></div>
                                  <div className="flex-1 h-32 rounded-xl bg-white/5 border border-white/5"></div>
                              </div>
                              <div className="h-48 rounded-xl bg-white/5 border border-white/5 w-full relative overflow-hidden flex items-center justify-center">
                                  <span className="text-zinc-700 font-mono text-sm">Interactive Dashboard Preview</span>
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Overlay CTA */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <button onClick={() => onLogin('starter')} className="bg-white text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform shadow-xl">
                          Explorar Dashboard
                      </button>
                  </div>
              </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="mb-16 text-center md:text-left">
           <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">O Futuro das Finanças Pessoais</h2>
           <p className="text-xl text-zinc-400 max-w-2xl">Esqueça as folhas de Excel. O FinanceFlow utiliza algoritmos avançados para lhe dar clareza total.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                    <div key={idx} className={`${feature.colSpan} bg-zinc-900/50 border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5`}>
                        <div className={`w-12 h-12 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                            <Icon size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                        <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
                        
                        {/* Visual decoration on hover */}
                        <div className="absolute right-0 bottom-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <Icon size={150} className={feature.color} />
                        </div>
                    </div>
                );
            })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/5 bg-white/[0.02]">
         <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
                <div className="text-4xl font-bold text-white mb-1">2000+</div>
                <div className="text-sm text-zinc-500 uppercase tracking-wider">Bancos Suportados</div>
            </div>
            <div>
                <div className="text-4xl font-bold text-white mb-1">€2M+</div>
                <div className="text-sm text-zinc-500 uppercase tracking-wider">Volume Gerido</div>
            </div>
            <div>
                <div className="text-4xl font-bold text-white mb-1">100%</div>
                <div className="text-sm text-zinc-500 uppercase tracking-wider">Segurança PSD2</div>
            </div>
            <div>
                <div className="text-4xl font-bold text-white mb-1">4.9/5</div>
                <div className="text-sm text-zinc-500 uppercase tracking-wider">User Rating</div>
            </div>
         </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-[#09090b] relative">
        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Investimento no seu futuro</h2>
            <p className="text-xl text-zinc-400 mb-8">Escolha o plano que se adapta ao seu momento financeiro.</p>
            
            {/* Toggle */}
            <div className="inline-flex items-center bg-white/5 p-1 rounded-full border border-white/10 relative backdrop-blur-sm">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
              >
                Mensal
              </button>
              <button 
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'yearly' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
              >
                Anual
              </button>
              {billingCycle === 'yearly' && (
                <span className="absolute -right-24 top-1/2 -translate-y-1/2 bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded border border-green-500/20 animate-pulse">
                  2 meses grátis
                </span>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div 
                key={i} 
                onClick={() => onLogin(plan.id)}
                className={`
                  relative p-8 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col
                  ${plan.popular 
                    ? 'bg-zinc-900/90 border-primary shadow-[0_0_40px_rgba(34,197,94,0.15)] transform md:-translate-y-4 ring-1 ring-primary/50' 
                    : 'bg-zinc-900/30 border-white/10 hover:border-white/20 hover:bg-zinc-900/50'
                  }
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-wider flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> Mais Popular
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-zinc-400 text-sm min-h-[40px]">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-white">€{plan.price}</span>
                    {plan.price !== "0" && <span className="text-zinc-500">{plan.period}</span>}
                  </div>
                  {plan.billingNote && (
                    <p className="text-xs text-green-500 mt-2 font-medium">{plan.billingNote}</p>
                  )}
                </div>

                <button 
                  className={`
                    w-full py-4 rounded-xl font-bold mb-8 transition-all flex items-center justify-center gap-2
                    ${plan.popular 
                      ? 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20' 
                      : 'bg-white text-black hover:bg-zinc-200'
                    }
                  `}
                >
                  {plan.cta}
                  <ArrowRight size={16} />
                </button>

                <div className="flex-1">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-4">Inclui:</p>
                    <ul className="space-y-4">
                    {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                        <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-primary' : 'text-zinc-500'}`} />
                        <span>{feat}</span>
                        </li>
                    ))}
                    </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Dúvidas?</h2>
        <div className="space-y-4">
            {[
                {q: "Como funciona o Financial Coach?", a: "A nossa IA analisa o seu histórico de transações, deteta padrões de gastos excessivos e cria um plano personalizado de 30 dias com tarefas concretas para melhorar a sua saúde financeira."},
                {q: "Os meus dados bancários estão seguros?", a: "Absolutamente. Utilizamos parceiros regulados pela diretiva PSD2 (Tink/GoCardless). O FinanceFlow tem apenas acesso de leitura e nunca consegue movimentar o seu dinheiro."},
                {q: "Posso cancelar o trial?", a: "Sim, a qualquer momento nas definições. Sem perguntas e sem custos se cancelar dentro dos 14 dias."},
            ].map((faq, i) => (
                <div key={i} className="border border-white/10 rounded-xl overflow-hidden bg-zinc-900/30">
                    <button 
                        onClick={() => toggleFaq(i)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                    >
                        <span className="font-medium text-white">{faq.q}</span>
                        <ChevronDown size={20} className={`text-zinc-500 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                        {activeFaq === i && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 pt-0 text-zinc-400 leading-relaxed">
                                    {faq.a}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Comece a sua jornada hoje.</h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já transformaram a sua relação com o dinheiro usando o FinanceFlow.
          </p>
          <button 
            onClick={() => onLogin('starter')}
            className="h-16 px-12 rounded-full bg-white text-black font-bold text-xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
          >
            Criar conta gratuita
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-[#050507]">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                 <div className="flex items-center gap-2">
                    <div className="bg-primary p-1 rounded shadow">
                        <Wallet className="text-white w-4 h-4" />
                    </div>
                    <span className="font-bold text-white text-lg">FinanceFlow</span>
                </div>
                <div className="flex gap-8 text-sm text-zinc-400">
                    <a href="#" className="hover:text-white transition-colors">Sobre</a>
                    <a href="#" className="hover:text-white transition-colors">Segurança</a>
                    <a href="#" className="hover:text-white transition-colors">Termos</a>
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600 pt-8 border-t border-white/5">
                <p>© 2025 FinanceFlow. Todos os direitos reservados.</p>
                <div className="flex gap-4 items-center">
                    <span className="flex items-center gap-1"><Lock size={10}/> Encriptação 256-bit</span>
                    <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                    <span>Feito com ❤️ para as suas finanças</span>
                </div>
            </div>
        </div>
      </footer>

    </div>
  );
};

// Helper icon component
const FileTextIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
);

export default LandingPage;
