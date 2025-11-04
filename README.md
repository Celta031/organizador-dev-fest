# Meu Organizador de Grade - DevFest 2025

Este projeto foi criado para ajudar os participantes do **DevFest 2025** a organizar e visualizar seu cronograma pessoal de forma interativa e intuitiva.

É um aplicativo web completo que permite montar uma grade personalizada com as palestras que você deseja assistir, salvar suas escolhas automaticamente, compartilhar com amigos e baixar o resultado como uma imagem PNG.

## 🚀 Como Usar

Acesse o site através do link do GitHub Pages: **https://celta031.github.io/organizador-dev-fest/**

### Funcionalidades Principais

1. **Escolha suas Palestras:** Na paleta à direita, navegue pelas palestras disponíveis, agrupadas por horário.
2. **Clique para Adicionar:** Ao clicar em uma palestra, ela será automaticamente adicionada ao seu template de grade no horário correspondente.
3. **Workshops:** Ao selecionar um "Workshop", ele ocupará automaticamente o espaço de dois slots de horário consecutivos.
4. **Remover Palestras:** Clique com o botão direito do mouse em qualquer palestra na grade para removê-la.
5. **Filtros e Busca:**
   - Use os botões de filtro para mostrar apenas palestras de uma trilha específica (Iniciante, Avançado, Carreiras, Workshop, WTM, Onfly)
   - Use o campo de busca para encontrar palestras por título ou trilha
   - Atalho: **Ctrl/Cmd + K** para focar no campo de busca
6. **Persistência Automática:** Suas escolhas são salvas automaticamente no navegador e serão restauradas quando você voltar.
7. **Compartilhamento:**
   - Clique em "Compartilhar" para gerar e copiar um link com sua grade
   - Compartilhe diretamente em redes sociais (quando disponível no dispositivo)
8. **Baixar Grade:** Clique no botão "Baixar Minha Grade" para salvar sua grade como uma imagem PNG.
9. **Limpar Tudo:** Use o botão "Limpar Tudo" para recomeçar do zero.

## ✨ Funcionalidades

### 🎯 Interface Intuitiva
- Design moderno e responsivo
- Feedback visual em todas as interações
- Animações suaves e profissionais
- Notificações toast para confirmações
- Loading spinner durante operações

### 🔍 Busca e Filtros Avançados
- Campo de busca em tempo real com debounce
- Filtros por trilha com um clique
- Destaque visual de palestras já selecionadas
- Normalização de texto (ignora acentos na busca)

### 💾 Persistência de Dados
- Salvamento automático no localStorage
- Suas escolhas nunca se perdem
- Carregamento automático ao retornar

### 🔗 Compartilhamento
- Geração de link compartilhável
- Codificação segura dos dados na URL
- Integração com Web Share API (quando disponível)
- Cópia automática para área de transferência

### ♿ Acessibilidade
- Navegação completa por teclado
- Atributos ARIA para leitores de tela
- Alto contraste seguindo WCAG
- Focus visível em todos os elementos interativos
- Textos alternativos em imagens

### 📱 Responsividade Total
- Layout adaptativo para desktop, tablet e mobile
- Otimizado para touch em dispositivos móveis
- Suporte a orientação landscape e portrait
- Media queries para diferentes tamanhos de tela

### 🎨 Experiência Visual
- Esquema de cores consistente
- Badges coloridas por trilha
- Indicadores visuais de slots ocupados
- Confirmações antes de ações destrutivas
- Modo escuro automático (se preferido pelo sistema)

### ⚡ Performance
- Código modular e organizado
- Debounce em operações de busca
- Validação de dados
- Tratamento robusto de erros
- Otimizado para captura de alta qualidade

## 🛠️ Tecnologias Utilizadas

* **HTML5** - Estrutura semântica e acessível
* **CSS3** - Variáveis CSS, Flexbox, Grid, Animações
* **JavaScript (ES6 Modules)** - Código modular e orientado a objetos
* **html2canvas.js** - Biblioteca para exportação de imagem
* **Web APIs**:
  - LocalStorage API
  - Clipboard API
  - Web Share API
  - Fetch API

## 📁 Estrutura do Projeto

```
organizador-dev-fest/
├── index.html              # Página principal
├── style.css               # Estilos globais
├── data/
│   └── talks.json         # Dados das palestras
├── js/
│   ├── app.js             # Aplicação principal
│   ├── constants.js       # Constantes da aplicação
│   ├── utils.js           # Funções utilitárias
│   ├── storage.js         # Gerenciamento de localStorage
│   └── ui.js              # Componentes de interface
└── assets/
    ├── template-base.png  # Template de fundo
    └── cards/             # Cards das palestras
```

## 🎨 Arquitetura do Código

O projeto foi desenvolvido seguindo boas práticas de desenvolvimento:

- **Modularização:** Código separado em módulos ES6 com responsabilidades bem definidas
- **Documentação:** Todas as funções possuem comentários JSDoc
- **Validação:** Validação de dados em todas as entradas
- **Tratamento de Erros:** Try/catch em operações críticas
- **Constantes:** Valores mágicos substituídos por constantes nomeadas
- **DRY:** Código reutilizável e sem repetições
- **Acessibilidade First:** ARIA e navegação por teclado nativos

## 🌐 Compatibilidade

- ✅ Chrome/Edge (versão 90+)
- ✅ Firefox (versão 88+)
- ✅ Safari (versão 14+)
- ✅ Opera (versão 76+)
- ✅ Navegadores mobile modernos

## 📝 Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

## ✨ Créditos

**Design Visual:** Todo o design, incluindo o template base e os cards de palestras, foi criado por **Júlia Roberta Souza**.
- **LinkedIn:** [linkedin.com/in/juliarobertasouza](https://www.linkedin.com/in/juliarobertasouza/)

**Desenvolvimento e Melhorias:** Código desenvolvido e aprimorado com foco em usabilidade, acessibilidade e performance por:
- **Lucelho Silva** - [linkedin.com/in/lucelhosilva](https://www.linkedin.com/in/lucelhosilva)
- **Wesley Raphael Martins** - [linkedin.com/in/wesleyraphaelmartins](https://www.linkedin.com/in/wesleyraphaelmartins)

## 🆕 Changelog

### Versão 2.1 (Atual)
- ✅ Design atualizado inspirado no Google Material Design
- ✅ Fundo branco limpo e minimalista
- ✅ Cores otimizadas para melhor contraste e legibilidade
- ✅ Interface simplificada focada em usabilidade com mouse

### Versão 2.0
- ✅ Persistência automática com localStorage
- ✅ Sistema de busca e filtros avançado
- ✅ Compartilhamento via URL
- ✅ Remoção individual de palestras
- ✅ Confirmações antes de ações destrutivas
- ✅ Atributos ARIA para acessibilidade
- ✅ Responsividade total (mobile/tablet/desktop)
- ✅ Feedback visual com toasts e animações
- ✅ Código modular e documentado
- ✅ Performance otimizada

### Versão 1.0
- Funcionalidade básica de montar grade
- Download como PNG
- Suporte a workshops

## 🐛 Reportar Problemas

Encontrou um bug ou tem uma sugestão? Abra uma [issue](https://github.com/celta031/organizador-dev-fest/issues) no GitHub!

---

Desenvolvido com dedicação para a comunidade DevFest! 🚀
