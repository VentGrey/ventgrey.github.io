---
layout: post
---
# Y es que...todos son iguales.

Seamos sinceros, todos hemos hecho al menos una REST API en nuestra vida, honestamente es algo de esperarse, siendo el estilo de arquitectura de software más popular de los últimos años. Si bien REST no es algo nuevo (Pues, su existencia puede rastrearse hasta el año 2000) sigue siendo un enfoque de desarrollo modular y en un todo muy conveniente. Sobre todo si hablamos de tecnologías basadas en la web.

No creo que sea necesario dar tanto contexto sobre qué es una REST API, mucho menos en estos años donde podemos encontrar (sin exagerar) miles de sitios donde se nos podría explicar perfectamente que son las REST API, como funcionan, sus casos de uso, ventajas, desventajas y todas esas cosas que nos encanta leer para excusar una flamewar en foros o grupos de chat.

Para esta entrada vamos a ver como crear y consumir una REST API. Con la parte de la creación utilizaremos [Rust](https://www.rust-lang.org/) con [Rocket](https://rocket.rs/) y para la parte del consumo una página web con un script básico debería funcionar. Asímismo voy a utilizar como ejemplo mi proyecto personal "[upventrs](https://github.com/UpVent/upventrs)" (Por: UpVent RustSvelte). Donde pondré ejemplos de como podemos consumir nuestra REST API desde un framework para JavaScript como [Svelte](https://svelte.dev/).

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

