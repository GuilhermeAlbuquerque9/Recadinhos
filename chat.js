const API = "https://script.google.com/macros/s/AKfycbz1zlMYQggxsOhJr8ZHYyUo2tB2I_hwNk2nfWgZ6OQl9_38aNVpAyJGCJ-lUZHth_mbCA/exec";

let usuarioAtual = localStorage.getItem("usuario");
document.getElementById("usuarioAtual").innerText = usuarioAtual;

let chatCom = null;
let intervaloChat = null;

// -----------------------------
// Listar contatos
// -----------------------------
function carregarContatos() {
  fetch(API + "?tipo=contas")
    .then(r => r.json())
    .then(contas => {
      let lista = document.getElementById("listaContatos");
      lista.innerHTML = "";

      contas.forEach(c => {
        if (c.usuario === usuarioAtual) return;

        lista.innerHTML += `<p>
          <button onclick="abrirChat('${c.usuario}')">@${c.usuario}</button>
        </p>`;
      });
    });
}

carregarContatos();

// -----------------------------
// Abrir chat
// -----------------------------
function abrirChat(contato) {
  chatCom = contato;

  document.getElementById("tituloChat").innerHTML = "Chat com @" + contato;
  document.getElementById("msg").disabled = false;
  document.getElementById("btnEnviar").disabled = false;
  document.getElementById("btnChamar").disabled = false;

  carregarMensagens();

  if (intervaloChat) clearInterval(intervaloChat);
  intervaloChat = setInterval(carregarMensagens, 2000);
}

// -----------------------------
// Carregar mensagens
// -----------------------------
function carregarMensagens() {
  if (!chatCom) return;

  fetch(API + "?tipo=chat&user1=" + usuarioAtual + "&user2=" + chatCom)
    .then(r => r.json())
    .then(msgs => {
      let area = document.getElementById("areaMensagens");
      area.innerHTML = "";

      msgs.forEach(m => {
        area.innerHTML += `<p><b>@${m.remetente}:</b> ${m.mensagem}</p>`;
      });

      area.scrollTop = area.scrollHeight;
    });
}

// -----------------------------
// Enviar mensagem
// -----------------------------
function enviarMensagem() {
  const texto = document.getElementById("msg").value.trim();
  if (texto === "") return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      tipo: "enviarMensagem",
      remetente: usuarioAtual,
      destinatario: chatCom,
      mensagem: texto
    })
  });

  document.getElementById("msg").value = "";
  carregarMensagens();
}

// -----------------------------
// Pop-up adicionar contato
// -----------------------------
function abrirAdicionarContato() {
  document.getElementById("popupAdicionar").style.display = "block";
}

function fecharAdicionarContato() {
  document.getElementById("popupAdicionar").style.display = "none";
}

function confirmarAdicionarContato() {
  const user = document.getElementById("novoContato").value.replace("@", "");
  if (!user) return;

  // basta recarregar a lista
  carregarContatos();
  fecharAdicionarContato();
}

// -----------------------------
// Chamar usuário (📢 BIP BIP BIP)
// -----------------------------
function chamarUsuario() {
  alert("📢 Chamando @" + chatCom + "… (simulação por enquanto)");
}
