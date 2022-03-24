---
layout: post
---

# "Es chocolate abuelita con sabor a la antigüita"

Ya se lo que vas a decir: *¿Otro post a modo de rant?, ¿Para eso es la esquina gris?*. Bueno...si? Creo.

Es gracioso escribir poco en este blog, más porque lo uso como un recuerdo personal para evitar volver a toparme con problemas cuya solución no ha sido documentada. Corrijo, cuya solución *aceptable por mi* no ha sido documentada. Y pues, aqui estamos de nuevo.

Esta vez las cosas son más graciosas, no es noticia nueva para mis conocidos que he estado colaborando con una pequeña startup Mexicana haciendo el sitio nuevo en SvelteJS. Hace un par de días llegó el momento de desplegarlo y desde ese punto comenzaron los problemas. No tengo nada en contra de Svelte esta vez, solo de su documentación, aunque, en su defensa puedo argumentar que dicha documentación va enfocada solo a desarrollo, pues su setup es bastante sencillo y el despliegue puede variar de caso a caso.

## La maldición de los soydevs / sysadmins de juguete

![duendeverdememe](https://raw.githubusercontent.com/VentGrey/ventgrey.github.io/master/assets/img/duendeverde.jpg)

Me topé con muchas soluciones, cada una peor que la anterior. No me malentiendas, se perfectamente que no todos están diseñados / poseen el conocimiento para manejar sus propios servidores 😅. Pero como decimos en México: *"Dos pesitos de madre"*. ¿Realmente es tan difícil montar un servidor Linux con NGINX? Tal parece que lo es, Google está plagado de tutoriales raros, svelte, heroku, mejor usar SvelteKit porque nadie sabe como se hace "normal", etc. Creo que por ahí encontré un post donde debías usar [PM2](https://github.com/Unitech/pm2) para usar el comando `npm run dev` como proceso principal, pasarlo por un reverse-proxy de NGINX y así usarlo en producción. ¿Es neta? ¿Tan mal estamos?

Lo se, es irónico escribir un post quejándome de la ignorancia de otros cuando yo mismo no conocía como solucionar ese problema, si bien tomó algo de esfuerzo lograr un despliegue tranquilo, el proceso de búsqueda tomó poco tiempo antes de darme cuenta que esto era de esos problemas donde toda solución posteada en internet es basura directamente.

Esta vez intentaré explicar como llegué a desplegar las cosas, lo cierto es que no requieres ser un genio, yo mismo me sentí bastante tonto cuando vi que la solución era relativamente sencilla. Sin embargo, siento que mostrar el proceso de pensamiento puede ayudar a alguno de mis lectores a resolver problemas de la naturaleza: *todas las soluciones apestan*.


> Obvio se que no faltarán los que me digan *Pero Omar, para eso tenemos miles de plataformas serverless*, *Lo pudiste montar en GitHub pages*, etc. Si bien es cierto que este tipo de plataformas nos ahorran tiempos de despliegue, dinero y ofrecen una escalabilidad increíble tiene sus *peros* como todo, cosas que involucran, seguridad, maniobras de performance en el mismo servidor, que no están diseñados para procesos que se ejecuten por mucho tiempo, etc. No tocaré el tema a profundidad porque pienso que otra entrada de blog defendiendo las prácticas *tradicionales* de un sysadmin vale la pena.

## 1. Comprende la naturaleza de la herramienta
Ok, suficiente ranting. Comencemos a resolver problemas.

Primero debemos comprender la naturaleza de nuestras herramientas. Yo deseo desplegar una página hecha en Svelte, quiero desplegarla en un servidor NGINX.

Según el sitio oficial de [Svelte](https://svelte.dev/) (traducción):

> Svelte es un enfoque radicalmente nuevo para crear interfaces de usuario. Mientras que los marcos tradicionales como React y Vue hacen la mayor parte de su trabajo en el navegador, Svelte cambia ese trabajo a un paso de compilación que ocurre cuando construyes tu aplicación.

¿Qué significa esto? Simple, como bien dice, Svelte tiene un paso de compilación, esto quiere decir que, tus componentes, sus atributos, estilos y clases terminan en un solo lugar. En el caso de Svelte todo termina en un archivo llamado `bundle.js` donde se encuentra TODO el código minificado, optimizado y convertido a VanillaJS.

Indagando un poco más podemos ver que, también existe un [repositorio plantilla](https://github.com/sveltejs/template) que podemos descargar para comenzar a usar svelte en un proyecto. Aquí podemos ver que hay una orden llamada `npm run build` que creará una versión optimizada de nuestro JS para producción. Esto lo podemos combinar con `npm run start` si deseamos usar nuestra aplicación de svelte a través de un reverse proxy, sin embargo...no se me ocurre un escenario donde se quiera hacer eso (Salvo el que viene en el repositorio plantilla, si es que planeas usar Heroku).

Perfecto, sabemos que podemos construir nuestro proyecto en algo usable y optimizado para usarse en producción. Pero ¿donde está esto? Si investigamos dentro del archivo `rollup.config.js` nos daremos cuenta de que todo lo compilado se va directamente al directorio `public/` de la plantilla. ¡Eureka! Ahora sabemos de donde sacar todo para desplegar de forma tradicional. Citando a el sensei *Last Dragon*: *"Nada de que calamares y no se que..."*.

Pues a compilar se ha dicho, ejecutemos `npm run build` y saquemos lo importante del directorio `public/`. Como subas esto a tu servidor depende de ti, puedes clonar tu repositorio y usar [git hooks](https://git-scm.com/docs/githooks#:~:text=is%20in%20use.-,post%2Dreceive,once%20for%20the%20receive%20operation.) para ejecutar ciertos comandos luego de realizar un `git pull` o puedes subirlos por medio de SFTP. La desición es tuya.

## 2. Configurar NGINX
