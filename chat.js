// ===========================================================
// CONFIGURAÇÕES
// ===========================================================

const API = "SEU_WEBAPP_URL_AQUI"; // coloque sua URL do WebApp!
let usuarioAtual = localStorage.getItem("usuario") || "";
let contatoAtual = null;
let intervaloStatus;
let intervaloMensagens;
let timeoutDigitando = null;


// ===========================================================
// INICIALIZAÇÃO
// ===========================================================

window.onload = function () {
    if (!usuarioAtual) {
        alert("Você não está logado!");
        window.location.href = "Criar_conta.html";
        return;
    }

    document.getElementById("usuarioAtual").innerText = "@" + usuarioAtual;

    carregarContatos();
};



// ===========================================================
// LISTAR CONTATOS
// ===========================================================

function carregarContatos() {
    fetch(`${API}?tipo=contatos&usuario=${usuarioAtual}`)
        .then(r => r.json())
        .then(contatos => {
            const lista = document.getElementById("listaContatos");
            lista.innerHTML = "";

            if (contatos.length === 0) {
                lista.innerHTML = "<p>Nenhum contato adicionado.</p>";
                return;
            }

            contatos.forEach(c => {
                const div = document.createElement("div");
                div.className = "contato-item";
                div.innerHTML = `
                    <button onclick="abrirChat('${c}')">@${c}</button>
                    <hr>
                `;
                lista.appendChild(div);
            });
        });
}



// ===========================================================
// ADICIONAR CONTATO
// ===========================================================

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
            tipo: "adicionarContato",
            usuario: usuarioAtual,
            contato: contato
        })
    })
        .then(r => r.json())
        .then(res => {
            alert(res.mensagem);
            if (res.status === "ok") {
                carregarContatos();
                fecharAdicionarContato();
            }
        });
}



// ===========================================================
// ABRIR CHAT
// ===========================================================

function abrirChat(contato) {
    contatoAtual = contato;

    document.getElementById("tituloChat").innerText = `Chat com @${contato}`;
    document.getElementById("msg").disabled = false;
    document.getElementById("btnEnviar").disabled = false;
    document.getElementById("btnChamar").disabled = false;

    carregarStatusContato();
    carregarMensagens();

    clearInterval(intervaloStatus);
    clearInterval(intervaloMensagens);

    intervaloStatus = setInterval(carregarStatusContato, 2000);
    intervaloMensagens = setInterval(carregarMensagens, 2000);

    atualizarDigitando(false);
}



// ===========================================================
// STATUS DO CONTATO
// ===========================================================

function carregarStatusContato() {
    fetch(`${API}?tipo=status&usuario=${contatoAtual}`)
        .then(r => r.json())
        .then(s => {
            const status = document.getElementById("statusUsuario");

            if (s.status === "digitando") {
                status.innerHTML = "💬 Digitando...";
            } else if (s.status === "online") {
                status.innerHTML = "🟢 Online";
            } else {
                status.innerHTML = "🔴 Offline";
            }
        });
}



// ===========================================================
// DIGITANDO...
// ===========================================================

document.getElementById("msg").addEventListener("input", function () {
    atualizarDigitando(true);

    clearTimeout(timeoutDigitando);
    timeoutDigitando = setTimeout(() => atualizarDigitando(false), 1500);
});

function atualizarDigitando(sim) {
    fetch(API, {
        method: "POST",
        body: JSON.stringify({
            tipo: "status",
            usuario: usuarioAtual,
            status: sim ? "digitando" : "online"
        })
    });
}



// ===========================================================
// CARREGAR MENSAGENS
// ===========================================================

function carregarMensagens() {
    if (!contatoAtual) return;

    fetch(`${API}?tipo=chat&user1=${usuarioAtual}&user2=${contatoAtual}`)
        .then(r => r.json())
        .then(msgs => {
            const box = document.getElementById("areaMensagens");
            box.innerHTML = "";

            msgs.forEach(m => {
                const div = document.createElement("div");
                div.className = "msg";

                const lado = m.remetente === usuarioAtual ? "direita" : "esquerda";

                div.innerHTML = `
                    <div class="bubble ${lado}">
                        <strong>@${m.remetente}</strong><br>
                        ${m.mensagem}<br>
                        <span class="hora">${m.data}</span>
                    </div>
                `;

                box.appendChild(div);
            });

            box.scrollTop = box.scrollHeight;
        });
}



// ===========================================================
// ENVIAR MENSAGEM
// ===========================================================

function enviarMensagem() {
    const txt = document.getElementById("msg");
    if (!txt.value.trim()) return;

    fetch(API, {
        method: "POST",
        body: JSON.stringify({
            tipo: "enviarMensagem",
            remetente: usuarioAtual,
            destinatario: contatoAtual,
            mensagem: txt.value.trim()
        })
    })
        .then(r => r.json())
        .then(() => {
            txt.value = "";
            carregarMensagens();
            atualizarDigitando(false);
        });
}



// ===========================================================
// CHAMAR CONTATO (BIP BIP BIP)
// ===========================================================

function chamarUsuario() {
    fetch(API, {
        method: "POST",
        body: JSON.stringify({
            tipo: "notificacao",
            usuario: contatoAtual,
            tipoNotif: "chamada",
            conteudo: `@${usuarioAtual} está chamando você!`
        })
    });

    alert("📢 Chamando... BIP BIP BIP!");
}



// ===========================================================
// MENU DE 3 PONTINHOS
// ===========================================================

function abrirMenu() {
    const menu = document.getElementById("menuOpcoes");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// ❌ Limpar conversa
function limparConversa() {
    if (!confirm("Tem certeza que deseja limpar TODA a conversa?")) return;

    fetch(API, {
        method: "POST",
        body: JSON.stringify({
            tipo: "limparChat",
            user1: usuarioAtual,
            user2: contatoAtual
        })
    });

    document.getElementById("areaMensagens").innerHTML = "";
}

// 🗑 Apagar contato
function apagarContato() {
    if (!confirm(`Remover @${contatoAtual} dos contatos?`)) return;

    fetch(API, {
        method: "POST",
        body: JSON.stringify({
            tipo: "apagarContato",
            usuario: usuarioAtual,
            contato: contatoAtual
        })
    }).then(() => carregarContatos());
}

// 🚫 Bloquear contato
function bloquearContato() {
    alert("Bloqueio registrado! (implementação real opcional)");
}
