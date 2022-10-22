---
layout: post
---

# Los dolores de cabeza de un sysadmin

Cuando estamos configurando un servidor web, sea Apache, NGINX u OpenLiteSpeed, nos toparemos más de una vez con situaciones donde necesitaremos restringir el acceso a ciertos recursos o direcciones específicas. Usualmente las aplicaciones web o los frameworks ya poseen formas de autenticación avanzadas. Sin embargo, como sysadmin es tu deber proteger los recursos tuyos, de tu startup o de la empresa para la que trabajas, más que nada protegerlos de aquel junior que implementó un sistema de autenticación copiado de youtube o que confía ciegamente en lo que digan los influences de twitter y tiktok.

Sin embargo, eres un sysadmin, tienes el servidor web a tu favor y pueds utilizarlo como método de autenticación, no es la forma más ortodoxa y ciertamente no deberías confiar solamente en ella. Sin embargo, *nunca hay suficiente seguridad*.

En el caso de NGINX, podemos restringir el acceso a algunas rutas de nuestro sitio utilizando una autenticación clásica de usuario y contraseña. Los usuarios y contraseñas se toman de un archivo creado con una herramienta creadora de archivos de contraseña como `apache2-utils` o un archivo de contraseñas creado manualmente.

## Prerequisitos

Necesitaremos:

- NGINX instalado en nuestro servidor
- Un usuario con privilegios `sudo` (o un usuario root) para tareas administrativas.

## Crear un archivo de contraseña

Los archivos de contraseña por defecto tienen el nombre de `.htpasswd`. La herramienta `htpasswd` se usa para crear y actualizar los archivos de texto plano usados para la autenticación básica de usuarios HTTP. Si `htpasswd` no puede acceder a un archivo, sea por problemas de permisos, no poder leer o escribir, regresará un error sin modificar nada.

`htpasswd` también puedes cifrar los archivos usando bcrypt o la rutina del sistema `crypt()`.

Para crear un archivo `.htpasswd` con usuario y contraseña necesitamos ejecutar la herramienta `htpasswd` con la bandera `-c` para crear el archivo, con el primer argumento siendo la ruta del archivo y el nombre de usuario como segundo argumento:

```nginx
sudo htpasswd -c /etc/apache2/.htpasswd GLaDOS
```

Una vez presionemos enter, htpasswd nos pedirá ingresar una contraseña. Podemos ingresar una que nos guste o podemos generar una contraseña con perl.


### Generar una contraseña con perl

Si no confías en tus habilidades para generar una contraseña fuerte, te dejamos un pequeño script escrito en perl que podrás ejecutar en casi cualquier sistema tipo UNIX para generar un string aleatorio. Esta versión del programa imprime un string aleatorio de 20 carácteres, cambia el 20 en caso de que quieras una longitud diferente:

```sh
perl -le 'print map { (a..z,A..Z,0..9)[rand 62] } 0..pop' 20
```

Una vez creado el usuario y contraseña podemos confirmar la creación de nuestro archivo, revisando los nombres y contraseñas cifradas con el comando `cat`:

```sh
cat /etc/apache2/.htpasswd
GLaDOS:$apr1$Mr5A0e.U$0j39Hp5FfxRkneklXaMrr/
```

### Configurar NGINX para utilizar el archivo de contraseña

Dentro de nuestro archivo de configuración de NGINX para el sitio web que deseamos proteger (e.g: `/etc/nginx/sites-available/example.com`), necesitamos especificar la directiva `auth_basic` y asignarle un nombre. El nombre que le asignemos a esta área aparecerá cuando NGINX nos pida las credenciales necesarias:

```nginx
location /supersecret {
    auth_basic “Administracion del sitio”;
    #...
}
```

Una vez completado este paso necesitamos asignar la directiva auth\_basic\_user\_file con la ruta al archivo de contraseñas que generamos anteriormente:

```nginx
location /supersecret {
    auth_basic “Administracion del sitio”;
    auth_basic_user_file /etc/apache2/.htpasswd;
}
```

Una vez hecho esto, al ingresar a la ruta de ejemplo example.com/supersecret NGINX nos pedirá ingresar nuestras credenciales al ingresar con un navegador:

![Imágen mostrando la ventana de inicio de sesión de NGINX](https://raw.githubusercontent.com/VentGrey/ventgrey.github.io/e0e7b85789531fa9c738b1dec59c99391cceec4a/assets/img/auth.png)

## (Opcional) Autenticación por contraseña + Lista blanca de direcciones IP


Además de estos pasos, podemos añadir una capa extra de creando una lista blanca/negra de direcciones IP que pueden ingresar a nuestro sitio. Veamos el siguiente ejemplo:

```
<pre class="wp-block-preformatted">location /supersecret {
    auth_basic “Administracion del sitio”;
    auth_basic_user_file /etc/apache2/.htpasswd;

    # Direcciones IP denegadas (baneadas)
    deny 192.168.1.212;
    deny 192.168.100.1;

    # Direcciones IP aceptadas
    allow 127.0.0.1;
    allow 192.168.1.100;

   # Denegar todas las direcciones que no estén an las direcciones aceptadas
    deny all;

   # Por el contrario, aceptar todas las direcciones y solo denegar las direcciones "baneadas"
    allow all;
}
```

La directiva `allow` nos permitirá darle acceso a las direcciones IP seleccionadas, estas direcciones pueden ser internas o externas, por el contrario, la directiva `deny` denegará el acceso a las direcciones IP seleccionadas.

NOTA: El orden es importante, pues las directivas de `allow` y `deny` serán aplicadas en el orden que sean definidas, por lo tanto, si aplicamos deny a una dirección IP y más tarde aplicamos allow, dicha dirección podrá ingresar a nuestro servidor.

# Conclusión

Podemos usar esto a nuestro favor para proteger rutas de administración, rutas secretas de API o simplemente directorios que no queremos que estén disponibles al público en general. Llevémoslo un paso más allá para rutas exclusivas para otros administradores y mucho más.

Si te gustó mi contenido por favor compártelo con tus amigos, de ser posible suscríbete usando el botón de RSS en el fondo de la página o si te sientes con ánimos puedes invitarme un café picando el botón "Tip Me" en la esquina inferior izquierda de tu pantalla :)

¡Nos leemos pronto!
