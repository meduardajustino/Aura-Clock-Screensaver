const toggleFormatButton = document.getElementById("toggle-format");
const backgroundSelector = document.getElementById("background-selector");
const toggleFullscreenButton = document.getElementById("toggle-fullscreen");
const startPomodoroButton = document.getElementById("start-pomodoro");

let is24HourFormat = true;
let isFullscreen = false;
let pomodoroInterval;
let isPomodoroActive = false;
let remainingTime = 45 * 60; // 45 minutos em segundos (para o trabalho)

// Atualiza o relógio
function atualizarRelogio() {
    const agora = new Date();
    let horas = agora.getHours();
    let minutos = String(agora.getMinutes()).padStart(2, '0');
    let ampm = "";

    if (!is24HourFormat) {
        ampm = horas >= 12 ? "PM" : "AM";
        horas = horas % 12 || 12;
    }

    horas = horas < 10 ? horas : String(horas);

    document.getElementById("clock").innerHTML = `
        ${horas}:${minutos} <span class="ampm">${ampm}</span>
    `;
}

// Função para tela cheia
function toggleFullscreen() {
    if (!isFullscreen) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) { // Firefox
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
            document.documentElement.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
        }
    }
    isFullscreen = !isFullscreen;
    toggleFullscreenButton.innerText = isFullscreen ? "Exit Fullscreen" : "Fullscreen";
}

// Função Pomodoro
function startPomodoro() {
    if (isPomodoroActive) {
        clearInterval(pomodoroInterval);
        startPomodoroButton.innerText = "Iniciar Pomodoro";
        isPomodoroActive = false;
        remainingTime = 45 * 60; // Resetando o tempo de trabalho
    } else {
        isPomodoroActive = true;
        startPomodoroButton.innerText = "Pausa de 10 Minutos";
        pomodoroInterval = setInterval(() => {
            if (remainingTime > 0) {
                remainingTime--;
                updatePomodoroDisplay(remainingTime);
            } else {
                clearInterval(pomodoroInterval);
                alert("Tempo de trabalho finalizado! Pausa de 10 minutos.");
                remainingTime = 10 * 60; // Pausa de 10 minutos
                pomodoroInterval = setInterval(() => {
                    if (remainingTime > 0) {
                        remainingTime--;
                        updatePomodoroDisplay(remainingTime);
                    } else {
                        clearInterval(pomodoroInterval);
                        alert("Pausa finalizada! Comece um novo Pomodoro.");
                        startPomodoroButton.innerText = "Iniciar Pomodoro";
                        isPomodoroActive = false;
                    }
                }, 1000);
            }
        }, 1000);
    }
}

// Atualiza a exibição do tempo do Pomodoro
function updatePomodoroDisplay(seconds) {
    const minutos = Math.floor(seconds / 60);
    const segundos = seconds % 60;
    document.getElementById("clock").innerHTML = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

toggleFormatButton.addEventListener("click", () => {
    is24HourFormat = !is24HourFormat;
    atualizarRelogio();
});

backgroundSelector.addEventListener("change", (event) => {
    document.body.style.backgroundImage = `url('${event.target.value}')`;
});

toggleFullscreenButton.addEventListener("click", toggleFullscreen);

startPomodoroButton.addEventListener("click", startPomodoro);

setInterval(atualizarRelogio, 1000);
atualizarRelogio();
