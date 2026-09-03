let is24HourFormat = true;
let isPomodoroActive = false;
let pomodoroInterval;
let endTime;              // timestamp (ms) de quando o ciclo atual termina
let currentPhase = 'foco'; // 'foco' ou 'pausa'
let focoMinutos = 45;
let pausaMinutos = 10;

let pipCanvas, pipCtx, pipVideo;

function atualizarRelogio() {
    if (isPomodoroActive) return;
    const agora = new Date();
    let horas = agora.getHours();
    let minutos = agora.getMinutes();
    let ampm = "";
    if (!is24HourFormat) {
        ampm = horas >= 12 ? "PM" : "AM";
        horas = horas % 12 || 12;
    }
    horas = String(horas);
    minutos = String(minutos).padStart(2, '0');
    document.getElementById("clock").innerHTML = `${horas}:${minutos} ${ampm}`;
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function formatarTempo(segundosTotais) {
    const minutos = Math.floor(segundosTotais / 60);
    const segundos = segundosTotais % 60;
    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

function pararPomodoro() {
    clearInterval(pomodoroInterval);
    isPomodoroActive = false;
    atualizarRelogio();
    document.getElementById("pomodoro-toggle").textContent = "Pomodoro";
    document.getElementById("foco-minutos").disabled = false;
    document.getElementById("pausa-minutos").disabled = false;
}

function iniciarPomodoro() {
    if (isPomodoroActive) {
        pararPomodoro();
        return;
    }

    // lê os valores escolhidos pelo usuário no momento em que inicia
    focoMinutos = parseInt(document.getElementById("foco-minutos").value, 10) || 45;
    pausaMinutos = parseInt(document.getElementById("pausa-minutos").value, 10) || 10;

    document.getElementById("foco-minutos").disabled = true;
    document.getElementById("pausa-minutos").disabled = true;

    isPomodoroActive = true;
    iniciarCicloFoco();
}

function iniciarCicloFoco() {
    currentPhase = 'foco';
    endTime = Date.now() + focoMinutos * 60 * 1000;
    document.getElementById("pomodoro-toggle").textContent = "Parar Pomodoro";
    rodarCiclo();
}

function iniciarPausa() {
    currentPhase = 'pausa';
    endTime = Date.now() + pausaMinutos * 60 * 1000;
    rodarCiclo();
}

function rodarCiclo() {
    clearInterval(pomodoroInterval);
    atualizarDisplayCiclo(); // atualiza na hora, sem esperar o primeiro tick
    pomodoroInterval = setInterval(atualizarDisplayCiclo, 1000);
}

// Em vez de decrementar um contador, recalcula o tempo restante a partir
// de um horário absoluto de término. Isso evita o atraso acumulado que o
// navegador introduz quando a aba está em segundo plano/minimizada.
function atualizarDisplayCiclo() {
    const restante = Math.round((endTime - Date.now()) / 1000);

    if (restante > 0) {
        document.getElementById("clock").innerHTML = formatarTempo(restante);
        desenharPip(restante);
    } else {
        clearInterval(pomodoroInterval);
        if (currentPhase === 'foco') {
            alert(`Foco concluído! Hora da pausa de ${pausaMinutos} minutos!`);
            iniciarPausa();
        } else {
            alert("Pausa finalizada! Começando outro ciclo de foco.");
            if (isPomodoroActive) {
                iniciarCicloFoco(); // faz o loop automaticamente
            }
        }
    }
}

/* ---------- Picture-in-Picture ---------- */

function configurarPip() {
    pipCanvas = document.createElement('canvas');
    pipCanvas.width = 320;
    pipCanvas.height = 180;
    pipCtx = pipCanvas.getContext('2d');

    pipVideo = document.createElement('video');
    pipVideo.muted = true;
    pipVideo.playsInline = true;
    pipVideo.style.display = 'none';
    document.body.appendChild(pipVideo);

    const stream = pipCanvas.captureStream(2); // 2 fps é mais que suficiente pra um relógio
    pipVideo.srcObject = stream;

    // desenha algo assim que configura, mesmo antes do pomodoro começar
    desenharPip(focoMinutos * 60);
}

function desenharPip(segundosRestantes) {
    if (!pipCtx) return;

    pipCtx.fillStyle = '#6d3f66';
    pipCtx.fillRect(0, 0, pipCanvas.width, pipCanvas.height);

    pipCtx.fillStyle = '#ffebf5';
    pipCtx.font = 'bold 60px system-ui, sans-serif';
    pipCtx.textAlign = 'center';
    pipCtx.textBaseline = 'middle';
    pipCtx.fillText(formatarTempo(segundosRestantes), pipCanvas.width / 2, pipCanvas.height / 2 - 10);

    pipCtx.font = '20px system-ui, sans-serif';
    pipCtx.fillText(currentPhase === 'foco' ? 'Foco' : 'Pausa', pipCanvas.width / 2, pipCanvas.height / 2 + 40);
}

async function abrirPip() {
    if (!pipVideo) configurarPip();

    if (!isPomodoroActive) {
        alert("Inicie o Pomodoro antes de abrir o Picture-in-Picture.");
        return;
    }

    if (!document.pictureInPictureEnabled) {
        alert("Seu navegador não suporta Picture-in-Picture.");
        return;
    }

    try {
        await pipVideo.play();
        await pipVideo.requestPictureInPicture();
    } catch (err) {
        console.error("Erro ao abrir Picture-in-Picture:", err);
        alert("Não foi possível abrir o Picture-in-Picture.");
    }
}

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("toggle-format").addEventListener("click", () => {
        is24HourFormat = !is24HourFormat;
        atualizarRelogio();
    });
    document.getElementById("fullscreen-toggle").addEventListener("click", toggleFullscreen);
    document.getElementById("pomodoro-toggle").addEventListener("click", iniciarPomodoro);
    document.getElementById("pip-toggle").addEventListener("click", abrirPip);
    document.getElementById("background-selector").addEventListener("change", (e) => {
        document.body.style.backgroundImage = `url('${e.target.value}')`;
    });

    // Corrige o display evitando que o usuário veja um número "atrasado" por causa do throttling.
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && isPomodoroActive) {
            atualizarDisplayCiclo();
        }
    });

    setInterval(atualizarRelogio, 1000);
    atualizarRelogio();
});
