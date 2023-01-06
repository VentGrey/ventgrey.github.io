---
title: "Como desplegar SvelteKit en NGINX (usando el adaptador de Node)"
date: 2023-01-06
tags: ["Tutoriales", "Svelte", "NGINX", "Linux", "Rant"]
categories: ["Tutoriales", "Svelte", "Linux"]
author: "VentGrey"
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "La desesperación nunca fue del lado del servidor."
canonicalURL: "https://ventgrey.github.io/posts/sveltekit-nginx"
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
    image: "/img/posts/sveltekitng/cover.png" # image path/url
    alt: "Imágen del post" # alt text
    caption: "Imágen del post" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/<path_to_repo>/content"
    Text: "Sugerir Cambios" # edit text
    appendFilePath: true # to append file path to Edit link
---

# Del amor al odio hay una versión 1.0

> ⚠️ El inicio de este blog tiene un [*rant*](https://dictionary.cambridge.org/es/diccionario/ingles-espanol/rant) acerca del proceso que tuve que seguir para llegar al resultado esperado. Si quieres saltar a la parte reelevante usa [este enlace](/posts/sveltekit-nginx/#instalar-prerrequisitos) ⚠️

Hace poco (antes de navidad) salió la versión 1.0 de SvelteKit, el meta-framework de Svelte que permite desarrollo fullstack con el mismo. Las reviews que recibió son impresionantes, o bueno, esa era la impresión que me dio a mí.

La página de mi proyecto principal está hecha en Svelte "puro", sin embargo, ya estaba llegando a sus límites en cuestión de uso, ya que, al ser una SPA, el SEO está prácticamente muerto y no es posible extenderla mucho, ya que, cosas como un blog o un portafolio no servirían de mucho sin un buen SEO y redirecciones.

Otros problemas que tenía ese sitio:

- Dependía de una biblioteca para ruteo llamada `tinro` que, parece ser que ya ha sido abandonada.
- El índice solo podía crecer / tener pocas features antes de entregar una gran cantidad de JS a procesar.
- El generador de PWA de Vite a veces fallaba al generar el HTML final y había que añadir los tags de inclusión a mano.

A estas alturas, la existencia de SvelteKit no era novedad para mí. Sin embargo, decidí esperar a que la versión 1.0 llegase, no había necesidad de usarlo en su fase experimental. Al llegar la versión estable, comencé a migrar el sitio de Svelte a Sveltekit. De buenas a primeras hay un par de cosas interesantes:

- Una desición controversial que tomó el equipo de SvelteKit es que, hay nombres reservados de archivos para las rutas, por ejemplo, para el "entry-point" de una página es necesario crear un directorio dentro de `routes/` y, dentro de ese directorio un componente de Svelte con el nombre `+page.svelte`.
- Importar estáticos como imágenes se debe de hacer en una ruta diferente, en la documentación se recomienda el uso de `import cosa from '$lib/assets/imagen.png'`.
- No hay un entry-point claro, en Svelte existía el archivo `app.ts`.
- La configuración inicial es mucho más completa que la de Svelte.
- El proceso de construcción final / despliegue es ambiguo ya que estás a merced de las instrucciones del adaptador que uses.

Terminé de crear el sitio y pasé un par de dias intentando desplegarlo y Dios mío. Oh Dios mío. Es a lo que llamo una buena odisea.

## "Puede ser parte del progreso, o puede ser arrollado por el" ~ (Vape Businessman - South Park)

![Imágen del ñor vapeador](/img/posts/sveltekitng/vapor.png)

Al ser Svelte un framework relativamente nuevo, me esperaba que no hubiera formas "clásicas" de desplegarlo a diferencia de frameworks un poco más viejos. ¿Recuerdan mi blog de como [desplegar svelte en nginx](https://ventgrey.github.io/posts/desplegar-svelte-nginx/)? Bueno, esta fue una experiencia similar al inicio, que se tornó en una pesadilla entre más pasaba el tiempo. No sería la primera vez que debo juntar piezas por internet y pegarlas con *"dios sabrá que cosas"* para que todo funcione. 

A veces me toca la suerte de saber que alguien más debió lidiar con lo mismo que yo y logró su cometido, solo para encontrar que nunca dijo la solución que usó. O peor, los usuarios que responden una pregunta con respuestas inútiles como *¿Para qué quieres eso?* o *¿Por qué no usas X cosa mejor?*. Yo mismo llegué a este nivel de frustración, al punto de cuestionarme si hacer este blog o no, después de todo, ¿Qué me impedía dejarlo como documentación para mí mismo?

Luego de llegar a la fase de la *aceptación* en la que, sé que con tecnologías nuevas, estoy muerto cuando se trata de despliegues que no sean las *marihuanadas* de *Serverless*, *Platform As A Service*, etc. Decidí ponerme manos a la obra, abrir más de 10 pestañas en mi navegador y rezar para que esto no tomase mucho tiempo.

> Nota: No funcionó 😥

### Ah shit, here we go again.

![prros](/img/posts/sveltekitng/prros.png)

Ok, veamos los pasos para desplegar esta cosa. La orden `npm run dev` funciona igual que en Svelte ¿Verdad?...nop. Al parecer no puedo generar la versión construída si está el servidor de desarrollo en funcionamiento.

Perfecto, ahora, en mi archivo `svelte.config.js` está la opción `import adapter from '@sveltejs/adapter-auto';` ¡Genial! Svelte elegirá el adaptador más apropiado para mi aplicación...¿Verdad?. De nuevo, no. Debo instalar un adaptador y elegir manualmente cual debería de usar, veamos la lista de adaptadores:

- adapter-auto (el default que algo hará...)
- adapter-cloudflare (PaaS)
- adapter-cloudflare-workers (PaaS)
- adapter-netlify (PaaS)
- adapter-node (🙂)
- adapter-static (🙃)
- adapter-vercel (PaaS)

Vaya, parece ser que, de los 6 adaptadores, más de la mitad son para PaaS. Me queda recurrir al adaptador de Node.js o usar el adaptador `adapter-static`. La cosa es que, el adaptador estático tampoco cubre mi caso de uso, el hecho de generar otra SPA con él simplemente habrá sido aumentar la complejidad del sitio sin propósito. ¿Por qué? Bueno, la respuesta es simple. Tendría que repetir este tedioso proceso que estoy a punto de describir para desplegar una aplicación web que hace *lo mismo* que la versión anterior. Sería sufrir gratis.

Okay, puedo pre-renderizarlo. Noup, como algunas de mis rutas son dinámicas, necesitaré recurrir a otras cosas.

> Pero, SvelteKit te permite hacer las rutas híbridas, puedes hacer SPA algunas rutas, otras estáticas y otras Server Side Rendered.

Lo sé, la pregunta es ¿Tú mantendrías eso? Ciertamente yo no.

Como nota extra a este blog, mantengo la misma postura que mencioné en mi entrada hablando sobre [desplegar PocketBase](https://ventgrey.github.io/posts/desplegar-pocketbase/) en Ubuntu y NGINX. No odio todo lo *"as a service"* y reconozco que este tipo de tecnologías tiene casos de uso donde es especialmente efectivo. Lo que llega a confundirme es la extrema dependencia que hay a este tipo de plataformas, las consumen con la misma frecuencia que yo consumo azúcar y cafeína.

### El proceso de empaquetado es...muy orientado a CI/CD y no es realmente malo.

Ok, no es el fin del mundo. Al final de eso se trata el software libre / open source. Tenemos opciones y en este caso yo tengo solamente una (sin contar los adaptadores de la comunidad), es lo que hay.

> "No, pues ta' el canasto pal' garrero"

Al parecer este adaptador necesita los siguientes pasos:

1- Construir tu proyecto de Sveltekit con: `npm run build`.
2- Construir las dependencias productivas con `npm ci --prod`

Nada de esto se produce en un directorio nuevo para evitar "contaminar" el proyecto principal, solamente el primer paso produce un directorio `build/` con una tercera parte de lo necesario para un despliegue.

Ahorraré un poco más del *rant* actual para mostrarles algunos pasos que tuve que seguir para dar por terminada esta desventura.

## Prerrequisitos

Bueno, manos a la obra, les prometí un tutorial de como desplegar SvelteKit en NGINX y aquí está. Antes de comenzar, necesitarás cumplir con algunos prerrequisitos:

- Un servidor Gnu/Linux. (Si no tienes uno [puedes conseguir uno muy bararo en Linode](https://www.linode.com/lp/refer/?r=2b48a57a9c813fa9972e3287171358c4f36746af)).
- NGINX
- Node en el servidor (Versión 1.16 o superior) 
- Certbot

No puedo hacer un tutorial que cubra todas las posibilidades, así que dejaré lo que yo usé al momento de desplegar. Si estás usando una distribución como Debian o derivadas ya tienes las respuestas, pues el servidor que estoy usando es un Debian 11. Si estás en Red Hat o derivadas, buena suerte.

Oh, otra cosa. La configuración del firewall también está a discreción tuya.

## Instalar prerrequisitos

Si estás en una distribución basada en Debian, puedes usar el siguiente comando:

```bash
# Instalar NodeJS 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash - &&\
apt-get install -y nodejs

# Instalar los demás requisitos

apt install nginx python3-certbot python3-certbot-nginx
```

Si no te ocurrieron errores o si seguiste todos los pasos correctamente deberías contar con una versión de NodeJS más actual, que podrás revisar con el comando `node --version`.

Perfecto. Autobots, avancen.

## Subir tu proyecto al servidor

Vamos a replicar los pasos del tutorial de Svelte normal. Podemos subir los archivos a nuestro servidor usando el comando `scp` en nuestra consola de Linux (o cualquier gestor de sftp en Windows).

Si eres como yo (bastante *gil*), te apresuraste a subir solamente el directorio `build/` a tu servidor. Bueno, no seas un tonto como yo y lee esto primero, de acuerdo a la documentación del adaptador de node, otro directorio y otro archivo son necesarios. Por lo que la orden de subida al directorio que elijas debería ser la siguiente:

```bash
scp -r build package.json node_modules root@dominio.com:/var/www/html/sitio
```

(Sustituyendo el usuario de ssh y la ruta por lo que desees en tu servidor.)

Finalmente debemos otorgar permisos adecuados para que el usuario de NGINX pueda leer y/o modificar ese directorio:

```bash
ssh root@dominio.com "chown -R www-data:www-data /var/www/html"
```

Es momento de crear un servicio de systemd que nos ayude a manejar el servidor de Node que estará ejecutando nuestro código.

## Crear un servicio de systemd

Ya hemos hecho este paso antes en este blog. En caso de que no lo recuerdes, vamos a usar nuestro editor favorito para crear un archivo de systemd. Recuerda hacer esto con permisos de superusuario:

`$ sudo vim /lib/systemd/system/sveltekit.service`

Dentro del archivo añadimos el siguiente texto:

```ini
[Unit]
Description = Servicio de Sveltekit

[Service]
# Environment variables for node
Environment=HOST=127.0.0.1
Environment=ORIGIN=https://sitio.com
Environment=BODY_SIZE_LIMIT=0
# END
Type = simple
User = www-data
Group = www-data
LimitNOFILE = 4096
Restart = always
RestartSec = 5s
ExecStart = /usr/bin/node /var/www/html/sitio.com/build

[Install] 
WantedBy = multi-user.target
```

Es importante que, en la sección `# Environment variables for node` ajustes las variables que necesitas para que el servidor de node se ejecute de forma correcta:

- `HOST` te recomiendo dejarla en `127.0.0.1`.
- `ORIGIN` deberás cambiarla a la URL final de tu sitio (Ojo, SIN la diagonal final)

La última opción es para limitar el tamaño del cuerpo de solicitud (en bytes). Por default son 512kb (no Kib). Yo lo puse en 0 para controlarlo después desde NGINX. Esto porque mi aplicación de Sveltekit no tiene un "servidor" como tal, no tiene API ni nada, simplemente escupe sitios.

Cuando estés contento con el resultado de tu archivo, guarda y sal. Intenta levantar el servicio con la siguiente orden:

```bash
systemctl enable --now sveltekit.service
```

Ahora, revisa el estado, si nada tiró un error, verás una pantalla similar a esta:

```bash
systemctl status sveltekit.service

● sveltekit.service - Servicio de Sveltekit
     Loaded: loaded (/lib/systemd/system/sveltekit.service; enabled; vendor preset>
     Active: active (running) since Fri 2023-01-06 04:37:34 UTC; 3h 56min ago
   Main PID: 41509 (node)
      Tasks: 11 (limit: 1129)
     Memory: 42.2M
        CPU: 1.828s
     CGroup: /system.slice/sveltekit.service
             └─41509 /usr/bin/node /var/www/html/sitio.com/build

```

### Obtuve un error import { handler } from './handler.js' (O similar)

Si al habilitar y encender tu servicio de sveltekit en systemd obtuviste un error parecido a este:

```bash
/var/www/html/sitio.com/build/index.js:1
import { handler } from './handler.js';
^^^^^^

SyntaxError: Cannot use import statement outside a module
.
.
.
Node.js v18.12.1
```

Es porque, cometiste la misma tontería que yo cometí. Que fue no subir correctamente tus assets al servidor y no comprobar primero que tu "build" inicial corriera bien antes de subir nada. No seas tonto como yo, siempre revisa tus builds y pon atención a las instrucciones.

Si te ocurre este error revisa que en tu directorio de despliegue se encuenten los directorios `build/` y `node_modules/` y el archivo `package.json`. Si uno de estos tres falta, es probable que te salte este error. 

De igual forma, si los permisos de tus archivos de JavaScript son erróneos, obtendrás un error similar. Si no obtuviste un error a la primera, entonces me alegra saber que tú si lees bien las cosas.

## Crear un virtual host de NGINX

Con nuestro servicio de systemd, llegó el momento de crear un virtual host de NGINX y hacer un `reverse_proxy` para que todos disfruten de nuestro sitio.

De nuevo, usa tu editor favorito y crea un nuevo archivo:

`$ sudo vim /etc/nginx/sites-available/sitio.com`

Y dentro del archivo, coloca el siguiente texto:

```nginx
upstream app {
	server localhost:3000;
}

server {
    root /var/www/html/sitio.com/build/;

    server_name upvent.codes;

    location / {
	    try_files $uri @app;
    }
   
    location @app {
        proxy_pass http://app;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Intentamos acceder a nuestro sitio y Uh-oh, parece ser que nuestro sitio de Sveltekit está regresando todos los estáticos con códgos de error 404.

![lashelldelaparrot](/img/posts/sveltekitng/error.jpg)

### La 🐚 de la 🦜, SvelteKit ¿es en serio?

Es aquí donde reanudaré el *rant* del inicio. Con tanto recurso desperdiciado en repetir el mismo tutorial de como desplegar en cosas como Vercel, Netlify, Docker, usando PM2 y otras cosas (necesarias en otros casos) es difícil encontrar una forma de corregir estos errores. Si eres alguien que ya *tiene callo* con NGINX, ya te habrás percatado de que era lo que estaba haciendo mal desde que te mostré el archivo de configuración anterior.

Si no, te explico. Al parecer el `adapter-node` de Svelte no maneja las rutas de nuestros archivos estáticos y todas quedan como rutas relativas a. En ningún lado de la [documentación](https://github.com/sveltejs/kit/tree/master/packages/adapter-node) mencionan ese detalle, por lo que si, tu proxy reverso está funcionando correctamente, solamente hay que corregir una línea y añadir otra directiva `location`  para lograr esto. Idealmente, no debería ser necesario, pero, en palabras de *Dross*: *"Gran mamada"*.

¿Cómo me di cuenta? Bueno, desconozco si alguien tuvo el mismo problema que yo en el pasado y creó un paquete llamado `svelte-adapter-nginx` que genera un `build/` compatible con NGINX. Tristemente, tanto el repositorio de GitHub como el usuario desaparecieron (Su perfil da un error 404). Si estás interesad@ en el recurso, te dejo el enlace [aquí](https://www.npmjs.com/package/svelte-adapter-nginx?activeTab=readme). Que bueno que npm ya no comete la barbaridad de borrar los paquetes si se borran los repos.

Tanto trabajo y cabello que me pude haber ahorrado si no fuese tan desesperado... o si la documentación cubriera algunos casos así. Le apuesto más a la primera aun así.

Bueno, basta de chácharas. El archivo corregido se debería ver así:

```nginx
upstream app {
	server localhost:3000;
}

server {
    root /var/www/html/sitio.com/build/client/;

    server_name upvent.codes;

    location / {
	    try_files $uri @app;
    }
    
    location /_app/ {
        autoindex on;
    }
   
    location @app {
        proxy_pass http://app;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Guardamos y salimos si estamos satisfechos con el resultado. *Ora si*, llegó la hora de habilitar nuestro sitio para que NGINX lo exponga al mundo como la maravilla llena de bugs que es:

```bash
$ sudo ln -s /etc/nginx/sites-available/api.ejemplo.com /etc/nginx/sites-enabled/
```

Antes de probar nada de URL’s, debemos asegurarnos que la configuración de NGINX es correcta. Esto lo podemos hacer con el comando `nginx -t`. Si la salida del comando es la siguiente:

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Ejecutamos `systemctl restart nginx`, esperamos a que vuelva a levantar NGINX y procedemos a instalar nuestro certificado ssl.

## Instalar un certificado SSL con Certbot

Para finalizar con todo el tutorial, podemos añadir un certificado SSL para que nuestro sitio sea confiable y nuestros usuarios puedan acceder de forma tranquila al mismo.

La instalación de certbot será diferente dependiendo de tu distribución de Gnu/Linux, en mi caso con Debian solo tuve que instalar los paquetes `python3-certbot` y `python3-certbot-nginx`.

Si nuestra configuración de dominios es correcta, solo hará falta pedirle a certbot un certificado para nuestro sitio con la siguiente orden:

`certbot --nginx --hsts -d dominio.com`

Solo será necesario seguir las instrucciones que aparezcan en consola. 

## Conclusión

Lastimosamente, no lo sé todo y yo solo no pude con esta tarea sin ayuda de un par de personas que me estuvieron guiando en lo que pudieron para darme cuenta de que estaba haciendo mal. Gracias a ellos este tutorial fue posible:

- svemix (El creador del adaptador de NGINX que tenía una configuración de NGINX útil).
- [LastDragon](https://lastdragon.net) (Quien me ayudó a ver las directivas de NGINX al inicio).

No me queda mucho más que agregar, el cambio de tecnologías fue muy frustrante en su mayoría. Pues, cosas que en Svelte "puro" son muy sencillas de hacer como construir los archivos finales, desplegar o simplemente programar. Se vuelven un infierno en SvelteKit.

Con tecnología nueva vienen dolores de cabeza nuevos. Linuxeros desesperados que no se paran a leer todo y blogs ranteando / documentando procesos escasos. ¡Nos leemos luego!

---

¿Te gustan estos blogs? Ayúdame a seguir escribiéndolos de las siguientes formas:
- [Invítame un café 🍵](https://ko-fi.com/ventgrey)
- [Regálame un follow en GitHub ❤](https://github.com/VentGrey)
