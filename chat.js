// ===========================
// CONFIGURAÇÃO
// ===========================
const API = "https://script.google.com/macros/s/AKfycbwsys1T5bqDyr4YhZ68UWCQKdrQakTxownmph-uk-zzj5FvbXkrDTiKOMJqARKxxoYhLQ/exec"; // coloque sua URL do Apps Script
let usuarioAtual = localStorage.getItem("usuario") || "visitante";
let chatAtual = null;

// ===========================
// CARREGAR USUÁRIO
// ===========================
document.getElementById("usuarioAtual").innerText = usuarioAtual;

// ===========================
// MENU DE 3 PONTOS
// ===========================
function toggleMenu() {
  const menu = document.getElementById("menuOpcoes");
  menu.style.display = menu.style.display === "none" ? "block" : "none";
}

// ===========================
// CARREGAR CONTATOS
// ===========================
async function carregarContatos() {
  const resp = await fetch(`${API}?tipo=contatos&usuario=${usuarioAtual}`);
  const contatos = await resp.json();

  const div = document.getElementById("listaContatos");
  div.innerHTML = "";

  contatos.forEach(c => {
    const b = document.createElement("button");
    b.textContent = c;
    b.onclick = () => abrirChat(c);
    div.appendChild(b);
    div.appendChild(document.createElement("br"));
  });
}

carregarContatos();

// ===========================
// POP-UP ADICIONAR CONTATO
// ===========================
function abrirAdicionarContato() {
  document.getElementById("popupAdicionar").style.display = "block";
}

function fecharAdicionarContato() {
  document.getElementById("popupAdicionar").style.display = "none";
}

async function confirmarAdicionarContato() {
  const contato = document.getElementById("novoContato").value.replace("@", "").trim();

  const resp = await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      tipo: "adicionarContato",
      usuario: usuarioAtual,
      contato
    })
  });

  const r = await resp.json();
  alert(r.mensagem);

  if (r.status === "ok") {
    carregarContatos();
    fecharAdicionarContato();
  }
}

// ===========================
// ABRIR CHAT
// ===========================
async function abrirChat(contato) {
  chatAtual = contato;

  document.getElementById("msg").disabled = false;
  document.getElementById("btnEnviar").disabled = false;
  document.getElementById("btnChamar").disabled = false;

  atualizarTitulo();
  carregarMensagens();
}

// ===========================
// ATUALIZAR TÍTULO DO CHAT
// ===========================
async function atualizarTitulo() {
  if (!chatAtual) return;

  const resp = await fetch(`${API}?tipo=status&usuario=${chatAtual}`);
  const st = await resp.json();

  let emoji = "🔴 Offline";
  if (st.status === "online") emoji = "🟢 Online";
  if (st.status === "digitando") emoji = "💬 Digitando...";

  document.getElementById("tituloChat").innerText =
    `Chat com @${chatAtual} - ${emoji}`;
}

// ===========================
// CARREGAR MENSAGENS
// ===========================
async function carregarMensagens() {
  if (!chatAtual) return;

  const resp = await fetch(`${API}?tipo=chat&user1=${usuarioAtual}&user2=${chatAtual}`);
  const msgs = await resp.json();

  const area = document.getElementById("areaMensagens");
  area.innerHTML = "";

  msgs.forEach(m => {
    const p = document.createElement("p");
    p.textContent = `${m.data} - ${m.remetente}: ${m.mensagem}`;
    area.appendChild(p);
  });

  area.scrollTop = area.scrollHeight;

  atualizarTitulo();
}

setInterval(carregarMensagens, 2000);

// ===========================
// ENVIAR MENSAGEM
// ===========================
async function enviarMensagem() {
  const texto = document.getElementById("msg").value.trim();
  if (!texto) return;

  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      tipo: "enviarMensagem",
      remetente: usuarioAtual,
      destinatario: chatAtual,
      mensagem: texto
    })
  });

  document.getElementById("msg").value = "";
  carregarMensagens();
}

// ===========================
// CHAMAR (BIP BIP BIP)
// ===========================
async function chamarUsuario() {
  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      tipo: "chamar",
      remetente: usuarioAtual,
      destinatario: chatAtual
    })
  });

  alert("📢 Chamando... (BIP BIP BIP enviado!)");
}

// ===========================
// Limpar conversa
// ===========================
async function limparConversa() {
  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      tipo: "limparChat",
      user1: usuarioAtual,
      user2: chatAtual
    })
  });

  alert("Conversa apagada!");
  carregarMensagens();
}

// ===========================
// Apagar contato
// ===========================
async function apagarContato() {
  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      tipo: "removerContato",
      usuario: usuarioAtual,
      contato: chatAtual
    })
  });

  alert("Contato removido!");
  carregarContatos();
}

// ===========================
// Bloquear contato
// ===========================
async function bloquearContato() {
  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      tipo: "bloquear",
      usuario: usuarioAtual,
      contato: chatAtual
    })
  });

  alert("Contato bloqueado!");
}
