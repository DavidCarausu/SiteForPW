import socket
import os
import json

serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
serversocket.bind(('', 5678))
serversocket.listen(5)

while True:
    print('#########################################################################')
    print('Serverul asculta potentiali clienti.')
    (clientsocket, address) = serversocket.accept()
    print('S-a conectat un client.')
    
    cerere = ''
    while True:
        buf = clientsocket.recv(4096)
        if len(buf) < 1:
            break
        cerere = cerere + buf.decode('utf-8', errors='replace')
        # Ne oprim când am primit tot (header + body)
        if '\r\n\r\n' in cerere:
            # Verificam daca avem tot body-ul
            parti = cerere.split('\r\n\r\n', 1)
            headere = parti[0]
            body = parti[1] if len(parti) > 1 else ''
            
            # Extragem Content-Length daca exista
            continut_lungime = 0
            for linie in headere.split('\r\n'):
                if linie.lower().startswith('content-length:'):
                    continut_lungime = int(linie.split(':')[1].strip())
            
            if len(body) >= continut_lungime:
                break
    
    # Extragem linia de start si body-ul
    parti = cerere.split('\r\n\r\n', 1)
    headere = parti[0]
    body = parti[1] if len(parti) > 1 else ''
    linieDeStart = headere.split('\r\n')[0]
    
    print('Linia de start: ' + linieDeStart)
    
    if linieDeStart == '':
        clientsocket.close()
        continue
    
    elementeLineDeStart = linieDeStart.split()
    metoda = elementeLineDeStart[0]        # GET sau POST
    numeResursaCeruta = elementeLineDeStart[1]
    
    if numeResursaCeruta == '/':
        numeResursaCeruta = '/index.html'

    # -------------------------------------------------------
    # Gestionare POST /api/utilizatori
    # -------------------------------------------------------
    if metoda == 'POST' and numeResursaCeruta == '/api/utilizatori':
        try:
            utilizator_nou = json.loads(body)
            
            cale_json = '../continut/resurse/utilizatori.json'
            
            # Citim utilizatorii existenti
            try:
                with open(cale_json, 'r', encoding='utf-8') as f:
                    utilizatori = json.load(f)
            except:
                utilizatori = []
            
            # Adaugam utilizatorul nou
            utilizatori.append(utilizator_nou)
            
            # Scriem inapoi in fisier
            with open(cale_json, 'w', encoding='utf-8') as f:
                json.dump(utilizatori, f, ensure_ascii=False, indent=2)
            
            msg = 'Utilizator inregistrat cu succes!'
            clientsocket.sendall(b'HTTP/1.1 200 OK\r\n')
            clientsocket.sendall(('Content-Length: ' + str(len(msg.encode('utf-8'))) + '\r\n').encode())
            clientsocket.sendall(b'Content-Type: text/plain; charset=utf-8\r\n')
            clientsocket.sendall(b'Server: My PW Server\r\n')
            clientsocket.sendall(b'\r\n')
            clientsocket.sendall(msg.encode('utf-8'))
            
        except Exception as e:
            msg = 'Eroare la inregistrare: ' + str(e)
            clientsocket.sendall(b'HTTP/1.1 500 Internal Server Error\r\n')
            clientsocket.sendall(('Content-Length: ' + str(len(msg.encode('utf-8'))) + '\r\n').encode())
            clientsocket.sendall(b'Content-Type: text/plain; charset=utf-8\r\n')
            clientsocket.sendall(b'\r\n')
            clientsocket.sendall(msg.encode('utf-8'))
        
        clientsocket.close()
        continue  # nu mai cautam fisier pe disk

    # -------------------------------------------------------
    # Gestionare GET - codul tau original
    # -------------------------------------------------------
    numeFisier = '../continut' + numeResursaCeruta
    
    fisier = None
    try:
        fisier = open(numeFisier, 'rb')
        numeExtensie = numeFisier[numeFisier.rfind('.')+1:]
        tipuriMedia = {
            'html': 'text/html; charset=utf-8',
            'css': 'text/css; charset=utf-8',
            'js': 'text/javascript; charset=utf-8',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'ico': 'image/x-icon',
            'xml': 'application/xml; charset=utf-8',
            'json': 'application/json; charset=utf-8'
        }
        tipMedia = tipuriMedia.get(numeExtensie, 'text/plain; charset=utf-8')
        
        clientsocket.sendall(b'HTTP/1.1 200 OK\r\n')
        clientsocket.sendall(('Content-Length: ' + str(os.stat(numeFisier).st_size) + '\r\n').encode())
        clientsocket.sendall(('Content-Type: ' + tipMedia + '\r\n').encode())
        clientsocket.sendall(b'Server: My PW Server\r\n')
        clientsocket.sendall(b'\r\n')
        
        buf = fisier.read(1024)
        while buf:
            clientsocket.send(buf)
            buf = fisier.read(1024)
            
    except IOError:
        msg = 'Eroare! Resursa ceruta ' + numeResursaCeruta + ' nu a putut fi gasita!'
        clientsocket.sendall(b'HTTP/1.1 404 Not Found\r\n')
        clientsocket.sendall(('Content-Length: ' + str(len(msg.encode('utf-8'))) + '\r\n').encode())
        clientsocket.sendall(b'Content-Type: text/plain; charset=utf-8\r\n')
        clientsocket.sendall(b'Server: My PW Server\r\n')
        clientsocket.sendall(b'\r\n')
        clientsocket.sendall(msg.encode())
    finally:
        if fisier is not None:
            fisier.close()
    
    clientsocket.close()
    print('S-a terminat comunicarea cu clientul.')