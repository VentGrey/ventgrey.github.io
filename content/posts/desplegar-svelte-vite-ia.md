---
title: "Una IA escribió este blog. (ChatGPT)"
date: 2023-03-25
tags: ["Desarrollo Web", "DevOps", "Distribución de software", "IA", "Frontend", "Otros", "Programación", "ChatGPT", "OpenAI"]
categories: ["Otros", "Tutoriales", "Svelte", "IA"]
author: "VentGrey"
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "Dado el boom de la IA, decidí hacer un pequeño experimento. ¿Y si dejo que una IA escriba este blog?"
canonicalURL: "https://ventgrey.github.io/posts/desplegar-svelte-vite-ia/"
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
    image: "/img/posts/sveltegpt/cover.png" # image path/url
    alt: "Imágen del post" # alt text
    caption: "Imágen del post" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/<path_to_repo>/content"
    Text: "Sugerir Cambios" # edit text
    appendFilePath: true # to append file path to Edit link
---

# Veamos como escribe ChatGPT el siguiente tutorial.

Hace pocas semanas, decidí retomar el desarrollo de [Epitaph](https://github.com/VentGrey/Epitaph). Una de las cosas que deseaba hacer era una página web para el proyecto. Sin embargo, no quería comprar un dominio o hostear algo tan sencillo en mi servidor. Por lo que, opté por intentar desplegarlo en GitHub Pages. No es un proceso "no documentado" o "documentado con las patas" como suelo tratar en este blog. El proceso lo puedes encontrar en la [documentación oficial de Vite](https://vitejs.dev/guide/static-deploy.html#github-pages). Voy a tratar de recrear mis pasos y como logré que el [sitio web](https://ventgrey.github.io/EpitaphWM/) de Epitaph estuviera en línea.

PERO, voy a cambiar un poco la jugada. En lugar de darles otra entrada de blog llena de groserías, infinito desprecio por cosas que no me gustan y en todo una lloradera textual e insufrible. Esta vez será una IA la que hará el trabajo por mi. Le pediré a ChatGPT que escriba este tutorial y trataré de añadir comentarios mios por si se equivoca o si omite algo importante. Finalmente, le dejaré elegir la canción triste del día que siempre acompaña a mis posts.

Como nota final. Dejaré las capturas de pantalla de lo que le pedí a ChatGPT que escribiera. Trataré de no modificar nada salvo que ande de esquizoide la susodicha IA. Ora si, manos a la obra.

> ChatGPT, escibeme un blog como si fueras Miguelito Åkerfeldt.


## (IA) - 1. Crea una nueva aplicación Svelte con Vite

Primero, crea una nueva aplicación Svelte utilizando Vite. Puedes hacerlo utilizando la CLI de Svelte. Abre una terminal y escribe:

```bash
npx degit sveltejs/template my-svelte-project
cd my-svelte-project
npm install
```
Este comando creará una nueva aplicación Svelte en la carpeta "my-svelte-project".

> degit, el buen git clone --depth=1 para raritos...espera...¿carpeta? .__. Directorio, DIRECTORIO!

## (IA) - 2. Configura Vite para el despliegue en GitHub Pages

Abre el archivo `vite.config.js` en la raíz del proyecto y agrega lo siguiente:

```js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    target: 'es2015',
    outDir: 'docs',
  },
  base: '/my-svelte-project/'
});
```

Esto configura Vite para que genere los archivos de la aplicación en la carpeta "docs" en lugar de "dist" (la carpeta por defecto de Vite). Además, establece el prefijo de la URL base en "/my-svelte-project/" para que los archivos puedan ser servidos correctamente en GitHub Pages.

> Ya aquí empieza a haber un poco de cambios, el archivo `vite.config.js` usualmente es más corto. También puso el target de compilación en "es2015" que a la fecha de escribir esta entrada (Marzo 2023), es la versión más viejita de ES que soporta Vite como target de compilación. Por defecto Vite usa "modules" que es un target que funciona en navegadores con soporte de módulos. Específicamente los "Native ES Modules", el "Native ESM dynamic import" y algo llamado `import.meta` que ni idea. Igual, al final del día Vite va a reemplazar el target "modules" por `['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']`. Desconozco si ChatGPT puso esto a propósito o si simplemente no sabe que Vite usa "modules" como target por defecto. Recordemos que su conocimiento se limita a eventos pasados antes de Septiembre del 2021.

## (IA) - 3. Genera la aplicación

Para generar la aplicación, abre una terminal y escribe:

```bash
npm run build
```

Esto generará la aplicación en la carpeta "docs".

> Aquí me di cuenta...¿por qué chuchas en `docs/`? Y sip, no lo vi en el paso anterior, abajo del target, por alguna razón la IA se puso bien esquizoide y por alguna razón quiere que el output sea en `docs/` y no en `dist/` como lo hace Vite por defecto.

## (IA) - 4. Crea un nuevo repositorio en GitHub

Crea un nuevo repositorio en GitHub y asegúrate de tener permisos de escritura en él.

> Me agradó su enfoque de: "No explicaré lo que ya deberías saber" que a veces uso yo xd

## (IA) - 5. Agrega los archivos al repositorio

Abre una terminal y escribe:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:tu-usuario/tu-repositorio.git
git push -u origin master
```

> Aquí se pasó por el arco del triunfo el enfoque mencionado anteriormente.

## (IA) - 6. Configura GitHub Pages

Ve a la configuración de tu repositorio en GitHub y desplázate hacia abajo hasta la sección "GitHub Pages". Selecciona la rama "master" y la carpeta "docs" como origen.

> De nuevo, el paso es correcto, sigo sin saber por qué eligió `docs/` como output. Supongo que entendió que la documentación de algún proyecto X es la que deseo que esté online como página web. Tiene sentido por varios proyectos de Python o C, que sus documentaciones están en doxygen o sphinx y se despliegan en GitHub Pages. No está mal, pero sepa por que entendió eso el méndigo marihuano de ChatGPT.
 
## (IA) - 7. Accede a tu aplicación

Después de unos minutos, tu aplicación debería estar disponible en https://tu-usuario.github.io/tu-repositorio/.

¡Eso es todo! Ahora tienes una aplicación Svelte desplegada en GitHub Pages utilizando Vite.

> Muy directo y conciso. Nice.

## Screenshots de la conversación

![Screenshot 1](/img/posts/sveltegpt/1.png)

![Screenshot 2](/img/posts/sveltegpt/2.png)

![Screenshot 3](/img/posts/sveltegpt/3.png)

> ¿Arduino?

![Screenshot 4](/img/posts/sveltegpt/4.png)

> Nótese que en el paso 5 se le fue el pedo bien duro y puso las instrucciones de shell como SQL

## (IA) Conclusión

En conclusión, desplegar una aplicación Svelte con Vite en GitHub Pages es un proceso sencillo que puede llevarse a cabo en pocos pasos. Lo primero es crear la aplicación utilizando Vite y configurar el archivo vite.config.js para el despliegue en GitHub Pages. Luego, se genera la aplicación y se agrega al repositorio de GitHub. Finalmente, se configura GitHub Pages para que sirva la aplicación desde la carpeta "docs" del repositorio. Con estos sencillos pasos, es posible compartir tu aplicación Svelte con el mundo y mostrar tu trabajo de forma accesible en la web.

## Conclusión

El basilisco de Roko se rifó un tutorial muy bueno y muy conciso. Si, es cierto que se le fue el pedo en un par de ocasiones, como ejecutar órdenes de node / bash en arduino y SQL. Además de elegir de forma extraña el output de la compilación. Pero, en general, es un tutorial muy bueno y muy conciso. No se le puede pedir más a un tutorial de "finales" del 2021.

La IA ha estado tomando cada vez más importancia en las redes sociales, con sitios nuevos saliendo a diestra y siniestra ofreciendo servicios impulsados por la IA, algunos muy útiles como [DeepL](https://www.deepl.com/translator) para traducir textos (si, ya se que lleva varios años existiendo). Otros un poco más recientes como GitHub Copilot han probado ser bastante efectivos al momento de ayudar a los desarrolladores a producir código. Sin dudas, es una herramienta que está volviendo a tener un ascenso en la industria del desarrollo de software. Esperemos ese temido "Tercer invierno" no llegue a ocurrir. O, si ocurre, estar bien preparados para enfrentarlo.

Personalmente, al menos las pocas herramientas que uso de IA han mejorado mucho mi productividad. Si bien la generación de código aun deja mucho que desear fuera de los lenguajes de juguete, lo cierto es que facilita mucho las cosas tediosas o que simplemente dan hueva en el código, cosas tan triviales como "lee este archivo .csv", "elimina los duplicados de este array", "declarame una estructura, un método `New` y una implementación para imprimir esa estructura a stdout".

Espero que pronto la [IA de Mozilla](https://mozilla.ai/about/) salga pronto y así poder apoyar a un movimiento que busca hacer de la IA una herramienta útil para todos. (Dios plan, habrá software libre involucrado). Así podré huir del mugroso big tech que tanto se desprecia aquí *cof cof* (MAANG/FAANG).

Eso o que OpenAI deje de hacer ridiculeces con su producto que consumimos gratis, no damos ni un peso pero nos quejamos. Por que la gente quiere todo gratis, y se queja de lo gratis.

Si eres buen programador, esos errores que cometa la IA, son fácilmente identificables y corregidos. Recuerda, es una herramienta, no es más útil de lo que un martillo sería frente a un desarmador. Una mala IA es la que no sigue nuestras instrucciones, queda en ti darle esas instrucciones de forma correcta. Y como dice la miniatura del blog. A ver que se inventará la banda hoy en día, con esos términos extraños que se inventan cada 2 meses, seguramente estaremos viendo marihuanadas como: *AI Prompt Engineer*, *DevAIOps*, *DevPromptOps* o Dios sabrá que más.

Espero que este tipo de herramientas evolucionen para ayudarnos a producir mejor software en poco tiempo, ver como puedo aplicarla como DevOps para causar más burnouts y que me ayude a corregir mis horrores de redacción y ortografía a los que espero, no se hayan acostumbrado.

### Pasos a seguir para desplegar una aplicación Svelte + Vite en GitHub Pages (Mi método)

Ahora si viene el mero mole. Muchos de los pasos que hice yo los cubre la IA en su tutorial. Sin embargo aquí les voy a dejar un micro-pico-tutorial de como hice yo para desplegar una aplicación Svelte + Vite en GitHub Pages.

1. Lo de crear una cuenta, un repositorio y activar las "Pages" para el mismo es algo que asumo, ya sabes hacer. Tonces, no voy a cubrir eso.
2. En el archivo `vite.config.js` no es necesario tanto menjurje. Lo que hice fue lo siguiente:

```js
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  base: "https://ventgrey.github.io/EpitaphWM",
  plugins: [svelte()],
})
```

> La URL no debe ser absoluta, en mi caso, se que no quiero que cambie nada y se que no compraré un dominio para ese proyecto pronto, la url hardcodeada es la que me sirve.

3. Yo hice un workflow de GitHub Actions para que cada vez que haga un push a la rama `master` se ejecute el workflow y se genere la página con NPM. El workflow es el siguiente:

```yml
# This is a basic workflow to help you get started with Actions

name: Build + Deploy CI

# Controls when the workflow will run
on:
  # Triggers the workflow on push or pull request events but only for the master branch
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install and Build
        run: |
          echo > .nojekyll
          npm install
          npm run build
          
      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@4.1.5
        with:
          branch: gh-pages
          folder: dist
```

Si, sé que GitHub tiene su workflow para desplegar a GitHub Pages, sin embargo, está en fase beta y no tiene tantas opciones como la que yo uso. El workflow es muy sencillo, si tu página de Svelte es lo suficientemente pequeña, no debería tardar más de dos minutos en desplegarse.

También, como paso extra, si deseas acelerar aún más el proceso, puedes crear una caché de NPM para que no se descarguen todas las dependencias cada vez que se ejecute el workflow.

4. Eso es todo.

Sip, así de sencillo es. Por eso dije desde el inicio que no era necesario hacer un tutorial completo, el proceso ya está bien documentado en la documentación de Vite y Svelte.

Este ha sido un blog cortito, realmente lo hice para caer en el hype de la IA que se ve en estos días. También para no volver a abandonar el blog por varios meses de nuevo. Espero que te haya gustado y que hayas aprendido algo nuevo. Si quieres ver las posibilidades con título mamador de "AI and beyond", puedes tratar de usar las herramientas para las siguientes cosas:

- Mejorar los README de tus proyectos.
- Generar documentación de código.
- Crear títulos o contenido atractivo para los reclutadores en tu LinkedIn o plataformas de trabajo.
- Mejorar el SEO de tus sitios.

Recuerda, la IA puede generar contenido completo y coherente. Pero, mientras no tenga la experiencia y el conocimiento personal, no podrá sustituir a un humano. Por eso, no te dejes engañar por la IA, sigue siendo un humano el que debe darle las instrucciones correctas, malas instrucciones, malos resultados.

Human: 🧠
AI: 🧠n't

### Canción triste del día (Elegida por la ChatGPT tomando en cuenta las canciones anteriores)

*Everybody Hurts - R.E.M.*

![Song](/img/posts/sveltegpt/spotify.png)

#### ChatGPT ¿Neta? ¿Una canción así de pachorras?
![Song](/img/posts/sveltegpt/song.png)

---

¿Te gustan estos blogs? Ayúdame a seguir escribiéndolos de las siguientes formas:
- [Invítame un Negrito Bimbo](https://ko-fi.com/ventgrey)
- [Regálame un follow en GitHub ❤](https://github.com/VentGrey)

> Mind over matter, brain stimulation. I don't know if I exist, I think therefore I am. Without emotions I'm but a hologram.
