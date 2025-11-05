// FIX: Provided full implementation for the WelcomeModal component.
import React from 'react';

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full p-8 border border-slate-700 animate-fade-in-scale">
        <h1 className="text-3xl font-bold text-slate-100 mb-4">Bem-vindo ao Gerador de Prompt de Website com IA</h1>
        <p className="text-slate-300 mb-6">
          Esta ferramenta utiliza a API Gemini do Google para transformar suas ideias em um prompt detalhado e estruturado para a criação de um website. Preencha o formulário com os detalhes do seu projeto, e a IA irá gerar um briefing completo que pode ser usado por qualquer construtor de sites.
        </p>
        <div className="space-y-4 text-slate-400">
            <p>
                <strong>Como funciona:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Preencha o formulário:</strong> Forneça informações sobre o seu projeto, como nome, nicho, público-alvo e estilo desejado.</li>
                <li><strong>Gere o prompt:</strong> Clique em "Gerar Prompt" para que a IA crie um briefing detalhado.</li>
                <li><strong>Copie e use:</strong> Copie o prompt gerado e use-o em sua ferramenta de construção de sites favorita para dar vida à sua visão.</li>
            </ul>
             <p className="mt-4 pt-4 border-t border-slate-700 text-sm">
                <strong>Novidade:</strong> Agora você pode analisar uma URL existente! A IA extrairá informações do site para preencher o formulário automaticamente.
            </p>
        </div>
        <button
          onClick={onClose}
          className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Começar a Criar
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;
