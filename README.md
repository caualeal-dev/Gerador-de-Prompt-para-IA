# Gerador de Prompt para Sites com IA 🚀

Uma ferramenta inteligente e interativa que usa a Google Gemini API para analisar sites existentes e gerar prompts detalhados para a criação de novos websites, economizando horas de planejamento e design.

<!-- Adicione um GIF ou Screenshot aqui! -->
![Demonstração do App](https://i.imgur.com/example.gif) 

## 🌟 Sobre o Projeto

Este aplicativo foi construído para resolver um desafio comum no desenvolvimento de sites: a criação de um briefing (ou prompt) completo e coeso. Em vez de começar do zero, esta ferramenta permite que usuários e desenvolvedores:

1.  **Analisem um site existente** para extrair automaticamente sua identidade visual e estrutura.
2.  **Preencham um formulário guiado** com a ajuda de sugestões de IA para todos os campos.
3.  **Gerem um prompt detalhado em Markdown** que pode ser usado com construtores de sites de IA ou como um guia para equipes de desenvolvimento e design.

## ✨ Funcionalidades (Features)

-   🤖 **Análise de Site por URL:** Cole a URL de um site de referência e deixe a IA preencher automaticamente o nicho, público-alvo, paleta de cores e mais.
-   ⚡️ **Geração de Prompt em Tempo Real:** Veja o prompt sendo criado palavra por palavra com a tecnologia de streaming da Gemini API.
-   💡 **Sugestões com IA:** Obtenha inspiração para o nicho, público-alvo e outros campos com um único clique.
-   🎨 **Design Assistido por IA:** Gere paletas de cores harmoniosas e sugestões de logos minimalistas com base no estilo do projeto.
-   📝 **Geração de Conteúdo:** Crie rascunhos de texto para páginas individuais (Sobre, Serviços, etc.) e gere palavras-chave de SEO relevantes.
-   💾 **Salvar e Carregar Progresso:** Salve todo o seu trabalho no navegador e continue de onde parou.
-   📄 **Exportar Resultados:** Exporte o prompt finalizado para os formatos **Markdown** e **PDF**.
-   👋 **Modal de Boas-vindas:** Uma introdução amigável para novos usuários, explicando as principais funcionalidades.

## 🛠️ Tecnologias Utilizadas

-   **Frontend:** React, TypeScript, Tailwind CSS
-   **IA:** Google Gemini API
-   **Exportação PDF:** jsPDF, html2canvas

## 🚀 Como Executar Localmente

Siga os passos abaixo para rodar o projeto na sua máquina.

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
    cd NOME_DO_REPOSITORIO
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    -   Crie um arquivo chamado `.env` na raiz do projeto.
    -   Adicione sua chave da Google Gemini API a este arquivo. Você pode obter uma chave em [Google AI Studio](https://aistudio.google.com/).
    ```
    API_KEY=SUA_CHAVE_API_AQUI
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    Abra [http://localhost:5173](http://localhost:5173) (ou a porta indicada no seu terminal) no seu navegador para ver a aplicação.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.
