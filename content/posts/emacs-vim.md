---
title: "Emacs, una comparativa personal con Vim"
date: 2023-02-13
tags: ["Gnu", "Linux", "Vim", "Emacs", "Opinión", "Personal"]
categories: ["Linux", "Emacs", "Personal"]
author: "VentGrey"
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "¿Vim o Emacs? ¿Por qué no ambos? En este blog vamos a explorar como podemos tener el poder de Vim contenido en Emacs."
canonicalURL: "https://ventgrey.github.io/posts/emacs-vim"
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
    image: "/img/posts/vimacs/cover.png" # image path/url
    alt: "Imágen del post" # alt text
    caption: "Imágen del post" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/<path_to_repo>/content"
    Text: "Sugerir Cambios" # edit text
    appendFilePath: true # to append file path to Edit link
---

# Emacs does what Vim-tendon't

![Imágen ochentera de sega tirandole caca a nintendo](/img/posts/vimacs/sega.jpg)

No pretendo caer en la eterna flamewar de que editor "es mejor", porque al final del día la respuesta va a depender de que tan eficiente eres en uno o en otro. Usar Vim sin saber las bases o cosas tan graciosas como una sustitución de palabras en un visual-block y defenderlo a capa y espada solo te hace un usuario de nano/notepad con ínfulas de superioridad.

Es interesante ver como la popularidad de los editores de texto cambia tan rápido con los años. Cuando iniciaba mis épocas de la universidad (allá por el 2017) Atom era el editor de texto más popular junto con Sublime y sus dios sabrá cuantos plugins. Todo mundo amaba Atom. Ahora Atom está prácticamente muerto, Sublime solo dios sabe que está pasando con el y lamentablemente (dependiendo de a quien le preguntes) Visual Studio Code es el nuevo rey de los editores de texto.

Lo bueno es que hay dos editores viejísimos que siguen vivos, son populares y no parece que vayan a morir pronto. Vim y Emacs. Personalmente considero que son "La crème de la crème" de los editores de texto. Son tan poderosos que pueden hacer casi cualquier cosa que se te ocurra (limitada a su alcance). Vim posee bindings de teclado y operaciones capaces de ahorrarte horas de trabajo si aprendes a usarlo correctamente.

Emacs por su lado puede hacer un poco más que Vim en cuestión de "utilidades". Ambos son editores de texto pero Emacs viene con un par de cosas interesantes que, podrían ser útiles para algunos o considerarse bloatware para otros.

## Emacs + Evil = Vim con superpoderes.

Personalmente adoro los keybinds de Vim. No hay otro "layout" que sea más que perfecto para mi al momento de utilizar un editor de texto. Sin embargo, Vim como editor (y su "sucesor" Neovim) no se acomodan a mis necesidades como usuario. ¿Por qué? Bueno, hay un par de malas experiencias que tuve con esos dos en el pasado. Intenté retomarlos a inicios de 2022, pero no vi un panorama que fuera encantador realmente.

Voy a ser sincero, Vimscript me parece un lenguaje...feo. No es que sea malo. Pero no le encuentro mucho sentido a como se programa en el y me queda claro porque la gran mayoría de plugins grandes están hechos con Python u otro lenguaje menos "estorboso". 

Además de un par de problemas de configuración de los plugins del LSP, aprender la diferencia entre ALE, YouCompleteMe, LanguageClient, sumado al intento de API de Lua por parte de Neovim, me hizo desistir de usar Vim como mi editor principal.

Pero, desistir de Vim o Neovim no significa que me desagraden, los usé por varios años antes de decidir cambiarme a Emacs, si hay un atractivo muy fuerte que tiene vim es su forma de navegar y editar texto. Podría jugarme el cuello al decir que tiene los mejores keybinds de todos los editores de texto que he usado. Así que, al momento de cambiar decidí instalar [Doom Emacs](https://github.com/hlissner/doom-emacs) y ver que tal me iba.

Doom Emacs es una especie de *mashup* entre Vim, Emacs y VScode. Tiene Evil instalado y puedes usar keybinds de Vim en casi todos lados. Era/Es el sustituto perfecto para mi.

> Como dato curioso, hay un editor llamado *vile* que significa "Vi like Emacs". El plugin de Vim para Emacs se llama *evil* y es casi interesante como los nombres hacen referencia a la maldad.

Otra cosa es que, al igual que Vim, puedo editar archivos / proyectos sobre SSH, no es algo que recomiende, pero si tienes un desarrollo de esos *inmantenibles* que se editan al vuelo, puedes hacerlo sin problemas.

## Filosofía "Unix"

No tengo nada más que decir: Es un intérprete de Emacs Lisp. Hace una cosa, interpreta Emacs Lisp. Y lo hace muy bien.

## ¿GUI o Terminal?

Ambas, es cierto que el uso de Emacs en una GUI puede ser un factor que le atraiga poco a muchas personas aficionadas a los editores de texto clásicos. Aunque muchos dicen que la experiencia completa de Emacs se obtiene usando la GUI, esto es parcialmente falso. Emacs y la gran mayoría de sus plugins funcionan perfectamente en una terminal.

## Dualidad Demonio <--> Cliente

Algunos se quejan de que Emacs tiene un tiempo de inicio mucho mayor al de Vim y es verdad. Emacs al ser más pesado, tiene un mayor tiempo de inicio y esto puede no gustarle a algunos usuarios. Sin embargo Emacs tiene un truco bajo la manga, puedes crear un demonio servidor principal que se encargue de manejar la mayoría de las cosas y luego puedes conectarte a el desde una ventana cliente. Con esto puedes cargar o pre-cargar tu emacs cuando inicies tu computadora y, al conectarte desde una ventana de cliente los tiempos de carga serán prácticamente instantáneos.

¿Por que un demonio? Bueno, hay una cosa que es cierta, Emacs no está hecho para ser un editor que debas abrir y cerrar constantemente, la idea es que lo abras una sola vez y hagas todo lo que debas de hacer en el. Si necesitas abrir otro archivo, puedes hacerlo desde el mismo editor. Si necesitas abrir otro proyecto, puedes hacerlo desde el mismo editor.

Hacer esto es muy sencillo, solo debemos crear un archivo en `/lib/systemd/system/emacs.service` o de forma "más local" en `~/.config/systemd/user/emacs.service` con el siguiente contenido:

```ini
    [Unit]
    Description=Emacs Daemon Service
    After=network.target
    
    [Service]
    Type=simple
    ExecStart=/usr/bin/emacs --daemon
    ExecStop=/usr/bin/emacsclient --eval "(progn (setq kill-emacs-hook nil) (kill-emacs))"
    Restart=on-failure
    Environment=DISPLAY=:%i
    TimeoutStartSec=0
    
    [Install]
    WantedBy=default.target
```

## Org Mode. LaTeX, Static Site Generator, Agenda y más.

Org Mode es una de las cosas más deliciosas que he visto en Emacs. Es un modo de edición que te permite hacer prácticamente cualquier cosa que se te ocurra. Podría decir que es un lenguaje de marcado con superpoderes, puedes usarlo como *superset* de LaTeX para crear tus documentos y añadirles un poco más de cosas o facilitar la sintaxis. Además, puedes usar Org para generar sitios web estáticos, crear agendas, usarlo como agenda o incluso como sustituto de cosas como Evernote o OneNote.

Además de todo esto, con org puedes crear *"literate configs"* que son archivos de configuración ampliamente documentados con org. Esto es muy útil para que otros usuarios puedan entender tu configuración y para que tu mismo puedas entenderla en el futuro.

## Plugins completos

Emacs tiene una gran cantidad de plugins que hacen prácticamente cualquier cosa que se te ocurra. Si bien no me agrada la idea de consultar el correo, navegar por internet o escuchar música desde Emacs, es posible hacerlo y bueno, suponog que a alguien le servirá de algo hacer todo desde Emacs. Pocos plugins son realmente necesarios para lograr un IDE productivo. Al menos yo utilizo los siguientes plugins para C, Rust, Python, JavaScript / Typescript y sus frameworks:

- [vertico.el](https://github.com/minad/vertico) - Un sustituto de Ivy para Emacs.
- [emacs-lsp](https://github.com/emacs-lsp/lsp-mode) - Un cliente LSP para Emacs con soporte para MUUUUUUUUUUUUUUUUUUUUUCHOS lenguajes.
- [evil](https://github.com/emacs-evil/evil) - Un plugin de Vim para Emacs.
- doom-modeline - Una barra de estado bonita hecha para Doom Emacs.

No se necesita mucho más realmente, si acaso los `major-mode` de cada lenguaje, por ejemplo, tuve que instalar `web-mode` para poder editar archivos de Svelte y de Angular de forma satisfacoria sin que los templates se murieran.

## Conclusión

Emacs es un gran editor de texto y es extremadamente adaptable para las necesidades de cada usuario. Pocas son las cosas que no se pueden hacer en este editor y desde hace ya más de 5 años se ha vuelto mi elección por defecto para editar código en cualquier lenguaje de programación. Si bien no es el mejor editor de texto para todos, es el mejor editor de texto para mí.

¿Te interesa Emacs? Puedes probarlo en su página oficial: [https://www.gnu.org/software/emacs/](https://www.gnu.org/software/emacs/). Si eres primerizo en Emacs, puedes tratar de usar spacemacs, es una distribución de Emacs que viene con un montón de plugins y configuraciones listas para usar. Si eres un usuario de Vim, puedes probar Evil, un plugin que te permite usar Emacs como si fuera Vim. O, si amas VSCode y Vim pero no toleas a Microsoft ni a Bram Moolenaar, puedes probar Doom Emacs.

### Canción triste del día.

*Angelica* - Anathema

![Spotify Code](/img/posts/vimacs/spotify.png)

---

¿Te gustan estos blogs? Ayúdame a seguir escribiéndolos de las siguientes formas:
- [Invítame una Pepsi](https://ko-fi.com/ventgrey)
- [Regálame un follow en GitHub ❤](https://github.com/VentGrey)
