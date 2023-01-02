---
title: "Escribir un CRUD en C (Cuarta edición)"
date: 2023-01-01
tags: ["C", "Tutoriales", "Programación"]
categories: ["Tutoriales", "Programación", "C"]
author: "VentGrey"
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "Con esta, sería la cuarta vez que posteo esta entrada con nuevas cosas. Retomaré el enfoque de antes. ¿Listo para ser un Mago de C?"
canonicalURL: "https://ventgrey.github.io/posts/crud-en-c"
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
    image: "/img/posts/crud/cover.png" # image path/url
    alt: "Imágen del post" # alt text
    caption: "Imágen del post" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/<path_to_repo>/content"
    Text: "Sugerir Cambios" # edit text
    appendFilePath: true # to append file path to Edit link
---

# Shit the bed again, typical...

Parece que algunas entradas mías simplemente no están destinadas a morir. Estaba a punto de darla por muerta para ser sincero.

Sin embargo, siento que sería un desperdicio dejar esto al aire y no preservar el conocimiento que llegué a tener en su momento para guiar a algunos ex-compañeros de la universidad en su búsqueda de la luz para crear un CRUD usando el lenguaje de programación C.

No me considero un experto en el lenguaje ni mucho menos, sin embargo, sería bastante útil recordar las cosas que hice y lo que les fui enseñando a lo largo de los años y no encontré una mejor excusa para hacerlo, así que aquí va. Retomaré el último enfoque que tuvo esta entrada de blog antes de morir, esto con un propósito fantasioso / didáctico.

Vamos a aprender a hacer este CRUD con C, para hacer algunos conceptos más entretenidos, vamos a cambiarlos por una historia algo medieval.

## Prólogo

En un lugar de internet, de cuyo dominio no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de teclado en bolsa, adarga antigua, rocín flaco y galgo corredor. Es decir, tu mero (o mera), pero en esta historia.

En este mundo no existen los programadores, pero si los magos, que son más o menos lo mismo. Sin embargo ambos deben lidiar con el mismo sufrimiento, todo lo que hagan deberá estar escrito en C (por el momento).

Tu, al ser novel en estas prácticas, acabas de conseguir tu primer tarea. No te preocupes, que no deberás hacerla por tu cuenta, este blog está aquí para ayudarte.

Vamos a ver que necesitaremos para comenzar con esta tarea de buenas a primeras...

## Tu equipo

El tutorial y el código lo hice en un sistema Gnu/Linux con las siguientes
herramientas:

- Sistema Operativo: `Debian GNU/Linux 12`
- Compilador: `gcc-12`
- Banderas del Compilador: `-Wall -Wpedantic -Wextra -Werror -std=c18`
- IDE: `VentMacs (Emacs + Evil + DOOM Layers)`

## RECOMENDACIONES Y CONSIDERACIONES

Si estás usando un sistema operativo tipo MS (Windows) te recomiendo usar
`MINGW` y el compilador `gcc`.

Evita usar IDE's obsoletos como DevC++ / Bloodshed DevC++ puesto que estos
tienen tecnologías obsoletas dentro de ellos y un compilador cuyo manejo de las direcciones de
memoria puede ser descrito como: *nauseabundo*. Es decir, son más feos que un coche por debajo.

Procura **NO** hacer *copy paste* del código, trata de entenderlo o hacer tus propias versiones, especialmente de las cosas que veas y consideres interesantes, el código es libre, si, pero dudo que tu profesor considere tu trabajo como válido si copias y pegas código de internet, dale puntos extra por enojarse si no entiendes ese código que copiaste y pegaste.

Otra cosa, al escribir este tutorial me daré el lujo de asumir que conoces la sintáxis básica del lenguaje de programación C. Salvo que esté usando algo muy específico o poco común para un programa primerizo no me detendré a explicar todo.

## ¿Qué es un CRUD?

Un CRUD (de las siglas: *CREATE, READ, UPDATE, DELETE*) es un programa capaz de
desempeñar las funciones básicas de cualquier base de datos, sean:  *Crear*,
*Leer*, *Actualizar* y *Borrar*. ¿(CLAB)? No, suena feo, quedémonos con *CRUD*.

Este tipo de programas nacen a partir de la necesidad de crear un lugar para almacenar datos cuya persistencia es de una importancia mayor o cuyo volúmen es demasiado como para mantenerlo almacenado en una memoria volátil (RAM). Es decir, para administrar datos que deseas conservar a mediano - largo plazo.

Veamos un programa sencillo:

```c
#include <stdio.h>

int main()
{
        char nombre[20];
        printf("Ingrese su nombre:\n");
        fgets(nombre, sizeof(nombre), stdin);
        
        printf("Su nombre es: %s\n", nombre);
        return 0;
}
```

En este caso el nombre del usuario se perderá (o será eliminado) cuando se termine la ejecución de nuestro programa, puesto que, es un dato que solamente se guardó en memoria y no tiene persistencia alguna. Si quisieramos tener un "libro" de contactos como en tiempos de antes, necesitaríamos una forma de hacer esos datos persistentes.

## Preparémonos

Primero crearemos un archivo donde trabajar, en este caso en especial no
utilizaré nada que involucre modularidad o cosas un poco más avanzadas en el
tema de C. Solo será un archivo plano con extensión `.c` explicado paso a paso.

Si te pierdes en el tutorial no hay problema, al final estará el código
completo.

## El problema

Ok, no podemos empezar a hacer un programa sin un problema inicial,
afortunadamente la naturaleza un tanto *geek* de los programadores nos facilita
las cosas al momento de inventar problemas. Y como ya dimos contexto unos párrafos antes, solo deberás seguirme el rollo en esta parte.

El problema a tratar es el siguiente:

> Una aldea muy lejana tiene un problema con monstruos, bandidos, dragones y
> hechiceros. Como los héroes del pueblo están regados el alcalde decidió hacer
> lo siguiente, contrató a un mago experto en *Magic-C* para que cree un tablero
> de anuncios donde los héroes puedan darse de alta, baja o modificar sus
> detalles si es que cometieron un error, además deberá de ser capaz de listar a
> los héroes registrados.
> 
> El boletín también deberá de ser capaz de permitir a los aldeanos colocar
> misiones y su recompensa en oro & experiencia para los héroes. ¿Puedes tú, un
> mago experto en *Magic-C* completar dicha hazaña?


#### Características del Héroe:

Los héroes para registrarse deberán tener los siguientes elementos:

- id (único)
- Nombre (20 chars MAX)
- Apodo (20 chars MAX)
- Clase (20 chars MAX)
- Habilidades (80 chars MAX)

#### Características de las Misiones:

Los aldeanos necesitarán de lo siguiente para registrar misiones para los héroes:

- id (único)
- Recompensa de misión
- Experiencia otorgada (Entero)
- Habilidades Necesarias

## Creando el CRUD

Vamos a empezar, primero necesitaremos crear un archivo `main.c` y comenzar a
editarlo, en el tutorial estaremos utilizando las bases del buen código en
C, que es prácticamente el estilo de código del kernel Linux un poco más acercado al estándar de C.

Si estás usando un IDE solo crea un nuevo proyecto y continúa con el tutorial.

Primero necesitaremos 2 bibliotecas escenciales para la creación de nuestro
CRUD

- `stdio.h` -> La biblioteca de entrada/salida estándar de C.
- `stdlib.h` -> La biblioteca estándar multipropósito de C.

Podemos incluirlas en nuestro archivo en la primera parte del mismo:

```c
#include <stdio.h>
#include <stdlib.h>
```

Ahora necesitaremos definir nuestros tipos de datos para Héroes y Misiones, como
son tipos de dato compuestos será necesario crear estructuras:

> Nota: Usar typedef aquí no es necesario realmente, al usarlo en estructuras su
> único propósito es el de renombrar y de evitar escribir la palabra "struct"
> antes de llamar a la misma (Realmente estamos creando un nuevo tipo). Esto nos ayudará a hacer el código un poco más legible.

```c
typedef struct {
        int id;
        char nombre[20];
        char apodo[20];
        char clase[20]
        char habilidades[20];
} Heroe;
```

![](https://steamuserimages-a.akamaihd.net/ugc/949601075013773584/58F0A18BB95CFDBE419D546F10B5A41D6714227D/)

Y del mismo modo para las Misiones:

```c
typedef struct {
        int id;
        double recompensa;
        int experiencia;
        char habilidades[80];
} Heroe;
```

Perfecto, así nos aseguraremos de guardar todo en un solo tipo de dato
unificado.

Bien, ahora necesitamos algunas funciones donde procesaremos las cosas,
primero necesitamos pensar ¿cómo decidiremos si vamos a ingresar, borrar, listar
o modificar datos?

La opción más simple es un menú principal donde toda opción aparezca, además,
necesitamos de funciones que nos ayuden a crear, eliminar, modificar y listar
las cosas dentro de nuestro programa. Esto nos dará una forma más sencilla de manejar nuestro código, pues, si se rompe una función solo debemos modificarla y el resto de nuestro código *idealmente* no debería de sufrir.

Al ser un CRUD no es algo complejo y como dijo un profesor de mi
universidad:

> "Todos los CRUD son iguales."

Así que, luego de nuestra declaración de tipos (structs) podemos comenzar a
incluir los prototipos de las funciones que necesitemos, en este caso la función
menú y las funciones *CRUD* tanto de Héroes como de Misiones:

```c
void menu();

void AltaHeroes();
void BajaHeroes();
void ModHeroes();
void ListHeroes();

void AltaMision();
void BajaMision();
void ModMision();
void ListMision();
```

Como estas funciones no necesitan regresar nada, todas serán de tipo `void`.

Bien, ahora dentro de nuestra función `main` llamaremos a nuestra función
`menu`, con esto el menú será lo primero que se ejecutará al iniciar nuestro
programa:

```c
// -- Función main
int main(void)
{
        menu();
        return 0;
}
```

> Es importante eliminar los argumentos dentro de la función `main`, pues
> utilizaremos E/S estándar y no parámetros por consola, así que con eso nos
> ahorraremos cuantos bytes. Además, al poner `void` en lugar de los argumentos indicaremos que, nuestro programa no acepta argumentos de línea de comandos. Cualquier parámetro que puedan pasarle simplemente será desechado.

## Creando el menú

Muy bien, ahora necesitamos crear nuestra función menú, primero viene la parte
divertida y es (Strong words incoming) crear *"vergos"* (sinónimo de *un chingo*) de `printf` para el
usuario final, por supuesto que el "diseño" del menú es libre, espero que tu puedas programar algo menos feo que yo, por lo pronto a mi se me ocurrió algo así:

```c
        int opcion, opcion2;
        printf("---------------HIRE-A-HERO--------------\n");
        printf("----------------------------------------\n");
        printf("           1) Heroes                    \n");
        printf("           2) Misiones                  \n");
        printf("           3) Salir                     \n");
        printf("----------------------------------------\n");
        printf("--------------------------------------..\n");
        scanf("%d",&opcion);
        printf("\n\n\n\n\n\n\n\n\n\n\n\n");
        printf("---------------HIRE-A-HERO--------------\n");
        printf("----------------------------------------\n");
        printf("           1) Alta                      \n");
        printf("           2) Baja                      \n");
        printf("           3) Modificación              \n");
        printf("           4) Listado                   \n");
        printf("           5) Volver al Menú            \n");
        printf("----------------------------------------\n");
        printf(" ---------------------------------------\n");
        scanf("%d",&opcion2);
        printf("\n\n\n\n\n\n\n\n\n\n\n\n");
```

Bien, pero... esto no funcionará a secas, necesitamos saber que hacer cuando el
usuario ingrese una opción además de manejar un error muy común: La entrada del
usuario por eso decidí usar 2 `switch` statements y todo meterlo en un ciclo
`do while`:

```c
void menu()
{
        int opcion, opcion2;
        do {
                printf("---------------HIRE-A-HERO--------------\n");
                printf("----------------------------------------\n");
                printf("           1) Heroes                    \n");
                printf("           2) Misiones                  \n");
                printf("           3) Salir                     \n");
                printf("----------------------------------------\n");
                printf("----------------------------------------\n");
                scanf("%d",&opcion);
                printf("\n\n\n\n\n\n\n\n\n\n\n\n");
                printf("---------------HIRE-A-HERO--------------\n");
                printf("----------------------------------------\n");
                printf("           1) Alta                      \n");
                printf("           2) Baja                      \n");
                printf("           3) Modificación              \n");
                printf("           4) Listado                   \n");
                printf("           5) Volver al Menú            \n");
                printf("----------------------------------------\n");
                printf(" ---------------------------------------\n");
                scanf("%d",&opcion2);
                printf("\n\n\n\n\n\n\n\n\n\n\n\n");

                switch (opcion) {
                case 1:
                        switch(opcion2) {
                        case 1:
                                AltaHeroes();
                                break;
                        case 2:
                                BajaHeroes();
                                break;
                        case 3:
                                ModHeroes();
                                break;
                        case 4:
                                ListHeroes();
                                break;
                        case 5:
                                menu();
                                break;
                        }
                        break;
                case 2:
                        switch(opcion2) {
                        case 1:
                                AltaMision();
                                break;
                        case 2:
                                BajaMision();
                                break;
                        case 3:
                                ModMision();
                                break;
                        case 4:
                                ListMision();
                                break;
                        case 5:
                                menu();
                                break;
                        }
                        break;
                case 3:
                        break;
                }
        } while (opcion!=5);
}
```

Listo, de esta manera el menú de abajo se compartirá, pues solo llamaremos a
funciones diferentes en el segundo menú via `opcion2` dependiendo de la variable
`opcion` y dentro de los ciclos manejaremos la entrada de una forma apropiada,
ya que, mientras la opción ingresada **NO** sea un 5 el menú seguirá apareciendo
o simplemente se morirá, así que el problema del usuario está resuelto.

Todo perfecto, ahora necesitamos una función para dar de alta a los Héroes,
necesitaremos de un lugar especial donde guardaremos los datos de los héroes.

## Alta

Como somos todos unos expertos en *Magic-C* utilizaremos archivos binarios y
guardaremos todo al final de la función, con ello aseguramos que cada entrada
será única y por lo tanto podría considerarse un registro separado de los demás
que podrá borrarse en cualquier momento.

Para la función `AltaHeroes` decidí hacer lo siguiente:

```c
void AltaHeroes()
{
        FILE *pf;
        Heroe heroes;
        pf = fopen("Heroes.dat","ab");

        printf("Ingrese el id del heroe\n");
        scanf("%i" ,&heroes.id);

        printf("Ingrese el nombre del heroe\n");
        scanf("%s", heroes.nombre);

        printf("Ingrese el apodo del heroe\n");
        scanf("%s", heroes.apodo);

        printf("Ingrese la clase del heroe\
 (Ladrón, Caballero, Hechicero, etc)\n");
        scanf("%s", heroes.clase);

        printf("Ingrese la habilidades que el héroe posee\n");
        scanf("%s", heroes.habilidades);

        fseek(pf, 0L, SEEK_END);
        fwrite(&heroes, sizeof(Heroe), 1, pf);
        fclose(pf);
        
        printf("\n\n\n\n\n\n\n\n\n\n\n\n");
        menu();
}
```

Ok, una vez se llama a la función crearemos un apuntador a un archivo y un nuevo
"Héroe", luego crearemos un archivo binario y posteriormente pasaremos a pedir
la entrada de datos del usuario para nuestro héroe, después pasamos a
utilizar la función `fseek()`, la cual posicionará un "cursor" (no realmente)
dentro del archivo en la posición que deseemos.

> `fseek()` Sitúa el puntero de lectura/escritura de un archivo en la posición indicada.

> La función requiere, en primer lugar, el handle o identificador de archivo devuelto por la función fopen() al abrirlo.

> En segundo lugar se especifica la nueva posición en la que debe situarse el puntero del archivo. Tras llamar a esta función, todas las operaciones de lectura o escritura que se efectúen, lo harán a partir de esta posición.

> Como último parámetro se debe indicar el modo en el que se especifica la nueva posición del puntero, puede ser uno de estos tres:

> SEEK_SET // Posición respecto al inicio del archivo  (0)

> SEEK_CUR // Incremento relativo a la posición actual (1)

> SEEK_END // Posición respecto al final del archivo   (2)

> Fuente: http://cdiv.sourceforge.net/cdivhlp/const_SEEK.htm

Finalmente escribimos los cambios en el archivo con `fwrite()`.

Antes de que se me olvide, **SIEMPRE CIERRA TUS ARCHIVOS**, `fclose()` no se llama solo así que, a menos de que odies a tu memoria volátil sugiero que cuides mucho esa parte.

Luego de imprimir un centenar de `newlines` podemos volver a llamar a la función `menu` para una nueva instrucción.

## Listado

Ahora vamos a crear una pequeña función para listar los héroes que el usuario haya ingresado, en caso de no ingresar nada solo se mostrará una pantalla vacía así que nos ahorramos el problema de trabajar con arreglos.

```c
void ListHeroes()
{
        FILE *pf;
        Heroe heroes;
        pf = fopen("Heroes.dat","rb");
        fread(&heroes, sizeof(Heroe), 1, pf);
        while (!feof(pf)) {
                printf("%i ; %s ; %s ; %s ; %s\n",heroes.id,heroes.nombre,
                       heroes.apodo,heroes.clase,heroes.habilidades);
                fread(&heroes, sizeof(Heroe), 1, pf);
        }
        fclose(pf);
}
```

Listo, abrimos nuestro archivo, leemos todas las entradas y nos mantendremos imprimiendo todas las entradas del archivo, al menos hasta llegar a la línea final del mismo.

Posteriormente cerramos el archivo abierto y la función termina.


## Modificación de datos

Podemos ingresar y listar datos pero...¿qué pasa si nos equivocamos? ¿Sería el fin del mundo?

Esperemos que no, así que hagamos una función para modificar las entradas anteriores.

```c
void ModHeroes()
{
        FILE *pf,*pfaux;
        Heroe heroes;
        int codigoaux;

        pf = fopen("Heroes.dat","rb");
        pfaux = fopen("Heroesaux.dat","ab");

        printf("Ingrese el ID a modificar\n");
        scanf("%i",&codigoaux);
        fread(&heroes, sizeof(Heroe), 1, pf);

        while (!feof(pf)) {
                if (heroes.id != codigoaux) {
                        fseek(pfaux,0l,SEEK_END);
                        fwrite(&heroes,sizeof(Heroe),1,pfaux);
                } else {
                        printf("Ingrese el nombre\n");
                        scanf("%s",heroes.nombre);
                        printf("Ingrese un nuevo apodo\n");
                        scanf("%s",heroes.apodo);
                        printf("Ingrese la clase\n");
                        scanf("%s",heroes.clase);
                        printf("Ingrese las habilidades\n");
                        scanf("%s",heroes.habilidades);
                        fseek(pfaux, 0l, SEEK_END);
                        fwrite(&heroes, sizeof(Heroe), 1, pfaux);
                }
                fread(&heroes,sizeof(Heroe),1,pf);
        }
        fclose(pf);
        fclose(pfaux);
        remove("Heroes.dat");
        rename("Heroesaux.dat","Heroes.dat");
}
```

La función de modificación es muy parecida a la de altas, solo que aquí no
pediremos un cambio en el ID del héroe pues establecimos que sería único, además
de que lo utilizaremos como un término de búsqueda para encontrar el registro
que deseamos cambiar en nuestro pequeño archivo binario, además de que creamos
dos archivos, uno de ellos es un archivo auxiliar donde se escriben los cambios
y en su lugar reemplaza al archivo anterior.

## OBLITERANDO HEROES

Si tenemos héroes cobardes tendremos que darles la opción para correr, así que
crearemos una función para dar de baja a uno o varios héroes de nuestro archivo
binario: 

```c
void BajaHeroes()
{
        FILE *pf,*pfaux;
        Heroe heroes;
        int codigoaux;

        pf = fopen("Heroes.dat","rb");
        pfaux = fopen("Heroesaux.dat","ab");

        printf("Ingrese el ID a buscar\n");
        scanf("%i",&codigoaux);

        fread(&heroes, sizeof(Heroe), 1, pf);
        while (!feof(pf)) {
                if (heroes.id != codigoaux) {
                        fseek(pfaux, 0l, SEEK_END);
                        fwrite(&heroes, sizeof(Heroe), 1, pfaux);
                }
                fread(&heroes,sizeof(Heroe),1,pf);
        }

        fclose(pf);
        fclose(pfaux);
        remove("Heroes.dat");
        rename("Heroesaux.dat","Heroes.dat");
}
```

Al igual que la función de modificación necesitaremos crear un archivo auxiliar, buscar el ID del héroe que deseamos eliminar y finalmente buscar por todo el archivo hasta dar con el héroe que deseamos eliminar y finalmente eliminamos el bloque completo, cerramos nuestros punteros y reemplazamos los archivos.


# Conclusión:

Luego de crear todas nuestras funciones podemos compilar nuestro archivo y
comenzar a probarlo sin pena ni gloria.

En mi caso compilé el archivo de manera manual utilizando el comando:

`gcc -Wall -Wpedantic -Wextra -std=c18 main.c`

Si deseas usar gcc:

`gcc -Wall -Wpedantic -Wextra -std=c18 main.c`

> C18 solo está disponible en gcc-9 o superior y clang-9 o superior, en caso de no contar con ellos
> puedes cambiarlo a C99 con `-std=c99`.

Si, estoy consciente de que no cubrí la parte de las "Misiones" en el blog y lo hice completamente intencional, pues la diferencia entre funciones es mínima y básicamente solo es cambiar `printf()`'s y `scanf()`'s así que ponerlas aquí solo sería inflar la longitud del blog.

Si pusiste atención al inicio del tutorial, te darás cuenta de que, en la función donde ejemplifiqué el caso de uso de un CRUD. Cambié el uso de `scanf()` por `fgets()`. Aun así seguí usando `scanf()` en mis funciones. Ahora es tu turno, te propongo un reto.

- ¿Puedes mejorar el código que acabamos de ver? Esto implica cambiar los `scanf` por `fgets` y hacer otras mejoras para acercarnos a tener un CRUD lo más [*memory safe*](https://es.wikipedia.org/wiki/Seguridad_de_memoria) posible.

- ¿Puedes evitar usar *vergos* de saltos de línea para "limpiar" la pantalla? Entiendo a donde vas, siempre puedes usar `system("clear")`, PERO el reto está en limpiar la pantalla con una función SIN perder la portabilidad de C, es decir, no deberá estar ligada a un solo sistema operativo.

De igual forma el [código fuente](https://gist.github.com/VentGrey/0d3ea52e2d181da113a447a3845a4e20) siempre estará disponible.

---

¿Te gustan estos blogs? Ayúdame a seguir escribiéndolos de las siguientes formas:
- [Invítame un café 🍵](https://ko-fi.com/ventgrey)
- [Regálame un follow en GitHub ❤](https://github.com/VentGrey)
