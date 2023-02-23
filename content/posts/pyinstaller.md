---
title: "Distribuye tus programas de Python con Pyinstaller + GitHub Actions"
date: 2023-02-22
tags: ["Automatización", "DevOps", "Linux", "Windows", "MacOS", "CI/CD", "GitHub Actions", "Tutoriales", "Programación", "Python", "Distribución de software", "Ejecutables", "Desarrollo de Software"]
categories: ["DevOps", "Linux", "Tutoriales", "Python", "CI/CD"]
author: "VentGrey"
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "¿Necesitas distribuir un ejecutable de Python pero no sabes como? Vamos a ver en este blog como usar pyinstaller para distribuir tu software para Windows, Linux e incluso MacOS."
canonicalURL: "https://ventgrey.github.io/posts/pyinstaller/"
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
    image: "/img/posts/pyinstaller/cover.png" # image path/url
    alt: "Imágen del post" # alt text
    caption: "Imágen del post" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/<path_to_repo>/content"
    Text: "Sugerir Cambios" # edit text
    appendFilePath: true # to append file path to Edit link
---

# Sigue siendo mejor que usar Electron.

> Puedes encontrar una plantilla del código y de la configuración de GitHub Actions en [este repositorio](https://github.com/VentGrey/tkinter-githubactions). La licencia es LGPLv3. Es decir, es software libre :)

Las necesidades de la industria o incluso de las startups más pequeñas a veces involucran soluciones extrañas a problemas que urgen resolver. Desconozco la razón por la que la gran mayoría de las personas encargadas de dirigir los equipos piensan que podemos generar código a razón de 10 funciones puras, sin bugs y probadas como *correctas* por [coq](https://coq.inria.fr/).

A veces, sea por necesidad real o por urgencia innecesaria, debemos de encontrar soluciones a los problemas que nos piden y entregar el software de la forma más confiable posible. Este ejemplo cubrirá un caso que, ya no he visto mucho, pues ahora todos quieren una interfaz web. Las aplicaciones de escritorio.

Pocas son las veces en las que he visto a alguien pedir una aplicación de escritorio, para uso interno o externo. Son útiles y, bien hechas pueden presentar un rendimiento bastante superior al de una interfaz web (teniendo en cuenta la cantidad de capas de abstracción necesarias). Sin embargo, crear aplicaciones de escritorio desde cero puede ser muy complicado y tedioso, pues hay que aprender una, dos o en el peor de los casos 3 cosas diferentes para crear y mantener una.

Por ejemplo, si nuestra aplicación de escritorio solamente se usa en Windows, podríamos aprender el .NET Framework, C# o cualquier lenguaje ofrecido por Visual Studio. Si es de MacOS, estamos condenados a Objective-C, Swift o cualquier lenguaje que tenga soporte para Cocoa. Finalmente Linux que es probablemente el infierno más feo de todos en ese sentido, pues podemos elegir entre una cantidad enorme de toolkits como GTK (2,3,4), Qt, Tk, etc. Eso si, la opción del lenguaje de programación es más variada.

En el peor de los casos, decidiremos seguir haciendo interfaces web, pero con la ayuda de Electron. Sin embargo, eso implica añadir todo el codebase nuestro + el de chromium. Cosa que vuelve a los binarios pesados y el rendimiento muchas veces no es lo esperado. ¿No me crees? Veamos el peso de algunas aplicaciones hechas en Electron:

- [VSCode (93.7MB en Linux)](https://code.visualstudio.com/download)
- [VSCodium (83.1MB en Linux)](https://github.com/VSCodium/vscodium/releases) VSCode 100% libre y open source. Sin telemetría.
- [Slack (77.7MB en Linux)](https://slack.com/intl/es-mx/downloads/linux)
- [Pulsar (136MB en Linux)](https://pulsar-edit.dev/) Es el sucesor de Atom.

> PD: Esto es teniendo en cuenta que puedes bajar los binarios comprimidos. Tampoco quiere decir que otras apps no puedan ser pesadas. No es lo mismo VSCode a un "Hola mundo" en Python.

Ojo, no estoy diciendo que estas aplicaciones apesten o sean malas. Al final del día son herramientas para trabajar y deben cumplir su propósito de una forma u otra. Podría poner ejemplos más allá como Discord o Teams que tienen un tamaño +- similar, pero que consumen RAM como si la regalaran.


¿Qué alternativa tenemos a esto si queremos hacer una aplicación de escritorio en poco tiempo? ¿No hay una forma de hacerlo de una forma más sencilla? La respuesta es sí. Y es que, en realidad, no es tan complicado como parece. En este post vamos a ver como podemos usar [Pyinstaller](https://www.pyinstaller.org/) para crear un ejecutable de nuestra aplicación de escritorio. Además, vamos a ver como podemos usar GitHub Actions a nuestro favor para automatizar el proceso de creación de los binarios distribuibles.

## Python y yo tenemos una relación... complicada.

No es novedad que no soy un gran fan de Python. Comprendo el hecho y la ridiculez que es odiar a una herramienta, más a un lenguaje de programación. Sería como verme clavar un clavo en la pared con unas tijeras y responderte *"Es que, odio los martillos"* cuando me preguntes por qué no uso uno.

Sin embargo, Python es un lenguaje que me ha dado muchas satisfacciones, pero también me ha dado muchos dolores de cabeza. Y si bien es más lento que otros lenguajes, para este caso nos viene bien para saltarnos la inclusión de chromium en nuestro binario.

Además, Python es terriblemente sencillo de aprender. Si ya sabes programar en otro lenguaje, aprender Python es como aprender a hablar en otro idioma. No es tan complicado como aprender a programar bien en C o C++.

## ¿Qué es Pyinstaller?

Pyinstaller es una herramienta de empaquetado que convierte nuestro código de Python en un archivo ejecutable (.exe/ELF) independiente que, puede ser usado en diferentes sistemas operativos sin que el usuario necesite instalar el intérprete de Python.

Además es muy sencillo de usar y nos permite crear aplicaciones portátiles que no necesitan de ninguna dependencia externa (idealmente).

## Empaquetando un app complejísima.

Bueno, como todos los blogs de internet, voy a cooperar al basurero de información y voy a hacer un blog con un ejemplo sencillo, sintáxis fea, malas prácticas y sobre todo, lo más alejado que pueda del mundo real.

Bueno, si y no. No se me ocurrió un app útil y sencilla para demostrar en este blog, así que te enseñaré lo que vamos a hacer por pasos y trataré de acercar mi ejemplo lo más que pueda al mundo real:

1. Configurar un virtualenv con Python.
2. Instalar Pyinstaller.
3. Programar una app sencilla.
4. Empaquetar la app usando pyinstaller.
5. Probar que el ejecutable funciona.
6. Automatizar el proceso de creación de binarios usando GitHub Actions.
7. Usar el versionado a nuestro favor.
8. Crear nuevas releases.
9. [Extra] Asignar un icono a nuestro ejecutable en Windows.
10. [Extra] Añadir un splash screen a nuestro ejecutable.
12. [Extra] Loggear los errores de nuestro ejecutable en un archivo para mejor soporte.
13. [Extra] Loggear los errores a una REST API para obtener algo de telemetría.

Espero no alargar mucho este blog o no haberme olvidado de nada. Vamos a empezar.

## 1. Configurar un virtualenv con Python.

Para empezar, vamos a crear un virtualenv con Python. Esto nos va a permitir tener un entorno aislado de nuestro sistema y poder instalar las dependencias que necesitemos sin tener que preocuparnos por romper algo. No daré una técnica específica de como hacerlo, hay muchas formas y, supongo que ya estarás un poco familiarizado con python. Aun así, *"for the sake of example"* usaré pipenv porque es mi herramienta favorita para crear virtualenvs (Por su parecido a cargo de Rust).

```bash
# Crear el directorio del proyecto.

mkdir app
cd app

# Crear el virtualenv.

pipenv install --python 3.9

# Activar el virtualenv.

pipenv shell
```

Esto nos abrirá una terminal con el virtualenv activado. Si no sabes como funciona un virtualenv, te recomiendo que leas [este artículo](https://realpython.com/python-virtual-environments-a-primer/).

## 2. Instalar Pyinstaller.

Ahora que tenemos nuestro virtualenv activado, vamos a instalar pyinstaller. Esto lo haremos usando pip. (Es importante que el virtualenv esté activado).

```bash
pip install pyinstaller
```

Y ya, es todo. Asegúrate de que pyinstaller sea compatible con tu versión de Python. Si no es así, puedes usar pip para instalar una versión compatible. Lo digo porque, este blog lo escribí usando Python 3.9 porque es la que se encuentra disponible en Debian estable. Puede que tu en estos momentos (Febrero 2023) estés usando Python 3.10 o 3.11. Revisa la compatibilidad de pyinstaller antes de instalarlo.


## 3. Programar una app sencilla.

Vamos a hacer una GUI de escritorio sencilla. Para esto vamos a usar `tkinter` que es una biblioteca de Python que nos permite crear interfaces gráficas de usuario. Se ve HORRIBLE y parecen apps que haría alguien que se quedó atrapado en las épocas de Windows 2000. Sin embargo, es una biblioteca muy sencilla de usar y, en mi opinión, es la mejor opción para crear GUIs de escritorio en Python si no te importa mucho la estética.

Lamentablemente no todo es perfecto con TKinter y el versionado y la instalación son una odisea. Instalarlo desde pip no nos servirá "así nomás". Necesitamos instalar una serie de dependencias que no están disponibles en pip. Para esto, vamos a usar `apt` para instalar las dependencias de TKinter en Debian.

```bash
sudo apt install python3-tk
```

La instalación de Tkinter podría variar dependiendo de tu sistema. Y si, se que lo estás pensando. ¿Por qué estás usando apt en un virtualenv? ¿No estás amarrando tu app al sistema operativo con eso?. Tranquil@, en un momento verás porque no es necesario tener tkinter en el virtualenv.

Eso y que, parece que las personas encargadas de distribuir Tkinter son medio simios y la causa de tantas preguntas en stackoverflow sobre si es `tkinter` o `Tkinter` o `import tkinter` o `import tk`, etc etc etc. No nos preocupemos, después de todo, recuerden, somos sysadmins y **no** confiamos en los programadores.

Ahora vamos a crear un archivo llamado `main.py` y vamos a escribir el siguiente código:

> Vamos a hacer uso del módulo `webbrowser` que se encuentra en la biblioteca estándar de Python. Este módulo nos permite abrir URLs en el navegador predeterminado del usuario. Recuerda, vamos a hacer un programa que funcione en las tres plataformas, por lo que debemos escribir el código más portable que podamos.

```python
import sys
import webbrowser

# Condicionar el import de tkinter de acuerdo a nuestra versión de Python.

if sys.version_info[0] == 3:
    from tkinter import Tk, Label, Button, Menu, Text, messagebox
else:
    from Tkinter import Tk, Label, Button, Menu, Text, messagebox

# Definir una clase para nuestra GUI.

class App(Tk):
    def __init__(self):
        super().__init__()
        self.title("Visita La Esquina Gris")
        self.geometry("400x400")
        
        self.label: Label = Label(self, text="¡Visita La Esquina Gris!")
        self.label.pack()
        
        self.button: Button = Button(self, text="Visitar en mi navegador", command=self.visit)
        self.button.pack()
        
    def visit(self) -> None:
        webbrowser.open("https://ventgrey.github.io")
        
# Inicializar la GUI.

app: App = App()
app.mainloop()
```

Puedes omitir las anotaciones de tipo si no te gustan. Son opcionales y no afectan el funcionamiento del programa, porque pues, a python no le interesan realmente. Si no sabes que son las anotaciones de tipo, puedes leer [este artículo](https://realpython.com/lessons/type-hinting/). Yo las pongo porque me gusta que mi código sea lo más legible posible. 

Vamos a probar que todo funcione. Para esto, vamos a ejecutar el archivo `main.py` usando Python.

```bash
python main.py
```

Si todo salió bien, deberías ver una ventana como esta:

![Ventana de TKinter](/img/posts/pyinstaller/ventana1.png)

Y, si presionamos el botón que dice "Visitar en mi navegador", deberíamos ver la página de La Esquina Gris en nuestro navegador predeterminado:

![Ventana del navegador](/img/posts/pyinstaller/abrir.png)

## 4. Crear el ejecutable.

Ahora que tenemos nuestra GUI lista, vamos a crear el ejecutable. Para esto, vamos a usar pyinstaller. Vamos a usar el siguiente comando:

```bash
pyinstaller main.py
```

Si todo salió bien, deberías ver un mensaje como este:

```bash
105 INFO: PyInstaller: 5.8.0
105 INFO: Python: 3.11.2
107 INFO: Platform: Linux-6.1.0-3-amd64-x86_64-with-glibc2.36
107 INFO: wrote /home/ventgrey/app/main.spec
108 INFO: UPX is not available.
109 INFO: Extending PYTHONPATH with paths
['/home/ventgrey/app']
262 INFO: checking Analysis
262 INFO: Building Analysis because Analysis-00.toc is non existent
262 INFO: Initializing module dependency graph...
263 INFO: Caching module graph hooks...
270 INFO: Analyzing base_library.zip ...
1237 INFO: Loading module hook 'hook-heapq.py' from '/home/ventgrey/.local/share/virtualenvs/app-rm7O2PdZ/lib/python3.11/site-packages/PyInstaller/hooks'...
1332 INFO: Loading module hook 'hook-encodings.py' from '/home/ventgrey/.local/share/virtualenvs/app-rm7O2PdZ/lib/python3.11/site-packages/PyInstaller/hooks'...
2758 INFO: Loading module hook 'hook-pickle.py' from '/home/ventgrey/.local/share/virtualenvs/app-rm7O2PdZ/lib/python3.11/site-packages/PyInstaller/hooks'...
4554 INFO: Caching module dependency graph...
4638 INFO: running Analysis Analysis-00.toc
4664 INFO: Analyzing /home/ventgrey/app/main.py
4841 INFO: Processing module hooks...
4842 INFO: Loading module hook 'hook-_tkinter.py' from '/home/ventgrey/.local/share/virtualenvs/app-rm7O2PdZ/lib/python3.11/site-packages/PyInstaller/hooks'...
4842 INFO: checking Tree
4842 INFO: Building Tree because Tree-00.toc is non existent
4842 INFO: Building Tree Tree-00.toc
4846 INFO: checking Tree
4846 INFO: Building Tree because Tree-01.toc is non existent
4846 INFO: Building Tree Tree-01.toc
4848 WARNING: Tcl modules directory /usr/share/tcltk/tcl8.6/../tcl8 does not exist.
4855 INFO: Looking for ctypes DLLs
4866 INFO: Analyzing run-time hooks ...
4868 INFO: Including run-time hook '/home/ventgrey/.local/share/virtualenvs/app-rm7O2PdZ/lib/python3.11/site-packages/PyInstaller/hooks/rthooks/pyi_rth_inspect.py'
4869 INFO: Including run-time hook '/home/ventgrey/.local/share/virtualenvs/app-rm7O2PdZ/lib/python3.11/site-packages/PyInstaller/hooks/rthooks/pyi_rth__tkinter.py'
4876 INFO: Looking for dynamic libraries
5449 INFO: Looking for eggs
5449 INFO: Python library not among binary dependencies. Performing additional search...
5513 INFO: Using Python library /lib/x86_64-linux-gnu/libpython3.11.so.1.0
5515 INFO: Warnings written to /home/ventgrey/app/build/main/warn-main.txt
5526 INFO: Graph cross-reference written to /home/ventgrey/app/build/main/xref-main.html
5539 INFO: checking PYZ
5539 INFO: Building PYZ because PYZ-00.toc is non existent
5539 INFO: Building PYZ (ZlibArchive) /home/ventgrey/app/build/main/PYZ-00.pyz
5762 INFO: Building PYZ (ZlibArchive) /home/ventgrey/app/build/main/PYZ-00.pyz completed successfully.
5764 INFO: checking PKG
5764 INFO: Building PKG because PKG-00.toc is non existent
5764 INFO: Building PKG (CArchive) main.pkg
5791 INFO: Building PKG (CArchive) main.pkg completed successfully.
5792 INFO: Bootloader /home/ventgrey/.local/share/virtualenvs/app-rm7O2PdZ/lib/python3.11/site-packages/PyInstaller/bootloader/Linux-64bit-intel/run
5792 INFO: checking EXE
5792 INFO: Building EXE because EXE-00.toc is non existent
5792 INFO: Building EXE from EXE-00.toc
5792 INFO: Copying bootloader EXE to /home/ventgrey/app/build/main/main
5793 INFO: Appending PKG archive to custom ELF section in EXE
5800 INFO: Building EXE from EXE-00.toc completed successfully.
5802 INFO: checking COLLECT
5802 INFO: Building COLLECT because COLLECT-00.toc is non existent
5802 INFO: Building COLLECT COLLECT-00.toc
5869 INFO: Building COLLECT COLLECT-00.toc completed successfully.
```

## 5. Probar que el ejecutable funciona.

Si el mensaje es similar al anterior, entonces todo salió bien. Ahora, vamos a buscar el ejecutable en la carpeta `dist`:

```bash
cd dist/main
```

Dentro del directorio vamos a encontrar el ejecutable junto con un montón de bibliotecas que necesita para funcionar:

```bash
ls

base_library.zip      libbsd.so.0     libexpat.so.1       libmd.so.0            libtcl8.6.so  libXdmcp.so.6    libXss.so.1  tk
libBLT.2.5.so.8.6     libbz2.so.1.0   libfontconfig.so.1  libpng16.so.16        libtk8.6.so   libXext.so.6     libz.so.1
libbrotlicommon.so.1  libcrypto.so.3  libfreetype.so.6    libpython3.11.so.1.0  libX11.so.6   libXft.so.2      main
libbrotlidec.so.1     lib-dynload     liblzma.so.5        libssl.so.3           libXau.so.6   libXrender.so.1  tcl

```

Esto nos funciona a nosotros, sin embargo, a un usuario normal podría no agradarle tener que manejar un directorio con todas estas dependencias. Tristemente, las personas *"de a pie"* normalmente buscan un ejecutable que sea algo tán sencillo como un doble click. La buena noticia es que pyinstaller tiene una opción para generar un solo ejecutable que incluya todo lo necesario para que el programa funcione.

```bash
# Borrar el directorio dist para ver la nueva reconstrucción

rm -rf dist

pyinstaller --onefile main.py
```

La salida que produce el comando con esta opción es menor que la anterior, sin embargo no la incluiré porque, cuando hay un error o cuando el proceso se completó con éxito, no es difícil verlo.

Vamos a entrar al directorio `dist` y veremos que ahora hay un solo ejecutable:

```bash
cd dist
ls

main
```

Este ejecutable ya tiene todas las dependencias que necesita incluidas dentro de sí mismo. Ahora, si lo ejecutamos, veremos que el programa funciona igual que antes:

```bash
./main
```

Perfecto. Ya tenemos el primer paso. Podemos crear "binarios estáticos". Entrando en un terreno un poco más técnico, lo pongo entre comillas porque, si le pasamos el comando `file main` la salida será:

```bash
file main
main: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=54d348536553605e1ebca614e8b0144c5b3acf4d, for GNU/Linux 2.6.32, stripped
```

Esto significa que el programa es un objeto ejecutable ELF (siglas para *Executable and Linkable Format*) de 64 bits. Lo interesante viene en la siguiente parte que dice "dynamically linked", esto significa que el ejecutable tiene referencias a bibliotecas que son cargadas dinámicamente en tiempo de ejecución del programa. Finalmente la parte que dice "stripped" significa que el ejecutable no tiene información de depuración, es decir, no tiene información de símbolos que nos permitan saber qué hace cada parte del programa.

Basta de lo técnico. Vamos a ver el proceso de las GitHub Actions.

## 6. Crear el workflow de GitHub Actions

No cubriré como hacer una cuenta de GitHub ni como usar Git. Si no sabes como hacerlo, te recomiendo que leas [este tutorial](https://www.youtube.com/watch?v=3XlZWpLwvvo). Vamos a comenzar con el trabajo de las GitHub Actions.

Si no tienes workflows o si no sabes como hacerlos a mano, vamos a crear uno desde cero. Para esto, vamos a la sección de Actions y le damos click a "set up a workflow yourself" o podemos hacerlo con línea de comandos.

Para esto, voy a crear tres archivos diferentes, uno para cada sistema operativo que quiero soportar:

```bash
mkdir -p .github/workflows
touch .github/workflows/build-app-{linux,macos,windows}.yml
```

### Corregir el archivo Pipenv (si usas una versión diferente de Python)

Si queremos que los pipelines no fallen debido a un "version mismatch", debemos editar el archivo `Pipfile`. Y locaizar la línea que dice `python_version = "algo"`. Donde "algo" es la versión de python que tenemos instalada. Debemos cambiarla para que diga `python_version = "3"`. ¿Por qué? Bueno, como dije, lo que buscamos es que se construya y no tenga errores de versiones. 

Entiendo que por temas de reproducibilidad buscas que la versión en la que desarrollas y la de compilación / construcción sea la misma. Sin embargo, en este caso, no es necesario. Si quieres que la versión de Python sea la misma, entonces debes crear un entorno virtual con la versión de Python que quieres usar.

También, en caso de que uses una versión de Python experimental o simplemente diferente a la que tiene la máquina virtual de `ubuntu-latest` de los GitHub actions, este fix puede ayudarte a que no tengas problemas.

Viene la parte pesada, vamos a editar los archivos uno a uno, porque la sintaxis es un poco diferente para cada uno y no quiero que se confundan. Los workflows tendrán una estructura similar. Salvo algunos casos especiales en las pipelines, explicaré la estructura básica de todos. Los casos especiales los explicaré en cada workflow.

### Explicando las partes comunes de los workflows

Estos workflows estarán configurados para ejecutarse cuando se haga `push` a un tag en la rama master. Esto significa que cuando se haga un `git push --tags` se ejecutará el workflow. Esto es útil porque, si queremos hacer una nueva versión, podemos hacer un `git tag -a v1.0.0 -m "Versión 1.0.0"` y luego un `git push --tags` y automáticamente se creará una nueva versión.

Este flujo consiste en un solo trabajo (`job`) de construcción. Este trabajo se ejecutará en una máquina virtual de la última versión soportada de Ubuntu por GitHub. Para evitar construcciones muy grande (y forzarnos a ser eficientes), pondremos un timeout de 10 minutos. Si el proceso de construcción no termina en esos 10 minutos el workflow fallará.

Dentro de cada workflow habrá varias tareas que se deberán de ejecutar a estas tareas las concemos como "steps". Cada step tiene un nombre y un comando que se ejecutará. Los nombres de los steps son para que sea más fácil de entender qué hace cada paso. Los comandos son los que se ejecutarán en la máquina virtual.

El primer paso es el de "checkout". Este step se encarga de clonar el repositorio en la máquina virtual. Esto es necesario porque, si no, no tendríamos acceso al código fuente del programa. Luego, se configura Python para que se use la versión 3.9, además de instalar pipenv y wheel. Estos dos últimos son necesarios para instalar las dependencias del proyecto y crear el paquete de distribución.

El siguiente paso es configurar una caché para guardar el entorno virtual de pipenv y evitar tener que instalar todas las dependencias cada vez que se haga una nueva construcción. Si la caché ya existe, se restaura. Si no, se crea una nueva. En caso de no existir, se instalarán las dependencias indicadas en el archivo `Pipfile.lock` cuando se ejecute `pipenv install`.

Finalmente, el comando de `pyinstaller` es ejecutado para construir un binario de nombre `app_<so>` donde `<so>` puede ser`linux`, `macos` o `windows`. Adicional a esto, se llama a PyInstaller con la bandera `--hiden-import=tkinter` Esta bandera le indica a PyInstaller que `tkinter` debería ser incluido en el binario generado. Incluso si PyInstaller no detecta que se usa de forma explícita en el código fuente.

El paso final utiliza la acción `softprops/action-gh-release@v1` para publicar el archivo ejecutable en la sección de "Releases" del repositorio.

### El workflow para Linux

Vamos a ver el workflow para Linux.

```yml
name: Build App for Linux

# Only trigger this workflow when a new tag is pushed
on:
  push:
    tags:
     - "*"
  pull_request:
    branches: [ master ]
  release:
    types: [published, prereleased]


jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout repository code
        uses: actions/checkout@v2

      # Configure python 3.9
      - name: Configure Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.9"
          
      - name: Install Tkinter for Ubuntu
        run: sudo apt-get install python3-tk

      - name: Install virtual envs and dependencies
        run: |
          python -m pip install --upgrade pipenv wheel

      - id: cache-pipenv
        uses: actions/cache@v1
        with:
          path: ~/.local/share/virtualenvs
          key: ${{ runner.os }}${{ runner.os }}-pipenv-${{ hashFiles('**/Pipfile.lock') }}

      - name: Install pipenv dependencies
        if: steps.cache-pipenv.outputs.cache-hit != 'true'
        run: |
          pipenv install --deploy --dev

      - name: Build Linux executable
        run: |
          pipenv run pyinstaller --hidden-import=tkinter --name="app_linux" --onefile main.py
      - name: Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist/app_linux
```

Este workflow no necesita de mucha explicación, pues su estructura es muy similar a la descripción que di al iniio

> Desconozco por que en Hugo se ve extraño el código renderizado. Si quieres copiar el archivo del workflow, hazlo desde GitHub. No se si Hugo vaya a cometer los mismos errores de espaciado en tu portapapaeles, al menos en el renderizado algunas ordenes parecen muy separadas.

## El workflow para macOS

```yml
name: Build App for Mac

on:
  push:
    tags:
     - "*"
  pull_request:
    branches: [ master ]
  release:
    types: [published, prereleased]


jobs:
  build:
    runs-on: macos-latest
    timeout-minutes: 10

    steps:
      - name: Checkout repository code
        uses: actions/checkout@v2

      # Configure python
      - name: Configure Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.9"

      - name: Instalar entornos virtuales
        run: |
          python -m pip install --upgrade pipenv wheel

      - id: cache-pipenv
        uses: actions/cache@v1
        with:
          path: ~/.local/share/virtualenvs
          key: ${{ runner.os }}${{ runner.os }}-pipenv-${{ hashFiles('**/Pipfile.lock') }}

      - name: Instalar Dependencias
        if: steps.cache-pipenv.outputs.cache-hit != 'true'
        run: |
          pipenv install --deploy --dev

      - name: Construir los binarios para todos los sistemas operativos
        run: |
          pipenv run pyinstaller --name "iApp" --onefile main.py
      - name: Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist/iApp
```

Aquí solo debemos cambiar el nombre del ejecutable y el sistema operativo a MacOS.


## El workflow para Windows

```yml
name: Build App for Windows

on:
  push:
    tags:
     - "*"
  pull_request:
    branches: [ master ]
  release:
    types: [published, prereleased]


jobs:
  build:
    runs-on: windows-latest
    timeout-minutes: 10

    steps:
      - name: Checkout repository code
        uses: actions/checkout@v2

      # Configure python
      - name: Configure Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.10"

      - name: Instalar entornos virtuales
        run: |
          python -m pip install --upgrade pipenv wheel

      - id: cache-pipenv
        uses: actions/cache@v1
        with:
          path: ~/.local/share/virtualenvs
          key: ${{ runner.os }}${{ runner.os }}-pipenv-${{ hashFiles('**/Pipfile.lock') }}

      - name: Instalar Dependencias
        if: steps.cache-pipenv.outputs.cache-hit != 'true'
        run: |
          pipenv install --deploy --dev

      - name: Construir los binarios para todos los sistemas operativos
        run: |
          pipenv run pyinstaller --windowed --name="App" --onefile main.py
      - name: Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist/App.exe
```

A diferencia de los otros dos, este workflow tiene una diferencia importante. En el paso `Construir los binarios para todos los sistemas operativos` se usa la opción `--windowed` para que el ejecutable no se ejecute en modo consola. ¿Por qué? Bueno, es para usuarios de Windows. **ESPECIALMENTE** para ellos, si ven que el ejecutable se ejecuta en modo consola, no lo van a usar, o como mínimo se van a asustar. Por eso, es importante que el ejecutable se ejecute en modo ventana sin ninguna consola cerca.

Con esto hemos terminado de configurar nuestros workflows. Ahora, vamos a probarlos.

## 7. Usar el versionado a nuestro favor

Te estarás preguntando ¿por qué solo construir cuando se libere un tag nuevo? Bueno, primero, esta estrategía puede **NO** funcionar para todos los programas que necesites construir, es simplemente una estrategia más. Si no te funciona tendrás que buscar otra o idear la tuya.

La razón de elegir esto es para no llamar el binario en cada commit que hagamos, incluso si es entre múltiples personas trabajando sobre una misma rama, no estaremos lanzando la construcción de los binarios a cada momento. 

Además, como cada build es un archivo independiente, los pipelines de cada sistema operativo se ejecutan en paralelo, lo que hace que el proceso sea más rápido, además, como no son dependendientes entre sí, si uno falla, los otros dos no se ven afectados. 

Por último, nos permite dejar las "releases" a nuestro criterio, el usar el sistema de versiones semántico o no ya es cosa tuya, pero con esto podrás hacer tantos commits como quieras y liberar cuando tu software sea estable, corrijas bugs o añas nuevas funcionalidades.

Bueno, basta de justificaciones, vamos a probarlo. Para esto hay que crear un nuevo tag desde la consola de git. 

```bash
git tag -a v0.1.0 -m "Alpha 0.1.0"
git push origin v0.1.0
```

Si entramos a GitHub, podemos ver que nuestros workflows comienzan a ejecutarse apenas hagamos el push del tag:

![triggered pipelines](/img/posts/pyinstaller/workflows.png)

### Corrigiendo los workflows. ¿Qué salió mal?

Vamos a ver como le fue a nuestros workflows :D

Oh qlv >:C (*Oh, que lo veo!*)

![failed pipelines](/img/posts/pyinstaller/workflows2.png)

Bueno, al menos esto probó mi punto anterior, como las pipelines son independientes entre si, si una falla, las otras no se ven afectadas:

![release](/img/posts/pyinstaller/release.png)

Como podemos ver, aunque fallaron las construcciones para Windows y MacOS, la construcción para Linux fue exitosa y el binaro se liberó de forma correcta.

Al parecer solo el workflow de Linux salió bien, pero los otros dos no. ¿Por qué? Vamos a ver que pasó.

![arbiter](/img/posts/pyinstaller/easy.gif)

> https://www.youtube.com/watch?v=_-TzJ1Oc1Xc

"Fue muy fácil". Quisiera decir. Al parecer tenemos que tomar un par de pasos extras para generar correctamente los binarios para Windows y MacOS.

#### Corregir el workflow para Windows.

Al parecer el pipeline de Windows nos ha dado el mensaje que necesitamos:

```
Run pipenv run pyinstaller --windowed --name="App" --onefile main.py
PyInstaller cannot check for assembly dependencies.
Please install pywin32-ctypes.

pip install pywin32-ctypes

Error: Process completed with exit code 1.
```

Bueno, parece que solo es eso, vamos a instalar `pywin32-ctypes` en nuestro entorno virtual:

```bash
pipenv install pywin32-ctypes
```

Perfecto, vamos a crear un nuevo commit, luego un nuevo tag y ver que pasa:

```bash
git add Pipfile Pipfile.lock
git commit -m "Instalar dependencias faltantes para Windows"
git tag -a v0.1.1 -m "Alpha 0.1.1"
git push origin v0.1.1
```

De nuevo, were it so easy, nuestro pipeline volverá a fallar, esta vez por un error como este:

```
    from PyInstaller.depend.bindepend import match_binding_redirect
  File "C:\Users\runneradmin\.virtualenvs\tkinter-githubactions-ii0Rqvj3\Lib\site-packages\PyInstaller\depend\bindepend.py", line 38, in <module>
    import pefile
ModuleNotFoundError: No module named 'pefile'
Error: Process completed with exit code 1.
```

¿Qué es pefile y por que lo necesita windows? Bueno, pefile es un módulo de Python que nos permite leer archivos PE (Portable Executable) y extraer información de ellos. En este caso, PyInstaller lo usa para extraer información de los archivos DLL que se usan en el programa.

No pasa nada, al igual que con `pywin32-ctypes`, vamos a instalar `pefile` en nuestro entorno virtual:

```bash
pipenv install pefile
```

y repetimos el proceso de crear un nuevo commit, luego un nuevo tag y ver que pasa:

```bash 
git add Pipfile Pipfile.lock
git commit -m "Instalar dependencias faltantes para Windows"
git push
git tag -a v0.1.2 -m "Alpha 0.1.2"
git push origin v0.1.2
```

Vamos a ver si ahora si funciona:

![windows](/img/posts/pyinstaller/windows.png)

¡Perfecto! Ahora solo nos falta MacOS. Que también estaba fallando.

Aprovecho para mostrarte de nuevo la independencia de los workflows :) ¿Ves como ya tenemos binarios de Linux y Windows? Aunque haya fallado el de MacOS, estos dos no se ven afectados:

![release2](/img/posts/pyinstaller/release2.png)

#### Corregir el workflow para MacOS.

Este es muy sencilo, al igual que pefile, MacOS necesita de su propio módulo para leer archivos PE, en este caso, `macholib`. Vamos a instalarlo en nuestro entorno virtual:

```bash
pipenv install macholib
```

Otra vez caldo María. Hay que repetir el paso de crear un nuevo commit, luego un nuevo tag y ver que pasa:

```bash
git add Pipfile Pipfile.lock
git commit -m "Instalar dependencias faltantes para MacOS"
git push
git tag -a v0.1.3 -m "Alpha 0.1.3"
git push origin v0.1.3
```

Ahora si, vamos a revisar nuestros releases :)


¡Bueno bueno! Todo está perfecto ahora :) Ya tenemos binarios para Linux, Windows y MacOS. Tho, debo decir que, viendo los tiempos de construcción de cada workflow sale un buen argumento en esas eternas flamewars de "X sistema operativo es mejor que el otro" 👀

![flamewar](/img/posts/pyinstaller/flamewar.png)

Como podemos ver Windows y Mac se la turbo-pelaron a Linux. Teniendo Linux solo 46s de construcción, Windows 1m 38s y MacOS 2m 23s. En palabras de un amigo que conocí en la universidad cada que le daba un ataque de risa: **"WUJUJUJUJU"**

## 8. Crear nuevas releases

Cuando hayamos pulido completamente nuestra aplicación, podemos aprovechar el sistema de releases de GitHub para modificar la release creada por el workflow, solo debemos usar la GUI. Como dije antes, no es un tutorial de como usar Git y GitHub, aquí estoy asumiendo que esto ya lo sabes hacer:

![ejemplorelease](/img/posts/pyinstaller/ejemplorelease.png)


Ahora si, a disfrutar de los clientes o los usuarios. Y todos felices :) Trata de dejar las releases lindas o llamativas para tus usuarios, así les será más fácil identificarlas.

## 9. [Extra] Asignar un icono a nuestro ejecutable (Solo Windows)

> Para este paso es necesario instalar pillow en nuestro entorno virtual. Eso ya lo sabrás hacer con pipenv luego de leerte el tutorial.

Si quieres agregar un icono a tu ejecutable de Windows, primero necesitarás de un archivo `.ico` que contenga el icono que quieres usar. Puedes usar un generador de iconos como este: https://icoconvert.com/.

En mi caso yo usaré el logo de "La Esquina Gris" que es el logo de mi blog:

![icon](/img/posts/pyinstaller/icon.ico)

Es importante colocar el icono en el mismo directorio donde se encuentre tu archivo `main.py` para que a PyInstaller no se le vaya el pedo. Puedes ponerlo en otra dirección como `assets` o algo. Pero, para este ejemplo, lo dejaremos en el mismo directorio.

Ahora solo necesitamos agregar el parámetro `--icon` a nuestro comando de PyInstaller en el workflow de Windows (Voy a recortar el archivo para solo mostrar la parte reelevante):

```yaml
     - name: Construir los binarios para todos los sistemas operativos
        run: |
          pipenv run pyinstaller --icon=icon.ico --windowed --name="App" --onefile main.py
```

Con esto, nuestra aplicación tendrá un icono propio en Windows. Lamentablemente en Mac y en Linux tendremos que elegir un icono de forma manual.

## 10. [Extra] Añadir un splash screen a nuestro ejecutable (Linux y Windows solamente)

> Para este paso es necesario instalar pillow en nuestro entorno virtual. Eso ya lo sabrás hacer con pipenv luego de leerte el tutorial.

Para una mejor "UI/UX" (misma en la que soy malísimo), podemos añadir un splash screen a nuestro ejecutable. Para esto, necesitaremos de una imagen en formato `.png` que será la que se muestre mientras se carga nuestro programa.

> NOTA: El splash screen solo funciona en Windows y Linux. En MacOS no es compatible y poner la opción hará que el binario falle.

Yo utilizaré una slash screen que hice en GIMP que haga notar que ya estoy viejo, marcado y sin ganas:

![splash](/img/posts/pyinstaller/splash.png)

Ahora, antes de añadir un splash screen debemos saber una cosa, si lo ponemos "así nomás", Pyinstaller abrirá la imágen de carga, pero nunca la cerrará, para esto debemos llamar a un módulo de PyInstaller llamado `pyi_splash`. Debemos añadirlo dentro de nuestro archivo `main.py`, nuestro archivo fuente debería quedar así:

```python
import sys
import webbrowser
import pyi_splash
# Condicionar el import de tkinter de acuerdo a nuestra versión de Python.

if sys.version_info[0] == 3:
    from tkinter import Tk, Label, Button, Menu, Text, messagebox
else:
    from Tkinter import Tk, Label, Button, Menu, Text, messagebox

# Definir una clase para nuestra GUI.

class App(Tk):
    def __init__(self):
        super().__init__()
        self.title("Visita La Esquina Gris")
        self.geometry("400x400")
        
        self.label = Label(self, text="¡Visita La Esquina Gris!")
        self.label.pack()
        
        self.button = Button(self, text="Visitar en mi navegador", command=self.visit)
        self.button.pack()
        
    def visit(self):
        webbrowser.open("https://ventgrey.github.io")
        
# Inicializar la GUI.

app = App()

# Cerrar el splashscreen
pyi_splash.close()

app.mainloop()
```

Ahora, solo debemos añadir el parámetro `--splash` a nuestro comando de PyInstaller en el workflow de Windows y Linux (Voy a recortar el archivo para solo mostrar la parte reelevante):

```yaml
     - name: Construir los binarios para todos los sistemas operativos
        run: |
          pipenv run pyinstaller --windowed --name="App" --splash splash.png --onefile main.py
```

> En Linux debemos omitir --windowed

Ahora cada que ejecutemos nuestro programa, veremos un splash screen antes de que se muestre nuestra aplicación:

![carga](/img/posts/pyinstaller/carga.png)

## 11. [Extra] Loggear los errores de nuestro programa a un archivo

A veces, deberemos de loggear los errores de nuestro programa a un archivo, esto por si a alguno de nuestros usuarios le ocurre un error y nos lo quiere reportar, para no obligarlo a leer los errores del programa o simplemente preguntarle que pasó, podemos pedirle que nos envíe el archivo de log y listo.

Para loggear los errores a un archivo, podemos usar el módulo `logging` de Python. Este módulo nos permite crear archivos de log, además de poder enviar los errores a un servidor remoto, entre otras cosas.

Vamos a poner un botón de ejemplo para causar un error a propósito:

```python
import sys
import webbrowser
import traceback
import datetime
import pyi_splash

# Condicionar el import de tkinter de acuerdo a nuestra versión de Python.
if sys.version_info[0] == 3:
    from tkinter import Tk, Label, Button, Menu, Text, messagebox
else:
    from Tkinter import Tk, Label, Button, Menu, Text, messagebox

# Definir una clase para nuestra GUI.
class App(Tk):
    def __init__(self):
        super().__init__()
        self.title("Visita La Esquina Gris")
        self.geometry("400x400")
        
        self.label: Label = Label(self, text="¡Visita La Esquina Gris!")
        self.label.pack()
        
        self.button: Button = Button(self, text="Visitar en mi navegador", command=self.visit)
        self.button.pack()

        self.error_button = Button(self, text="Probar error", command=self.provoke_error)
        self.error_button.pack()
        
    def visit(self):
        webbrowser.open("https://ventgrey.github.io")

    def provoke_error(self):
        error: str = "Error de a mentis, maneja tus propios try-except"
        now = datetime.datetime.now()
        with open("registro.txt", "a") as file:
            file.write(f"Ocurrió un error {error} a las {now}\n")
        messagebox.showerror("Error", "Ha ocurrido un error, envie el archivo registro.txt al programador para ayudarle")

        
# Inicializar la GUI.
app: App = App()

# Cerrar el splashscreen
pyi_splash.close()

app.mainloop()
```

La GUI debería de mostrase así:

![error](/img/posts/pyinstaller/error.png)

Ahora procedemos a leer el archivo creado con Linux o con un bloc de notas:

```bash
cat registro.txt

Ocurrió un error: Error de a mentis, maneja tus propios try-except a las 2023-02-22 18:52:23.765906
```

Perfecto. Ahora, cada que ocurra un error en nuestro programa, se creará un archivo de log con la fecha y hora en la que ocurrió el error. Este archivo te lo podrá enviar el usuario para que puedas ver que pasó. Se más creativ@ que yo, usa tus propios bloques de `try` y `except` para manejar los errores de forma más elegante.

## 13. [Extra] Loggear los errores a una REST API para telemetría

Odio la telemetría. Sin embargo alguien aquí podría necesitar recibir los errores del programa en un servidor o algún lugar centralizado para poder analizar si su aplicación está funcionando bien o no para sus usuarios.

Como dije que odio la telemetría, no voy a explicar como hacer, configurar o asegurar un servidor para eso. Godspeed.

Si queremos que nuestro código de python podemos añadir lo siguiente a nuestro archivo `main.py`, no hace falta ponerlo todo, solo debemos hacer un cambio en dos partes del archivo. Primero es mportar la biblioteca `requests`:

```python
import requests
```

Después en la función `provoke_error` debemos de añadir lo siguiente:

```python
    def provoke_error(self):
        error: str = "Error de a mentis, maneja tus propios try-except"
        now = datetime.datetime.now()
        with open("registro.txt", "a") as file:
            file.write(f"Ocurrió un error {error} a las {now}\n")
        url: str = "https://api.example.com/log"
        headers: dict = {"Content-Type": "application/json"}
        data: dict = {
            "date": now,
            "error": error,
        }
        
        # Enviar petición POST a la API
        response = requests.post(url, headers=headers, json=data)
        
        # Revisar si la petición fue exitosa
        if response.status_code == 200:
            messagebox.showerror("Error", "Ha ocurrido un error, envie el archivo registro.txt al programador para ayudarle")
        else:
            messagebox.showerror("Error", "Ha ocurrido un error, envie el archivo registro.txt al programador para ayudarle")
```

No incluire como manejar la REST API o la seguridad de la misma. Como dije, godspeed. Especialmente si tu API no tiene autenticación o si hardcodeas los valores de la autenticación en el ejecitable final. Especialmente porque PyInstaller puede ser "decompilado" y, aunque revelar el código fuente no revela vulnerabilidades, probablemente tengas problemas después si no tuviste buenas prácticas de seguridad.

## Conclusión

Luego de un ratote de lectura, pruebas y errores hemos visto como podemos crear binarios de nuestra aplicación de Python para Linux, Windows y MacOS usando PyInstaller y GitHub Actions. Si bien TKinter no se ve muy bien en general, es una buena forma de crear interfaces gráficas para nuestros usuarios. Si queremos mejorar el aspecto de nuestra aplicación, podemos usar otras librerías como PyQt5, PySide2, PyGObject, etc. O podemos mejorar la aparencia de tkinter usando el módulo `ttkthemes` que nos permite usar temas para tkinter.

![themes](/img/posts/pyinstaller/themes.png)

Si deseas saber como dejar tu TKinter más tuneado que un Tsuru. Puedes consultar [esta guía](https://tkdocs.com/tutorial/styles.html).

Espero ver cosas interesantes de ti ahora que tienes este conocimiento nuevo :) Si tienes alguna duda o sugerencia, puedes abrir un *Issue* en el repositorio de este blog o contactarme en las redes que tengo ligadas aquí :D

Puedes encontrar el código fuente de este post en [GitHub](https://github.com/VentGrey/tkinter-githubactions). Lo he configurado como "Template" por si alguno de ustedes llega a necesitar realizar un proyecto así :) 

Si te gustó lo que leíste, puedes compartirlo con tus amigos o en redes sociales. ¡Nos leemos pronto!

### Canción triste del día

*A Leap Of Faith - The Incident*

![spotify]( /img/posts/pyinstaller/spotify.png)

---

¿Te gustan estos blogs? Ayúdame a seguir escribiéndolos de las siguientes formas:
- [Invítame un eloti](https://ko-fi.com/ventgrey)
- [Regálame un follow en GitHub ❤](https://github.com/VentGrey)
