---
title: "Como arreglar el gnome-keyring-daemon en LeftWM"
date: "2023-02-14"
tags: ["LeftWM", "Linux", "Gnu", "GNOME", "Rant", "Tutoriales", "Window Managers", "Fix"]
categories: ["Linux", "LeftWM", "Window Managers", "Tutoriales"]
author: "VentGrey"
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "Gnome tiene expertos haciendo cosas chidas y más expertos haciendo porquerías. Vamos a arreglar su asco de keyring en este blog."
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
    image: "/img/posts/gnomesucks/cover.png" # image path/url
    alt: "Imágen del post" # alt text
    caption: "Imágen del post" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/<path_to_repo>/content"
    Text: "Sugerir Cambios" # edit text
    appendFilePath: true # to append file path to Edit link
---

# De nuevo a toparse con un problema que parece que nadie más tiene o que nadie sabe arreglar.

No creo que deba dar otro warning como en el blog de Sveltekit. Este post es mayormente un tutorial + rant de como solucionar problemas, aprovechando para criticar las desiciones tomadas bajo la influencia de sustancias extrañas que nos hacen decir *jiji*.


Gnu/Linux es hermoso, la cantidad de herramientas que hay disponibles es impresionante. Sin embargo, no todo lo que brilla es oro y lamentablemente GNOME se ha enfrascado en demostrar eso. Lo logró con lo que sea que hayan programado que se hace llamar `gnome-keyring-daemon`. Si tu, quien lee esto se ha topado con una ventanita de *"El depósito de claves de inicio de sesión no se desbloqueó cuando inició sesión..."*, hablamos del mismo tipo de cáncer. También para la gente de NixOS que lleva casi 4 años con [un problema relacionado al keyring](https://github.com/NixOS/nixpkgs/issues/61539), [o esta otra](https://github.com/NixOS/nixpkgs/issues/193835), o incluso [esta otra](https://github.com/NixOS/nixpkgs/issues/174099).

Como dice el título, a veces parece que uno está condenado a sufirle cuando se trata de solucionar problemas de una forma sencilla en Gnu/Linux. Y el demonio de llaves parece ser un cuento de nunca acabar cuando utilizas un gestor de ventanas y no un entorno de escritorio. Si bien existe KWallet, nunca he sido fan de tener GTK y QT mezclados en el sistema y, para ser sincero, probé usarlo y tampoco funcionó :(

Luego de buscar en dios sabrá cuantos foros, leer incontables hilos sin responder en Arch Linux o leer las mismas respuestas pedorras en Reddit. Creo (y digo creo porque lo hice en mi máquina principal y lo pude "medio" replicar en una VM) que di con la solución "correcta" para corregir semejante desmadre.

## Ventemil opciones en la documentación y ninguna vale para pura madre

Vamos a empezar a tratar de resolver este desmadre leyendo la [wiki oficial de GNOME](https://wiki.gnome.org) del demonio de llaves.

Lo primerito que nos dice la wiki es:

> "The best place to start gnome-keyring-daemon is from the user's login. This is done via a PAM module. When configured correctly the user does not need to enter any passwords beyond that of their login."

Esto lo vamos a guardar para después porque, hay de dos sopas, o el PAM de Arch Linux y casi todas las distros no está *configured correctly* o la descripción de GNOME es más falsa que las promesas de tu ex.

De hecho, viendo la wiki pone a pensar a uno ¿Debería ser así de necesario tener **TANTOS** "por si acaso" como los tiene el keyring? Parece ser que incluso si el PAM está *propiamente configurado*, el demonio de llaves tiene que ser inicializado al comenzar una sesión de usuario.

PERO, si no se inició desde los módulos del PAM, los archivos de inicio en la sesión de usuario lo van a iniciar. Ok? Eso me suena razonable, al final es el usuario quien lo va a necesitar y seamos sinceros, pocas veces he visto a alguien usarlo en una TTY.

Mmmm...pero si no se inicia nada de lo anterior, lo activará Dbus (blegh) y va a funcionar de forma degradada. Que viene siendo exactamente lo mismo que no funcionar en el caso de esta basurota, porque los agentes de SSH, GPG y el almacenamiento de secretos no funcionarán.

¿Como sabes que tu keyring no funciona para (casi) nada? Tu sistema va a tener tres síntomas:

1. Tu navegador como Firefox o Chrome, no van a recordar las contraseñas que hayas guardado. (No guardes contraseñas aquí, trata de usar un Password Manager o produca guardarlas lo menos posible).
2. Tu llave SSH pide desbloquearse constantemente, sea por hacer un `git pull / push` o acceder a cualquiera de tus servidores remotos.
3. Tu llave GPG hace lo mismo que la SSH pero con un proceso más molesto y/o tedioso.

Bueno, no pasa nada, tenemos el manual para ayudarnos a ver que pedo y donde la estamos regando y estamos de suerte, al menos está bien documentado ¿verdad?

Podemos probar con las opciones `--daemonize` y `--foreground`, sin embargo te invito a probarlas en una terminal normal. El proceso simplemente se "sale" o directamente se muere si interactuas con esa terminal de alguna manera.

Y se lo que estás pensando, *Es que `--foreground` no desconecta al proceso de la terminal* y en efecto, no lo hace. Pero te invito a probarlo con `--daemonize` y que lo veas por ti mismo, solo asegúrate de matar los procesos anteriores para no confundirte.

También estoy viendo la otra cara de la moneda, ¿Por qué no ejecutar la orden directa de los archivos `.desktop` que nos da el mismo keyring? Y de nuevo lo digo, te invito a intentarlo. Solo no te sorprendas porque incluso siendo invocado con las opciones `--start`, `--login` y opcionalmente `--daemonize` sigue sin funcionar. Eventualmente intentarás añadir un `&` al final de la línea para "mandarlo al background ora si" solo para darte cuenta de que, con un solo enter en esa terminal, se muere el proceso.

¿Intentar `disown` y `&` al mismo tiempo? Produce los mismos resultados. (También pasa lo mismo si hacemos uso del operador especial `&!` de ZSH).

## LeftWM está de nuestro lado con XDG

Para evitar pelearnos con los .desktop [LeftWM](https://github.com/leftwm/leftwm) está de nuestro lado y XDG_AUTOSTART es una de las formas que tiene de iniciar las aplicaciones del inicio de sesión. Nos salvamos de tener que hacer cosas como un archivo `autorun.sh` o meternos a la configuración de nuestro window manager y poner algo como `exec `.

Hay una cosa importante con esto. LeftWM iniciará lo que está en `~/.config/autostart`. Desconozco si utiliza el directorio `/etc/xdg/autostart`. En su [wiki](https://github.com/leftwm/leftwm/wiki/Config#autostart) no mencionan nada al respecto. Como no tengo idea usare de *fallback* la idea de que hace lo mismo que los escritoros tradicionales en ese sentido.

Vamos con el primer "semi-fix" de esto.

## Editar el archivo /etc/pam.d/login en Debian ¿y si no funciona?

Uno de los métodos descritos en la wiki de Arch es el llamado *The PAM step* que involucra editar archivos localizados en `/etc/pam.d/login` y añadir la línea `auth optional pam_gnome_keyring.so` al final de la sección `auth`, adicional a ello, también debemos añadir la línea `session optional pam_gnome_keyring.so auto_start ` al final de la sección `session` para tener un archivo más o menos así:

```conf
#%PAM-1.0

auth       required     pam_securetty.so
auth       requisite    pam_nologin.so
auth       include      system-local-login
auth       optional     pam_gnome_keyring.so
account    include      system-local-login
session    include      system-local-login
session    optional     pam_gnome_keyring.so auto_start
```

Sin embargo, el archivo `/etc/pam.d/login` en Debian es totalmente diferente. En una instalación de Debian (netinstall) el archivo se ve así:

```conf
#
# The PAM configuration file for the Shadow `login' service
#

# Enforce a minimal delay in case of failure (in microseconds).
# (Replaces the `FAIL_DELAY' setting from login.defs)
# Note that other modules may require another minimal delay. (for example,
# to disable any delay, you should add the nodelay option to pam_unix)
auth       optional   pam_faildelay.so  delay=3000000

# Outputs an issue file prior to each login prompt (Replaces the
# ISSUE_FILE option from login.defs). Uncomment for use
# auth       required   pam_issue.so issue=/etc/issue

# Disallows other than root logins when /etc/nologin exists
# (Replaces the `NOLOGINS_FILE' option from login.defs)
auth       requisite  pam_nologin.so

# SELinux needs to be the first session rule. This ensures that any
# lingering context has been cleared. Without this it is possible
# that a module could execute code in the wrong domain.
# When the module is present, "required" would be sufficient (When SELinux
# is disabled, this returns success.)
session [success=ok ignore=ignore module_unknown=ignore default=bad] pam_selinux.so close

# Sets the loginuid process attribute
session    required     pam_loginuid.so

# Prints the message of the day upon successful login.

<Archivo Recortado>
```

El archivo es mucho más grande y las instrucciones no funcionan a lo "copia-y-pega" tipo bestia.

Perfecto, el famosisimo *PAM step* no funciona para nosotros ¿Qué hacemos? ¿Estamos condenados?

## Editar el `up` script de LeftWM

Claro, no me podía faltar la instrucción que se repite en todos lados y que (no se porque) a todo mundo parece funcionarle. O bueno, a todo mundo con i3. En nuestro caso no funciona así. En i3 tenemos un archivo de configuración llamado `config` que se encuentra en `~/.config/i3/` y en el cual podemos añadir la siguiente línea para hacer funcionar el keyring:

```conf
exec --no-startup-id /usr/bin/gnome-keyring-daemon --start --components=pkcs11,secrets,ssh
```

En LeftWM tenemos un archivo de configuración, si. Pero no es el lugar donde colocamos las cosas que queremos iniciar junto a nuestra sesión, en su lugar tenemos un script de shell llamado `up` que se encarga de manejar todo eso. Al ser un script de shell podemos poner cualquier instrucción ahí. En nuestro caso, vamos a añadir la misma instrucción que usamos en i3:

```sh
#!/bin/sh
/usr/bin/gnome-keyring-daemon --start --components=pkcs11,secrets,ssh
```

### Oye pero no has hecho el paso de `export`
 
Es cierto, en algunos tutoriales (y en otros no), al final de la llamada al `gnome-keyring-daemon` se añade la instrucción `export SSH_AUTH_SOCK`. Esto es porque el daemon de keyring no exporta la variable de entorno `SSH_AUTH_SOCK` por defecto. Esto es un problema porque `ssh-agent` necesita de esta variable para funcionar. Si no la exportamos, `ssh-agent` no funcionará.

Vamos a corregir la configuración de i3 primero:

```conf
exec --no-startup-id /usr/bin/gnome-keyring-daemon --start --components=pkcs11,secrets,ssh
exec --no-startup-id /usr/bin/ssh-agent -s
```

Y ahora vamos a corregir la configuración de LeftWM:

```sh
#!/bin/sh
/usr/bin/gnome-keyring-daemon --start --components=pkcs11,secrets,ssh
export SSH_AUTH_SOCK
```

Si esto aun no te funciona es porque, hemos estado haciendo pasos a pedazos y debemos mirar atrás a todo lo que hemos probado para deducir que podría estar saliendo mal. La solución que encontré solo la he probado en LeftWM, desconozco si funcionará en otros gestores de ventanas. No pude hacerlo funcionar en AwesomeWM anteriormente ya que debía iniciar mi sesión con dbus y hacer un par de cosas más para que funcionara. En LeftWM no tuve que hacer nada de eso.

## La renuncia de la directora de salud, el acta de nacimiento de Obama, que las madres dejen de joder y que se joda Kyle.

![imagen de southpark](/img/posts/gnomesucks/southpark.jpg)

Resulta que la respuesta a este problema estaba frente a mis narices todo el tiempo, desconozco cual de estos pasos sea omitible o si de plano es necesario hacerlos todos para obtener un keyring medianamente funcional. Doy por hecho que tienes mucho o todo lo necesario instalado porque te estás encontrando con el mismo problema que yo, con esto incluyo los paquetes de `xdg-user-dirs` y `xdg-user-dirs-gtk` que, no se porque pero parece ser que tienen algo que ver con el keyring.

También deberás asegurarte de que tu *polkit* está funcionando correctamente, puedes usar `mate-polkit-bin` o `lxpolkit` para esto. Yo estoy usando `mate-polkit-bin` y funciona perfecto. Si estás en Debian y quieres probar si el polkit se inició correctamente trata de abrir synaptic desde dmenu o rofi (o lo que sea que uses), si se abre un dialogo de autenticación entonces tu polkit está funcionando correctamente.

Otra cosa es que, al parecer el keyring tiene un servicio de systemd en `/usr/lib/systemd/user/gnome-keyring-daemon.service`. Sin embargo no es un servicio para usarse *system-wide*, deberás copiarlo a tu directorio de usuario en `~/.config/systemd/user/` y luego ejecutar `systemctl --user enable gnome-keyring-daemon.service` para que se inicie junto a tu sesión.

Yo omití este paso y no tuve resultados satisfactorios, pero si tu keyring no funciona entonces prueba esto. (Solo ten en cuenta los pasos de inicio del keyring que dije antes, es probable que te salte un warning si tienes 2-3 keyrings al mismo tiempo, idealmente si el keyring detecta que ya está ejecutándose debería ignorar el segundo daemon).


### 1. LeftWM está de nuestro lado, vamos a aprovecharlo.

Algo que mencioné antes en este blog y que estoy repitiendo aquí es que LeftWM está bien hecho desde el inicio y puede usar XDG_AUTOSTART para iniciar las aplicaciones `.desktop` que tengamos en nuestro directorio home. Esto es muy útil para liberar de "*clutter*" nuestro script `up` y limitarlo solamente a aplicaciones de baja importancia o que son omitibles si llegan a fallar como picom o feh.

Perfecto, si ya hace eso solo debemos copiar los archivos `/etc/xdg/autostart/gnome-keyring-ssh.desktop`, `/etc/xdg/autostart/gnome-keyring-pkcs11.desktop` y `/etc/xdg/autostart/gnome-keyring-secrets.desktop` a nuestro directorio home en `~/.config/autostart/` y listo. El keyring debería funcionar sin problemas...sorpresa. No lo hace, pero no perdamos la esperanza, vamos a ver que onda.

Ok, son archivos `.desktop`, de acuerdo a la[ especificación oficial de freedesktop](https://specifications.freedesktop.org/desktop-entry-spec/latest/), estas weas deben tener un formato básico, entre ese formato está la llave `Exec`, pero eso no es lo que buscamos, buscamos lo que normalmente se pone debajo. Vamos a hacer un `cat /etc/xdg/autostart/gnome-keyring-ssh.desktop` para ver que hay dentro (Al archivo original le recoré las miles de traducciones que tiene, así que no es exactamente igual):

```conf
[Desktop Entry]
Type=Application
Name[es]=Agente de claves SSH
Exec=/usr/bin/gnome-keyring-daemon --start --components=ssh
OnlyShowIn=GNOME;Unity;MATE;
X-GNOME-Autostart-Phase=PreDisplayServer
X-GNOME-AutoRestart=false
X-GNOME-Autostart-Notify=true
X-GNOME-Bugzilla-Bugzilla=GNOME
X-GNOME-Bugzilla-Product=gnome-keyring
X-GNOME-Bugzilla-Component=general
X-GNOME-Bugzilla-Version=42.1
```

¿Notas como hay una línea que dice `OnlyShowIn`? Esa llave le especifica al archivo o a lo que sea que lo ejecuta que dicho archivo solo se muestre para los escritorios que estén disponibles en esa llave. En nuestro caso, solo se mostrará para GNOME, Unity y MATE. Esto es un problema porque LeftWM no está en esa lista.

Tenemos dos opciones, añadir LeftWM a esta lista o quitar esa llave "*alv*" (a la voz). Yo en lo personal prefiero borrarlo, la lógica es la misma que la de `lxsession`:

> Some gnome applications have the "OnlyShowIn=GNOME" key in their *.desktop files. That key means 'only load this application in GNOME' and it prevents the application from being loaded in other desktop environments. Actually, most of those applications can work well under other desktops, but sometimes they claim they are GNOME-only.

Si deseas solo añadir LeftWM a la lista, primero debemos de extraer la variable `$XDG_CURRENT_DESKTOP`, el valor podemos verlo con `echo $XDG_CURRENT_DESKTOP`, para LeftWM el valor debería ser: `LeftWM`. Ahora, vamos a editar el archivo `~/.config/autostart/gnome-keyring-ssh.desktop` y añadir `LeftWM` a la llave `OnlyShowIn`:

```conf
[Desktop Entry]
<Recortado>
OnlyShowIn=GNOME;Unity;MATE;LeftWM;
```

Cualquiera de las dos opciones debería funcionarte perfectamente.

### 2. Configurar bash para que las variables del keyring se usen correctamente.

¿Como sabemos si nuestro keyring está funcionando correctamente? Bueno, al menos en LeftWM, en cada inicio muchas de las cosas que mandamos llamar en el `up` script envían sus logs al archivo `~/.xsession-errors` vamos a ver si hay algo relacionado con el keyring ahí:

```bash
$ grep "keyring" ~/.xsession-errors
SSH_AUTH_SOCK=/run/user/1000/keyring/ssh
```

Mira nomás, el keyring está funcionando correctamente, pero no podemos usarlo porque no tenemos las variables de entorno que nos permitan hacerlo. ¿Como podemos solucionar esto? Bueno, tenemos que configurar nuestro shell para que las variables de entorno que nos provee el keyring se usen en cada inicio de sesión. Para esto, vamos a editar el archivo `~/.bashrc` y añadir las siguientes líneas:

```bash
export SSH_AUTH_SOCK=/run/user/1000/keyring/ssh
export GNOME_KEYRING_CONTROL=/run/user/1000/keyring
```
Yo las añadí al final del archivo. Podría decir que las deberías añadir antes de la línea que dice `# If not running interactively, don't do anything` pero no hace diferencia realmente.

### 3. Reiniciar la sesión de usuario. Y probar.

Vamos a probar si funcionaron nuestras artimañas. Reinicia tu sesión de usuario, puedes cerrar sesión o ser un bestia y reiniciar toda la computadora. Una vez que hayas reiniciado, abre una terminal y ejecuta `echo $SSH_AUTH_SOCK` y `echo $GNOME_KEYRING_CONTROL`, deberían de mostrar el mismo valor que en el paso anterior.

O de una forma más divertida, abre una terminal y trata de conectarte a SSH o hacer push a un repositorio de git. Ya no debería de pedir tu contraseña. Si la pide, revisa los pasos de nuevo.

Debo dar un último disclaimer, desconozco porque, pero tus contraseñas de Chrome/Chromium/Brave/Firefox no funcionarán a veces, es decir, *funciona cuando quiere*, no tengo idea de que pueda ser lo que lo está causando. Si alguien tiene una idea, por favor, abre un issue en el repositorio de GitHub de este blog para añadir tu solución.

## Conclusión

No hay mucha conclusión constructiva que dar. Al igual que DBus, el `gnome-keyring-daemon` es software que, o no debió existir o que lo debió programar alguien más. Insistiré en mi postura de que, no puede ser que algo que debería de ser simple de hacer funcionar en **TODOS LADOS** requiera de desventuras de horas o incluso días como la que acabas de leer.

En todo caso, me quedaré con una cosa que le dije a un amigo mío hace pocos días: *Escribir software sin bugs es difícil, liberarlo sin bugs no debería serlo.*

Mucho de este pedo se pudo solucionar gracias a las siguientes fuentes de información:

- [Gnome Keyring en la Wiki de Arch](https://wiki.archlinux.org/title/GNOME/Keyring#Automatically_change_keyring_password_with_user_password)

- [Running the keyring daemon - Gnome Wiki](https://wiki.gnome.org/Projects/GnomeKeyring/RunningDaemon)

### Canción triste del día

*Colours - Airbag*

![Colours](/img/posts/gnomesucks/spotify.png)

---

¿Te gustan estos blogs? Ayúdame a seguir escribiéndolos de las siguientes formas:
- [Invítame un gansito mayugado](https://ko-fi.com/ventgrey)
- [Regálame un follow en GitHub ❤](https://github.com/VentGrey)
