const toggleFormatButton = document.getElementById("toggle-format");
const backgroundSelector = document.getElementById("background-selector");
let is24HourFormat = true;

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

toggleFormatButton.addEventListener("click", () => {
    is24HourFormat = !is24HourFormat;
    atualizarRelogio();
});

backgroundSelector.addEventListener("change", (event) => {
    document.body.style.backgroundImage = `url('${event.target.value}')`;
});

setInterval(atualizarRelogio, 1000);
atualizarRelogio();
