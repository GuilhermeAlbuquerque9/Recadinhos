# 💌 Recadinhos™

**Recadinhos™** é uma rede social retrô criada pela **Retropixel™** em 2025.  
Feita com amor, HTML puro e um toque dos anos 1990 — simples, nostálgica e funcional de verdade.  
Aqui, as pessoas trocam mensagens curtas, os famosos *recadinhos*, mencionam amigos com `@nomes`, e revivem o espírito da Internet clássica. 💾

---

## 🌐 Como funciona

O **Recadinhos™** é 100% estático (HTML + JS), mas conectado a um banco de dados **Google Sheets** via Google Apps Script.  
Isso permite que:
- 🗣️ Todos os usuários vejam e publiquem recados reais;
- 🧑‍🤝‍🧑 Mensagens com `@nomes` apareçam apenas para o destinatário;
- 💾 Tudo fique salvo para sempre, como nos velhos tempos!

---

## 🧱 Estrutura do projeto

Recadinhos/
│
├─ index.html
├─ Criar_conta.html
├─ Postagens.html
├─ Sobre.html
├─ Sair.html
│

---

## 🚀 Hospedagem

O site roda diretamente pelo **GitHub Pages**, sem servidor adicional.  
A persistência de dados acontece através da API do **Google Apps Script**, que interage com uma planilha pública do Google Sheets.

Para fazer o seu próprio:
1. Crie uma planilha com abas **contas** e **recadinhos**.  
2. Cole o script `doGet/doPost` no Google Apps Script.  
3. Implante como “Aplicativo da Web” com acesso para “Qualquer pessoa”.  
4. Cole o link da API onde aparece  
   `🔗 COLE SUA API AQUI!` nos arquivos HTML.

---

## ✨ Créditos

- 👨‍💻 Criado por **Retropixel™**
- 📆 Lançado em **20 de outubro de 2025**
- 💬 Inspirado nas redes sociais dos anos 1990 e 2000
- 🔧 Desenvolvido com **HTML**, **JavaScript** e **Google Sheets API**

---

## 📜 Licença

Este projeto está licenciado a partir da Licensa MIT. Não copie o Recadinhos™ ou a Retropixel™.
**© Retropixel™, 2025. Todos os direitos reservados.**
