class Produs {
    constructor(id, nume, cantitate) {
        this.id = id;
        this.nume = nume;
        this.cantitate = cantitate;
    }
}

let idContor = 0;

document.getElementById("btn-adauga").addEventListener("click", function(e){
    e.preventDefault();
    adaugaConditionat();
});

function adaugaConditionat() {
    let nume = document.getElementById("nume").value;
    let cantitate = document.getElementById("cantitate").value;

    if (!nume || !cantitate) {
        alert("Te rog completează ambele câmpuri!");
        return;
    }

    idContor++;
    let produs = new Produs(idContor, nume, cantitate);

    // Verificăm ce opțiune este selectată în HTML
    let tipStocare = document.querySelector('input[name="tip-stocare"]:checked').value;
    let executorStocare;

    if (tipStocare === "local") {
        executorStocare = new localS(produs);
    } else {
        executorStocare = new indexDB(produs);
    }

    executorStocare.adauga();

    document.getElementById("nume").value = "";
    document.getElementById("cantitate").value = "";
}


class InterfataStorage {
    constructor(p) {
        this.p = p; 
    }

    adauga() {
        throw new Error('Metoda adauga() trebuie implementată în clasa derivată!');
    }
}

class localS extends InterfataStorage {
    constructor(p) {
        super(p);
    }

    adauga() {
        const cheie = this.p.id.toString();
        const valoare = `${this.p.nume},${this.p.cantitate}`;
        
        localStorage.setItem(cheie, valoare);
        
        console.log("Salvat în LocalStorage");
        notifyWorker(cheie, this.p.nume, this.p.cantitate);
    }
}
class indexDB extends InterfataStorage {
    constructor(p) {
        super(p);
        this.dbName = "MagazinDB";
    }

    static dbInstance = null;

    static deschideDB(dbName) {
        return new Promise((resolve, reject) => {
            if (indexDB.dbInstance) {
                resolve(indexDB.dbInstance);
                return;
            }

            const request = indexedDB.open(dbName, 2);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains("produse")) {
                    db.createObjectStore("produse", { keyPath: "id" });
                    console.log("ObjectStore 'produse' creat.");
                }
            };

            request.onsuccess = (event) => {
                indexDB.dbInstance = event.target.result;
                console.log("DB deschis o singură dată.");
                resolve(indexDB.dbInstance);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    adauga() {
        indexDB.deschideDB(this.dbName).then((db) => {
            const transaction = db.transaction(["produse"], "readwrite");

            transaction.onerror = (event) => {
                console.error("Eroare tranzacție:", event.target.error);
            };

            const objectStore = transaction.objectStore("produse");

            const requestAdd = objectStore.put({
                id: this.p.id.toString(),
                nume: this.p.nume,
                cantitate: this.p.cantitate
            });

            requestAdd.onsuccess = () => {
                console.log("Salvat în IndexedDB");
                notifyWorker(this.p.id.toString(), this.p.nume, this.p.cantitate);
            };

            requestAdd.onerror = (event) => {
                console.error("Eroare la put():", event.target.error);
            };
        }).catch((err) => {
            console.error("Eroare la deschiderea DB:", err);
        });
    }
}