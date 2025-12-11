// =======================================================
// CONFIGURAÇÃO
// =======================================================

const API = "https://script.google.com/macros/s/AKfycbzjhD_JXXA-Z37IUtmPTMT9674-AlvMEDwguq7Ua3N7bLjpd2SftfGlaQPZ7hqaB2iXMA/exec"; // <- coloque sua URL aqui

let usuarioAtual = localStorage.getItem("usuarioLogado");
let contatoAtual = null;
let bloqueados = []; // local only

// =======================================================
// INICIALIZAÇÃO
// =======================================================

  document.getElementById("usuarioAtual").innerText = usuarioAtual;

  carregarContatos();
  setInterval(() => {
    if (contatoAtual) carregarMensagens();
    if (contatoAtual) atualizarStatusContato();
  }, 2000);
};

// =======================================================
// 🟦 BUSCAR CONTATOS
// =======================================================

function carregarContatos() {
  fetch(`${API}?tipo=contatos&usuario=${usuarioAtual}`)
    .then(r => r.json())
    .then(lista => {
      const box = document.getElementById("listaContatos");
      box.innerHTML = "";

      lista.forEach(cont => {
        const div = document.createElement("div");
        div.style = "padding:10px; border-bottom:1px solid #ccc; cursor:pointer";
        div.innerText = cont;
        div.onclick = () => abrirChat(cont);
        box.appendChild(div);
      });
    });
}

// =======================================================
// 🟩 ADICIONAR CONTATO
// =======================================================

function abrirAdicionarContato() {
  document.getElementById("popupAdicionar").style.display = "block";
}

function fecharAdicionarContato() {
  document.getElementById("popupAdicionar").style.display = "none";
}

function confirmarAdicionarContato() {
  const contato = document.getElementById("novoContato").value.replace("@", "");

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      tipo: "adicionarContato",
      usuario: usuarioAtual,
      contato
    })
  })
    .then(r => r.json())
    .then(res => {
      alert(res.mensagem);
      if (res.status === "ok") {
        fecharAdicionarContato();
        carregarContatos();
      }
    });
}

// =======================================================
// 🟨 ABRIR CHAT
// =======================================================

function abrirChat(contato) {
  contatoAtual = contato;
  document.getElementById("tituloChat").innerText = `Chat com @${contato}`;
  document.getElementById("msg").disabled = false;
  document.getElementById("btnEnviar").disabled = false;
  document.getElementById("btnChamar").disabled = false;

  carregarMensagens();
  atualizarStatusContato();
}

// =======================================================
// 🟧 LER MENSAGENS
// =======================================================

function carregarMensagens() {
  fetch(`${API}?tipo=chat&user1=${usuarioAtual}&user2=${contatoAtual}`)
    .then(r => r.json())
    .then(msgs => {
      const area = document.getElementById("areaMensagens");
      area.innerHTML = "";

      msgs.forEach(linha => {
        const div = document.createElement("div");
        div.style = "margin-bottom:10px; padding:8px; border-radius:6px;";

        if (linha.remetente === usuarioAtual) {
          div.style.background = "#d0ffd0";
          div.innerHTML = `<strong>Você:</strong> ${linha.mensagem}<br><small>${linha.data}</small>`;
        } else {
          div.style.background = "#d0e0ff";
          div.innerHTML = `<strong>@${linha.remetente}:</strong> ${linha.mensagem}<br><small>${linha.data}</small>`;
        }

        area.appendChild(div);
      });

      area.scrollTop = area.scrollHeight;
    });
}

// =======================================================
// 🟥 ENVIAR MENSAGEM
// =======================================================

function enviarMensagem() {
  const texto = document.getElementById("msg").value.trim();
  if (!texto) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      tipo: "enviarMensagem",
      remetente: usuarioAtual,
      destinatario: contatoAtual,
      mensagem: texto
    })
  }).then(() => {
    document.getElementById("msg").value = "";
    carregarMensagens();
  });
}

// =======================================================
// 🟪 STATUS DO CONTATO
// =======================================================

function atualizarStatusContato() {
  fetch(`${API}?tipo=status&usuario=${contatoAtual}`)
    .then(r => r.json())
    .then(res => {
      let txt = "🔴 Offline";

      if (res.status === "online") txt = "🟢 Online";
      if (res.status === "digitando") txt = "💬 Digitando...";

      document.getElementById("statusUsuario").innerText = txt;
    });
}

// =======================================================
// 🟫 DIGITANDO...
// =======================================================

let timerDigitando;

document.getElementById("msg").addEventListener("input", () => {
  enviarStatus("digitando");

  clearTimeout(timerDigitando);
  timerDigitando = setTimeout(() => enviarStatus("online"), 1500);
});

function enviarStatus(st) {
  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      tipo: "status",
      usuario: usuarioAtual,
      status: st
    })
  });
}

// =======================================================
// 📢 CHAMAR — BIP BIP BIP
// =======================================================

function chamarUsuario() {
  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      tipo: "chamar",
      remetente: usuarioAtual,
      destinatario: contatoAtual
    })
  }).then(() => {
    alert("Chamando...");
  });
}

// =======================================================
// ☰ MENU (3 pontinhos)
// =======================================================

function abrirMenu() {
  document.getElementById("menuChat").style.display = "block";
}

function fecharMenu() {
  document.getElementById("menuChat").style.display = "none";
}

// == Limpar conversa ==
function limparConversa() {
  if (!confirm("Tem certeza?")) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      tipo: "limparConversa",
      user1: usuarioAtual,
      user2: contatoAtual
    })
  }).then(() => {
    alert("Conversa apagada!");
    carregarMensagens();
  });
}

// == Apagar contato ==
function apagarContato() {
  if (!confirm("Remover contato?")) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      tipo: "apagarContato",
      usuario: usuarioAtual,
      contato: contatoAtual
    })
  }).then(r => r.json())
    .then(res => {
      alert(res.mensagem);
      contatoAtual = null;
      carregarContatos();
      document.getElementById("tituloChat").innerText = "Nenhum chat selecionado";
      document.getElementById("areaMensagens").innerHTML = "";
    });
}

// == Bloquear contato ==
function bloquearContato() {
  if (!confirm("Bloquear contato?")) return;
  bloqueados.push(contatoAtual);
  alert("Contato bloqueado.");
  fecharMenu();
}

// =======================================================
// Fim
// =======================================================
