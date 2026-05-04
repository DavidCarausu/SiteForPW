function notifyWorker(id, nume, cantitate) {
    let tabel = document.getElementById("lista-produse");

    let rand = document.createElement("tr");

    rand.innerHTML = `
        <td>${id}</td>
        <td>${nume}</td>
        <td>${cantitate}</td>
    `;

    tabel.appendChild(rand);
}