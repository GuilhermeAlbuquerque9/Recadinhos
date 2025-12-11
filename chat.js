// =====================
// CONFIGURAÇÕES
// =====================
const API = "https://script.google.com/macros/s/AKfycbx0Z1sH7sn_aKOM-0f1bb7rOU6pmi4qUvFx_QceT7mVRRRsquPbBgVOl7r1_bvsk-q0nQ/exec"; // coloque sua URL DO APPS SCRIPT
let usuarioAtual = localStorage.getItem("usuario");
let contatoAtual = null;
let intervaloMensagens, intervaloStatus;

// =====================
// INICIAR CHAT
// =====================
window.onload = () => {
    if (!usuarioAtual) {
        alert("Você não está logado!");
        window.location.href = "Criar_conta.html";
        return;
    }

    document.getElementById("usuarioAtual").textContent = usuarioAtual;

    carregarContatos();
    atualizarStatus("online");
};

// =====================
// STATUS
// =====================
function atualizarStatus(st) {
    fetch(API, {
        method: "POST",
        body: JSON.stringify({
            tipo: "status",
            usuario: usuarioAtual,
            status: st
        })
    });
}

window.onbeforeunload = () => atualizarStatus("offline");

// =====================
// CONTATOS
// =====================
function carregarContatos() {
    fetch(`${API}?tipo=contatos_chat&usuario=${usuarioAtual}`)
        .then(r => r.json())
        .then(lista => {
            const div = document.getElementById("listaContatos");
            div.innerHTML = "";

            if (lista.length === 0) {
                div.innerHTML = "Nenhum contato adicionado.";
                return;
            }

            lista.forEach(c => {
                const btn = document.createElement("button");
                btn.textContent = c;
                btn.style.display = "block";
                btn.style.marginBottom = "5px";
                btn.onclick = () => abrirChat(c);

                div.appendChild(btn);
            });
        });
}

// =====================
// ADICIONAR CONTATO
// =====================
function abrirAdicionarContato() {
    document.getElementById("popupAdicionar").style.display = "block";
}

function fecharAdicionarContato() {
    document.getElementById("popupAdicionar").style.display = "none";
}

function confirmarAdicionarContato() {
    const contato = document.getElementById("novoContato").value.replace("@", "");

    if (!contato) return alert("Digite um usuário!");

    fetch(API, {
        method: "POST",
        body: JSON.stringify({
            tipo: "addContato",
            usuario: usuarioAtual,
            contato
        })
    })
    .then(r => r.json())
    .then(res => {
        alert(res.mensagem);
        fecharAdicionarContato();
        carregarContatos();
    });
}

// =====================
// ABRIR CHAT
// =====================
function abrirChat(contato) {
    contatoAtual = contato;

    document.getElementById("tituloChat").textContent = `Chat com @${contato}`;
    document.getElementById("msg").disabled = false;
    document.getElementById("btnEnviar").disabled = false;
    document.getElementById("btnChamar").disabled = false;

    carregarMensagens();
    atualizarStatusContato();

    clearInterval(intervaloMensagens);
    clearInterval(intervaloStatus);

    intervaloMensagens = setInterval(carregarMensagens, 1500);
    intervaloStatus = setInterval(atualizarStatusContato, 1500);
}

// =====================
// MENSAGENS
// =====================
function carregarMensagens() {
    if (!contatoAtual) return;

    fetch(`${API}?tipo=chat&user1=${usuarioAtual}&user2=${contatoAtual}`)
        .then(r => r.json())
        .then(lista => {
            const div = document.getElementById("areaMensagens");
            div.innerHTML = "";

            lista.forEach(m => {
                const p = document.createElement("p");
                p.innerHTML = `<strong>@${m.remetente}:</strong> ${m.mensagem}`;
                div.appendChild(p);
            });

            div.scrollTop = div.scrollHeight;
        });
}

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
    });

    document.getElementById("msg").value = "";
}

// =====================
// STATUS DO CONTATO
// =====================
function atualizarStatusContato() {
    fetch(`${API}?tipo=status&usuario=${contatoAtual}`)
        .then(r => r.json())
        .then(info => {
            const s = document.getElementById("statusUsuario");

            if (info.status === "online") s.textContent = `🟢 Online`;
            else if (info.status === "digitando") s.textContent = `💬 Digitando...`;
            else s.textContent = `🔴 Offline`;
        });
}

function avisarDigitando() {
    fetch(API, {
        method: "POST",
        body: JSON.stringify({
            tipo: "status",
            usuario: usuarioAtual,
            status: "digitando"
        })
    });

    setTimeout(() => atualizarStatus("online"), 2000);
}

// =====================
// CHAMAR
// =====================
function chamarUsuario() {
    if (!contatoAtual) return;

    fetch(API, {
        method: "POST",
        body: JSON.stringify({
            tipo: "chamar",
            remetente: usuarioAtual,
            destinatario: contatoAtual
        })
    });

    alert("📢 Chamando... BIP BIP BIP!");
}

// =====================
// MENU ⋮
// =====================
function toggleMenu() {
    const menu = document.getElementById("menuOpcoes");
    menu.style.display = (menu.style.display === "none") ? "block" : "none";
}

// =====================
// LIMPAR CONVERSA
// =====================
function limparConversa() {
    if (!contatoAtual) return;

    fetch(API, {
        method: "POST",
        body: JSON.stringify({
            tipo: "limparChat",
            user1: usuarioAtual,
            user2: contatoAtual
        })
    });

    alert("Conversa limpa!");
    carregarMensagens();
}

// =====================
// APAGAR CONTATO
// =====================
function apagarContato() {
    fetch(API, {
        method: "POST",
        body: JSON.stringify({
            tipo: "apagarContato",
            usuario: usuarioAtual,
            contato: contatoAtual
        })
    });

    alert("Contato apagado!");
    contatoAtual = null;
    carregarContatos();
}

// =====================
// BLOQUEAR CONTATO
// =====================
function bloquearContato() {
    fetch(API, {
        method: "POST",
        body: JSON.stringify({
            tipo: "bloquearContato",
            usuario: usuarioAtual,
            contato: contatoAtual
        })
    });

    alert("Contato bloqueado!");
}
