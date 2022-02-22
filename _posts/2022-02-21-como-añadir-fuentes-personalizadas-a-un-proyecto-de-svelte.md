---
layout: post
---

# De nuevo con el lenguaje más feo que un coche por debajo.

> **ADVERTENCIA**: Esta entrada de blog es algo más a título personal y muy satírico y no contiene el mismo nivel de "profesionalidad"(según) que otras entradas. Nomas aviso para que nadie caliente los chiles en comal luego.


Esta entrada de blog la escribo a modo de futura referencia / rant por un problema que tuve hace poco con un proyecto hecho en Svelte. Puedo decir que como framework es una alternativa muy ideal si eres un tanto "conservador" como yo cuando refiere al software. En mi caso Svelte me agrada porque más que un framework solo es un compilador donde todo acaba siendo puro VanillaJS y un poco más. Adiós a configurar un framework bajando su herramienta CLI, configurando webpack / snowpack, parcel o dios sabe que blasfemias se usen hoy en día para construir una página web.


> **NOTA:** Si bien este blog es a modo de rant por una situación que para mi debería haber sido algo sencillo de resolver, lo cierto es que yo también puedo ser idiota y haber cometido un error en alguna parte. En mi caso el proyecto era Svelte con Bootstrap. Bootstrap incluye fuentes "fallback" en caso de que tu no le asignes una a tu proyecto para evitar que las cosas se vean feas "así nomas."

## Omar contra Svelte y las font-zas del mal.

Luego de pelear media hora con esa excusa de sistema de CI/CD llamado GitHub Actions y sus despliegues que funcionan diferente en cada repositorio (No es broma, el archivo `.yaml` era una copia en ambos repositorios). Tuve otro problema, tenía que integrar fuentes a Svelte para un proyecto que estaba realizando. En este caso necesitaba importar dos fuentes, una llamada *Pacifco* (Una fuente cursiva) y otra llamada *Raleway* (Una fuente con muchas variantes). ¿El problema? Como usarlas en Svelte.

### Paso uno, consultar stack overflow para saber que **NO** hacer.

La primera solución que encontré fue en stack overflow y era muy sencilla:

> "Solo debes colocar la etiqueta de estilo en la parte <head> en tu archivo App.svelte para que sea global":

```html
<svelte:head>
    <style>
        @import url("https://fonts.googleapis.com/css?family=Raleway&display=swap");
    </style>
</svelte:head>
```

Por supuesto esto no funcionó y las devtools de chrome y firefox tachaban la propiedad completa, lo que en idioma navegador web significa: "Nos vale tremenda pistola tu import". (También estoy consciente de que no solo con hacer ese import mágicamente iba a funcionar la fuente, solo me parece muy tonto incluir la segunda parte que involucra asignar el font-family / font-face a los elementos.)

Luego de leer toneladas de respuestas similares y unas que involucraban definir unas 10 líneas de CSS para algo que es terriblemente sencillo en HTML, CSS y JS plano dejé StackOverflow y decidí pasar a la segunda opción:

> "Deberías usar Fontsource, ese te deja importar solo lo que necesitas y son fuentes locales sin CDN":

Al principio todo iba bien, todo era hermoso, solo ejecuté:

```bash
npm install @fontsource/pacifico && npm install @fontsource/raleway
npm run dev
```

añadi una línea a mi archivo `app.js` de svelte:

```javascript
import "@fontsource/pacifico";
```

y todo estaba listo para empezar. Pero...uh oh, ¿ahora qué?

```
404 ─ 0.23ms ─ /build/files/pacifico-latin-400-normal.woff2
404 ─ 0.19ms ─ /build/files/pacifico-all-400-normal.woff
```

![meme reese malcom el de en medio](http://images2.memedroid.com/images/UPLOADED83/533dbb4331fcc.jpeg)

¿En serio un 404? ¿Por qué un 404? Oh no...¿Qué demonios estás haciendo? >:c

Okay, al parecer yo soy idiota y no me fijé en la parte donde dice que todas las fuentes que no se especifique su archivo, se van por defecto a un "peso" de 400 y su variante normal. Para corroborar todo, decidí entrar a la carpeta `node_modules/` y revisar el contenido del módulo de fontsource para la fuente *Pacifico*. Adentro del directorio había un archivo llamado `400.css`, bingo, además las instrucciones de la documentación oficial decían que podíamos importar los estilos y pesos individuales directo del directorio:

```javascript
import "@fontsource/open-sans/500.css"; // Weight 500.
import "@fontsource/open-sans/900-italic.css"; // Italic variant.
```

Perfecto, pues ahora yo haré lo mismo:

```javascript
import "@fontsource/pacifico/400.css";
```
Editar mi componente para que el CSS del mismo se vea así:

```css
font-family: 'Pacifico', cursive;
font-weight: 400;
```

Ahora solo necesitamos compilar el proyecto y...

```
404 ─ 0.20ms ─ /build/files/pacifico-latin-400-normal.woff2
404 ─ 0.13ms ─ /build/files/pacifico-all-400-normal.woff
```

¿Eh? ¿Qué estás tratando de buscar mijo? Al principio supuse que el archivo CSS estaba buscando dos archivos `.woff` que no encontraba (era lo obvio ¿por qué otra razón saltaría un 404?). Así que decidí borrar las referencias a esos archivos del archivo css (igual no existían en el directorio así que, no se que hacían ahí para empezar). Listo, solo faltaba volver a compilar el proyecto y ahora sí:
```
404 ─ 0.23ms ─ /build/files/pacifico-latin-400-normal.woff2
404 ─ 0.19ms ─ /build/files/pacifico-all-400-normal.woff
```

**¡La concha de todos los patos!**. Con esto estaba harto y decidí pasar a la tercera opción:

> ¿Por qué no usas SvelteKit? Es la manera más sencilla de hacer...

No, absoluta, total y rotundamente **NO**.

Casi vencido por mi travesía para hacer algo que solo requería de unas pocas líneas de CSS y un arbolito de directorios y...en efecto eso era lo que necesitaba. Así que aqui vienen los pasos que tuve que seguir para lograr importar cualquier fuente en cualquier proyecto de Svelte (funciona incluso si traes bootstrap y sus 40000 overrides):

## Paso 1: Descarga tus fuentes

En mi caso yo necesitaba descargar dos fuentes:

- [Pacifico](https://fonts.google.com/specimen/Pacifico?query=paci)
- [Raleway](https://fonts.google.com/specimen/Raleway?query=rale#standard-styles)

Dentro de la página de cada font podrás ver un botón que dice *Download Family*, solo debes presionarlo para descargar un archivo `.zip`, si lo descomprimimos, podremos ver que dentro están uno o dos archivos `.ttf` de nuestras fuentes.

## Paso 2: Colocar los .ttf en el directorio correcto

Bien, al igual que el `favicon`, los estilos base y el `index.html`, debemos dirigirnos al directorio `public/` de nuestro proyecto y ahí dentro crear un nuevo directorio para las fuentes, en mi caso lo llamé `fonts/` y ahí dentro colocaremos los dos archivos `.ttf` anteriormente mencionados.

### Paso 3: Importar las fuentes en un componente (O en todos).

Esto dependerá del uso que le quieras dar a tus fuentes, si deseas que un solo estilo de la misma se aplique a todo puedes colocar una regla `*` de CSS para que la fuente se aplique a todos los componentes dentro de la misma.

En mi caso solo necesitaba usar la fuente *Pacifico* dentro de un componente llamado jumbotron, en este caso debo hacer mención de dos cosas importantes:

1. El nombre del atributo `font-family` debe ser el mismo que el del archivo.
2. La url de referencia tiene que tener un `/` al inicio.

Al final mi componente de Svelte quedó así:

```html
<style>
    @font-face {
        font-family: 'Pacifico-Regular';
        src: url('/fonts/Pacifico-Regular.ttf');
    }
    .jumbotron {
        background: url("/images/background-pattern.png");
        height: 40em;
        font-family: 'Pacifico-Regular';
        font-weight: 400;
    }
</style>
```

Y con eso logré solucionar el santo problema de las fuentes.

Considero que no es menester incluir una conclusión en esta entrada pues está escrita con las patas, en tono informal, sin revisión de ortografía ni redacción y a altas horas de la noche. 

Si te sirvió aun así, invítame un café con el botón azul de abajo :3 cosas así me ayudan a seguir creando software libre para todos y entradas de blog documentando como hacer algunas cosas, comparte el blog con tus amigos, y, si te es posible suscríbete usando el botón de RSS en el fondo de la página.

Aprovecho esta entrada también para agradecer a ese héroe anónimo que lleva casi un año donando BAT en mi sitio de Brave Creators. Sigue sin aparecer o sin decir quien es y ya lo he buscado en todos lados, pero supongo que prefiere ser eso...anónimo. Amigo o amiga (no se que eres xD) seas quien seas gracias :D no se quien eres pero lo menos que puedo hacer es reconocer tus acciones.

¡Nos leemos en la próxima entrada!
