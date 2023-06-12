---
title: "(Re) Escribir un CRUD en Go. Y un poco más."
date: 2023-05-05
tags: ["Programación", "Tutoriales", "Go", "Desarrollo de software", "Distribución de software", "Ejecutables", "Linux"]
categories: ["Programación", "Tutoriales", "Go"]
author: "VentGrey"
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "Dudo que Go sea un sustituto digno de C. Es un lenguaje interesante y (para algunos casos) un buen sustituto a Python o lenguajes un poco más inflados, a falta de otro término más apropiado."
canonicalURL: "https://ventgrey.github.io/posts/crud-en-go-y-extras/"
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
    image: "/img/posts/crudgo/cover.png" # image path/url
    alt: "Imágen del post" # alt text
    caption: "Imágen del post" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/<path_to_repo>/content"
    Text: "Sugerir Cambios" # edit text
    appendFilePath: true # to append file path to Edit link
---

# ¿Tu solo sabes hacer CRUDS?

La verdad sea dicha, simón. Las operaciones CRUD forman parte del software que usamos en todo momento y, de una u otra forma son necesarias para el manejo sencillo de los datos que están dentro de un sistema. La lógica detrás de estas operaciones es bastante sencilla, sin embargo, se da por hecho que todos conocen que todos conocen las operaciones clásicas de una base de datos o la capa de persistencia de un sistema.

Luego de publicar al menos unas 15 veces mi pedorrísimo tutorial de cómo hacer un CRUD en C y una docena de canciones de Alcest, me decidí a escribir una versión pero con un giro diferente. Intentaré portar mi código de C a Go, buscar si existen shorthands o formas más eficientes de hacer las cosas y, por supuesto, explicar el código. (Los shorthands son los que yo conozco, aforutnadamente Go tiene muy poca "syntax sugar" y al tener una sintaxis muy hermética, es fácil de entender).

## Y cuando todos sean súper...nadie va a ser

Go es uno de los pocos lenguajes que conozco que logran tener un estilo de código extrañamente uniforme, (casi) sin importar quien lo escriba, si sabes las bases sintácticas de Go, seguramente no tendrás un problema para entender los bugs de otro programador.

Vivir en un mundo donde todos programan igual de feo. Un panorama hermoso si me lo preguntas.

Para este tutorial no utilizaré una analogía de magos como en C. La razón de esto es sencilla, para programar bien en C se necesita ser un mago. Pero Go anda tirando pal' monte, no tiene magia alguna un lenguaje como este.

## Stack de tecnologías

Vamos a ver lo que utilicé para escribir este tutorial, todo hecho en un sistema Gnu/Linux con las siguientes herramientas:

- Sistema Operativo: Debian Gnu/Linux 12 (Bookworm)
- Compilador: Go 1.19.6
- Banderas de compilación: ` -ldflags="-s -w"` (para reducir el tamaño del binario en "producción").
- IDE: Emacs (El único e inigualable)

**EXTRAS**

Si te interesa, además de cubrir el proceso básico de como hacer el CRUD, también cubriré como distribuirlo, crear una página de manual, usar un sistema de construcción como Gnu Make y, por supuesto, como crear un paquete para tu distribución favorita. Si te interesa quedarte a verlos todos, adelante:

- Godoc para documentar el código.
- Docker o Podman para contenedores.
- Gnu Make para construir el proyecto.
- Groff para crear la página de manual.
- Añadir "banderas" de compilación para sellitos de calidad pedorros en el código o "features" premium.

## Recomendaciones y Consideraciones

Si estás utilizando MacOS puedes usar Homebrew para instalar Go en tu computadora. Si tienes Windows, que Dios se apadie de ti hij@, por que ahí no le se al cacaposting. Si tienes una distribución de Linux, puedes usar tu gestor de paquetes favorito para instalar Go. (Yo uso Debian, así que me valió madre y lo instalé desde APT).


Muchos de los editores modernos ya tienen soporte para Go, pero si quieres usar Emacs, puedes usar el paquete `go-mode` para tener soporte para Go, si lo combinas con `lsp-mode` y `lsp-ui` tendrás un IDE bastante decente para Go. (Necesitarás instalar un LSP para Go como `gopls` o `go-langserver` para que lsp-mode funcione).

Bueno, vamos a empezar. También me di el lujo de intentar un "nuevo" estilo de comentarios para los tutoriales feos de este blog. Espero que no de cringe leerlo en el código o en la documentación generada por Godoc. Si lo da, ni Pedro, dijo Juan, dejaré de usarlo.

## ¿Qué es un CRUD?

Ya lo respondí [aquí](https://ventgrey.github.io/posts/crud-en-c/#qu%C3%A9-es-un-crud).

## El problema a resolver

Dije que no contaría una historia porque no se necesita ser mago para escribir Go.

Supongamos que tienes un amigo muy "alucín" que tiene una idea millonaria, el tipo leyó un blog muy extraño donde alguien hacía un CRUD en C y se le ocurrió hacer un CRUD en Go porque es más nuevo, tiene más cosas, lo usa Google, su influencer de tech twitter ya tiene como 10 vídeos de eso y encima, la cosa azul que tiene como mascota le encanta.

Naturalmente, tú como buen programador siempre dispuesto al avance y ventaja de la humanidad, escuchaste la idea completa de tu amigo el "alucín" y decidiste hacer el CRUD en Go. PERO sin decirle, porque la idea ya la sacaste gratis y como tu si sabes implementarla, mejor quédate con el crédito xD

> Las "ideas millonarias", no existen. Si existieran, no serían ideas, serían productos ya en el mercado.

Vamos a tumbarle el changarro a nuestro amigo el "alucín" y vamos a hacer un CRUD en Go que bien podría hacerle frente a los programas ofrecidos por empresas como Red Hat, Oracle, Microsoft, Google, etc.

Cuando tu amigo estaba de "alucín", te contó que el tipo del blog hizo una analogía a héroes y misiones. Como tú si sales a la calle, decidiste hacerlo de productos para una tienda de café. (Porque el café es delicioso).

Vamos a ver las cosas que vamos a manejar en nuestro sistema:

- Bebidas
    - id (int)
    - nombre (string)
    - precio (float)
    - cantidad (int)
    
- Comidas
    - id (int)
    - nombre (string)
    - precio (float)
    - cantidad (int)
    - ingredientes (array de strings)

y ya, de lo contrario, me voy a llevar la vida haciendo este tutorial. Vamos a ver que cosas necesita hacer nuestro sistema:

- Crear una bebida
- Crear una comida
- Leer una bebida
- Leer una comida
- Actualizar una bebida
- Actualizar una comida
- Eliminar una bebida
- Eliminar una comida

**🌟 Premium features for just $9.99 🌟**

- Emitir un "ticket" en PDF con el pedido.
- Por $19.99 más, poder guardar tus datos como csv o json.
- Software único con su propia firma digital.

Las features "premium" serán los extras del tutorial. Si quieres verlos, adelante, si no, no pasa nada, puedes seguir el tutorial sin ellos hasta que terminemos el CRUD. (Obvio, espero que no pienses que quiero vender esta basurota de producto, pero, podrías integrarle prácticas similares a un producto tuyo si quieres venderlo por "piezas" o "módulos").

## Creando el proyecto

A diferencia de como hicimos con C, no seguiremos el camino de crear solamente un archivo `main.go` y ya. Si se puede y Go no tiene problemas con ello, pero, por amor de horror, vamos a usar los módulos de Go.

Primero vamos a crear el directorio donde vamos a trabajar, en mi caso, lo voy a llamar `cafe`:

    $ mkdir cafe
    $ cd cafe
    
Ahora vamos a crear el archivo `go.mod`:

    $ go mod init cafe

Esto creará el archivo `go.mod` y lo llenará con la información necesaria para que Go sepa que estamos trabajando en un módulo. Por ahora eso será suficiente para trabajar en paz. Ahora es momento de crear el archivo principal de nuestro proyecto, el `main.go`:

    $ touch main.go
    
Ahora si, tenemos todo para ganar, abre el archvo main.go con tu editor de texto favorito y escribe lo siguiente:

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

## Creando las estructuras necesarias

Lo que acabas de ver es el famoso "Hola Mundo" en Go. Vamos a comenzar a trabajar encima de esto y construir nuestro CRUD desde cero.

Similar a como hicimos en C, necesitamos incluir una biblioteca que nos permita interactuar con la entrada y salida estándar. En este caso, la biblioteca que vamos a usar es `fmt` (Format). Esta biblioteca nos permite imprimir cosas en la salida estándar y leer cosas de la entrada estándar. (Si, es lo mismo que `stdio.h` en C).

Para incluirla usamos la línea que dice: `import "fmt"`. Ahora, vamos a definir una estructura para nuestras bebidas y comidas. Para eso, debemos expandir nuestro código, arriba de la función `main` vamos a escribir lo siguiente:

```go
type Bebida struct {
    id int
    nombre string
    precio float64
    cantidad int
}
```

y hacemos lo mismo para las comidas:

```go
type Comida struct {
    id int
    nombre string
    precio float64
    cantidad int
    ingredientes []string
}
```

De buenas a primeras podemos ver que a diferencia de C, Go tiene tipos de datos existentes para los `string` cosa que en C, debemos definir nosotros mismos. La otra diferencia es la forma de declarar las estructuras, en C usamos `struct` y en Go usamos `type` seguido del identificador de la estructura y `struct` con los campos que va a tener la estructura.

Otra cosa es que, podemos elegir el tamaño de los datos que vamos a usar, en este caso, vamos a usar `int` para los números enteros y `float64` para los números con decimales. Si, no hay `float` en Go, solo `float32` y `float64`, los enteros tienen diferentes clasificaciones, en este caso `int` es realmente un `uint64` (Unsigned Int 64 bits), pero, no te preocupes, no vamos a usar números tan grandes.

## Vamos a hacer un menú de opciones.

Al igual que en C vamos a hacer una "interfaz" para los usuarios. Para eso vamos a imitar lo que hacen muchos toolkits gráficos o "TUI"/"GUI", vamos a hacer algo conocido como "main loop".

Un "main loop" es un bucle infinito que se ejecuta hasta que el usuario decide salir del programa. En este caso, vamos a hacer un menú de opciones que nos permita elegir que queremos hacer, mientras el usuario no elija la opción de salir, el programa seguirá ejecutándose.

Así es como funcionan las ventanitas que usas a diario en tu computadora, el programa principal se queda esperando a que el usuario haga algo, y cuando lo hace, el programa principal se encarga de manejar la acción que el usuario hizo. En escencia, es un ciclo infinito que procesa una cola de mensajes que el usuario envía al programa principal.

Para hacer este menú, vamos a pedirle un poco de ayuda a ChatGPT usando el código del menú que tenía hecho en C:

![ChatGPT](/img/posts/crudgo/chatgpt1.png)

> Horrores ortográficos, gramaticales y de puntuación 😎 como todo un profesional.

y me entregó una chulada de menú portado a Go. El menú principal es el siguiente:

```go
fmt.Println("🍔🍹 BIENVENIDOS A NUESTRO RESTAURANTE 🍺🍕")
fmt.Println("-----------------------------------------")
fmt.Println("            1️⃣ Comidas                  ")
fmt.Println("            2️⃣ Bebidas                  ")
fmt.Println("            3️⃣ Salir                    ")
fmt.Println("-----------------------------------------")
fmt.Println("🍽️ Elija una opción: ")
```

Para comidas y bebidas se ve así:

```go
// Comidas
fmt.Println("🍔🍕 COMIDAS 🍟🥪")
fmt.Println("-----------------------------------------")
fmt.Println("            1️⃣ Alta                     ")
fmt.Println("            2️⃣ Baja                     ")
fmt.Println("            3️⃣ Modificación             ")
fmt.Println("            4️⃣ Listado                  ")
fmt.Println("            5️⃣ Volver al Menú           ")
fmt.Println("-----------------------------------------")
fmt.Println("🍽️ Elija una opción: ")

// Bebidas
fmt.Println("🍹🍺 BEBIDAS ☕🍷")
fmt.Println("-----------------------------------------")
fmt.Println("            1️⃣ Alta                     ")
fmt.Println("            2️⃣ Baja                     ")
fmt.Println("            3️⃣ Modificación             ")
fmt.Println("            4️⃣ Listado                  ")
fmt.Println("            5️⃣ Volver al Menú           ")
fmt.Println("-----------------------------------------")
fmt.Println("🍽️ Elija una opción: ")
```

Naturalmente, decidí darle las gracias como es debido:

![ChatGPT](/img/posts/crudgo/chatgpt2.png)

Como puedes apreciar, la forma de escribir a la salida estándar es muy similar a C, pero, en este caso tenemos muchísimas más opciones, fmt en Go está muy completa y nos permite usar `Print` para imprimir cosas en la salida estándar, `Scan` para leer cosas de la entrada estándar, `Sprintf` para formatear strings, `Sscanf` para leer strings formateados, `Fprint` para imprimir cosas en un archivo, `Fscan` para leer cosas de un archivo, etc.

Bueno, si leíste mi blog sobre el CRUD en C, sabrás que, vamos a usar todo este desmadre para crear un menú de opciones decente. Vamos a meter esto en una función llamada `menu`:

```go
func menu() {
    var opcion, opcion2 int
    
    for {
        fmt.Println("🍔🍹 BIENVENIDOS A NUESTRO RESTAURANTE 🍺🍕")
		fmt.Println("-----------------------------------------")
		fmt.Println("            1️⃣ Comidas                  ")
		fmt.Println("            2️⃣ Bebidas                  ")
		fmt.Println("            3️⃣ Salir                    ")
		fmt.Println("-----------------------------------------")
		fmt.Println("🍽️ Elija una opción: ")
        
        fmt.Scanln(&opcion)
        fmt.Println("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")
        
        switch opcion {
            case 1:
                fmt.Println("🍔🍕 COMIDAS 🍟🥪")
                fmt.Println("-----------------------------------------")
                fmt.Println("            1️⃣ Alta                     ")
                fmt.Println("            2️⃣ Baja                     ")
                fmt.Println("            3️⃣ Modificación             ")
                fmt.Println("            4️⃣ Listado                  ")
                fmt.Println("            5️⃣ Volver al Menú           ")
                fmt.Println("-----------------------------------------")
                fmt.Println("🍽️ Elija una opción: ")
                    
                fmt.Scanln(&opcion2)
                fmt.Println("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")
                
                switch opcion2 {
                    case 1:
                        fmt.Println("Alta de comidas")
                    case 2:
                        fmt.Println("Baja de comidas")
                    case 3:
                        fmt.Println("Modificación de comidas")
                    case 4:
                        fmt.Println("Listado de comidas")
                    case 5:
                        fmt.Println("Volviendo al menú principal")
                    default:
                        fmt.Println("Opción inválida, por favor elija una opción válida")
                }
                
            case 2:
                fmt.Println("🍹🍺 BEBIDAS ☕🍷")
                fmt.Println("-----------------------------------------")
                fmt.Println("            1️⃣ Alta                     ")
                fmt.Println("            2️⃣ Baja                     ")
                fmt.Println("            3️⃣ Modificación             ")
                fmt.Println("            4️⃣ Listado                  ")
                fmt.Println("            5️⃣ Volver al Menú           ")
                fmt.Println("-----------------------------------------")
                fmt.Println("🍽️ Elija una opción: ")
                    
                fmt.Scanln(&opcion2)
                fmt.Println("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")
                
                switch opcion2 {
                    case 1:
                        fmt.Println("Alta de bebidas")
                    case 2:
                        fmt.Println("Baja de bebidas")
                    case 3:
                        fmt.Println("Modificación de bebidas")
                    case 4:
                        fmt.Println("Listado de bebidas")
                    case 5:
                        fmt.Println("Volviendo al menú principal")
                    default:
                        fmt.Println("Opción inválida, por favor elija una opción válida")
                }
        }
    }
}
```

> De nuevo el bug del formateo. Espero que si le das al botón de copy, al pegar no te de problemas.

Con todo y todo, nuestro código al final debería verse así:

```go
package main

import "fmt"

type Bebida struct {
	id int
	nombre string
	precio float64
	cantidad int
}

type Comida struct {
	id int
	nombre string
	precio float64
	cantidad int
	ingredientes []string
}

func main() {
	menu()
}

func menu() {
    var opcion, opcion2 int

    for {
        fmt.Println("🍔🍹 BIENVENIDOS A NUESTRO RESTAURANTE 🍺🍕")
		fmt.Println("-----------------------------------------")
		fmt.Println("            1️⃣ Comidas                  ")
		fmt.Println("            2️⃣ Bebidas                  ")
		fmt.Println("            3️⃣ Salir                    ")
		fmt.Println("-----------------------------------------")
		fmt.Println("🍽️ Elija una opción: ")

        fmt.Scanln(&opcion)
        fmt.Println("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")

        switch opcion {
            case 1:
                fmt.Println("🍔🍕 COMIDAS 🍟🥪")
                fmt.Println("-----------------------------------------")
                fmt.Println("            1️⃣ Alta                     ")
                fmt.Println("            2️⃣ Baja                     ")
                fmt.Println("            3️⃣ Modificación             ")
                fmt.Println("            4️⃣ Listado                  ")
                fmt.Println("            5️⃣ Volver al Menú           ")
                fmt.Println("-----------------------------------------")
                fmt.Println("🍽️ Elija una opción: ")

                fmt.Scanln(&opcion2)
                fmt.Println("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nn\n\n\n\n\n\n\n\n")

                switch opcion2 {
                    case 1:
                        fmt.Println("Alta de comidas")
                    case 2:
                        fmt.Println("Baja de comidas")
                    case 3:
                        fmt.Println("Modificación de comidas")
                    case 4:
                        fmt.Println("Listado de comidas")
                    case 5:
                        fmt.Println("Volviendo al menú principal")
                    default:
                        fmt.Println("Opción inválida, por favor elija una opción válida")
                }

            case 2:
                fmt.Println("🍹🍺 BEBIDAS ☕🍷")
                fmt.Println("-----------------------------------------")
                fmt.Println("            1️⃣ Alta                     ")
                fmt.Println("            2️⃣ Baja                     ")
                fmt.Println("            3️⃣ Modificación             ")
                fmt.Println("            4️⃣ Listado                  ")
                fmt.Println("            5️⃣ Volver al Menú           ")
                fmt.Println("-----------------------------------------")
                fmt.Println("🍽️ Elija una opción: ")

                fmt.Scanln(&opcion2)
                fmt.Println("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")

                switch opcion2 {
                    case 1:
                        fmt.Println("Alta de bebidas")
                    case 2:
                        fmt.Println("Baja de bebidas")
                    case 3:
                        fmt.Println("Modificación de bebidas")
                    case 4:
                        fmt.Println("Listado de bebidas")
                    case 5:
                        fmt.Println("Volviendo al menú principal")
                    default:
                        fmt.Println("Opción inválida, por favor elija una opción válida")
                }
        }
    }
}
```

Ya teniendo nuestra "main loop" pedorra, vamos a empezar a crear las funciones que nos permitan dar de alta, baja, modificación y listado de bebidas y comidas.

## Alta de bebidas y comidas.

> **NOTA: AQUÍ SOLO VOY A HACER UN EJEMPLO DE FUNCIÓN, NO HARÉ LAS DOS DE ALTA PORQUE NO ES REELEVANTE.**

Vamos a crear una nueva función que maneje el alta de comidas. (Porque es la que tiene el atributo de ingredientes que es un array de strings). Vamos a ver como quedaría la función:

```go
func altaComida() {
	var comida Comida

	fmt.Println("Ingrese el id de la comida: ")
	fmt.Scanln(&comida.id)

	fmt.Println("Ingrese el nombre de la comida: ")
	fmt.Scanln(&comida.nombre)

	fmt.Println("Ingrese el precio de la comida: ")
	fmt.Scanln(&comida.precio)

	fmt.Println("Ingrese la cantidad disponible de comida: ")
	fmt.Scanln(&comida.cantidad)

	for {
		var ingrediente string

		fmt.Println("Ingrese un ingrediente de la comida o 'fin' para finalizar: ")
		fmt.Scanln(&ingrediente)

		if ingrediente == "fin" {
			break
		}
		comida.ingredientes = append(comida.ingredientes, ingrediente)
	}
	fmt.Printf("Se registró la comida con id: %d, nombre: %s, precio: %f, cantidad: %d, ingredientes: %v", comida.id, comida.nombre, comida.precio, comida.cantidad, comida.ingredientes)

	menu()
}
```

Vamos a explicar la función. Para empezar, inicializamos una variable llamada "comida", con el tipo de dato "Comida" que declaramos antes. A diferencia de C, Go es un lenguaje que maneja la memoria de forma segura, y todas las estructuras de datos que se declaren "asi nomás", tienen valores por defecto en sus atributos. En este caso, los atributos de la estructura "Comida" son:

```go
type Comida struct {
    id          int
    nombre      string
    precio      float64
    cantidad    int
    ingredientes []string
}
```

Es decir, los atributos por defecto de la estructura "Comida" son:

```go
id = 0
nombre = ""
precio = 0.0
cantidad = 0
ingredientes = []
```

Esto nos permite inicializar estructuras de forma "segura" en nuestro código sin necesidad de un método "new" o de un constructor en el caso de los lenguajes que dan cáncer. 

La siguiente parte no es realmente compleja de entender, simplemente estamos pidiendo al usuario que ingrese los datos de la comida, y los vamos guardando en la estructura "comida".

> "Duh", dijo la Billie Eilish.

¿Por qué elegí la estructura "Comida" para rellenar y no la de "Bebida"? Simple, por el arreglo de strings que es `ingredientes`. Leerlo en C sería algo así (Mis habilidades de C ya están oxidadísimas, disculpen si cometo alguna blasfemia en el código):

> Banda que programa en lenguajes interpretados, no miren. Esto es como un cuento de terror de Horacio Quiroga para ustedes...no se crean, los tqm.

```c
// La estructura podría verse así. Porfis no usen typedef en las estructuras.

typedef struct {
    int id;
    char nombre[50];
    float precio;
    int cantidad;
    char** ingredientes;
    int cantIngredientes;
} Comida;

// Función recortadisima solo para lo importante.

void altaComida()
{
        Comida comida;
        char ingrediente[50];
        // -- Recortado --
        comida.ingredientes = malloc(sizeof(char*)); // Esto es como una "lista" de strings en C.
        comida.cantIngredientes = 0; // Esto es para saber cuantos strings hay en la lista. Es como un string.length pero de hombres.
        
        while (1) {
                printf("Ingrese un ingrediente de la comida o 'fin' para finalizar: ");
                scanf(" %[^\n]", ingrediente);

                if (strcmp(ingrediente, "fin") == 0) {
                    break;
                }
                
                comida.ingredientes = realloc(comida.ingredientes, (comida.cantIngredientes + 1) * sizeof(char*)); // Asignamos memoria para un nuevo ingrediente
                comida.ingredientes[comida.cantIngredientes] = malloc((strlen(ingrediente) + 1) * sizeof(char)); // Asignamos memoria para el string del nuevo ingrediente
                strcpy(comida.ingredientes[comida.cantIngredientes], ingrediente); // Copiamos el string del ingrediente a la lista de ingredientes.
                comida.cantIngredientes++; // Aumentamos la cantidad de ingredientes en la lista.
        }

        printf("Se registró la comida con id: %d, nombre: %s, precio: %f, cantidad: %d, ingredientes: [", comida.id, comida.nombre, comida.precio, comida.cantidad);
    
        for (int i = 0; i < comida.cantIngredientes; i++) {
                printf("%s", comida.ingredientes[i]);
                if (i < comida.cantIngredientes - 1) {
                        printf(", ");
                }
        }
        
        printf("]\n");

        for (int i = 0; i < comida.cantIngredientes; i++) {
                free(comida.ingredientes[i]);
        }
        
        free(comida.ingredientes); // No olvidemos liberar la memoria de la lista de ingredientes manualmente. (al igual que comida.ingredientes arriba). Es importante siempre hacer un free de la memoria que se asigna con malloc o realloc. SIEMPRE.
}

```

¿Ahora entiendes lo bonito que es Go para estas cosas? Es simple, pero a la vez es lo suficientemente "expresivo" para dar a entender las operaciones que estamos realizando. Dentro de ese ciclo `for{}` que hicimos, solamente declaramos una variable `ingrediente` de tipo `string`. Esto nos sevirá porque, en cada iteración, el usuario ingresará un ingrediente, si escribe la palabra "fin", el ciclo se romperá y se guardará la comida. Si no, se guardará el ingrediente en la lista de ingredientes de la comida.

Pero falta algo. ¿Cómo vamos a guardar la comida en la lista de comidas? Sencillo, amos a hacer que la misma función altaComida() guarde nuestros datos ingresados en un archivo `comida.txt`. Solo hace falta añadir estas líneas al final de la función, antes de llamar a `menu()`:

```go
file, err := os.OpenFile("comida.txt", os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)

if err != nil {
    fmt.Println("¡Ocurrió un error al abrir/crear el archivo comida.txt!")
    fmt.Println(err)
    return
}

defer file.Close()

fmt.Fprintf(file, "id: %d\nnombre: %s\nprecio: %f\ncantidad: %d\ningredientes: %v\n\n", comida.id, comida.nombre, comida.precio, comida.cantidad, comida.ingredientes)

fmt.Printf("Se registró la comida con id: %d, nombre: %s, precio: %f, cantidad: %d, ingredientes: %v", comida.id, comida.nombre, comida.precio, comida.cantidad, comida.ingredientes)
```

¿Por qué decidí explicar esta parte por separado? Bueno, la manipulación del sistema operativo y sobre todo el manejo de errores en Go es un poco...diferente...única...FEO! FEO COMO UN COCHE POR ABAJO!, sin embargo, es lo que tenemos y debemos aprender a trabajar con eso. En palabras de Kratos:

> "Even hateful things have their uses."

Vamos a ver línea por línea que demonios estamos haciendo:

```go
file, err := os.OpenFile("comida.txt", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
```

Primero que nada, buenas noches. Segundo que nada, si tu intuición es buena, notarás que `file` y `err` son dos variables que estamos declarando PERO solo hay una expresión, es decir, la función `os.OpenFile()`, devuelve (o, puede devolver dos valores), el primero un apuntador a un `File` (struct) que será el archivo abierto. En caso de haber un error, el segundo valor será un (posible) error, en caso de que algo salga mal, Go asignará a `err` el error que ocurrió.

Por eso, en la línea inferior tenemos `err != nil`, es decir, si err no es nulo, eso quiere decir que efectivamente, hubo un error y debemos manejarlo. A mi me valió ñonga y solo lo imprimí en pantalla e hice un `return` a secas para salir de la función. En código "productivo" no hagas esto, lo ideal sería colocar un logger y manejar agraciadamente el error.

volviendo a `os.OpenFile()`, la función recibe tres parámetros:

- El nombre del archivo a abrir.
- Un flag que indica si se abrirá el archivo para lectura, escritura o ambas.
- Los permisos del archivo.

Para ver el nombre del archivo no hace falta ser un genio. Ahora, la parte graciosa es donde comenzamos a ver el `os.O_APPEND`, etc. Todo esto son flags, `os.O_WRONLY` se usa para abrir el archivo en modo escritura y es una forma corta de decir "write only". `os.O_APPEND` se usa para añadir los datos al final del archivo en lugar de sobreescribirlo, finalmente `os.O_CREATE` se usa para crear el archivo si no existe.

Los permisos que le dimos son `0644`, si sabes algo de permisos de UNIX, de inmediato tu conocimiento te dirá que ese archivo podrá ser leído por otros grupos, pero el único que puede escribir en él es el usuario que lo creó. (Si te confunde el `0` al inicio, no te preocupes, es solo una forma de representar los permisos en octal, es decir, en base 8. Pero es exactamente lo mismo que un (digamos) `chmod 644`).

En caso de que no se detecten errores ahora podemos ver otra cosa similar a C, pero con una pequeña diferencia:

```go
defer file.Close()
```

¿Qué es eso de `defer`? ¿Por qué estamos cerrando el archivo antes de que termine la función? ¿Estamos tontos? No, solo es otro de los fetiches raros de Go. En Go, `defer` es una palabra reservada que usamos para "programar" (en el sentido similar a "agendar") la ejecución de una función, al finalizar la ejecución del la función donde se llama, es decir, si tenemos:

```go
func main() {
    defer fmt.Println("Hola")
    fmt.Println("Mundo")
}
```

En lenguaje Español sería: "Quiero que se imprima 'Hola' al final de la función main()". Primero se ejecutará la línea de `fmt.Println("Mundo")` y luego la línea de `fmt.Println("Hola")`. 

Esto es muy útil para cerrar archivos, conexiones a la base de datos, etc. Prueba su efectividad cuando te topas con código de gente que no cierra sus archivos. Y si, me puedes dar una excusa genérica de programador jr:

> P-Pero hay funciones muy grandes o muy complejas y es difícil saber cuando o donde cerrar el archivo.

Bueno, ahora con `defer` no tienes excusa, crea tu archivo, abrelo, manipúlalo, y deja que Go se encargue de cerrarlo al final de la función si tu no tienes la capacidad de hacerlo a mano. 

Bromas de lado, `defer` es bastante útil y mira, si el lenguaje de programación te da la facilidad de hacerlo, no usarlo sería ser un terco y un poco tonto sin remedio alguno.

> Un caso real para usar defer es que, si un archivo abierto en modo escritura falla, es posible que exista corrupción de datos o incluso un bloqueo en el sistema. `defer` nos tira esquina con esto.

Finalmente, similar a C, `fmt` cuenta con una función `Fprintf`, los argumentos de esta función son algo chistosos y no los voy a explicar a detalle, si tienes curiosidad puedes leer la [biblioteca estándar de Go](https://golang.org/pkg/fmt/).

Como primer argumento, pasaremos el archivo que abrimos, el segundo, similar al formato de `printf` pasaremos una cadena con los formatos que queremos usar, y el resto de los argumentos serán los valores que queremos imprimir en dichos formatos de la cadena. Ya para el usuario, dejamos el `fmt.Printf()` final, solo para notificarle que todo salió bien.

Listo, así tenemos completa nuestra función para dar de alta una comida. Si pusiste atención a esta parte, podrás "deducir" como se haría para dar de alta una bebida, solo cambia el nombre del archivo y el formato de la cadena. (Y un par de cosas al momento de leer desde entrada estándar).

## Baja de bebidas y comidas.

Perfecto, para poder dar de baja nuestros productos de forma correcta, primero debemos entender la estructura de los archivos generados por la función de alta del programa que estamos haciendo.

Por ejemplo, un archivo `comida.txt` se ve así:

```
id: 1
nombre: pescado
precio: 200.000000
cantidad: 1
ingredientes: [pescado caramones especias]

```

Y un archivo `bebida.txt` se ve así:

```
id: 1
nombre: Sprite
precio: 14.000000
cantidad: 1

```

Como puedes ver, ambos archivos tienen la misma estructura, solo que la de las bebidas no tiene los ingredientes. Entonces, para poder dar de baja un producto, solo necesitamos el ID del producto, y con eso podemos buscar el producto en el archivo y eliminarlo. ¿Cachas?

Vamos a hacer una función llamada "bajaBebida" y otra llamada "bajaComida", ambas van a preguntar al usuario por el ID del producto que quiere dar de baja, y luego van a buscar el producto en el archivo y eliminarlo.

Vamos a empezar por `bajaBebida` y me detendré a explicar algunas cosas.

```go
func bajaBebida() {
    if _, err := os.Stat("bebida.txt"); os.IsNotExist(err) {
        fmt.Println("No hay bebidas registradas. Agrega una bebida primero.")
        return
    }
    
    var id int
	fmt.Printf("Ingrese el ID de la bebida que desea eliminar: ")
	fmt.Scanf("%d", &id)

	file, err := os.OpenFile("bebida.txt", os.O_RDONLY, 0644)
	if err != nil {
		fmt.Println("Error al abrir el archivo")
		return
	}
	defer file.Close()

	tempFile, err := os.CreateTemp("", "bebida_temp.txt")
	if err != nil {
		fmt.Println("Error al crear archivo temporal")
		return
	}
	defer tempFile.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "id: ") {
			lineID, _ := strconv.Atoi(strings.TrimPrefix(line, "id: "))
			if lineID != id {
				fmt.Fprintln(tempFile, line)
				scanner.Scan()
				fmt.Fprintln(tempFile, scanner.Text())
				scanner.Scan()
				fmt.Fprintln(tempFile, scanner.Text())
				scanner.Scan()
				fmt.Fprintln(tempFile, scanner.Text())
				fmt.Fprintln(tempFile, "") // línea en blanco entre cada bebida
			} else {
				// Si se encuentra la bebida a eliminar, se omite
				scanner.Scan()
				scanner.Scan()
				scanner.Scan()
			}
		}
	}
	if err := scanner.Err(); err != nil {
		fmt.Println("Error al leer el archivo")
		return
	}

	err = os.Rename(tempFile.Name(), "bebida.txt")
	if err != nil {
		fmt.Println("Error al renombrar archivo temporal")
		return
	}

	fmt.Printf("Se eliminó la bebida con ID %d\n", id)
	menu()
}
```

Para esta función necesidatamos añadir tres "imports" más a nuestro código de Go. Siendo `"bufio"`, `"strings"` y `"strconv"`.

Vamos a ver que está sucediendo en esta función:

```go
    if _, err := os.Stat("bebida.txt"); os.IsNotExist(err) {
        fmt.Println("No hay bebidas registradas. Agrega una bebida primero.")
        return
    }
```

De buenas a primeras vemos un `if` con una...¿variable? ¿qué significa ese `_`? Bueno, en términos simples, es una variable que no vamos a usar, pero que necesitamos para poder llamar a la función `os.Stat`. La parte del error ya la expliqué. El propósito de ese bloque de código es verificar si el archivo `bebida.txt` existe, como no deseamos hacer nada con el resultado de, si existe o no, usamos un `_` mejor conocido como "blank identifier" para que Go no nos marque error y nos deje continuar.

La siguiente parte es sencilla, solo declaramos una variable para que almacene el valor que vamos a buscar. Luego abrimos el archivo de "bebidas.txt" en solo lectura:

```go
	file, err := os.OpenFile("bebida.txt", os.O_RDONLY, 0644)
	if err != nil {
		fmt.Println("Error al abrir el archivo")
		return
	}
	defer file.Close()
```

¿Por qué en modo "solo lectura"? Bueno, aunque estemos "modificando" esto es por seguridad, vamos a crear un archivo temporal primero, y luego vamos a renombrar el archivo temporal a `bebida.txt`. De esta forma, si algo sale mal, no se pierde la información que teníamos en el archivo original. Y terminamos con el poderoso `defer`.

Precisamente, el paso siguiente es crear el archivo termporal:

```go
	tempFile, err := os.CreateTemp("", "bebida_temp.txt")
	if err != nil {
		fmt.Println("Error al crear archivo temporal")
		return
	}
	defer tempFile.Close()
```

¿Quieres saber algo genial? Go ya tiene en su biblioteca estándar una función para crear archivos temporales, esta función solo toma dos argumentos, el primero es el directorio donde se va a crear el archivo temporal, y el segundo es el prefijo que va a tener el archivo temporal. En este caso, como no le pasamos un directorio, se va a crear en el directorio actual, y como prefijo le pasamos `"bebida_temp"`, así que el archivo temporal se va a llamar `bebida_temp.txt` en nuestro sistema de archivos.

Ahora si, viene el mero mole, la sustitución de valores en el archivo. Esto va a costar un 🥚 y la mitad del otro de explicar, más con mi redacción pedorra, dios plan, se entenderá lo suficiente:

```go
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "id: ") {
			lineID, _ := strconv.Atoi(strings.TrimPrefix(line, "id: "))
			if lineID != id {
				fmt.Fprintln(tempFile, line)
				scanner.Scan()
				fmt.Fprintln(tempFile, scanner.Text())
				scanner.Scan()
				fmt.Fprintln(tempFile, scanner.Text())
				scanner.Scan()
				fmt.Fprintln(tempFile, scanner.Text())
				fmt.Fprintln(tempFile, "") // línea en blanco entre cada bebida
			} else {
				// Si se encuentra la bebida a eliminar, se omite
				scanner.Scan()
				scanner.Scan()
				scanner.Scan()
			}
		}
	}
```

Vamos a ver. ¿Qué es eso de `scanner`? Comencemos diciendo que, `bufio` es parte de la biblioteca estándar y como su nombre lo indica, nos ayuda a manipular entrada y salida de buffers. Si no sabes que es un buffer, vaya con dios, o con Google.

`bufio` tiene una función llamada `NewScanner` que recibe un `io.Reader` y devuelve un `Scanner`. Un `Scanner` es un tipo de dato que nos permite leer una entrada de datos, en este caso, el archivo `bebida.txt`. Asímismo, el tipo `Scanner` tiene un método llamado `Scan` que nos permite leer una línea del archivo, y un método llamado `Text` que nos devuelve la línea leída. El método `Scan` devuelve un `bool` que nos indica si se pudo leer una línea o no, y el método `Text` devuelve un `string` con la línea leída.

> Diosito, nunca te pido nada. Pero por favor que le entiendan a mis idioteces escritas.

Sigue un ciclo `for` que se ejecuta mientras el `Scanner` pueda leer una línea del archivo. Dentro de este ciclo, se lee una línea del archivo y se almacena en la variable `line`. Luego, se verifica si la línea empieza con `"id: "`, para esto usamos la biblioteca `strings` que viene con una función llamada `HasPrefix` que recibe dos argumentos, el primero es el string que queremos verificar, y el segundo es el prefijo que queremos verificar. Si la línea empieza con `"id: "`, entonces se extrae el ID de la línea y se compara con el ID que se quiere eliminar. Si son iguales, se omite la bebida, si no, se escribe la bebida en el archivo temporal.

Para "extraer" el ID podemos ver que existe una línea que dice:

```go
lineID, _ := strconv.Atoi(strings.TrimPrefix(line, "id: "))
```

Aquí es donde usamos el módulo de `strconv`, similar a C, tenemos una función `atoi` que, al igual que en C, convierte un caracter ASCII a un entero, de nuevo usamos el blank identifier para ignorar el error, ya que sabemos que la línea empieza con `"id: "`, por lo tanto, el valor que se va a convertir a entero es un número, y esto lo sabemos con mucha seguridad, ya que, en nuestra estructura, el ID es un entero, lo leemos como entero, y si tratamos de guardar un valor que no sea un entero, el programa se va morir primero antes que escribir información incorrecta en el archivo.

La última parte no veo muy necesario explicarla, solamente usamos `os.Rename` a nuestro favor, para renombrar el archivo temporal a `bebida.txt` y sobreescribir el archivo original con el actualizado.

Sabiendo esto, vamos a hacer una función de baja para las comidas:

```go
func bajaComida() {
	if _, err := os.Stat("comida.txt"); os.IsNotExist(err) {
		fmt.Println("No hay comidas registradas. Agrega una comida primero.")
		return
	}

	var id int
	fmt.Println("Ingrese el ID de la comida a eliminar:")
	fmt.Scanln(&id)

	file, err := os.OpenFile("comida.txt", os.O_RDWR, 0644)
	if err != nil {
		fmt.Println("Error al abrir el archivo")
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	var lines []string
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "id: ") {
			foodID, _ := strconv.Atoi(strings.TrimPrefix(line, "id: "))
			if foodID == id {
				// Si es el ID a eliminar, no agregar la línea a la lista de líneas
				continue
			}
		}
		lines = append(lines, line)
	}
	if err := scanner.Err(); err != nil {
		fmt.Println("Error al leer el archivo")
		return
	}

	file.Truncate(0)
	file.Seek(0, 0)
	for _, line := range lines {
		fmt.Fprintln(file, line)
	}

	fmt.Printf("Se eliminó la comida con ID %d\n", id)
	menu()
}
```

La primera parte de la función ya sabemos como va, primero comprobamos que el archivo de comidas exista, si existe, todo bien y todo perfecto, podemos continuar. Luego, volvemos a leer desde entrada estándar el ID del archivo que deseamos eliminar, abrimos el archivo en modo lectura y ahora si viene lo bueno dijo el "Luisito Comunica" cuando programó el kernel de Linux:

```go
	scanner := bufio.NewScanner(file)
	var lines []string
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "id: ") {
			foodID, _ := strconv.Atoi(strings.TrimPrefix(line, "id: "))
			if foodID == id {
				// Si es el ID a eliminar, no agregar la línea a la lista de líneas
				continue
			}
		}
		lines = append(lines, line)
	}
	if err := scanner.Err(); err != nil {
		fmt.Println("Error al leer el archivo")
		return
	}

	file.Truncate(0)
	file.Seek(0, 0)
	for _, line := range lines {
		fmt.Fprintln(file, line)
	}
```

Vamos a disecar este desmadre de código en secciones para ver bien que está pasando:

```go
    scanner := bufio.NewScanner(file)
    var lines []string
    for scanner.Scan() {
        line := scanner.Text()
        if strings.HasPrefix(line, "id: ") {
            foodID, _ := strconv.Atoi(strings.TrimPrefix(line, "id: "))
            if foodID == id {
                // Si es el ID a eliminar, no agregar la línea a la lista de líneas
                continue
            }
        }
        lines = append(lines, line)
    }
```

Primero, creamos un `Scanner` que lee el archivo de comidas, luego creamos un slice de strings vacío (En términos más familiares, "Un arreglo de strings"), luego, con un ciclo `for` leemos línea por línea del archivo como hicimos antes con `bufio` y sus magnánimos `Scanner`, y si la línea empieza con `"id: "`, entonces extraemos el ID de la línea de igual forma con el poderoso `atoi` y lo comparamos con el ID que queremos eliminar, si son iguales, entonces no agregamos la línea al slice de líneas.

```go
    if err := scanner.Err(); err != nil {
        fmt.Println("Error al leer el archivo")
        return
    }
```

Aquí manejamos el error que puede ocurrir al leer el archivo, si ocurre, entonces imprimimos un mensaje de error y regresamos a la función `menu()`.

```go
    file.Truncate(0)
    file.Seek(0, 0)
    for _, line := range lines {
        fmt.Fprintln(file, line)
    }
```

Finalmente, si no hubo errores, entonces truncamos el archivo a 0 bytes, y movemos el puntero al inicio del archivo, y escribimos todas las líneas que no contienen el ID que queremos eliminar.

¿Qué es eso de `Truncate` y `Seek`? ¿Es similar al `fseek` de C? Sí, es similar, pero **OJO**, no es exactamente lo mismo. `Truncate` es una función que recibe un número de bytes y lo usa para truncar el archivo a ese tamaño, si el archivo es más grande que el tamaño especificado, entonces se corta el archivo a ese tamaño, si el archivo es más pequeño, entonces se rellena con bytes nulos. En nuestro caso le dijimos a `Truncate` que queremos truncar el archivo a 0 bytes, de forma interna, `Truncate` ya sabe que hacer y simplemente borra todo el contenido del archivo.

Por otra parte, `Seek` es una función que mueve el puntero del archivo a una posición específica, similar a cuando tu estás escribiendo un documento en LibreOffice Writer (O en Word si no le sabes al shitposting) y das click en la posición del texto en la que quieres editar. Eso es como un `Seek` pero de la biblioteca estándar tuya.

El primer argumento para `Seek` es la posición a la que se quiere mover el puntero, y el segundo argumento es el punto de referencia desde donde se quiere mover el puntero, nosotros pusimos ambos valores en 0, lo que significa que queremos mover el puntero al inicio del archivo.

Al final de la función, imprimimos un mensaje de éxito y regresamos a la función `menu()`.

## Modificación de bebidas y comidas.

La parte de la modificación es la más tediosa de todo este pedo, afortunadamente su lógica es muy similar a la de eliminación, pero debemos tener especial cuidado, ya que, hay campos que "idealmente" deberían de ser inmutables, es decir, no deben cambiar, por ejemplo un ID. Aquí es donde comienza a ponerse largo el blog (Ya llevamos más o menos 20 minutos de lectura), pero ánimo. Saliendo de leerte toda esta biblia tendrás conocimientos nuevos que podras usar en pro de la humanidad.

Vamos a ver como podemos modificar una bebida:

```go
func modificarBebida() {
	if _, err := os.Stat("bebida.txt"); os.IsNotExist(err) {
		fmt.Println("No hay bebidas registradas. Agrega una bebida primero.")
		return
	}

    var bebida Bebida
    var id int
    var encontrado bool

    fmt.Println("Ingrese el id de la bebida a modificar: ")
    fmt.Scanln(&id)

    file, err := os.OpenFile("bebida.txt", os.O_RDWR, 0644)
    if err != nil {
        fmt.Println("Error al abrir el archivo")
        return
    }

    scanner := bufio.NewScanner(file)
    for scanner.Scan() {
        line := scanner.Text()
        if strings.HasPrefix(line, "id: ") {
            savedID, _ := strconv.Atoi(strings.TrimPrefix(line, "id: "))
            if savedID == id {
                encontrado = true
                bebida.id = savedID

                fmt.Println("Ingrese el nuevo nombre de la bebida: ")
                fmt.Scanln(&bebida.nombre)

                fmt.Println("Ingrese el nuevo precio de la bebida: ")
                fmt.Scanln(&bebida.precio)

                fmt.Println("Ingrese la nueva cantidad disponible de bebida: ")
                fmt.Scanln(&bebida.cantidad)

                break
            }
        }
    }

    if !encontrado {
        fmt.Println("Bebida no encontrada")
        return
    }

    file.Close()
    file, err = os.OpenFile("bebida.txt", os.O_RDWR, 0644)
    if err != nil {
        fmt.Println("Error al abrir el archivo")
        return
    }
    defer file.Close()

    var buffer bytes.Buffer
    scanner = bufio.NewScanner(file)
    for scanner.Scan() {
        line := scanner.Text()
        if strings.HasPrefix(line, "id: ") {
            savedID, _ := strconv.Atoi(strings.TrimPrefix(line, "id: "))
            if savedID == id {
                fmt.Fprintf(&buffer, "id: %d\nnombre: %s\nprecio: %f\ncantidad: %d\n\n", bebida.id, bebida.nombre, bebida.precio, bebida.cantidad)
            } else {
                fmt.Fprintln(&buffer, line)
            }
        } else {
            fmt.Fprintln(&buffer, line)
        }
    }

    file.Seek(0, 0)
    file.Truncate(0)
    file.Write(buffer.Bytes())

    fmt.Printf("Se modificó la bebida con id: %d\n", id)

    menu()
}
```

> *"Ajijoesuchingamadre"* ~ Chuy Marlboro.

Vamos a ver en pedazos todo este pedo. La primera parta ya la tenemos bien identificadísima, comprobamos que el archivo existe el archivo `bebida.txt`, luego de eso, pedimos por entrada estándar el ID de la bebida que deseamos modificar y ahora si, luego de hacer el paso del `Scan` vamos a descomponer por pedazos el procedimiento de "modificación":

```go
    if strings.HasPrefix(line, "id: ") {
            savedID, _ := strconv.Atoi(strings.TrimPrefix(line, "id: "))
            if savedID == id {
                encontrado = true
                bebida.id = savedID

                fmt.Println("Ingrese el nuevo nombre de la bebida: ")
                fmt.Scanln(&bebida.nombre)

                fmt.Println("Ingrese el nuevo precio de la bebida: ")
                fmt.Scanln(&bebida.precio)

                fmt.Println("Ingrese la nueva cantidad disponible de bebida: ")
                fmt.Scanln(&bebida.cantidad)

                break
            }
        }
```

Aquí, como ya sabemos, estamos buscando la línea que empieza con `id: ` y si el ID que se encuentra en esa línea es el mismo que el que ingresamos por entrada estándar, entonces, ya encontramos la bebida que queremos modificar, y ahora si, vamos a pedir los nuevos valores de la bebida.

En cambio, si no encontramos la bebida, entonces, vamos a imprimir un mensaje de error y regresamos a la función `menu()`.

Ahora, vamos a ver como se guarda la bebida modificada en el archivo:

```go
    file.Close()
    file, err = os.OpenFile("bebida.txt", os.O_RDWR, 0644)
    if err != nil {
        fmt.Println("Error al abrir el archivo")
        return
    }
    defer file.Close()

    var buffer bytes.Buffer
    scanner = bufio.NewScanner(file)
    for scanner.Scan() {
        line := scanner.Text()
        if strings.HasPrefix(line, "id: ") {
            savedID, _ := strconv.Atoi(strings.TrimPrefix(line, "id: "))
            if savedID == id {
                fmt.Fprintf(&buffer, "id: %d\nnombre: %s\nprecio: %f\ncantidad: %d\n\n", bebida.id, bebida.nombre, bebida.precio, bebida.cantidad)
            } else {
                fmt.Fprintln(&buffer, line)
            }
        } else {
            fmt.Fprintln(&buffer, line)
        }
    }

    file.Seek(0, 0)
    file.Truncate(0)
    file.Write(buffer.Bytes())
```

Aquí, lo que hacemos es crear un buffer en memoria, en el cual vamos a guardar la información que se va a escribir en el archivo. Luego, vamos a recorrer el archivo, línea por línea, y si la línea empieza con `id: ` y el ID que se encuentra en esa línea es el mismo que el que ingresamos por entrada estándar, entonces, vamos a escribir en el buffer la información de la bebida modificada, en cambio, si no es la bebida que queremos modificar, entonces, vamos a escribir la información que ya estaba en el archivo. Aquí volvemos a hacer uso de Seek y Truncate para que el archivo no quede con basura.

Ahora para la parte de comidas:

```go
func modificarComida() {
	if _, err := os.Stat("comida.txt"); os.IsNotExist(err) {
		fmt.Println("No hay comidas registradas. Agrega una comida primero.")
		return
	}

	var id int
	var nuevaComida Comida
	var comidaEncontrada bool

	fmt.Println("Ingrese el ID de la comida a modificar: ")
	fmt.Scanln(&id)

	file, err := os.OpenFile("comida.txt", os.O_RDWR, 0644)
	if err != nil {
		fmt.Println("Error al abrir el archivo de comidas")
		return
	}

	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		linea := scanner.Text()

		if strings.HasPrefix(linea, "id: ") {
			var idComida int
			fmt.Sscanf(linea, "id: %d", &idComida)

			if idComida == id {
				comidaEncontrada = true
				fmt.Println("Ingrese el nuevo nombre de la comida: ")
				fmt.Scanln(&nuevaComida.nombre)

				fmt.Println("Ingrese el nuevo precio de la comida: ")
				fmt.Scanln(&nuevaComida.precio)

				fmt.Println("Ingrese la nueva cantidad disponible de la comida: ")
				fmt.Scanln(&nuevaComida.cantidad)

				fmt.Println("Ingrese los nuevos ingredientes separados por comas: ")
				ingredientesStr := ""
				fmt.Scanln(&ingredientesStr)
				nuevaComida.ingredientes = strings.Split(ingredientesStr, ",")

				// Salir del bucle una vez encontrada la comida a modificar
				break
			}
		}
	}

	if !comidaEncontrada {
		fmt.Println("No se encontró una comida con el ID especificado")
		return
	}

	file.Seek(0, 0)
	scanner = bufio.NewScanner(file)
	newContent := ""
	for scanner.Scan() {
		linea := scanner.Text()

		if strings.HasPrefix(linea, "id: ") {
			var idComida int
			fmt.Sscanf(linea, "id: %d", &idComida)

			if idComida == id {
				newContent += fmt.Sprintf("id: %d\nnombre: %s\nprecio: %f\ncantidad: %d\ningredientes: %v\n\n", id, nuevaComida.nombre, nuevaComida.precio, nuevaComida.cantidad, nuevaComida.ingredientes)
			} else {
				newContent += linea + "\n"
			}
		} else {
			newContent += linea + "\n"
		}
	}

	file.Truncate(0)
	file.Seek(0, 0)
	fmt.Fprint(file, newContent)

	fmt.Printf("Se modificó la comida con ID %d\n", id)

	menu()
}
```

Vamos a explicar esto igual, a pedazos. Omitiendo, de nuevo, lo que ya sabemos hacer, revisar que el archivo de comidas esté creado o no continuar. Crear un nuevo ID, un nuevo "objeto" y un booleano para la búsqueda y ahora si, comenzaré a explicar este pedazo:

```go
for scanner.Scan() {
		linea := scanner.Text()

		if strings.HasPrefix(linea, "id: ") {
			var idComida int
			fmt.Sscanf(linea, "id: %d", &idComida)

			if idComida == id {
				comidaEncontrada = true
				fmt.Println("Ingrese el nuevo nombre de la comida: ")
				fmt.Scanln(&nuevaComida.nombre)

				fmt.Println("Ingrese el nuevo precio de la comida: ")
				fmt.Scanln(&nuevaComida.precio)

				fmt.Println("Ingrese la nueva cantidad disponible de la comida: ")
				fmt.Scanln(&nuevaComida.cantidad)

				fmt.Println("Ingrese los nuevos ingredientes separados por comas: ")
				ingredientesStr := ""
				fmt.Scanln(&ingredientesStr)
				nuevaComida.ingredientes = strings.Split(ingredientesStr, ",")

				// Salir del bucle una vez encontrada la comida a modificar
				break
			}
		}
	}
```

Aquí estamos, una vez más con `scanner.Scan()` recorriendo el archivo línea por línea. Volvemos a buscar la línea que empieza con `id: ` y si el ID que se encuentra en esa línea es el mismo que el que ingresamos por entrada estándar, entonces, vamos a pedir los nuevos datos de la comida y vamos a salir del bucle.

```go
if !comidaEncontrada {
		fmt.Println("No se encontró una comida con el ID especificado")
		return
	}

	file.Seek(0, 0)
	scanner = bufio.NewScanner(file)
	newContent := ""
	for scanner.Scan() {
		linea := scanner.Text()

		if strings.HasPrefix(linea, "id: ") {
			var idComida int
			fmt.Sscanf(linea, "id: %d", &idComida)

			if idComida == id {
				newContent += fmt.Sprintf("id: %d\nnombre: %s\nprecio: %f\ncantidad: %d\ningredientes: %v\n\n", id, nuevaComida.nombre, nuevaComida.precio, nuevaComida.cantidad, nuevaComida.ingredientes)
			} else {
				newContent += linea + "\n"
			}
		} else {
			newContent += linea + "\n"
		}
	}

	file.Truncate(0)
	file.Seek(0, 0)
	fmt.Fprint(file, newContent)

	fmt.Printf("Se modificó la comida con ID %d\n", id)

	menu()
```

Aquí, si la comida no fue encontrada, simplemente se imprime un mensaje y se sale de la función alv. Si la comida fue encontrada, entonces, vamos a recorrer el archivo de nuevo, pero esta vez, vamos a ir guardando el contenido del archivo en una variable `newContent` y si la línea que estamos leyendo es la que contiene el ID de la comida que queremos modificar, entonces, vamos a guardar en `newContent` la nueva comida con los nuevos datos.

Ha sido un camino muy largo, pero ya casi terminamos...el producto base. Veamos como consultar nuestro inventario y pasemos a los extras.

## Consulta de bebidas y comidas.

Finalmente algo sencillo, solamente debemos hacer que cada función imprima los contenidos de los archivos de bebidas y comidas de una forma más amigable para el usuario, para esto usaremos las técnicas de ASCII Art. Aprendí esto con un señor del centro que me enseñó a fabricar cannabis con maizena y JavaScript:

Veamos la función de comida:

```go
func consultarComida() {
    if _, err := os.Stat("comida.txt"); os.IsNotExist(err) {
        fmt.Println("No hay comidas registradas. Agrega una comida primero.")
        return
    }
    
    file, err := os.Open("comida.txt")
    
    if err != nil {
        fmt.Println("Error al abrir el archivo de comidas")
        return
    }
    
    defer file.Close()
    
    tpl := `
====================
ID: %d
Nombre: %s
Precio: %.2f
Cantidad: %d
Ingredientes: %v
====================
`
    
    scanner := bufio.NewScanner(file)
    
    for scanner.Scan() {
        linea := scanner.Text()
        
        if strings.HasPrefix(linea, "id: ") {
            var idComida int
            fmt.Sscanf(linea, "id: %d", &idComida)
            
            var nombreComida string
            var precioComida float64
            var cantidadComida int
            var ingredientesComida []string
            
            for scanner.Scan() {
                linea = scanner.Text()
                
                if strings.HasPrefix(linea, "nombre: ") {
                    fmt.Sscanf(linea, "nombre: %s", &nombreComida)
                } else if strings.HasPrefix(linea, "precio: ") {
                    fmt.Sscanf(linea, "precio: %f", &precioComida)
                } else if strings.HasPrefix(linea, "cantidad: ") {
                    fmt.Sscanf(linea, "cantidad: %d", &cantidadComida)
                } else if strings.HasPrefix(linea, "ingredientes: ") {
                    fmt.Sscanf(linea, "ingredientes: %v", &ingredientesComida)
                    break // Terminar de leer los ingredientes
                }
            }
            
            comidaStr := fmt.Sprintf(tpl, idComida, nombreComida, precioComida, cantidadComida, ingredientesComida)
            fmt.Println(comidaStr)
        }
    }
    
    menu()
}
```

Aquí me tomé la libertad de usar otra función llamada `Sprintf` que es muy similar a `Printf` pero en vez de imprimir el resultado, lo guarda en una variable. Esto nos permite crear una cadena de formato y luego usarla para imprimir la comida. Por eso hice una variaable `tpl` que actúa como plantilla de formato para las comidas.

Hora de hacer lo mismo con las bebidas:

```go
func consultarBebida() {
    if _, err := os.Stat("bebida.txt"); os.IsNotExist(err) {
        fmt.Println("No hay bebidas registradas. Agrega una bebida primero.")
        return
    }
    
    file, err := os.Open("bebida.txt")
    
    if err != nil {
        fmt.Println("Error al abrir el archivo de bebidas")
        return
    }
    
    defer file.Close()
    
    tpl := `
====================
ID: %d
Nombre: %s
Precio: %.2f
Cantidad: %d
====================
`
    
    scanner := bufio.NewScanner(file)
    
    for scanner.Scan() {
        linea := scanner.Text()
        
        if strings.HasPrefix(linea, "id: ") {
            var idBebida int
            fmt.Sscanf(linea, "id: %d", &idBebida)
            
            var nombreBebida string
            var precioBebida float64
            var cantidadBebida int
            
            for scanner.Scan() {
                linea = scanner.Text()
                
                if strings.HasPrefix(linea, "nombre: ") {
                    fmt.Sscanf(linea, "nombre: %s", &nombreBebida)
                } else if strings.HasPrefix(linea, "precio: ") {
                    fmt.Sscanf(linea, "precio: %f", &precioBebida)
                } else if strings.HasPrefix(linea, "cantidad: ") {
                    fmt.Sscanf(linea, "cantidad: %d", &cantidadBebida)
                    break // Terminar de leer los ingredientes
                }
            }
            
            bebidaStr := fmt.Sprintf(tpl, idBebida, nombreBebida, precioBebida, cantidadBebida)
            fmt.Println(bebidaStr)
        }
    }
    
    menu()
}
```

La explicación de las dos funciones es bastante sencilla, aunque sean largas. Muchos de esos pasos ya los hemos repetido y, si has sido de los valientes que han ido aprendiendo el código a mano, ya estarás familiarizado con ellos. En resumen, estamos, verificando que un archivo exista, específicamente, el archivo que contiene las bebidas o comidas.

Declaramos una "plantilla" para el formato de cada bebida o comida, y luego usamos `Sscanf` para leer los valores de cada bebida o comida y guardarlos en variables. Finalmente, usamos `Sprintf` para crear una cadena de formato y luego usarla para imprimir la bebida o comida y volvemos al menú.

Ya para la parte final, debemos susituir todas los `fmt.Println()` auxiliares que dejamos en la función `menu()` por las funciones que acabamos de crear:

```go
func menu() {
	var opcion, opcion2 int

	for {
		fmt.Println("🍔🍹 BIENVENIDOS A NUESTRO RESTAURANTE 🍺🍕")
		fmt.Println("-----------------------------------------")
		fmt.Println("            1️⃣ Comidas                  ")
		fmt.Println("            2️⃣ Bebidas                  ")
		fmt.Println("            3️⃣ Salir                    ")
		fmt.Println("-----------------------------------------")
		fmt.Println("🍽️ Elija una opción: ")

		fmt.Scanln(&opcion)
		fmt.Print("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")

		switch opcion {
		case 1:
			fmt.Println("🍔🍕 COMIDAS 🍟🥪")
			fmt.Println("-----------------------------------------")
			fmt.Println("            1️⃣ Alta                     ")
			fmt.Println("            2️⃣ Baja                     ")
			fmt.Println("            3️⃣ Modificación             ")
			fmt.Println("            4️⃣ Listado                  ")
			fmt.Println("            5️⃣ Volver al Menú           ")
			fmt.Println("-----------------------------------------")
			fmt.Println("🍽️ Elija una opción: ")

			fmt.Scanln(&opcion2)
			fmt.Print("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")

			switch opcion2 {
			case 1:
				altaComida()
			case 2:
				bajaComida()
			case 3:
				modificarComida()
			case 4:
				consultarComida()
			case 5:
				menu()
			default:
				fmt.Println("Opción inválida, por favor elija una opción válida")
			}

		case 2:
			fmt.Println("🍹🍺 BEBIDAS ☕🍷")
			fmt.Println("-----------------------------------------")
			fmt.Println("            1️⃣ Alta                     ")
			fmt.Println("            2️⃣ Baja                     ")
			fmt.Println("            3️⃣ Modificación             ")
			fmt.Println("            4️⃣ Listado                  ")
			fmt.Println("            5️⃣ Volver al Menú           ")
			fmt.Println("-----------------------------------------")
			fmt.Println("🍽️ Elija una opción: ")

			fmt.Scanln(&opcion2)
			fmt.Print("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")

			switch opcion2 {
			case 1:
				altaBebida()
			case 2:
				bajaBebida()
			case 3:
				modificarBebida()
			case 4:
				consultarBebida()
			case 5:
				menu()
			default:
				fmt.Println("Opción inválida, por favor elija una opción válida")
			}

		case 3:
			fmt.Println("Gracias por visitarnos, vuelva pronto")
			return
		}
	}
}
```

## El CRUD completo.

Si te perdiste, no te preocupes, aquí está el código completo del CRUD:

```go
package main

import (
	"bufio"
	"bytes"
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Bebida struct {
	id       int
	nombre   string
	precio   float64
	cantidad int
}

type Comida struct {
	id           int
	nombre       string
	precio       float64
	cantidad     int
	ingredientes []string
}

func main() {
	menu()
}

func altaBebida() {
	var bebida Bebida

	fmt.Println("Ingrese el id de la bebida: ")
	fmt.Scanln(&bebida.id)

	fmt.Println("Ingrese el nombre de la bebida: ")
	fmt.Scanln(&bebida.nombre)

	fmt.Println("Ingrese el precio de la bebida: ")
	fmt.Scanln(&bebida.precio)

	fmt.Println("Ingrese la cantidad disponible de bebida: ")
	fmt.Scanln(&bebida.cantidad)

	file, err := os.OpenFile("bebida.txt", os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)

	if err != nil {
		fmt.Println("Error al abrir el archivo")
		return
	}

	defer file.Close()

	fmt.Fprintf(file, "id: %d\nnombre: %s\nprecio: %f\ncantidad: %d\n\n", bebida.id, bebida.nombre, bebida.precio, bebida.cantidad)

	fmt.Printf("Se registró la bebida con id: %d, nombre: %s, precio: %f, cantidad: %d", bebida.id, bebida.nombre, bebida.precio, bebida.cantidad)

	menu()
}

func altaComida() {
	var comida Comida

	fmt.Println("Ingrese el id de la comida: ")
	fmt.Scanln(&comida.id)

	fmt.Println("Ingrese el nombre de la comida: ")
	fmt.Scanln(&comida.nombre)

	fmt.Println("Ingrese el precio de la comida: ")
	fmt.Scanln(&comida.precio)

	fmt.Println("Ingrese la cantidad disponible de comida: ")
	fmt.Scanln(&comida.cantidad)

	for {
		var ingrediente string

		fmt.Println("Ingrese un ingrediente de la comida o 'fin' para finalizar: ")
		fmt.Scanln(&ingrediente)

		if ingrediente == "fin" {
			break
		}
		comida.ingredientes = append(comida.ingredientes, ingrediente)
	}

	file, err := os.OpenFile("comida.txt", os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)

	if err != nil {
		fmt.Println("Error al abrir el archivo")
		return
	}

	defer file.Close()

	fmt.Fprintf(file, "id: %d\nnombre: %s\nprecio: %f\ncantidad: %d\ningredientes: %v\n\n", comida.id, comida.nombre, comida.precio, comida.cantidad, comida.ingredientes)

	fmt.Printf("Se registró la comida con id: %d, nombre: %s, precio: %f, cantidad: %d, ingredientes: %v", comida.id, comida.nombre, comida.precio, comida.cantidad, comida.ingredientes)

	menu()
}

func bajaBebida() {
	if _, err := os.Stat("bebida.txt"); os.IsNotExist(err) {
		fmt.Println("No hay bebidas registradas. Agrega una bebida primero.")
		return
	}

	var id int
	fmt.Printf("Ingrese el ID de la bebida que desea eliminar: ")
	fmt.Scanf("%d", &id)

	file, err := os.OpenFile("bebida.txt", os.O_RDONLY, 0644)
	if err != nil {
		fmt.Println("Error al abrir el archivo")
		return
	}
	defer file.Close()

	tempFile, err := os.CreateTemp("", "bebida_temp.txt")
	if err != nil {
		fmt.Println("Error al crear archivo temporal")
		return
	}
	defer tempFile.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "id: ") {
			lineID, _ := strconv.Atoi(strings.TrimPrefix(line, "id: "))
			if lineID != id {
				fmt.Fprintln(tempFile, line)
				scanner.Scan()
				fmt.Fprintln(tempFile, scanner.Text())
				scanner.Scan()
				fmt.Fprintln(tempFile, scanner.Text())
				scanner.Scan()
				fmt.Fprintln(tempFile, scanner.Text())
				fmt.Fprintln(tempFile, "") // línea en blanco entre cada bebida
			} else {
				// Si se encuentra la bebida a eliminar, se omite
				scanner.Scan()
				scanner.Scan()
				scanner.Scan()
			}
		}
	}
	if err := scanner.Err(); err != nil {
		fmt.Println("Error al leer el archivo")
		return
	}

	err = os.Rename(tempFile.Name(), "bebida.txt")
	if err != nil {
		fmt.Println("Error al renombrar archivo temporal")
		return
	}

	fmt.Printf("Se eliminó la bebida con ID %d\n", id)
	menu()
}

func bajaComida() {
	if _, err := os.Stat("comida.txt"); os.IsNotExist(err) {
		fmt.Println("No hay comidas registradas. Agrega una comida primero.")
		return
	}

	var id int
	fmt.Println("Ingrese el ID de la comida a eliminar:")
	fmt.Scanln(&id)

	file, err := os.OpenFile("comida.txt", os.O_RDWR, 0644)
	if err != nil {
		fmt.Println("Error al abrir el archivo")
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	var lines []string
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "id: ") {
			foodID, _ := strconv.Atoi(strings.TrimPrefix(line, "id: "))
			if foodID == id {
				continue
			}
		}
		lines = append(lines, line)
	}
	if err := scanner.Err(); err != nil {
		fmt.Println("Error al leer el archivo")
		return
	}

	file.Truncate(0)
	file.Seek(0, 0)
	for _, line := range lines {
		fmt.Fprintln(file, line)
	}

	fmt.Printf("Se eliminó la comida con ID %d\n", id)
	menu()
}

func modificarBebida() {
	if _, err := os.Stat("bebida.txt"); os.IsNotExist(err) {
		fmt.Println("No hay bebidas registradas. Agrega una bebida primero.")
		return
	}

    var bebida Bebida
    var id int
    var encontrado bool

    fmt.Println("Ingrese el id de la bebida a modificar: ")
    fmt.Scanln(&id)

    file, err := os.OpenFile("bebida.txt", os.O_RDWR, 0644)
    if err != nil {
        fmt.Println("Error al abrir el archivo")
        return
    }

    scanner := bufio.NewScanner(file)
    for scanner.Scan() {
        line := scanner.Text()
        if strings.HasPrefix(line, "id: ") {
            savedID, _ := strconv.Atoi(strings.TrimPrefix(line, "id: "))
            if savedID == id {
                encontrado = true
                bebida.id = savedID

                fmt.Println("Ingrese el nuevo nombre de la bebida: ")
                fmt.Scanln(&bebida.nombre)

                fmt.Println("Ingrese el nuevo precio de la bebida: ")
                fmt.Scanln(&bebida.precio)

                fmt.Println("Ingrese la nueva cantidad disponible de bebida: ")
                fmt.Scanln(&bebida.cantidad)

                break
            }
        }
    }

    if !encontrado {
        fmt.Println("Bebida no encontrada")
        return
    }

    file.Close()
    file, err = os.OpenFile("bebida.txt", os.O_RDWR, 0644)
    if err != nil {
        fmt.Println("Error al abrir el archivo")
        return
    }
    defer file.Close()

    var buffer bytes.Buffer
    scanner = bufio.NewScanner(file)
    for scanner.Scan() {
        line := scanner.Text()
        if strings.HasPrefix(line, "id: ") {
            savedID, _ := strconv.Atoi(strings.TrimPrefix(line, "id: "))
            if savedID == id {
                fmt.Fprintf(&buffer, "id: %d\nnombre: %s\nprecio: %f\ncantidad: %d\n\n", bebida.id, bebida.nombre, bebida.precio, bebida.cantidad)
            } else {
                fmt.Fprintln(&buffer, line)
            }
        } else {
            fmt.Fprintln(&buffer, line)
        }
    }

    file.Seek(0, 0)
    file.Truncate(0)
    file.Write(buffer.Bytes())

    fmt.Printf("Se modificó la bebida con id: %d\n", id)

    menu()
}

func modificarComida() {
	if _, err := os.Stat("comida.txt"); os.IsNotExist(err) {
		fmt.Println("No hay comidas registradas. Agrega una comida primero.")
		return
	}

	var id int
	var nuevaComida Comida
	var comidaEncontrada bool

	fmt.Println("Ingrese el ID de la comida a modificar: ")
	fmt.Scanln(&id)

	file, err := os.OpenFile("comida.txt", os.O_RDWR, 0644)
	if err != nil {
		fmt.Println("Error al abrir el archivo de comidas")
		return
	}

	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		linea := scanner.Text()

		if strings.HasPrefix(linea, "id: ") {
			var idComida int
			fmt.Sscanf(linea, "id: %d", &idComida)

			if idComida == id {
				comidaEncontrada = true
				fmt.Println("Ingrese el nuevo nombre de la comida: ")
				fmt.Scanln(&nuevaComida.nombre)

				fmt.Println("Ingrese el nuevo precio de la comida: ")
				fmt.Scanln(&nuevaComida.precio)

				fmt.Println("Ingrese la nueva cantidad disponible de la comida: ")
				fmt.Scanln(&nuevaComida.cantidad)

				fmt.Println("Ingrese los nuevos ingredientes separados por comas: ")
				ingredientesStr := ""
				fmt.Scanln(&ingredientesStr)
				nuevaComida.ingredientes = strings.Split(ingredientesStr, ",")

				// Salir del bucle una vez encontrada la comida a modificar
				break
			}
		}
	}

	if !comidaEncontrada {
		fmt.Println("No se encontró una comida con el ID especificado")
		return
	}

	file.Seek(0, 0)
	scanner = bufio.NewScanner(file)
	newContent := ""
	for scanner.Scan() {
		linea := scanner.Text()

		if strings.HasPrefix(linea, "id: ") {
			var idComida int
			fmt.Sscanf(linea, "id: %d", &idComida)

			if idComida == id {
				newContent += fmt.Sprintf("id: %d\nnombre: %s\nprecio: %f\ncantidad: %d\ningredientes: %v\n\n", id, nuevaComida.nombre, nuevaComida.precio, nuevaComida.cantidad, nuevaComida.ingredientes)
			} else {
				newContent += linea + "\n"
			}
		} else {
			newContent += linea + "\n"
		}
	}

	file.Truncate(0)
	file.Seek(0, 0)
	fmt.Fprint(file, newContent)

	fmt.Printf("Se modificó la comida con ID %d\n", id)

	menu()
}

func consultarBebida() {
    if _, err := os.Stat("bebida.txt"); os.IsNotExist(err) {
        fmt.Println("No hay bebidas registradas. Agrega una bebida primero.")
        return
    }

    file, err := os.Open("bebida.txt")

    if err != nil {
        fmt.Println("Error al abrir el archivo de bebidas")
        return
    }

    defer file.Close()

    tpl := `
====================
ID: %d
Nombre: %s
Precio: %.2f
Cantidad: %d
====================
`

    scanner := bufio.NewScanner(file)

    for scanner.Scan() {
        linea := scanner.Text()

        if strings.HasPrefix(linea, "id: ") {
            var idBebida int
            fmt.Sscanf(linea, "id: %d", &idBebida)

            var nombreBebida string
            var precioBebida float64
            var cantidadBebida int

            for scanner.Scan() {
                linea = scanner.Text()

                if strings.HasPrefix(linea, "nombre: ") {
                    fmt.Sscanf(linea, "nombre: %s", &nombreBebida)
                } else if strings.HasPrefix(linea, "precio: ") {
                    fmt.Sscanf(linea, "precio: %f", &precioBebida)
                } else if strings.HasPrefix(linea, "cantidad: ") {
                    fmt.Sscanf(linea, "cantidad: %d", &cantidadBebida)
                    break // Terminar de leer los ingredientes
                }
            }

            bebidaStr := fmt.Sprintf(tpl, idBebida, nombreBebida, precioBebida, cantidadBebida)
            fmt.Println(bebidaStr)
        }
    }

    menu()
}

func consultarComida() {
    if _, err := os.Stat("comida.txt"); os.IsNotExist(err) {
        fmt.Println("No hay comidas registradas. Agrega una comida primero.")
        return
    }

    file, err := os.Open("comida.txt")

    if err != nil {
        fmt.Println("Error al abrir el archivo de comidas")
        return
    }

    defer file.Close()

    tpl := `
====================
ID: %d
Nombre: %s
Precio: %.2f
Cantidad: %d
Ingredientes: %v
====================
`

    scanner := bufio.NewScanner(file)

    for scanner.Scan() {
        linea := scanner.Text()

        if strings.HasPrefix(linea, "id: ") {
            var idComida int
            fmt.Sscanf(linea, "id: %d", &idComida)

            var nombreComida string
            var precioComida float64
            var cantidadComida int
            var ingredientesComida []string

            for scanner.Scan() {
                linea = scanner.Text()

                if strings.HasPrefix(linea, "nombre: ") {
                    fmt.Sscanf(linea, "nombre: %s", &nombreComida)
                } else if strings.HasPrefix(linea, "precio: ") {
                    fmt.Sscanf(linea, "precio: %f", &precioComida)
                } else if strings.HasPrefix(linea, "cantidad: ") {
                    fmt.Sscanf(linea, "cantidad: %d", &cantidadComida)
                } else if strings.HasPrefix(linea, "ingredientes: ") {
                    fmt.Sscanf(linea, "ingredientes: %v", &ingredientesComida)
                    break // Terminar de leer los ingredientes
                }
            }

            comidaStr := fmt.Sprintf(tpl, idComida, nombreComida, precioComida, cantidadComida, ingredientesComida)
            fmt.Println(comidaStr)
        }
    }

    menu()
}

func menu() {
	var opcion, opcion2 int

	for {
		fmt.Println("🍔🍹 BIENVENIDOS A NUESTRO RESTAURANTE 🍺🍕")
		fmt.Println("-----------------------------------------")
		fmt.Println("            1️⃣ Comidas                  ")
		fmt.Println("            2️⃣ Bebidas                  ")
		fmt.Println("            3️⃣ Salir                    ")
		fmt.Println("-----------------------------------------")
		fmt.Println("🍽️ Elija una opción: ")

		fmt.Scanln(&opcion)
		fmt.Print("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")

		switch opcion {
		case 1:
			fmt.Println("🍔🍕 COMIDAS 🍟🥪")
			fmt.Println("-----------------------------------------")
			fmt.Println("            1️⃣ Alta                     ")
			fmt.Println("            2️⃣ Baja                     ")
			fmt.Println("            3️⃣ Modificación             ")
			fmt.Println("            4️⃣ Listado                  ")
			fmt.Println("            5️⃣ Volver al Menú           ")
			fmt.Println("-----------------------------------------")
			fmt.Println("🍽️ Elija una opción: ")

			fmt.Scanln(&opcion2)
			fmt.Print("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")

			switch opcion2 {
			case 1:
				altaComida()
			case 2:
				bajaComida()
			case 3:
				modificarComida()
			case 4:
				consultarComida()
			case 5:
				menu()
			default:
				fmt.Println("Opción inválida, por favor elija una opción válida")
			}

		case 2:
			fmt.Println("🍹🍺 BEBIDAS ☕🍷")
			fmt.Println("-----------------------------------------")
			fmt.Println("            1️⃣ Alta                     ")
			fmt.Println("            2️⃣ Baja                     ")
			fmt.Println("            3️⃣ Modificación             ")
			fmt.Println("            4️⃣ Listado                  ")
			fmt.Println("            5️⃣ Volver al Menú           ")
			fmt.Println("-----------------------------------------")
			fmt.Println("🍽️ Elija una opción: ")

			fmt.Scanln(&opcion2)
			fmt.Print("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")

			switch opcion2 {
			case 1:
				altaBebida()
			case 2:
				bajaBebida()
			case 3:
				modificarBebida()
			case 4:
				consultarBebida()
			case 5:
				menu()
			default:
				fmt.Println("Opción inválida, por favor elija una opción válida")
			}

		case 3:
			fmt.Println("Gracias por visitarnos, vuelva pronto")
			return
		}
	}
}
```

## Probando nuestro código.

Parece que todo funciona bien, pero no podemos estar seguros hasta que no probemos nuestro código. Aquí te voy a dejar un par de capturas de pantalla de cómo se ve el programa en ejecución. Si deseas ejecutarlo tu solo usa el comando:

```bash
go run main.go
```

A continuación, te muestro capturas de pantalla para que veas cómo se ve el programa en ejecución.

### Menus del programa

![menu](/img/posts/crudgo/menu.png)
> Menu principal

---

![menu](/img/posts/crudgo/menucomida.png)
> Menu de comidas

---

![menu](/img/posts/crudgo/menubebida.png)
> Menu de bebidas

## Solucionando bugs.

En el testeo del programa he encontrado algunos errores que podemos corregir, vamos a verlos.

1. Entre más interactuemos con el menu, debemos elegir la opción "3" en el menu principal para "salir" múltiples veces. Esto pasa porque, no estamos regresando valores. Solo estamos llamando a la función "menu" de nuevo y al ser llamadas anidadas, nos impiden salir del programa. Para solucionar esto, vamos a usar la función "os.Exit(0)" que nos permite salir del programa.

2. El alta falla en ocasiones.

3. El listado no maneja espacios, si registramos algo como "Big Mac" solo mostrará la palabra "Big".

Esto pasa cuando no ordenamos bien nuestro código y no tenemos una lógica clara de cómo vamos a manejar los datos. Para solucionar un problema primero se planea, se diseña y luego se implementa. En mi caso, mi error fue aventarme, todo el programa "desde cero" y "a pelo". Bueno, pues es hora de corregir nuestros errores.


## Optimizando el código con limpieza de código, mejora de lógica, interfaces, fragmentación en archivos y tipos de datos más específicos.

Primero lo primero, orden. Nuestro CRUD con bugs ahorita tiene 574 líneas de código en un solo archivo llamado `main.go`, si bien existen programas sencillos a los que podemos recurrir, la cantidad de líneas para un proyecto así es simplemente inaceptable sin un poco de orden, vamos a tomarnos el título un poco en serio y a optimizar nuestro código.

### Separando el código por archivos.

Primero lo primero, 574 líneas, ordenar, ya.

Go tiene una forma que puede ayudarnos a separar el código en archivos. De momento, tenemos solamente nuestro archivo `main.go` que contiene todo el código, vamos a separar el código en archivos para que sea más fácil de leer y de mantener.

Tomemos por ejemplo la función `altaBebida()`, esta función se encarga de dar de alta una bebida, vamos a crear un archivo llamado `bebidas.go` y moveremos la función `altaBebida()` a este archivo:

1. Vamos a crear el archivo.
    
    ```bash
    touch bebidas.go
    ```
    
2. Pegamos el código de la función `altaBebida()` en el archivo bebidas.go.

    ```go
    package main

    import (
	    "fmt"
	    "os"
    )

    type Bebida struct {
	    id       int
	    nombre   string
	    precio   float64
	    cantidad int
    }

    func altaBebida() {
	    var bebida Bebida

	    fmt.Println("Ingrese el id de la bebida: ")
	    fmt.Scanln(&bebida.id)

	    fmt.Println("Ingrese el nombre de la bebida: ")
	    fmt.Scanln(&bebida.nombre)

	    fmt.Println("Ingrese el precio de la bebida: ")
	    fmt.Scanln(&bebida.precio)

	    fmt.Println("Ingrese la cantidad disponible de bebida: ")
	    fmt.Scanln(&bebida.cantidad)

	    file, err := os.OpenFile("bebida.txt", os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)

	    if err != nil {
		    fmt.Println("Error al abrir el archivo")
		    return
        }

	    defer file.Close()

	    fmt.Fprintf(file, "id: %d\nnombre: %s\nprecio: %f\ncantidad: %d\n\n", bebida.id, bebida.nombre, bebida.precio, bebida.cantidad)

	    fmt.Printf("Se registró la bebida con id: %d, nombre: %s, precio: %f, cantidad: %d", bebida.id, bebida.nombre, bebida.precio, bebida.cantidad)

        menu()
    }
    ```

3. Repetimos para todas las funciones de bebidas. Ninguna regresa valores, por lo que no tenemos que preocuparnos por utilizar apuntadores u otras cosas que normalmente son requeridas cuando movemos una función a un archivo diferente.

> **NOTA:** Es importante que en los archivos externos respetes los imports y migres las funciones que necesites. Las estructuras también deben ser movidas a los archivos externos.

Al final, si repetimos lo mismo, tendremos tres (3) archivos de Go y nuestro proyecto podría verse así:

```
.
├── bebidas.go
├── bebida.txt
├── comidas.go
├── comida.txt
├── go.mod
└── main.go

1 directory, 6 files
```

Pero ¿como hacemos para ejecutar el programa si ya está fragmentado en archivos? Go nos permite ejecutar varios archivos a la vez, lo que importa realmente es la línea `package main` que se encuentra en la parte superior de cada archivo. Siempre debe ser `package main` para que el programa funcione (en nuestro caso, si deseas una arquitectura más compleja, te recomiendo leer acerca de los paquetes en Go).

Lo ideal sería escribir en la terminal:

```bash
go run main.go bebidas.go comidas.go
```

Para que todo se ejecute bien. Pero hay una forma bestia que es la que vamos a usar:

```bash
go run .
```

Si, esto es el equivalente come-pegamento del `git add .` no recomiendo usarlo en proyectos serios, en nuestro caso basta y sobra, pero por amor de horror, no lo hagas fuera de este tutorial.

Gracias a esto, tenemos un programa que funciona y ahora es muchísmo más legible y sencillo de mantener. Sabemos que si algo relacionado a las bebidas falla, solo debemos revisar el archivo `bebidas.go`. Si te gana el ToC, puedes intentar hacer un archivo por función pero no te lo recomiendo realmente. El compilador de Go es muy bueno y no deberías tener ningún impacto visible al hacerlo. Además, la fragmentación en exceso puede hacer que el código sea más difícil de leer, irónicamente.

Ahora nuestro archivo `main.go` tiene solo 89 líneas de código, y es mucho más fácil de leer y de mantener. Las restantes están divididas en los archivos `bebidas.go` y `comidas.go`.

### Mejorar la lógica de las funciones del programa.

Nuestro programa compila, lo que quiere decir que, en teoría debería funcionar, pero no es así, esto es porque, además de los errores de sintaxis, tenemos errores de lógica, mejor conocidos como "errores en tiempo de ejecución". Vamos a corregirlos.

> Si me pongo a explicar las correcciones nos vamos a llevar la vida. Tu de tarea te llevarás ver que cambió en el código.
> O quizás suba una actualización con el código corregido ya 100% "feature complete"

Puedes encontrar el código corregido en GitHub.

> Es posible que siga corrigiendo errores en ese programa con el tiempo, no tomes el último commit por sentado.

## Extras.

Vamos a ver los extras que se pueden agregar a nuestro programa. Y esta es la parte divertida luego del desmadre que ha sido desarrollar esto. 

Cuando estamos creando un proyecto para nuestro portafolio o por que deseamos compartirlo con el mundo, es bueno tratar de añadir "extras" para mostrar que sabes manejar algunas herramientas que podrían llamar la atención de las personas que revisen tu código o tu perfil en GitHub.

Estos extras pretenden darte una "probada" de algunas cosas que puedes hacer en tus proyectos. Obvio algunas cosas le quedan terriblemente grandes a este programa pedorro, pero es más por propósitos didácticos que otra cosa.

### Crear builds reproducibles con Docker.

Veamos, una de las cosas que más se valoran en el software y que en gran medida determina la calidad del mismo es la reproducibilidad, es decir, que dos personas puedan construir el mismo software con el mismo código y obtener el mismo resultado. Lamentablemente por malas desiciones, en estos años tenemos problemas que aparentemente se solucionan con el mágico: *"En mi máquina functiona"*.

Para evitar esto, podemos usar Docker, que es una herramienta que nos permite crear contenedores que nos permiten crear entornos aislados, es decir, que no afectan el sistema operativo en el que se ejecutan. Esto nos permite crear entornos de desarrollo y producción que son exactamente iguales, y que nos permiten crear builds reproducibles. El colmo ya sería verte decir cosas como *"En mi contenedor funciona"*, ahí si aléjate de las compus hij@, eres peligro puro.

Para este paso necesitaremos tener Docker (o Podman) instalado en nuestro sistema. En mi caso usaré podman pero, podman es 100% compatible con Docker, por lo que no deberías tener problemas, los pasos son exactamente los mismos.

(Si te encuentras en Debian puedes instalar el paquete `podman-docker` para generar un enlace simbólico de `docker` a `podman`, con esto podrás ejecutar comandos que usen `docker` sin problemas).

Vamos a empezar, primero lo primero necesitamos crear nuestras configuraciones en un archivo llamado `Dockerfile`:

```Dockerfile
FROM golang:latest

WORKDIR /app

COPY main.go comidas.go bebidas.go go.mod /app/

RUN go build -o crud .

CMD ["/app/crud"]
```

¿Qué es un Dockerfile? Docker nos permite hacer un archivo de texto plano que contiene las instrucciones que Docker debe seguir para crear una imagen. Piénsalo como un `Makefile` pero para Docker....bueno, de hecho eso es. 

En este caso, tenemos cinco instrucciones en nuestro Dockerfile:

- `FROM golang:latest`: Esta instrucción nos permite indicar que imagen vamos a usar como base para crear nuestra imagen. En este caso usaremos la imagen `golang:latest` que es la imagen oficial de Go. Esta imagen contiene todo lo necesario para compilar un programa en Go, por lo que no necesitamos instalar nada más.

- `WORKDIR /app`: Esta instrucción nos permite indicar el directorio de trabajo, es decir, el directorio en el que se ejecutará el comando `CMD` que veremos más adelante. En este caso, usaremos `/app` como directorio de trabajo.

- `COPY main.go comidas.go bebidas.go /app/`: Esta instrucción nos permite copiar archivos desde nuestro sistema a la imagen. En este caso, copiaremos los archivos `main.go`, `comidas.go` y `bebidas.go` al directorio de trabajo `/app`.

- `RUN go build -o crud .`: Esta instrucción nos permite ejecutar un comando dentro de la imagen. En este caso, ejecutaremos el comando `go build -o crud .` que compilará nuestro programa y lo guardará en un archivo llamado `crud`.

- `CMD ["/app/crud"]`: Esta instrucción nos permite indicar el comando que se ejecutará cuando se ejecute el contenedor. En este caso, ejecutaremos el archivo `crud` que creamos en la instrucción anterior.

Ahora que estamos contentos con lo que tiene nuestro dockerfile, vamos a crear nuestra imagen:

> Asegúrate de poder bajar imágenes de Docker Hub y de tener la imágen de `golang:latest` instalada en tu sistema.

```bash
docker build -t crud:1.0.0 .
```

La salida debería verse así:

```bash
docker build -t crud:1.0.0 .
Emulate Docker CLI using podman. Create /etc/containers/nodocker to quiet msg.
STEP 1/5: FROM golang:latest
STEP 2/5: WORKDIR /app
--> Using cache e285387c17e054cef320f105a389f35f70d43aeead602c91e2a91b16845d501b
--> e285387c17e
STEP 3/5: COPY main.go comidas.go bebidas.go go.mod /app/
--> edd1be11ff6
STEP 4/5: RUN go build -o crud .
--> 016e138920f
STEP 5/5: CMD ["/app/crud"]
COMMIT crud:1.0.0
--> 54fded0a8c6
Successfully tagged localhost/crud:1.0.0
54fded0a8c666543d470549a9644b68e7c27e14b8a1df7d43dbaef069e24e6c5
```

Si nuestro contenedor se creó correctamente, podemos ejecutarlo con el siguiente comando:

```bash
docker run --rm -it crud:1.0.0
```

Si todo salió bien, deberíamos ver la salida de nuestro programa:

![docker](/img/posts/crudgo/rundocker.png)

Listo, ahora tenemos una imágen de Docker con nuestro programa. Esto lo podemos usar para muchísimas cosas como tener builds reproducibles en producción, entornos más fáciles de depurar porque todos son idénticos, una forma más fácil de distribuir tus aplicaciones, esto porque, el contenedor ya tendrá todo lo necesario para ejecutarlas, sin tocar el sistema operativo, ahora si podrás tener tus servidores legacy corriendo en diferentes versiones de PHP sin problemas.

Otra cosa para la que puede ser útil es para ejecutar software "exclusivo" de ciertos sistemas operativos en el nuestro. O de manejar servicios por separado, por ejemplo, podríamos tener un contenedor con una base de datos, otro con un servidor web y otro con nuestra aplicación, y que todos se comuniquen entre sí. Esto nos permite tener un entorno de desarrollo más limpio y ordenado.

### Documentar el código con GoDoc.

No cabe duda alguna, el destino eligió a Rust para ser el lenguaje que muestre su supremacía y quede en la cima. Eso es la innegable verdad, y después de todo eso, sigue sin haber una forma normal de hacer cosas en Go.

En Go, no tenemos el maravilloso `cargo doc` de Rust, en su lugar tenemos algo llamado `godoc` que es un servidor web que nos permite ver la documentación de nuestros paquetes y funciones. Viene dentro de la instalación de Go, por lo que no necesitamos instalar nada más. 

Para documentar nuestro código en Go no necesitamos de carácteres o secuencias especiales. Por ejemplo, en Rust, al momento de generar la documentación, el compilador busca comentarios que empiecen con `///` o `//!` y los usa para generar la documentación. En Go, no necesitamos de nada especial, simplemente debemos escribir un comentario normal y corriente, y el compilador lo usará para generar la documentación.

Para muestra un ejemplo en Rust:

```rust
/// Esta función suma dos números.
///
/// # Ejemplo
///
/// ```
/// let suma = suma(2, 2);
/// assert_eq!(suma, 4);
/// ```
pub fn suma(a: i32, b: i32) -> i32 {
    a + b
}
```

Cosa que en Go se vería así:

```go
// Suma dos números.
func suma(a, b int) int {
    return a + b
}
```

Los docstrings son los propios comentarios, por lo que no añadimos "una cosa más que aprender" a nuestra cabeza. Es lindo que Rust te produzca la documentación de las cosas en automático, pero eso de meter markdown en los comentarios es más feo que pegarle a mamá el día de su cumpleaños.

Vamos a ver la primer forma de leer nuestra documentación en Go. Para esto debemos estar en el directorio de nuestro proyecto y ejecutar el siguiente comando:

```bash
go doc -all -u main.go
```

En nuestra terminal debería aparecer algo como esto:

![godoc](/img/posts/crudgo/godocterm.png)

Es una forma que podrías llamar "poco amigable" pero ey, tienes la documentación de tu código en la terminal. Si quieres ver la documentación en un navegador, deberás de instalar `godoc`, **OJO**, `go doc` y `godoc` son dos cosas distintas. `go doc` es un comando que viene con la instalación de Go, mientras que `godoc` es un servidor web que utiliza `go doc` para generar la documentación y es una herramienta que debemos instalar, ya queda en ti decidir si quieres instalarla o no.

### Cambiar variables en tiempo de compilación usando ldflags.

Bien, ahora podemos pasar a lo más interesante, cambiar variables en tiempo de compilación. Esto es algo que no se puede hacer en muchos lenguajes, pero en Go es muy sencillo.

Esto, lamentablemente requiere del uso de variables globales en nuestro código, pero, por la ganancia que representa, vale la pena.

¿A que voy con eso de "cambiar variables en tiempo de compilación"? Pues, a que podemos cambiar el nombre de nuestro programa, la versión, la fecha de compilación, etc. Todo esto sin tener que tocar el código fuente. Al momento de ejecutar el comando `go build` podemos pasarle una serie de flags que nos permiten cambiar variables en tiempo de compilación. Estos flags son:

- `-ldflags` - Permite pasarle flags al linker.
- `-X` - Permite cambiar el valor de una variable global.

Vamos a ver como podemos usar estas variables para diferenciar entre una versión "gratis" y una versión "premium" de nuestro programa.

Vamos al archivo `main.go` y agregamos las siguientes variables globales:

```go
package main

import "fmt"

var VersionType = "gratis"

func main() {
	menu()
}

func menu() {
	var opcion, opcion2 int

	for {
		fmt.Println("🍔🍹 BIENVENIDOS A NUESTRO RESTAURANTE 🍺🍕")
        fmt.Println("Pico-manejador de restaurantes. Versión: " + VersionType)
		fmt.Println("-----------------------------------------")
		fmt.Println("            1️⃣ Comidas                  ")
		fmt.Println("            2️⃣ Bebidas                  ")
		fmt.Println("            3️⃣ Salir                    ")
		fmt.Println("-----------------------------------------")
		fmt.Println("🍽️ Elija una opción: ")

		fmt.Scanln(&opcion)
		fmt.Print("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")

		switch opcion {
		case 1:
			fmt.Println("🍔🍕 COMIDAS 🍟🥪")
			fmt.Println("-----------------------------------------")
			fmt.Println("            1️⃣ Alta                     ")
			fmt.Println("            2️⃣ Baja                     ")
			fmt.Println("            3️⃣ Modificación             ")
			fmt.Println("            4️⃣ Listado                  ")
			fmt.Println("            5️⃣ Volver al Menú           ")
			fmt.Println("-----------------------------------------")
			fmt.Println("🍽️ Elija una opción: ")

			fmt.Scanln(&opcion2)
			fmt.Print("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")

			switch opcion2 {
			case 1:
				altaComida()
			case 2:
				bajaComida()
			case 3:
				modificarComida()
			case 4:
				consultarComida()
			case 5:
				menu()
			default:
				fmt.Println("Opción inválida, por favor elija una opción válida")
			}

		case 2:
			fmt.Println("🍹🍺 BEBIDAS ☕🍷")
			fmt.Println("-----------------------------------------")
			fmt.Println("            1️⃣ Alta                     ")
			fmt.Println("            2️⃣ Baja                     ")
			fmt.Println("            3️⃣ Modificación             ")
			fmt.Println("            4️⃣ Listado                  ")
			fmt.Println("            5️⃣ Volver al Menú           ")
			fmt.Println("-----------------------------------------")
			fmt.Println("🍽️ Elija una opción: ")

			fmt.Scanln(&opcion2)
			fmt.Print("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")

			switch opcion2 {
			case 1:
				altaBebida()
			case 2:
				bajaBebida()
			case 3:
				modificarBebida()
			case 4:
				consultarBebida()
			case 5:
				menu()
			default:
				fmt.Println("Opción inválida, por favor elija una opción válida")
			}

		case 3:
			fmt.Println("Gracias por visitarnos, vuelva pronto")
			return
		}
	}
}
```

En este caso solo agregamos dos líneas de código:

```go
var VersionType = "gratis"
```

y

```go
fmt.Println("Pico-manejador de restaurantes. Versión: " + VersionType)
```

Vamos a ver que pasa si hacemos un `go run` normal:

![version gratis](/img/posts/crudgo/gratis.png)

Como es de esperarse, se imprime el valor de nuestra variable global, vamos a probar cambiando el valor de esta variable usando el flag `-ldflags`:

```bash
go run -ldflags "-X main.VersionType=premium" .
```

![version premium](/img/posts/crudgo/premium.png)

Chido perrón, como podemos ver, el valor de nuestra variable global cambió, y esto se puede hacer en tiempo de compilación, lo cual es muy útil para diferenciar entre versiones de nuestro programa. Lo puedes aplicar si, distribuyes los binarios o incluso en un servidor de descargas con cuentas de usuarios. A los usuarios sin cuenta o con cuenta gratis les puedes dar una versión limitada de tu programa, y a los usuarios con cuenta premium les puedes dar una versión completa con tu propio panel de administración.

En las siguientes secciones vamos a usar esta técnica para crear una versión premium de nuestro programa y "vender" esas funcionalidades premium a nuestros usuarios.

#### Crear un reporte en PDF.

Vamos a añadir una función que nos permita crear un reporte en PDF de todas las comidas y bebidas que tenemos en nuestro restaurante. 

Como ya llevo casi un mes escribiendo este post, voy a mostrarte solo una función "sencilla", recuerda que este proyecto lo subí a GitHub, si necesitas la versión actualizada o completa por X o Y razón, el link estará al final del post.

Vamos a ver, Go por si solo no puede generar un PDF, si, es cierto que PDF es solo PostScript, pero no es tan sencillo como escribir un archivo de texto plano y exportarlo a mano. Pero ahorita tenemos "mindset" de developer, o sea, podemos usar una biblioteca que nos permita hacerlo, en este caso vamos a usar [gofpdf](https://github.com/signintech/gopdf). 

Primero lo primero vamos a instalar la biblioteca con `go get`:

```bash
go get -u github.com/signintech/gopdf
```

En caso de que algo salga mal o no lo podamos usar en el código "a la primera", es probable que necesites ejecutar el comando `go mod tidy` para que Go descargue las dependencias de la biblioteca correctamente:

```bash
go mod tidy
```

Ahora si, vamos a crear una función que nos permita crear un reporte en PDF de todas las comidas y bebidas que tenemos en nuestro restaurante. Vamos a ver la estructura de nuestro archivo de comidas para sacar correctamente los datos:

```
id: 1
nombre: Big Mac
precio: 100.000000
cantidad: 30
ingredientes: pan, queso, carne, mostaza, catsup, verduras

id: 2
nombre: Mariscos
precio: 200.000000
cantidad: 20
ingredientes: pescado, camaron, guajillo, pulpo, calamar

id: 3
nombre: Big Mac
precio: 200.000000
cantidad: 400
ingredientes: pan, queso, carne, mostaza, catsup, verduras
```

Vamos a ver que necesitará la función. 

1. Un argumento que aloje la versión del programa, si se está usando la versión gratis le mostraremos al usuario un mensaje explicando que esa funcionalidad solo está disponible en la versión premium.
2. Un argumento que aloje el nombre del archivo PDF que vamos a crear.
3. Un argumento que aloje el nombre del restaurante que vamos a mostrar en el PDF.

Vamos a ver la función que nos quedó (con todo y docstring):

```go
// genPDF genera un archivo PDF a partir del contenido del archivo "comida.txt".
// El archivo PDF creado tendrá un título especificado en el argumento "title"
// y se guardará en la ubicación especificada en el argumento "filename".
// Si la versión especificada en el argumento "version" es "gratis", la función
// mostrará un mensaje indicando que esta funcionalidad solo está disponible en la
// versión premium y finalizará el programa. Si la versión no es reconocida o no
// es "gratis" o "premium", la función mostrará un mensaje indicando que la versión
// no es reconocida y finalizará el programa. Si el archivo "comida.txt" no existe,
// la función mostrará un mensaje indicando que no hay comidas registradas y finalizará
// el programa.
func genPDF(version string, filename string, title string) {
	if version == "gratis" {
		fmt.Println("No se puede usar esta funcionalidad en la versión gratis.")
		fmt.Println("Por favor, considere comprar la versión premium. Para disfrutar de esta y muchas otras funcionalidades.")
		os.Exit(1)
	} else if version == "premium" {
		// Comprobar que el archivo comida.txt exista
		if _, err := os.Stat("comida.txt"); os.IsNotExist(err) {
			fmt.Println("No hay comidas registradas. Agrega una comida primero.")
			os.Exit(1)
		}

		file, err := os.Open("comida.txt")

		if err != nil {
			fmt.Println("Error al abrir el archivo de comidas")
			os.Exit(1)
		}

		defer file.Close()

		// Crear el archivo PDF
		pdf := gopdf.GoPdf{}
		pdf.Start(gopdf.Config{PageSize: *gopdf.PageSizeA4})
		pdf.AddPage()

		err = pdf.AddTTFFont("sans", "./DejaVuSans.ttf")
		if err != nil {
			fmt.Println("Error al cargar la fuente")
			os.Exit(1)
		}

		err = pdf.SetFont("sans", "", 14)

		if err != nil {
			fmt.Println("Error al cargar la fuente")
			os.Exit(1)
		}

		pdf.SetLineWidth(1)
		pdf.Cell(nil, title)
		pdf.Br(40)

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := scanner.Text()
			pdf.Cell(&gopdf.Rect{W:500, H: 12}, line)
			pdf.Br(12)
		}

		err = pdf.WritePdf(filename)

		if err != nil {
			fmt.Println("Error al crear el archivo PDF")
			os.Exit(1)
		}

	} else {
		fmt.Println("Versión no reconocida del programa. Es probable que esté usando una versión no	oficial.")
		os.Exit(1)
	}
}
```

Turbo perfecto. Ya tenemos nuestra función para generar el PDF. Ya estamos usando los conceptos básicos que vimos antes, podemos observar que estamos volviendo a usar un scanner y la parte del PDF solo es crear una estructura vacía y comenzar a modificarla con las funciones que nos provee la biblioteca.

Debo hacer una aclaración, hay un par de líneas interesantes en la función, específicamente:

```go
err = pdf.AddTTFFont("sans", "./DejaVuSans.ttf")

// Y

err = pdf.SetFont("sans", "", 14)
```

Que se encargan de incrustar una fuente en el archivo PDF. Esta fuente es la que se usa para mostrar el texto en el PDF. Si no se incrusta la fuente, el programa detendrá su ejecución de forma abrupta con un panic.

En mi caso yo solo copie la fuente `DejaVuSans.ttf` de mi Linux, en `/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf` a la carpeta de mi proyecto. Si no tienes esta fuente, puedes descargarla o usar otra que te guste, solo recuerda que deberás aprenderte la familia de la fuente que estás usando para poder usarla en el PDF y colocar el archivo en la carpeta de tu proyecto.


Ahora vamos a añadir su uso en el menú principal:

```go
		case 1:
			fmt.Println("🍔🍕 COMIDAS 🍟🥪")
			fmt.Println("-----------------------------------------")
			fmt.Println("            1️⃣ Alta                     ")
			fmt.Println("            2️⃣ Baja                     ")
			fmt.Println("            3️⃣ Modificación             ")
			fmt.Println("            4️⃣ Listado                  ")
			fmt.Println("            5️⃣ Volver al Menú           ")
			if VersionType == "premium" {
				fmt.Println("------------------PREMIUM----------------")
				fmt.Println("            6️⃣ Generar Reporte en PDF   ")
			}
			fmt.Println("-----------------------------------------")
			fmt.Println("🍽️ Elija una opción: ")

			fmt.Scanln(&opcion2)
			fmt.Print("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")

			switch opcion2 {
			case 1:
				altaComida()
			case 2:
				bajaComida()
			case 3:
				modificarComida()
			case 4:
				consultarComida()
			case 5:
				menu()
			case 6:
				genPDF(VersionType, "reporte.pdf", "Restaurante el oso placoso")
			default:
				fmt.Println("Opción inválida, por favor elija una opción válida")
			}
```

Aquí, "por si o por no", estamos haciendo una especie de "double-check" de los valores de nuestra variable `VersionType`. Si el valor es "premium", entonces mostramos la opción 6, si no, no la mostramos. Esto para que, features premium, solo se muestren en la versión premium. Con esto tenemos dos filtros ya, si el usuario no tiene la versión premium, no podrá usar la opción 6, y en caso de que consiga entrar en la opción 6 (no se como), la función `genPDF` le mostrará un mensaje indicando que esa funcionalidad solo está disponible en la versión premium. Además de que, si el string de la versión no es "gratis" o "premium", la función `genPDF` le mostrará un mensaje indicando que la versión no es reconocida y finalizará el programa.

Es importante notar que este tipo de barreras solo detienen a los usuarios con muy pocas o ninguna base de programación / computación, no protegerá tu bolsillo de las personas que tienen conocimiendos más avanzados. Pero, es mejor que no tener protecciones y, si necesitas de protecciones más avanzadas puedes tratar de usar un sistema de licencias, pero eso ya es otro tema en el que no me meteré porque igual, odio el software privativo y no quisiera enseñarte a hacer algo así de feo.

Vamos a probar nuestra función:

![premium2](/img/posts/crudgo/premium2.png)

Si compilamos usando `-ldflags "-X main.VersionType=premium"` podemos ver que la opción 6 aparece en el menú. Y efectivamente, logramos generar un PDF con los datos de las comidas:

![pdf](/img/posts/crudgo/pdf.png)

Ok, ok, yo se que no es el PDF más bonito, presentable y profesional del mundo. De nuevo usemos el mindset de dev a nuestro favor:

> Pero funciona.

No te recomiendo entregar cosas culerillas como esto, trata de jugar un poco más con gopdf para añadir imágenes, formato, figuras y una fuente más bonita. Pero, por ahora, esto es suficiente.

Es tu turno, trata de hacer una función que exporte los datos de las bebidas a PDF de la misma forma.

#### Guardar los datos en un archivo csv o json.

Vamos a ver como podemos guardar los datos de las comidas en un archivo csv. Para esto vamos a crear una función que se encargue de guardar los datos en un archivo csv:

```go
// genCSV genera un archivo CSV a partir del archivo de texto "comida.txt"
// y lo guarda con el nombre especificado en el parámetro filename.
// Si la versión es "gratis", se imprime un mensaje de error indicando que esta funcionalidad no está disponible en la versión gratuita.
// Si la versión es "premium", se verifica que el archivo "comida.txt" exista y se crea el archivo CSV.
// El archivo CSV contiene la información de las comidas, incluyendo el id, nombre, precio, cantidad e ingredientes.
// Parámetros:
// - version: una cadena que indica la versión del programa.
// - filename: una cadena que indica el nombre del archivo CSV a generar.

func genCSV(version string, filename string) {
	if version == "gratis" {
		fmt.Println("No se puede usar esta funcionalidad en la versión gratis.")
		fmt.Println("Por favor, considere comprar la versión premium. Para disfrutar de esta y muchas otras funcionalidades.")
		os.Exit(1)
	} else if version == "premium" {
		// Comprobar que el archivo comida.txt exista
		if _, err := os.Stat("comida.txt"); os.IsNotExist(err) {
			fmt.Println("No hay comidas registradas. Agrega una comida primero.")
			os.Exit(1)
		}

		file, err := os.Open("comida.txt")

		if err != nil {
			fmt.Println("Error al abrir el archivo de comidas")
			os.Exit(1)
		}

		defer file.Close()

		// Crear el archivo CSV
		csvFile, err := os.Create(filename)

		if err != nil {
			fmt.Println("Error al crear el archivo CSV")
			os.Exit(1)
		}

		defer csvFile.Close()

		writer := csv.NewWriter(csvFile)
		defer writer.Flush()

		var item Comida
		scanner := bufio.NewScanner(file)

		// Escribir la cabecera del archivo CSV
		writer.Write([]string{"id", "nombre", "precio", "cantidad", "ingredientes"})

		for scanner.Scan() {
			line := scanner.Text()

			if strings.HasPrefix(line, "id: ") {
				id, _ := strconv.Atoi(strings.TrimSpace(strings.Split(line, ":")[1]))
				item.id = id
			} else if strings.HasPrefix(line, "nombre: ") {
				item.nombre = strings.TrimSpace(strings.Split(line, ":")[1])
			} else if strings.HasPrefix(line, "precio: ") {
				precio, _ := strconv.ParseFloat(strings.TrimSpace(strings.Split(line, ":")[1]), 64)
				item.precio = precio
			} else if strings.HasPrefix(line, "cantidad: ") {
				cantidad, _ := strconv.Atoi(strings.TrimSpace(strings.Split(line, ":")[1]))
				item.cantidad = cantidad
			} else if strings.HasPrefix(line, "ingredientes: ") {
				ingredientes := strings.TrimSpace(strings.Split(line, ":")[1])
				item.ingredientes = strings.Split(ingredientes, ",")
				writer.Write([]string{strconv.Itoa(item.id), item.nombre, strconv.FormatFloat(item.precio, 'f', 2, 64), strconv.Itoa(item.cantidad), strings.Join(item.ingredientes, ",")})
			}
		}
	} else {
		fmt.Println("Versión no reconocida del programa. Es probable que esté usando una versión no	oficial.")
		os.Exit(1)
	}
}
```

Nice. Es un chorizote, pero nice. Aquí debemos añadir el módulo "encoding/csv" para poder usar la función `NewWriter` y `Flush` que nos permiten escribir en el archivo CSV. De nuevo tenemos el "double check" con respecto a la licencia y listo.

Vamos a ver si en efecto logró exportar los datos de las comidas a un archivo CSV:

![premium3](/img/posts/crudgo/premium3.png)

Aquí seleccionamos la opción 7 y, si el menu se muestra, todo indica que el archivo CSV se generó correctamente. Vamos a ver el contenido del archivo CSV:

![csv](/img/posts/crudgo/csv.png)

En palabras del poderoso Faraón Love Shady: *"[...] y de lo cual. Por desnutrición crónica estaría ahí en el hospital."*

Un logro más, ¿crees poder reciclar el código para generar un archivo CSV con los datos de las bebidas? Te dejo ese reto. Igual te lo vas a poder robar de GitHub en un futuro no muy lejano.


No te emociones, aun debemos hacer que el programa emita un archivo JSON como reporte de nuestras comidas. No separes los dedos del teclado, porque viene lo chido.

#### Añadir la ""firma digital"" del software. (Puro pedo de marketing) y crear un "Makefile" para compilar el programa y generar el ejecutable de acuerdo a nuestras necesidades consumistas, elegidas por una sociedad donde el dinero es la representación de la...

Vamos a crear un Makefile para que sea más fácil para nosotros manejar los recursos de este proyecto, además de ser una genial, artesanal y muy respetable forma de compilar nuestros proyectos, pero no tan genial como contar con un `./configure.sh` y un `make install` para instalar nuestro software en cualquier sistema operativo. Pero, no puedo hacer todo en esta vida, aún me falta barrio.


Veamos, nuestro Makefile necesitará hacer las siguientes cosas:

1. Compilar el programa y generar un ejecutable para pruebas.
2. Compilar el programa y generar un ejecutable para producción, strippeado y con la firma digital. Que ese programa pueda compilarse de dos formas, usando ldflags para poner la variable `VersionType` como `"premium"` y otra para ponerla como `"gratis"`.
3. Construir la imágen de Docker usando el Dockerfile.
4. Subir y Bajar el contenedor de Docker, tanto de la versión gratis como de la versión premium.
5. Subir y Bajar el contenedor de Docker usando docker-compose, tanto de la versión gratis como de la versión premium.

Primero vamos a crear el Makefile:

```bash
touch Makefile
```

y vamos a añadir lo siguiente:

```Makefile
EXECUTABLE_NAME := cafe

VERSION := 0.1.0

BUILD_FLAGS := -v

BUILD_FLAGS_PREMIUM := -v -ldflags="-X main.VersionType=premium"

SIGNATURE_FILE := ./signature.txt

DOCKER_IMAGE_NAME := cafe_container

.PHONY: all build build-premium test clean docker-build docker-run docker-stop docker-compose-up docker-compose-down

all: build

build:
	go build $(BUILD_FLAGS) -o $(EXECUTABLE_NAME)

build-premium:
	go build $(BUILD_FLAGS_PREMIUM) -o $(EXECUTABLE_NAME)_premium
	go build $(BUILD_FLAGS) -ldflags="-s -w" -o $(EXECUTABLE_NAME)_strip
	md5sum $(EXECUTABLE_NAME)_strip > $(SIGNATURE_FILE)
	sha256sum $(EXECUTABLE_NAME)_strip >> $(SIGNATURE_FILE)

docker-build:
	docker build -t $(DOCKER_IMAGE_NAME):latest .

docker-run:
	docker run --rm -d --name $(EXECUTABLE_NAME)_gratis $(DOCKER_IMAGE_NAME):latest
	docker run --rm -d --name $(EXECUTABLE_NAME)_premium $(DOCKER_IMAGE_NAME):latest -VersionType=premium

docker-stop:
	docker stop $(EXECUTABLE_NAME)_gratis
	docker stop $(EXECUTABLE_NAME)_premium

docker-compose-up:
	docker-compose up -d

docker-compose-down:
	docker-compose down
```

Si nunca has escrito un Makefile, en un momento te explico bien que es todo este desbarajuste y como funciona. Si ya te consideras buen@ escribiendo Makefiles te pido perdón por la forma en la que escribo el mío, se que está bien culebro pero es lo que se me ocurrió a estas alturas xD

Vamos a ver bien, los archivos `Makefile` son archivos que contienen instrucciones para compilar y construir un proyecto usando Gnu Make. Make es un sistema experto y puedes hacer builds para cualquier lenguaje de programación. La razón de usar make es que, si está bien escrito, podemos hacer "rebuilds" parciales de nuestro programa, es decir, solo actualizar los "pedazos" que necesitamos y pues nos ahorra escribir comandos largos y tediosos.

Y si, podrás decirme *"Pero, ¿Por qué no un bash? o Python"*

Bueno, make tiene varias cosas entre ellas una sintaxis *"declarativa"* (según), maneja dependencias y lo más rico es que, puede manejar varios "trabajos" por ti. No, make **NO** es multihilo, es multiproceso. Manda las instrucciones al background y se encarga de manejarlas por ti con la bandera `-j <número de procesos>`, todos en paralelo. Según la documentación de Gnu Make:

> GNU make knows how to execute several recipes at once. Normally, make will execute only one recipe at a time, waiting for it to finish before executing the next. However, the ‘-j’ or ‘--jobs’ option tells make to execute many recipes simultaneously. You can inhibit parallelism in a particular makefile with the .NOTPARALLEL pseudo-target (see Special Built-in Target Names).

Y ahora sabes algo más, aprovecha las cualidades de Make cuando puedas, te ahorrará tiempo y esfuerzo, o, si quieres implementar todo eso en un script bash / python, adelante.

Realmente esos beneficios los vas a disfrutar más en proyectos grandes y pesados, en algo chico como esto si podrías usar un simple `setup.sh` y ya. Pero es mejor que aprendas un build system como Make, CMake, SCons, etc. Te va a servir muchísimo en el futuro.

Ahora si, vamos a explicar este Makefile para que te des una idea. Primero lo primero, en la parte superior de nuestro Makefile definimos lo que son las variables, si estás poniendo atención, podrás ver que estoy usando un operador muy conocido para ti, ahora que ya sabes un poco de Go. Si, hablo del operador `:=`. En Makefile, puedes utilizar múltiples tipos de asignaciones, no entraré en detalles sobre todas (son 4, pero que flojera). Solo debemos saber que, las 2 formas usadas aquí tienen propósitos diferentes.

- `:=` es una asignación "sencilla", es decir, se evalúa UNA SOLA VEZ, en el momento en el que se asigna el valor a la variable. Si la variable ya tiene un valor, este se sobreescribe.

- `=` el clásico "igual" es en realidad una asignación "recursiva", es decir, se evalúa cada vez que se usa la variable. Si la variable ya tiene un valor, este se concatena con el nuevo valor.

En este caso, usamos `:=` para asignar los valores de las variables que no van a cambiar, como el nombre del ejecutable, la versión, los flags de compilación, etc. Y usamos `=` para asignar los valores de las variables que van a cambiar, como el nombre de la imagen de Docker, el nombre del archivo de firma, etc.

Vamos a ver, en este caso las variables tienen los siguientes valores:

- `EXECUTABLE_NAME := cafe` el nombre del ejecutable que vamos a generar. En nuestro caso, se llama "cafe". No es muy creativo, pero puedes cambiarlo a lo que tu quieras.

- `VERSION := 0.1.0` la versión de nuestro programa. En este caso, es la versión 0.1.0. Si nos pegamos mucho al semantic versioning, esto significa que nuestro programa está en la versión 0, es decir, es un programa que está en desarrollo y no es estable.

- `BUILD_FLAGS := -v` los flags de compilación que vamos a usar para compilar nuestro programa. En este caso, solo usamos el flag `-v` que es para que el compilador nos muestre el nombre de los archivos que está compilando.

- `BUILD_FLAGS_PREMIUM := -v -ldflags="-X main.VersionType=premium"` los flags de compilación que vamos a usar para compilar nuestro programa premium. En este caso, usamos el flag `-v` que es para que el compilador nos muestre el nombre de los archivos que está compilando y el flag `-ldflags` que es para pasarle variables al linker. En este caso, le pasamos la variable `main.VersionType` con el valor `premium`. Lo que expliqué antes, vamos a cambiar variables en tiempo de compilación.

- `SIGNATURE_FILE := ./signature.txt` es el nombre del archivo de firma que vamos a usar para firmar nuestro ejecutable. En este caso, se llama "signature.txt" y está en la carpeta raíz del proyecto. Con esto los usuarios podrán verificar que el ejecutable que están usando es el que tu compilaste.

- `DOCKER_IMAGE_NAME := cafe_container` es el nombre de la imagen de Docker que vamos a generar. En este caso, se llama "cafe_container". No es muy creativo, solo es el nombre del app y la palabra "container". Haz una buena nomeclatura, no seas como yo.

Luego de ver nuestras variables, nos encontramos con la siguiente línea:

```makefile
.PHONY: all build build-premium test clean docker-build docker-run docker-stop docker-compose-up docker-compose-down
```

En Gnu Make, un target `PHONY` es un target que no genera un archivo. Es decir, no genera un archivo llamado "all", "build", "build-premium", etc. En este caso, usamos `PHONY` para definir los targets que vamos a usar en nuestro Makefile. El caso de uso más común para un `PHONY` target es cuando tenemos un paso `clean` en nuestro Makefile. El target `clean` no genera un archivo, solo borra los archivos generados por el Makefile. Si no usamos `PHONY` para definir el target `clean`, Make va a tratar de buscar un archivo llamado "clean" y si lo encuentra, no va a ejecutar el target `clean`. Si usamos `PHONY`, Make va a ejecutar el target `clean` sin importar si existe un archivo llamado "clean" o no.

Otra cosa es que, como podemos ver el nombre del "target" comienza con un `.`, esto es para que el target no sea visible cuando ejecutamos `make help`. Si no usamos el `.`, el target va a ser visible cuando ejecutemos `make help`.

*"Pero Omar. ¿Qué vrg es un target?"*. Mi queridísimo lector, un target es un "paso" en nuestro Makefile. Es decir, cuando ejecutamos `make build`, Make va a ejecutar el target `build`. Si ejecutamos `make build-premium`, Make va a ejecutar el target `build-premium`. Si ejecutamos `make docker-build`, Make va a ejecutar el target `docker-build`. Y así sucesivamente.

Dicho esto, vamos a ver los targets que tenemos en nuestro Makefile y que hace cada uno.

- `all` es el target que se ejecuta por defecto cuando ejecutamos `make`. En este caso, ejecuta el target `build`.
- `build` es el target que se encarga de compilar nuestro programa. En este caso, compila nuestro programa con el nombre que definimos en la variable `EXECUTABLE_NAME` y con los flags que definimos en la variable `BUILD_FLAGS`. Luego de compilar nuestro programa, firma el ejecutable con el archivo de firma que definimos en la variable `SIGNATURE_FILE`.
- `build-premium` es el target que se encarga de compilar nuestro programa premium. En este caso, compila nuestro programa con el nombre que definimos en la variable `EXECUTABLE_NAME` y con los flags que definimos en la variable `BUILD_FLAGS_PREMIUM`. Luego de compilar nuestro programa, firma el ejecutable con el archivo de firma que definimos en la variable `SIGNATURE_FILE`.
- `docker-build` es el target que se encarga de generar la imagen de Docker de nuestro programa. En este caso, genera una imagen de Docker con el nombre que definimos en la variable `DOCKER_IMAGE_NAME` y con el tag `latest`.
- `docker-run` es el target que se encarga de ejecutar la imagen de Docker de nuestro programa. En este caso, ejecuta la imagen de Docker que definimos en la variable `DOCKER_IMAGE_NAME` con el tag `latest`.
- `docker-stop` es el target que se encarga de detener la imagen de Docker de nuestro programa. En este caso, detiene la imagen de Docker que definimos en la variable `DOCKER_IMAGE_NAME` con el tag `latest`.
- `docker-compose-up` es el target que se encarga de ejecutar la imagen de Docker de nuestro programa con Docker Compose. En este caso, ejecuta la imagen de Docker que definimos en la variable `DOCKER_IMAGE_NAME` con el tag `latest` con Docker Compose.
- `docker-compose-down` es el target que se encarga de detener la imagen de Docker de nuestro programa con Docker Compose. En este caso, detiene la imagen de Docker que definimos en la variable `DOCKER_IMAGE_NAME` con el tag `latest` con Docker Compose.

Esta parte puede ser un poco compleja de explicar y de entender, pues acabamos de ver un CRUD entero en Go y ahorita andamos viendo Makefile, algo completamente distinto, paciencia, ya viene el final.

### Crear una página de manual usando Groff

Si, lo se, esta mugre no tiene el chiste suficiente como para hacrle una *manpage* por si sola y, bueno, tienes razón. Sin embargo, considero que es importante enseñarte esto. Cuando tenemos una herramienta que hicimos o un programa que no es para nosotros, es importante que tengamos una forma de documentación que explique como utilizarlo.

En nuestro caso, vamos a usar [groff](https://www.gnu.org/software/groff/) para escribir nuestro manual. Las páginas de manual se escriben en texto plano, pero se utiliza la sintaxis de groff para darle formato a nuestro texto. En este caso, vamos a crear un archivo llamado `cafe.1` en la carpeta `man` de nuestro proyecto. En este archivo, vamos a escribir lo siguiente:

```groff
.TH CAFETERIA 1 "Mayo 2023" "Versión 1.0" "Página de manual para Cafetería"

.SH NOMBRE
Cafeteria - Un CRUD de comidas y bebidas.

.SH SINOPSIS
.B cafeteria

.SH DESCRIPCIÓN
Cafeteria es un CRUD de comidas y bebidas.

.SH AUTOR
Este programa fue creado por la esquina gris.
```

No se como explicarte lo que es Groff sin llevarme un párrafo grande, si lo quieres ver de una forma más decente, puedes pensarlo como un Markdown más complejo o un LaTeX muy minimalista. Vamos a explicarte que onda con todo lo que escribimos:

En la primer línea tenemos `.TH CAFETERIA 1 "Mayo 2023" "Versión 1.0" "Página de manual para Cafetería"`. Esta línea define el título de nuestra página de manual. En este caso, el título de nuestra página de manual es `CAFETERIA`, la sección es `1`, la fecha de la versión es `Mayo 2023`, la versión es `Versión 1.0` y el título de la página de manual es `Página de manual para Cafetería`.

En la segunda línea tenemos `.SH NOMBRE`. Esta línea define el nombre de nuestra página de manual. En este caso, el nombre de nuestra página de manual es `Cafeteria - Un CRUD de comidas y bebidas.`.

En la tercera línea tenemos `.SH SINOPSIS`. Esta línea define la sinopsis de nuestra página de manual. En este caso, la sinopsis de nuestra página de manual es `cafeteria`.

En la cuarta línea tenemos `.SH DESCRIPCIÓN`. Esta línea define la descripción de nuestra página de manual. En este caso, la descripción de nuestra página de manual es `Cafeteria es un CRUD de comidas y bebidas.`.

Finalmente en la quinta línea tenemos `.SH AUTOR`. Esta línea define el autor de nuestra página de manual. En este caso, el autor de nuestra página de manual es `Este programa fue creado por la esquina gris.`.

Podemos probar nuestra página de manual con el siguiente comando:

```bash
man ./cafe.1
```

Deberíamos ver una terminal como esta:

![manpage](/img/posts/crudgo/manpage.png)


Gracias a Groff, es un poco más sencillo realizar esas páginas de manual, e incluso, por su sencillez y su formato, podemos convertirlo a un PDF. Para convertirlo a un PDF, vamos a ejecutar el siguiente comando:

```bash
groff -man cafe.1 > cafe.pdf
```

Este comando va a tomar nuestro archivo `cafe.1` y lo va a convertir a un PDF llamado `cafe.pdf`. Si abrimos el PDF, vamos a ver que se ve algo así:

![pidief](/img/posts/crudgo/pidief.png)

Ya sabemos como documentar de una forma decente nuestros programas. Si, puede parecer tedioso y aburrido escribir documentos para explicar lo que nuestro código hace, pero es una práctica esencial para el futuro. Honestamente creo que una manpage es la forma más elegante y eficiente que tenemos de dar algo de información útil de nuestros programas.

Podemos añadir todo tipo de detalles útiles como la sintaxis de los comandos, las opciones disponibles, las restricciones de entrada, etc. ¡Incluso podemos añadir ejemplos de uso para que los usuarios puedan empezar a utilizar nuestro programa sin tener que pensar demasiado! Con suerte chatGPT no tendrá las respuestas a su problema y disfrutarás unos 15 minutos de verlos buscar que sigue cuando te falla la IA.
 
### Crear un README llamativo y subir nuestro proyecto a GitHub.

Vamos a ver. Ya tenemos todo, un CRUD que funciona, una página de manual, docker para probar todo. ¿Qué más necesitamos?

Exacto...hacerlo libre.

Si tu, como desarrollador, independientemente de tu trabajo, has hecho un software, sea lo que sea, proyecto personal, producto, etc, te recomiendo liberarlo con una licencia de código abierto. No solo es una buena práctica, sino que también te ayuda a que otras personas puedan utilizar tu software y, con suerte, contribuir a él.

Vamos a subir nuestro proyecto, primero lo primero debemos crear un archivo llamado `LICENSE`, que tendrá dentro el texto de la licencia que queramos utilizar. En este caso, vamos a utilizar la licencia [GPLv3](https://www.gnu.org/licenses/gpl-3.0.html). Si no sabes como proceder te recomiendo bajar una copia del texto en [choosealicense.com](https://choosealicense.com/licenses/gpl-3.0/).

Ahora, luego de eso, vamos a crear un archivo llamado `README.md`. En este archivo vamos a escribir lo siguiente:

```markdown
# Café 🍵

Café es un CRUD de comidas y bebidas escrito en Go. Con Café, puedes agregar, editar, eliminar y ver los elementos de un menú de comidas y bebidas desde la línea de comandos. Además, Café te permite exportar el menú a formatos de archivo populares como .txt, .csv y .pdf.

## Instalación ⬇🖥

Para instalar Café, primero debes clonar el repositorio de GitHub en tu máquina local:

`git clone https://github.com/VentGrey/cafe.git`

A continuación, asegúrate de tener instalado Go en tu sistema. Para comprobar si tienes Go instalado, ejecuta el siguiente comando en la línea de comandos:

`go version`

Si Go está instalado, verás la versión de Go que tienes instalada en tu sistema. Si no tienes Go instalado, visita la [página oficial de descargas de Go](https://go.dev/dl/) para descargar e instalar la versión correspondiente a tu sistema operativo.

Una vez que tengas Go instalado, accede al directorio donde clonaste el repositorio y ejecuta el siguiente comando para compilar el programa:

`go build`

Esto creará un archivo ejecutable llamado "cafe" en el mismo directorio.

## Uso 🖥

Para utilizar Café, simplemente ejecuta el archivo ejecutable "cafe" desde la línea de comandos:

`./cafe`

A partir de aquí, sigue las instrucciones en la pantalla para agregar, editar, eliminar y ver los elementos del menú.

Para exportar el menú a un archivo, sigue las instrucciones en pantalla y elige uno de los formatos disponibles (.txt, .csv o .pdf). El archivo exportado se guardará en el mismo directorio que el archivo ejecutable.

## Contribución 🤝

Si encuentras un error o quieres agregar una nueva funcionalidad a Café, no dudes en hacer un pull request en el repositorio de GitHub. ¡Estamos siempre abiertos a nuevas ideas y mejoras!

## Licencia 📜

Café está bajo la licencia GPLv3. Consulta el archivo LICENSE para más información.

¡Gracias por utilizar Café! Esperamos que disfrutes creando y editando tu menú de comidas y bebidas con este sencillo pero poderoso programa. Si tienes alguna pregunta o problema, no dudes en abrir un issue en el repositorio de GitHub.
```

Con un README.md bonito, podrías atraer a una buena cantidad de gente a tu proyecto, procura añadir detalles como imágenes comandos y los emojis, no olvides los emojis. Esas cosas son como el "clickbait" de GitHub y vaya que son efectivos, de esa manera podrás contribuir a devs más raritos cada que tus proyectos digan por ahí: "Blazing Fast 🔥🚀".

Ahora, vamos a subir nuestro proyecto a GitHub. Para ello, primero debemos crear un repositorio en GitHub. Si no sabes como crear un repositorio de GitHub o no tienes una cuenta te invito a ver [este video](https://www.youtube.com/watch?v=9uvwQ_MZ0UM).

Una vez que hayas creado el repositorio, vamos a ejecutar los siguientes comandos dentro del directorio donde tengamos nuestro proyecto, como yo ando haciendo el blog pues me quedo dentro del directorio `cafe/` que es donde he estado desarrollando el CRUD aquí visto:

```bash
git init
git add .
git commit -m "Primer commit"
```

Listo, ya tenemos nuestro primer commit, ahora debemos añadir nuestro repositorio creado como un "control remoto", es decir, le estamos diciendo a git que nuestro repositorio de GitHub es el repositorio remoto de nuestro proyecto. Para ello, ejecutamos el siguiente comando:

```bash
git remote add origin https://github.com/VentGrey/cafe.git
```

En tu caso deberás sustituir la URL por la URL de tu repositorio, reemplaza "VentGrey" por tu nombre de usuario de GitHub y "cafe" por el nombre de tu repositorio.

Como paso final para subir nuestro proyecto a GitHub, ejecutamos el siguiente comando:

```bash
git push -u origin master
```

Esto subirá nuestro proyecto a GitHub y lo vinculará con nuestro repositorio local. Si vas a tu repositorio de GitHub, verás que ya está todo tu proyecto subido.

Hablando en un tono más personal. Procura no subestimar tus proyectos, sin importar el tamaño o la calidad de los mismos, súbelos a GitHub. Está mal visto en la red social de los chillones y el pajarito azul que uses o dispongas de un portafolio público o de una cuenta de GitAlgo. En lo personal a mi me ha servido más de una ocasión, es solo otra forma de demostrar una parte de tus conocimientos.

> *"Es que subo puros repos feos*

Bueno, si lo haces con el tiempo, notarás que los feos actuales son mejores que los feos pasados, es decir, son menos feos y eso es señal de progreso, si, quizá no tienes 10 repositorios y uno de ellos tiene unas 1000 ⭐ estrellas. Pero funciona para representar una especie de "Timeline" de tu progreso como programador, además, si alguien te pide que le muestres tu código, puedes decirle que lo busque en tu GitHub, así no tienes que estar pasando archivos por correo o por WhatsApp, no des cringe.

Si quieres contribuir a la humanidad con tu código, hazlo, mejor si es como software libre, así, también ayudarás a una buena causa y lo digo por experiencia, el día menos pensado te va a llegar una notificación de alguien en algún lugar de los prados altos del culo del mundo, diciendote que tu código le ha servido para algo que debía de hacer.

## Conclusión.

Tardado, tardado, tardado y más tardado. Poco más de un mes para terminar de escribir este blog, corregirlo y tener el código de todo a la mano para explicarlo. Con suerte no tendré tantos horrores de ortografía. 

  * [ ] Espero que este blog, más que enseñarte la total inutilidad de un CRUD, te ayude a mejorar tus proyectos, llevarlos a una versión estable y presentarlos como parte de lo que sabías construir en ese momento. 

### Retos para el lector.

Vamos a ponerte un par de retos para que practiques lo que aprendiste en este tutorial y extiendas tu CRUD en Go y tu conocimiento. Trata de hacer lo siguiente:

- Elimina el uso de ID's numéricos y usa UUID's.
  - Hint: usa la librería para [uuid](https://pkg.go.dev/github.com/google/uuid).
- Trata de hacer que la función de exportar a PDF sea genérica y pueda exportar a PDF tanto comidas como bebidas.
  - Hint: Para que la función sea genérica, puedes crear una función que reciba un parámetro de tipo `interface{}`. Así podemos pasarle tanto un `[]Comida` como un `[]Bebida`.
- Busca la forma de autogenerar las funciones de alta, baja, modificación y consulta para las comidas y bebidas.
  - Hint: Usa interfaces genéricas que permitan la comunicación entre el código de las funciones y los objetos de tipo `Comida` y `Bebida`.
- Crea un logo para tu software y añádelo a tu PDF.
  - Hint: Puedes usar tu herramienta de diseño favorita como [GIMP](https://www.gimp.org/) o [Inkscape](https://inkscape.org/).
- Trata de hacer que el menú principal sea dinámico y se adapte a la pantalla del usuario.
  - Hint: Échale un ojo a tview en GitHub, es una biblioteca que te permite crear interfaces de usuario en la terminal.
- Añade una opción llamada "export web" que genere un sitio web con los datos de las comidas y bebidas.
  - Hint: Puedes usar [Hugo](https://gohugo.io/) para generar el sitio web o Gin para incrustar un servidor web en tu programa.

¿Se escucha difícil? En efecto, es lanzarse al hoyo sin paracaídas. PERO puedes apoyarte de otros, tratar de completar las tareas más fáciles primero o solo añadir lo que te guste. NO es tarea, es práctica. Y la práctica siempre, **SIEMPRE** hace al maestro.

**NO** es necesario completar todos los retos. Si te sientes abrumado, puedes empezar por los más sencillos o solo añadir lo que te guste. Lo importante es practicar y aprender de tus errores. ¡Ánimo y sigue programando! Creeme, vas a aprender más cuando tocas código y no cuando tomas 10,000 cursitos en plataformas que te dan un PDF que lo único que demuestra es que eres muy bueno viendo vídeos y copiando código.

### Canción triste del día.


### Créditos

Este blog larguísimo fue posible con la ayuda de:

- GitHub Copilot (que me ayudó a corregir parte del código).
- ChatGPT (que me ayudó a corregir partes del texto o explicar mejor algunos conceptos).
- Opeth (que me ayudó a mantenerme deprimente mientras escribía este blog).
