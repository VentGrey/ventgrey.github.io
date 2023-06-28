---
title: "Podman casi desde cero."
date: 2023-06-27
tags: ["DevOps", "Podman", "Docker", "Contenedores", "Linux", "Tutoriales"]
categories: ["DevOps", "Linux", "Tutoriales", "Contenedores", "Podman", "Docker"]
author: "VentGrey"
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "Aprende a usar Podman desde cero en este mini-blog. ¡Librate del infierno de las dependencias!"
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
    image: "/img/posts/podman/cover.png" # image path/url
    alt: "Imágen del post" # alt text
    caption: "Imágen del post" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/<path_to_repo>/content"
    Text: "Sugerir Cambios" # edit text
    appendFilePath: true # to append file path to Edit link
---

# Por mientras...

Hola de nuevo, prometí que no abandonaría este blog tan seguido y mira tú por donde, aquí estoy de nuevo. Esta vez con un tema que me ha tenido bastante ocupado últimamente, y es el uso de contenedores en Linux. En particular, el uso de Podman, que es una herramienta que me ha resultado bastante útil en mi trabajo.

Este no será un blog muy largo, más que nada es para no dejarte sin algo de contenido útil en lo que termino el artículo que les prometí acerca de como crear un honeypot para los juakers :) ese proyecto sigue en proceso y pronto tendrán un blog 100% explicado y con código para que puedas hacerlo tu mism@.

Todos nos hemos encontrado con la siguiente situación, ya sea qe nosotros u otra persona esté desarrollando una aplicación y debamos probarla, inevitablemente nos vamos a ver envueltos en un proceso de instalación de dependencias, configuración de variables de entorno, etc. En el mejor de los casos todo funcionará correctamente, lo cual pasa como un 5% de las veces, el 95% nos vamos a ver envueltos en problemas de dependencias, para evitar este tipo de problemas de reproducibilidad, se crearon los contenedores, nosotros vamos a hablar de Podman, pero existen otras alternativas como Docker, LXC, etc.

En este blog, conocerás Podman, una alternativa a Docker con un par de cosas interesantes. Si ya usas Docker podrás entender como funciona Podman y si no, podrás aprender a usarlo desde cero, espero poder explicarlo de la mejor manera posible.

## ¿Qué es Podman?

Podman es una plataforma de software que nos permite automatizar el despliegue, escalado y ejecución de aplicaciones dentro
de unas cosas llamadas *"contenedores"*. Estos contenedores son un tipo de virtualización a nivel de sistema operativo, que nos permite ejecutar aplicaciones de manera aislada, sin afectar al sistema operativo anfitrión.

Si aún no lo comprendes, vamos a hacer una analogía un poco más sencilla. Imagina que tienes un tren de juguete, En lugar de embalar cada juguete individualmente y luego tener que preocuparte de que cada uno llegue a su destino, simplemente los metes todos en un contenedor (o en este caso, un vagón de tren) y los envías. Podman hace algo similar con las aplicaciones.

Cada contenedor de Podman (o vagón de tren) tiene todo lo que la aplicación necesita para funcionar: código, runtime, bibliotecas, variables de entorno, archivos de configuración. Todo empaquetado en un solo lugar. ¿No es maravilloso? Spoiler: Sí, lo es (si sabes cuando usarlo).

## ¿Por qué querría usar contenedores? ¿Cuáles son sus ventajas?

Los contenedores ofrecen varias ventajas clave que los vuelven muy atractivos para los devs, los sysadmins y los DevOps:

- **Aislamiento:** Los contenedores son entornos aislados que contienen todo lo necesario para ejecutar una aplicación. Esto significa que puedes tener diferentes versiones de una biblioteca o un lenguaje de programación en diferentes contenedores sin que se interfieran entre sí.

- **Portabilidad:** Como los contenedores contienen todo lo necesario para ejecutar una aplicación, puedes moverlos fácilmente de un sistema a otro. Esto hace que los contenedores sean una excelente opción para el desarrollo, las pruebas y la implementación.

- **Eficiencia:** Los contenedores son más eficientes que las máquinas virtuales porque comparten el mismo kernel del sistema operativo en lugar de emular un sistema operativo completo.

- **Escalabilidad:** Los contenedores son fáciles de escalar. Si necesitas más capacidad, simplemente puedes iniciar más contenedores.

- **High-Availability** Los contenedores son fáciles de replicar y distribuir en diferentes servidores. Esto hace que sea fácil crear aplicaciones de alta disponibilidad. (Es decir, aplicaciones que están siempre disponibles, incluso si uno o más servidores fallan).

Es importante recordar que, aunque las cosas *""nuevas""* suenan a que serán la siguiente panacea para todos, no siempre es así, los contenedores son una herramienta muy útil, pero no son la solución a todos los problemas, por lo que, antes de usarlos, debes preguntarte si realmente los necesitas, si no, estarás agregando una capa de complejidad innecesaria a tu proyecto. ¿Verdad, gente que le pone Docker a todo? 👀

## Cuando NO usar contenedores

A pesar de su vergo de ventajas, los contenedores no son la solución adecuada para todas los casos de uso. Aquí hay algunos escenarios en los que podrías querer reconsiderar o directamente mandar *alv* el uso de contenedores:

- **Aplicaciones que requieren muchos recursos del sistema:** Si tu aplicación necesita un acceso directo y sin restricciones al hardware subyacente, los contenedores podrían no ser la mejor opción. Además, salvo que tengas una muy buena justificación para ello tus programas no deberían de ser unos cerdos de recursos. (Si tu aplicación consume un vergo de recursos, no es culpa de los contenedores, es culpa tuya).

- **Aplicaciones con requisitos de seguridad estrictos:** Aunque los contenedores ofrecen un cierto grado de aislamiento y pueden ser *"tuneados"* para lo mismo, no son tan seguros como una máquina virtual completa. Si tu aplicación maneja datos sensibles y necesita una seguridad muy robusta, podría ser mejor optar por una máquina virtual en lugar de un contenedor.

- **Aplicaciones monolíticas:** Si tienes una aplicación monolítica grande que no se presta a ser dividida en microservicios, los contenedores podrían no ofrecer muchos beneficios, salvo la portabilidad de la misma, cosa que puedes lograr con otras herramientas.

## Instalar Podman

Ya saben la cátedra, todo lo escrito en este blog está orientado a sistemas operativos basados en Linux, en particular, yo uso Debian, por lo que, si estás en otra distribución, puede que los comandos cambien un poco, pero no debería ser muy diferente.

Si estás en Windows, necesitarás del WSLv2 para poder usar Podman, puedes aprender a configurarlo o puedes hacerte un favor y dejar de usar un sistema operativo de juguete. Si fuera tan bueno como dicen no necesitaría de WSL para poder usar Podman ¿no crees? 👀

Afortunadamente para nosotros, Podman se encuentra ya empaquetado para Debian y Ubuntu, si tienes alguna de estas distribuciones, puedes instalarlo con el siguiente comando:

```bash
$ sudo apt install podman
```

Si eres usuario de Docker y no quieres que Podman te rompa el corazón, puedes instalar equivalente de algunas herramientas de Docker y un "alias" para que cuando escribas `docker` en la terminal, en realidad se ejecute `podman`:

```bash
$ sudo apt install podman-docker podman-compose
```

`podman-docker` nos permite usar el comando `docker` para ejecutar Podman, y `podman-compose` nos permite usar el comando `docker-compose` para orquestar contenedores con Podman.

Puedes encontrar más información de como instalar Podman, [aquí](https://podman.io/getting-started/installation.html).

> Deberás de configurar Podman luego de instalarlo, puedes encontrar más información [aquí](https://podman.io/getting-started/installation.html#configuring-your-system).

Podman también nos permite el uso de contenedores en modo *"rootless"*, es decir, sin necesidad de ser root, esto es muy útil para los desarrolladores, ya que no necesitan ser root para poder usar contenedores, dependiendo de tu distribución, puede que necesites instalar algunos paquetes adicionales para poder usar Podman en modo *"rootless"*, puedes encontrar más información [aquí](https://podman.io/getting-started/rootless.html).

## Conceptos fundamentales de Podman

Antes de comenzar a usar Podman, es importante que leamos y entendamos algunos conceptos fundamentales del mismo. Te presentaré algunos conceptos acompañados de emojis para que sea más fácil de entender.

- **Imágenes** 🖼 : Una imagen es un archivo de solo lectura que contiene un conjunto de capas que representan un sistema de archivos de contenedor. Una imagen se puede usar para iniciar uno o más contenedores. Las imágenes se pueden crear o descargar de un registro de imágenes. (Un registro de imágenes es un repositorio de imágenes, como Docker Hub). Las imágenes son inmutables, lo que significa que no se pueden modificar una vez creadas.

- **Contenedores** 📦 : Un contenedor es una instancia en ejecución de una imagen. Puedes pensar en los contenedores como una caja que contiene una aplicación y todo lo necesario para que funcione, incluyendo el sistema operativo, las bibliotecas del sistema y las dependencias de la aplicación.

- **Registros** 📝 : Los registros son lugares donde se almacenan y distribuyen las imágenes. Podman utiliza Docker Hub por defecto, pero puedes configurarlo para usar otros registros.

- **Pods** 🌱 : Un pod es un grupo de uno o más contenedores que comparten recursos de red y almacenamiento. Los pods son una característica de Kubernetes, pero Podman también los admite.

- **Volúmenes** 📁 : Un volumen es un directorio que se monta en un contenedor. Los volúmenes se pueden usar para compartir datos entre contenedores o para persistir los datos del contenedor.

- **Redes** 🌐 : Una red es un grupo de contenedores que pueden comunicarse entre sí. Podman crea una red por defecto, pero puedes crear tus propias redes si lo deseas.

- **Override** 📝 : Un override es un archivo que se utiliza para anular la configuración de un contenedor. Los overrides se pueden utilizar para cambiar la configuración de un contenedor sin tener que volver a crear la imagen.


## Desplegando nuestro primer contenedor.

Ahora si, hora de ensuciarnos las manos. Vamos a crear nuestro primer contenedor con Podman.

Se que odio los ejemplos pedorros de otros blogs, pero, por el momento vamos a desplegar una imágen de *"Hola Mundo"* como en todos los mugrosos blogs introductorios a algo.

Si te interesa más el tema puedes tratar de re-crear mi [tutorial introductorio de Ansible](https://laesquinagris.com/posts/ansible-primeros-pasos/) y camibar los pasos de Docker por Podman, también, puedes aplicar tus conocimientos de estos dos blogs y automatizar los despliegues de alguna aplicación web que tengas. Puedes incluso, ir más allá y extender tu aplicación web para que tenga una arquitectura de "Microservicios" y separar el frontend del backend y la base de datos. Todos desplegarlos en contenedores separados y orquestarlos con Podman y Podman-Compose.

Primero, necesitamos una imagen Podman para nuestra aplicación. Las imágenes Podman son como plantillas que se utilizan para crear contenedores. Una buena analogía de ello es que las imágenes son como los moldes de galletas y los contenedores son las galletas que se crean con ellos.

Vamos a usar la imágen `hello-world`, abrimos una terminal y ya con podman instalado, ejecutamos el siguiente comando:

```bash
$ podman run hello-world
```

La salida debería ser algo como esto:

```bash
Resolved "hello-world" as an alias (/etc/containers/registries.conf.d/shortnames.conf)
Trying to pull docker.io/library/hello-world:latest...
Getting image source signatures
Copying blob 719385e32844 done  
Copying config 9c7a54a9a4 done  
Writing manifest to image destination
Storing signatures

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/
```

Podman descargará la imagen `hello-world` de Docker Hub y la ejecutará en un contenedor. El contenedor imprimirá un mensaje de bienvenida y luego se detendrá.

¿Ya lo viste? Podman es compatible con Docker Hub, por lo que puedes usar las imágenes de Docker Hub con Podman. Además de que, todos los comandos de Docker tienen su equivalente en Podman, por lo que si ya conoces Docker, no tendrás problemas para usar Podman.

Si tienes `podman-docker` podemos probar el mismo comando pero con `docker` en lugar de `podman`:

```bash
$ docker run hello-world
```

La salida debería ser parecida a la anterior.

```
Emulate Docker CLI using podman. Create /etc/containers/nodocker to quiet msg.

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/
```

¿Qué cambió aquí? Primero, al inicio de la salida, vemos un mensaje que dice: *"Emulate Docker CLI using podman. Create /etc/containers/nodocker to quier msg."*. Esto es porque `podman-docker` está configurado para emular el comando `docker` con `podman`. Si no tuvieramos `podman-docker` instalado, el comando `docker` no funcionaría.

En segundo lugar, ¿Viste como ahora las primeras líneas de la salida no muestran mensajes de descarga de la imagen? Esto es porque Podman ya tiene la imagen `hello-world` guardada, por lo que no necesita descargarla de nuevo. Todas las imágenes que descargues con Docker se guardarán en el directorio `/var/lib/containers/storage/images` si estás con modo root o en una instalación *rootless* en `~/.local/share/containers/storage/images`.

## Explorando podman un poco más.

Podman es una herramienta muy completa, por lo que no podremos cubrir todas sus características en este tutorial. Sin embargo, vamos a explorar algunas de las características más importantes de Podman. Vamos a ver que pedo con los comandos que probablemente usarás con más frecuencia.

### Listando contenedores.

Supongamos que queremos ver todos los contenedores que tenemos en ejecución. Para ello, usamos el comando `podman ps -a`:

```bash
$ podman ps -a
```

La salida debería ser algo como esto:

```bash
CONTAINER ID  IMAGE                                 COMMAND     CREATED        STATUS                    PORTS                                                                                                                                 NAMES
03d95c129147  gcr.io/k8s-minikube/kicbase:v0.0.39               3 days ago     Created                   127.0.0.1:41005->22/tcp, 127.0.0.1:46169->2376/tcp, 127.0.0.1:36835->5000/tcp, 127.0.0.1:45731->8443/tcp, 127.0.0.1:40205->32443/tcp  minikube
22d3702f551c  docker.io/library/hello-world:latest  /hello      9 minutes ago  Exited (0) 9 minutes ago                                                                                                                                        friendly_wescoff
a8bd5d98a104  docker.io/library/hello-world:latest  /hello      8 minutes ago  Exited (0) 8 minutes ago                                                                                                                                        upbeat_elion
```

Aquí vemos una lista de todos los contenedores que tenemos en ejecución. Podemos ver el ID del contenedor, la imagen que se usó para crear el contenedor, el comando que se está ejecutando en el contenedor, el estado del contenedor y los puertos que se están reenviando desde el contenedor al host.

En mi caso tengo un contenedor de minikube y dos contenedores de `hello-world`. Los contenedores de `hello-world` se ejecutaron y luego se detuvieron, por lo que su estado es `Exited (0)`. El contenedor de minikube se está ejecutando, por lo que su estado es `Created`.

> Minikube es una herramienta que nos permite ejecutar un cluster de Kubernetes a escala local. Puedes encontrar más información sobre minikube en su [sitio web](https://minikube.sigs.k8s.io/docs/).

## Detener un contenedor.

Si queremos detener un contenedor, podemos usar el comando `podman stop`:

```bash
$ podman stop <container-id>
```

Supongamos que tenemos un contenedor con ID `03d95c129147` y queremos detenerlo. Para ello, usamos el comando `podman stop`:

```bash
$ podman stop 03d95c129147
```

La salida debería ser algo como esto:

```bash
03d95c129147
```

## Eliminar un contenedor.

Volvamos a mi caso, ¿Por qué tengo dos contenedores de `hello-world`? Pos por pendejo, pero eso no importa, podemos borrar los contenedores que ya no necesitamos. Para ello, usamos el comando `podman rm`:

```bash
$ podman rm <container-id>
```

En mi caso los contenedores `hello-world` tienen los ID `22d3702f551c` y `a8bd5d98a104`, por lo que para eliminarlos, usamos el comando `podman rm`:

```bash
$ podman rm 22d3702f551c a8bd5d98a104
```

La salida debería ser algo como esto:

```bash
22d3702f551c
a8bd5d98a104
```

Nótese que, estamos hablando de contenedores, no de las imágenes. Si queremos eliminar una imagen, usamos el comando `podman rmi`:

```bash
$ podman rmi <image-id>
```

En nuestro caso la imágen de `hello-world` nada más nos estorba en nuestro disco, vamos a listar las imágenes que tenemos con el comando `podman images`:

```bash
$ podman images
```

La salida debería ser algo como esto:

```bash
REPOSITORY                     TAG         IMAGE ID      CREATED       SIZE
<none>                         <none>      5ae27983c828  2 weeks ago   1.02 GB
<none>                         <none>      9491abe52346  5 weeks ago   800 MB
docker.io/library/hello-world  latest      9c7a54a9a43c  7 weeks ago   19.9 kB
gcr.io/k8s-minikube/kicbase    v0.0.39     67a4b1138d2d  2 months ago  1.06 GB
```

En mi caso, la imagen de `hello-world` tiene el ID `9c7a54a9a43c`, por lo que para eliminarla, usamos el comando `podman rmi`:

```bash
$ podman rmi 9c7a54a9a43c
```

¿Qué son las imágenes `<none>`? Son imágenes que no tienen un nombre o tag. Estas imágenes se crean cuando se construye una imagen con un nombre o tag que ya existe. Por ejemplo, si construimos una imagen con el nombre `hello-world` y luego construimos otra imagen con el mismo nombre, la primera imagen se etiquetará como `<none>`.

Vamos a modificar el comando de `podman rmi` para que elimine todas las imágenes basura, excepto la de minikube:

```bash
$ podman rmi 5ae27983c828 9491abe52346 9c7a54a9a43c

```

La salida del comando `podman rmi` debería ser algo como esto:

```bash
Untagged: docker.io/library/hello-world:latest
Deleted: 5ae27983c828723b26e04609efee63ab7c4ae6e0aad4bf754e889eac378faae4
Deleted: 111bb07120df1778e9fcec3b924955002efc49c0339958572884d6c007d54371
Deleted: 9491abe52346f8c7b16017e46b8d14d0ece46461e203c0e51ae1f5ef3e2c2a7d
Deleted: 9c7a54a9a43cca047013b82af109fe963fde787f63f9e016fdc3384500c2823d
```

Es importante que, cuando uses contenedores, ajustes tu forma de pensar y desarrollar en ellos como máquinas efímeras, es decir, que puedes crearlas y destruirlas cuando quieras. 

Los contenedores, por defecto son efímeros, por lo que, todo cambio que hagas en un contenedor, se perderá cuando lo elimines. Si quieres que los cambios que hagas en un contenedor persistan, puedes usar volúmenes, pero eso es tema para otro post.

También, aunque no es muy recomendado, si necesitas generar una nueva imágen a partir de un contenedor que ya has modificado fuertemente, puedes usar el comando `podman commit`:

```bash
$ podman commit <container-id> <new-image-name>
```

En mi caso, tengo un contenedor de minikube que he modificado fuertemente, por lo que quiero generar una nueva imagen a partir de ese contenedor. Para ello, uso el comando `podman commit`:

```bash
$ podman commit 03d95c129147 minikube:latest
```

La salida del comando `podman commit` debería ser algo como esto:

```bash
Getting image source signatures
Copying blob 5ae27983c828 skipped: already exists
Copying blob 9491abe52346 skipped: already exists
Copying blob 9c7a54a9a43c skipped: already exists
Copying blob 67a4b1138d2d skipped: already exists
Copying blob 22d3702f551c [--------------------------------------] 0.0b / 0.0b
Copying blob a8bd5d98a104 [--------------------------------------] 0.0b / 0.0b
Copying blob 03d95c129147 [======================================] 1.1KiB / 1.1KiB
Copying config 5ae27983c8 done
Writing manifest to image destination
Storing signatures
```

## Conclusión.

Te dije que sería un blog corto. En lo que sale el blog del honeypot pensé que sería de utilidad este blog para que comiences a utilizar contenedores como una herramienta más en tu arsenal de desarrollo.

Apenas vimos una pequeñísima parte de Podman, pero es suficiente para que comiences a utilizarlo. Podman es una herramienta poderosa que puede cambiar la forma en que desarrollas y despliegas aplicaciones. Así que no te detengas aquí. Sigue explorando, sigue aprendiendo y, como siempre, ¡sigue programando! La practica hace al maestro.

### Canción triste del día.

*Jinn - Soen*

> Forty Days and Forty Nights. You were the drug that kept me alive.

![Spotify Code](/img/posts/podman/spotify.png)

--- 

¿Te gustan estos blogs? Ayúdame a seguir escribiéndolos de las siguientes formas:
- [Invítame 2 chicles](https://ko-fi.com/ventgrey)
- [Regálame un follow en GitHub ❤](https://github.com/VentGrey)
