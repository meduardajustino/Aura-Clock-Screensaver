let is24HourFormat = true;
let isFullscreen = false;
let isPomodoroActive = false;
let pomodoroInterval;
let remainingTime;
let focoMinutos = 45;
let pausaMinutos = 10;

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
    remainingTime = focoMinutos * 60;
    document.getElementById("pomodoro-toggle").textContent = "Parar Pomodoro";
    pomodoroInterval = setInterval(() => {
        if (remainingTime > 0) {
            remainingTime--;
            const minutos = Math.floor(remainingTime / 60);
            const segundos = remainingTime % 60;
            document.getElementById("clock").innerHTML =
                `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        } else {
            clearInterval(pomodoroInterval);
            alert(`Foco concluído! Você tem ${pausaMinutos} minutos de descanso.`);
            iniciarPausa();
        }
    }, 1000);
}

function iniciarPausa() {
    remainingTime = pausaMinutos * 60;
    pomodoroInterval = setInterval(() => {
        if (remainingTime > 0) {
            remainingTime--;
            const minutos = Math.floor(remainingTime / 60);
            const segundos = remainingTime % 60;
            document.getElementById("clock").innerHTML =
                `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        } else {
            clearInterval(pomodoroInterval);
            alert("Pausa finalizada! Começando outro ciclo de estudos.");
            if (isPomodoroActive) {
                iniciarCicloFoco(); // faz o loop automaticamente
            }
        }
    }, 1000);
}

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("toggle-format").addEventListener("click", () => {
        is24HourFormat = !is24HourFormat;
        atualizarRelogio();
    });
    document.getElementById("fullscreen-toggle").addEventListener("click", toggleFullscreen);
    document.getElementById("pomodoro-toggle").addEventListener("click", iniciarPomodoro);
    document.getElementById("background-selector").addEventListener("change", (e) => {
        document.body.style.backgroundImage = `url('${e.target.value}')`;
    });
    setInterval(atualizarRelogio, 1000);
    atualizarRelogio();
});
