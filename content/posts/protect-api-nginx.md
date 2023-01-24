---
title: "Protege tu API con NGINX"
date: 2023-01-21
tags: ["Gnu", "Linux", "NGINX", "Tutoriales", "API", "Seguridad"]
categories: ["Linux", "Tutoriales", "NGINX"]
author: "VentGrey"
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "Nunca bajes la guarda, protege tus API como protegerías cualquier otro despliegue en un servidor."
canonicalURL: "https://ventgrey.github.io/posts/protect-api-nginx/"
disableHLJS: true # to disable highlightjs
disableShare: false
disableHLJS: false
hideSummary: false
searchHidden: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowWordCount: true
ShowRssButtonInSectionTermList: true
UseHugoToc: true
cover:
    image: "/img/posts/apiprotect/cover.png" # image path/url
    alt: "Imágen del post" # alt text
    caption: "Imágen del post" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/<path_to_repo>/content"
    Text: "Sugerir Cambios" # edit text
    appendFilePath: true # to append file path to Edit link
---

# Como sysadmin, tu deber es asumir lo peor y prepararte para ello.

No es noticia nueva que, al estar todos conectados al internet, todos sufrimos (o sufriremos) del mismo mal, la misma plaga de siempre, la mala hierba que nunca muere. Los """hackers""", script kiddies o incluso los mismos usuarios curiosos pueden llegar a dañar una parte fundamental de la infraestructura de muchas compañías o incluso de freelances / programadores por hobby. Las API's.

Las API se han convertido en una parte esencial de la infraestructura digital de muchas personas y empresas. Sin embargo, si no las protegemos adecuadamente, las API también pueden exponer tu infraestructura a riesgos de seguridad o de censura, como ataques DDoS (*Distributed Denial Of Service*) o acceso no autorizado por parte de script kiddies, informáticos curiosos o directamente delincuentes que pueden robar datos confidenciales, como información de tus clientes, datos de la empresa o prersonales e incluso los hashes de las contraseñas almacenadas en la base de datos aunque... si se roban las contraseñas de tus clientes en texto plano mejor prepárate para la demanda y para dedicarte a otra cosa.

No te preocupes, en este blog te voy a enseñar algunos tips y trucos que podrás implementar en tu servidor para proteger tus API de usuarios no solicitados o problemáticos, mencionados en este blog como *metiches*.


## Hora de cifrar el tráfico con SSL/TLS

El primer paso para proteger una API es usar SSL/TLS para cifrar el tráfico. Esto significa que los datos que se envían entre nuestro servidor y el cliente (en este caso, NGINX o el mismo usuario que consume nuestra API) se cifran con una clave que solo nosotros conocemos. El servidor y el cliente pueden entonces intercambiar datos de forma segura sin preocuparnos de que los metiches lean nuestros datos o los manipule usando sofware especial para ello.

El uso de HTTPS solo nos protegerá contra ataques de intermediarios o de hombre en el medio (*MITM, siglas por Man In The Middle*) como los descritos anteriormente. Incluso si alguien ha interceptado una de las peticiones que se envían entre el servidor y los clientes, no podrán ver lo que hay dentro porque los contenidos estarán cifrados.

Eso si, si consiguen vulnerar nuestra llave, estamos en muchos problemas.

Hay varias formas y estrategias para cifrar el tráfico, podemos cifrar solamente el tráfico de nuestro servidor a los clientes que consuman recursos del mismo, hasta aplicar una "doble capa", pasando nuestra API por un proxy reverso con su propio certificado y esos datos enviarlos cifrados por HTTPS a nuestro cliente con otro certificado.

Como documentar las dos formas haría de este blog una copia del periódico local de tu ciudad, optaré por dar ejemplos genéricos esta vez. Ademaś, no voy a cubrir como obtener un certificado SSL ¿Por qué? Bueno, aquí en [La Esquina Gris](https://ventgrey.github.io/) ya hay un *vergo* de blogs que te enseñan a usar certbot y si no, puedes [generarlo tu mismo](https://www.suse.com/support/kb/doc/?id=000018152) con OpenSSL:

### Para cifrar una conexión upstream

Suponiendo que nuestra API está en Node.JS (O en PocketBase como en [este blog](https://ventgrey.github.io/posts/desplegar-pocketbase/)) y estamos utilizando un reverse proxy para consultarla:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.sitio.com;

    location / {
        
        # [Directivas recortadas]
    
        proxy_pass http://localhost:8090;
        
        proxy_ssl_certificate /etc/nginx/certificados/client.pem;
        proxy_ssl_certificate_key /etc/nginx/certificados/client.key;
    }
}
```

Ahora, si estás usando un certificado hecho por ti mismo, lamento decirte que probablemente recibas quejas de que ese certificado no lo emitió una entidad certificadora *confiable*. (Gran mamada, dijo Dross). Para esto, podemos usar la directiva `proxy_ssl_verify` y poner su valor en `off`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.sitio.com;

    location / {
        
        # [Directivas recortadas]
    
        proxy_pass http://localhost:8090;
       
        proxy_ssl_verify off;
        proxy_ssl_certificate /etc/nginx/certificados/client.pem;
        proxy_ssl_certificate_key /etc/nginx/certificados/client.key;
    }
}
```

### Para cifrar una conexión cliente <--> servidor

Podría escribir aquí: *"La forma de toda la vida"*, sin embargo y como dijeron los angloparlantes *for the sake of example*, pondré un ejemplo de configuración aquí, aunque, lo mejor sería que usaras certbot si no tienes una forma de generar certificados confiables propios:

```nginx
server {
    listen      443 ssl;
    server_name api.sitio.com;

    ssl_certificate /etc/letsencrypt/live/api.sitio.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.sitio.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


    location /api/ {
        proxy_pass http://localhost:8090;
    }
```



## Limitar la tasa de llamadas a la API. (rate limiting)

Limitar la tasa de llamadas a la API es una de las formas más efectivas que tenemos para proteger nuestra infraestructura de posibles ataques dirigidos a nuestras API. En si debemos tener en cuenta dos cosas antes de tomar acción:

- Poner un límite en las peticiones por segundo, minuto u hora. Afortunadamente para nosotros, NGINX no está limitado a esto, también podemos poner un límite de peticiones permitidas por día e incluso por mes. Esto evitará que cualquiera sobrecargue el servidor enviando miles de peticiones de golpe.

- Crear un límite basado en direcciones IP o (*user agents*) que en pocas palabras es el navegador. Este enfoque tiene sentido si el atacante utiliza varias direcciones IP o navegadores de diferentes ubicaciones en el mundo. Si esto llega a ocurrir, podrían ser temporal (o permantentemente) bloqueados de usar tu API.

### Límites básicos

Vamos a explorar una forma de limitar de forma básica las llamadas a una API desde NGINX. La manera más sencilla de lograr esto es usando las dos directivas de NGINX, `limit_req_zone` y `limit_req`. Vamos a explicarlas primero.

La directiva `limit_req_zone` define los parámetros que para limitar la tasa de llamadas, va de la mano con `limit_req` que habilita los límites de la tasa de llamadas en un contexto específico. Veamos un ejemplo con un archivo `/etc/nginx/sites-available/api.sitio.com`:

```nginx
# La directiva limit_req_zone debe estar fuera del bloque server {}

limit_req_zone $binary_remote_addr zone=api_limit:10m rate=5r/s

server {
    server_name api.sitio.com;
    root /var/www/html/sitio.com;
    
    # Cosas
    ...
}
```

Con esto definimos una regla que, indicará que, la zona `api_limit` tendrá un límite impuesto de 5 peticiones por segundo cada 10 minutos. Con esta directiva estamos cubriendo el primer caso de uso, que es el establecer un límite de peticiones por segundo, minuto u hora. Sin embargo, esto no es suficiente, debemos indicarle a NGINX usando la directiva `limit_req` el contexto mencionado anteriormente. Este código ya podemos ponerlo dentro del bloque `server {}`. Veamos un ejemplo con el código de NGINX anterior:

```nginx
# La directiva limit_req_zone debe estar fuera del bloque server {}

limit_req_zone $binary_remote_addr zone=api_limit:10m rate=5r/s

server {
    server_name api.sitio.com;
    root /var/www/html/sitio.com;
    
    location /api/ {
        limit_req zone=api_limit;
    }
}
```

> Nota: La directiva `limit_req` puede ser usada en el contexto completo de `server {}` o podemos usarla para un control más granulado en los contextos de `location / {}`.

Si alguien excede el límite de peticiones por el tiempo definido, NGINX responderá automáticamente con un error `503 Service Unavailable` es posible cambiar este error por un [error 429](https://codigoshttp.com/429/) en caso de que no querramos confundir a los clientes de nuestra API. Para esto solo necesitamos añadir la directiva `limit_req_status 429;` debajo de la primer directiva.

### Manejar peticiones "burst"

> En el internet, el juaker corre libre. Pero llegan los sysadmins, sus cazadores naturales...

Okay, tenemos esos límites de peticiones. Eso no soluciona todos nuestros problemas. Suponiendo que nuestra API regresa un JSON de varios MB/GB (suponiendo, dije), podrían ser problemáticas para nosotros incluso si están dentro del límite. No queremos que, dentro de nuestro límite de 5 peticiones por segundo, alguien pida nuestro JSON de 2GB dos veces en menos de 300ms (*milisegundos*).

Para esto, podemos añadir un parámetro a la directiva `limit_req` llamado `burst`. Esto funcionará poniendo un límite en la "continuidad" de las peticiones hechas al servidor, Si tenemos un límite de 10 peticiones por segundo, quiere decir (más o menos) una petición cada 100 milisegundos. Si una petición llega antes de 100 milisegundos se pondrá "en cola" hasta que el pase el tiempo que el servidor espera. 

Con esto podemos evitar la pronta saturación de APIs grandes. Veamos como quedaría:

```nginx
# La directiva limit_req_zone debe estar fuera del bloque server {}

limit_req_zone $binary_remote_addr zone=api_limit:10m rate=5r/s

server {
    server_name api.sitio.com;
    root /var/www/html/sitio.com;
    
    location /api/ {
        limit_req zone=api_limit burst=5;
    }
}
```

Al asignarle a `burst` un valor de `5`, si llegamos a tener 6 peticiones "de golpe", solo la primer petición entrará al servidor, las otras se irán a la cola. Si se supera el número de peticiones permitidas NGINX volverá a regresar el error 503.

Podemos llevar esto un paso más alla, usando el [módulo de geoip](https://nginx.org/en/docs/http/ngx_http_geoip_module.html) de NGINX. Sin embargo, como amo el suspenso (y solo lo he implementado tres veces en toda mi vida), dejaré eso en tus manos, lector. Este módulo es especialmente útil si quieres limitar el acceso / uso de tus sitios a ciertas direcciones.

En casos de uso como sitios de uso exclusivo para la población de un país, puede ser útil.

Otra cosa útil en este tema es limitar las peticiones por ancho de banda usado. Esto podemos lograrlo con la directiva `limit_rate` y aplicarlo en nuestro bloque anterior:

```nginx
# La directiva limit_req_zone debe estar fuera del bloque server {}

limit_req_zone $binary_remote_addr zone=api_limit:10m rate=5r/s

server {
    server_name api.sitio.com;
    root /var/www/html/sitio.com;
    
    location /api/ {
        limit_req zone=api_limit burst=5;
        limit_rate 120k;
    }
}
```

> La directiva `limit_rate` solamente puede ser usada dentro de `location {}`, `server {}` y `http {}`. El tamaño lo podemos especificar por `m` (Megabytes), `g` (gigabytes) y `k` (kilobytes).

Si queremos llevar esto aún más lejos podemos usar la directiva `limit_rate_after` y especificar que, luego de cierta cantidad de datos descargada, se limite su velocidad o disponiblidad. Por ejemplo la directiva `limit_rate_after 5m;` comenzará a "alentar" o interumpir completamente la descarga de datos luego de que esta sobrepase los 5 megabytes.

Podemos llevar esto aún más lejos con directivas como `limit_conn`, y directivas como `map $slow $rate {}`. Sin embargo, a estas alturas de la sección, ya me da una pereza colosal documentar su uso. Siempre puedes hacer `man nginx` y leer por tu cuenta ;)

## Bloqueando las IP maliciosas

Limitar una dirección IP puede ser considerada una tarea común al momento de proteger nuestra infraestructura de servidor. Limitar las llamadas o el ancho de banda puede no ser suficiente si tenemos un usuario bastante apasionado, o bastante *castroso* por ponerlo en términos más vulgares.

Las direcciones IP las podemos bloquear dentro de los contextos `http {}`, `server {}` y `location {}` para un control más específico de los recursos. Por lo que, es posible bloquear ciertas direcciones de una ruta, pero no del sitio completo, o directamente bloquearlas de acceder a cualquier recurso que esté en nuestro servidor.

Supongamos que tenemos una API de perros y tenemos una gatita que le gusta el mambo..pero no los perros. Esta gatita anda de maldosa con nuestra API y nos toca banearla por andar de cábula, sin embargo, como ella ve los anuncios de nuestro sitio, no nos conviene que pierda el acceso, podemos hacer algo así para proteger nuestra api pero no nuestro contenido principal:

```nginx
server {
    server_name sitio.com;
    root /var/www/html/sitio.com;
   
    location / {
        # Sitio principal
    }
   
    location /api/prros {
        deny 8.8.8.8; # La IP son los DNS de google, no quiero quemar IPs aquí
        # API
    }
}
```

Ahora, si, disfruta de nuestro sitio principal 😎👌


..Pero no de nuestra API 😳🕶👌

La directiva `deny` no está limitada a una sola llamada. Podemos añadir tantas como necesitemos para proteger nuestro sitio. Podemos combinar esto con la directiva `allow` para crear listas blancas o negras:

```nginx
deny 8.8.8.8; # Banhammer a Google
deny 1.1.1.1; # Banhammer a CloudFlare
allow all; # Bienvenidos todos los demás xD
```

Si queremos hacer esto un poco más dinámico podemos crear un [hash table](https://nginx.org/en/docs/hash.html) de NGINX y ahí colocar las direcciones a denegar, podemos hacer esto en el mismo archivo del sitio o crear un externo para evitar manejar un archivo de *chorromil* líneas:

```nginx
map $remote_addr $block {
    8.8.8.8
    8.8.4.4
    1.1.1.1
    2.2.2.2
}

...

server {
    if ($block) {
        return 403;
    }
}
```

## Protege tu servidor contra un DoS / DDoS

Como sysadmin debes asegurarte de que tu API esté protegida contra ataques DDoS. El desarrollador no lo va a hacer (*o probablemente no sabe como*).

Un DDoS es un ataque de denegación de servicio distribuido, que es un intento de hacer que una máquina o recurso de red no esté disponible para sus usuarios o los administradores del mismo. Un ataque DDoS puede presentarse de muchísimas formas, desde una sobrecarga de paquetes de red, hasta técnicas como [swap trashing](https://www.youtube.com/watch?v=lqqmopULcrg), entre otras. La forma más común consiste en inundar el objetivo con tráfico de múltiples fuentes hasta que se satura y deja de funcionar correctamente.

Combinando los conocimientos previos podemos crear una protección lo suficientemente robusta para soportar ataques pequeños sin darnos cuenta, podemos extender esto usando algunas directivas extra en nuestros bloques de `server {}` o `location {}` para otorgarle ese *UFF* que le falta a nuestra configuración:

### Matar conexiones lentas

`client_body_timeout <segundos>` y `client_header_timeout <segundos>`. Si NGINX no puede escribir los headers o el cuerpo de los clientes en menos de los segundos que indiquemos, cerrará la conexión en automático. Esto es especialmente útil para matar conexiones lentas, pues, si tenemos una conexión lenta en nuestro servidor y permanece ahí mucho tiempo, puede mermar nuestra capacidad de crear conexiones nuevas y de mejor calidad.

### Darle la vuelta al tazo con `deny` y `allow`

Ya vimos como crear una lista negra de direcciones IP, pero ¿y si quisieramos el caso contrario? Para crear una lista blanca y solo permitir el acceso de nuestros recursos a ciertas direcciones IP, podemos hacer lo siguiente:

```nginx
location /api/ {
    allow 8.8.8.8;
    allow 1.1.1.1;
    deny all;
    # Cosas de API
}
```

Ahora los recursos de `/api/` solo podran ser utilizados si aceedes a ellos desde la dirección `8.8.8.8` o `1.1.1.1`. Cualquier otra dirección IP será bloqueada.

Esto puede ser útil si, por ejemplo, solo puedes conectarte a tu servidor usando una VPN. Puedes restringir el acceso de tus recursos confidenciales e *importantes* a las personas que tengan acceso a tu VPN y a nadie más.

### Usar `deny` a nuestro favor en algunos recursos

Los bots son las cosas más divertidas de trollear, porque los programadores son fáciles de ofender y aun más fáciles de hacer enojar cuando truenas algo que hicieron. Por eso te recomiendo que, si tus logs dicen que una (o varias) direcciones están intentando acceder demasiadas veces a tu archivo `secretos.html`, puedes denegarles el acceso *alv* (a la voz):

```nginx
location /secretos.html {
    deny all;
}
```

### Bloquear agentes de usuario

Esto es más un *workaround* que una mitigación en si. A veces los webscrappers o los bots pueden abusar de los recursos de nuestros sitios, si bien hoy en día es casi imposible detenerlos, lo menos que podemos hacer es ponerle algo de dificultad a su trabajo. Una de las cosas que podemos hacer es bloquear los [user agents](https://es.wikipedia.org/wiki/Agente_de_usuario) que no querramos en nuestro sitio.

Si la persona realizando una actividad maliciosa es más despistada que los que llaman grados *centígrados* a los grados **Celcius**, dejará su User Agent con valores basura como `foo`, `bar`, `ham`, `eggs` o `asdfg` si ya es muy descarado. Con NGINX podemos proteger nuestros recursos de la siguiente manera:

```nginx
location /api/imagenes {
    if ($http_user_agent ~* foo|bar|ham|eggs|asdfg) {
        return 403;
    }
    # Cosas de API
}
```

Esto no se limita a solo palabras sencillas, podemos bloquear strings de agentes de usuario de navegadores o tratarlas de forma diferente y aplicar alguna mala jugada como las que FAANG/MAANG hace a diario y limitar el rendimiento de tus usuarios basado en su navegador. Quien sabe, podrías hacer que la gente con Google Chrome no pueda acceder o que la gente que utiliza Firefox tenga su ancho de banda limitado:

```nginx

location /api/imagenes {
    if ($http_user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36") {
        return 403;
    }
    # Cosas de API
}
```

En este caso los User Agents de los navegadores cambian de forma constante y no son los mismos entre plataformas. El user agent del ejemplo es para una versión específica de Chrome (`109.0.0.0`) de windows de 64 bits. Con la mínima variación, ya no funcionará pero, ey, siempre puedes usar expresiones regulares para lograr tus cometido:

```nginx
location /api/imagenes {
    if ($http_user_agent ~* "Edg") {
        return 403;
    }
    # Cosas de API
}
```

PD: No lo hagas, si lo haces, te voy a buscar y te voy a obligar a leer al menos 200 veces el manifiesto de software libre hasta que entiendas el daño que estás haciendo. Pero no me enojo si le juegas una de esas a Edge de M-soft.


## Conclusión

NGINX es una gran herramienta para proteger nuestras API porque tiene una variedad de directivas y formas de llegar a un mismo resultado que ayudan a proteger una aplicación, así como documentación sobre cómo usar esas funciones. La parte más divertida es usarlo para proteger la infraestructura de las porquerías que hace el programador luego y de paso hacer enojar a los *juakers* que rondan en internet.

Además, NGINX es de código libre (Licencia de FreeBSD) y lo mejor de todo es que es gratis para todo el que desee usarlo.

No mencioné una última técnica conocida como *"Data masking"*. No tengo otra cosa más que decir al respecto salvo que me dio flojera escribir acerca de ello. Espero traer un blog 100% dedicado a enmascarar datos confidenciales para evitar el filtrado de los mismos.

Eso es todo por el momento, si te gustó este blog compártelo con tus amigos y activa el RSS si deseas recibir actualizaciones cada que escriba una nueva entrada :) 

> Hay un profundo prejuicio en mí que eclipsa toda razón interior.

---

¿Te gustan estos blogs? Ayúdame a seguir escribiéndolos de las siguientes formas:
- [Invítame unos chicles xd](https://ko-fi.com/ventgrey)
- [Regálame un follow en GitHub ❤](https://github.com/VentGrey)
