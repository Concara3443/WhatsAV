# Como reiniciar WhatsAV

## Opcion 1: Usando el .bat
```
C:\Users\Administrator\Desktop\WinSW-Migration\individual\restart-whatsav.bat
```

## Opcion 2: Comando directo
```bash
C:\services\whatsav\whatsav.exe restart
```

## Opcion 3: PowerShell
```powershell
Restart-Service -Name whatsav -Force
```

## Ubicacion del servicio
- **Ejecutable:** `C:\services\whatsav\whatsav.exe`
- **Config:** `C:\services\whatsav\whatsav.xml`
- **Logs:** `C:\services\whatsav\whatsav.out.log` y `whatsav.err.log`
