// ===============================================
// CONFIGURAÇÕES
// ===============================================

const API_URL = "https://script.google.com/macros/s/AKfycbzjhD_JXXA-Z37IUtmPTMT9674-AlvMEDwguq7Ua3N7bLjpd2SftfGlaQPZ7hqaB2iXMA/exec"; // coloque seu WebApp Publish URL aqui

let usuarioAtual = localStorage.getItem("usuario") || "Visitante";
let contatoAtual = null;
let intervaloMensagens = null;
let intervaloStatus = null;

// ===============================================
// INICIALIZAÇÃO
// ===============================================

window.onload = () => {
    document.getElementById("usuarioAtual").innerText = usuarioAtual;
    carregarContatos();
};


// ===============================================
// 📌 CARREGAR LISTA DE CONTATOS
// ===============================================

function carregarContatos() {
    fetch(`${API_URL}?tipo=contatos&usuario=${usuarioAtual}`)
        .then(r => r.json())
        .then(lista => {
            const div = document.getElementById("listaContatos");
            div.innerHTML = "";

            if (lista.length === 0) {
                div.innerHTML = "<p>Nenhum contato ainda.</p>";
                return;
            }

            lista.forEach(user => {
                const c = document.createElement("div");
                c.style.padding = "10px";
                c.style.margin = "5px 0";
                c.style.borderBottom = "1px solid #ccc";
                c.style.cursor = "pointer";
                c.innerText = user;

                c.onclick = () => abrirChat(user);
                div.appendChild(c);
            });
        });
}


// ===============================================
// ➕ ADICIONAR CONTATO
// ===============================================

function abrirAdicionarContato() {
    document.getElementById("popupAdicionar").style.display = "block";
}

function fecharAdicionarContato() {
    document.getElementById("popupAdicionar").style.display = "none";
}

function confirmarAdicionarContato() {
    const usuario = document.getElementById("novoContato").value.trim();

    if (usuario === "") return alert("Digite um usuário!");

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            tipo: "adicionarContato",
            usuario: usuarioAtual,
            contato: usuario
        })
    })
        .then(r => r.json())
        .then(ret => {
            alert(ret.mensagem);
            if (ret.status === "ok") {
                carregarContatos();
                fecharAdicionarContato();
            }
        });
}


// ===============================================
// 💬 ABRIR CHAT COM ALGUÉM
// ===============================================

function abrirChat(contato) {
    contatoAtual = contato;

    document.getElementById("tituloChat").innerText =
        `Chat com @${contatoAtual}`;

    document.getElementById("msg").disabled = false;
    document.getElementById("btnEnviar").disabled = false;
    document.getElementById("btnChamar").disabled = false;

    carregarMensagens();
    checarStatus();

    // reinicia atualizações
    clearInterval(intervaloMensagens);
    clearInterval(intervaloStatus);

    intervaloMensagens = setInterval(carregarMensagens, 2000);
    intervaloStatus = setInterval(checarStatus, 2000);
}


// ===============================================
// 📨 ENVIAR MENSAGEM
// ===============================================

function enviarMensagem() {
    const txt = document.getElementById("msg").value.trim();
    if (txt === "") return;

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            tipo: "enviarMensagem",
            remetente: usuarioAtual,
            destinatario: contatoAtual,
            mensagem: txt
        })
    })
        .then(r => r.json())
        .then(() => {
            document.getElementById("msg").value = "";
            carregarMensagens();
        });
}


// ===============================================
// 🔄 CARREGAR MENSAGENS
// ===============================================

function carregarMensagens() {
    if (!contatoAtual) return;

    fetch(`${API_URL}?tipo=chat&user1=${usuarioAtual}&user2=${contatoAtual}`)
        .then(r => r.json())
        .then(msgs => {
            const area = document.getElementById("areaMensagens");
            area.innerHTML = "";

            msgs.forEach(m => {
                const linha = document.createElement("div");
                linha.style.marginBottom = "10px";
                linha.innerHTML = `<b>@${m.remetente}:</b> ${m.mensagem}<br>
                                   <span style="font-size:11px;color:#777">${m.data}</span>`;
                area.appendChild(linha);
            });

            area.scrollTop = area.scrollHeight;
        });
}


// ===============================================
// 🟢 STATUS ONLINE / OFFLINE / DIGITANDO
// ===============================================

function checarStatus() {
    if (!contatoAtual) return;

    fetch(`${API_URL}?tipo=status&usuario=${contatoAtual}`)
        .then(r => r.json())
        .then(s => {
            const el = document.getElementById("statusUsuario");

            let icon = "🔴 Offline";

            if (s.status === "online") icon = "🟢 Online";
            if (s.status === "digitando") icon = "💬 Digitando...";

            el.innerText = icon;
            document.getElementById("tituloChat").innerText =
                `Chat com @${contatoAtual} - ${icon}`;
        });
}


// ===============================================
// 💬 MARCAR COMO DIGITANDO
// ===============================================

let timeoutDigitando = null;

document.getElementById("msg").addEventListener("input", () => {
    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            tipo: "status",
            usuario: usuarioAtual,
            status: "digitando"
        })
    });

    clearTimeout(timeoutDigitando);

    timeoutDigitando = setTimeout(() => {
        fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                tipo: "status",
                usuario: usuarioAtual,
                status: "online"
            })
        });
    }, 1500);
});


// ===============================================
// 📢 CHAMAR (BIP BIP BIP)
// ===============================================

function chamarUsuario() {
    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            tipo: "notificacao",
            usuario: contatoAtual,
            tipoNot: "chamada",
            conteudo: `@${usuarioAtual} está chamando você!`
        })
    });

    alert("📢 Chamando... (o outro usuário ouvirá BIP BIP BIP)");
}


// ===============================================
// ⋮ MENU (3 pontinhos)
// ===============================================

function abrirMenu() {
    const menu = document.getElementById("menuOpcoes");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}


// ❌ LIMPAR CONVERSA
function limparConversa() {
    if (!contatoAtual) return;

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            tipo: "limparChat",
            user1: usuarioAtual,
            user2: contatoAtual
        })
    })
        .then(() => {
            alert("Conversa apagada!");
            carregarMensagens();
        });
}


// 🗑 APAGAR CONTATO
function apagarContato() {
    if (!contatoAtual) return;

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            tipo: "removerContato",
            usuario: usuarioAtual,
            contato: contatoAtual
        })
    })
        .then(() => {
            alert("Contato removido!");
            contatoAtual = null;
            document.getElementById("tituloChat").innerText =
                "Nenhum chat selecionado";
            carregarContatos();
        });
}


// 🚫 BLOQUEAR CONTATO
function bloquearContato() {
    if (!contatoAtual) return;

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            tipo: "bloquear",
            usuario: usuarioAtual,
            contato: contatoAtual
        })
    })
        .then(() => {
            alert("Contato BLOQUEADO.");
        });
}

