---
title: "Primeras impresiones de Go"
date: 2023-03-06
tags: ["Desarrollo de software", "Go", "Ejecutables", "Opinión", "Otros", "Personal", "Programación"]
categories: ["Go", "Personal"]
author: "VentGrey"
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "En este blog vamos a ver mis primeras impresiones del lenguaje de programación Go. ¿Realmente es el tan bueno?"
canonicalURL: "https://vengrey.github.io/posts/primeras-impresiones-go"
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
    image: "/img/posts/gofirst/cover.png" # image path/url
    alt: "Imágen del post" # alt text
    caption: "Imágen del post" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/<path_to_repo>/content"
    Text: "Sugerir Cambios" # edit text
    appendFilePath: true # to append file path to Edit link
---

# ¿Go? ¿Golang? ¿Qué eres?

Hace poco, por un par de motivos que no explicaré en este blog, comencé a aprender el lenguaje de programación *Go*, en este blog les voy a contar un poco mis primeras impresiones, cositas que tiene que me recuerdan mucho a otros lenguajes y un par de aspectos extraños de Go.

No conozco mucho Go, sin embargo, he leído código del mismo y en algunas ocasiones he usado herramientas creadas con el, por ejemplo [drone](https://drone.io) para CI/CD (*Integración y despliegue continuos*), [docker](https://docker.com) para contenedores, [gitea](https://gitea.io) para repositorios e incluso [hugo](https://gohugo.io) para generar este blog.

Me llevé una buena impresión solo por el *boca a boca* que había escuchado de este lenguaje, pero no me imaginé la experiencia tan...interesante que me iba a tocar vivir al usarlo por primera vez.

> Maldita sea, ya necesito un léxico más depurado.

## ¿Realmente es el "C del sigo 21"? O ¿Solo es Pascal 2?

De buenas a primeras, Go me recordó mucho a Pascal, uno de los primeros lenguajes que aprendí y rápidamente le tomé cariño, lamentablemente Pascal ya no es tan reconocido y no es un lenguaje muy popular por lo que los recursos escasean. Por mi no hay tanto problema, al final la comunidad no define que tan bueno o malo es un lenguaje, pero eso es harina de otro costal.

Veamos algunas de las características más bonitas de Go:

1. Tiene sintaxis muy parecida a C y Pascal, solo por esto, se ganó mi cariño instantáneo.
2. Es de tipado estático, lo cual es bueno para la seguridad del código.
3. Es un lenguaje compilado con una característica muy interesante de la cual hablaré más adelante.
4. Si bien tiene un garbage collector (kiasko), es muy eficiente y lo mejor de todo es que lo puedes "apagar" si lo deseas.
5. No es orientado a objetos, tiene algunas características, pero, bien hechas. Me recuerdan a las de Object Pascal.
6. Es un lenguaje concurrente gracias a las gorutinas, las cuales son muy fáciles de usar y muy potentes (Sobre todo para servidores).
7. No es de mi agrado realmente, pero su duck-typing es muy bueno, es decir, no necesitas especificar el tipo de una variable, solo que tenga las características que necesitas.
8. No tiene excepciones, pero tiene un mecanismo de errores muy bueno.
9. La declaración de variables e imports es muy sencilla y limpia, muy parecida a la de Pascal.
10. No me agrada que el `;` sea opcional, sin embargo, en Go el código se ve muy limpio y ordenado, por lo que puedo hacer a un lado mis caprichos tarugos.
11. No tiene aritmética de punteros, pero tiene un mecanismo de punteros muy bueno y muy fácil de usar. Encima evita que hagas un cagadero con la memoria.
12. El compilador tiene algunas reglas muy hermosas de las que hablaré más adelante.

Vamos a ver algunas cosas lindas de Go para que se den una idea de lo que les estoy hablando.

### 1. Sintaxis parecida a Pascal y C.

Una de las cosas más bonitas de Go es su sintaxis, es muy parecida a Pascal y C, lo cual es muy bueno para los que venimos de esos lenguajes. Veamos un ejemplo:

```go
package main

import "fmt"

func main() {
    // Podemos declarar variables de la siguiente manera
    var nombre string = ""
    var edad int = 0

    // O de esta otra manera aprovechando el duck-typing (similar a Pascal)
    nombre_mascota := ""
    edad_mascota := 0
    
    /* Los comentarios pueden ser como C o C++ */

    // Como en C y Pascal podemos leer datos de la consola ya sea con Scanf o Scanln
    fmt.Println("Hola, ¿Cómo te llamas?")
    fmt.Scanln(&nombre)
    fmt.Println("¿Cuántos años tienes?")
    fmt.Scanln(&edad)
    
    // O podemos leer datos de la consola con Scanf
    fmt.Println("¿Cómo se llama tu mascota?")
    fmt.Scanf("%s", &nombre_mascota)
    fmt.Println("¿Cuántos años tiene tu mascota?")
    fmt.Scanf("%d", &edad_mascota)
    
    // Y podemos imprimir datos en la consola
    fmt.Printf("Hola %s, tienes %d años y tu mascota se llama %s y tiene %d años.\n", nombre, edad, nombre_mascota, edad_mascota)
}
```

En términos de similitud con Pascal, tenemos que, podemos declarar variales de forma implícita, cosa que hicimos con `nombre_mascota` y `edad_mascota`. Con respecto a la similitud con C, tenemos que podemos leer datos de la consola con `Scanf`, además de que podemos imprimir datos en la consola con `Printf`.


Pero ahí no termina todo. Vamos a ver que pasa con las variables ¿como podemos declarar "varias" de golpe?:

```go
package main

import "fmt"

func main() {
    // Podemos usar esta sintaxis que a mi parecer es un poco más elegante:
    var (
        nombre string = ""
        edad int = 0
        nombre_mascota string = ""
        edad_mascota int = 0
    )
    
    /* Los comentarios pueden ser como C o C++ */

    // Como en C y Pascal podemos leer datos de la consola ya sea con Scanf o Scanln
    fmt.Println("Hola, ¿Cómo te llamas?")
    fmt.Scanln(&nombre)
    fmt.Println("¿Cuántos años tienes?")
    fmt.Scanln(&edad)
    
    // O podemos leer datos de la consola con Scanf
    fmt.Println("¿Cómo se llama tu mascota?")
    fmt.Scanf("%s", &nombre_mascota)
    fmt.Println("¿Cuántos años tiene tu mascota?")
    fmt.Scanf("%d", &edad_mascota)
    
    // Y podemos imprimir datos en la consola
    fmt.Printf("Hola %s, tienes %d años y tu mascota se llama %s y tiene %d años.\n", nombre, edad, nombre_mascota, edad_mascota)
}
```

Si viste la parte de declaración de variables de forma extraña o poco familiar, no te preocupes, lee el siguiente punto.

### 2. Tipado estático y la NO inferencia de tipos.

En el ejemplo anterior vimos que podemos declarar un conjunto de variables dentro de `var()`, debo destacar que, en Go, las variables que declares dentro de un bloque `var()` deben ser explícitas, es decir, no podrás usar el operador `:=` para declararlas. Sinceramente prefiero esta forma a usar el duck-typing porque, si bien el duck-typing es muy conveniente en términos de tamaño de código y "legibilidad", no es muy conveniente cuando se trata de variables que no son explícitas, es decir, que no tienen un tipo de dato asociado.

Otra cosa un poco fea del duck-typing es que, deja en manos del programador la responsabilidad de escribir código limpio y libre de errores, cosa que aquí no hacemos porque, ya saben, no se confía en el programador. En el caso de Go a este tipo de asignaciones con el operador `:=` se les llama "short declarations". 

Debo aclarar que Go, **NO** tiene inferencia de tipos, el operador `:=` es de hecho algo más parecido a la palabra reservada de C++ `auto`, es decir, es un operador que le dice al compilador que use la expresión en la que se inicializa la variable para inferir el tipo de dato de la misma. Los tipos *"inferidos"* en Go se determinan en tiempo de compilación, no en tiempo de ejecución.

Para ejemplificar esto un poco mejor, veamos el siguiente código:

```go
package main

import "fmt"

func main() {
    x := 2
    y := 1
    
    z:= x + y
    
    fmt.Println(z)
}
```

Si ejecutamos este código, veremos que el resultado es `3`, pero si ejecutamos el siguiente código:

```go
package main

import "fmt"

func main() {
    x := 2
    y := 1.0
    
    z:= x + y
    
    fmt.Println(z)
}
```

Oops! El compilador nos da un error que dice: "Invalid operation: x + y (mismatched types int and float64)". Esto es porque, en Go, no se puede sumar un entero con un flotante, por lo que el compilador nos dice que no podemos hacer esa operación. Si nuestro codebase es lo suficientemente grande, esto puede ser un problema, ya que, si no tenemos un linter que nos diga que hay un error, no lo vamos a saber hasta que no tratemos de compilar el código. Este ejemplo es bastante sencillo y, muchos lenguajes no permiten la suma de un entero con un flotante de por si. Pero, si tenemos un código más complejo, esto puede tornarse un poco tedioso de depurar si no tienes un buen linter o si no tienes permitido usar uno.

Otra cosa importante es que, una vez que una variable es declarada de forma explícita no será posible cambiar su tipo de dato, aun con el operador `:=`. Por ejemplo, si tenemos el siguiente código:

```go
package main

import "fmt"

func main() {
    var x int = 0
    x := 1.0
    
    fmt.Println(x)
}
```

Esto nos arrojará un error "no new variables on the left side of :=", esto es porque, una vez que una variable es declarada de forma explícita, no se puede volver a declarar de forma implícita.

Lo mismo si tenemos el siguiente código:

```go
package main

import "fmt"

func main() {
	x := 0
	x := 1.0

	fmt.Println(x)
}
```

Es decir, una vez declarada una variable, salvo un caso especial, no será posible redeclararla o cambiar su tipo de dato. Cosa que en mi opinón es excelente porque evita errores de programación. Esto no significa que las variables de Go sean inmutables per-se, sino que, una vez declaradas, no se puede cambiar su tipo de dato al menos no directamente.

Si por alguna razón necesitas cambiar el tipo de dato de una variable puedes convertirla a otro tipo de dato usando una función de conversión, por ejemplo, si tenemos el siguiente código:

```go
package main

import "fmt"

func main() {
    x := 0
    x = float64(x)

    fmt.Println(x)
}
```

Pues ya, pedo resuelto. Pero, ¿qué pasa si necesitamos cambiar el tipo de dato de una variable a un tipo de dato que no es compatible con el tipo de dato de la variable? Por ejemplo, si tenemos el siguiente código:

```go
package main

import "fmt"

func main() {
    x := 0
    x = string(x)

    fmt.Println(x)
}
```

El compilador nos arrojará un error que dice: "cannot convert x (type int) to type string". Esto es porque, en Go, no se puede convertir un entero a un string, por lo que el compilador nos dice que no podemos hacer esa operación. Esto parece obvio, pero luego de conocer lenguajes de logotipo amarillo, cuyo nombre comienza con la letra J y termina en "avaScript", pues...¿qué mas te digo? 

```js
const y = 19;

console.log(y + " ba" + + + "as" + "as" + " y 200 litros de yakult");

// Salida: 19 baNaNas y 200 litros de yakult
```

### 3. Compilado tan bonito como un interpretado.

No, Go no es interpretado. Aunque un lenguaje puede ser ambos, Go decidió tomar el camino de ser 100% compilado, sin embargo, tiene una característica muy interesante que lo hace """"""""parecer"""""""" interpretado. (Entre un chingo de comillas por si sale algún listillo).

¿Como es esto de "parecer" interpretado? Bueno, una cualidad de Go que es HERMOSA son sus tiempos de compilación. En mi opinión, los tiempos de compilación de Go son de los mejores que he visto en cualquier lenguaje de programación, estando al lado de C y Pascal.

Como usuario de Rust, esto se agradece mucho, ya que, si bien Rust es un lenguaje compilado, sus tiempos de compilación son bastante largos, por lo que, si tienes que compilar tu código cada vez que haces un cambio, pues...te vas a morir de viejo. Gracias a Dios, Go no está escrito en el cagadero que es LLVM.

Gracias a esos tiempos de compilación rápidos, podemos hacer "pruebas rápidas" de nuestro programa. Si bien, no es lo mismo que el REPL de un lenguaje interpretado y no podremos hacer prototipado tan rápido, es una característica que se agradece mucho. Para usarla a nuestro favor, podemos usar el comando `go run` para compilar y ejecutar nuestro código en un solo comando.

Podemos probar nuestro programa usando `go run` y cuando estemos seguros de que nuestro programa funciona, podemos compilarlo usando `go build` y ejecutarlo usando `./nombre_del_ejecutable`.

### 4. Garbage collector eficiente.

No soy fan de los garbage collectors, aun así reconozco su utilidad y la necesidad de su existencia. Lamentablemente pocas personas tienen las luces suficientes para liberar memoria de forma correcta (Yo *NO* soy de esas personas).  Go tiene un garbage collector que es bastante eficiente, por lo que no deberías preocuparte por el rendimiento de tu programa. Lo mejor de todo es que puedes ""apagarlo"" si no lo necesitas.

El garbage collector de Go es enorme y requeriría de más de un post para explicarlo a detalle, si quieres saber más sobre el garbage collector de Go, puedes leer la [guía oficial](https://tip.golang.org/doc/gc-guide).

### 5. Gorutinas.

Las gorutinas son una de las cosas más interesantes de Go para realizar código concurrente. Las gorutinas son una forma de ejecutar código de forma concurrente, pero no es lo mismo que un hilo. Las gorutinas son más livianas que los hilos, por lo que es un poco más difícil hacer un desperdiciadero de recursos. Además de que son la forma de Go para escribir código asíncrono y lo mejor es que es un sistema de "asíncrono" bien hecho. Se acabó el hacer SetTimeout y SetInterval o abusar the `async`, `await` y `.then().then().then().then().finally()` en otros lenguajes.

Veamos un ejemplo sencillo de "gorutinas" en Go:

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    go func() {
        fmt.Println("Hola")
    }()

    time.Sleep(1 * time.Second)
}
```

En este código, tenemos una gorutina declarada con la palabra reservada `go` y una función anónima. La función anónima se ejecutará en una gorutina y se ejecutará en paralelo con el resto del código. Si ejecutamos este código, veremos que el programa se ejecutará e imprimirá la palabra "Hola" en la salida estándar después de un segundo.

Si piensas que estoy tirando caca sin razón, te invito a leer [este blog](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/).

### 6. No tiene excepciones, pero tiene un mecanismo de errores muy bueno.

Go tiene una forma de manejar errores poco convencional, sin embargo en lo personal la encuentro muy "xd" de usar. En Go los errores son un segundo valor de retorno de una función, por lo que (*extrema redundancia incoming*), si una función devuelve un error, el segundo valor de retorno será el error. Veamos un ejemplo:

```go
package main

import (
    "fmt"
    "os"
)

func main() {
    file, err := os.Open("archivo_que_no_existe.txt")

    if err != nil {
        fmt.Println(err)
    }

    fmt.Println(file)
}
```

En este caso estamos tratando de abrir un archivo que no existe, por lo que el error no será `nil` y se imprimirá en la salida estándar. Si el archivo existe, el error será `nil` y el archivo se imprimirá en la salida estándar. Pero ¿Qué significa eso de `err != nil`? Simple, `err` es un puntero a una estructura de datos que contiene información sobre el error. Dicha estructura de datos tiene un método interno llamado `Error()` que devuelve un `string` con la información del error. Esto es útil si queremos imprimir el error en la salida estándar, pero si queremos hacer algo más con el error, podemos usar el operador `switch` para hacer un match con el error.

```go
package main

import (
    "fmt"
    "os"
)

func main() {
    file, err := os.Open("archivo_que_no_existe.txt")

    if err != nil {
        switch err := err.(type) {
        case *os.PathError:
            fmt.Println("No se encontró el archivo")
        default:
            fmt.Println("Otro error")
        }
    }

    fmt.Println(file)
}
```

Algunos podrían argumentar que esto es un mal diseño o que prefieren excepciones. Rust tiene un mecanismo de manejo de errores muy similar y personalmente pienso que fue una excelente desición el mantenerse alejados de las excepciones, son lentas y un dolor de cabeza.

### 7. Dos reglas de compilación riquisisisimas Ron Damón.

Hay dos reglas de compilación (lamentablemente opcionales) que Go tiene y que, pienso que vienen como anillo al dedo. Por favor, necesitamos más lenguajes con estas reglas.

1. ¿Tienes un import sin usar? Ni madres que te compila.
2. ¿Tienes una variable sin usar? Ni madres que te compila.

Veo en StackOverflow (no me sorprende), a personas quejandose de estas dos reglas, pero debo decirlo, como alguien que se dedica(ba?) a configurar pipelines de CI/CD que analizaban el código en más de una forma, era muy común ver que fallaban por que en algunos lenguajes estas dos reglas no aplican y se les olvidaba quitar los imports o variables sin usar. En Go, si no usas una variable o un import, no compila, y eso es bueno. Así ya no le echan la culpa al DevOps porque *son muy estrictas las pipelines*. 🙄

Lo único que le falta es detectar código comentado y tampoco dejarte compilar, pero bueno, no todo es perfecto. 😅

### 8. Una stdlib bastante extensa.

Viene una parte un poco controversial que yo encuentro muy buena. Siendo mi lenguaje favorito Rust, una cosa muy graciosa que he notado es que no hay un generador de números aleatorios pedorro en la stdlib. En Go la biblioteca estándar tiene cosas bastante útiles de buenas a primeras, leyendo algunos de sus paquetes, me encontré con cosas como:

- `crypto` - Paquete para cifrar y descifrar datos.
- `encoding` - Paquete para codificar y decodificar datos.
- `flag` - Paquete para leer flags de la línea de comandos.
- `fmt` - Paquete para interactuar con la salida estándar.
- `io` - Paquete para interactuar con la entrada y salida estándar.
- `log` - Paquete para crear registros o reportar errores.
- `math` - Paquete para operaciones matemáticas.

Y mucho más, también podemos encontrar paquetes para HTML, una interfaz portable para redes y sockets, formas de interactuar con el sistema operativo, bases de datos, expresiones regulares, y mucho más. En Rust, la stdlib es bastante extensa, pero no tanto como en Go.

Me faltó mencionar muchísimas más cosas, sin embargo, mi cerebro solo puede parir texto cada X minutos y en este momento no tengo más inspiración para seguir con la lista. Pasemos a la siguiente sección.

## Lo no tan bonito de Go

Como soy un quejumbroso, la necesidad del autosabotaje y de encontrarle un "pero" a todo, no podía faltar. En esta sección voy a mencionar algunas cosas que no me gustan tanto de Go.

### 1. Binarios estáticos == Binarios gordos.

Al igual que Pascal, Go compila sus binarios de forma estática. Esto quiere decir que el binario que se genera al compilar tu programa, incluye todo el código de las bibliotecas que usaste, lo cual, puede llegar a ser conveniente en ciertos casos de uso porque no necesitas instalar TOOOODAS las bibliotecas necesarias en tu sistema operativo, si eres usuario de KDE o usuario de cualquier cosa que necesite QT, sabrás lo que es instalar 20-25 dependencias por algo tan tonto como un visor de fotos.

No he realizado una comparación directa entre los tamaños resultantes de los binarios de Go, Rust y Pascal. La ventaja es que, al menos, Rust te ofrece una bandera del compilador para usar *linkeo dinámico* en los binarios, o también una opción para eliminar los símbolos de depuración.

Lo que me gustó de Go es que no tiene la típica forma de "Debug version" y "Release version" en los binarios. Aun así, tampoco es el fin del mundo con esto, go tiene un par de banderas que quitan un poco de basura de los binarios. Aunque, los hola mundo de 1.8 MB me parecen un poco exagerados.

Esto viene explicado más a detalle en las preguntas más frecuentes de Go:

> The linker in the gc toolchain creates statically-linked binaries by default. All Go binaries therefore include the Go runtime, along with the run-time type information necessary to support dynamic type checks, reflection, and even panic-time stack traces.

> A simple C "hello, world" program compiled and linked statically using gcc on Linux is around 750 kB, including an implementation of printf. An equivalent Go program using fmt.Printf weighs a couple of megabytes, but that includes more powerful run-time support and type and debugging information.

> A Go program compiled with gc can be linked with the -ldflags=-w flag to disable DWARF generation, removing debugging information from the binary but with no other loss of functionality. This can reduce the binary size substantially.

¿Mencioné que de nada sirve si tu "binario estático" usa una biblioteca que necesite de otra que no está escrita en Go y necesita "linkeo" dinámico? 😅

Si quieres saber más de binarios de *linkeo* (o enlazado) estático o dinámico te dejo [este post de Red Hat](https://access.redhat.com/documentation/es-es/red_hat_enterprise_linux/8/html/developing_c_and_cpp_applications_in_rhel_8/static-and-dynamic-linking_using-libraries-with-gcc#:~:text=Comparaci%C3%B3n%20de%20la%20vinculaci%C3%B3n%20est%C3%A1tica,estas%20bibliotecas%20como%20archivos%20separados.&text=La%20vinculaci%C3%B3n%20est%C3%A1tica%20da%20lugar,grandes%20que%20contienen%20m%C3%A1s%20c%C3%B3digo.)

### 2. Solo hay una forma de hacer ciclos.

No tengo mucho por lo cual quejarme aquí. Go no tiene ciclos como `while` o como `do` `while`, Go solo cuenta con una forma de hacer ciclos, y es con `for`. Por lo que, si necesitas alguna estructura similar a un `while` o `do` `while`, tendrás que usar un `for` con una condición.

Desconozco la razón por la cual se tomó esa desición en Go, pero en lo personal me parece *casi* demasiado ridícula.

### 3. No hay sobrecarga de métodos, funciones u operadores.

Una cosa graciosa de Go es que no tiene sobrecarga de métodos, funciones u operadores. Esto quiere decir que, si tienes una función que recibe un `int` y otra que recibe un `string`, no puedes tener una tercera función que reciba un `interface{}` y que pueda recibir ambos tipos de datos.

Al menos en las preguntas más frecuentes de Go tenemos una respuesta y es, la simplicidad. No es que sea una respuesta mala, pero dos pesitos de madre porfas. La sobrecarga de operadores también es presentada más como una conveniencia que como una necesidad, por lo tanto, adiós a hacer cosas chistosas como sumar estructuras.

### 4. No existen las "assertions" en la stdlib al menos.

De forma chistosa, en la biblioteca estándar de Go no existe alguna función "assert" para crear pruebas unitarias, mejor conocidas como "unit tests". En este caso, Go nos da la función `panic()` que, similar a Rust, detiene el programa completamente con un código de error, nosotros debemos encargarnos de crear las pruebas usando esta función y varios `if`.

La justificación de Go es que, los devs usan las funciones assert para "evitar pensar en un correcto manejo de errores".

Afortunadamente existen paquetes bastante pequeños que nos pueden dar assertions, aunque no me molesta realmente que falten, si podría tornar métodos de trabajo como el "Test Driven Development" un poco más complicados de implementar. O al menos terminaríamos con un codebase de pruebas unitarias que podría terminar siendo un cagadero.


### 5. El cagadero del directorio $HOME

Si hay algo más molesto que un programa que crea un directorio oculto en `$HOME` es un programa que crea un directorio que NO está oculto en `$HOME` y Go hace eso precisamente. Entiendo que sea necesario para el manejo de paquetes, pero no es necesario que sea tan visible, bien podría vivir dentro de `$HOME/.local/share/go` o algo así.

Es posible modificar esto con la variable de entorno `GOPATH`, pero por defecto Go usa `$HOME/go` y no `$HOME/.go` lo que personalmente me parece que solo aporta al desorden del directorio del usuario. Además, no he encontrado una razón práctica para hacer algo así.

Supongo que en este punto los usuarios de Ubuntu podrán entender lo que se siente cuando tienes un directorio no deseado estorbando tus directorios principales...¿verdad `snap`?


## "General Purpose" no significa "Usar a lo wey"

El propósito de este blog no es venderte Go como si fuera la última Coca-Cola del desierto. Es un lenguaje de programación y por lo tanto es solamente una herramienta más, no una panacea. Para las tareas que yo podría desempeñar como administrador de sistemas Linux o como DevOps, Go puede ser una buena opción, especialmente si lo combino con Rust para algunas tareas.

Pero, si quisiera hacer desarrollo web front-end o algo más extraño como ciencia de datos o matemáticas, usar Go sería como: "Taladrar un pastel para partirlo". Se puede pero...se va a hacer un desmadre horrible.

### Leyendo algunos argumentos pedorros contra Go.

Al momento de hacer este blog, tuve que investigar mucho acerca de Go, al tratarse de algo nuevo para mi, trato de buscar la mayor cantidad de información que me sea posible. En esa búsqueda me topé con blogs e incluso recopilaciones de blogs que argumentan que Go es un mal lenguaje. Parece ser que aun no se entiende que todos los lenguajes están horribles, solo que algunos están menos horribles que otros, porque sirven para diferentes cosas.

En fin, el punto es que muchos de estos blogs tienen argumentos un poco extraños y un par de *ad-hominem* en ellos. Así que, luego de un blog largo y pesado de leer. ¿Por que no me acompañas a leer y ver que podemos responder a esto?.


#### 1. Rob Pike dijo que Go es para programadores "menos listos".

Este es probablemente uno de los argumentos que más he visto repetirse. Las palabras exactas de Rob Pike fueron:

> The key point here is our programmers are Googlers, they’re not researchers. They’re typically, fairly young, fresh out of school, probably learned Java, maybe learned C or C++, probably learned Python. They’re not capable of understanding a brilliant language but we want to use them to build good software. So, the language that we give them has to be easy for them to understand and easy to adopt. – Rob Pike

Por alguna razón que aún no entiendo esto causó un ardor de puertas traseras más fuerte que comer habaneros a mordidas. Desconozco si esto llegó a la comunidad hispanohablante, sin embargo, al menos los programadores angloparlantes no se lo tomaron muy bien, asumiendo que las palabras de Rob Pike eran una ofensa a la inteligencia de los programadores.

Supongo que ellos no abusan de los memes como este:

![meme tipo tech twitter](https://miro.medium.com/v2/resize:fit:1280/0*k2e54v9911Mrl303)

O quizás ellos no abrazan la práctica de depurar con `print()`o lo que sea imprima a salida estándar en el lenguaje que usan, como si fuera un "defecto" que debes hacer tuyo y no sentirte mal por las malas prácticas....¿verdad tech twitter? 👀

Creo que, si bien no es correcto decir que Go es para programadores menos listos, aun así, si la verdadera razón del diseño fue la *in-experiencia* o la facilidad con la que un programador puede regarla, pues ¿Eso no es "sacar lo mejor de lo peor"?

Desconozco si fue un caso de palabras malentendidas o si directamente solo fue otra de esas reacciones en búsqueda de un enemigo imaginario. ¿Qué piensas tu? Sería interesante escucharte o leerte.

#### 2. El lenguaje parece del pasado, tiene conceptos viejos. (En algún lugar leí que lo describían como "Stuck in the 70's")

Nunca entendí realmente los argumentos que se refieren a Go como "atascado en el pasado". Cosa que es muy irónica cuando la escuchas salir de la boca de gente que sigue viendo la programación orientada a objetos como la única forma de hacer las cosas.

Effectively my dearest 🐔 traguer, Go se basó en muchos lenguajes viejitos como C, Pascal, SmallTalk, etc para algunas de sus características, sin embargo, el lenguaje apunta a la simplicidad y con ello, la facilidad de uso. Si, es cierto, no tenemos tantos *shorthands* como otros lenguajes, sin embargo eso no quita que se pueda seguir siendo igual de productivo, pues cosas muy completas se han logrado hacer en Go como Gitea, Docker e incluso Kubernetes.

#### 3. Le falta "azúcar sintáctica".

Si bien el azúcar sintáctica es una característica que muchos lenguajes modernos tienen, no es algo que sea necesario para un lenguaje. En el caso de Go, el lenguaje es bastante simple, no tiene muchas características que lo hagan más complejo de lo que es y eso es parte de su encanto.

Además, tengo un amigo que programa en Julia y eso **SI** tiene azúcar sintáctica. Compararlo con Go sería tonto de mi parte, pues sus propósitos y áreas de aplicación pueden ser muy diferentes de cuando en cuando.

#### 4. No tiene interoperabilidad con otros lenguajes que no sean C.

Hay un vergo de lenguajes que no tienen un FFI extensa, no los veo haciendo tanto pedo por ello.

#### 5. No tiene un IDE decente.

¿Realmente necesitas un IDE? Habrá quien me diga que son necesarios para la "productividad", sin embargo con la cantidad de cosas que tenemos hoy en día el no tener un IDE "decente" ya no debería ser un problema. Existe GoLand, hecho por JetBrains, el cual es un IDE bastante decente. En caso de no poder pagarlo tenemos muchas opciones y para más INRI, son 100% gratuitas, tienes Visual Studio Code, hecho por 🤢, Sublime Text, Vim, Emacs y en estos años (2023) ya tenemos tecnologías como el language server protocol, que nos permiten tener funcionalidades similares a un IDE en cualquier editor de texto que soporte dicho protocolo.

#### 6. "Atorado en el pensamiento de UNIX"

No entiendo (y quizás nunca entienda) esta clase de pensamiento. ¿Atorado? Bueno fuera que estuvieramos atorados en esa filosofía, así quizá comience a ser mal visto programar cosas complejas cuando deberían de ser simples. Quizás y solo quizás no estaríamos tan ahogados en bugs así.

#### 7. No es orientado a objetos.

[Que bueno](https://betterprogramming.pub/object-oriented-programming-the-trillion-dollar-disaster-92a4b666c7c7?gi=78425b2adeda).

Personalmente la POO me parece delesnable. Es útil, sí, sin embargo, es el claro ejemplo de la frase: "Ordeñar una vaca vieja hasta dejarla seca", hazte un favor y aprende programación estructurada o funcional, no te arrepentirás, podrás hacer cosas más complejas y con menos código.

#### 10. No ofrece una buena "Developer Experience".

Ni la más mínima idea de que sea eso.

## Conclusión.

Son pocos los días que llevo aprendiendo Go como lenguaje, sin embargo, es de los pocos lenguajes a los que he tardado en encontrarles realmente un pero. Estoy bastante consciente de que esto se debe a un sesgo muy grande de parte mía por su similitud a Pascal. Pero, si te soy sincero no es algo que quisiera quitarme. 

Para las cosas que yo hago o para un par de herramientas que me gustaría publicar más adelante, creo que Go hace un trabajo estupendo y, si el tiempo me da, me gustaría escribir un blog de como usar estos dos lenguajes para ayudarnos a ser *the ultimate sysadmin*. Cosa que no soy, PERO, tu podrías llegar a serlo :)

### Canción triste del día.

I Just Shot John Lennon - The Cranberries

![Spotify Code](/img/posts/gofirst/spotify.png)

## Referencias

- [Effective Go (oficial de Go.dev)](https://go.dev/doc/effective_go)
- [Preguntas más frecuentes de Go](https://go.dev/doc/faq#Why_is_my_trivial_program_such_a_large_binary)
- [Go by Example](https://gobyexample.com/)
- [Go Tour](https://tour.golang.org/welcome/1)
- [Go Playground](https://play.golang.org/)
- [Go sitio oficial](https://golang.org/)
- [Guía del garbage collector de Go](https://tip.golang.org/doc/gc-guide)
- [What color is your function?](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/)
- [Suave, quien me enseñó el blog de las funciones](https://github.com/Suavesito-Olimpiada)

---

¿Te gustan estos blogs? Ayúdame a seguir escribiéndolos de las siguientes formas:
- [Invítame un raspado de limón](https://ko-fi.com/ventgrey)
- [Regálame un follow en GitHub ❤](https://github.com/VentGrey)

