---
layout: post
---

# Lemonbar, la barra de estado que te dispara en el pie si así lo deseas.

Uno de los aspectos de *"Hacer más con menos"* en los window managers es la inclusión de una barra de estado. En entornos de escritorio es posible añadir applets o widgets en pantalla que nos muestren múltiples líneas de información sobre el estado actual de nuestro sistema, esta información puede representar cosas diferentes, la fecha y hora, la batería restante, el estado de la red / bluetooth, la carga del sistema, etc.

Por lo general yo no incluía esta información en mis paneles o en mi escritorio, pues los entornos ya son bastante *"pesados"* en sí mismos y añadir cosas encima solo los haría más lentos. Sin embargo, con un Window Manager ligero a mi disposición consideré que podía darme el lujo de añadir dicha información para verla constantemente. 

Comencé usando [polybar](https://github.com/polybar/polybar), porque la configuración es sencilla y no toma más de 5 minutos aprender a dejarla con la información que te gusta, el problema para mí es que Polybar consumía 26~30Mb de RAM en mi sistema y esa cantidad de memoria consumida para algo tan sencillo como una barra es **INACEPTABLE**. Por lo que comencé a buscar alternativas que pudiese utilizar y, luego de ver más de 18 status bar (*todas feas, debo decir*) llegué a la conclusión de que la mejor opción era una barra llamada [lemonbar](https://github.com/LemonBoy/bar). Era la opción más minimalista y tenía una excusa perfecta para usarla: Lemonbar procesa todo por "strings" que uno le pasa a través de un *pipe*, como obtener información y como desplegarla a lemonbar es problema de quien la utiliza, por lo que, tú te encargas de configurar todo y tú eres el único responsable de que tan rápida y ligera o que tan lenta y pesada es tu barra de estado.

Esto era perfecto para mí, pues mataba a dos pájaros de un tiro, tendría una barra que se ajuste 1:1 a mis necesidades Y podría practicar el uso de scripts en shell y programación en C y aprender un par de trucos nuevos. La idea general de una barra de estado es monitorear el sistema y su estado de la forma más básica que sea legible para nosotros, por lo que no buscaba incluir indicadores de música, layout del window manager o cosas más vagas como frases aleatorias del comando `fortune`. La implementación final se ve así:

![lemonbar](https://raw.githubusercontent.com/VentGrey/ventgrey.github.io/master/assets/img/barra.png)

Ahora es momento de explicar como configuré los elementos que se ven en la barra y como tú puedes lograr configuraciones similares en caso de que decidas usar lemonbar en un futuro cercano.

A grandes rasgos, lemonbar solo dibuja una barra con texto, como meter ese texto es cosa del usuario. El problema de lemonbar viene cuando queremos calcular "al vuelo" e imprimir en la misma barra. Lemonbar no es multihilo / multiproceso y procesar todo bajo el mismo lugar puede ocasionar dos cosas: 

1. Formaremos un cuello de botella y la barra comenzará a mostrar información "tarde" o simplemente se congelará.
2. El proceso tendrá que invocar muchos programas en el mismo trabajo, en poco tiempo y esto consumirá una cantidad **ENORME** de cpu.

En cualquier caso, hay que tener cuidado al momento de usar lemonbar. La solución que encontré y que escribí basándome en un par de videos de Youtube y el trabajo de otros usuarios de window managers (BSPWM para ser precisos) fue la siguiente:

1. Reducir la cantidad de comandos / archivos de shell e implementar "getters" de información sencilla en C o Rust
2. Crear un FIFO para que los comandos necesarios escriban su información ahí en lugar de escribirla directamente en la barra.
3. Imprimir la información de los comandos con un prefijo fácil de eliminar, por ejemplo `V:75%` para el volumen del sistema.
4. Leer el archivo FIFO línea por línea y enviar la información a su respecitivo lugar en la barra.

Veamos los pasos uno a uno:

## Imprimir los espacios de trabajo en lemonbar

Antes de empezar tengo que decir que, todo esto se está realizando en un script de shell. Tengo una preferencia personal por la shell estándar, por lo que recomiendo que dejes la primera línea de tu script como: `#!/bin/sh`, que normalmente apunta a `dash` en algunas distribuciones. La razón es sencilla, las shells que son POSIX compliant son mejores, más seguras y más rápidas.

Dicho esto, comencemos...

Para obtener los espacios de trabajo encontré un programa en C escrito por Christian Neukirchen licenciado bajo el dominio público llamado `wmdesk`. Modifiqué este programa para que la bandera `-n` mostrara los espacios de trabajo de forma continua y sin carácteres en lugar de uno en una línea nueva y marcar el actual con un asterisco.

La primera parte es obtener el espacio de trabajo actual, esto se logra llamando a `wmdesk` sin argumentos:

```shell
$ "$HOME"/.config/leftwm/themes/epitaph/scripts/lemonba>                                          <

```

Esto podemos guardarlo en una variable que luego utilizaremos para sustituir en la segunda parte de nuestro script

```shell
curr=$("$HOME"/.config/leftwm/themes/epitaph/scripts/lemonbar/wmdesk)
```

Ahora necesitamos la lista completa de workspaces, eso lo logramos llamado `wmdesk` modificado con la bandera `-a`:

```shell
$ "$HOME"/.config/leftwm/themes/epitaph/scripts/lemonba>
         
```

Finalmente usando la magia de `sed` podemos imprimir los workspaces, modificando la salida del comando para que, el workspace actual aparezca rodeado de los operadores `%{R}` propios de lemonbar para invertir los colores en la barra:

```shell
printf "%s" "$("$HOME"/.config/leftwm/themes/epitaph/scripts/lemonbar/wmdesk -a)" | sed -e "s/$curr/%{R} $curr %{R}/"
```

Esto podemos guardarlo en una función que podemos utilizar más tarde para facilidad de llamada (Para las personas un poco más entendidas en scripting, la shell no genera una "subshell" al definir / llamar funciones, por lo que no hay un impacto real en el rendimiento):

```shell
_Workspaces() {
        curr=$("$HOME"/.config/leftwm/themes/epitaph/scripts/lemonbar/wmdesk)
        printf "%s" "$("$HOME"/.config/leftwm/themes/epitaph/scripts/lemonbar/wmdesk -a)" | sed -e "s/$curr/%{R} $curr %{R}/"
}
```

![Workspaces](https://github.com/VentGrey/ventgrey.github.io/blob/master/assets/img/workspaces.png?raw=true)

## Imprimir información general del sistema en Lemonbar

El mismo principio puede ser aplicado a diferentes módulos, con una diferencia en específico. El cambio de espacios de trabajo solo debe verse reflejado cuando hay un "cambio de estado" en el window manager, es decir, cuando cambia una ventana o cuando cambiamos de estado de trabajo.

En el caso de los módulos de batería, volúmen y otros, es mejor hacer un ciclo infinito y poner a "dormir" el trabajo durante algunos segundos o milisegundos antes de volver a actualizar la información.

> Es importante no saltar el `sleep` en este caso, si nuestros módulos se actualizan muy rápido puede ser que tengan un impacto en la CPU de nuestro equipo O que simplemente no permitan a lemonbar dibujar las cosas a tiempo y cause bugs visuales.

En mi caso no leo constantemente el módulo de fecha y hora ni el módulo de internet, por lo que, puedo esperar 3 segundos para ver una actualización de los mismos en lemonbar:

```shell
_Modules() {
        while true; do
                echo "S:$(/usr/sbin/iwgetid -r || printf '%s' 'Disconnected')"
                echo "T:$("$HOME"/.config/leftwm/themes/epitaph/scripts/lemonbar/time &)"
                sleep 3
        done
}
```

![Internet](https://github.com/VentGrey/ventgrey.github.io/blob/master/assets/img/internet.png?raw=true)
![Calendar](https://github.com/VentGrey/ventgrey.github.io/blob/master/assets/img/cal.png?raw=true)

Podemos hacer lo mismo con otros módulos, separándolos por funciones con sus propios retrasos entre actualizaciones para evitar forzar nuestra computadora:

```shell
# No necesitamos ver el CPU y la RAM constantemente, podemos hacerlo en intervalos de 5 segundos.
_SysInfoModule() {
        while true; do
                echo "C:$("$HOME"/.config/leftwm/themes/epitaph/scripts/lemonbar/cpu_usage &)"
                echo "R:$("$HOME"/.config/leftwm/themes/epitaph/scripts/lemonbar/ram_usage &)"
                sleep 5;
        done
}
```

![CPU](https://github.com/VentGrey/ventgrey.github.io/blob/master/assets/img/cpu.png?raw=true)
![MEM](https://github.com/VentGrey/ventgrey.github.io/blob/master/assets/img/mem.png?raw=true)

```shell
# La batería no es algo que se descargue tan rápido, podemos revisarla igual, cada 5 segundos.
_BatModule() {
        while true; do
            echo "B:$("$HOME"/.config/leftwm/themes/epitaph/scripts/lemonbar/battery &)"
            sleep 5;
        done
}

```

![Battery](https://github.com/VentGrey/ventgrey.github.io/blob/master/assets/img/batt.png?raw=true)

```shell
# En mi caso, el volúmen debería aparecer casi de inmediato al ser cambiado.
_VolModule() {
        while true; do
        echo "V:$("$HOME"/.config/leftwm/themes/epitaph/scripts/lemonbar/getvol &)"
        sleep 0.2;
        done
}
```


![Volume](https://github.com/VentGrey/ventgrey.github.io/blob/master/assets/img/vol.png?raw=true)

Antes de comenzar con la magia negra, necesitamos crear una última función. El tiempo de actualización de esta no será en un lapso de tiempo definido, será cada que una línea cambie en el FIFO que definiremos más adelante, en específico las dos cosas que necesitan de este tipo de actualización en específico son:

- EL nombre de la ventana activa 
- El espacio de trabajo actual

Podemos implementarla de la siguiente forma:

```shell
_Wininfo() {
        leftwm-state | while read -r line; do
                echo "W:$("$HOME"/.config/leftwm/themes/epitaph/scripts/lemonbar/wmtitle | cut -c 1-30)"
                echo "K:$(_Workspaces &)"
        done
}
```

![Workspaces](https://github.com/VentGrey/ventgrey.github.io/blob/master/assets/img/workspaces.png?raw=true)
![ActiveWindow](https://github.com/VentGrey/ventgrey.github.io/blob/master/assets/img/activewin.png?raw=true)

Tengo que recalcar que, `leftwm-state` es un comando propio de leftwm que imprime una línea cada que el gestor de ventanas cambia de estado, esto puede variar de window manager a window manager.

## FIFO, cut y manipulación de salida en la shell

![meme](https://plantillasdememes.com/img/plantillas/ahora-si-viene-lo-chido21574322946.jpg)

Una vez definidos nuestros módulos necesitamos crear un FIFO (siglas para *First In, First Out*), esto lo haremos con una variable y
el comando `mkfifo`. En sistemas tipo UNIX, `mkfifo` sirve para producir un archivo especial *FIFO* con un nombre o con una ruta. Este archivo especial puede ser leído o escrito por cualquier proceso del mismo modo que un archivo normal.

Primero definimos una variable para la ruta donde deberá ser creado nuestro *fifo*:

```shell
lemon_fifo="/tmp/lemonfifo"
```

Es útil crearlo en `/tmp` por dos razones:

1. Es una "regla de oro" colorcar los archivos cambiantes / temporales bajo `/tmp`.
2. En caso de que alguno de los usuarios tenga un `tmpfs` montado en RAM. 

Como siguiente paso revisaremos si un archivo *fifo* del mismo nombre ya existe y, de ser el caso eliminarlo. Hecho esto tenemos que crear un nuevo *fifo* usando el comando `mkfifo`:

```shell
[ -e "$lemon_fifo" ] && rm "$lemon_fifo"
mkfifo "$lemon_fifo"
```

Con nuestro *fifo* creado, ahora es necesario escribir en el archivo, para evitar usar comandos externos, podemos utilizar los operadores de redirección de salida de nuestra shell junto con el operador `&` al final de la línea, esto hará que, la escritura en el archivo sea de forma *"asíncrona"*, haciendo que, el proceso que termine primero, sea el primero en escribir y no haya bloqueos en la escritura de la barra. Para hacer todo esto solo es necesario llamar las funciones que definimos antes, seguidas del operador `>`, el lugar donde deberá ir la salida de los comandos. En este caso `$lemon_fifo` y finalmente el operador `&`:

```shell
_VolModule > "$lemon_fifo" &
_BatModule > "$lemon_fifo" &
_SysInfoModule > "$lemon_fifo" &
_Modules > "$lemon_fifo" &
_Wininfo > "$lemon_fifo" &
```

Esto se encargará de escribir continuamente en nuestro archivo *fifo*, podemos comprobar que las cosas están funcionando con el siguiente comando:

```
$ cat $lemon_fifo

C:  4%
V:100%
V:100%
V:100%
B: 86%
V:100%
```

Espera un momento...Hay algo raro en esa salida. ¿No notas algo raro?

Exacto, todas las salidas tienen un "prefijo" que consta de una letra, seguida de dos puntos `:`, si eres observador/a te diste cuenta desde el momento en el que definimos las funciones de los módulos. Bueno, estos prefijos los utilizaremos en nuestra función `_Main()`. Esta función se encargará de leer el archivo *fifo* y se encargará de hacer dos cosas:

1. "Recortar" la información de cada línea del *fifo*.
2. Imprimir la información recordada a lemonbar

Veamos primero la función y la explicaremos línea por línea:

```shell
_Main() {
        while read -r report; do
                case $report in
                        B*) batt="$(echo "${report##*:}")";;
                        C*) cpu="$(echo "${report##*:}")";;
                        K*) wm="$(echo "${report##*:}")";;
                        R*) ram="$(echo "${report##*:}")";;
                        S*) ssid="$(echo "${report##*:}")";;
                        T*) time="$(echo "$report" | cut -d':' -f2-)";;
                        V*) vol="$(echo "${report##*:}")";;
                        W*) wname="$(echo "${report##*:}")";;
                esac
                sleep 0.1s
                printf "%s" "%{F#FAFAFA}%{R} $wm %{R} $wname... %{r}%{B#282c34}%{F#E06c75}%{R}%{F#282c34} 龍 cpu: $cpu %{F#E5C07B}%{B#E06c75}%{R}%{F#282c34}  ram: $ram %{B#E5C07B}%{F#61AFEF}%{R}%{F#282c34}  $time %{B#61AFEF}%{F#98C379}%{R}%{F#282c34}  $batt %{B#98C379}%{F#DA8548}%{R}%{F#282c34} 墳 $vol %{B#DA8548}%{F#c678dd}%{R}%{F#282c34}  $ssid %{B#282c34}"
        done
}
```

La parte `while read -r` ya la hemos visto antes, lo interesante es la parte de abajo, en shell la palabra `case` es similar a un `switch` en otros lenguajes (con sus respectivas diferencias técnicas), en este caso estamos buscando coincidencias con las letras en mayúsculas que definimos en los prefijos de las funciones de los módulos. Para ejemplificar mejor este ejemplo veamos el primer caso:

```shell
B*) batt="$(echo "${report##*:}")";;
```

Esto quiere decir que, si la línea actual que está leyendo la función `_Main` comienza con la letra `B` y sigue "lo que sea" (`*`), en este caso los dos puntos, recortaremos esos dos elementos (La `B:`) y asignaremos lo que quede a la variable `$batt`. Todos los módulos funcionan de la misma manera salvo por el módulo de la fecha y hora: `T*) time="$(echo "$report" | cut -d':' -f2-)";;`, la razón de esto es que el módulo de la fecha imprime por si solo dos puntos (en el formato `Hora:minuto`), si usamos la manipulación de variables de la shell todo sería recortado y nuestro calendario solo mostraría `minuto)`. Cosa que no queremos.

Debajo del `case` simplemente esperamos `0.1` segundos para actualizar la información de la barra, he intentado eliminarlo para que la actualización sea "inmediata", el consumo de CPU no sube mucho, PERO, ocurre lo que dije anteriormente, las cosas son tan rápidas que lemonbar no tiene oportunidad de redibujarse y ocurren bugs visuales.

La orden `printf` es probablemente la más caótica y problemática de todas, por esa razón me reservaré algunos detalles, unicamente resaltaré que en ella imprimimos las variables que cambian dentro de `_Main`, podríamos incluirlas *"Así nomas"*, todos los símbolos extraños y operadores `%{}` son propios de lemonbar y puedes encontrar más informacion de ellos [aquí](https://github.com/LemonBoy/bar#formatting).

Como cierre del telón haremos uso de los operadores de redirección de la shell de nuevo, esta vez utilizaremos la redirección de entrada `<`. Más arriba dije que la función iba a leer líneas, las líneas que debe leer son las líneas del archivo *fifo*, por lo que tenemos que redirigir la entrada del fifo a la función `_Main`:

```shell
_Main < "$lemon_fifo"
```

## Disfruta de tu lemonbar más rápida que el rayo ❤

Con esto, lograste crear la primera versión de tu configuración de lemonbar lista y funcional. Ahora es cuestión de empezar a investigar un poco más para ir modificándola poco a poco y dejarla cien por ciento a tu gusto.

El código mostrado en este blog es parte de [Epitaph](https://github.com/VentGrey/Epitaph), un tema para LeftWM hecho por mí. Si utilizas este window manager te invito a darle una estrellita en GitHub ⭐

Si deseas encontrar los programas que utilicé para los módulos, puedes encontrarlos todos [aquí](https://github.com/VentGrey/Epitaph/tree/master/scripts/lemonbar). Solo ten en cuenta que, ninguno de ellos es un script de shell, todos fueron escritos en lenguajes compilados y necesitarás un compilador de `C` y de `Rust`. Puedes encontrar las órdenes de compilación de cada uno en el [archivo de instalación de Epitaph](https://github.com/VentGrey/Epitaph/blob/master/install).

Eso es todo por el momento, si te gustó este blog compártelo con tus amigos y activa el RSS si deseas recibir actualizaciones cada que escriba una nueva entrada :) 

---

¿Te gustan estos blogs? Ayúdame a seguir escribiéndolos de las siguientes formas:
- [Invítame un café 🍵](https://ko-fi.com/ventgrey)
- [Regálame un follow en GitHub ❤](https://github.com/VentGrey)

