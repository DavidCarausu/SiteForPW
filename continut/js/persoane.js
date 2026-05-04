// js/persoane.js

function incarcaPersoane() {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            generareTabelPersoane(this);
        }
    };
     xmlhttp.open("GET", "resurse/persoane.xml", true);
    xmlhttp.send();
}




function executaValidarea() {
            const userIn = document.getElementById("userCheck").value;
            const passIn = document.getElementById("passCheck").value;
            const mesaj = document.getElementById("mesaj");

            // Cerere AJAX pentru a lua fisierul JSON
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    // Folosim JSON.parse conform cerintei
                    const utilizatori = JSON.parse(this.responseText);
                    
                    let gasit = false;
                    for (let u of utilizatori) {
                        if (u.utilizator === userIn && u.parola === passIn) {
                            gasit = true;
                            break;
                        }
                    }

                    if (gasit) {
                        mesaj.innerText = "Utilizator și parolă corecte!";
                        mesaj.style.color = "green";
                    } else {
                        mesaj.innerText = "Nume de utilizator sau parolă incorectă.";
                        mesaj.style.color = "red";
                    }
                }
            };
            xhttp.open("GET", "resurse/utilizatori.json", true);
            xhttp.send();
        }


/*
function inregistreaza() {
    const data = {
        utilizator: document.getElementById('user').value,
        parola: document.getElementById('pass').value
    };

    fetch('/api/utilizatori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.text())
    .then(msg => alert(msg));
}
*/
function inregistreaza() {
    const data = {
        utilizator: document.getElementById('nume-utilizator').value,
        parola: document.getElementById('pass').value
    };

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert(this.responseText);
        }
    };
    xhttp.open('POST', '/api/utilizatori', true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
}

function generareTabelPersoane(xml) {
    let xmlDoc = xml.responseXML;
    
    // Verificare: dacă xmlDoc e null, înseamnă că browserul nu a putut procesa XML-ul (probabil din cauza DTD-ului)
    if (!xmlDoc) {
        console.error("Eroare: xmlDoc este null. Verifică dacă fișierul dtd_persoane.dtd există în folderul 'resurse'.");
        return;
    }

    let persoane = xmlDoc.getElementsByTagName("persoana");
    let table = `
        <table class="tabel-persoane">
            <tr>
                <th>Nume</th>
                <th>Prenume</th>
                <th>Vârsta</th>
                <th>Adresă Completă</th>
                <th>CNP</th>
            </tr>`;

    for (let i = 0; i < persoane.length; i++) {
        // Extragem datele simple
        let nume = persoane[i].getElementsByTagName("nume")[0].textContent;
        let prenume = persoane[i].getElementsByTagName("prenume")[0].textContent;
        let varsta = persoane[i].getElementsByTagName("varsta")[0].textContent;
        let cnp = persoane[i].getElementsByTagName("cnp")[0].textContent;
        
        // REZOLVARE: Accesăm nodul <adresa> mai întâi
        let adresaNode = persoane[i].getElementsByTagName("adresa")[0];
        
        let strada = adresaNode.getElementsByTagName("strada")[0].textContent;
        let numar = adresaNode.getElementsByTagName("numar")[0].textContent;
        let localitate = adresaNode.getElementsByTagName("localitate")[0].textContent;
        let judet = adresaNode.getElementsByTagName("judet")[0].textContent;
        
        let adresaCompleta = `${strada}, Nr. ${numar}, ${localitate}, ${judet}`;

        table += `<tr>
            <td>${nume}</td>
            <td>${prenume}</td>
            <td>${varsta}</td>
            <td>${adresaCompleta}</td>
            <td>${cnp}</td>
        </tr>`;
    }
    table += "</table>";

    const zonaTabel = document.getElementById("zona-tabel");
    if (zonaTabel) {
        zonaTabel.innerHTML = table;
    } else {
        console.error("Elementul 'zona-tabel' nu a fost găsit în pagină.");
    }
}