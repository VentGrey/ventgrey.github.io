---
title: "Automatiza tus despliegues de Angular con Ansible"
date: 2023-01-25
tags: ["Programación", "Tutoriales", "Angular", "DevOps", "Automatización"]
categories: ["Linux", "Ansible", "Angular", "Tutoriales", "DevOps"]
author: "VentGrey"
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "¿No tienes un servicio de CI/CD propio? ¿Tener uno sería matar una mosca a balazos? En este blog te enseñaré a usar Ansible para automatizar tus despliegues"
canonicalURL: "https://canonical.url/to/page"
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
    image: "/img/posts/ansibleangular/cover.png" # image path/url
    alt: "Imágen del post" # alt text
    caption: "Imágen del post" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/<path_to_repo>/content"
    Text: "Sugerir Cambios" # edit text
    appendFilePath: true # to append file path to Edit link
---

# Mi amistad con sftp directo terminó, ahora Ansible es mi amigo.

Cada quien termina encontrando la manera de desplegar las cosas. Yo mismo (aunque se que no es lo mejor) sigo desplegando "a la antiguita" con `scp`, pero ¿has escuchado de la integración continua e integración directa? 

¿No?

Bueno, entonces permíteme presentarte a Ansible.

Ansible es una herramienta de automatización de código abierto que se utiliza para administrar e implementar tareas comunes de mantenimiento, mejoras o estabilización de nuestra infraestructura. Ansible se puede usar para automatizar cualquier tipo de implementación de servidor, incluidos servidores web, bases de datos y más. 

En este artículo vamos a ver cómo usar Ansible para desplegar Angular en NGINX (Un proceso similar al de [desplegar svelte en nginx](https://ventgrey.github.io/posts/desplegar-svelte-nginx/)) para que podamos tener mejor control sobre el proceso de desarrollo y reducción de errores durante las implementaciones en vivo.

La automatización es una gran forma de *no complicarnos* la vida. Podemos hacer cosas mundanas con el como actualizar uno o varios sistemas, hasta cosas más complejas como desplegar continuamente las nuevas versiones de nuestros proyectos y mantener los servidores que los alojan.

Otra ventaja es que, puedes usar Ansible para manejar tu archivo `package.json` y `package-lock.json` para que puedas tener un control más preciso de las dependencias que se instalan en tu servidor. Además de poder automatizar las actualizaciones de las dependencias que tanto nos gusta instalar y abusar de ello.


## Pasos para desplegar de forma auto-mágica

Soy alguien que piensa que una acción vale más que mil palabras, así que vamos a ver los pasos que debemos seguir para automatizar el despliegue de Angular en NGINX. Ten en cuenta lo mismo que he puesto en otros artículos de mi blog, yo estoy usando un stack tecnológico específico, por lo que si quieres usar otro, tendrás que adaptar los pasos a tu stack.

### Paso 1: Instalar Ansible

La sección de instalación solo cubrirá Linux, pero Ansible también está disponible para Windows y Mac. Sin embargo, no voy a cubrir la instalación en esos sistemas operativos en este artículo, además de que, guacala win2 y mac.

El comando de instalación de Ansible en linux podría variar dependiendo de la distribución que estés usando, pero en general, es algo así:

```bash
sudo apt install ansible
```
O si estás usando Fedora, Rocky Linux o Red Hat Enterprise Linux:

```bash
sudo dnf install ansible
```

El directorio de archivos de ansible es: `/etc/ansible/` y el archivo de configuración principal es `/etc/ansible/ansible.cfg`.

No entraré en detalles sobre la configuración de Ansible, pero si quieres saber más, puedes leer la [documentación oficial](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html). Podría hacer una "Guía definitiva para el novato de Ansible" en un futuro. Quizás con eso el blog tenga un poco más de visitas :P

### Paso 2: Crear un "playbook"

Un playbook es un archivo de Ansible que contiene una lista de comandos o en este caso tareas (*"tasks"*) que se ejecutan en orden, están escritos en YAML, un lenguaje más feo que pegarle a alguien en su cumpleaños.

Vamos a crear un playbook en la ruta `/etc/ansible/playbooks/` llamado `deploy_angular.yml` y vamos a escribir lo siguiente:

```yaml
---
- hosts: all
  become: yes
    tasks:
        - name: "Construir en la máquina local"
            shell: "npx ng build --aot"
            delegate_to: localhost
            args:
                chdir: "/home/ventgrey/Projects/sitio.com"
        - name: "Copiar el directorio dist con scp a la máquina remota en una variable {{ remote_ip }} sobreescrbiendo los archivos anteriores"
            copy:
                src: "/home/ventgrey/Projects/sitio.com/dist/"
                dest: "/var/www/html/"
                owner: "www-data"
                group: "www-data"
                mode: "0755"
                remote_src: yes
                force: yes
            delegate_to: "{{ remote_ip }}"
        - name: "Otorgar permisos correctos al usuario www-data y al grupo www-data"
            file:
                path: "/var/www/html/"
                owner: "www-data"
                group: "www-data"
                recurse: yes
            delegate_to: "{{ remote_ip }}"
        - name: "Reiniciar el servicio nginx de la máquina remota"
            service:
                name: nginx
                state: restarted
            delegate_to: "{{ remote_ip }}"
        - name: "Enviar una petición al sitio a ver si regresa 200 xd"
            uri:
                url: "http://{{ remote_ip }}"
                status_code: 200
            delegate_to: localhost
        - name: "Revisar que el sitio cargue correctamente"
            shell: "curl -s -o /dev/null -w '%{http_code}' http://{{ remote_ip }}"
            register: curl_result
            delegate_to: localhost
        - name: "Abrir el sitio en nuestro navegador predeterminado"
            shell: "xdg-open http://{{ remote_ip }}"
            when: curl_result.stdout == "200"
            delegate_to: localhost
        - name: "Aparecer una notificacion local con notify-send"
            shell: "notify-send 'Despliegue de sitio.com' 'El sitio se ha desplegado correctamente'"
            delegate_to: localhost
```

Es probable que en estos momentos estés confundido o confundida. No te preocupes, es un efecto secundario de YAML, es un lenguaje tan feo que te hace sentir como si estuvieras leyendo las sentencias de los condenados en el infierno. Pero no te preocupes, vamos a ir paso a paso para entender que chuchas está pasando aquí.

Veamos la primera parte del playbook:

```yaml
---
- hosts: {{ remote_ip }}
  become: yes
```

Esta parte es el "header" del playbook, al YAML ser un lenguaje de marcado, la mejor comparación que puedo ofrecerte es la etiqueta `<header>` de HTML, esto es lo primero que se ejecuta en el playbook.

Una traducción a HTML se vería así:

```html
<header>
    <hosts>{{ remote_ip }}</hosts>
    <become>yes</become>
</header>
```

(Ay si, ya se que es más verboso, pero ey, HTML no llora con las tabulaciones)

En este caso, estamos diciendo que vamos a ejecutar las tareas en todos los hosts, y que vamos a usar el usuario root para ejecutar las tareas. Es importante que tengamos acceso root a la máquina remota, ya que vamos a necesitarlo para copiar archivos y cambiar permisos. De otra forma podemos pedirle permisos de sudo a Ansible, pero eso es un tema para otro blog.

Veamos la siguiente parte:

```yaml
tasks:
    - name: "Construir en la máquina local"
        shell: "npx ng build --aot"
        delegate_to: localhost
        args:
            chdir: "/home/ventgrey/Projects/sitio.com"
```

El bloque `tasks` es donde vamos a colocar las tareas que queremos ejecutar. En nuestro caso la primer tarea que debemos ejecutar es la construcción de nuestro proyecto. Vamos a explicar las partes de esta primer tarea:

El nombre de la tarea es `"Construir en la máquina local"` ¿Por qué mencionar la máquina local? Bueno, por orden. Los playbooks de ansible se ejecutan por defecto en el servidor remoto. No queremos construir el proyecto en el servidor remoto, queremos construirlo en nuestra máquina.

Para esto usamos la opción `delegate_to: localhost` que le dice a Ansible: "[aquí hay gas we](https://youtu.be/kxuACRz2O6I?t=295)". Bueno no, fuera de bromas, le dice a Ansible que ejecute esta tarea en la máquina local, no en el servidor. Es importante prestar atención a estos detalles para evitar errores que puedan poner en juego tu sistema de producción o peor, hacerle push al servidor los commits del junior que ya rompió algo otra vez.

La parte de `shell` es la que ejecuta el comando que deseamos. En este caso estamos ejecutando `npx ng build --aot` que es el comando para construir el proyecto de Angular (Si tienes bien configurado tu proyecto puedes hacer más chico esto, ejecutando `npm run build` en su lugar).

Finalmente la parte `args` es la que nos permite cambiar el directorio de trabajo. En este caso estamos cambiando el directorio de trabajo a `/home/ventgrey/Projects/sitio.com` para que el comando se ejecute en el directorio correcto.

La siguiente tarea es la que copia los archivos de la máquina local a la máquina remota:

```yaml
- name: "Copiar los archivos de la máquina local a la máquina remota"
    copy:
        src: "/home/ventgrey/Projects/sitio.com/dist/sitio.com/"
        dest: "/var/www/html/"
        owner: "www-data"
        group: "www-data"
        mode: "0755"
        remote_src: yes
        force: yes
    delegate_to: "{{ remote_ip }}"
```

`copy` también está integrado en Ansible, y es el comando que usamos para copiar archivos. 

En este caso vamos a copiar el directorio `/home/ventgrey/Projects/sitio.com/dist/sitio.com/` a la máquina remota en el directorio web de NGINX `/var/www/html/`. También estamos cambiando los permisos y el grupo de los archivos a `www-data` y el modo a `0755` para que el servidor pueda leer los archivos.

Prestemos atención a una parte que no hemos visto en los ejemplos anteriores, esta parte es la última línea del bloque `copy`:

```yaml
delegate_to: "{{ remote_ip }}"
```

El argumento está escrito entre llaves dobles `{{ }}`, esto lo usamos para definir una "variable" en Ansible. En este caso estamos usando una variable llamada `remote_ip` que es la IP de la máquina remota. Esto nos permite ejecutar el playbook en diferentes servidores sin tener que cambiar el playbook o definir un arreglo de servidores. Por supuesto, si ya sabías algo de Ansible, argumentarás que es mas fácil usar el archivo de inventario, pero en este caso queremos que el playbook sea lo más portable posible.

El uso de variables tiene una cosa especial a tener en cuenta, al momento de ejecutar el playbook, será necesario definir el valor de la variable. Esto se hace con el argumento `-e` o `--extra-vars`. Esto lo veremos en la siguiente sección.

Veamos la siguiente tarea:

```yaml
- name: "Cambiar los permisos de los archivos"
    file:
        path: "/var/www/html/"
        owner: "www-data"
        group: "www-data"
        mode: "0755"
        recurse: yes
    delegate_to: "{{ remote_ip }}"
```

Puede que este paso parezca redundante con el paso anterior, pero no lo es. ¿Recuerdas cuando eras niño y jugabas Pokémon? ¿Recuerdas que guardabas la partida no una, sino dos o incluso tres veces? Bueno, esto es lo mismo, pero con servidores.

Si me das permiso de justificarme, también puse este paso para mostrarte varios de los modulos que Ansible tiene integrados. Es una herramienta que logra ser pequeña y al mismo tiempo tener un montón de cosas útiles. Para tareas sencillas no necesitamos usar playbooks o módulos de terceros.

La última tarea es la que reinicia el servicio de NGINX para que los cambios se apliquen:

```yaml
- name: "Reiniciar el servicio de NGINX"
    service:
        name: "nginx"
        state: restarted
    delegate_to: "{{ remote_ip }}"
```

¿Viste que Ansible tiene un módulo para manipular los servicios de tu sistema? Creo que solo es compatible con inits tipo unix como bsd init, openrc, systemd, etc. Para manipular servicios de Windows o de MacOS son necesarios módulos de terceros. (wakala)

Estamos llegando al final del playbook, veamos que hacen las últimas tareas de "comprobación":

```yaml
        - name: "Enviar una petición al sitio a ver si regresa 200 xd"
            uri:
                url: "http://{{ remote_ip }}"
                status_code: 200
            delegate_to: localhost
```

Esta tarea hace uso del módulo `uri` que nos permite hacer peticiones HTTP. En este caso estamos haciendo una petición GET a la IP de la máquina remota y esperamos que regrese un código de estado 200. Si el código de estado es diferente de 200, el playbook fallará.

Recuerda que un código HTTP 200 significa que la petición que hicimos se procesó con éxito.
Cualquier otra cosa, podría ser considerada como un error.

Veamos las últimas dos tareas:

```yaml
        - name: "Abrir el sitio en nuestro navegador predeterminado"
            shell: "xdg-open http://{{ remote_ip }}"
            when: curl_result.stdout == "200"
            delegate_to: localhost
            
        - name: "Aparecer una notificacion local con notify-send"
            shell: "notify-send 'Despliegue de sitio.com' 'El sitio se ha desplegado correctamente'"
            delegate_to: localhost
```

Estas tres tareas (estas dos y la anterior) realmente son opcionales, pero son muy útiles para hacer *pre-testing* de nuestro entorno productivo. Por supuesto, si estás usando Angular "como debe ser", ya tendrás configuradas las pruebas unitarias con Jasmine y estos pasos solo serían una *post-comprobación*, pero recuerda una cosa, como sysadmin, nunca hay suficientes pruebas.

La primera tarea abre el sitio en nuestro navegador predeterminado, y la segunda tarea envía una notificación local con `notify-send`.

`notify-send` si está instalado en tu sistema, es un comando que te permite enviar notificaciones a tu escritorio. Podría parecer mundano, pero es útil para despliegues grandes, donde el ancho de banda está algo limitado o nuestros servicios tardan en levantar. Además, en lugar de vigilar el playbook a cada rato, puedes dejarlo ahí y ponerte a hacer otras cosas, cuando el playbook termine, te llegará una notificación.

Fue una santísima madrina escribir y explicar todo este playbook. Si fuera youtuber te podría *gaslight*-ear a que le dieras like. Aquí no hay likes, ergo, estoy jodido xD, me basta y sobra con que lo leas y aprendas :3

Bueno, a lo que vinimos, ora si viene lo mero chido. Vamos a ejecutar el playbook.

### Paso 3: Desplegar / Probar los despliegues

¿Recuerdas que mencioné que el playbook tiene unas variables escritas entre llaves? Bueno, esas variables son las que debemos definir al momento de ejecutar el playbook. Como dije antes, se busca que este playbook sea lo más genérico posible, por lo que no se incluyen valores por defecto para las variables, además de que, en teoría no debería hacer uso del archivo de inventarios.

Veamos, este playbook tiene como variable `remote_ip`, que es la IP de la máquina remota. Para ejecutar el playbook, debemos definir esta variable. Para hacer esto, podemos usar el flag `-e` o `--extra-vars`:

```bash
ansible-playbook -i hosts deploy.yml -e "remote_ip=8.8.8.8"
```

Use la ip de los servidores de Google DNS para que sea obvio que es un ejemplo, dudo que vaya a servir en cualquier IP que conozcas y no sea un servidor o no tengas acceso. Pero, por si las dudas mejor dejarlo en claro de una vez.

Si todo salió bien, deberías ver algo como esto:

```bash
$ ansible-playbook -i hosts deploy.yml -e "remote_ip=8.8.8.8"

PLAY [Ansible Desplegar Anglular con NGINX]
TASK [Gathering Facts]
TASK [Construir el sitio con Angular]
TASK [Crear el directorio de despliegue]
TASK [Copiar el sitio a la máquina remota]
TASK [Copiar el archivo de configuración de NGINX]
TASK [Reiniciar el servicio de NGINX]
TASK [Enviar una petición al sitio a ver si regresa 200 xd]
TASK [Abrir el sitio en nuestro navegador predeterminado]
TASK [Aparecer una notificacion local con notify-send]


PLAY RECAP
***********************************
localhost                  : ok=9    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

La salida no es exactamente la misma (omití mucha información que podría variar de una ejecución a otra en diferentes servidores).

Listo, ahora podemos disfrutar de nuestro sitio desplegado en nuestro servidor remoto, esto puede ahorranos mucho tiempo y esfuerzo, ya que no tenemos que estar conectándonos a la máquina remota para hacer el despliegue, además de que, si tenemos no uno si no varios servidores, osease muchas máquinas, podemos automatizar el despliegue de todos los sitios en todas las máquinas con retoques menores al playbook.

Ponte a explorarlo un poco, podrías declarar nuevas variables para hacer todo en un solo comando y desplegar diferentes sitios en diferentes servidores. ¿Lo mejor de todo? Puedes tener Ansible instalado en tu máquina local con Linux y, ansible al ser pequeño no estorbará mucho en tu sistema. Tampoco va a gastar recursos si no lo mandas llamar.

## Ansible Semaphore

Antes de terminar, quiero hacer una mención especial a "Ansible Semaphore". Es una herramienta que te permite administrar tus playbooks de Ansible de una manera muy sencilla.

Es una interfaz web que te permite ejecutar los playbooks que has hecho, ver los resultados, ver los logs, etc. PEEEERO, tiene un enfoque más enfocado al CI/CD.

Es una buena alternativa a servicios como las GitHub Actions, Semaphore, Travis e incluso Drone (aunque sigo prefiriendo Drone). Esta es una gran forma de automatizar algunos procesos de tu equipo de desarrollo donde querramos llevar nuestra integración continua / despliegue continuo con Ansible y no deseamos aprender una sintaxis nueva dependiendo de nuestro proveedor de pipelines.

¿Te animas a [probarlo](https://www.ansible.semaphore.com)?

Te dejo las fuentes de este blog:

- [Ansible Documentation](https://docs.ansible.com/)
- [Ansible Core Documentation](https://docs.ansible.com/core.html)
- [Red Hat Ansible Collections Documentation](https://docs.ansible.com/collections.html)
- [ansible.builtin.file module – Manage files and file properties — Ansible Documentation](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/file_module.html)

## Conclusión

Ansible es una herramienta poderosa y muy sencilla de usar con unos cuantos minutos de práctica. Al ser declarativo, es mas facil de entender y de mantener a comparación de un script de bash o incluso de un script de python para desplegar.

¿Qué esperas para dejar de hacer las cosas a mano y comenzar a dominar la automatización y la productividad con Ansible?

Si quieres un par de retos con Ansible te puedo dejar algunos:

- Hacer que el playbook despliegue el sitio en un servidor remoto con Docker.
- Añadir un paso de ejecución de pruebas unitarias antes de desplegar el sitio.
- Añadir manejo de errores y notificaciones en caso de que algo falle.
- Llevar las notificaciones de finalización un paso mas allá e implementar un correo electrónico con el resultado del despliegue o incluso una notificacion por SMS, Whatsapp o Telegram.

Espero que te haya gustado este blog, intenté darle un giro un poco más formal a esta entrada, sin tantos memes, groserías y cinismo. Espero que te haya gustado y que te sea de ayuda en tu camino como sysadmin.

Debo dar un agradecimiento especial al [señor esmif](https://www.linkedin.com/in/anthonysmithvg/) por darme la idea de este blog :) esta entrada va en su honor buen hombre.

¡Nos leemos luego!

### Canción triste del día

Notturno - Darkness
![Spotify Code](/img/posts/ansibleangular/spotify.jpeg)

---

¿Te gustan estos blogs? Ayúdame a seguir escribiéndolos de las siguientes formas:
- [Invítame una coca en bolsita](https://ko-fi.com/ventgrey)
- [Regálame un follow en GitHub ❤](https://github.com/VentGrey)

