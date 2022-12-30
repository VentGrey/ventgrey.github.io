---
title: "Desplegar PocketBase con NGINX en Ubuntu Server"
date: 2022-11-02
tags: ["Gnu", "Linux", "NGINX", "Tutoriales", "Pocketbase"]
categories: ["Linux", "Tutoriales", "Pocketbase"]
author: "VentGrey"
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "Un rayito de luz para los que queremos un poco de independencia en esta pandemia de tanto SaaS, PaaS y tanto *aaS haya hoy."
canonicalURL: "https://ventgrey.github.io/posts/desplegar-pocketbase/"
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
    image: "/img/posts/pocketbase/cover.png" # image path/url
    alt: "Imágen del post" # alt text
    caption: "Imágen del post" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/<path_to_repo>/content"
    Text: "Sugerir Cambios" # edit text
    appendFilePath: true # to append file path to Edit link
---

# ¿Firebase? ¿Supabase? No gracias, soy hombre simple.

Hace poco descubrí un proyecto asombroso gracias al canal de [Fireship](https://fireship.io/), este proyecto se llama *"Pocketbase"* y es asombroso. Piensa en Firebase o Supabase pero, literalmente, "De bolsillo". Algo así es PocketBase. Una
base de datos / PaaS ideal para proyectos pequeños-medianos que necesitan de un backend o incluso una REST API sencilla.

Otra cosa interesante de PocketBase es que no usa una base de datos como MySQL, PostgreSQL o SQLServer. Pocketbase usa *SQLite3* para almacenar los datos. La cosa graciosa es que...bueno, *SQLite* es una base de datos muy malentendida, más que nada gracias a informáticos chafas, que han repetido puntos negativos que, o bien ya fueron arreglados o falsos en un todo. 

PocketBase utiliza *SQLite3* con modo *WAL* y, según la [página de preguntas frecuentes](https://pocketbase.io/faq/) puede llegar a superar el rendimiento de otras bases de datos para operaciones de lectura. Si eso es cierto o no [te invito a comprobarlo](https://ericdraken.com/sqlite-performance-testing/) por tu cuenta.


## En el mundo del *-as-a-service aun hay esperanza.

![soyrverless](/img/posts/pocketbase/soy-verless.jpg)

No soy muy fan de las cosas *"As a service"*, uno podría usar el ya desgastado argumento de *"P-pero es que es más barato"*. Sin embargo en muchos casos (inclusive fuera de la tecnología) lo *"barato"* tiene sus puntos débiles. Principalmente porque depositas o dejas tu dependencia de dicho servicio en las manos de terceros. Acompañado del primer argumento viene el "Pero es que **M.A.A.N.G** nunca falla", "Es muy raro que un servicio así falle", "Es poco el downtime que llegan a tener".

Esto no podría estar más alejado de la verdad, manejar un servicio para tantos usuarios y de esas dimensiones es una tarea colosal, el downtime es algo que va a pasar si o si, no importa el tamaño de la empresa ni lo caro de los servicios.

Si no crees lo que te digo, aquí están los servicios y los downtimes que han tenido en el año 2022, todas las páginas son las "oficiales":

- [Downtime y errores de servicio de Google Cloud](https://status.cloud.google.com/summary)
- [Lista de incidentes de GitHub](https://www.githubstatus.com/history)
- [Downtime y lista de incidentes de Vercel](https://www.vercel-status.com/)
- [Downtime y lista de incidentes de Netlify](https://www.netlifystatus.com/history)
- [Lista de incidentes de Heroku](https://status.heroku.com/incidents)

Todos estos proveedores de SaaS (*Software as a Service*) o *CaaS* (Cosas as a Service xD). Siendo los gigantes tecnológicos que son no están libres del famoso *"¿Quién la cagó?"*, frase atribuida al que tira producción, sea humano o máquina. 

### No me malentiendas, If I had a mind to I wouldn't want to think like you

**OJO** no digo que todo el "*-as-a-service" sea malo, lo que digo es que la dependencia extrema del mismo tiene potencial de ser dañina para quien lo consume. Para muestra las pérdidas generadas por el incendio y fallo de [OVHcloud](https://www.datacenterdynamics.com/en/news/ovhcloud-reports-14-percent-growth-but-last-years-fire-caused-a-loss/) en 2021, donde OVHcloud tuvo que cubrir 3 millones de Euros de su propia bolsa, sumado a eso, las [demandas presentadas](https://www.datacenterdynamics.com/en/news/ovhcloud-fire-losses-103-join-class-action-four-firms-sue-individually/) para pedir compensasión por las pérdidas monetarias generadas que se estiman en 9.2 millones de Euros de acuerdo con el [JournalDuNet](https://www.journaldunet.com/web-tech/cloud/1509029-exclusif-103-entreprises-reclament-plus-de-9-millions-d-euros-de-dedommagement-a-ovh/?utm_campaign=Quotidienne_2022-02-04&utm_medium=email&seen=2&utm_source=MagNews&een=5a09c20e56d482d345813f3f04d0bace).

La cura esta dependencia extrema a los proveedores externos siempre existe el *self-hosting* que básicamente es mantener tu propia infraestructura. A esta práctica también la acompañan los argumentos pedorros. "Si **M.A.A.N.G** tiene downtime o errores ¿Qué esperanza tienes tú?", "Ellos tienen ingenieros con x años de experiencia, tu nada más eres uno.", "Es que ellos entregan mejor calidad", etc. A esto no puedo responder algo más concreto que "*hay de dos sopas*".

1.  Son informáticos con pedos muy serios de confianza en si mismos 
2.  De plano desarrollaron una dependencia tan fuerte que raya en el grado de lamer una bota.

De nuevo, con esto no digo que deberías alojar todo por ti mismo (si puedes hacerlo, mejor), sin embargo, si los servicios son para ti mismo claro que es posible manejar tu propia infraestructura, como muestra tengo el [monitoreo de uptime de UpVent](https://stats.uptimerobot.com/qXywYt1lg9) que, si observas a detalle podrás notar que en efecto, el sitio principal sufrió downtime y el API tuvo una pausa. Ahora te invito a ver el downtime del sitio principal, fue de 4 minutos algo mucho menor si lo comparamos con los downtimes mencionados anteriormente y claro, es porque mantener un servidor "personal" con infraestructura para pocas personas no es una tarea realmente titánica, menos si eres un buen sysadmin y sabes y conoces las herramientas adecuadas para no mover ni un solo dedo en meses y que tus servidores funcionen *como si nada*. En mi caso solo dependo de 3 servicios en la nube, mi proveedor de VPS [Linode](https://www.linode.com/lp/refer/?r=2b48a57a9c813fa9972e3287171358c4f36746af), [GitHub](https://github.com/UpVent) para alojar el código fuente y [Uptime Robot](https://uptimerobot.com/?rid=89ab54e5cbe447) para monitorear mis sitios. Y si, planeo reducir esa dependencia en un futuro.

## ¿Y esto en qué afecta a Ultra Lord? (¿Qué tiene que ver Pocketbase?)

PocketBase nos ofrece una forma sencilla de sustituir un SaaS como lo son Supabase y Firebase. Esto con sus respectivas ventajas, por ejemplo, Firebase no es realmente económico y, salvo que sea un experimento su plan *"gratis"* no ofrece mucho realmente, además de que, si en algún momento necesitamos migrar de servicio tendremos una tarea monumental entre manos.

Con Supabase las cosas cambian un poco, también tienen un plan gratis y con ese hay un poco más de espacio para maniobrar. Sin embargo, para hacer *self-hosting* de Supabase no tengo palabras salvo *"es un santísimo pedo"* de repositorios, contenedores, configuraciones y dios sabrá que cosas más en el futuro. 

Aquí es donde entra PocketBase, a diferencia de las otras dos mencionadas, Pocketbase no ofrece plan en la nube ni nada *as a service*, todo es *self hosted* si o si. No requiere de mucho mantenimiento, es bastante ligera (11.7 MB cuando se escribió este blog) sin dependencias extra. Y eso es lo que aprenderemos a hacer en este blog, desplegar Pocketbase por nosotros mismos y aprender a explotarla a nuestro favor.

## Preparando el entorno para Pocketbase

Para empezar a usar PocketBase tenemos una lista de pre-requisitos que, si conoces este blog ya debería ser evidente para ti, aun así listaré las cosas que necesitamos:

- Un servidor con Ubuntu y acceso por SSH a dicho servidor.
- NGINX instalado en nuestro servidor.
- wget instalado en nuestro servidor.
- Un dominio a donde apuntar nuestra base de datos. 
- unzip instalado en nuestro sevidor.
- Certbot con soporte de nginx.
- Paciencia.

Prácticamente es todo lo que necesitamos para comenzar a trabajar con PocketBase. Es hora de acceder a nuestro servidor web por medio de ssh y comenzar a trabajar.

## Comenzar a trabajar con PocketBase

Una vez dentro de nuestro servidor será necesario seguir estos pasos para tener una instancia de PocketBase funcional en poco tiempo:

### Instalar dependencias

Primero lo primero, necesitamos instalar nuestras dependencias para que todo funcione correctamente, en nuestro caso solo necesitamos de NGINX y wget. Esto podemos hacerlo de la siguiente forma:

```sh
$ sudo apt install nginx wget unzip certbot python3-certbot-nginx -y
```

Una vez instalados, si nuestro servidor Ubuntu viene con un firewall incluido debemos habilitar el uso de NGINX en el mismo. Usualmente Ubuntu viene con `ufw`, si es tu caso puedes habilitar el acceso de NGINX con la siguiente orden:

```sh
$ sudo ufw allow 'Nginx Full'
```

Listo, ya tenemos todo lo necesario para ganar. Ahora si, a picarle.


### Descargar pocketbase en un directorio especial.

Como buena práctica de sysadmins, vamos a proteger nuestra base de datos para que un solo usuario de unix pueda acceder y manipularla. Así no la dejamos expuesta en el directorio `/var/www/html` que nos provee NGINX. Para esto vamos a crear un nuevo usuario, en nuestro caso vamos a ponerle `camel` nomas porque si. 

Para crear a nuestro usuario con todo y mole debemos ejecutar la siguiente línea y llenar los campos que nos pida el script:

```sh
$ sudo adduser camel
```

> Nota: Recuerda que `adduser` es un wrapperscript encima de `useradd`. Si prefieres algo más "artesanal" puedes optar por sustituirel uso de `adduser` por `useradd` y personalizar más el usuario que haremos.

Una vez creado nuestro usuario entramos en su directorio home y descargamos PocketBase en el mismo:

```sh
# Ingresar al directorio /home del usuario
$ sudo su - camel

# Una vez dentro del nuevo usuario
$ cd
```

Ahora debemos descargar PocketBase usando wget:

```sh
$ wget -O pocketbase.zip https://github.com/pocketbase/pocketbase/releases/download/v0.7.9/pocketbase_0.7.9_linux_amd64.zip
```

> Nota: La versión de PocketBase puede ser diferente a cuando escribí este blog. Ante la duda siempre puedes bajar la última versión de Pocketbase en el siguiente [enlace](https://github.com/pocketbase/pocketbase/releases/latest).

Cuando Pocketbase se termine de descargar debemos extraerla, darle permisos y ejecutarla al menos una vez para que el directorio de datos se cree por primera vez:

```sh
# Descomprimir PocketBase
$ unzip pocketbase.zip

# Dar permisos y elminar los archivos innecesarios
$ chmod +x pocketbase && rm pocketbase.zip LICENSE.md

# Ejecutar pocketbase una vez para crear el directorio de archivos
./pocketbase

# Cancelar la ejecución con Ctrl-c
^C
```

Si hicimos todo de forma correcta, al ejecutar el comando `ls` deberíamos ver un nuevo directorio llamado `pb_data`. Si este directorio existe, podemos continuar, todo salió correctamente.

### Crear un servicio de systemd

Llegó el momento de cerrar la sesión del usuario `camel` que hicimos anteriormente y llegó el momento de pasar a hacer tareas administrativas. En nuestro caso es momento de crear un servicio de systemd que nos permita controlar el uso del binario de pocketbase correctamente.

Vamos a ejecutar la siguiente orden para abrir un nuevo archivo con Vim:

```sh
$ sudo vim /lib/systemd/system/pocketbase.service
```

Ahora dentro del nuevo archivo creado agregamos el siguiente texto:

```conf
[Unit]
Description = Servicio de Pocketbase

[Service]
Type = simple
User = camel
Group = camel
LimitNOFILE = 4096
Restart = always
RestartSec = 5s
ExecStart = /home/camel/pocketbase serve --http="0.0.0.0:8090"

[Install] 
WantedBy = multi-user.target
```

Por esta ocasión no explicaré línea por línea el servicio de systemd. Solo nos concentraremos en 3 líneas específicamente:

- `User = camel`: Le dice a systemd que el servicio se ejecutará con el usuario `camel`.
- `Group = camel`: Le dice a systemd que el servicio se ejecutará con el grupo `camel`.
- `ExecStart = /home/camel/pocketbase serve --http="0.0.0.0:8090"`: Le dice a systemd que comando ejecutaremos para iniciar el servicio de PocketBase, además le pasamos la dirección donde deberá servirse nuestra instancia. **NOTA: Si queremos utilizar certbot y let's encrypt para nuestro login, es importante no usar la opción --https aquí.**

En tu caso deberás sustituir estos tres campos por el usuario, grupo y directorio home del usuario que creaste específicamente para PocketBase.

Una vez creado nuestro archivo de servicio debemos recargar los archivos de configuración de NGINX e iniciar nuestro servicio de PocketBase:

```sh
$ sudo systemctl daemon-reload && sudo systemctl enable --now pocketbase
```

Ahora a comprobar el estado de nuestro servicio con:

```sh
$ sudo systemctl status pocketbase
```

Si la salida es algo similar a esto:

```sh
● pocketbase.service - Servicio de Pocketbase
   Loaded: loaded (/lib/systemd/system/pocketbase.service; enabled; vendor preset: enabled)
   Active: active (running) since Sun 2022-09-25 17:59:01 UTC; 1 months 7 days ago noseametiche
 Main PID: 8011 (pocketbase)
    Tasks: 10 (limit: 1150)
   CGroup: /system.slice/pocketbase.service
           └─801 /home/camel/pocketbase serve --http=0.0.0.0:8090

Sep 32 25:59:01 Serverjsjsjs systemd[1]: Started Servicio de Pocketbase.
Sep 32 25:59:02 Serverjsjsjs pocketbase[801]: > Server started at: http://0.0.0.0:8090
Sep 32 25:59:02 Serverjsjsjs pocketbase[801]:   - REST API: http://0.0.0.0:8090/api/
Sep 32 25:59:02 Serverjsjsjs pocketbase[801]:   - Admin UI: http://0.0.0.0:8090/_/
```

Felicidades. Ya tienes una instancia de Pocketbase funcionando en tu servidor :D es hora del dolor de cabeza más grande, NGINX.

### Crear un virtual host de NGINX

Si tienes un NGINX preconfigurado este paso no será mucho problema. Si no, como dirían los amigos Estadounidenses: *godspeed*. Llegó el momento de crear un virtual host con nuestro dominio / subdominio apuntando a PocketBase. Los pasos para apuntar un dominio a los DNS de tu proveedor de servidor no los listaré aquí. Esto porque siempre hay variaciones entre proveedores de dominios y de VPS.

Como superusuario volvemos a abrir un nuevo archivo con vim:

```sh
$ sudo vim /etc/nginx/sites-available/api.ejemplo.com
```

Dentro de ese archivo colocamos el siguiente texto:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.ejemplo.com;

    location / {
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        proxy_read_timeout 180s;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    	proxy_set_header X-NginX-Proxy true;

        proxy_pass http://localhost:8090;
    }
}
```

Guardamos y salimos. Ahora debemos habilitar nuestro sitio para que NGINX lo exponga al mundo como la maravilla que es:

```sh
$ sudo ln -s /etc/nginx/sites-available/api.ejemplo.com /etc/nginx/sites-enabled/
```

Antes de probar nada de URL's, debemos asegurarnos que la configuración de NGINX es correcta. Esto lo podemos hacer con el comando `nginx -t`. Si la salida del comando es la siguiente:

```sh
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Ejecutamos `sudo systemctl restart nginx`, esperamos a que vuelva a levantar NGINX y podemos continuar al siguiente paso.

### Añadir SSL a nuestro login

No te sugiero entrar al login de tu sitio web aún. Antes de picarle a nada, te recomiendo configurar el certificado SSL primero, esto lo haremos con certbot de la siguiente forma:

```sh
$ sudo certbot --nginx -d api.ejemplo.com
```

Rellenamos los campos que nos pida certbot y comprobamos que nuestro archivo de NGINX haya sido modificado y funcione correctamente.

El archivo de NGINX debería verse así:

```nginx
server {
    server_name api.ejemplo.com;

    location / {
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        proxy_read_timeout 180s;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
	proxy_set_header X-NginX-Proxy true;

        proxy_pass http://localhost:8090;
    }

    listen [::]:443 ssl; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/api.ejemplo.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.ejemplo.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

server {
    if ($host = api.ejemplo.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    listen [::]:80;
    server_name api.ejemplo.com;
    return 404; # managed by Certbot
}
```

Comprobamos la integridad del archivo con `nginx -t`:

```sh
$ nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Si todo está correcto ya solo es momento de estrenar nuestra nueva BD. Ejecutamos `sudo systemctl restart nginx` nuevamente, esperamos a que el servidor reinicie de forma correcta y vamos al siguiente paso.

### Comenzar a usar PocketBase

Bien, si todo nos salió como debería, podemos ir con nuestro navegador a https://api.ejemplo.com/_/ , en tu caso, a la URL de tu dominio personal para PocketBase, en el caso ideal deberíamos ver la siguiente pantalla:

![crearusuariojsjsjs](/img/posts/pocketbase/pocketlogin.png)

Si es así ¡Felicidades! Estás list@ para comenzar a utilizar tu propio *Backend As A Service* hosteado por ti. Deberías estar orgullos@ de tu autonomía como informátic@ :D

Para aprender a usar PocketBase a detalle puedes consultar la [documentación oficial](https://pocketbase.io/docs/).

PocketBase también cuenta con un SDK para JavaScript, puedes verlo [aquí](https://github.com/pocketbase/js-sdk).

## Conclusión

PocketBase es una herramienta útil para los programadores que necesitan de un backend sencillo, rápido y sin mucho desorden. Puede llegar a sustituir a una REST API no muy compleja y su SDK de JS permite una interacción muy fluida con las tablas de la misma. Las posibilidades son casi infinitas, personalmente la he visto ser usada como CDN de archivos CSS e imágenes, REST API de blogs, información e incluso como BD de comercios en línea. 

Ahora te toca a ti. ¿Qué cosa llevarás al siguiente nivel con PocketBase?

Si te gustó mi contenido por favor compártelo con tus amigos, de ser posible suscríbete usando el botón de RSS en el fondo de la página o si te sientes con ánimos puedes invitarme un café picando el botón "Tip Me" en la esquina inferior izquierda de tu pantalla :)

¡Nos leemos pronto!