---
layout: post
---
# Y es que...todas las API son iguales.

Seamos sinceros, todos hemos hecho al menos una REST API en nuestra vida, honestamente es algo de esperarse, siendo el estilo de arquitectura de software más popular de los últimos años. Si bien REST no es algo nuevo (Pues, su existencia puede rastrearse hasta el año 2000) sigue siendo un enfoque de desarrollo modular y en un todo muy conveniente. Sobre todo si hablamos de tecnologías basadas en la web.

No creo que sea necesario dar tanto contexto sobre qué es una REST API, mucho menos en estos años donde podemos encontrar (sin exagerar) miles de sitios donde se nos podría explicar perfectamente que son las REST API, como funcionan, sus casos de uso, ventajas, desventajas y todas esas cosas que nos encanta leer para excusar una flamewar en foros o grupos de chat.

Para esta entrada vamos a ver como crear y consumir una REST API. Con la parte de la creación utilizaremos [Rust](https://www.rust-lang.org/) con [Rocket](https://rocket.rs/) y para la parte del consumo una página web con un script básico debería funcionar. Asímismo voy a utilizar como ejemplo mi proyecto personal "[upventrs](https://github.com/UpVent/upventrs)" (Por: UpVent RustSvelte). Donde pondré ejemplos de como podemos consumir nuestra REST API desde un framework para JavaScript como [Svelte](https://svelte.dev/).

## Prerequisitos
Este es un trabajo o más bien un proyecto de medio nivel, por lo que se requiere tener un poco de experiencia con el lenguaje de programación Rust y, para la parte del "Frontend" es necesario conocer un poco de Svelte. 

Claro, puedes seguir este tutorial sin cumplir estos prerequisitos, pero te será más complicado entender lo que de por si no puedo explicar a la perfección.

Si te interesa aprender un poco más aquí te dejo una lista de recursos que podrías encontrar interesantes:

- [Ejercicios para dominar Rust](https://github.com/rust-lang/rustlings)
- [Compilación de ejemplos de Svelte](https://svelte.dev/examples/hello-world)
- [Svelte en 100 segundos](https://www.youtube.com/watch?v=rv3Yq-B8qp4)

## Preparando el entorno de trabajo
Si estás leyendo este tutorial asumiré que ya tienes un poco de experiencia con Rust (por lo menos la [instalación](https://rustup.rs/) debería ser algo que ya lograste hacer con éxito). Para este trabajo vamos a crear un binario de Rust y añadiremos algunas dependencias.

### El magnánimo ORM

Los ORM ya son el pan de cada día para los DBA (*Database Administrator*) y también para los desarrolladores *backend*. En este proyecto necesitaremos un ORM hecho en Rust que nos permita crear, modificar o re-ejecutar migraciones en nuestra base de datos. Para nuestra fortuna existe [Diesel](https://diesel.rs/), un ORM que ya está bastante maduro y que, además tiene otras ventajas que para un desarrollador de Rust solo podrían describirse como "jugosas". 

Diesel previene errores en tiempo de ejecución ya que, por diseño elimina la posiblidad de interactuar de forma incorrecta con la base de datos, si tu proyecto compila con Diesel no deberían existir errores que detengan su ejecución por una mala consulta. Además es terriblemente rápido y su código es **MUY** reutilizable en codebases grandes, lo cual, como desarrollador te ahorra mucho tiempo. La otra ventaja de Diesel es que no soporta una cantidad masiva de motores de bases de datos, por el momento Diesel solo tiene soporte para:
* MySQL / MariaDB
* PostgreSQL
* SQLite3

Digo ventaja, porque la cantidad de motores de manejo de base de datos que hay hoy en día es enorme y las diferencias entre uno y otro son ridículas, algunas son razonables pero...siendo sinceros otras se hacen notar en entornos extraños (o enormes) de producción y en precios ridículos al momento de pagar. Diesel reduce esto diciendo de forma indirecta: "Úsame con lo que está bien hecho o no me uses".

La parte de los motores de base de datos noSQL es otra historia, Diesel no está hecho para bases de datos no relacionales y este tipo de motores normalmente ya vienen con bibliotecas para varios lenguajes incluyendo Rust, MongoDB es el ejemplo más cercano que tengo de [esto](https://docs.mongodb.com/drivers/rust/).

Existe un problema con todo esto, necesitamos instalar la herramienta CLI (*command line interface*) de diesel, sin embargo, por la naturaleza del mismo necesitamos elegir las bibliotecas necesarias para poder compilar un binario acorde a nuestro sistema y a la base de datos que utilizaremos en nuestro proyecto. 

Para mantener el concepto sencillo utilizaremos SQLite3 como base de datos para desarrollo. Si deseas utilizar otra cosa como PostgreSQL o MariaDB solo tendrás que sustituir algunas cosas. Parece confuso por ahora, pero una vez entiendas el código y el funcionamiento de Diesel te será sencillo migrar de una base de datos a otra.

#### Instalando Diesel con soporte para SQLite3

Diesel necesitará las bibliotecas de SQLite3 para poder compilarse correctamente en nuestra máquina, la biblioteca en cuestión se llama `libsqlite3` y existen diversas formas de instalarla en nuestros sistemas. No puedo hacer una lista entera de como instalar dicha biblioteca en todos los sistemas disponibles, en sistemas como Debian y Ubuntu puedes instalar esta biblioteca con la orden: `sudo apt install libsqlite3-dev`.

Una vez instalada la biblioteca de SQLite3 solo queda instalar Diesel usando Cargo en nuestra terminal: `cargo install diesel_cli --no-default-features --features sqlite`

Los tiempos de compilación de Rust son lentos, sugiero que encuentres algo que hacer mientras el binario de Diesel se compila. Cuando Diesel termine de compilarse podemos continuar con el siguiente paso.

### Crear un proyecto como un buen dev moderno...lleno de dependencias externas.

Para crear un nuevo proyecto de Rust necesitamos usar la herramienta Cargo, de nuevo y como dije al inicio de esta entrada de blog, estoy asumiendo que ya tienes algo de experiencia con Rust. En caso de que hayas olvidado como crear un nuevo binario te recuerdo que la orden es: `cargo new --bin <nombre>`. En mi caso yo llamaré mi proyecto: `rest-rust-template` y encontrarás el link del repositorio al final de esta entrada. Eres libre de utilizar este repositorio como plantilla para futuros proyectos de REST API con Rust.

Dentro de nuestro proyecto de Rust debemos encontrar el archivo `Cargo.toml` y ahí añadir las dependencias necesarias. Antes de hacer esto debo hacer una recomendación y es que, cada que necesites utilizar una biblioteca hecha en Rust es recomendable que leas la documentación oficial el https://docs.rs/. La razón por la que digo esto es por que he visto una gran cantidad de tutoriales donde importan bibliotecas externas sin saber que a veces, la misma biblioteca que están utilizando tiene incrustadas las funciones de las bibliotecas externas por lo que solo estamos gastando espacio en disco y *namespace*.

En el caso de Diesel, necesitamos importarlo con dos *features* especiales, en este caso soporte para SQLite3 y r2d2 (un manejador de "Pools" para bases de datos. No te preocupes, explicaré esto a detalle más abajo).

El día en el que estoy escribiendo este blog, la versión de Diesel es la `1.4.4`, esto cambiará en el futuro. Asegúrate de seguir las instrucciones en el [sitio oficial de Diesel](https://diesel.rs).

Debemos añadir la siguiente línea a nuestro archivo `Cargo.toml` para instalar Diesel con las características mencionadas anteriormente:

```toml
diesel = { version = "1.4.4", features = ["sqlite", "r2d2"] }
```

Una vez hecho esto ejecutamos en nuestra consola (o IDE) el comando `$ cargo build` para constuir nuestro proyecto con Diesel y continuar trabajando correctamente.

Ahora viene la parte interesante y es colocar nuestra conexión a la base de datos en nuestro proyecto. Es bien sabido que, escribir la conexión en un string directamente en nuestro código es un error terrible, por lo que haremos uso de otra biblioteca llamada `dotenv`. Dotenv nos permite leer variables de entorno y guardarlas en nuestro programa para usarlas en un futuro, estas pueden leerse desde nuestro sistema o desde un archivo especial de nombre `.env`. Si has desarrollado un sistema anteriormente con otro lenguaje y framework como Python con Django o Flask ya tendrás algo de experiencia con este tipo de práctica.

De nuevo, ahora mismo que estoy escribiendo este blog la versión de dotenv es la `0.15.0` y, otra vez, esto puede cambiar en un futuro no muy lejano. Para añadir `dotenv` a nuestras dependencias debemos añadir la siguiente línea a nuestro archivo `Cargo.toml`:

```toml
dotenv = "0.15.0"
```

La compilación de dotenv no debería tardar mucho.

La paciencia es virtud de sabios, pronto podremos comenzar a programar nuestra REST API, por el momento solo debemos escribir la URL de conexión a la base de datos en un archivo `.env` que Dotenv leerá desde nuestro código en Rust. Para manejadores de bases de datos más complejos la URL requiere de parámetros más específicos, sin embargo con SQLite3 esto no es necesario, solo debemos indicar el archivo donde guardaremos nuestros datos, todo esto puede lograrse de una forma sencilla con una sola orden en la línea de comandos:

```sh
$ echo DATABASE_URL=debug.db > .env
```

Hecho esto debemos ejecutar `$ diesel setup`. Si el archivo `debug.db` no existe no pasa nada, diesel lo creará por nosotros.

Antes de comenzar a programar debemos crear un archivo más además de nuestro archivo principal de Rust (`main.rs`), debemos crear un archivo llamado `models.rs` donde guardaremos los modelos de nuestra base de datos.

Creado nuestro archivo `models.rs` tenemos todo listo para comenzar a programar como todos unos campeones.

## Creando los modelos para la base de datos

Para este ejemplo haremos una pequeña REST API para una tienda de mascotas, específicamente una tienda que vende gatos. Dentro de la misma guardaremos cuatro datos diferentes:
* Nombre del Gato
* Foto del gato
* ¿Ya lo adoptaron?
* Descripción del gato

Para activar los lints y el uso correcto de los módulos en rust, debemos añadir la siguiente línea a nuestro archivo `main.rs`, recomiendo ponerla arriba de la función main, pero debajo de donde importamos las bibliotecas que usaremos en un futuro. Nuestro archivo `main.rs` deberá verse así:

```rust
use std::io;

mod models;

fn main() {
    println!("Hello, world!");
}
```

Ahora regresemos a nuestro archivo `models.rs`, aquí debemos importar tres cosas de Diesel para comenzar a trabajar:

```rust
use diesel;
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
```

El primer import traerá al namespace las partes escenciales de Diesel, el segundo es el `prelude`, en escencia el prelude es una medida que se implemente para bibliotecas muy grandes que tienen una cantidad muy grande de funciones ampliamente usadas. Importar estas funciones una por una resultaría en un archivo muy grande o simplemente muy *verboso* 

Ahora debemos crear una estructura con visiblidad "Pública" donde guardaremos nuestros datos, en este caso la estructura se llamará `Cat` (gato, en inglés), entonces, dentro de nuestro archivo `models.rs` escribiremos la estructura correspondiente:

```rust
pub struct Cat {
    pub id: i32,
    pub name: String,
    pub photo_url: String,
    pub is_adopted: bool,
    pub description: String,
}
```

Los campos de `Cat` son los siguientes:
- id: El identificador numérico del gato en cuestión
- name: El nombre del gato
- photo_url: La dirección web donde podemos encontrar una foto de nuestro gato
- is_adopted: Un booleano que nos indicará si ya adoptaron al gatito o no
- description: La descripción del gato

Para que Diesel reconozca esto como una tabla para la base de datos, debemos añadir un atributo a la estructura, en este caso el atributo es `#[derive(Queryable)]`. Al final nuestro archivo `models.rs` debería verse así:

```rust
use diesel;
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;

#[derive(Queryable)]
pub struct Cat {
    pub id: i32,
    pub name: String,
    pub photo_url: String,
    pub is_adopted: bool,
    pub description: String,
}
```

No te preocupes por los warnings de imports sin usar, pronto comenzaremos a implementarlos.

¿Recuerdas cuando ejecutamos el comando `diesel setup`? Pues cuando entramos en el directorio de nuestro proyecto podremos ver una nueva carpeta llamada `migrations` pero, por el momento estará vacío. Para crear una nueva migración necesitaremos ejecutar el comando `diesel migration generate create_cats`. Puedes cambiar la parte de `create_cats` por el nombre que desees.

Si todo salió bien habrá un nuevo directorio con el formato `yyy-mm-dd-uuid_nombre`, en este caso el directorio de los gatitos se llama `2022-01-25-033422_create_cats`, dentro de este directorio se crearán dos archivos, un archivo `up.sql` y un archivo `down.sql`. 

El archivo `up.sql` servirá para crear las tablas o hacer las operaciones necesarias en la migración. Antes de hacer nada, Diesel revisará este archivo y nos informará de errores de sintaxis o consultas que podrían ser potencialmente dañinas para la integridad de la base de datos.

Por otra parte el archivo `down.sql` se encargará de deshacer TODO lo que el archivo `up.sql` haga en la base de datos. 

Personalmente esto es lo que me gusta de Diesel como ORM, al menos la parte de creación / eliminación de tablas se le deja completamente al usuario y, si bien uno podría argumentar que "El ORM lo hace mejor", lo cierto es que, utilizando otro tipo de lenguaje, *te falta mucho barrio* si te equivocas creando o eliminado tablas, especialamente tablas sin dependencias o llaves foráneas.

Primero debemos modificar nuestro archivo `down.sql` y dentro de el colocaremos la siguiente línea:

```sql
DROP TABLE IF EXISTS cats;
```

Si no sabes mucho de SQL es sencillo, si la tabla `cats` existe, si no existe, pues no hacemos nada.

Ahora vayamos al archivo `up.sql`, aquí es donde debemos escribir las consultas SQL para crear las tablas en la base de datos. En este caso tengo que recalcar una cosa importante, la sintaxis de las consultas puede variar de gestor a gestor, en este caso estamos usando la sintaxis de SQLite, por lo que esto podría **NO** funcionar en otros motores como MariaDB o PostgreSQL.

Dicho esto, la consulta SQL para crear la tabla necesaria es sencilla, por lo que nuestro archivo `up.sql` deberá verse así:

```sql
CREATE TABLE IF NOT EXISTS cats (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    is_adopted BOOLEAN NOT NULL,
    description TEXT NOT NULL
);
```

De nuevo, no hay que ser un genio en SQL para entender lo que hace esta consulta. Si la tabla `cats` no existe habrá que crearla primero, dentro de ella se creará un `id` que es un entero que fungirá como llave primaria, los otros campos utilizan las abstracciones de tipos de SQLite3, en este caso `TEXT` es similar a `VARCHAR` u otros tipos de dato similares en los manejadores SQL clásicos.

Cuando terminemos de escribir nuestros archivos `up.sql` y `down.sql` debemos ejecutar el comando `$ diesel migration run`. Esto ejecutará los archivos correspondientes para crear / eliminar las tablas de la base de datos. En caso de que algo salga mal, siempre podemos ejecutar el comando `$ diesel migration redo` para volver a ejecutar las migraciones "desde cero".

En versiones anteriores de Diesel teníamos que ejecutar un comando para imprimir nuestro esquema de la base de datos, si mi memoria no me falla el comando era algo así: `diesel print-schema > src/schema.rs` . Sin embargo, ahora ese paso no es necesario, este comando se ejecutará de forma automática luego de las migraciones. Si realizamos los pasos correctamente el archivo `schema.rs` debería verse de la siguiente forma:

```rust
table! {
    cats (id) {
        id -> Integer,
        name -> Text,
        photo_url -> Text,
        is_adopted -> Bool,
        description -> Text,
    }
}
```

Si todo se generó correctamente, ahora podemos continuar editando nuestro archivo `models.rs` y añadir los siguientes imports debajo de diesel.

```rust
use crate::schema::cats;
use crate::schema::cats::dsl::cats as all_cats;
```

Como dato importante, no debemos olvidar que debemos añadir `mod schema;` en nuestro archivo `main.rs` para incluirlo como módulo en nuestro proyecto de Rust. 

Ahora viene una parte interesante. Para manejar las inserciones, modificaciones o eliminaciones de los registros en nuestra base de datos, necesitaremos de una segunda estructura con propiedades insertables y que apunte a un nombre de tabla en específico, solo hace falta copiar nuestra estructura anterior, eliminar el campo de identificación, añadir el prefijo `New` y un par de atributos por encima de la misma, estos atributos son `#[derive(Insertable)]` y `#[table_name = "cats"]`, en nuestro caso la estructura debería verse así:

```rust
#[derive(Insertable)]
#[table_name = "cats"]
pub struct NewCat {
    pub name: String,
    pub photo_url: String,
    pub is_adopted: bool,
    pub description: String,
}
```

Se lo que estás pensando: *"Mi IDE me está diciendo que tengo errores por todos lados*", no te preocupes, esto pasa porque no le hemos indicado a Rust que deseamos utilizar los macros que vienen dentro de Diesel, esto se soluciona fácilmente añadiendo un par de líneas a nuestro archivo `main.rs`:

```rust
// -- Bibliotecas
use std::io;

// -- Usar los macros de Diesel
#[macro_use]
extern crate diesel;

// -- Módulos
mod models;
mod schema;

fn main() {
    println!("Hello, world!");
}
```

Esto debería eliminar los errores de compilación, quedarán un par de warnings, pero iremos eliminándolas poco a poco. Ahora, regresemos a nuestro archivo `models.rs` para crear los métodos comunes, para esto necesitamos crear una implementación `impl` para nuestra estructura `Cat`. Dentro de `models.rs` crearemos un nuevo bloque de implementación y en las siguientes secciones describiré los métodos que este bloque deberá contener. (No tienen que estar en el mismo orden.) De igual forma, si te pierdes en el proceso recuerda que al final del blog hay un enlace a un repositorio de GitHub donde podrás bajar el proyecto como plantilla, dentro de `models.rs` abre un nuevo bloque debajo de `NewCat`:

```rust
impl Cat {
// -- Métodos aquí
}
```

**NOTA**: Algunos métodos regresarán Vectores con datos y, más abajo será muy notorio por que, sin embargo, otros métodos regresarán solo un booleano para saber si la operación fue satisfactoria o no. Si aún no dominas las funciones y sus tipos de retorno en Rust te recomiendo volver a leer [el libro](https://doc.rust-lang.org/book/).

### El método show
El método show nos permitirá mostrar una entrada de la base de datos en específico basados en el identificador, en pocas palabras nos mostrará los datos de el gato que nosotros necesitemos, siempre y cuando el gato exista y tenga un identificador válido.

Dentro de nuestro bloque `impl Cat{...}` podemos añadir el método `show` de la siguiente forma:

```rust
    pub fn show(id: i32, conn: &SqliteConnection) -> Vec<Cat> {
        all_cats
            .find(id)
            .load::<Cat>(conn)
            .expect("Ocurrió un error al cargar el gato...")
    }
```

Considero que no es necesario explicar la estructura de la función en si, la parte interesante está en la forma de hacer consultas, `find()` busca por "llave primaria" según la [documentación de Diesel](https://docs.diesel.rs/1.4.x/diesel/dsl/type.Find.html), en este caso `id` lo definimos como una llave primaria en nuestra tabla SQL. Por otra parte `load` ejecuta una consulta y regresa un vector de resultados, al combinarlos tenemos la consulta completa donde primero buscamos al gato cuyo `id` sea igual al del parámetro de la función y luego ejecutamos la consulta, regresando un Vector de un solo elemento que en este caso es, el gato consultado. 

No explicaré la parte del manejo de errores con `expect`, ya que es similar a `unwrap` pero con la habilidad de poner un mensaje de error personalizado, puedes leer más al respecto [aquí](https://learning-rust.github.io/docs/e4.unwrap_and_expect.html).

### El método all
Este método nos arrojará un vector con todos los registros que tengamos en la base de datos de la estructura que le pedimos, en este caso `Cat`. El método es el siguiente:

```rust
    pub fn all(conn: &SqliteConnection) -> Vec<Cat> {
        all_cats
            .order(cats::id.desc())
            .load::<Cat>(conn)
            .expect("Ocurrió un error al cargar todos los gatos...")
    }
```

Por conveniencia, ordenaremos los gatos de forma descendente por identificador y luego ejecutaremos la consulta.

### El método update by id
Este método nos permitirá actualizar la información de un solo gato siempre y cuando tengamos un identificador del mismo. Su estructura es un poco más compleja que las otras funciones porque requiere de consultar y reescribir todos y cada uno de los campos del gato en cuestión. El método es demasiado largo para explicarlo correctamente sin dar vueltas en múltiples temas, en muy resumidas cuentas, estamos creando una estructura con nuevo gato que reemplazará a al gato que Diesel encuentre en la línea `diesel::update(all_cats.find(id))`.

El método es el siguiente:

```rust
    pub fn update_by_id(id: i32, conn: &SqliteConnection, cat: NewCat) -> bool {
        use crate::schema::cats::dsl::{
            description as d, is_adopted as i, name as n, photo_url as p,
        };

        let NewCat {
            name,
            photo_url,
            is_adopted,
            description,
        } = cat;

        diesel::update(all_cats.find(id))
            .set((
                n.eq(name),
                p.eq(photo_url),
                i.eq(is_adopted),
                d.eq(description),
            ))
            .execute(conn)
            .is_ok()
    }
```

### El método insert
Insert, como su nombre lo dice nos permitirá insertar un nuevo gato en el registro de nuestra base de datos. El método no tiene mucha ciencia, solo debemos enviar una estructura `NewCat` al método (ya llena) y el se encargará de crear un nuevo registro en la base de datos con las medidas pertinentes. El método es el siguiente:

```rust
    pub fn insert(cat: NewCat, conn: &SqliteConnection) -> bool {
        diesel::insert_into(cats::table)
            .values(&cat)
            .execute(conn)
            .is_ok()
    }
```

### El método delete by id
Este método eliminará de la base de datos el gato con el id que solicitemos. Para evitar una operación incorrecta primero revisará si la tabla donde buscamos borrar el gato se encuentra vacía, si lo está simplemente regresará `false` pues no hay nada que borrar. El método es el siguiente:

```rust
    pub fn delete_by_id(id: i32, conn: &SqliteConnection) -> bool {
        if Cat::show(id, conn).is_empty() {
            return false;
        };
        diesel::delete(all_cats.find(id)).execute(conn).is_ok()
    }
````


### El método all by name
El último método nos ayudará a listar múltiples gatos, en caso de que varios tengan el mismo nombre y necesitemos buscar uno en específico o en caso de que necesitemos trabajar con todos los gatos llamados "Misifu". El método es el siguiente:

```rust
    pub fn all_by_name(name: String, conn: &SqliteConnection) -> Vec<Cat> {
        all_cats
            .filter(cats::name.eq(name))
            .load::<Cat>(conn)
            .expect("Ocurrió un error al cargar los gatos por nombre")
    }
```

Con esto podemos dar por terminados los métodos comunes y el "esqueleto" de nuestra REST API. Sin embargo esto aún no termina, aun necesitamos probarla, implementar rocket y sus endpoints para que los métodos nos regresen una respuesta en JSON y crear un pequeño frontend para consumir nuestra API de gatitos. 

Nuestro archivo `models.rs` deberá verse así una vez terminemos de implementar estos métodos:

```rust
use diesel;
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;

use crate::schema::cats;
use crate::schema::cats::dsl::cats as all_cats;

#[derive(Queryable)]
pub struct Cat {
    pub id: i32,
    pub name: String,
    pub photo_url: String,
    pub is_adopted: bool,
    pub description: String,
}

#[derive(Insertable)]
#[table_name = "cats"]
pub struct NewCat {
    pub name: String,
    pub photo_url: String,
    pub is_adopted: bool,
    pub description: String,
}

impl Cat {
    pub fn show(id: i32, conn: &SqliteConnection) -> Vec<Cat> {
        all_cats
            .find(id)
            .load::<Cat>(conn)
            .expect("Ocurrió un error al cargar el gato...")
    }

    pub fn all(conn: &SqliteConnection) -> Vec<Cat> {
        all_cats
            .order(cats::id.desc())
            .load::<Cat>(conn)
            .expect("Ocurrió un error al cargar todos los gatos...")
    }

    pub fn update_by_id(id: i32, conn: &SqliteConnection, cat: NewCat) -> bool {
        use crate::schema::cats::dsl::{
            description as d, is_adopted as i, name as n, photo_url as p,
        };

        let NewCat {
            name,
            photo_url,
            is_adopted,
            description,
        } = cat;

        diesel::update(all_cats.find(id))
            .set((
                n.eq(name),
                p.eq(photo_url),
                i.eq(is_adopted),
                d.eq(description),
            ))
            .execute(conn)
            .is_ok()
    }

    pub fn insert(cat: NewCat, conn: &SqliteConnection) -> bool {
        diesel::insert_into(cats::table)
            .values(&cat)
            .execute(conn)
            .is_ok()
    }

    pub fn delete_by_id(id: i32, conn: &SqliteConnection) -> bool {
        if Cat::show(id, conn).is_empty() {
            return false;
        };
        diesel::delete(all_cats.find(id)).execute(conn).is_ok()
    }

    pub fn all_by_name(name: String, conn: &SqliteConnection) -> Vec<Cat> {
        all_cats
            .filter(cats::name.eq(name))
            .load::<Cat>(conn)
            .expect("Ocurrió un error al cargar los gatos por nombre")
    }
}
```

## Probando el ORM
Es tiempo de probar nuestro ORM y ver si es capaz de insertar datos correctamente en la base de datos, para ello necesitaremos hacer modificaciones menores a nuestro archivo `main.rs`, te mostraré como se deberá de ver, no te preocupes, que lo explicaré una vez mostrado el código:

```rust
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use dotenv::dotenv;
use std::env;

#[macro_use]
extern crate diesel;

mod models;
mod schema;

fn main() {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("No se encontró la variable DATABASE_URL");
    let conn = SqliteConnection::establish(&database_url).unwrap();

    let cat = models::NewCat {
        name: "Erina".to_string(),
        photo_url: "https://raw.githubusercontent.com/VentGrey/ventgrey.github.io/master/assets/img/erina.jpg".to_string(),
        is_adopted: true,
        description: "Erina es un gato de la raza 'ocicat' adoptada el 6 de Septiembre del 2021, es una gata tranquila y traviesa.".to_string()
    };

    if models::Cat::insert(cat, &conn) {
        println!("Se registró el gato correctamente");
    } else {
        println!("No se pudo añadir el gato a la base de datos");
    }
}
```

Primero lo primero importamos las cosas necesarias. Dentro de la función `main` tenemos `dotenv().ok()`, de acuerdo a la [documentación de dotenv](https://docs.rs/dotenv/latest/dotenv/fn.dotenv.html), esto es todo lo que necesitamos para que la biblioteca lea el archivo `.env` que creamos antes y la cargue en memoria. Luego tenemos la variable `database_url` que utiliza `std::env` para leer una variable de entorno y guardarla como un `String` si es que la encuentra, en caso de no encontrarla el programa se detendrá y Rust nos enviará un error informándonos que dicha variable no se encontró.

La variable `conn` la utilizamos para crear una conexión a la base de datos Sqlite que creamos antes, esta se realiza utilizando la variable `database_url`, como regresa un `Result` podemos (aunque no es recomendado) utilizar el método `unwrap`, pues, si todo va bien no es necesario reportar nada, pero si falla, no tiene sentido continuar con la ejecución del programa,  por lo tanto Rust hará que el programa falle directamente y termine su ejecución.

Debajo creamos una variable `cat` la cual solo es una estructura `NewCat` con los datos de un gato, en mi caso utilicé a mi gata Erina como prueba. Debajo de la declaración solo creamos una condicional para ver si la inserción en la base de datos fue realizada correctamente.

Si seguimos estos pasos al pie de la letra deberíamos poder ejecutar el comando `$ cargo run` y obtener la siguiente salida:

```
warning: `rest-rust-template` (bin "rest-rust-template") generated 5 warnings
    Finished dev [unoptimized + debuginfo] target(s) in 0.67s
     Running `target/debug/rest-rust-template`
Se registró el gato correctamente
```

Véase la última línea: `Se registró el gato correctamente`. Para comprobar esto utilizaré la herramienta [sqlite browser](https://sqlitebrowser.org/) para revisar la base de datos y comprobar que en efecto, Erina fue registrada correctamente:

![Imágen del explorador de Sqlite mostrando el registro de Erina](https://raw.githubusercontent.com/VentGrey/ventgrey.github.io/master/assets/img/sqlite.png)

¡Perfecto! Nuestros métodos de inserción funcionan. Ahora tomemos el camino riesgoso y comencemos a modificar nuestra API como bestias sin haber probado los otros métodos.

## Añadiendo rocket con soporte para JSON
Si tienes buena memoria recordarás que, en nuestro archivo `Cargo.toml` ya colocamos `r2d2` como *"feature"* de Diesel en su momento, esto con la finalidad de evitar esa mala práctica de importar una nueva versión de una biblioteca cuando no es requerida forzosamente. Ahora haremos lo mismo con Rocket, normalmente se añade rocket, serde, serde-json y otras dependencias al archivo `Cargo.toml`, gracias al cielo con Rocket v0.5-rc1 esto ya no pasa, pues el soporte para JSON viene como *feature* y las crates de `rocket_codegen` y `rocket_contrib` ya se encuentran *deprecated*. 

Solo es necesario añadir una línea con los features que deseamos incluir en nuestro proyecto, en este caso necesitamos de las features de JSON para que nuestra REST API pueda enviarnos los datos codificados como JSON a través de sus endpoints. Solo hay que añadir la línea `rocket = { version = "0.5.0-rc.1", features = [ "json" ] }` a nuestro archivo `Cargo.toml` y tenemos todo para ganar.

Hecho esto es recomendable volver a ejecutar `$cargo build` para que Cargo descargue y compile las dependencias necesarias para Rocket. 

## Implementando r2d2

Por el momento nuestra API funciona correctamente, sin embargo tiene un pequeño problema. Establecer una nueva conexión a una base de datos cada vez que necesitamos consumir datos de la misma es ineficiente y pesado en recursos, esto (por experiencia) puede hacer que la máquina que está ejecutando nuestro servidor comience a fallar, que salte el demonio *EarlyOOM* y mate procesos que considere innecesarios (a veces mata cosas importantes) o que simplemente el servidor colapse por falta de recursos. 

Para solucionar este problema existe `r2d2` el cual podría definirse como un "manejador de conexiones" para las bases de datos.

La implementación es corta, no es sencilla y explicarla es complejo.

> Para serte sincero, ni yo tengo idea de que es lo que hice en ese momento, tuve que experimentar mucho con los genéricos, tutoriales y documentación sobre traits en Rust para llegar a un resultado que funcione bien.

Primero debemos crear un archivo llamado `db.rs` en el mismo directorio donde se encuentra nuestro archivo `main.rs` (No olvides incluirlo como módulo dentro de `main.rs` usando `mod db;`), una vez incluido como módulo debemos añadir los siguientes imports al inicio del archivo:

```rust
use diesel::r2d2::ConnectionManager;
use diesel::sqlite::SqliteConnection;
use rocket::http::Status;
use rocket::outcome::try_outcome;
use rocket::outcome::Outcome;
use rocket::request::{self, FromRequest};
use rocket::{Request, State};
use std::ops::Deref;
```

Para ahorrarnos un par de errores en el futuro también es conveniente añadir estas líneas a nuestro archivo `main.rs` debajo del uso de macros de Diesel:

```rust
#[macro_use]
extern crate rocket;
```

En caso de que estés perdido en este punto, nuestro archivo `main.rs` deberá verse así:

```rust
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use dotenv::dotenv;
use std::env;

#[macro_use]
extern crate diesel;
//-- Esto fue lo que añadimos
#[macro_use]
extern crate rocket;
//--
mod db;
mod models;
mod schema;

fn main() {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("No se encontró la variable DATABASE_URL");
    let conn = SqliteConnection::establish(&database_url).unwrap();

    let cat = models::NewCat {
        name: "Erina".to_string(),
        photo_url: "https://raw.githubusercontent.com/VentGrey/ventgrey.github.io/master/assets/img/erina.jpg".to_string(),
        is_adopted: true,
        description: "Erina es un gato de la raza 'ocicat' adoptada el 6 de Septiembre del 2021, es una gata tranquila y traviesa.".to_string()
    };

    if models::Cat::insert(cat, &conn) {
        println!("Se registró el gato correctamente");
    } else {
        println!("No se pudo añadir el gato a la base de datos");
    }
}
```

Ahora si, de vuelta a nuestro archivo `db.rs`.

Dentro del mismo haremos un "wrapper" para un manejador de conexiones utilizando la versión de `r2d2` que viene con Diesel, una función de inicialización de manejo de conexiones y finalmente un par de traits para terminar la implementación. 

Como dije anteriormente, este archivo es un poco complejo de explicar y este blog ya es de por si bastante largo, sin embargo no te dejaré con la curiosidad, aquí tienes algunos recursos que utilicé para esto:

- [El trait `FromRequest` de Rocket](https://api.rocket.rs/v0.5-rc/rocket/request/trait.FromRequest.html)
- ["Guards" con Rocket](https://rocket.rs/v0.5-rc/guide/state/#within-guards)
- [Primeros pasos con Rocket y r2d2](https://users.rust-lang.org/t/first-baby-steps-with-diesel-r2d2/37858/5)
- [La implementación de r2d2 de Diesel](https://docs.diesel.rs/diesel/r2d2/index.html?search=j#)

Con esta información servida, el archivo `db.rs` debería verse así:

**NOTA: Esto está diseñado para trabajar con bases de datos SQLite, con cosas como PostgreSQL y/o MySQL/MariaDB tus resultados podrían variar, así que deberás modificar esto de acuerdo a tus necesidades**

```rust
use diesel::r2d2::ConnectionManager;
use diesel::sqlite::SqliteConnection;
use rocket::http::Status;
use rocket::outcome::try_outcome;
use rocket::outcome::Outcome;
use rocket::request::{self, FromRequest};
use rocket::{Request, State};
use std::ops::Deref;

// Create a wrapper for the r2d2 Pool object
pub type Pool = diesel::r2d2::Pool<ConnectionManager<SqliteConnection>>;

pub fn init_pool(db_url: String) -> Pool {
    let manager = ConnectionManager::<SqliteConnection>::new(db_url);
    diesel::r2d2::Pool::new(manager).expect("Failed to init database pool!")
}

// Create a guard for our database connection
pub struct Conn(pub diesel::r2d2::PooledConnection<ConnectionManager<SqliteConnection>>);

#[rocket::async_trait]
impl<'r> FromRequest<'r> for Conn {
    type Error = ();

    async fn from_request(request: &'r Request<'_>) -> request::Outcome<Conn, ()> {
        let pool = try_outcome!(request.guard::<&State<Pool>>().await);
        match pool.get() {
            Ok(conn) => Outcome::Success(Conn(conn)),
            Err(_) => Outcome::Failure((Status::ServiceUnavailable, ())),
        }
    }
}

impl Deref for Conn {
    type Target = SqliteConnection;

    // Rust already inlines this, no need to specify the previous decorator.
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
```

Antes de implementar nuestros métodos en `db.rs` tenemos que regresar a nuestro archivo `models.rs` para implementar Serde y así poder codificar nuestras estructuras en JSON.

Dentro de `models.rs` en la parte de los imports necesitamos añadir dos líneas extra, una para el serializador y otra para el deserializador:

```rust
use rocket::serde::Deserialize;
use rocket::serde::Serialize;
```

Debajo, en la estructura `Cat` modificaremos el atributo `derive` para añadir los atributos `Serialize`, `Debug` y `Clone`. 

**NOTA: Es probable que, si incluyes estos atributos, Cargo te arroje un error: `error[E0463]: can't find crate for serde`, esto ocurre por una regla de Rust llamada "Rust Orphan Rule". El fix es sencillo, solo hace falta añadir un atributo extra debajo de derive**

De igual forma modificaremos la estructura `NewCat`, para no alargarme demasiado ambas estructuras deberán verse así:

```rust
#[derive(Serialize, Queryable, Debug, Clone)]
#[serde(crate = "rocket::serde")]
pub struct Cat {
    pub id: i32,
    pub name: String,
    pub photo_url: String,
    pub is_adopted: bool,
    pub description: String,
}

#[derive(Insertable, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
#[table_name = "cats"]
pub struct NewCat {
    pub name: String,
    pub photo_url: String,
    pub is_adopted: bool,
    pub description: String,
}
```

Con esto la serialización y deserialización de nuestras estructuras en JSON está "casi" completa. 

Es tiempo de implementar nuestro manejador de conexiones de bases de datos junto con rocket en nuestro archivo `main.rs`

## Rocket y las rutas
Para comenzar con Rocket es necesario modificar nuestra función `main`. Hay muchas formas de hacer esto según la documentación de Rocket, sin embargo yo recomiendo que eliminemos lo poco que tenemos en la función `main` y lo reemplazemos por esto:

```rust
#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index])
}
```

Solo debemos restaurar dos líneas para que el funcionamiento se acerque a lo que teníamos antes (no te preocupes por la prueba de inserción de datos, eso lo manejaremos más tarde), podemos aprovechar para utilizar nuestro manejador de conexiones de bases de datos en `db.rs` aquí:

```rust
#[launch]
fn rocket() -> _ {
    dotenv().ok();
    let db_url: String = env::var("DATABASE_URL").expect("set DATABASE_URL");
	// -- Se añadió esta linea
    let pool = db::init_pool(db_url);
	// --
    rocket::build().mount("/", routes![index])
}
```

## Manejando archivos estáticos
Algo que nos sería de mucha utilidad sería una ruta para manejar los archivos estáticos y servirlos si son requeridos por el usuario. Para esto es necesario repetir el paso donde creamos un módulo. En el mismo directorio donde se encuentra `main.rs` debemos crear un archivo llamado `static_files.rs` y lo incluimos en `main.rs` con la línea `mod static_files;`.

Dentro de `static_files.rs` colocaremos el siguiente código:

```rust
use rocket::fs::NamedFile;
use std::io;
use std::path::{Path, PathBuf};

#[get("/")]
pub async fn index() -> io::Result<NamedFile> {
    NamedFile::open("public/index.html").await
}

#[get("/<file..>", rank = 5)]
pub async fn all(file: PathBuf) -> Option<NamedFile> {
    NamedFile::open(Path::new("public/").join(file)).await.ok()
}
```

La primer función utiliza un macro declarativo y fungirá como el índice de nuestra página web servida con Rocket. Esta función `index` regresará un resultado con un archivo, el archivo en cuestión es un `index.html` dentro del directorio `public/`.

Asimismo en la función debajo hace algo similar, solo que utilizará los macros declarativos para servir archivos estáticos, en este caso todos los que se encuentren en el directorio `public/`.

Por el momento no crearemos ningún archivo estático. Recuerda que al inicio del tutorial dije que utilizaríamos Svelte como framework de JavaScript para ejemplificar como consumir esta pequeña API. 

Ahora debemos añadir nuestras rutas estáticas a la función `rocket` en nuestro archivo `main.rs`, con las rutas añadidas la función `rocket` ahora debería verse así:

```rust
#[launch]
fn rocket() -> _ {
    dotenv().ok();
    let db_url: String = env::var("DATABASE_URL").expect("set DATABASE_URL");
    let pool = db::init_pool(db_url);
    rocket::build().mount(
        "/",
        routes![crate::static_files::all, crate::static_files::index],
    )
}
```

## Creando los endpoints
Casi hemos terminado nuestra REST API, nos falta una parte muy importante que son los *endpoints*, estos devolverán una respuesta diferente dependiendo de la petición HTTP que les enviemos (GET, POST, UPDATE, DELETE, etc) o no enviarán nada. Para comenzar a desarrollar nuestros endpoints debemos crear un archivo `routes.rs` en el mismo directorio donde se encuentra nuestro archivo `main.rs` y añadirlo como módulo usando la línea `mod routes;`.

Dentro de nuestro archivo `routes.rs` debemos incluir los siguientes imports:

```rust
use crate::db::Conn as DbConn;
use crate::models::{Cat, NewCat};
use rocket::serde::json::{json, Json, Value};
```

### Endpoint: index
La primera cosa que implementaremos en nuestra API será un endpoint que nos permitirá sacar toda la información de nuestra base de datos en una sola operación. Rocket nos puede ayudar con el uso de atributos, en este caso atributos especiales para manejo de rutas y respuestas:

```rust
#[get("/cats", format = "application/json")]
pub fn index(conn: DbConn) -> Json<Value> {
    let cats: Vec<Cat> = Cat::all(&conn);

    Json(json!({
        "status": 200,
        "result": cats,
    }))
}
```

La función hará una conexión a nuestra base de datos y regresará los datos ya formateados como JSON, dentro del JSON regresaremos dos cosas, el código de salida (200 en caso de que todo vaya bien) y `"result"` que será un arreglo enorme con todos los gatos que tengamos registrados en nuestra base de datos.

### Endpoint: new

Ahora necesitamos crear un endpoint que nos permita crear un nuevo gato si es necesario:

```rust
#[post("/cats", format = "application/json", data = "<new_cat>")]
pub fn new(conn: DbConn, new_cat: Json<NewCat>) -> Json<Value> {
    Json(json!({
        "status": Cat::insert(new_cat.into_inner(), &conn),
        "result": Cat::all(&conn).first(),
    }))
}
```

El atributo que usaremos esta vez sirve para procesar peticiones POST, de igual forma la respuesta será en formato JSON, con la diferencia que ahora tendremos un campo nuevo llamado `data` el cual guardará un nuevo gato, en nuestro caso es el gato que guardaremos en la base de datos. Esta función nos devolverá un JSON con el estatus de salida de la inserción del gato y el resultado que es el mismo gato que acabamos de insertar en la base de datos.

### Endpoint: show
Ahora ¿Qué pasa si necesitamos consultar un gato en específico? Simple, ahora necesitamos hacer un endpoint que nos permita hacer eso mismo, en esta caso lo llamaremos `show`:

```rust
#[get("/cats/<id>", format = "application/json")]
pub fn show(conn: DbConn, id: i32) -> Json<Value> {
    let result: Vec<Cat> = Cat::show(id, &conn);
    let status: i32 = if result.is_empty() { 404 } else { 200 };

    Json(json!({
        "status": status,
        "result": result.get(0),
    }))
}
```

Este endpoint vuelve a hacer uso del macro `GET`, solo que en este caso utiliza las directivas especiales de las rutas de Rocket, llamadas *Dynamic Paths* (mas información [aquí](https://rocket.rs/v0.5-rc/guide/requests/#dynamic-paths)). Con esto podemos consultar el ID de un gato en específico y Rocket sabrá dirigirnos al mismo, lo mejor de todo es que nos devolverá el gato ya codificado como JSON.

### Endpoint: update
¿Registraste mal un gato? ¿Alguien ya lo adoptó? Para eso podemos crear un endpoint `update`:

```rust
#[put("/cats/<id>", format = "application/json", data = "<cat>")]
pub fn update(conn: DbConn, id: i32, cat: Json<NewCat>) -> Json<Value> {
    let status: i32 = if Cat::update_by_id(id, &conn, cat.into_inner()) {
        200
    } else {
        404
    };

    Json(json!({
        "status": status,
        "result": null,
    }))
}
```

Empiezo a pensar que todas las cosas que impliquen un update siempre serán un despelote....`¯\_(ツ)_/¯` anyways.

Este método necesitará que le digamos en la URI el ID del gato que deseamos actualizar, para esto será necesario enviar un nuevo gato. La condicional en el JSON devuelto dependerá de la salida del comando de actualización. Si el gato pudo actualizarse correctamente el status de salida será un 200, en cualquier otro caso devolveremos un error 404 (Es recomendable manejar los errores mejor de lo que yo lo hice, pues una actualización no solo podría fallar por no encontrar un gato, si no por un error de servidor).

### Endpoint: delete

Casi hemos terminado, ahora necesitamos un endpoint para eliminar un gato de la base de datos en caso de que lo necesitemos.

```rust
#[delete("/cats/<id>")]
pub fn delete(id: i32, conn: DbConn) -> Json<Value> {
    let status: i32 = if Cat::delete_by_id(id, &conn) {
        200
    } else {
        404
    };
    Json(json!({
        "status": status,
        "result": null,
    }))
}
```

Este endpoint hace uso del atributo `delete` y al igual que los anteriores, requiere del ID de un gato específico para que lo borre de nuestra base de datos. El modo de regresar el status es similar al del endpoint `update` y de nuevo lo recalcaré, recomiendo hacer un mejor manejo de errores.

### Endpoint: name

Finalmente, en caso de que necesitemos consultar todos los gatos con un nombre en específico podemos crear un endpoint `name` para ello:

```rust
#[get("/cats/names/<name>", format = "application/json")]
pub fn name(name: String, conn: DbConn) -> Json<Value> {
    Json(json!({
        "status": 200,
        "result": Cat::all_by_name(name, &conn),
    }))
}
```

Este endpoint llamará a la función `all_by_name` y nos devolverá un solo JSON con todos los gatos que compartan el mismo nombre. En este caso no manejé errores por flojo, no hagas eso tu también. Con este último endpoint nuestro archivo `routes.rs` debería estar terminado, en caso de que te hayas perdido el resultado final debería verse así:

```rust
use crate::db::Conn as DbConn;
use crate::models::{Cat, NewCat};
use rocket::serde::json::{json, Json, Value};

#[get("/cats", format = "application/json")]
pub fn index(conn: DbConn) -> Json<Value> {
    let cats: Vec<Cat> = Cat::all(&conn);

    Json(json!({
        "status": 200,
        "result": cats,
    }))
}

#[post("/cats", format = "application/json", data = "<new_cat>")]
pub fn new(conn: DbConn, new_cat: Json<NewCat>) -> Json<Value> {
    Json(json!({
        "status": Cat::insert(new_cat.into_inner(), &conn),
        "result": Cat::all(&conn).first(),
    }))
}

#[get("/cats/<id>", format = "application/json")]
pub fn show(conn: DbConn, id: i32) -> Json<Value> {
    let result: Vec<Cat> = Cat::show(id, &conn);
    let status: i32 = if result.is_empty() { 404 } else { 200 };

    Json(json!({
        "status": status,
        "result": result.get(0),
    }))
}

#[put("/cats/<id>", format = "application/json", data = "<cat>")]
pub fn update(conn: DbConn, id: i32, cat: Json<NewCat>) -> Json<Value> {
    let status: i32 = if Cat::update_by_id(id, &conn, cat.into_inner()) {
        200
    } else {
        404
    };

    Json(json!({
        "status": status,
        "result": null,
    }))
}

#[delete("/cats/<id>")]
pub fn delete(id: i32, conn: DbConn) -> Json<Value> {
    let status: i32 = if Cat::delete_by_id(id, &conn) {
        200
    } else {
        404
    };
    Json(json!({
        "status": status,
        "result": null,
    }))
}

#[get("/cats/names/<name>", format = "application/json")]
pub fn name(name: String, conn: DbConn) -> Json<Value> {
    Json(json!({
        "status": 200,
        "result": Cat::all_by_name(name, &conn),
    }))
}
```

## Montando los endpoints

Casi hemos terminado nuestra REST API, solo queda montar los endpoints de nuestra API, para hacer esto solo tenemos que repetir el paso donde incluimos una función `mount()` en nuestro archivo `main.rs`, en este caso, montaremos nuestra API bajo la ruta `/api/` arriba de la ruta "/" . También podemos borrar el método `GET` que tenemos arriba de la función principal de Rocket:

```rust
#[launch]
fn rocket() -> _ {
    dotenv().ok();
    let db_url: String = env::var("DATABASE_URL").expect("set DATABASE_URL");
    let pool = db::init_pool(db_url);
    rocket::build()
        .manage(pool)
        .mount(
            "/api/",
            routes![
                crate::routes::index,
                crate::routes::new,
                crate::routes::show,
                crate::routes::delete,
                crate::routes::name,
                crate::routes::update
            ],
        )
        .mount(
            "/",
            routes![crate::static_files::all, crate::static_files::index],
        )
}
```

## Archivos finales
Si te perdiste en el proceso y deseas saber como se ven los archivos en este punto, no te preocupes, debajo podrás leer en un subtítulo el nombre del archivo y como debería verse llegados a este punto.

### src/main.rs
El archivo principal debería verse así:

```rust
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use dotenv::dotenv;
use std::env;

#[macro_use]
extern crate diesel;

#[macro_use]
extern crate rocket;

mod db;
mod models;
mod routes;
mod schema;
mod static_files;

#[launch]
fn rocket() -> _ {
    dotenv().ok();
    let db_url: String = env::var("DATABASE_URL").expect("set DATABASE_URL");
    let pool = db::init_pool(db_url);
    rocket::build()
        .manage(pool)
        .mount(
            "/api/",
            routes![
                crate::routes::index,
                crate::routes::new,
                crate::routes::show,
                crate::routes::delete,
                crate::routes::name,
                crate::routes::update
            ],
        )
        .mount(
            "/",
            routes![crate::static_files::all, crate::static_files::index],
        )
}
```

### src/models.rs
El archivo de los modelos de la base de datos deberá verse así:

```rust
use diesel;
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;

use rocket::serde::Deserialize;
use rocket::serde::Serialize;

use crate::schema::cats;
use crate::schema::cats::dsl::cats as all_cats;

#[derive(Serialize, Queryable, Debug, Clone)]
#[serde(crate = "rocket::serde")]
pub struct Cat {
    pub id: i32,
    pub name: String,
    pub photo_url: String,
    pub is_adopted: bool,
    pub description: String,
}

#[derive(Insertable, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
#[table_name = "cats"]
pub struct NewCat {
    pub name: String,
    pub photo_url: String,
    pub is_adopted: bool,
    pub description: String,
}

impl Cat {
    pub fn show(id: i32, conn: &SqliteConnection) -> Vec<Cat> {
        all_cats
            .find(id)
            .load::<Cat>(conn)
            .expect("Ocurrió un error al cargar el gato...")
    }

    pub fn all(conn: &SqliteConnection) -> Vec<Cat> {
        all_cats
            .order(cats::id.desc())
            .load::<Cat>(conn)
            .expect("Ocurrió un error al cargar todos los gatos...")
    }

    pub fn update_by_id(id: i32, conn: &SqliteConnection, cat: NewCat) -> bool {
        use crate::schema::cats::dsl::{
            description as d, is_adopted as i, name as n, photo_url as p,
        };

        let NewCat {
            name,
            photo_url,
            is_adopted,
            description,
        } = cat;

        diesel::update(all_cats.find(id))
            .set((
                n.eq(name),
                p.eq(photo_url),
                i.eq(is_adopted),
                d.eq(description),
            ))
            .execute(conn)
            .is_ok()
    }

    pub fn insert(cat: NewCat, conn: &SqliteConnection) -> bool {
        diesel::insert_into(cats::table)
            .values(&cat)
            .execute(conn)
            .is_ok()
    }

    pub fn delete_by_id(id: i32, conn: &SqliteConnection) -> bool {
        if Cat::show(id, conn).is_empty() {
            return false;
        };
        diesel::delete(all_cats.find(id)).execute(conn).is_ok()
    }

    pub fn all_by_name(name: String, conn: &SqliteConnection) -> Vec<Cat> {
        all_cats
            .filter(cats::name.eq(name))
            .load::<Cat>(conn)
            .expect("Ocurrió un error al cargar los gatos por nombre")
    }
}
```

### src/routes.rs
El archivo de rutas (endpoints) de nuestra API deberá verse así:

```rust
use crate::db::Conn as DbConn;
use crate::models::{Cat, NewCat};
use rocket::serde::json::{json, Json, Value};

#[get("/cats", format = "application/json")]
pub fn index(conn: DbConn) -> Json<Value> {
    let cats: Vec<Cat> = Cat::all(&conn);

    Json(json!({
        "status": 200,
        "result": cats,
    }))
}

#[post("/cats", format = "application/json", data = "<new_cat>")]
pub fn new(conn: DbConn, new_cat: Json<NewCat>) -> Json<Value> {
    Json(json!({
        "status": Cat::insert(new_cat.into_inner(), &conn),
        "result": Cat::all(&conn).first(),
    }))
}

#[get("/cats/<id>", format = "application/json")]
pub fn show(conn: DbConn, id: i32) -> Json<Value> {
    let result: Vec<Cat> = Cat::show(id, &conn);
    let status: i32 = if result.is_empty() { 404 } else { 200 };

    Json(json!({
        "status": status,
        "result": result.get(0),
    }))
}

#[put("/cats/<id>", format = "application/json", data = "<cat>")]
pub fn update(conn: DbConn, id: i32, cat: Json<NewCat>) -> Json<Value> {
    let status: i32 = if Cat::update_by_id(id, &conn, cat.into_inner()) {
        200
    } else {
        404
    };

    Json(json!({
        "status": status,
        "result": null,
    }))
}

#[delete("/cats/<id>")]
pub fn delete(id: i32, conn: DbConn) -> Json<Value> {
    let status: i32 = if Cat::delete_by_id(id, &conn) {
        200
    } else {
        404
    };
    Json(json!({
        "status": status,
        "result": null,
    }))
}

#[get("/cats/names/<name>", format = "application/json")]
pub fn name(name: String, conn: DbConn) -> Json<Value> {
    Json(json!({
        "status": 200,
        "result": Cat::all_by_name(name, &conn),
    }))
}
```

### src/static_files.rs
El archivo para manejar archivos estáticos en Rocket deberá verse así:

```rust
use rocket::fs::NamedFile;
use std::io;
use std::path::{Path, PathBuf};

#[get("/")]
pub async fn index() -> io::Result<NamedFile> {
    NamedFile::open("public/index.html").await
}

#[get("/<file..>", rank = 5)]
pub async fn all(file: PathBuf) -> Option<NamedFile> {
    NamedFile::open(Path::new("public/").join(file)).await.ok()
}
```

### src/schema.rs

El archivo autogenerado por Diesel deberá verse así:

```rust
table! {
    cats (id) {
        id -> Integer,
        name -> Text,
        photo_url -> Text,
        is_adopted -> Bool,
        description -> Text,
    }
}
```

## Probando nuestra REST API

Llegó el momento de la verdad, guardemos cambios y ejecutemos `$ cargo run` en nuestra terminal y observar la magia:

![imágen de rocket ejecutando una REST API](https://raw.githubusercontent.com/VentGrey/ventgrey.github.io/master/assets/img/rocket.png)

Si ponemos atención a la sección que dice: `🛰  Routes:` podemos darnos cuenta de que todas nuestras rutas existen y parece que funcionan. Sin embargo no sabremos esto hasta hacer unas pruebas con la herramienta más poderosa que existe para probar REST API: `curl`.

En una nueva terminal intentemos ejecutar la siguiente orden:

```sh
curl -v http://127.0.0.1:8000/api/cats/
```

La salida de la terminal debería ser:

```
*   Trying 127.0.0.1:8000...
* Connected to 127.0.0.1 (127.0.0.1) port 8000 (#0)
> GET /api/cats/ HTTP/1.1
> Host: 127.0.0.1:8000
> User-Agent: curl/7.74.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< content-type: application/json
< server: Rocket
< permissions-policy: interest-cohort=()
< x-frame-options: SAMEORIGIN
< x-content-type-options: nosniff
< content-length: 567
< date: Sun, 30 Jan 2022 05:29:32 GMT
< 
* Connection #0 to host 127.0.0.1 left intact
{"result":[{"description":"Erina es un gato de la raza 'ocicat' adoptada el 6 de Septiembre del 2021, es una gata tranquila y traviesa.","id":2,"is_adopted":true,"name":"Erina","photo_url":"https://raw.githubusercontent.com/VentGrey/ventgrey.github.io/master/assets/img/erina.jpg"},{"description":"Erina es un gato de la raza 'ocicat' adoptada el 6 de Septiembre del 2021, es una gata tranquila y traviesa.","id":1,"is_adopted":true,"name":"Erina","photo_url":"https://raw.githubusercontent.com/VentGrey/ventgrey.github.io/master/assets/img/erina.jpg"}],"status":200}
```

Si miramos la pantalla de Rocket podremos ver que la salida muestra nuevas líneas:

```
GET /api/cats/:
   >> Matched: (index) GET /api/cats application/json
   >> Outcome: Success
   >> Response succeeded.
```

¡Perfecto! Ahora probemos si podemos insertar un nuevo gato con la siguiente orden de curl:

```sh
curl -d '{ "id":3, "name":"Erino", "photo_url":"https://raw.githubusercontent.com/VentGrey/ventgrey.github.io/master/assets/img/erino.jpeg", "is_adopted":true, "description":"Erino es el hijo de Erina, es un gato de la misma raza, pequeño y travieso. Le gusta dormir estirado" }' -H 'Content-Type: application/json' http://127.0.0.1:8000/api/cats
```

La salida de la terminal debería ser la siguiente:

```
{"result":{"description":"Erino es el hijo de Erina, es un gato de la misma raza, pequeño y travieso. Le gusta dormir estirado","id":3,"is_adopted":true,"name":"Erino","photo_url":"https://raw.githubusercontent.com/VentGrey/ventgrey.github.io/master/assets/img/erino.jpeg"},"status":true}
```

Ahora comprobemos si nuestro gato nuevo fue registrado con éxito, con la primer orden que hicimos:

```sh
curl -v http://127.0.0.1:8000/api/cats/                                                                         ~*   Trying 127.0.0.1:8000...* Connected to 127.0.0.1 (127.0.0.1) port 8000 (#0)
> GET /api/cats/ HTTP/1.1
> Host: 127.0.0.1:8000
> User-Agent: curl/7.74.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< content-type: application/json
< server: Rocket
< permissions-policy: interest-cohort=()
< x-frame-options: SAMEORIGIN
< x-content-type-options: nosniff
< content-length: 832
< date: Sun, 30 Jan 2022 05:50:28 GMT
< 
* Connection #0 to host 127.0.0.1 left intact
{"result":[{"description":"Erino es el hijo de Erina, es un gato de la misma raza, pequeño y travieso. Le gusta dormir estirado","id":3,"is_adopted":true,"name":"Erino","photo_url":"https://raw.githubusercontent.com/VentGrey/ventgrey.github.io/master/assets/img/erino.jpeg"},{"description":"Erina es un gato de la raza 'ocicat' adoptada el 6 de Septiembre del 2021, es una gata tranquila y traviesa.","id":2,"is_adopted":true,"name":"Erina","photo_url":"https://raw.githubusercontent.com/VentGrey/ventgrey.github.io/master/assets/img/erina.jpg"},{"description":"Erina es un gato de la raza 'ocicat' adoptada el 6 de Septiembre del 2021, es una gata tranquila y traviesa.","id":1,"is_adopted":true,"name":"Erina","photo_url":"https://raw.githubusercontent.com/VentGrey/ventgrey.github.io/master/assets/img/erina.jpg"}],"status":200}
```

Espera...¿Hay dos "Erina" registadas? Eso es inadmisible, Erina solo hay una. Tendremos que borrar al impostor:

```sh
curl -X DELETE http://127.0.0.1:8000/api/cats/2
```

Comprobemos si la Erina impostora se eliminó correctamente:

```sh
curl -v http://127.0.0.1:8000/api/cats/                                                                         ~*   Trying 127.0.0.1:8000...* Connected to 127.0.0.1 (127.0.0.1) port 8000 (#0)
> GET /api/cats/ HTTP/1.1
> Host: 127.0.0.1:8000
> User-Agent: curl/7.74.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< content-type: application/json
< server: Rocket
< permissions-policy: interest-cohort=()
< x-frame-options: SAMEORIGIN
< x-content-type-options: nosniff
< content-length: 561
< date: Sun, 30 Jan 2022 05:54:35 GMT
< 
* Connection #0 to host 127.0.0.1 left intact
{"result":[{"description":"Erino es el hijo de Erina, es un gato de la misma raza, pequeño y travieso. Le gusta dormir estirado","id":3,"is_adopted":true,"name":"Erino","photo_url":"https://raw.githubusercontent.com/VentGrey/ventgrey.github.io/master/assets/img/erino.jpeg"},{"description":"Erina es un gato de la raza 'ocicat' adoptada el 6 de Septiembre del 2021, es una gata tranquila y traviesa.","id":1,"is_adopted":true,"name":"Erina","photo_url":"https://raw.githubusercontent.com/VentGrey/ventgrey.github.io/master/assets/img/erina.jpg"}],"status":200}
```

## Creando un frontend para nuestra API

¡Perfecto! Ahora que nuestra API funciona, vamos a integrar un frontend para consumir los datos. En nuestro caso usaremos el framework Svelte. Para ello, podemos descomprimir el código proporcionado por Svelte. (Lo puedes descargar [aquí](https://github.com/sveltejs/template)) Solo es necesario presionar el botón "Code" y luego presionar el botón "Download Zip". 

Podríamos usar la herramienta `degit` pero sinceramente, no le veo un uso práctico más alla ser un `git clone --depth=1` hecho en JS.

Colocamos el código descomprimido en el directorio donde tenemos el proyecto de Rust. Antes de ello, cambiaremos el nombre de la carpeta `src` de la plantilla de Svelte a algo como `frontend` para evitar conflictos con el directorio `src` de Rust.

Antes de continuar, debemos modificar el archivo `rollup.config.js` para indicarle que `frontend/` será nuestro nuevo directorio donde guardaremos el frontend de nuestra aplicación web. Si necesitas ayuda te dejo mi archivo `rollup.config.js` final para que lo tomes como guía:

```js
import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'frontend/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		svelte({
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: 'bundle.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
```

Perfecto. Ahora para terminar metemos todo el contenido de la plantilla de Svelte en nuestro proyecto de la REST API de Rust:

``` 
tree -L 1                                                                          rest-rust-template -> master ?
.
├── Cargo.lock
├── Cargo.toml
├── debug.db
├── diesel.toml
├── frontend
├── migrations
├── package.json
├── public
├── README.md
├── rollup.config.js
├── scripts
├── src
└── target

6 directories, 7 files
```

Si tu estructura de directorios es similar, entonces todo perfecto. Solo falta un último paso antes de comenzar con el frontend, hay que añadir las siguientes líneas al archivo `.gitignore`:

```
/node_modules/
/public/build/
.DS_Store
```

Perfecto, con eso evitaremos subir cosas que no necesitamos al repositorio de git.

## Comenzando con Svelte

**Nota: Recuerda encender el servidor de Rocket con `$cargo run` para acceder a los recursos de la API**

Dentro de nuestro directorio del proyecto ejecutaremos la orden `$ npm install && npm run dev` para comenzar con la instalación de dependencias y la vista en vivo de nuestro proyecto con NodeJS.

Cuando la terminal lo indique, se nos entregará una URL para revisar el progreso de nuestra aplicación de Svelte, en mi caso la URL es: `http://localhost:8080`. Si entramos a esta URL en nuestro navegador preferido obtendremos una pantalla así:

![pantalla de proyecto de SvelteJS](https://raw.githubusercontent.com/VentGrey/ventgrey.github.io/master/assets/img/svelte.png)

Tengo que decir que yo no soy un desarrollador frontend (ni deseo serlo realmente) por lo que la interfaz que voy a construir es por mucho, muy fea.

Dentro de nuestro proyecto de Svelte entraremos a editar el archivo `App.svelte`. Aquí ocurrirá toda la magia.

Dentro de `App.svelte` podemos ver que ya hay contenido, sugiero borrar todo lo que hay dentro y colocar esto en su lugar:

```html
<script charset="utf-8">
    
</script>

<style type="text/css" media="screen">
    
</style>

<main>

</main>
```

Con esto tendremos un marco de trabajo para comenzar con el proyecto. Antes de comenzar a programar nada debo decir que el enfoque de SvelteJS es hacer interfaces con un framework sencillo pero completo y sobre todo enfocado en hacer componentes. 

En este caso no estoy creando componentes por simplicidad, sin embargo en proyectos más serios desapruebo encarecidamente hacer todo dentro de `App.svelte`.

Con esta advertencia hecha, ahora si. Vamos a programar la parte de JavaScript que nos entregará a nuestros gatos registrados, dentro de las etiquetas `script` colocaremos el siguiente código:

```js
    // URL del API de los gatitos
    const api_url = 'http://127.0.0.1:8000/api/cats';
    // Obtener información del API
    const fetchCats = (async () => {
        const response = await fetch(api_url)
        return await response.json()
    })()
```

Este pequeño trozo de código lo que hará es definir la URL donde nuestro servidor de Rocket está ejecutándose. Lo segundo es una constante que es (con mi conocimiento límitado del desmadre de lenguaje que es JavaScript) el resultado del uso del [API fetch](https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch) de JavaScript. Honestamente no sabría explicar esas líneas de código a detalle, si eres un conocedor de JavaScript agradecería tu retroalimentación para saber como llamar a esa aberración que tiene las palabras: "Función anónima asíncrona" dentro de ella.

## CORS, un dolor de cabeza que no debería existir. (Literalmente)

Si hicimos todo bien, luego de guardar nuestra página debería auto-refrescarse. Todo parece ir bien por ahora, pero si abrimos la consola podremos ver un error de JavaScript que nos dice:

```
Access to fetch at 'http://127.0.0.1:8000/api/cats' from origin 'http://localhost:8080' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

![meme reese malcom el de en medio](http://images2.memedroid.com/images/UPLOADED83/533dbb4331fcc.jpeg)

El error viene de un bloqueo que nos hace CORS, ya que no existe un header especial que nos permita acceder a los recursos de la API como es debido. CORS es un acrónimo de *Cross Origin Resource Sharing* y es un mecanismo que permite que los sitios web pidan recursos a direcciones o dominios diferentes a donde están siendo servidos.

¿Por qué existe? Pues por "protección", lo pongo entre comillas por que en papel la idea es muy buena. La mayoría del tiempo nuestro sitio web y nuestra API están alojados en el mismo lugar. En nuestro caso este error está saltando porque rocket sirve nuestra API en `127.0.0.1:algo` y svelte se encuentra en `localhost:algo`. Aunque puedan parecer lo mismo no lo son. Al usar `127.0.0.1` el software que utilizamos directamente lo convierte a una dirección IP y la usa. De otra forma hay que "resolver" un nombre a una dirección, suponiendo que estamos en linux nuestro archivo `hosts` nos puede ayudar, pero si algo cambia ahí dentro, entonces `localhost` puede ser algo totalmente diferente a `127.0.0.1`. 

En mi opinión personal esto es un poco extraño. No me hace sentido que, para que mi código pueda acceder a recursos externos necesite de headers especiales en las peticiones. Mucho menos en un entorno web donde el 99.9% de las páginas que visitamos son de hecho muchos recursos extraños, HTML, CSS y sobre todo JavaScript que es un lenguaje de programación completo que podría hacer cualquier cosa, como rastrearnos con analítica, acceder a nuestros sensores y otras cosas. Eso si, no sea un JSON de una URL externa porque arde Troya.

En pocas palabras, CORS es un cáncer, afortunadamente es un cáncer que tiene cura. Y la cura la podemos implementar en nuestro archivo `main.rs`, dentro del mismo tenemos que pegar el siguiente pedazo de código (arriba de la función `rocket`):

```rust
struct CORS;

#[rocket::async_trait]
impl Fairing for CORS {
    fn info(&self) -> Info {
        Info {
            name: "Attaching CORS headers to responses",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, _request: &'r Request<'_>, response: &mut Response<'r>) {
        response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
        response.set_header(Header::new(
            "Access-Control-Allow-Methods",
            "POST, GET, PATCH, OPTIONS",
        ));
        response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
        response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
    }
}
```

Ahora en la función `rocket`, debajo de `.manage(pool)` añadiremos la función `.attach(CORS)`.

El archivo `main.rs` debería verse así ahora:

```rust

```