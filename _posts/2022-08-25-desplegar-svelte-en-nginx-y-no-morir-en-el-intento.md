---
layout: post
---

# No dejemos los pensamientos atrás. El porqué de este blog tardío.

Si, caemos en el viejo hábito de nuevo. Abandonar el blog o la enorme y extraña necesidad de reescribirlo sin razón alguna. Esta vez con un problema que ya tenía tiempo de ser resuelto. Sin embargo, por motivos ajenos a esta publicación, decidí no postear la solución hasta ahora.

Hace poco comencé a tomar el desarrollo web un poco más en serio en mi vida y en mi carrera como sysadmin/"""DevOps"""/Web Dev. Debo confesar que no ha sido fácil, la mayor parte de las cosas utilizadas en la web moderna son horribles de pies a cabeza y, cuesta algo de trabajo / pensamiento profundo elegir una herramienta que no tenga cosas raras o que no resulte un dolor de cabeza eventualmente.

En mi búsqueda terminé con el siguiente stack:

- TypeScript (Es menos feo que JS, sigue siendo feo, pero tolerable).
- Svelte (¿Configurar 70 bundlers, babel y dios sabrá cuantas cosas más? No gracias. Dame algo más...clásico).
- Bootstrap (No hay razón para no usarlo. Salvo que te dejes llevar por el hype de tailwind.).
- Rust + Rocket (El backend más bonito de escribir y de usar)

Debo de admitir que la combinación de Svelte y TypeScript es casi perfecta. Todo es orientado a componentes, la reactividad es "sencilla". Creo que mis únicos peros son que es imposible apagar por completo el tipo `any` y un par de cosas extra. Sin embargo esas son cosas menores, no tanto un problema real.

# Svelte y NGINX, el terror para los chicos "serverless".

Al momento de terminar el [sitio de UpVent](https://upvent.codes) llegó la necesidad de alojarlo en alguna parte. La verdad no poseo infraestructura propia por el momento, sin embargo [Linode](https://www.linode.com/lp/refer/?r=2b48a57a9c813fa9972e3287171358c4f36746af) salvó el día para mi :) ahora podía disfrutar de tener infraestructura como servicio por un proveedor decente que no involucre a *"M.A.A.N.G"* y sus productos que, fuera de razones laborales, no me gustaría tocar ni con un palo de 10 metros.

Con un servidor propiamente configurado, una API hecha en Rust y muchas ganas de triunfar me dispuse a buscar como desplegar mi aplicación y oh no...no de nuevo.

Tengo que decir que me desespero fácilmente y, probablemente en internet exista otro tutorial que cubra este mismo proceso. Sin embargo yo no lo encontré y en su lugar me vi sumergido en un mar de vídeos, tutoriales y blogs que, más allá de desplegar en plataformas como heroku, netlify y otras cosas nuevas y extrañas...bueno, terminé sin encontrar lo que buscaba.

Ahora es momento de admitir que si, estuve a punto de rendirme por varios factores que debo aclarar en este blog. Principalmente porque manejar las rutas fue un dolor de cabeza. Ahora, manejarlas en un servidor web solo requirió una línea de NGINX para hacer la magia y una propia configuración de Svelte.

## Antes que nada un par de consideraciones.

Creo que este blog quede servir para casi cualquier router de svelte, exceptuando las rutas generadas por *filesystem*, no he tenido tiempo de experimentar con ellas y por lo tanto desconozco de su funcionamiento. En mi caso decidí usar el router [tinro](https://github.com/AlexxNB/tinro), es un router pequeño, declarativo y (esto es lo mejor) libre de dependencias.

Otra de las cosas a tener en cuenta es que el sitio de UpVent es una SPA (Por sus siglas *Single Page Application*), por lo que el manejo de rutas es interno y por lo tanto, diferente, poco amigable con el SEO, etc.

Finalmente mi SPA actual utiliza el sistema de construcción [Vite](https://vitejs.dev/). Por lo que, la configuración de tinro podría ser diferente si tienes un proyecto de Svelte antiguo que usa rollup.

## Construir proyecto

En mi caso solo era necesaria la orden `npm run build` para que el proyecto se construya de forma satisfactoria.

## Subir el proyecto a tu servidor.

En mi caso estoy usando un VPS con Red Hat y NGINX con una configuración clásica. De forma estándar subiremos todo lo generado en el directorio `dist/` al directorio de nuestro servidor:

```sh
scp -r dist root@dominio.com:/var/www/html/pagina_web
```

Ahora debemos corregir los permisos, como es una operación rápida en nuestro servidor, no necesitamos iniciar sesión para hacer esto:

```sh
ssh root@dominio.com "chown -R nginx:nginx /var/www/html"
```

## Configurar el virtual host de NGINX

Aquí viene la parte buena. Por defecto todas las aplicaciones de Svelte y Vite son *SPA*, lo que quiere decir que, sin un router interno de JS y una buena interpretación de rutas por parte de NGINX, las cosas no funcionarán. Si intentas desplegar una *SPA* con rutas de tinro en NGINX de forma convencional solo te encontrarás con errores al momento de navegar en ella.

Accede a tu servidor con SSH y comencemos a trabajar:

```sh
ssh root@dominio.com
```

Si estás usando una configuración similar a la mía puedes comenzar a crear tu configuración del sitio con el siguiente comando:

```sh
vim /etc/nginx/sites-available/dominio.com.conf
```

El trabajo ya está hecho, aquí abajo incluiré la configuración que usé en mi NGINX para que Svelte funcione de forma correcta, abajo te explicaré las opciones, sirve que, ambos aprendemos algo el día de hoy:

```json
server {
    listen 80;
    listen [::]:80;
    root /var/www/html/pagina_web;
    index index.html;

    server_name domino.com;

    location / {
        try_files $uri $uri/ $uri.html /index.html =404;
    }
}
```

Ahora para que entiendas un poco las opciones:

- `listen 80;`: Le dirá a NGINX que escuche en el puerto `80`, el puerto estándar de HTTP.
- `listen [::]:80;`: Es lo mismo que el listen anterior, sin embargo este será exclusivo para direcciones IPv6.
- `root /var/www/html/pagina_web;`: Esta directiva especifica el directorio "raíz" en donde NGINX buscará un archivo.
- `index index.html`: Esta directiva le dirá a NGINX que archivo index buscar, en este caso dejaremos el valor por defecto, ya que Svelte nos entrega un archivo `index.html`.
- `server_name`: El nombre del servidor desde el que NGINX procesará las peticiones. En este caso es el dominio que tengamos asignado a nuestra máquina / VPS.
- `location / {...}`: Esta parte es un poco difíćil de entender si no tenemos mucha experiencia con NGINX. Básicamente define donde NGINX debe buscar con la URL. En este caso es la URL base "/"
- `try_files $uri $uri/ /index.html =404;`: Esta opción es la que hace la magia en nuestra aplicación de Svelte. La directiva `try_files` busca los archivos y directorios que NGINX debería buscar dentro del directorio que definimos en `root`. El primer parámetro especifica que intentará servir la `uri` sola, en este caso `dominio.com`, si dicho archivo no puede ser servido se intentará servir con una `/` extra, en este caso `dominio.com/`, finalmente la opción `/index.html =404;` actúa como red de seguridad, en caso de que no se pueda servir la `uri/` se buscará por defecto en el archivo `index.html`, si no se encuentra nada, solamente se enviará un error 404.

Cuando terminemos de configurar este archivo, guardaremos los cambios, salimos. Y procedemos a activarlo haciendo un enlace simbólico:

```sh
ln -s /etc/nginx/sites-available/dominio.com.conf /etc/nginx/sites-enabled/dominio.com.conf
```

Llegó el momento de probar si nuestra configuración es correcta, podemos hacer esto con el comando:

```sh
nginx -t
```

Este comando nos informará si algo salió mal o si existe algún problema de configuración en nuestros archivos de configuración de NGINX. Es importante ejecutar este comando cada que hagamos cambios en un archivo de servidor. Esto para evitar downtime en caso de que NGINX se interrumpa por algún error en los archivos de configuración.

## Reiniciar NGINX de forma agraciada o a lo bestia.

Si el comando anterior (`nginx -t`) nos reporta que todo está bien con nuestros archivos de configuración podemos reiniciar el servidor de NGINX. Podemos intentar hacer un *graceful restart* y evitar el downtime, sin embargo, en caso de que nuestras configuraciones no surtan efecto o necesitemos una acualización no tendremos de otra más que usar el modo bestia.

La primer forma de reiniciar NGINX de forma agraciada es con el comando:

```sh
nginx -s reload
```

Si esta opción no funciona para nosotros podemos optar por reiniciar "a lo bestia":

```sh
# Con systemd

systemctl restart nginx

# Con OpenRC

service nginx restart
```

## Añadir un certificado SSL de Let's Encrypt.

Una vez tengamos nuestro archivo de nginx terminado podemos añadir un certificado SSL para que nuestro sitio sea confiable y nuestros usuarios puedan acceder de forma tranquila al mismo.

La instalación de `certbot` será diferente dependiendo de tu distribución de Gnu/Linux, en mi caso con Red Hat solo tuve que instalar el paquete `epel-release` y ejecutar la orden `dnf install certbot python3-certbot-nginx`.

Si nuestra configuración de dominios es correcta, solo hará falta pedirle a certbot un certificado para nuestro sitio con la siguiente orden:

```sh
certbot --nginx -d dominio.com
```

Solo será necesario seguir las instrucciones que aparezcan en consola.

## Extras

Personalmente, no me gusta que se quede plano todo el server block de NGINX cuando podemos hacer algunas optimizaciones para mejorar el SEO y la velocidad de nuestro sitio. No explicaré a detalle que hace cada uno de los bloques de directivas que escribiré a continuación. Entenderlos para después modificarlos quedará como tarea para ti. Espero que te sirvan :)

### Cache de elementos estáticos comunes como imágenes o vídeos.

```json
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|ttf|webp)$ {
    expires 365d;
}
```

### Seguridad para evitar XSS y otros ataques comunes al lenguaje segurísimo que es JavaScript.

```json
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; img-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-src 'self'; connect-src 'self'; object-src 'none';";
```

### Compresión gzip para mejorar los tiempos de carga a costo de CPU

```json
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_min_length 256;
gzip_comp_level 9;
gzip_http_version 1.1;
gzip_disable "MSIE [1-6]\.";
gzip_types text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript application/vnd.ms-fontobject application/x-font-ttf font/opentype image/svg+xml image/x-icon image/webp;
gunzip on;
```

## Conclusión

Desplegar Svelte en NGINX no es una tarea especialmente titánica con un poco de investigación por debajo. Sin embargo, debo de admitir que es un terrible dolor de cabeza tener que buscar entre cientos de artículos de gente que solo sabe vivir del PaaS (este blog) sin encontrar un buen lugar para los "vieja escuela" que aún gustamos del self-hosting.

Si te gustó mi contenido por favor compártelo con tus amigos, de ser posible suscríbete usando el botón de RSS en el fondo de la página o si te sientes con ánimos puedes invitarme un café picando el botón "Tip Me" en la esquina inferior izquierda de tu pantalla :)

¡Nos leemos pronto!
