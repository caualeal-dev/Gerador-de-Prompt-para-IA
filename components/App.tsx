import React, { useState, useEffect, useRef, useCallback } from 'react';
import Accordion from './Accordion';
import FormField from './FormField';
import Toast from './Toast';
import WelcomeModal from './WelcomeModal';
import { 
  analyzeUrl, 
  generateColorPalette, 
  generateWebsitePromptStream,
  generateInspiration,
  generateSeoKeywords,
  generatePageContent,
  generateLogoSuggestion
} from '../services/geminiService';
import { AiIcon, CheckIcon, ClipboardIcon, LinkIcon, LoadingSpinner } from './Icons';

// Define interfaces based on geminiService
interface PromptData {
  projectName: string;
  niche: string;
  targetAudience: string;
  mainGoal: string;
  tone: string;
  style: string;
  selectedPages: string[];
  cornerStyle: string;
  siteComplexity: string;
  hasLogo: boolean;
  logoSuggestion?: string;
  colors?: { primary: string; accent: string; secondary?: string; neutral?: string };
  seoKeywords?: string[];
  pageContent?: { [key:string]: string };
}

interface LoadingStates {
  [key: string]: boolean;
}

// Constants for form options
const TONES = ["Profissional", "Amigável", "Humorístico", "Inspirador", "Informativo"];
const STYLES = ["Moderno e Minimalista", "Elegante e Sofisticado", "Vibrante e Energético", "Rústico e Orgânico", "Retrô e Divertido"];
const PAGES = ["Início", "Sobre Nós", "Serviços", "Blog", "Contato", "Galeria", "Preços"];
const CORNER_STYLES = ["Arredondados", "Afiados"];
const COMPLEXITY_LEVELS = ["Simples e Direto", "Interativo e Detalhado"];

const App: React.FC = () => {
    // State management
    const [formData, setFormData] = useState<PromptData>({
        projectName: '',
        niche: '',
        targetAudience: '',
        mainGoal: '',
        tone: 'Amigável',
        style: 'Moderno e Minimalista',
        selectedPages: ['Início', 'Sobre Nós', 'Contato'],
        cornerStyle: 'Arredondados',
        siteComplexity: 'Simples e Direto',
        hasLogo: false,
        seoKeywords: [],
        pageContent: {},
    });
    const [loadingStates, setLoadingStates] = useState<LoadingStates>({});
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showWelcome, setShowWelcome] = useState(true);
    const [openAccordion, setOpenAccordion] = useState('basics');
    const [urlToAnalyze, setUrlToAnalyze] = useState('');
    const [copied, setCopied] = useState(false);
    
    const promptRef = useRef<HTMLDivElement>(null);
    
    // Toast auto-hide effect
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [toast]);
    
    // Copy button state reset
    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const setLoading = (key: string, value: boolean) => {
        setLoadingStates(prev => ({ ...prev, [key]: value }));
    };

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (page: string) => {
        setFormData(prev => {
            const selectedPages = prev.selectedPages.includes(page)
                ? prev.selectedPages.filter(p => p !== page)
                : [...prev.selectedPages, page];
            return { ...prev, selectedPages };
        });
    };
    
    const handleRadioChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAnalyzeUrl = useCallback(async () => {
        if (!urlToAnalyze) {
            showToast('error', 'Por favor, insira uma URL para analisar.');
            return;
        }
        setLoading('analyzingUrl', true);
        try {
            const data = await analyzeUrl(urlToAnalyze);
            setFormData(prev => ({
                ...prev,
                ...data,
                selectedPages: data.selectedPages || prev.selectedPages, // Keep default if not returned
            }));
            showToast('success', 'URL analisada e formulário preenchido com sucesso!');
            setOpenAccordion('basics');
        } catch (error: any) {
            showToast('error', error.message || 'Falha ao analisar a URL.');
        } finally {
            setLoading('analyzingUrl', false);
        }
    }, [urlToAnalyze]);

    const handleGenerateInspiration = useCallback(async (fieldName: string) => {
        const context = `Nicho: ${formData.niche}, Público-alvo: ${formData.targetAudience}`;
        setLoading(`inspiring_${fieldName}`, true);
        try {
            const suggestions = await generateInspiration(fieldName, context);
            if (suggestions.length > 0) {
                setFormData(prev => ({ ...prev, [fieldName]: suggestions[0] }));
                showToast('success', `Sugestão para '${fieldName}' gerada!`);
            }
        } catch (error: any) {
            showToast('error', error.message || `Não foi possível gerar sugestão para ${fieldName}.`);
        } finally {
            setLoading(`inspiring_${fieldName}`, false);
        }
    }, [formData.niche, formData.targetAudience]);

    const handleGeneratePalette = useCallback(async () => {
        setLoading('generatingPalette', true);
        try {
            const palette = await generateColorPalette(formData.niche, formData.style);
            setFormData(prev => ({ ...prev, colors: palette }));
            showToast('success', 'Paleta de cores gerada com sucesso!');
        } catch (error: any) {
            showToast('error', error.message || 'Falha ao gerar paleta de cores.');
        } finally {
            setLoading('generatingPalette', false);
        }
    }, [formData.niche, formData.style]);

    const handleGenerateKeywords = useCallback(async () => {
        setLoading('generatingKeywords', true);
        try {
            const keywords = await generateSeoKeywords(formData.niche, formData.targetAudience);
            setFormData(prev => ({ ...prev, seoKeywords: keywords }));
            showToast('success', 'Palavras-chave de SEO geradas!');
        } catch (error: any) {
            showToast('error', error.message || 'Falha ao gerar palavras-chave.');
        } finally {
            setLoading('generatingKeywords', false);
        }
    }, [formData.niche, formData.targetAudience]);

    const handleGeneratePageContent = useCallback(async (pageName: string) => {
        setLoading(`generatingContent_${pageName}`, true);
        const context = `Gere conteúdo para a página '${pageName}' de um site sobre '${formData.niche}' para '${formData.targetAudience}' com um tom '${formData.tone}'. O objetivo principal do site é '${formData.mainGoal}'`;
        try {
            const content = await generatePageContent(pageName, context);
            setFormData(prev => ({
                ...prev,
                pageContent: { ...prev.pageContent, [pageName]: content },
            }));
            showToast('success', `Conteúdo para '${pageName}' gerado!`);
        } catch (error: any) {
            showToast('error', error.message || `Falha ao gerar conteúdo para ${pageName}.`);
        } finally {
            setLoading(`generatingContent_${pageName}`, false);
        }
    }, [formData.niche, formData.targetAudience, formData.tone, formData.mainGoal]);

    const handleGenerateLogo = useCallback(async () => {
        setLoading('generatingLogo', true);
        const prompt = `Crie um logo moderno e minimalista para uma empresa chamada "${formData.projectName}" no nicho de "${formData.niche}". Estilo: ${formData.style}. Cores principais: ${formData.colors?.primary || 'preto'} e ${formData.colors?.accent || 'azul'}. O logo deve ser simples, icônico e em fundo branco.`;
        try {
            const imageB64 = await generateLogoSuggestion(prompt);
            setFormData(prev => ({ ...prev, logoSuggestion: imageB64, hasLogo: true }));
            showToast('success', 'Sugestão de logo gerada!');
        } catch (error: any) {
            showToast('error', error.message || 'Falha ao gerar sugestão de logo.');
        } finally {
            setLoading('generatingLogo', false);
        }
    }, [formData.projectName, formData.niche, formData.style, formData.colors]);

    const handleGeneratePrompt = async () => {
        setLoading('generatingPrompt', true);
        setGeneratedPrompt('');
        try {
            const stream = generateWebsitePromptStream(formData);
            for await (const chunk of stream) {
                setGeneratedPrompt(prev => prev + chunk);
                promptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        } catch (error: any) {
            showToast('error', error.message || 'Ocorreu um erro ao gerar o prompt.');
        } finally {
            setLoading('generatingPrompt', false);
        }
    };
    
    const handleCopyPrompt = () => {
        if (generatedPrompt) {
            navigator.clipboard.writeText(generatedPrompt);
            setCopied(true);
        }
    };

    const renderPageContentFields = () => {
        return formData.selectedPages.map(page => (
            <div key={page} className="mt-4">
                <FormField
                  label={`Conteúdo para: ${page}`}
                  onInspire={() => handleGeneratePageContent(page)}
                  loading={loadingStates[`generatingContent_${page}`]}
                >
                    <textarea
                        name={`pageContent_${page}`}
                        value={formData.pageContent?.[page] || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, pageContent: { ...prev.pageContent, [page]: e.target.value }}))}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        rows={5}
                        placeholder={`Clique na lâmpada para gerar um rascunho com IA ou escreva o conteúdo aqui...`}
                    />
                </FormField>
            </div>
        ));
    };

    return (
        <div className="bg-slate-900 text-slate-100 min-h-screen font-sans">
            {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
            
            <main className="max-w-7xl mx-auto p-4 md:p-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-slate-100">Gerador de Prompt para Website</h1>
                    <p className="text-slate-400 mt-2">Use o poder da IA Gemini para criar um briefing detalhado para o seu próximo site.</p>
                </header>

                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 mb-8">
                    <h2 className="text-lg font-semibold text-slate-200 mb-3">Analisar um site existente</h2>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                         <div className="relative flex-grow w-full">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="url"
                                value={urlToAnalyze}
                                onChange={(e) => setUrlToAnalyze(e.target.value)}
                                placeholder="https://exemplo.com"
                                className="w-full p-3 pl-10 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <button
                            onClick={handleAnalyzeUrl}
                            disabled={loadingStates.analyzingUrl}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 rounded-md transition-colors font-semibold"
                        >
                            {loadingStates.analyzingUrl ? <LoadingSpinner /> : <AiIcon />}
                            <span>Analisar URL</span>
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form Column */}
                    <div className="flex flex-col gap-4">
                        <Accordion id="basics" title="1. Informações Básicas" isOpen={openAccordion === 'basics'} setIsOpen={setOpenAccordion}>
                            <div className="p-6 space-y-6">
                                <FormField label="Nome do Projeto/Negócio" onInspire={() => handleGenerateInspiration('projectName')} loading={loadingStates.inspiring_projectName}>
                                    <input type="text" name="projectName" value={formData.projectName} onChange={handleInputChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                                </FormField>
                                <FormField label="Nicho de Mercado" onInspire={() => handleGenerateInspiration('niche')} loading={loadingStates.inspiring_niche}>
                                    <input type="text" name="niche" value={formData.niche} onChange={handleInputChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                                </FormField>
                                <FormField label="Público-Alvo" onInspire={() => handleGenerateInspiration('targetAudience')} loading={loadingStates.inspiring_targetAudience}>
                                    <input type="text" name="targetAudience" value={formData.targetAudience} onChange={handleInputChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                                </FormField>
                                <FormField label="Principal Objetivo do Site (CTA)" onInspire={() => handleGenerateInspiration('mainGoal')} loading={loadingStates.inspiring_mainGoal}>
                                    <input type="text" name="mainGoal" value={formData.mainGoal} onChange={handleInputChange} placeholder="Ex: Agendar uma demonstração" className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                                </FormField>
                            </div>
                        </Accordion>
                        
                        <Accordion id="design" title="2. Design e Estilo" isOpen={openAccordion === 'design'} setIsOpen={setOpenAccordion}>
                            <div className="p-6 space-y-6">
                                <FormField label="Tom de Voz">
                                    <select name="tone" value={formData.tone} onChange={handleInputChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                                        {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Estilo Visual">
                                    <select name="style" value={formData.style} onChange={handleInputChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                                        {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </FormField>

                                <div className="space-y-2">
                                    <h3 className="block text-slate-300 font-semibold">Paleta de Cores</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-2">
                                            <div className="h-10 w-10 rounded-md border-2 border-slate-600" style={{ backgroundColor: formData.colors?.primary || '#334155' }}></div>
                                            <div className="h-10 w-10 rounded-md border-2 border-slate-600" style={{ backgroundColor: formData.colors?.secondary || '#475569' }}></div>
                                            <div className="h-10 w-10 rounded-md border-2 border-slate-600" style={{ backgroundColor: formData.colors?.accent || '#6366f1' }}></div>
                                            <div className="h-10 w-10 rounded-md border-2 border-slate-600" style={{ backgroundColor: formData.colors?.neutral || '#1e293b' }}></div>
                                        </div>
                                        <button onClick={handleGeneratePalette} disabled={loadingStates.generatingPalette} className="flex-grow flex items-center justify-center gap-2 p-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 rounded-md transition-colors text-sm">
                                            {loadingStates.generatingPalette ? <LoadingSpinner /> : <AiIcon />} Gerar Paleta
                                        </button>
                                    </div>
                                </div>
                                
                                <FormField label="Estilo dos Cantos">
                                    <div className="flex gap-4">
                                        {CORNER_STYLES.map(cs => (
                                            <label key={cs} className="flex items-center gap-2 text-slate-300">
                                                <input type="radio" name="cornerStyle" value={cs} checked={formData.cornerStyle === cs} onChange={(e) => handleRadioChange('cornerStyle', e.target.value)} className="form-radio bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500" />
                                                {cs}
                                            </label>
                                        ))}
                                    </div>
                                </FormField>

                                <FormField label="Complexidade do Site">
                                    <div className="flex gap-4">
                                        {COMPLEXITY_LEVELS.map(cl => (
                                            <label key={cl} className="flex items-center gap-2 text-slate-300">
                                                <input type="radio" name="siteComplexity" value={cl} checked={formData.siteComplexity === cl} onChange={(e) => handleRadioChange('siteComplexity', e.target.value)} className="form-radio bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500" />
                                                {cl}
                                            </label>
                                        ))}
                                    </div>
                                </FormField>
                            </div>
                        </Accordion>
                        
                        <Accordion id="content" title="3. Conteúdo e SEO" isOpen={openAccordion === 'content'} setIsOpen={setOpenAccordion}>
                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-slate-300 font-semibold">Páginas do Site</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {PAGES.map(page => (
                                            <label key={page} className="flex items-center gap-2 bg-slate-700/50 p-2 rounded-md">
                                                <input type="checkbox" checked={formData.selectedPages.includes(page)} onChange={() => handleCheckboxChange(page)} className="form-checkbox bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500 rounded" />
                                                <span>{page}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {renderPageContentFields()}

                                <div className="space-y-2">
                                    <h3 className="block text-slate-300 font-semibold">SEO Keywords</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.seoKeywords?.map((kw, i) => <span key={i} className="bg-slate-700 text-sm px-2 py-1 rounded-full">{kw}</span>)}
                                    </div>
                                    <button onClick={handleGenerateKeywords} disabled={loadingStates.generatingKeywords} className="w-full mt-2 flex items-center justify-center gap-2 p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 rounded-md transition-colors text-sm">
                                        {loadingStates.generatingKeywords ? <LoadingSpinner /> : <AiIcon />} Gerar Keywords
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="block text-slate-300 font-semibold">Logo</h3>
                                    <label className="flex items-center gap-2 text-slate-300">
                                      <input type="checkbox" name="hasLogo" checked={formData.hasLogo} onChange={(e) => setFormData(prev => ({...prev, hasLogo: e.target.checked }))} className="form-checkbox bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500 rounded" />
                                      <span>Já tenho um logo (ou quero gerar uma sugestão)</span>
                                    </label>
                                    {formData.hasLogo && (
                                        <div className="pt-2 text-center">
                                          {formData.logoSuggestion ? (
                                            <img src={`data:image/png;base64,${formData.logoSuggestion}`} alt="Sugestão de logo" className="mx-auto h-24 w-auto bg-white p-2 rounded-md" />
                                          ) : (
                                            <div className="h-24 w-full bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-md flex items-center justify-center text-slate-400">
                                              Sugestão de logo aparecerá aqui
                                            </div>
                                          )}
                                          <button onClick={handleGenerateLogo} disabled={loadingStates.generatingLogo} className="w-full mt-2 flex items-center justify-center gap-2 p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 rounded-md transition-colors text-sm">
                                              {loadingStates.generatingLogo ? <LoadingSpinner /> : <AiIcon />} Gerar Sugestão de Logo
                                          </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Accordion>
                    </div>
                    
                    {/* Output Column */}
                    <div className="sticky top-8 self-start flex flex-col gap-4">
                       <button
                           onClick={handleGeneratePrompt}
                           disabled={loadingStates.generatingPrompt}
                           className="w-full p-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 rounded-lg transition-colors font-bold text-lg flex items-center justify-center gap-3"
                       >
                           {loadingStates.generatingPrompt ? <LoadingSpinner /> : <AiIcon />}
                           <span>Gerar Prompt</span>
                       </button>

                        <div className="bg-slate-800 border border-slate-700 rounded-lg min-h-[300px] max-h-[80vh] overflow-y-auto">
                            <div className="sticky top-0 bg-slate-800/80 backdrop-blur-sm p-3 border-b border-slate-700 flex justify-between items-center">
                                <h2 className="font-semibold text-slate-200">Seu Prompt Gerado</h2>
                                <button
                                    onClick={handleCopyPrompt}
                                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                                >
                                    {copied ? <CheckIcon /> : <ClipboardIcon />}
                                    {copied ? 'Copiado!' : 'Copiar'}
                                </button>
                            </div>
                            <div ref={promptRef} className="p-6 prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-headings:text-slate-100 prose-strong:text-slate-100">
                                {generatedPrompt ? (
                                  <pre className="whitespace-pre-wrap font-sans">{generatedPrompt}</pre>
                                ) : (
                                  <p className="text-slate-400 text-center py-10">
                                    Preencha o formulário e clique em "Gerar Prompt" para ver o resultado aqui.
                                  </p>  
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            {toast && (
                <div className="fixed bottom-5 right-5 z-50">
                    <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
                </div>
            )}
        </div>
    );
};

export default App;
