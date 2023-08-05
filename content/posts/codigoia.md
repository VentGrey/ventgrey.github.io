---
title: "Tu inteligencia + ChatGPT. Tu potencial extendido."
date: 2023-08-03
tags: ["ChatGPT", "Desarrollo de software", "Inteligencia Artificial", "Go", "IA", "OpenAI", "Opinión", "Programación", "Rant", "Tutoriales"]
categories: ["ChatGPT", "Inteligencia Artificial", "IA", "OpenAI", "Opinión", "Programación", "Rant", "Tutoriales"]
author: "VentGrey"
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "La inteligencia artificial es una herramienta que puede ser usada para mejorar tu productividad. En este post te muestro como salir del pensamiento del programador promedio y usar la inteligencia artificial para mejorar tu productividad."
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
    image: "/img/posts/codigoia/cover.png" # image path/url
    alt: "Imágen del post" # alt text
    caption: "Imágen del post" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/<path_to_repo>/content"
    Text: "Sugerir Cambios" # edit text
    appendFilePath: true # to append file path to Edit link
---


# La misma introducción culera de siempre.

He tenido unos días libres para descansar. En mis meditaciones, me puse a pensar en el jugo que podríamos sacarle a la inteligencia artificial a nuestro beneficio. No me malentiendas, no estoy inventando nada nuevo, hay infinidad de blogs escritos por tocados por Dios, expertos con triple PhD en inteligencia artificial y Super Senior Prompt Engineers que te enseñan las mismas herramientas.

En este caso yo vengo a proponer un workflow que, personalmente uso en mi día a día, para sacarle el máximo provecho a la inteligencia artificial. En este caso, a [ChatGPT](https://chat.openai.com/). Personalmente creo que no solo se limita a esta herramienta, sino que puede ser aplicada a cualquier herramienta de inteligencia artificial que se te ocurra que también pueda "evaluar" código (e.g Bard, Bing, etc).

La programación es un arte y una ciencia, no solo es escribir líneas de código a lo wey o peor, copiar y pegar líneas de ćodigo a lo wey. Implica entender el flujo de lógica requerido para entender problemas complejos, diseñas soluciones eficientes y, lo más importante, asegurar que las soluciones propuestas funcionen como se espera.


## "¡Es psicótico! ¡Solo buscan excusas para celebrar la mediocridad! [...] ~ Mr. Incredible"

![mrincredible](/img/posts/codigoia/incredible.gif)

Este artículo de blog, más que solo enseñar el workflow que tengo yo al momento de trabajar con código y otras herramientas también es una especie de *llamado de auxilio*, quizás, para tratar de cambiar una mentalidad que, considero desagradable y por alguna razón que no conozco, se ha vuelto muy popular, incluso "glorificada" en algunas comunidades de programación.

Lo voy a decir de una vez para ahorrarnos mucha palabrería: **Que funcione, NO ES SUFICIENTE.**

Indpendientemente de los lloraderos y falacias [strawman](https://es.wikipedia.org/wiki/Falacia_del_hombre_de_paja) cada día más elaboradas que veo en el [agujero de basura de la comunidad tech](https://twitter.com/), creo que no debemos de glorificar las malas prácticas de programación. No me malentiendas, no estoy diciendo que debemos de ser perfectos, pero si debemos de aspirar a ser mejores programadores/devops/sysadmins. Si, entiendo que nadie se sabe la documentación de memoria o que pocos son los que realmente pueden resolver un problema sin recurrir a Google, no critico eso.

Critico la glorificación de la pereza, el hecho de abrazar la mediocridad disfrazada de una excusa tan débil y pedorra como lo es el: *"nadie nació sabiendo todo"*. Se que las auto-referencias son mal vistas, pero repetiré las palabras que he dicho hasta el cansancio:

> Debemos ejercitar nuestras mentes y evitar sucumbir a la pereza. Pues la simplicidad en nuestro software NO es una tarea difícil.

De nuevo, voy a insistir. No soy perfecto, no espero que todos lo sean ni considero imponer mi visión sobre mis lectores, es mi criterio y creo que, podría ser beneficioso para quien lo considere así.

Soy de la creencia de que el que no coopera, no se debe de quejar. Por lo que dejaré mi granito de arena, ya expuse un problema, ahora propongo una **POSIBLE** solución.

Voy a tratar de considerar a muchos en mis ejemplos, si, es cierto que usando la versión Pro de ChatGPT y Copilot puedes extender aun más esa matriz de herramientas para hacer cosas todavía más complejas, sin embargo, estoy consciente de que no todos tienen acceso a esas herramientas, por lo que trataré de usar solo las herramientas gratuitas.

Antes de comenzar, lo voy a recalcar otra vez. **NO** estoy inventando nada nuevo. Solo estoy compartiendo un flujo de trabajo que me ha funcionado a mi y, de buena fe, espero que le funcione a alguien más.

> Que al cliente no le importe, tampoco es una excusa para hacer las cosas mal.

Se que a nadie le gusta tragarse una cátedra o un rant. Sin embargo, creo fielmente que, si queremos avanzar, mejorar y sobrellevar problemas actuales como lo es la escasez de microchips actual, debemos aprender a usar las computadoras de la mejor forma posible y dejar de justificar el software ineficiente o directamente malhecho.

Como dijo un [amigo mío](https://github.com/Suavesito-Olimpiada) cuando le contaba acerca del dicho popular de: *"Al cliente ni le importa en que lo hiciste, lo que le importa es que funcione":*

> "Esa forma de pensar es, precisamente, la que nos tiene ahogados en bugs."

## 🧠 + 🤖 = 💆 (Mind Over Matter, Brain Stimulation)

Pienso que, para poder sacarle todo el jugo a este tipo de herramientas hace falta crear una *"dualidad"* con la inteligencia artificial. Es decir, no solo usarla como una herramienta para resolver problemas, sino como una herramienta para mejorar nuestra productividad.

Nosotros seguiremos siendo responsables del pensamiento crítico, de la lógica y de la solución de problemas. La inteligencia artificial solo nos ayudará a escribir código más rápido, pero no nos exime de la responsabilidad de entender lo que estamos haciendo.

Recuerda, la dependencia en ningún nivel es algo bueno. Aplica lo mismo en este trabajo. Quizá sea una verdad dura, pero, si te quitan copilot, chatGPT o incluso Google/StackOverflow y realmente ya no puedes hacer nada...bueno, creo que algo habrás estado haciendo mal, ¿no crees?

Tratemos de construir una relación simbiótica con la inteligencia artificial. Es una herramienta, úsala como usarías un automóvil, una computadora o un martillo. No te conviertas en un esclavo de la tecnología, úsala a tu favor, se supone que el individuo pensante eres tú, no la máquina.

## Generación de código inteligente.

Como no puedo pasar por alto mi habilidad de traumarme con algo hasta cansarme, todo el código que enseñaré aquí será en [Go](https://golang.org/). No es que sea un lenguaje perfecto, pero es el que más me gusta y el que terminó gustándome más, creo, por su simplicidad cuasi-forzada.

> Si, si ya se que existe el módulo "strings" en la biblioteca estándar, solo piensa que estoy loco y hazme caso.

Imagina que estás trabajando en un proyecto en Go y necesitas escribir una función que tome una cadena y la devuelva invertida. Sabes que necesitas iterar a través de la cadena de alguna manera y construir una nueva cadena en el orden inverso. Pero, ¿cómo se hace eso en Go? Aquí es donde puedes preguntarle a ChatGPT. Puedes darle la estructura básica de tu función:

```go
func invertirCadena(s string) string {
    // ¿Cómo chuchas hago esto?
}
```

Aquí ChatGPT nos mostrará su bondad y generará un código que, aunque no es perfecto, nos da una idea de cómo podemos resolver el problema:

```go
func invertirCadena(s string) string {
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i > j; i, j = i+1, j-1 {
        runes[i], runes[j] = runes[j], runes[i]
    }
    return string(runes)
}
```

Bueno, solo hay que pegar esto en nuestro editor y...wait...hay algo mal aquí. ¿No lo ves? Bueno, vamos a escribir un mini-programa para probar esta función:

```go
package main

import "fmt"

func invertirCadena(s string) string {
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i > j; i, j = i+1, j-1 {
        runes[i], runes[j] = runes[j], runes[i]
    }
    return string(runes)
}

func main() {
    fmt.Println(invertirCadena("Hola mundo"))
}
```

Aquí esperamos que la salida sea `odnum aloH`. Pero, por alguna razón, al ejecutar el programa, la salida es `Hola mundo`. ¿Qué pasó? Bueno, si miras de cerca, verás que el bucle `for` nunca se ejecuta. ¿Por qué? Bueno, porque la condición del bucle es `i > j`, pero `i` es `0` y `j` es `len(runes)-1`, que es `-1`. Por lo tanto, la condición es falsa y el bucle nunca se ejecuta. ¿Cómo podemos arreglar esto? Bueno, podemos cambiar la condición a `i < j`:

```go
func invertirCadena(s string) string {
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        runes[i], runes[j] = runes[j], runes[i]
    }
    return string(runes)
}
```

Ahora si, al ejecutar el programa, la salida es `odnum aloH`.

> Ok, un ejemplo muy sencillo. ¿Qué estás tratando de demostrar?

Bueno, lo que estoy tratando de demostrar es que, aunque podamos confiar en una buena cantidad de escenarios en la generación de código, no podemos confiar ciegamente en la IA. Siempre, repito, **SIEMPRE** debemos de revisar el código que se genera y utilizar nuestro conocimiento para asegurar que el código que se generó es correcto. 

Dependerá de la IA y su capacidad con los lenguajes de programación, en mi experiencia personal, con lenguajes como C, C++, Rust y Go, todavía *"desvirulea"* bastante. Pero, con lenguajes como Python, JavaScript y Ruby, la cosa cambia considerablemente, supongo, por la cantidad de código que hay disponible en esos lenguajes.

## Corrección de código.

> "Esto es una ilu...me falta una sílaba. Mierda de haikus." ~ Cer0 - Borderlands 2

Todos cometemos errores, es parte ser humano. Sea que nuestro código está mal escroto, olvidemos utilizar algún símbolo o simplemente que te pase lo que a mi y dejes un archivo a medio editar. Los errores son parte del proceso de programación y, aunque podemos hacer todo lo posible para minimizarlos, siempre van a estar ahí.

Aunque el compilador de Go es lo suficientemente inteligente para detextar y señalar los posibles errores de compilación que tengamos, no siempre nos es claro como solucionarlos. Puede que nos topemos en una situación donde nuestra lógica falle en algún punto o que, (no es algo malo) nuestros conocimientos del lenguaje no sean suficientes para resolver un problema.

> Lo que si es malo es conformarnos con ese "no saber" y lo abracemos como si fuera algo bueno o un "trait" de nuestra personalidad. No, no lo es. Siempre debemos de buscar mejorar y aprender más.

Vamos con otro ejemplo pedorro:

```go
package main

import "fmt"

type Persona struct {
	Nombre string
	Edad   int
}

func (p Persona) Cumpleaños() {
	p.Edad++
}

func main() {
	p := Persona{"Juan 🐴", 30}
	p.Cumpleaños()
	fmt.Println(p.Edad) // Se espera que imprima 31
}
```

El siguiente código es muy sencillo, tenemos una estructura "Persona" que guarda el nombre y la edad de alguien. Después, tenemos un método para esa estructura, ese método nos sirve para aumentar la edad de la persona un año, simulando que cumplió años.

Finalmente en la función "main" creamos una persona con nombre "Juan" y edad "30". Después, llamamos al método "Cumpleaños" para aumentar la edad de la persona en un año. Finalmente, imprimimos la edad de la persona, esperando que imprima "31".

Vamos a ver que pasa cuando ejecutamos este código:

```bash
$ go run main.go

30
```

Ehhh...si bueno. ¿Qué pedo? Cuando ejecutamos este código, imprime 30 y no 31, que es la edad que esperamos que tenga Juan 🐴. Esto es un error lógico, no sintáctico, lo que significa que, el comilador de Go no te servirá de mucha ayuda.

Aquí hay de 3 sopas:

1. Usas gdb para debuggear el código y encontrar el error.
2. Aprendes más Go para que errores de este tipo sean más evidentes para ti.
3. Preguntas en lugares como StackOverflow donde te va a pendejear un tipo que apenas sabe lo que es un apuntador.

Pero, ¿qué tal si le preguntamos a la IA? Veamos que nos dice ChatGPT, yo usé el siguiente prompt:

![prompt](/img/posts/codigoia/prompt.png)

Y la respuesta que obtuve fue:

![response](/img/posts/codigoia/response.png)

Vamos a ver si es cierto lo que dice la IA:

```go
package main

import "fmt"

type Persona struct {
	Nombre string
	Edad   int
}

func (p *Persona) Cumpleaños() {
	p.Edad++
}

func main() {
	p := Persona{"Juan 🐴", 30}
	p.Cumpleaños()
	fmt.Println(p.Edad)
}
```

Integramos el nuevo código corregido por la IA y le quitamos sus comentarios culeros y ahora si, vamos a ver que pedo con este programa:

```bash
$ go run main.go

31
```

A 🥚, ya funciona bien el programa. La IA tenía razón, el problema era que el método "Cumpleaños" no estaba recibiendo un apuntador a la estructura "Persona", por lo que, el cambio que se hacía en la edad de la persona, no se guardaba en la estructura original.

De una vez te informo, si tu idea es solo tomar el código corregido, pegarlo y esperar a que funcione sin entender que es lo que está pasando, entonces, no estás aprendiendo nada. Encima, si la IA se equivoca en el proceso, vas a entrar en un espiral de prompts de prueba y error que no te van a llevar a ningún lado.

Utiliza tu conocimiento para juzgar las respuestas como correctas o incorrectas, si tienes dudas, prueba el código en un entorno aislado, si te siguen quedando dudas mezcla otros recursos, pide que te enseñe algo en lo que sea más difícil equivocase como los fundamentos de apuntadores en Go o simplemente, pregunta en algún lugar donde te puedan ayudar.

La forma en la que decidas combinar tu conocimiento y el buen uso de tu criterio, en muchas ocasiones, será la diferencia entre aprender algo nuevo o simplemente, quedarte con una respuesta que no te sirve de nada o peor, producir código como un robot, pero sin entender absolutamente nada de lo que hace, como funciona o como parchearlo en caso de errores.

Como último consejo, trata de fabricar tus "prompts" en un bloc de notas o algún lugar donde puedas escribir, poner saltos de línea y marcadores importantes para la IA, un prompt bien hecho puede hacer la diferencia en la respuesta que obtendrás.

### Como uso extra, corrige a StackOverflow.

En lo personal, trato de no entrar en StackOverflow, en muchas ocasiones *"les falta barrio"* en lenguajes como Shell. Si una respuesta de ahí te funciona, pero ves que es más ineficiente que motor de combustión interna, puedes pasar dicha respuesta por la IA de tu preferencia, revisar si la optimización propuesta vale la pena, probar si funciona correctamente e intregrarla a tu código.

## Pruebas unitarias, el terror de los programadores "de a mentis".

Querramos o no, las pruebas unitarias son parte importante de la programación y uno de los fundamentos del *Test Driven Development*, si, son tediosas de hacer, pero necesarias si no queremos que nos traben el rifle unos días o meses después de entregar el código que nos piden.

Además de reducir la deuda técnica, el tiempo de correccion de bugs y facilitar la refactorización del código, hablan muy bien de ti como desarrollador.

Los devs que escriben pruebas unitarias con regularidad tienden, por lo general, a ser más disciplinados con su código. La práctica de elaborar pruebas te ayuda a crear un enfoque orientado a la calidad y prevención de errores en tus programas. Además, escribir pruebas unitarias, te va a obligar a comprender mejor que carambas estás copypasteando en tu editor.

Si no me crees, hay cientos de repositorios en GitHub, tampoco dudo de alguno de mis lectores esté trabajando dentro de una empresa dedicada al desarrollo o que esté en alguna rama de la industria donde se requiera programar. Si eres de esos lectores te invito a comparar la deuda técnica de los proyectos que cuentan con pruebas unitarias respecto a los que no.

> ¿Por qué pones "programadores de a mentis"? ¿Quien te da derecho a juzgar a los demás?

Nadie, pero si te ofendiste, es porque te sentiste identificado. Cada quien se pone el saco que le queda. Deja la ira detrás y ponte a estudiar como hacer pruebas unitarias.

Bueno, menos palabrerías y más código, vamos a ver como podemos usar la IA para generar pruebas unitarias. Este punto es curioso porque, podemos considerarlo como la "unión" de los puntos anteriores. Además, como este tipo de pruebas usualmente se considera "crítico" en algunos entornos, debemos ser aún más cuidadosos con el código que generemos e integramos en nuestro proyecto.

En Go, las pruebas unitarias se escriben en uno o varios archivos separados de la lógica principal, todo con el sufijo `_test.go`. Por ejemplo, si tenemos un archivo llamado `main.go`, las pruebas unitarias se escribirán en un archivo llamado `main_test.go`.

Las pruebas en Go no tienen mucho chiste detrás, no son más que funciones que toman un solo argumento de tipo `*testing.T`, es decir un apuntador a la estructura `testing.T` y que no regresan nada. Dentro de estas funciones, se ejecutan las pruebas que queramos hacer, si alguna de ellas falla, se llama a la función `t.Error()` o `t.Fail()` para indicar que la prueba falló.

Vamos a suponer que tenemos una función para saber si un dato de tipo `string` es un palíndromo o no. Para ello, vamos a crear un archivo llamado `palindrome.go` con el siguiente contenido:

> Un palíndromo es una palabra, número o frase que se lee igual hacia adelante que hacia atrás. Por ejemplo: "reconocer", "sometemos", "somos", "neuquen", "12321", etc.

```go
// Por amor de horror, no programes en español xD
func esPalindromo(s string) bool {
    longitud := len(s)
    for i := 0; i < longitud/2; i++ {
        if s[i] != s[longitud-i-1] {
            return false
        }
    }
    return true
}
```

Escribir una sola prueba unitaria para esta función podría ser contraproducente, lo ideal sería probarla en diferentes escenarios para asegurarnos de que funcione correctamente. Es aquí donde meto mi cuchara en la sopa, personalmente hay un punto del zen de Python que me hace mucho sentido aplicar en muchas ocasiones:

> Special cases aren't special enough to break the rules.
> Although practicality beats purity.

Para hacer las pruebas de forma correcta, podemos hacer "tablas de pruebas". Es decir, creamos una tabla con varios casos de prueba y, luego iteramos sobre ella para probar cada uno de los casos. Vamos a ver un ejemplo:

```go
func TestEsPalindromo(t *testing.T) {
    casos := []struct {
        s       string
        esperado bool
    }{
        {"", true},
        {"a", true},
        {"ab", false},
        {"aba", true},
        {"abba", true},
        {"abc", false},
    }

    for _, caso := range casos {
        resultado := esPalindromo(caso.s)
        if resultado != caso.esperado {
            t.Errorf("esPalindromo(%v) = %v; esperado %v", caso.s, resultado, caso.esperado)
        }
    }
}
```

De nuevo, las pruebas unitarias en Go no son más que una pedorra función. Hay otra parte interesante que, estoy seguro a más de uno le pudo llamar la atención:

```go
casos := []struct {
    s       string
    esperado bool
}{
    {"", true},
    {"a", true},
    {"ab", false},
    {"aba", true},
    {"abba", true},
    {"abc", false},
}
```

¿Qué es eso? ¿Una estructura anónima? La respuesta es si, en Go [existen las estructuras anónimas](https://go.dev/talks/2012/10things.slide#1). Similar a las funciones anónimas, nos pueden servir para crear estructuras que solo vamos a usar en un solo lugar. En este caso, la usamos para crear una tabla de pruebas, no necesitamos declarar una estructura con nombre, solo la vamos a necesitar una vez.

Una vez explicado eso, usamos un for con un "placeholder" (`_`) para iterar sobre la tabla de pruebas. En cada iteración, llamamos a la función `esPalindromo` con el valor de `s` y comparamos el resultado con el valor esperado. Si el resultado no es el esperado, llamamos a la función `t.Errorf` para indicar que la prueba falló.

¿Recuerdas que el archivo donde tenemos nuestro código principal se llama `palindrome.go`? Bueno, pues el archivo donde escribimos las pruebas unitarias se llamará `palindrome_test.go`.

Si te perdiste en el proceso, te enseño como deberían verse los archivos:

```go
// palindrome.go

package main

func esPalindromo(s string) bool {
    longitud := len(s)
    for i := 0; i < longitud/2; i++ {
        if s[i] != s[longitud-i-1] {
            return false
        }
    }
    return true
}
```

```go
// palindrome_test.go
package main

import "testing"

func TestEsPalindromo(t *testing.T) {
    casos := []struct {
        s        string
        esperado bool
    }{
        {"", true},
        {"a", true},
        {"ab", false},
        {"aba", true},
        {"abba", true},
        {"abc", false},
    }

    for _, caso := range casos {
        resultado := esPalindromo(caso.s)
        if resultado != caso.esperado {
            t.Errorf("esPalindromo(%v) = %v; esperado %v", caso.s, resultado, caso.esperado)
        }
    }
}
```

> Omitiste el import de paquetes y la estructura del archivo al inicio. ¿Por qué?

La forma que tengo de dar los ejemplos es usando Go, sin embargo se que no todos mis lectores lo utilizan, por lo que, decidí mantener las cosas "genéricas" hasta cierto punto para mostrar más el concepto que el código en sí.

Volviendo a Go, para ejecutar las pruebas usamos el comando `go test`, este comando buscará todos los archivos en el directorio actual que coincidan con el patrón `*_test.go`, los compilará y ejecutará las funciones de prueba que encuentre.

La salida de dicho programa nos dirá la cantidad de pruebas ejecutadas, cuanto tiempo tomaron en ejecutarse y si alguna falló o no. Una salida podría ser la siguiente:

```bash
PASS
ok      github.com/VentGrey/ventgrey  0.001s
```

Si alguna de nuestras pruebas falla, el comando `go test` nos dirá cual es la prueba que falló y que era lo que esperaba, comparado con lo que obtuvo, por ejemplo:

```bash
--- FAIL: TestEsPalindromo (0.00s)
    palindromo_test.go:16: esPalindromo(ab) = true; esperado false
FAIL
FAIL    github.com/VentGrey/ventgrey 0.014s
FAIL
```

En el caso de este fallo, la prueba esperaba que la función `esPalindromo` regresara `false` al pasarle la cadena `ab`, sin embargo, la función regresó `true`.

Si, es cierto que para muchos casos, escribir pruebas unitarias o incluso refactorizar las que nos puede generar una IA, llega a ser algo tedioso, sobre todo con los famosos *edge cases*, en tu criterio queda si esos *special cases* son lo suficientemente especiales como para romper las reglas.

## Reto 🤓☝

Te invito a que hagas el siguiente reto. No, no soy tu profesor, eres libre de mandarme alv si lo deseas. Pero, si decides hacerlo, te aseguro que aprenderás mucho más que si solo lees el artículo.

El reto lo pondré en Go, pero puedes intentar extender los conocimientos de este artículo y portarlo a tu lenguaje favorito.

Estás escribiendo un programa en Go que debe trabajar con números complejos. En particular, necesitas una función que tome dos números complejos y devuelva su suma.

Los números complejos se representan como un par de números reales: la parte real y la parte imaginaria. La parte imaginaria se representa con una letra `i`. Por ejemplo, `2 + 3i` es un número complejo, donde `2` es la parte real y `3i` es la parte imaginaria.

Luego de un par de horas y varias latas de Red Bull, logras escribir la siguiente función:

```go
package main

import "fmt"

// Complejo representa un número complejo con una parte real y una parte imaginaria.
type Complejo struct {
    Real      float64
    Imaginario float64
}

// sumaComplejos suma dos números complejos y devuelve el resultado.
func sumaComplejos(c1, c2 Complejo) Complejo {
    return Complejo{c1.Real + c2.Real, c1.Imaginario + c2.Imaginario}
}

// ¿En serio ocupa explicación la función main?
func main() {
    c1 := Complejo{1, 2}
    c2 := Complejo{3, 4}
    c3 := sumaComplejos(c1, c2)
    fmt.Println(c3) // Se espera que imprima {4 6}
}
```

### Tareas del reto.

1. Verifica si el código compila y se ejecuta correctamente. Si no es así, trata de entender cuál es el problema y corrige los errores.

2. Una vez que tu código funciona correctamente, es el momento de escribir algunas pruebas unitarias. Recuerda, quieres probar varias situaciones diferentes, como la suma de dos números complejos con partes reales e imaginarias positivas, la suma de dos números complejos con partes reales e imaginarias negativas, y la suma de un número complejo con un número complejo cero.

### ¿Necesitas ayuda? 

Si te quedas atascad@ en algún punto, recuerda que puedes utilizar ChatGPT, Bard, Phind, etc para ayudarte. Puedes describirle el problema que estás tratando de resolver o el error que estás tratando de corregir, y tu herramienta de IA puede sugerirte una solución o incluso generarte un código que resuelva el problema.

Al final del reto, deberías tener un código que compila y se ejecuta correctamente, y un conjunto de pruebas unitarias que verifican que tu función sumaComplejos funciona como se espera.

## Conclusión

Estamos entrando en una época donde la IA está tomando mucha reelevancia en nuestras vidas, a pesar de todas las noticias con hype hasta por las orejas, las especulaciones de skynet de algunos, los delirios de grandeza de otros y los gobiernos cagando todo, limitando y regulando cuanta cosa buena sale. Lo cierto es que la IA no es más que una herramienta hecha para ayudarnos a resolver problemas, una IA que no obedece al humano es una IA que no sirve.

Aprende a usarla a tu favor, en el año en el que estoy escirbiendo esto (2023) se está comenzando a volver difícil encontrar un empleo cuando tienes un perfil de Jr. No estoy diciendo que, con aprender a usar una IA te convertirás en un Senior en poco tiempo, todos los que te digan eso están mintiendo y puedo apostar lo que quieras a que no tienen ni idea de lo que están hablando. Lo que si te puedo decir es que, si aprendes a usar una IA, tendrás una ventaja sobre los demás, y eso, en un mundo tan competitivo como el que vivimos, es algo que no puedes dejar pasar.

Finalmente, te dejo con una reflexión del poderoso Kratos de la saga God of War. Si, llámame ñoño, pero creo que esto que te mostraré aplica también con tus conocimientos en programación:

![kratos1](/img/posts/codigoia/kratos1.jpg)
![kratos2](/img/posts/codigoia/kratos2.jpg)

¡Nos leemos en el siguiente artículo!

### Canción triste del día.

*Second Life Syndrome - Riverside*

> Without that help I finally started to live my own life. And I know I don't need you now.

![spotify](/img/posts/codigoia/spotify.png)

---

¿Te gustan mi contenido? Ayúdame a seguir creando de las siguientes formas:
- [Invítame un kilo de aguacates](https://ko-fi.com/ventgrey)
- [Regálame un follow en GitHub ❤](https://github.com/VentGrey)
- [Dona a la Free software Foundation](https://my.fsf.org/join)
- Ayuda a alguien que lo necesite. (⭐ Preferido)
- Libera algún software que hayas hecho. (⭐ Preferido)
