// ================================================
// CONFIGURAÇÃO
// ================================================
const API = "https://script.google.com/macros/s/AKfycbymTI7GrsOwifJQGlfa9EA99HldnVDBSMYjFcRCU3P9n1N80Q1oPRRQzi4XHizPdDIokw/exec"; // <-- coloque sua URL do Apps Script publicado

let usuarioLogado = localStorage.getItem("usuario");
let contatoAtual = null;
let intervaloChat = null;

// ================================================
// INICIALIZAÇÃO
// ================================================
window.onload = () => {
  document.getElementById("usuarioAtual").innerText = usuarioLogado ?? "???";
  carregarContatos();
  atualizarStatus("online");
  setInterval(() => atualizarStatus("online"), 15000);
  setInterval(verificarChamadas, 2000);
};

// ================================================
// STATUS
// ================================================
function atualizarStatus(status) {
  if (!usuarioLogado) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      tipo: "status",
      usuario: usuarioLogado,
      status
    })
  });
}

// ================================================
// CONTATOS
// ================================================
function carregarContatos() {
  const contasDiv = document.getElementById("listaContatos");
  contasDiv.innerHTML = "<i>Carregando...</i>";

  fetch(API + "?tipo=contas")
    .then(res => res.json())
    .then(contas => {
      contasDiv.innerHTML = "";

      contas.forEach(c => {
        if (c.usuario === usuarioLogado) return;

        const btn = document.createElement("button");
        btn.style.display = "block";
        btn.style.margin = "5px 0";
        btn.textContent = "@" + c.usuario;
        btn.onclick = () => abrirChat(c.usuario);

        contasDiv.appendChild(btn);
      });
    });
}

// ================================================
// POP-UP ADICIONAR CONTATO
// (Na prática, só aparece na lista — não cria na planilha)
// ================================================
function abrirAdicionarContato() {
  document.getElementById("popupAdicionar").style.display = "block";
}

function fecharAdicionarContato() {
  document.getElementById("popupAdicionar").style.display = "none";
}

function confirmarAdicionarContato() {
  alert("🔧 Ainda não implementado (contatos automáticos já funcionam).");
  fecharAdicionarContato();
}

// ================================================
// ABRIR CHAT COM ALGUÉM
// ================================================
function abrirChat(usuario) {
  contatoAtual = usuario;

  document.getElementById("tituloChat").innerText = "Chat com @" + usuario;

  document.getElementById("msg").disabled = false;
  document.getElementById("btnEnviar").disabled = false;
  document.getElementById("btnChamar").disabled = false;

  carregarMensagens();

  if (intervaloChat) clearInterval(intervaloChat);
  intervaloChat = setInterval(carregarMensagens, 1500);

  carregarStatusContato();
  setInterval(carregarStatusContato, 3000);
}

// ================================================
// CARREGAR STATUS DO CONTATO
// ================================================
function carregarStatusContato() {
  if (!contatoAtual) return;

  fetch(API + "?tipo=status&usuario=" + contatoAtual)
    .then(res => res.json())
    .then(status => {
      let texto = "Status: ";

      if (status.status === "digitando") texto += "💬 Digitando...";
      else if (status.status === "online") texto += "🟢 Online";
      else texto += "⚫ Offline";

      document.getElementById("statusUsuario").innerText = texto;
    });
}

// ================================================
// CARREGAR MENSAGENS
// ================================================
function carregarMensagens() {
  if (!contatoAtual) return;

  fetch(`${API}?tipo=chat&user1=${usuarioLogado}&user2=${contatoAtual}`)
    .then(res => res.json())
    .then(msgs => {
      const area = document.getElementById("areaMensagens");
      area.innerHTML = "";

      msgs.forEach(m => {
        const div = document.createElement("div");
        div.style.marginBottom = "8px";

        div.innerHTML = `<strong>@${m.remetente}</strong>: ${m.mensagem}<br><small>${m.data}</small>`;

        area.appendChild(div);
      });

      area.scrollTop = area.scrollHeight;
    })
    .catch(() => console.warn("Erro ao carregar mensagens"));
}

// ================================================
// ENVIAR MENSAGEM
// ================================================
function enviarMensagem() {
  const texto = document.getElementById("msg").value.trim();
  if (texto === "" || !contatoAtual) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      tipo: "enviarMensagem",
      remetente: usuarioLogado,
      destinatario: contatoAtual,
      mensagem: texto
    })
  })
    .then(res => res.json())
    .then(() => {
      document.getElementById("msg").value = "";
      atualizarStatus("online");
      carregarMensagens();
    });
}

// Detectar "digitando..."
document.getElementById("msg").addEventListener("input", () => {
  if (!contatoAtual) return;
  atualizarStatus("digitando");

  setTimeout(() => atualizarStatus("online"), 2000);
});

// ================================================
// CHAMAR USUÁRIO (BIP BIP BIP)
// ================================================
function chamarUsuario() {
  if (!contatoAtual) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      tipo: "chamar",
      remetente: usuarioLogado,
      destinatario: contatoAtual
    })
  });

  alert("📢 Chamando @" + contatoAtual + "...");
}

// Receber chamadas
function verificarChamadas() {
  fetch(API + "?tipo=chamadas&usuario=" + usuarioLogado)
    .then(res => res.json())
    .then(chamadas => {
      chamadas.forEach(c => {
        if (c.status === "tocando") {
          alert("📢 @" + c.remetente + " está chamando você!");
        }
      });
    });
}
