
/*
import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

public class ServerWeb {
    public static void main(String[] args) throws IOException {
        System.out.println("Serverul asculta potentiali clienti.");
        ServerSocket serverSocket = new ServerSocket(5678);
        while(true)
        {
            Socket clientSocket=serverSocket.accept();
            System.out.println("New client connected.");
            PrintWriter socketWriter = new PrintWriter(clientSocket.getOutputStream(), true);
            BufferedReader socketReader = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
            List<String> cerere=new ArrayList<>();
            for( String citesclinie: socketReader.readLine().split(" "))
            {
                cerere.add(citesclinie);
            }
            try{
                File f=new File("/continut"+cerere.get(1));
                if(f.exists())
                {
                    socketWriter.append("HTTP/1.1 200 OK\r\n");
                    socketWriter.append("Content-Lenght : " + f.length() + "\r\n");
                    socketWriter.append("Content-Type: text/html\r\n");
                    
                    while(f.canRead())
                        socketWriter.append(f.re)
                }

            } catch(Exception e)
            {
                e.printStackTrace();
            }
            StringBuilder builder=new StringBuilder();
            clientSocket.close();
            System.out.println("S-a terminat comunicarea cu clientul");
        }

    }
}
*/

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.FileInputStream;
import java.io.File;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

public class ServerWeb {
	public static void main(String[] args) throws IOException {
		System.out.println("#########################################################################");
		System.out.println("Serverul asculta potentiali clienti.");
		// pornește un server pe portul 5678 
		ServerSocket serverSocket = new ServerSocket(5678);
		FileInputStream fis = null;
		Socket clientSocket = null;
		while(true) {
			try {
				fis = null;
				// așteaptă conectarea unui client la server
				// metoda accept este blocantă
				// clientSocket - socket-ul clientului conectat
				clientSocket = serverSocket.accept();
				System.out.println("S-a conectat un client." + clientSocket.toString());
				// socketWriter - wrapper peste fluxul de ieșire folosit pentru a transmite date clientului
				PrintWriter socketWriter = new PrintWriter(clientSocket.getOutputStream(), true);
				// socketReader - wrapper peste fluxul de intrare folosit pentru a primi date de la client
				BufferedReader socketReader = new BufferedReader(new InputStreamReader(clientSocket.getInputStream(), "utf-8"));
				System.out.println("aici1");
				// este citită prima linie de text din cerere
				String linieDeStart = socketReader.readLine();
				System.out.println("aici2");
				if (linieDeStart == null) {
					clientSocket.close();
					System.out.println("S-a terminat comunicarea cu clientul - nu s-a primit niciun mesaj.");
					continue;
				}
				System.out.println("aici3");
				System.out.println("S-a citit linia de start din cerere: ##### " + linieDeStart + " #####");
				// mesajul citit este transmis la client
				// interpretarea sirului de caractere `linieDeStart` pentru a extrage numele resursei cerute
				String numeResursaCeruta = linieDeStart.split(" ")[1];
				if (numeResursaCeruta.equals("/")) {
					numeResursaCeruta = "/index.html";
				}
				// calea este relativa la directorul de unde a fost executat scriptul
				String numeFisier =  "../continut" + numeResursaCeruta;
				// trimiterea răspunsului HTTP
				File f = new File(numeFisier);
				if (f.exists()) {
					String numeExtensie = numeFisier.substring(numeFisier.lastIndexOf(".") + 1);
					String tipMedia;
					switch(numeExtensie) {
						case "html": tipMedia = "text/html"; break;
						case "css": tipMedia = "text/css"; break;
						case "js": tipMedia = "application/js"; break;
						case "png": tipMedia = "image/png"; break;
						case "jpg": tipMedia = "image/jpeg"; break;
						case "jpeg": tipMedia = "image/jpeg"; break;
						case "gif": tipMedia = "image/gif"; break;
						case "ico": tipMedia = "image/x-icon"; break;
						case "xml": tipMedia = "application/xml"; break;
						case "json": tipMedia = "application/json"; break;
						default: tipMedia = "text/plain";
					}
					
					socketWriter.print("HTTP/1.1 200 OK\r\n");
					socketWriter.print("Content-Length: " + f.length() + "\r\n");
					socketWriter.print("Content-Type: " + tipMedia +"\r\n");
					socketWriter.print("Server: My PW Server\r\n");
					socketWriter.print("\r\n");
					socketWriter.flush();
					
					fis = new FileInputStream(f);
					byte[] buffer = new byte[1024];
					int n = 0;
					while ((n = fis.read(buffer)) != -1) {
						clientSocket.getOutputStream().write(buffer, 0, n);
					}
					clientSocket.getOutputStream().flush();
					fis.close();
				} else {
					// daca fisierul nu exista trebuie trimis un mesaj de 404 Not Found
					String msg = "Eroare! Resursa ceruta " + numeResursaCeruta + " nu a putut fi gasita!";
					System.out.println(msg);
					socketWriter.print("HTTP/1.1 404 Not Found\r\n");
					socketWriter.print("Content-Length: " + msg.getBytes("UTF-8").length + "\r\n");
					socketWriter.print("Content-Type: text/plain; charset=utf-8\r\n");
					socketWriter.print("Server: My PW Server\r\n");
					socketWriter.print("\r\n");
					socketWriter.print(msg);
					socketWriter.flush();
				}
				// închide conexiunea cu clientul
				// la apelul metodei close() se închid automat fluxurile de intrare și ieșire (socketReader și socketWriter)
				clientSocket.close();
				System.out.println("S-a terminat comunicarea cu clientul.");
			} catch(Exception e) {
				e.printStackTrace();
			} finally {
				if (fis != null) {
					try {
						fis.close();
					} catch(Exception e) {}
				}
				if (clientSocket != null) {
					try {
						clientSocket.close();
					} catch(Exception e) {}
				}
			}
		}
		// închide serverul
		//serverSocket.close();
	}
}