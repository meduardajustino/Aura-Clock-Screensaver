let is24HourFormat = true;
let isFullscreen = false;
let isPomodoroActive = false;
let pomodoroInterval;
let remainingTime;

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

function iniciarPomodoro() {
    if (isPomodoroActive) {
        clearInterval(pomodoroInterval);
        isPomodoroActive = false;
        atualizarRelogio();
        document.getElementById("pomodoro-toggle").textContent = "Pomodoro 45min";
        return;
    }

    isPomodoroActive = true;
    remainingTime = 45 * 60;
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
            alert("Pomodoro concluído! Hora da pausa de 10 minutos!");
            iniciarPausa();
        }
    }, 1000);
}

function iniciarPausa() {
    remainingTime = 10 * 60;
    pomodoroInterval = setInterval(() => {
        if (remainingTime > 0) {
            remainingTime--;
            const minutos = Math.floor(remainingTime / 60);
            const segundos = remainingTime % 60;
            document.getElementById("clock").innerHTML =
                `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        } else {
            clearInterval(pomodoroInterval);
            alert("Pausa finalizada! Pronto para outro Pomodoro.");
            isPomodoroActive = false;
            document.getElementById("pomodoro-toggle").textContent = "Pomodoro 45min";
            atualizarRelogio();
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
