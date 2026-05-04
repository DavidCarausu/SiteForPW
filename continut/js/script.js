window.addEventListener("load", initPage);

let x;
let myCanvas;
let ctx;

// Obiectul pentru dreptunghi
var patrat = {
    culoare_contur: "#000000",
    culoare_umplere: "#ff0000",
    x_init: 0,
    y_init: 0,
    x_fin: 0,
    y_fin: 0
};

let clickCount = 0; 
function initPage() {
    actualizeazaData();
    setInterval(actualizeazaData, 1000);
    
    document.getElementById("url").innerHTML = "<b>URL:</b> " + window.location.href; 
    x = document.getElementById("location");
    if(x) {
        getLocation();
    }
    
    document.getElementById("browser").innerHTML = "<b>Browser:</b> " + navigator.appName + " (Versiune: " + navigator.appVersion + ")";
    document.getElementById("os").innerHTML = "<b>Sistem Operare:</b> " + navigator.platform;
    
    myCanvas = document.getElementById("canvas");
    ctx = myCanvas.getContext("2d");
    myCanvas.addEventListener("click", handlingClick);
}

function aplicaCulori() {

    patrat.culoare_umplere = document.getElementById("fillColor").value;
    patrat.culoare_contur = document.getElementById("strokeColor").value;
    alert("Culori actualizate!");
}

function handlingClick(e) {
    const rect = myCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (clickCount === 0) {
        // primul
        patrat.x_init = mouseX;
        patrat.y_init = mouseY;
        clickCount = 1;
        console.log("Primul punct setat.");
    } else {
        // 2
        patrat.x_fin = mouseX;
        patrat.y_fin = mouseY;
        
        deseneazaDreptunghi();
        
        clickCount = 0; 
        console.log("Al doilea punct setat. Dreptunghi desenat.");
    }
}

function deseneazaDreptunghi() {
    const latime = patrat.x_fin - patrat.x_init;
    const inaltime = patrat.y_fin - patrat.y_init;

    ctx.fillStyle = patrat.culoare_umplere;
    ctx.strokeStyle = patrat.culoare_contur;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.rect(patrat.x_init, patrat.y_init, latime, inaltime);
    ctx.fill();   
    ctx.stroke(); 
}

function actualizeazaData() {
    const d = new Date();
    const dateEl = document.getElementById("date");
    if(dateEl) dateEl.innerHTML = "<b>Data curentă:</b> " + d.toLocaleString();
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    }
}

function success(position) {
    if(x) x.innerHTML = "<b>Locație:</b> Lat: " + position.coords.latitude + ", Long: " + position.coords.longitude;
}

function error() {
    if(x) x.innerHTML = "Locația nu a putut fi determinată.";
}



function insereazaLinie() {
    const tabel = document.getElementById("tabelDinamic");
    const pozitie = parseInt(document.getElementById("pos").value);
    const culoare = document.getElementById("tableColor").value;

    const nrColoane = tabel.rows.length > 0 ? tabel.rows[0].cells.length : 1;
    const indexFinal = (pozitie > tabel.rows.length) ? tabel.rows.length : pozitie;
    const randNou = tabel.insertRow(indexFinal);

    for (let i = 0; i < nrColoane; i++) {
        const celulaNoua = randNou.insertCell(i);
        celulaNoua.innerHTML = "Linie Nouă";
        celulaNoua.style.backgroundColor = culoare;
    }
}

function insereazaColoana() {
    const tabel = document.getElementById("tabelDinamic");
    const pozitie = parseInt(document.getElementById("pos").value);
    const culoare = document.getElementById("tableColor").value;
    const randuri = tabel.rows;

    for (let i = 0; i < randuri.length; i++) {
        const indexFinal = (pozitie > randuri[i].cells.length) ? randuri[i].cells.length : pozitie;
        
        const celulaNoua = randuri[i].insertCell(indexFinal);
        celulaNoua.innerHTML = "Col Nouă";
        celulaNoua.style.backgroundColor = culoare;
    }
}