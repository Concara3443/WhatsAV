# WhatsAV - Comandos del Servicio

## Ubicacion del servicio
```
C:\Users\Administrator\Desktop\WhatsAV-Service\
```

## Comandos

### Iniciar el servicio
```bash
cd C:\Users\Administrator\Desktop\WhatsAV-Service
./WhatsAV.exe start
```

### Detener el servicio
```bash
cd C:\Users\Administrator\Desktop\WhatsAV-Service
./WhatsAV.exe stop
```

### Reiniciar el servicio
```bash
cd C:\Users\Administrator\Desktop\WhatsAV-Service
./WhatsAV.exe restart
```

### Ver estado del servicio
```bash
cd C:\Users\Administrator\Desktop\WhatsAV-Service
./WhatsAV.exe status
```

### Reinstalar el servicio (si hay problemas)
```bash
cd C:\Users\Administrator\Desktop\WhatsAV-Service
./WhatsAV.exe stop
./WhatsAV.exe uninstall
./WhatsAV.exe install
./WhatsAV.exe start
```

## Logs
Los logs estan en:
- `C:\Users\Administrator\Desktop\WhatsAV-Service\WhatsAV.out.log`
- `C:\Users\Administrator\Desktop\WhatsAV-Service\WhatsAV.err.log`

## Sesion de WhatsApp
La sesion se guarda en:
```
C:\Users\Administrator\Documents\Github\WhatsAV\auth_info_baileys\
```

Si hay problemas de autenticacion, borrar esa carpeta y escanear QR de nuevo ejecutando manualmente:
```bash
cd C:\Users\Administrator\Documents\Github\WhatsAV
npm start
```
