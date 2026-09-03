let is24HourFormat = true;
let isPomodoroActive = false;
let pomodoroInterval;
let endTime;              // timestamp (ms) de quando o ciclo atual termina
let currentPhase = 'foco';
let focoMinutos = 45;
let pausaMinutos = 10;

let pipCanvas, pipCtx, pipVideo;
let pipBackgroundImage = null;
let currentBackgroundSrc = 'imagens/aura_1.jpg';

// Carrega (de forma assíncrona) a imagem de fundo escolhida, para ser
// desenhada no canvas do Picture-in-Picture.
function carregarPipBackground(src) {
    currentBackgroundSrc = src;
    const img = new Image();
    img.src = src;
    img.onload = () => {
        pipBackgroundImage = img;
        if (pipCtx) {
            const restante = isPomodoroActive
                ? Math.max(0, Math.round((endTime - Date.now()) / 1000))
                : focoMinutos * 60;
            desenharPip(restante);
        }
    };
}

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

    // definindo minutos
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
// de um horário absoluto de término. 
function atualizarDisplayCiclo() {
    const restante = Math.round((endTime - Date.now()) / 1000);

    if (restante > 0) {
        document.getElementById("clock").innerHTML = formatarTempo(restante);
        desenharPip(restante);
    } else {
        clearInterval(pomodoroInterval);
        if (currentPhase === 'foco') {
            alert(`Foco concluído! Aproveite seus ${pausaMinutos} minutos de descanso.`);
            iniciarPausa();
        } else {
            alert("Pausa finalizada! Começando outro ciclo de estudos.");
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

    desenharPip(focoMinutos * 60);
}

function desenharPip(segundosRestantes) {
    if (!pipCtx) return;

    // Fundo: desenha a imagem de aura selecionada, cobrindo todo o canvas
    // (mesmo comportamento do "background-size: cover" do body).
    if (pipBackgroundImage && pipBackgroundImage.complete && pipBackgroundImage.naturalWidth > 0) {
        const imgRatio = pipBackgroundImage.naturalWidth / pipBackgroundImage.naturalHeight;
        const canvasRatio = pipCanvas.width / pipCanvas.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgRatio > canvasRatio) {
            drawHeight = pipCanvas.height;
            drawWidth = drawHeight * imgRatio;
            offsetX = (pipCanvas.width - drawWidth) / 2;
            offsetY = 0;
        } else {
            drawWidth = pipCanvas.width;
            drawHeight = drawWidth / imgRatio;
            offsetX = 0;
            offsetY = (pipCanvas.height - drawHeight) / 2;
        }
        pipCtx.drawImage(pipBackgroundImage, offsetX, offsetY, drawWidth, drawHeight);
    } else {
        // fallback enquanto a imagem ainda carrega
        pipCtx.fillStyle = '#6d3f66';
        pipCtx.fillRect(0, 0, pipCanvas.width, pipCanvas.height);
    }

    // apenas o tempo restante, sem "Foco"/"Pausa"
    pipCtx.fillStyle = '#ffffff';
    pipCtx.font = "600 64px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif";
    pipCtx.textAlign = 'center';
    pipCtx.textBaseline = 'middle';
    pipCtx.shadowColor = 'rgba(255, 255, 255, 0.6)';
    pipCtx.shadowBlur = 15;
    pipCtx.fillText(formatarTempo(segundosRestantes), pipCanvas.width / 2, pipCanvas.height / 2);
    pipCtx.shadowBlur = 0;
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
        carregarPipBackground(e.target.value);
    });

    // carrega a imagem de fundo padrão (aura_1) para já ficar pronta no PiP
    carregarPipBackground(currentBackgroundSrc);

    // Corrige o display assim que a aba volta a ficar visível, evitando
    // que o usuário veja um número "atrasado" por causa do throttling.
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && isPomodoroActive) {
            atualizarDisplayCiclo();
        }
    });

    setInterval(atualizarRelogio, 1000);
    atualizarRelogio();
});
