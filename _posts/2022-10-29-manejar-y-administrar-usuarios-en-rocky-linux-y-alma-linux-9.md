# Cacaposteo de buenas a primeras

El trabajo del sysadmin es sencillo en más de un sentido. Arriesgamos muy poco, y sin embargo usufructuamos de una posición situada por encima de quienes someten su trabajo y su código a nuestro juicio. Prosperamos gracias a nuestras críticas negativas, que resultan divertidas cuando se las escribe y cuando se las lee. Pero la cruda verdad que los sysadmin debemos enfrentar es que, en términos generales, la producción de basura promedio es más valiosa que lo que nuestros artículos pretenden señalar. Sin embargo, a veces el sysadmin realmente arriesga algo, y eso sucede en nombre y en defensa de algo nuevo. Anoche experimenté algo nuevo, un sistema de manejo de usuarios extraordinario hecho por alguien único e inesperado. Decir que ese sistema y sus binarios pusieron a prueba mis preconceptos equivaldría a incurrir en una subestimación grosera, cuando lo cierto es que ambos lograron conmover lo más profundo de mi ser. Antes de este suceso, nunca escondí mi desdén por el lema del Richard Stallman y la iglesia de Emacs: “No hay otro sistema operativo que GNU y Linux es solo uno de sus núcleos”. Pero, me doy cuenta, recién ahora comprendo sus palabras. No cualquiera puede convertirse en un gran sysadmin, pero un gran sysadmin sí puede provenir de cualquier lugar.

> Sátira a la conclusión de Anton Ego.

Las tareas de administrador de sistemas son altamente importantes, entre estas tareas se encuentra la administración de usuarios. Al inicio puede parecer mucha información, pero como todo en Linux, es cuestión de *"agarrar callo"* y trabajar de forma progresiva para concluir nuestras tareas de la forma más satisfactoria posible. En este blog aprenderás como manejar usuarios en Red Hat Linux 9 o sus distribuciones clónicas como Alma Linux 9, Rocky Linux 9, Oracle Linux 9 y Eurolinux 9.

## Crear usuarios con el comando useradd

Para el manejo de usuarios la mayoría de distribuciones Linux vienen con utilidades variadas que nos permiten manejar nuestro sistema de una forma elegante, una de estas es la herramienta `useradd`.

Como nota extra un nombre de usuario “estándar” de gnu / linux es una cadena de 32 caracteres (ejecutar `man useradd (8)` para más detalles en el manual de la consola).

Cada que se ejecuta el usuario se creará un directorio “home” para el mismo con el siguiente formato:

`/home/<usuario>`

Este formato heredado del estándar de un sistema operativo diferente de Linux llamado BSD y agrega algunas restricciones adicionales. El usuario debe contener las siguientes condiciones:

- No utilizar letras mayúsculas.
- No utilizar puntos. (`.`)
- No teminar en guión (`-`)
- No debe incluir dos puntos. (`:`)

No te alarmes si no obtienes una notificación de salida, esto significa que la ejecución del comando fue exitosa, de lo contrario un error aparecerá en la consola.

Para crear un nuevo usuario con permisos estándar necesitamos ejecutar el siguiente comando:

`useradd <nombre>`

En el lugar de “`<nombre>`” deberá ser reemplazado por el nombre de usuario que deseamos añadir, por ejemplo si quisiéramos añadir el usuario “`perro`” debemos ejecutar la siguiente línea como “`super usuario`” o como administrador:

`useradd perro`

La salida del comando será:

```
$ sudo useradd perro
$
```

Como dijimos arriba, no te alarmes si no hay un mensaje de salida, esto significa que el usuario se creó con éxito.

Para conocer mas a fondo el funcionamiento del comando `useradd` podemos ejecutar la orden `man useradd` para conocer todas sus opciones.

## Experimentando con las opciones del comando useradd


Una vez comprendamos la utilidad de useradd podemos comenzar a utilizar las opciones que nos ofrece para manejar los usuarios de forma elegante.

Por ejemplo, si deseamos crear un usuario y cambiar el directorio “home” del usuario para elegir el directorio de nuestro agrado que no sea `/home/usuario`.

Intentemos crear un usuario cuyo directorio “home” se encuentre en la carpeta del sistema /usr/ podemos ejecutar el siguiente comando:

`sudo useradd gato -d /usr/casa-gato`

Donde “casa-gato” será el directorio donde el usuario “gato” almacenará sus archivos

useradd también nos permite cambiar algo llamado “UID”. El UID es un acrónimo para “User IDentifier” en inglés. En Linux un UID se asigna a cada usuario existente y sirve como la representación del usuario para el núcleo del sistema.

Para este creamos un usuario llamado “johndoe” y le asignamos una carpeta home en `/home/helder`. Para comprender los UID podemos ejecutar el comando cat `/etc/passwd` y podemos notar en la última línea la información de nuestro usuario `johndoe`.


> NOTA: Para Linux los UID del 1 al 500 están reservados para los usuarios necesarios del sistema. En distribuciones Linux populares como Ubuntu, Fedora o CentOS/Red Hat los nuevos usuarios comienzan desde el UID: 1000

Intentemos crear un nuevo usuario con el UID 1500, para ello será necesario el siguiente comando

`useradd --uid 1500 pollito`

y para revisar que el UID fue asignado correctamente solamente debemos ejecutar el comando:

`id <usuario>`

Donde &lt;usuario&gt; es el nombre de usuario cuyo UID deseamos consultar.

## Combinando opciones del comando useradd


useradd no se limita a una sola opción por comando, siempre y cuando las opciones no conflictuen entre si podemos añadir todas las que necesitemos en un solo comando, por ejemplo, si deseamos crear un usuario cuyo directorio home se encuentre dentro /usr/ y posea un UID diferente de 1000 podemos crear el siguiente comando:

`useradd --uid 1200 -d /usr/comarca hobbit`

Ahora intenta experimentar. ¿Como crearías otro usuario? ¿Que comando utilizarías para que su directorio home esté en el directorio del sistema /etc/? Intenta experimentar con las opciones antes de pasar a la siguiente sección.

## Comprendiendo el funcionamiento de “sudo” y la función de los superusuarios


En todos los sistamas Gnu/Linux existe un usuario con superpoderes más allá de nuestra comprensión.

La verdad no, sin embargo si existe el usuario “root” el cual podemos denominar como “superusuario” y el mismo tiene la habilidad de hacer y administrar todo en el sistema. Por ello, para tener una capa extra de seguridad la creación de un superusuario extra es necesaria para reemplazar las funciones administrativas de root. Para ello existe la herramienta de nombre `sudo`, la cual permite que un usuario tenga permisos de administración del sistema sin tener que iniciar sesión como root directamente.

El comando sudo lo utilizamos en las capturas de pantalla al inicio de esta entrada, pero si quedan dudas de su uso, la sintáxis básica de sudo es:

`sudo <comando>`

CentOS ya incluye sudo en su instalación, pero en caso de dudas puede ser instalado ejecutando como root:

`dnf install sudo`

Para poder proveer a un usuario con los poderes de sudo necesitarán añadirse a un grupo autorizado por le herramienta o su nombre de usuario necesitará ser añadido al archivo `sudoers` con ciertos permisos. Por favor ten en cuenta que este archivo contiene información sensible y no debería de ser editado directamente con un editor de texto, si el archivo “sudoers” se edita de forma incorrecta el resultado podría ser catastrófico, pues los administradores pueden quedar sin acceso a las funciones de superusuario.

Editar el archivo sudoers es editado llamando al comando `visudo`, este comando solo puede ser ejecutado por administradores del sistema.

**Precaución**
Los usuarios ***nunca*** deben agregarse al archivo o grupo sudoers con permisos completos si no son de confianza.

He aquí un ejemplo del uso de visudo para añadir un usuario al archivo sudoers, para ello necesitamos ejecutar `visudo` como root o con la órden `sudo visudo` si tenemos sudo configurado.

El editor por defecto de Rocky Linux para editar el archivo sudoers es el editor Vi/Vim, no cubriremos como usar el editor en esta entrada, pero puedes consultar como utilizarlo en este [enlace](https://openwebinars.net/blog/vim-manual-de-uso-basico/).

Intentemos añadir al usuario gato creado anteriormente, para ello debemos añadir debajo del usuario root la línea:

`gato ALL=(ALL:ALL) ALL`

En caso de haber cometido un error el comando visudo al salir del editor nos informará que tenemos un error y donde está el mismo.

## Conclusión

Como conclusión los usuarios son útiles para realizar diferentes tareas dependiendo de nuestras necesidades, por ejemplo colaborar o compartir archivos. Al utilizar Linux como sistema operativo de escritorio se crean usuarios constantemente para tareas comunes como editores web, reproductores de música, juegos, etc.

Si te gustó mi contenido por favor compártelo con tus amigos, de ser posible suscríbete usando el botón de RSS en el fondo de la página o si te sientes con ánimos puedes invitarme un café picando el botón “Tip Me” en la esquina inferior izquierda de tu pantalla :)
