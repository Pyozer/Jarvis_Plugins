@echo off
echo
echo ******************* ATTENTION ********************
echo
echo Vous allez generer les certificats SSL pour SCRIBE et ecraser les fichiers actuels. 
pause Appuyez sur CTRL-C maintenant pour annuler !
set OPENSSL_CONF=C:\Jarvis\server\app\bin\openssl.cnf
C:\Jarvis\server\app\bin\openssl.exe req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 3650 -nodes -subj "/C=FR/ST=SARAH/L=SARAH/O=SARAH/OU=SARAH/CN=127.0.0.1/CN=192.168.0.11/CN=88.164.230.33"
del .rnd
echo Les certificats ont ete generes pour 10 ans ! 
echo Vous etes pret a utiliser les plugins bases sur SCRIBE !
pause
exit