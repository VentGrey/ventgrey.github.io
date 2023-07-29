---
title: "Concurrencia en Go. Se la envidia de los programadores async/await"
date: 2023-07-27
tags: ["Desarrollo de software", "Go", "Programación", "Concurrencia", "Programación Concurrente"]
categories: ["Go", "Programación"]
author: "VentGrey"
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "¿Cansad@ de que la programación asíncrona apeste en todos los lenguajes? Bueno, te tengo excelentes noticias, en Go es muy sencillo empaparse de concurrencia. En este post te enseñaré como hacerlo."
canonicalURL: "https://canonical.url/to/page"
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
    image: "/img/posts/concurrencia/cover.png" # image path/url
    alt: "Imágen del post" # alt text
    caption: "Imágen del post" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/<path_to_repo>/content"
    Text: "Sugerir Cambios" # edit text
    appendFilePath: true # to append file path to Edit link
---

# Go-d damn, shit the bed!

Hola de nuevo, luego de volver a abandonar el blog por unos meses (que novedad), he vuelto a escribir, y esta vez, con un tema que, considero es una parte un poco menos "digerible" de Go, pero que es muy importante, y que, si se entiende bien, puede ser una herramienta muy poderosa. 

Hablo nada más y nada menos que de la poderosísima concurrencia en Go.

Algo hermoso de Go es que, su soporte nativo para concurrencia es muy bueno, nos permite realizar múltiples tareas al mismo tiempo, y de una manera muy sencilla, sin tener que preocuparnos por cosas como el manejo de hilos, o el uso de semáforos, mutexes, etc.

## ¿Qué es la concurrencia?

La concurrencia en nuestro contexto (programación/informática) es un concepto que puede ser un poco complicado de entender de buenas a primeras. Podemos intentar entenderlo con un ejemplo pedorro como lo es un festival de música en vivo (Piensa en: Corona Capital, Vive Latino, Domination, Hell & Heaven, etc).

En estos festivales no se tiene uno, sino varios escenarios, cada uno presentando a una banda diferente. Piensa en cada escenario como una tarea o proceso de un programa. 

Los que van al festival son los "hilos" de ejecución del programa, cada uno va al festival con la intención de disfrutarlo al máximo.

Aquí es donde entra en nuestro ejemplo la concurrencia, imagina que anuncian una mala noticia, no se, la razón más común que se me ocurre es la lluvia que, es experta apendejando gente (Si no, mira como conducen en tu ciudad cuando llueve). Estos problemas llevan a que en el festival, solo haya un escenario, esto nos lleva a que solamente una banda pueda tocar a la vez, y que, por lo tanto, los asistentes al festival tengan que esperar a que termine la banda que está tocando para poder ver a la siguiente.

Esto es lo que se conoce como programación secuencial, en la que, una tarea debe terminar para que otra pueda comenzar.

Bueno, cuando el festival funciona de forma correcta, podemos decir que es "concurrente" ya que, múltiples tareas o procesos se ejecutan al mismo tiempo. Traducido al festival, esto quiere decir que, tú, como asistente, tienes la libertad de moverte entre escenarios para disfrutar de diferentes conciertos al mismo tiempo.

Es importante destacar que, al igual que en un festival, la concurrencia también puede presentar desafíos. La coordinación y sincronización entre los procesos pueden ser complicadas para evitar conflictos y problemas de ejecución, al igual que puede ser difícil decidir a qué escenario dirigirte en el festival si hay dos de tus bandas favoritas tocando al mismo tiempo.

En súper resumen:

> La concurrencia es la capacidad de un programa para ejecutar múltiples tareas al mismo tiempo. Esto puede variar desde ejecutar múltiples procesos en diferentes núcleos de CPU, hasta ejecutar múltiples procesos en un solo núcleo de CPU.

## Las goroutines, el nectar de la concurrencia en Go.

En Go, una *"Goroutine"* o traducido a lo bestia al Español, una *"Gorutina"*, es una unidad ligera de concurrencia que nos permite ejecutar múltiples tareas al mismo tiempo. 

> ¿Son hilos?

No exactamente. A diferencia de los hilos "tradicionales" del sistema operativo que podemos usar en lenguajes como C, C++, Java, etc, las gorutinas son administradas por el runtime de Go, esto nos salva de tener que preocuparnos por la creación y destrucción de las mismas, y nos permite enfocarnos en la lógica de nuestro programa.

Además, las gorutinas son más ligeras que dichos hilos tradicionales, de nuevo, su creación y administración es manejada por el runtime de Go y vaya que es bueno administrandolas, dependiendo de tu caso de uso, podrías crear una buena cantidad de gorutinas sin degradar significativamente el rendimiento de tu programa.

En otros lenguajes de programación, como C++ o Java, los hilos se crean y administran utilizando las funciones proporcionadas por el sistema operativo o mediante bibliotecas específicas como `pthread` en C++ o `java.util.concurrent` en Java. Estos hilos siguen un modelo más pesado en términos de recursos, ya que cada hilo generalmente tiene su propio espacio de memoria asignado para su *stack*.

Otra de las ventajas de las gorutinas es la facilidad con las que podemos "sincronizarlas", en Go tenemos algo llamado *canales* o *channels*, los canales nos permiten comunicar las gorutinas entre sí, permiten una comunicación "sincrónica", seguridad en la concurrencia y además de todo, pueden ser creados con o sin capacidad.

> Un canal con capacidad nos permite almacenar una cantidad de "N" elementos, mientras que un canal sin capacidad, no nos permite almacenar elementos, y por lo tanto, nos obliga a sincronizar las gorutinas que lo utilizan. Es decir, el canal sin datos se va a "bloquear" hasta que haya alguna gorutina receptora que pueda recibir los datos que se envían a través del canal.

**NOTA: A los canales sin capacidad a veces los refieren como "Canales sin búfer" en algunos lados. PERO, no te alarmes, son lo perro mismo.**

## ¿Será verdad? Pues pongámoslo a prueba. (Robadísimo de Jimmy, todos sus derechos reservados)

Crear una gorutina es en extremo sencillo, es tan simple como añadir el prefijo `go` a la llamada de una función. Esto le dirá a Go que queremos que crear una nueva gorutina donde se ejecutará la función de forma concurrente con el resto del programa.

Vamos a ver un ejemplo sencillo:

```go
package main

import (
	"fmt"
	"time"
)

func printNumbers() {
	for i := 1; i <= 5; i++ {
		time.Sleep(250 * time.Millisecond)
		fmt.Printf("%d ", i)
	}
}

func printLetters() {
	for i := 'a'; i <= 'e'; i++ {
		time.Sleep(400 * time.Millisecond)
		fmt.Printf("%c ", i)
	}
}

func main() {
	go printNumbers()
	go printLetters()
	time.Sleep(3000 * time.Millisecond)
}
```

En este ejemplo, definimos dos funciones, `printNumbers` y `printLetters`. Ambas funciones imprimen un rango de números y letras respectivamente, con una pequeña pausa entre cada impresión. Cada función imprime cinco (5) elementos, en la función `main`, creamos dos gorutinas, una para cada función, y luego hacemos que el programa espere tres (3) segundos para que las gorutinas puedan terminar de ejecutarse.


Si ejecutamos este código nos daremos cuenta de que, tanto números como letras se imprimen de forma concurrente, no de forma secuencial

```bash
$ go run main.go

1 a 2 3 b 4 c 5 d e 
```

Es importante tener en cuenta que, al finalizar la ejecución de la función main, todas las gorutinas activas también terminarán, incluso si no han completado su tarea. Para evitar que esto suceda y permitir que las gorutinas finalicen correctamente, se pueden utilizar mecanismos de sincronización como los canales o la espera de finalización usando algo conocido como `WaitGroups`.

## WaitGroups, la sincronización de las gorutinas.

Los `WaitGroups` son una herramienta en Go que nos ayuda a coordinar las gorutinas de nuestro programa y esperar a que todas finalicen su ejecución antes de que el programa principal termine. Se utilizan para sincronizar el flujo de ejecución de gorutinas y asegurar que todas las gorutinas hayan completado sus tareas antes de continuar con el resto del programa.

Vamos a ver un ejemplo de como usarlos:

```go
package main

import (
    "fmt"
    "sync"
)

func tarea(id int, wg *sync.WaitGroup) {
    defer wg.Done() // Marcar que la gorutina ha terminado al final de la función
    fmt.Println("Gorutina", id, "iniciando tarea")
    // Simulación de una tarea que toma cierto tiempo
    // ...
    fmt.Println("Gorutina", id, "finalizando tarea")
}

func main() {
    var wg sync.WaitGroup

    totalGorutinas := 5
    wg.Add(totalGorutinas)

    for i := 1; i <= totalGorutinas; i++ {
        go tarea(i, &wg)
    }

    wg.Wait() // Esperar a que todas las gorutinas finalicen

    fmt.Println("Todas las gorutinas han terminado. Fin del programa.")
}
```

La salida del programa anterior será algo como esto:

```bash
$ go run main.go

Gorutina 5 iniciando tarea
Gorutina 5 finalizando tarea
Gorutina 1 iniciando tarea
Gorutina 1 finalizando tarea
Gorutina 4 iniciando tarea
Gorutina 4 finalizando tarea
Gorutina 3 iniciando tarea
Gorutina 3 finalizando tarea
Gorutina 2 iniciando tarea
Gorutina 2 finalizando tarea
Todas las gorutinas han terminado. Fin del programa.
```

¿Qué pasó aquí? Vamos a explicarlo paso a paso.

- Primero, debemos importar el módulo `sync` de la biblioteca estándar de Go. Este módulo contiene la implementación de los `WaitGroups` y otras herramientas de sincronización.

- Creamos el `WaitGroup` con `var wg sync.WaitGroup`. Luego, definimos una variable `totalGorutinas` que nos indica cuántas gorutinas vamos a crear. En este caso, 5.

- Luego, llamamos a `wg.Add(totalGorutinas)` para indicarle al `WaitGroup` que vamos a crear 5 gorutinas. Esto es necesario para que el `WaitGroup` sepa cuántas gorutinas debe esperar antes de continuar con el resto del programa.

- En el ciclo `for` creamos las gorutinas y llamamos a `tarea(i, &wg)` para ejecutar la función `tarea` en una gorutina. También pasamos el `WaitGroup` como un puntero a la función para que pueda marcar la gorutina como finalizada cuando termine.

- Finalmente, llamamos a `wg.Wait()` para esperar a que todas las gorutinas finalicen. Esto bloqueará la ejecución del programa hasta que todas las gorutinas hayan llamado a `wg.Done()`.

¿Genial, no? Los `WaitGroups` son especialmente útiles cuando necesitamos sincronizar varias gorutinas entre si y asegurarnos de que todas hayan terminado antes de continuar con el resto del programa.

> ¿No sirven para lo mismo los canales?

No, es fácil confundirlos si se te va el pedo como a mi, los WaitGroups se utilizan para coordinar y esperar a que las gorutinas finalicen su trabajo, mientras que los canales se utilizan para la comunicación y sincronización de datos entre gorutinas. Los WaitGroups no proporcionan mecanismos de comunicación entre gorutinas, solo se encargan de la sincronización, mientras que los canales permiten enviar y recibir datos entre gorutinas de manera segura y ordenada.

¿Por qué no? Vamos a ver algo de canales también...

## Canales, la comunicación sincrónica entre gorutinas. 

Otra de las muchas herramientas que Go pone a nuestra disposición son los canales, como dije antes, los canales son el mero mole para las gorutinas (y por mero mole me refiero a, usualmente, lo más usado para manejarlas).

Los canales nos permiten sincronizar y comunicar datos entre gorutinas.

Vamos a ver un ejemplo de este pedo:

```go
package main

import "fmt"

func enviarDatosAlCanal(canal chan int) {
    for i := 1; i <= 5; i++ {
        canal <- i // Envia datos al canal
    }
    close(canal) // Cierra el canal cuando termina
}

func main() {
    canal := make(chan int) // Crear un canal sin capacidad

    // Lanzar una gorutina para enviar datos al canal
    go enviarDatosAlCanal(canal)

    // Recepción de datos del canal
    for dato := range canal {
        fmt.Println("Dato recibido:", dato)
    }
}
```

Si ya has tocado lenguajes olvidados por Dios, habrás notado que tenemos un operador "flecha" `<-` que se utiliza para enviar y recibir datos de los canales. En este caso, estamos enviando datos al canal con `canal <- i` y recibiendo datos del canal con `dato := <-canal`.

Aquí la cosa se pone un poquito más interesante que con los `WaitGroups`, no debemos hacer un import propiamente, pero si hay que seguir una sintaxis un poco diferente, vamos a verla:

Como mencionamos anteriormente, podemos crear canales con capacidad o sin capacidad, en ambos casos, podemos utilizar el operador morsa (`:=`) y la función `make` para crear un canal, los canales pueden ser de cualquier tipo de dato, por ejemplo, `chan int` para un canal de enteros, `chan string` para un canal de cadenas, etc.

Para crear un canal sin capacidad utilizamos la siguiente sintaxis:

```go
canal := make(chan int) // make(chan tipo_de_dato)
```

Y, para crear un canal con capacidad, utilizamos la siguiente sintaxis:

```go
canal := make(chan int, 5) // make(chan tipo_de_dato, capacidad)
```

De la misma forma, usaremos el operador flecha (`<-`) para enviar y recibir datos de los canales, por ejemplo, `canal <- 5` para enviar el número 5 al canal, y `dato := <-canal` para recibir un dato del canal y almacenarlo en la variable `dato`.

```go
// Envío de datos al canal
nombreDelCanal <- dato

// Recepción de datos del canal
dato := <-nombreDelCanal
```

Puede que la parte de `dato := <- nombreDelCanal` te confunda un poco, pero es bastante sencillo, lo que hace es recibir un dato del canal y almacenarlo en la variable `dato`, es decir, el dato que se recibe del canal se almacena en la variable `dato`. En palabras más sencillas o si pudieses "interpretar" esa línea de código en tu cabeza sería como:

> "Recibir un dato del canal y almacenarlo en la variable `dato`"

Volvamos al código de ejemplo, en dicho código, creamos un canal *sin capacidad* el cual llamamos `canal`. (Cambié el código a Español para que quede un poco más clara la idea de los canales). Luego, lanzamos una gorutina (`EnviarDatosAlCanal`) que, valga la redundancia, enviará datos al canal al momento de ejecutarse (véase la línea `canal <- i`).

Finalmente, en la función `main`, usaremos un ciclo `for` con la sintaxis `for dato := range canal` para recibir los datos del canal, es decir, el ciclo `for` se ejecutará mientras haya datos en el canal, y en cada iteración, recibirá un dato del canal y lo almacenará en la variable `dato`.

> ¿Notaste el `close(canal)`? Bueno, eso es para cerrar el canal cuando ya no se necesite, esto es importante porque si no cerramos el canal, el programa se quedará esperando a que se envíen más datos al canal, lo cual puede causar un deadlock (bloqueo del programa).

¿Verdad que es hermoso?

Como diría un profesor de mi universidad:

> ¡Ya sabes usar canales!

## Select, el switch de los canales.

Select es otra de las herramientas que nos proporciona Go para trabajar con canales, es como un switch pero para canales, nos permite recibir datos de varios canales al mismo tiempo.

![quegalan](/img/posts/concurrencia/nosborn.jpg)


Vamos a ver que pedo con el `select` con un ejemplo:

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    canal1 := make(chan int)
    canal2 := make(chan int)

    go func() {
        time.Sleep(time.Second)
        canal1 <- 42
    }()

    go func() {
        time.Sleep(2 * time.Second)
        canal2 <- 23
    }()

    select {
    case dato := <-canal1:
        fmt.Println("Dato recibido del canal 1:", dato)
    case dato := <-canal2:
        fmt.Println("Dato recibido del canal 2:", dato)
    }
}
```

La salida de este programa sería algo así:

```bash
$ go run main.go

Dato recibido del canal 1: 42
```

Vamos a ver que pasó en este código, primero, ya sabemos como crear canales, por lo que hacemos dos de tipo `int`, luego de eso viene una parte interesante, ¿notas como la siguiente línea de código está dentro de una función anónima?:

```go
go func() {
    time.Sleep(time.Second)
    canal1 <- 42
}()
```

En otro blog intentaré cubrir los usos de las funciones anónimas en Go, pero por ahora, solo debes saber que las funciones anónimas son funciones que no tienen nombre, y que se ejecutan al momento de ser declaradas, es decir, al momento de declarar la función anónima, esta se ejecuta.

En este caso, declaramos dos funciones anónimas, la primera de ellas duerme por un segundo y luego envía el número 42 al canal 1, mientras que la segunda función anónima duerme por dos segundos y luego envía el número 23 al canal 2.

Finalmente, hacemos uso del `select` para recibir datos de los canales, en este caso, el `select` recibirá el dato del canal 1, ya que el canal 1 envía el dato primero que el canal 2.

Explicado más a detalle:

```go
select {
case dato := <-canal1:
    fmt.Println("Dato recibido del canal 1:", dato)
case dato := <-canal2:
    fmt.Println("Dato recibido del canal 2:", dato)
}
```

> Desconozco porque `gofmt` deja el `select` y el `case` en el mismo nivel de sangría, pero bueno, si así es el estándar de Go, así se quedará.

Select es una herramienta poderosa, si lo quieres ver desde la perspectiva de un sysadmin, piensa que es una especie de "orquestrador" de canales, ya que nos permite recibir datos de varios canales al mismo tiempo, y ejecutar código dependiendo de que canal envió el dato primero.

Antes de que se me olvide, `select` en algunos casos especiales es "aleatorio", es decir, si varios canales están listos para operar al mismo tiempo, `select` elegirá uno de ellos de forma aleatoria, por lo que no debes confiar en que siempre elegirá el mismo canal, solo para que te ahorres un: "En mi máquina funciona". (Y ni así jajaja)

Simplemente hermoso.

## Context, el contexto de las gorutinas.

Finalmente veamos que pedo con `context`, en Go, se usa para gestionar el tiempo de vida de las gorutinas, es decir, nos permite cancelar una gorutina cuando ya no la necesitemos.

`context` se usa para pasar información específica de una gorutina a otras gorutinas, y nos permite cancelar una gorutina cuando ya no la necesitemos, por ejemplo, si tenemos una gorutina que se encarga de hacer una petición HTTP, y por alguna razón, ya no necesitamos la respuesta de dicha petición, podemos cancelar la gorutina para que no se quede esperando la respuesta.

Vamos a ver un ejemplo de como usar `context`:

```go
package main

import (
    "context"
    "fmt"
    "time"
)

func ejecutarTarea(ctx context.Context) {
    for {
        select {
        case <-ctx.Done():
            fmt.Println("Tarea cancelada")
            return
        default:
            fmt.Println("Realizando tarea...")
            time.Sleep(time.Second)
        }
    }
}

func main() {
    ctx, cancel := context.WithCancel(context.Background())

    go ejecutarTarea(ctx)

    // Simulación de tiempo de ejecución
    time.Sleep(5 * time.Second)

    cancel() // Cancelar la tarea

    // Simulación de tiempo adicional de ejecución
    time.Sleep(3 * time.Second)
}
```

La salida de este programa sería algo así:

```bash
$ go run main.go

Realizando tarea...
Realizando tarea...
Realizando tarea...
Realizando tarea...
Realizando tarea...
Realizando tarea...
Tarea cancelada
```

Interesante... ¿Qué es lo que está pasando en este desmadre? Vamos a ver que pedo.

Al igual que con los `WaitGroups` es necesario importar un módulo de la biblioteca estándar de Go, en este caso, el módulo es `context` y viene con varias funciones que nos permiten crear contextos, cancelarlos, etc.

En la función `main` creamos un contexto principal `ctx` y una función `cancel`, la función `cancel` nos permite cancelar el contexto, y el contexto `ctx` es el que vamos a pasar a la gorutina.

```go
ctx, cancel := context.WithCancel(context.Background())
```

En palabras más humanas: "Crea un contexto principal y una función que nos permite cancelar el contexto".

Aquí viene la parte más interesante de explicar, pues, estamos haciendo uso de `select` también, en la función `ejecutarTarea` lo usamos para recibir datos del contexto, y si el contexto fue cancelado, entonces terminamos la gorutina.

```go
func ejecutarTarea(ctx context.Context) {
    for {
        select {
        case <-ctx.Done():
            fmt.Println("Tarea cancelada")
            return
        default:
            fmt.Println("Realizando tarea...")
            time.Sleep(time.Second)
        }
    }
}
```

Luego, lanzamos una gorutina que realiza una tarea en bucle hasta que el contexto sea cancelado. Después de cierto tiempo, llamamos a cancel() para cancelar el contexto, lo que finalizará la gorutina de manera inmediata.

```go
go ejecutarTarea(ctx)

// Simulación de tiempo de ejecución
time.Sleep(5 * time.Second)

cancel() // Cancelar la tarea

// Simulación de tiempo adicional de ejecución
time.Sleep(3 * time.Second)
```

Finalmente, simulamos un tiempo de ejecución de 5 segundos, y luego cancelamos el contexto, y simulamos un tiempo adicional de ejecución de 3 segundos, y como puedes ver, la gorutina se cancela inmediatamente.

Se que este último ejemplo puede ser un poco más difícil de digerir para la maceta, pero no te preocupes, con la práctica y el tiempo, lo entenderás mejor. Yo sigo sin entenderlo del todo.

El contexto nos permite hacer que las gorutinas compartan información y coordinen sus acciones de manera segura. Es especialmente útil en situaciones donde necesitamos gestionar el ciclo de vida y cancelación de gorutinas de manera efectiva, evitando posibles fugas de recursos y asegurando una terminación controlada de tareas concurrentes. En otras palabras es una herramienta para fusilar gorutinas a voluntad.



> Oye, te faltó hablar de los "Mutex", ¿no?

En efecto mi estimado degustador de tacos de malilla, no he hablado de los mutex, pero es que no los he usado y aún no tengo una buena idea de como funcionan, pero no te preocupes, en cuanto los use y entienda bien, haré un blog sobre ellos :)

## Pruebas de concurrencia y performance.

> "Talk is cheap, show me the code." - Linus Torvalds

No me gustan los ejemplos pedorros, pero vamos a enseñar algunos datos para que veas lo bonita que es la concurrencia, vamos a hacer un pequeño benchmark.

Si quieres intentar replicarlo, te dejo las especificaciones de las tecnologías que usé para hacer este benchmark:

- go version go1.19.8 linux/amd64
- hyperfine 1.15.0
- Linux ventbian 6.1.0-10-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.38-1 (2023-07-14) x86_64 GNU/Linux


> ❗ Los resultados de este benchmark no creo considerarlos como "100% reproducibles", tus resultados pueden variar dependiendo de tu hardware, sistema operativo, etc. No consideres estos resultados como una verdad absoluta. ❗

Vamos a crear un programa sencillo, este programa va a simular una tarea que puede llevar algo de tiempo, como lo sería, obtener datos de múltiples sitios web. Vamos a comparar cuanto tarda el programa en ejecutarse de manera secuencial (blocking) yde manera concurrente (non-blocking + goroutines).


Primero vamos a ver el programa secuencial:

```go
package main

import (
	"fmt"
	"net/http"
	"time"
)

func fetch(url string) {
	start := time.Now()
	resp, err := http.Get(url)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer resp.Body.Close()

	fmt.Printf("Fetched %s in %s\n", url, time.Since(start))
}

func main() {
	urls := []string{
		"https://www.google.com",
		"https://www.bing.com",
		"https://www.yahoo.com",
		"https://www.duckduckgo.com",
	}

	for _, url := range urls {
		fetch(url)
	}
}
```

Vamos a explicar que pedo con este programa:

Primero, tenemos una función `fetch` que recibe una URL, y lo que hace es hacer una petición HTTP a esa URL, y nos regresa el tiempo que tardó en hacer la petición.

```go
func fetch(url string) {
    start := time.Now()
    resp, err := http.Get(url)
    if err != nil {
        fmt.Println(err)
        return
    }
    defer resp.Body.Close()

    fmt.Printf("Fetched %s in %s\n", url, time.Since(start))
}
```

Luego, tenemos una función `main` que tiene un slice de strings con las URLs que queremos visitar, y luego, hacemos un for range para iterar sobre el slice, y por cada URL, llamamos a la función `fetch` para obtener los datos de la URL.

```go
func main() {
    urls := []string{
        "https://www.google.com",
        "https://www.bing.com",
        "https://www.yahoo.com",
        "https://www.duckduckgo.com",
    }

    for _, url := range urls {
        fetch(url)
    }
}
```

Ahora, vamos a ver el programa concurrente:

```go
package main

import (
	"fmt"
	"net/http"
	"time"
)

func fetch(url string, ch chan<- string) {
	start := time.Now()
	resp, err := http.Get(url)
	if err != nil {
		ch <- fmt.Sprint(err)
		return
	}
	defer resp.Body.Close()

	ch <- fmt.Sprintf("Fetched %s in %s", url, time.Since(start))
}

func main() {
	urls := []string{
		"https://www.google.com",
		"https://www.bing.com",
		"https://www.yahoo.com",
		"https://www.duckduckgo.com",
	}

	ch := make(chan string)

	for _, url := range urls {
		go fetch(url, ch)
	}

	for range urls {
		fmt.Println(<-ch)
	}
}
```

Similar al programa secuencial, tenemos una función `fetch` que recibe una URL, y lo que hace es hacer una petición HTTP a esa URL, y nos regresa el tiempo que tardó en hacer la petición, pero ahora, recibe un canal como segundo parámetro, y en vez de imprimir el resultado, lo envía al canal.

```go
func fetch(url string, ch chan<- string) {
    start := time.Now()
    resp, err := http.Get(url)
    if err != nil {
        ch <- fmt.Sprint(err)
        return
    }
    defer resp.Body.Close()

    ch <- fmt.Sprintf("Fetched %s in %s", url, time.Since(start))
}
```

Luego, tenemos una función `main` que tiene un slice de strings con las URLs que queremos visitar, y luego, hacemos un for range para iterar sobre el slice, y por cada URL, llamamos a la función `fetch` para obtener los datos de la URL, pero ahora, lo hacemos en una goroutine, y le pasamos el canal como segundo parámetro.

```go
func main() {
    urls := []string{
        "https://www.google.com",
        "https://www.bing.com",
        "https://www.yahoo.com",
        "https://www.duckduckgo.com",
    }

    ch := make(chan string)

    for _, url := range urls {
        go fetch(url, ch)
    }
}
```

Para probar el rendimiento de estos programas vamos a compilarlos y luego camos a utilizar `hyperfine` para medir el rendimiento de ambos programas.

```bash
$ go build -o blocking blocking.go
$ go build -o concurrent concurrent.go
$ hyperfine --warmup 10 './blocking' './concurrent'
```

Para el caso de `hyperfine`, la herramientra muestra varias animaciones en la pantalla, por lo que solo mostraré el resultado final. Si, estoy consciente de que el `--warmup` de `10` es demasiado, pero es para que se note la diferencia entre ambos programas.

```bash
Benchmark 1: ./blocking
  Time (mean ± σ):      1.705 s ±  0.198 s    [User: 0.074 s, System: 0.049 s]
  Range (min … max):    1.497 s …  2.027 s    10 runs
 
Benchmark 2: ./concurrent
  Time (mean ± σ):     701.2 ms ±  60.0 ms    [User: 75.3 ms, System: 46.3 ms]
  Range (min … max):   602.0 ms … 786.7 ms    10 runs
 
Summary
  './concurrent' ran
    2.43 ± 0.35 times faster than './blocking'
```

¿Qué quieren decir estos resultados? 

Bueno, si lo quieres ver de forma desglosada y lo más detallada que en este momento puedo explicar, es que el programa secuencial tardó 1.705 segundos en ejecutarse, mientras que el programa concurrente tardó 701.2 milisegundos en ejecutarse, lo que significa que el programa concurrente es 2.43 veces más rápido que el programa secuencial. 

## Conclusión.

Las goroutines son una de las características más importantes de Go, y es lo que hace que Go sea un lenguaje tan poderoso, y que sea tan fácil de escribir programas concurrentes. En lo personal me agrada que Go sea un lenguaje tan opinionado, que, si bien es algo no muy bien visto en la comunidad tech actual, lo cierto es que nunca está de más tener otra visión de hacer las cosas, por más que no estemos totalmente de acuerdo con sus métodos.

Descubrí hace poco el poder de las gorutinas al momento de usar Fiber y crear mis propios demonios usando Go, lo cierto es que, se ha vuelto más sencillo de usar y si tienes un init moderno como systemd, crear mini-demonios y desplegarlos en tus servidores o incluso en máquinas virtuales o contenedores es algo que te facilita mucho la vida.

En fin, espero que este artículo te haya sido de utilidad, y si tienes alguna duda, no dudes en contactarme, dejar un comentario en los medios donde se publique este artículo o seguir la página de Instagram de "La Esquina Gris", donde, espero, pronto tener ideas de contenido más dinámico. 

Por ideas de contenido dinámico me refiero a que aún no encuentro nada que pueda servir para regar más el conocimiento y mantener interesada a la gente. A estas alturas me cuesta más trabajo tener una idea nueva que producirla en el propio blog, igualmente, el material audiovisual nunca ha sido mi fuerte, pero, si tienes alguna idea, siéntete libre de compartirla, este blog es para tí ypara la comunidad.


¡Muchas gracias por leerme! Nos vemos en el siguiente artículo.


### Canción triste del día.

*Percées de lumière - Alcest*

> Ebrio de luz, tengo ahora la impresión de no caminar más sobre su suelo y escuchar los gritos de mi alma inhumana implorando su liberación.

![Percées de lumière - Alcest](/img/posts/concurrencia/spotify.png)

### Referencias.

- [Goroutines - Go by Example](https://gobyexample.com/goroutines)
- [Concurrency in Go](https://medium.com/rungo/achieving-concurrency-in-go-3f84cbf870ca)
- [Documentación oficial de Go](https://golang.org/doc/)
- [Effective Go](https://golang.org/doc/effective_go.html)

---

¿Te gustan mi contenido? Ayúdame a seguir creando de las siguientes formas:
- [Invítame una maruchan fría](https://ko-fi.com/ventgrey)
- [Regálame un follow en GitHub ❤](https://github.com/VentGrey)
- [Dona a la Free software Foundation](https://my.fsf.org/join)
- Ayuda a alguien que lo necesite. (⭐ Preferido)
- Libera algún software que hayas hecho. (⭐ Preferido)
