# Impresión con QZ Tray

Cómo dejar la impresión directa andando: firma de peticiones en el servidor y
certificado de confianza en cada equipo. Ninguno de los dos pasos alcanza solo.

## Por qué hacen falta los dos

QZ Tray corre en la computadora del mostrador y expone un WebSocket. Cualquier
web puede intentar hablarle, así que exige autorización salvo que la petición
venga firmada por un certificado en el que confíe.

- **Firmar** (variables en el servidor) hace que QZ deje de ver la petición como
  anónima: en vez de «An anonymous request» muestra el nombre del negocio.
- **Confiar** (`override.crt` en cada equipo) es lo que corta las preguntas. Un
  certificado propio identifica, pero no da confianza por sí solo.

## 1. Generar el par

El certificado tiene que ser **X.509 v3 con `basicConstraints=CA:TRUE`**. Sin
las extensiones, `openssl req -x509` genera un v1 y QZ falla al importarlo con
«An exception occurred importing the certificate»: es Java buscando
`BasicConstraints` en un certificado que no las tiene.

```sh
openssl req -x509 -newkey rsa:2048 -sha256 -days 7300 -nodes \
  -keyout qz-private-key.pem -out qz-certificate.crt \
  -subj "/CN=Danza Con Altura/O=Danza Con Altura/C=BO" \
  -addext "basicConstraints=critical,CA:TRUE" \
  -addext "keyUsage=critical,digitalSignature,keyCertSign,cRLSign" \
  -addext "subjectKeyIdentifier=hash"
```

Comprobar que quedó bien antes de seguir:

```sh
openssl x509 -in qz-certificate.crt -noout -text | grep -E "Version:|CA:"
# Version: 3 (0x2)
#   CA:TRUE
```

La clave privada no se comparte ni se sube al repo (`.gitignore` cubre `*.pem`,
`*.crt` y `*.key`). El certificado sí es público.

## 2. Cargar las variables en el servidor

En Coolify, en el recurso de FolkloreSoft → **Environment Variables**:

| Variable | Contenido |
| --- | --- |
| `QZ_PRIVATE_KEY` | `qz-private-key.pem` completo, con las líneas BEGIN/END |
| `QZ_CERTIFICATE` | `qz-certificate.crt` completo, ídem |

Después, **Redeploy**. Las dos están declaradas en `docker-compose.yml`; si no
estuvieran ahí, no llegarían al contenedor por más que Coolify las tenga.

No importa cómo quede el formato del PEM: `QzService.normalizarPem` toma las
marcas BEGIN/END, limpia el cuerpo de todo lo que no sea base64 y lo rearma en
líneas de 64. Está probado contra saltos aplastados a espacios (lo que hace
Coolify), `\n` literales (docker), tabs y todo en una línea.

## 3. Confiar en el certificado, equipo por equipo

**No usar el importador de QZ.** El diálogo de Site Manager espera certificados
firmados por la CA de QZ y falla con uno propio. El camino es copiar el archivo:

1. Cerrar QZ Tray del todo: ícono en la bandeja → **Exit**. Minimizar no sirve.
2. Copiar el certificado renombrado como `override.crt`:
   - Windows: `C:\Program Files\QZ Tray\override.crt` (pide permisos de admin)
   - macOS: `/Applications/QZ Tray.app/Contents/Resources/override.crt`
   - Linux: `/opt/qz-tray/override.crt`
3. Verificar que el nombre no haya quedado como `override.crt.crt`, que es lo
   que pasa si Windows tiene ocultas las extensiones conocidas.
4. Abrir QZ Tray de nuevo.

El archivo se puede bajar ya nombrado desde **Configuración → QZ Tray →
Descargar override.crt**, entrando al sistema desde la misma máquina que lo
necesita.

## Diagnóstico

`Configuración` muestra qué llegó a cada variable: la etiqueta del PEM, su largo
y el problema concreto. Los casos que distingue:

| Lo que muestra | Qué pasó |
| --- | --- |
| `Se esperaba una clave privada y llegó un "CERTIFICATE"` | Se pegó el certificado en las dos variables |
| `Falta la línea END: el valor llegó cortado` | El valor se truncó al pegarlo |
| `La variable está vacía o no existe` | No llegó al contenedor |
| `No tiene las marcas BEGIN/END de un PEM` | Se pegó sólo el cuerpo base64 |

## Formato del ticket

Por defecto se imprime en **ESC/POS**: comandos crudos, sin driver de por medio.
Es lo único que corta el papel entre el comprobante y la comanda, y sale nítido
sin depender de la densidad que reporte el driver. El ancho manda: 48 columnas
en papel de 80 mm, 32 en 58 mm, y todo el layout se arma contra ese número.

El texto se translitera a ASCII antes de mandarlo porque estas impresoras usan
CP437 o CP850, no UTF-8: los acentos saldrían como símbolos sueltos.

Si la impresora no es térmica, en Configuración se puede cambiar a **HTML
rasterizado**, que imprime la misma vista previa como imagen. Ahí sí importa la
densidad en DPI, porque es la resolución con la que se rasteriza.

## Si QZ no conecta

«Unable to establish connection» con QZ abierto casi siempre es el certificado
de `localhost`: la página va por HTTPS y el navegador rechaza el certificado
propio de QZ. Se entra una vez a <https://localhost:8181>, se acepta la
advertencia, y funciona.
