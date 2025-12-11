// ==============================
// Chat.js — Recadinhos™ 3.0
// ==============================

const API_URL = "https://script.google.com/macros/s/AKfycbx0Z1sH7sn_aKOM-0f1bb7rOU6pmi4qUvFx_QceT7mVRRRsquPbBgVOl7r1_bvsk-q0nQ/exec"; // Coloque aqui sua API do Apps Script
let usuarioAtual = sessionStorage.getItem("usuario") || "";
let contatoSelecionado = null;

// ==============================
// Inicialização
// ==============================
document.getElementById("usuarioAtual").innerText = usuarioAtual;

carregarContatos();
setInterval(atualizarStatusContato, 5000);
setInterval(atualizarMensagens, 3000);
setInterval(verificarChamadas, 3000);

// ==============================
// Contatos
// ==============================
function carregarContatos() {
  fetch(`${API_URL}?tipo=contas`)
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("listaContatos");
      lista.innerHTML = "";
      data.forEach(contato => {
        if (contato.usuario !== usuarioAtual) {
          const div = document.createElement("div");
          div.innerHTML = `<button onclick="selecionarContato('${contato.usuario}')">@${contato.usuario}</button>`;
          lista.appendChild(div);
        }
      });
    });
}

function abrirAdicionarContato() {
  document.getElementById("popupAdicionar").style.display = "block";
}

function fecharAdicionarContato() {
  document.getElementById("popupAdicionar").style.display = "none";
}

function confirmarAdicionarContato() {
  const novoContato = document.getElementById("novoContato").value.trim();
  if (novoContato && novoContato !== usuarioAtual) {
    alert(`Contato adicionado: ${novoContato}`);
    fecharAdicionarContato();
  }
}

// ==============================
// Seleção de contato
// ==============================
function selecionarContato(usuario) {
  contatoSelecionado = usuario;
  document.getElementById("tituloChat").innerText = `Chat com @${usuario}`;
  document.getElementById("msg").disabled = false;
  document.getElementById("btnEnviar").disabled = false;
  document.getElementById("btnChamar").disabled = false;
  atualizarMensagens();
  atualizarStatusContato();
}

// ==============================
// Mensagens
// ==============================
function atualizarMensagens() {
  if (!contatoSelecionado) return;

  fetch(`${API_URL}?tipo=chat&user1=${usuarioAtual}&user2=${contatoSelecionado}`)
    .then(res => res.json())
    .then(data => {
      const area = document.getElementById("areaMensagens");
      area.innerHTML = "";
      data.forEach(m => {
        const div = document.createElement("div");
        div.innerHTML = `<strong>@${m.remetente}:</strong> ${m.mensagem} <small>(${m.data})</small>`;
        area.appendChild(div);
      });
      area.scrollTop = area.scrollHeight;
    });
}

function enviarMensagem() {
  const mensagem = document.getElementById("msg").value.trim();
  if (!mensagem || !contatoSelecionado) return;

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      tipo: "enviarMensagem",
      remetente: usuarioAtual,
      destinatario: contatoSelecionado,
      mensagem: mensagem
    })
  }).then(() => {
    document.getElementById("msg").value = "";
    atualizarMensagens();
  });
}

// ==============================
// Status
// ==============================
function atualizarStatusContato() {
  if (!contatoSelecionado) return;

  fetch(`${API_URL}?tipo=status&usuario=${contatoSelecionado}`)
    .then(res => res.json())
    .then(data => {
      const statusDiv = document.getElementById("statusUsuario");
      let emoji = "🔴"; // offline
      if (data.status === "Online") emoji = "🟢";
      else if (data.status === "Digitando...") emoji = "💬";
      statusDiv.innerText = `Chat com @${contatoSelecionado} - ${emoji} ${data.status || "Offline"}`;
    });
}

// ==============================
// Chamadas
// ==============================
function chamarUsuario() {
  if (!contatoSelecionado) return;

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      tipo: "chamar",
      remetente: usuarioAtual,
      destinatario: contatoSelecionado
    })
  }).then(() => {
    alert(`Chamando @${contatoSelecionado}... 📢`);
  });
}

function verificarChamadas() {
  fetch(`${API_URL}?tipo=chamadas&usuario=${usuarioAtual}`)
    .then(res => res.json())
    .then(data => {
      data.forEach(c => {
        if (c.status === "tocando") {
          alert(`@${c.remetente} está chamando você! 📢`);
        }
      });
    });
}

// ==============================
// Digitando
// ==============================
document.getElementById("msg").addEventListener("input", () => {
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      tipo: "status",
      usuario: usuarioAtual,
      status: document.getElementById("msg").value ? "Digitando..." : "Online"
    })
  });
});
