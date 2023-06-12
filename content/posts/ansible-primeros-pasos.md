---
title: "Primeros pasos con Ansible. ¡Automatiza todo!"
date: 2023-06-06
tags: ["Automatización", "Configuración de servidores", "DevOps", "Linux", "Tutoriales"]
categories: ["Ansible", "DevOps", "Linux", "Tutoriales", "Automatización"]
author: "VentGrey"
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "Ansible te hará el rey de la automatización en tu cluster. ¿Por qué no te animas a aprenderlo con este tutorial? La esquina gris te tiene cubiert@."
canonicalURL: "https://ventgrey.github.io/posts/ansible-primeros-pasos/"
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
    image: "/img/posts/ansiblenew/cover.png" # image path/url
    alt: "Imágen del post" # alt text
    caption: "Imágen del post" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/<path_to_repo>/content"
    Text: "Sugerir Cambios" # edit text
    appendFilePath: true # to append file path to Edit link
---

# No tengo trono ni reina, ni nadie que me comprenda, pero sigo siendo el rey.

Dos meses después de haber abandonado este blog, un post a medio comer de como hacer un CRUD en Go y pocas horas de sueño. ¿Qué puede salir mal?

Debo admitir, que a veces me gana el remordimiento de dejar a mis lectores abandonados, pero la vida es así, y a veces hay que priorizar. Pero bueno, ya estoy aquí, y con un post que, creo, le hará más fácil la vida a más de uno, especialmente a los que trabajan como orquestradores de sistemas, *ajem*, digo, como "System Administrators" o como dice la raza en términos más modernos: "Site Reliability Engineers".

Como muchos *sysadmins* (Abreviatura de *System Administrators*), he tenido que lidiar con la configuración de servidores, y aunque no es algo que me disguste, debo de admitir que repetir las mismas tareas, hacer deploy o mantenimiento da una hueva que solo puedo describir como "inconmensurable". Para ayudarnos a combatir este mal, existen herramientas como Ansible, que nos permiten automatizar tareas de configuración, mantenimiento y deploy de servidores, y que nos permiten ahorrar tiempo y esfuerzo.

Se que hice un post de Ansible con anterioridad y ahí expliqué un poco de que iba la herramienta, pero en este post, vamos a ir un poco más allá, y vamos a ver como podemos usar Ansible para automatizar tareas de configuración de servidores, y como podemos usarlo para hacer deploy de aplicaciones. ¿List@ para ser parte de la realeza de la automatización? 

Primero lo primero ¿Qué carajos es Ansible?

## ¿Qué es Ansible?

Ansible es una herramienta de automatización de código abierto que nos permite realizar de forma auto-mágica diversas tareas de "TI" como gestionar configuraciones, desplegar nuestras aplicaciones, incluso podemos usarlo como nuestro propio sistema de CI/CD para automatizar el flujo de trabajo de los programadores y de los administradores de sistemas.

Lo bonito de Ansible es que no es una herramienta particularmente difícil de aprender y, no requiere de conocimientos avanzados de programación para poder usarlo (aunque si ayuda un poco), pero, si sabes declarar variables y pasarle argumentos a funciones, entonces ya estás prácticamente del otro lado.

Otra cosa es que Ansible es relativamente pequeño, por lo que, su instalación no requiere de mucho espacio en disco. Además, Ansible no requiere de un agente para poder funcionar, lo que significa que no tenemos que instalar nada en los servidores que queremos administrar, lo que hace que Ansible sea una herramienta muy ligera y con muchísimos menos pasos de configuración que otras herramientas similares como Puppet o Chef.

No todo es bonito, Ansible usa YAML y ese lenguaje de marcado es más feo que pegarle a alguien el día de su cumpleaños, así de feo más o menos. Pero bueno, no todo puede ser perfecto, YAML tendrá sus ventajas como lenguaje de marcado, pero no es mi favorito, aun así, su sintaxis es más que suficiente para las tareas que vamos a realizar.

## Instalando Ansible

Como todo, antes de usar, hay que instalar. Afortunadamente Ansible se encuentra disponible para la mayoría de sistemas operativos, aunque, se hizo principalmente para sistemas Gnu/Linux, por lo que este tutorial asume que todo lo harás desde ahí.

Si estás en un S.O de juguete como Windows, puedes usar la versión menos poderosa de Linux que tiene (WSL o WSL2) para usar Ansible desde ahí, en cualquier caso, solo cubriré la instalación en un sistema basado en Debian (Ubuntu, Linux Mint, etc), las variaciones para otras distribuciones son mínimas, así que no deberías de tener problemas. Para Windows y MacOS, las personas que viven en 🇺🇸 dicen: *"Godspeed"*, que significa *"Buena suerte"*. 

La forma más fácil de instalar Ansible en nuestro sistema es usando el gestor de paquetes, si, se que se puede instalar directo desde Python, pero, no es la forma más recomendada, así que, vamos a usar el gestor de paquetes. En mi caso, uso Debian, así que, para instalar Ansible, solo tengo que ejecutar el siguiente comando:

```bash
$ sudo apt install ansible
```

Si estás en otra distribución, deberás buscar si Ansible está disponible en los repositorios de tu distribución, de no ser así, puedes instalarlo desde Python, de nuevo, no es la forma más recomendada, pero, si no tienes otra opción, puedes hacerlo. Para instalar Ansible desde Python, solo tienes que ejecutar el siguiente comando:

```bash
$ pip install ansible
```

Si todo salió bien, ya deberías de tener Ansible instalado en tu sistema, para verificar que todo salió bien, puedes ejecutar el siguiente comando:

```bash
$ ansible --version
```

## Inventario

Una vez que tenemos Ansible instalado, el siguiente paso es crear nuestro inventario de servidores o hosts. En Ansible, un inventario es un archivo de configuración (usualmente con una sintaxis similar a un `.ini`, `.cfg` o `.conf`) que contiene una lista de los servidores que vamos a administrar, y que nos permite agruparlos en grupos, para poder ejecutar tareas en todos los servidores de un grupo en particular.

El inventario también puede ser un archivo de texto simple con una lista de direcciones IP o nombres de dominio. Veamos un ejemplo de un inventario simple:

```ini
[web] web1.example.com web2.example.com web3.example.com
[db] db1.example.com db2.example.com
```

En este ejemplo definimos dos grupos, uno llamado `web` y otro llamado `db`, y dentro de cada grupo, tenemos una lista de servidores. En este caso, tenemos tres servidores en el grupo `web` y dos servidores en el grupo `db`.

En el ejemplo los servidores usan nombres de dominio, pero, también podemos usar direcciones IP, por ejemplo:

```ini
[web]
192.168.1.1
192.168.1.2
192.168.1.3

[db]
192.168.2.1
192.168.2.2
```

Puedes crear tantos grupos como quieras, en este caso los grupos y los servidores los puse en un formato de una sola línea, pero, puedes ponerlos en varias líneas si así lo deseas, por ejemplo:

```ini
[web]
web1.example.com
web2.example.com
web3.example.com

[db]
db1.example.com
db2.example.com
```

Si lo hace mas fácil para ti, puedes utilizar comentarios para guiarte mejor en tu inventario, por ejemplo:

```ini
[web] # Servidores web
web1.example.com
web2.example.com
web3.example.com

[db] # Servidores de base de datos
db1.example.com
db2.example.com
```

Si tenemos múltiples hosts con un patron específico, podemos ahorrarnos líneas de la siguiente forma:

```ini
www[01:50].example.com
```

Esto definirá los hosts como `www01`, `www02`, `www03` hasta `www50`. Esto no solo se limita a rangos numéricos, también podemos usar rangos alfabéticos:

```ini
www[a:z].ezample.com
```

Esto definirá los hosts como `wwwa`, `wwwb`, `wwwc` hasta `wwwz`.

Esto es útil para servidores o grupos de servidores donde ya se tiene una nomenclatura definida, por ejemplo, si tienes un servidor de base de datos que se llama `db01`, `db02`, `db03`, etc, puedes definirlo de la siguiente forma:

```ini
[db]
db[01:03].example.com
```

O por ejemplo con una nomeclatura un poco más compleja, mezclandonúmeros y letras:

```ini
[db]
db[01:03][a:c].example.com
```

Esto definirá los hosts como `db01a`, `db01b`, `db01c`, `db02a`, `db02b`, `db02c`, `db03a`, `db03b` y `db03c`. Que, al final sería el equivalente a definir a mano:

- `db01a.example.com`
- `db01b.example.com`
- `db01c.example.com`
- `db02a.example.com`
- `db02b.example.com`
- `db02c.example.com`
- `db03a.example.com`
- `db03b.example.com`
- `db03c.example.com`

Con una sola línea, definimos 9 hosts, en lugar de definirlos a mano. Esto es el poder de Ansible.

También podemos definir hosts por incrementos (Por ejemplo, de 2 en 2)
```ini
www[01:50:2].netlogistik.com
```
Esto será similar al primer ejemplo, solo que saltará 2 unidades por cada host, es decir: 
`www01`, `www03`, `www05`, …, `www49`

También puedes definir variables para cada servidor, por ejemplo:

```ini
[web] # Servidores web
web1.example.com ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
web2.example.com ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
web3.example.com ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa

[db] # Servidores de base de datos
db1.example.com ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
db2.example.com ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
```

En este caso, definimos la variable `ansible_user` para cada servidor, esta variable nos permite definir el usuario con el que nos vamos a conectar al servidor, en este caso, usamos el usuario `ubuntu`, pero, puedes usar el usuario que quieras, siempre y cuando tengas los permisos necesarios para conectarte al servidor. Por último tenemos la variable `ansible_ssh_private_key_file`, esta variable nos permite definir la ruta de la llave privada que vamos a usar para conectarnos al servidor, en este caso, usamos la llave privada por defecto. ¿Qué es? Bueno, te dejo de tarea leer acerca de OpenSSH y las llaves públicas y privadas, puedes empezar [aquí](https://www.ssh.com/academy/ssh-keys).

Otro aspecto importante de los inventarios es que existen jerarquías de grupos. Las jerarquías de grupos, nos permiten hacer un inception chistoso y tener grupos dentro de grupos, por ejemplo:

```ini
[web] # Servidores web
web1.example.com
web2.example.com
web3.example.com

[db] # Servidores de base de datos
db1.example.com
db2.example.com

[production:children] # Grupo de producción
web
db
```

En este caso, tenemos dos grupos, `web` y `db`, y un grupo llamado `production` que contiene a los grupos `web` y `db`, esto nos permite ejecutar tareas en todos los servidores de producción, sin tener que especificar cada grupo, por ejemplo:

```bash
$ ansible production -m ping
```

Si quieres una representación visual de los grupos, puedes usar el comando `ansible-inventory`:

```bash
$ ansible-inventory --graph

@all:
  |--@db:
  |  |--db1.example.com
  |  |--db2.example.com
  |--@production:
  |  |--@db:
  |  |  |--db1.example.com
  |  |  |--db2.example.com
  |  |--@web:
  |  |  |--web1.example.com
  |  |  |--web2.example.com
  |  |  |--web3.example.com
  |--@ungrouped:
```

En este caso, tenemos un grupo llamado `all` que contiene a todos los servidores, un grupo llamado `db` que contiene a los servidores de base de datos, un grupo llamado `production` que contiene a los grupos `db` y `web`, y un grupo llamado `ungrouped` que contiene a todos los servidores que no están en ningún grupo.

El comando `ansible-inventory` también nos permite ver los grupos y los servidores en formato JSON, por ejemplo:

```bash
$ ansible-inventory --list

{
    "_meta": {
        "hostvars": {
            "db1.example.com": {
                "ansible_host": "db1.example.com",
                "ansible_user": "ubuntu",
                "ansible_ssh_private_key_file": "~/.ssh/id_rsa"
            },
            "db2.example.com": {
                "ansible_host": "db2.example.com",
                "ansible_user": "ubuntu",
                "ansible_ssh_private_key_file": "~/.ssh/id_rsa"
            },
            "web1.example.com": {
                "ansible_host": "web1.example.com",
                "ansible_user": "ubuntu",
                "ansible_ssh_private_key_file": "~/.ssh/id_rsa"
            },
            "web2.example.com": {
                "ansible_host": "web2.example.com",
                "ansible_user": "ubuntu",
                "ansible_ssh_private_key_file": "~/.ssh/id_rsa"
            },
            "web3.example.com": {
                "ansible_host": "web3.example.com",
                "ansible_user": "ubuntu",
                "ansible_ssh_private_key_file": "~/.ssh/id_rsa"
            }
        }
    },
    "all": {
        "children": [
            "ungrouped",
            "production",
            "db",
            "web"
        ]
    },
    "db": {
        "hosts": [
            "db1.example.com",
            "db2.example.com"
        ]
    },
    "production": {
        "children": [
            "db",
            "web"
        ]
    },
    "ungrouped": {
        "hosts": [
            "db1.example.com",
            "db2.example.com",
            "web1.example.com",
            "web2.example.com",
            "web3.example.com"
        ]
    },
    "web": {
        "hosts": [
            "web1.example.com",
            "web2.example.com",
            "web3.example.com"
        ]
    }
}
```

Dejo a tu imaginación el uso que le puedes dar a esta información, no se, tu propia alternativa a Ansible Tower, o una Web UI sencilla para administrar tus servidores, o tus playbooks, etc.

No puedo explicar en su totalidad la forma de manejar inventarios en Ansible, ya que es un tema muy extenso, pero, puedes leer más acerca de inventarios en la [documentación oficial](https://docs.ansible.com/ansible/latest/user_guide/intro_inventory.html).

## Playbooks

Una vez que tenemos nuestro inventario listo para la acción, es hora de entrar en el mero mole y cenicienta de Ansible: Los poderosísimos playbooks. Los playbooks tienen una función similar a la de un "guión" en una obra de teatro, en ellos definimos una serie de tareas que Ansible va a ejecutar en los servidores que definamos en nuestro inventario.

Los playbooks son el mero mole de Ansible y la razón de que Ansible sea tan poderoso, esto gracias a su forma de escribirlos, que es "declarativa", lo que quiere decir que, en lugar de decirle a Ansible como hacer las cosas, le decimos el resultado que queremos obtener, y Ansible se encarga de hacer todo lo necesario para obtener ese resultado, a nosotros solo nos queda sentarnos a hacernos pendejos y ver como Ansible hace todo el trabajo por nosotros.

Los playbooks de Ansible se escriben en YAML, el lenguaje horrible del que te conté antes, veamos un playbook simple para instalar el poderoso Apache2 en el grupo de servidores `web`:

```yaml
---
- hosts: web
  become: yes
  tasks:
    - name: Instalar Apache2
      apt:
        name: apache2
        state: present
```

En este playbook, tenemos varias partes que pueden llamarnos la atención, vamos a verlos línea por línea:

```yaml
---
```

Los tres guiones al inicio del archivo son opcionales, en YAML se tiene por "costumbre" que el inicio del archivo se marque con `---` y termine con `...`, pero, no es obligatorio, así que, si quieres, puedes omitirlos.

```yaml
- hosts: web
```

¿Recuerdas que en el inventario definimos un grupo llamado `web`? Bueno, aquí le decimos a Ansible que queremos ejecutar este playbook en el grupo `web`, es decir, en todos los servidores que definimos en el grupo `web` en nuestro inventario.

```yaml
  become: yes
```

Con la opción `become` le decimos a Ansible que queremos ejecutar este playbook con privilegios de superusuario, es decir, que queremos ejecutar las tareas de este playbook con el usuario `root` en los servidores que definimos en el grupo `web` en nuestro inventario.

```yaml
  tasks:
```

Aquí definimos las tareas que queremos que Ansible ejecute en los servidores que definimos en el grupo `web` en nuestro inventario.

```yaml
    - name: Instalar Apache2
```

Es importante asignarle un nombre a cada tarea, esto nos permite identificarlas fácilmente en caso de que algo salga mal, o, si queremos ejecutar una tarea en específico, por ejemplo, si queremos ejecutar solo la tarea `Instalar Apache2` de este playbook, podemos hacerlo con el siguiente comando:

```bash
ansible-playbook -i inventario playbook.yml --tags "Instalar Apache2"
```

Continuemos viendo el playbook:

```yaml
      apt:
        name: apache2
        state: present
```

Aquí pasa algo interesante, estamos llamando a un módulo de Ansible llamado `apt`, este módulo nos permite ejecutar comandos de `apt` en los servidores que definimos en el grupo `web` en nuestro inventario, en este caso, Ansible recibe la instrucción de que queremos que instale el paquete `apache2` en los servidores que definimos en el grupo `web` en nuestro inventario.

En pocas palabras, este playbook le dice a Ansible: "Ey, quiero que instales Apache en todos los hosts del grupo web". Y Ansible, como el buen chacho que es, obedecerá tus órdenes. Eso si, como todo en la computación, las instrucciones son como hacer un pacto con el chamuco, hay que pensar bien la estructura de las instrucciones, si no, tendremos lo que queremos, pero, no como lo queremos. Es decir, errores en tiempo de ejecución en nuestro playbook.

### Tutorial rapidísimo de YAML

> Pero, yo nse YAML, ¿Cómo voy a escribir playbooks?

Bueno mi estimado 🐓 traguer, no te preocupes, YAML es un lenguaje feo, pero lo que tiene de feo, lo tiene de sencillo, así que, no te preocupes, te voy a dar un tutorial rapidísimo de YAML para que puedas escribir tus playbooks sin problemas.

(Casi) todo en Ansible, comienza con una lista, en las listas de YAML, similar a los diccionarios en un lenguaje de programación, las cosas se separan en llaves y valores.

Veamos un ejemplo:

```yaml
Padres:
    Paco:
        Edad: 50
        Ocupación: Ingeniero
    María:
        Edad: 45
        Ocupación: Doctora
Hijos:
    Juan:
        Edad: 20
        Ocupación: Estudiante
    María:
        Edad: 18
        Ocupación: Estudiante
```

En este ejemplo, tenemos una lista de padres y una lista de hijos, cada padre y cada hijo tiene una edad y una ocupación, en YAML, las listas se definen con un guión `-` y los valores se definen con `:`.

Además de esto, YAML nos permite "abreviar" los diccionarios en una sola línea, veamos el mismo ejemplo, pero, en una sola línea:

```yaml
Padres: {Paco: {Edad: 50, Ocupación: Ingeniero}, María: {Edad: 45, Ocupación: Doctora}}
Hijos: {Juan: {Edad: 20, Ocupación: Estudiante}, María: {Edad: 18, Ocupación: Estudiante}}
```

¿Te recuerda a algo? Si, a JSON, YAML es como una versión más fea de JSON.

#### Lógica booleana en YAML

En Ansible, pocas veces usaremos lógica booleana, pero, es importante que sepas que YAML tiene soporte para lógica booleana, veamos un ejemplo:

```yaml
Padres:
    Paco:
        Edad: 50
        Ocupación: Ingeniero
        LeGustaElFutbol: true
    María:
        Edad: 45
        Ocupación: Doctora
        LeGustaElFutbol: yes
Hijos:
    Juan:
        Edad: 20
        Ocupación: Estudiante
        LeGustaElFutbol: false
    María:
        Edad: 18
        Ocupación: Estudiante
        LeGustaElFutbol: no
```

Como puedes ver, YAML tiene soporte para `true`, `yes`, `false` y `no`, todos con sus variaciones de mayúsculas y minúsculas. Lo "estándar" es que usemos `true` y `false`, en minúsculas por propósitos de legibilidad.


#### Párrafos en YAML

Si, nos topamos con que necesitamos escribir más de una línea en un valor, YAML nos permite hacerlo con `|`, veamos un ejemplo:

```yaml
Padres:
    Paco:
        Edad: 50
        Ocupación: Ingeniero
        LeGustaElFutbol: true
        Descripción: |
            Paco es un hombre de 50 años, le gusta el futbol y es ingeniero.
    María:
        Edad: 45
        Ocupación: Doctora
        LeGustaElFutbol: yes
        Descripción: |
            María es una mujer de 45 años, le gusta el futbol y es doctora.
Hijos:
    Juan:
        Edad: 20
        Ocupación: Estudiante
        LeGustaElFutbol: false
        Descripción: |
            Juan es un hombre de 20 años, no le gusta el futbol y es estudiante.
    María:
        Edad: 18
        Ocupación: Estudiante
        LeGustaElFutbol: no
        Descripción: |
            María es una mujer de 18 años, no le gusta el futbol y es estudiante.
```

Es importante notar que en YAML, podemos usar tanto `|` como `>`, la diferencia es que `|` respeta los saltos de línea y `>` no.

En el caso de `>` YAML respeta los saltos de línea, pero, los reemplaza por espacios, veamos un ejemplo:

```yaml
Padres:
    Paco:
        Edad: 50
        Ocupación: Ingeniero
        LeGustaElFutbol: true
        Descripción: >
            Paco es un hombre de 50 años, le gusta el futbol y es ingeniero.
    María:
        Edad: 45
        Ocupación: Doctora
        LeGustaElFutbol: yes
        Descripción: >
            María es una mujer de 45 años, le gusta el futbol y es doctora.
Hijos:
    Juan:
        Edad: 20
        Ocupación: Estudiante
        LeGustaElFutbol: false
        Descripción: >
            Juan es un hombre de 20 años, no le gusta el futbol y es estudiante.
    María:
        Edad: 18
        Ocupación: Estudiante
        LeGustaElFutbol: no
        Descripción: >
            María es una mujer de 18 años, no le gusta el futbol y es estudiante.
```

Lo que nos daría una salida como esta:

```yaml
Padres:
    Paco:
        Edad: 50
        Ocupación: Ingeniero
        LeGustaElFutbol: true
        Descripción: Paco es un hombre de 50 años, le gusta el futbol y es ingeniero.
    María:
        Edad: 45
        Ocupación: Doctora
        LeGustaElFutbol: yes
        Descripción: María es una mujer de 45 años, le gusta el futbol y es doctora.
Hijos:
    Juan:
        Edad: 20
        Ocupación: Estudiante
        LeGustaElFutbol: false
        Descripción: Juan es un hombre de 20 años, no le gusta el futbol y es estudiante.
    María:
        Edad: 18
        Ocupación: Estudiante
        LeGustaElFutbol: no
        Descripción: María es una mujer de 18 años, no le gusta el futbol y es estudiante.
```

#### Evita bugs en tu YAML, de por si ya es feo, no lo hagas más feo.

YAML, a pesar de ser ampliamente utilizado en un montón de tecnologías actuales como Docker, Kubernetes, OpenShift, etc. Sigue con un problema y es que, a veces, los devs son mensos y no respetan las reglas del lenguaje, lo que hace que el YAML no se pueda parsear correctamente o que sea difícil de leer y mira que, hacer que YAML sea difícil de leer es un logro. Aunque, dudo que quieras celebrarlo.

Aquí tienes un par de cosas culeras en el diseño de YAML y como evitar morir en el intento:

1. Todos los dos puntos (`:`) seguidos de un espacio o un salto de línea, serán considerados como un par llave-valor, por lo que, si tienes un valor que tiene dos puntos, debes de ponerlo entre comillas, veamos un ejemplo:

```yaml
DiscoPrincipalDeWindows: C:
```

En este caso, YAML interpretará que `DiscoPrincipalDeWindows` es una llave y `C:` es un valor, lo que no es lo que queremos, por lo que, debemos de ponerlo entre comillas:

```yaml
DiscoPrincipalDeWindows: "C:"
```

2. Siempre, siempre, encierra entre comillas dobles (`"`) los valores de tipo string, esto es para evitar que YAML los interprete como un booleano o un número, veamos un ejemplo:

```yaml
Padres:
    Paco:
        Edad: 50
        Ocupación: "Ingeniero"
        LeGustaElFutbol: true
        Descripción: "Paco es un hombre de 50 años, le gusta el futbol y es ingeniero."
    María:
        Edad: 45
        Ocupación: "Doctora"
        LeGustaElFutbol: yes
        Descripción: "María es una mujer de 45 años, le gusta el futbol y es doctora."
Hijos:
    Juan:
        Edad: 20
        Ocupación: "Estudiante"
        LeGustaElFutbol: false
        Descripción: "Juan es un hombre de 20 años, no le gusta el futbol y es estudiante."
    María:
        Edad: 18
        Ocupación: "Estudiante"
        LeGustaElFutbol: no
        Descripción: "María es una mujer de 18 años, no le gusta el futbol y es estudiante."
```

Para las comillas simples, te recomiendo que las uses para los valores de tipo string que contengan comillas dobles o para caracteres especiales como `:`, `#`, `&`, `*`, etc.

3. En YAML existen carácateres especiales que están reservados, es decir, no puedes usarlos como parte de una llave o un valor, estos son: `[] {} < | > * & ! % # @` y los caracteres de control como `\n`, `\t`, etc.


4. Los comentarios son gratis, úsalos. YAML soporta comentarios de una sola línea con `#` y comentarios de múltiples líneas con `|` o `>`, veamos un ejemplo:

```yaml
# Esto es un comentario de una sola línea

# Aquí puedes explicar que hace este bloque de código o
# que hace cada llave o valor.
```

En internet puedes encontrar validadores de YAML, yo en lo personal te recomiedo que instales una extensión medianamente decente en tu editor de texto favorito, yo uso Emacs, por lo que uso [yaml-mode](http://github.com/yoshiki/yaml-mode).

Si usas Visual Studio Code o un editor basado en el mismo, puedes instalar [YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) de Red Hat.


## Ejecutando Playbooks

Ya tenemos las bases de YAML, ahora necesitamos saber como ejecutar los playbooks.

> Pero, no nos has enseñado las bases de Ansible.

No te preocupes, más adelante haré un ejemplo desde cero explicando todos los pasos. Por ahora, solamente
deberás de saber que ejecutar un playbook es tan sencillo como ejecutar el siguiente comando:

```bash
ansible-playbook playbook.yml
```

Donde `playbook.yml` es el nombre del archivo que contiene el playbook que quieres ejecutar.

Y ya...¿esperabas algo más?.

## Comandos Ad-Hoc

Pensarás: *"¿Siempre que quiera ejecutar un módulo de Ansible, debo de crear un playbook? Que hueva :("*

![pucci](/img/posts/ansiblenew/pucci.jpeg)

Esto es Ansible, ya pensaron en eso. Te presento el otro superpoder de Ansible, los comandos Ad-Hoc.

En Ansible, los comandos ad-hoc te permiten ejecutar una única tarea en uno o más hosts sin la necesidad de crear un playbook primero. Son una forma rápida de ejecutar tareas que no requieren la estructura de un playbook, usualmente, tareas de mantenimiento o de diagnóstico.

Por ejemplo, para verificar el espacio en disc de un host, puedes ejecutar el siguiente comando:

```bash
ansible disk-server.example.com -m shell -a "df -h"
```

En este ejemplo, estamos ejecutando el comando `df -h` en el host `disk-server.example.com` usando el módulo `shell`. Los comandos ad-hoc te permiten obtener rápidamente la información que necesitas de un host, trata de investigar los módulos que existen y que puedes usar en los comandos ad-hoc, te harán la vida más fácil.

## Estructura de directorios de Ansible

Cuando instalamos Ansible, es recomendable crear una estructura de directorios para almacenar nuestros playbooks, inventarios, roles, etc. Esto es para mantener todo organizado y evitar que se nos pierda algo. En algunos sistemas operativos como en Red Hat y derivados, el paquete de Ansible ya crea esta estructura por nosotros, pero en otros sistemas operativos como en Debian y derivados, no.

Si nos basamos en los [tips generales de Ansible](https://docs.ansible.com/ansible/latest/tips_tricks/ansible_tips_tricks.html#directory-layout) y en la [documentación de Ansible](https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html#directory-layout), la estructura de directorios de Ansible debería de ser la siguiente:

```bash
.
├── ansible.cfg
├── group_vars
│   └── all.yml
├── host_vars
│   └── host1.yml
├── hosts
├── library
├── filter_plugins
├── roles
│   └── common
│       ├── files
│       ├── handlers
│       ├── meta
│       ├── tasks
│       ├── templates
│       └── vars
└── site.yml
```

Lo se, lo se: *"A la verga, dijo el Denji. ¿No que Ansible era simple?"* Y sip, no es la estructura más sencilla del mundo, pero es la que recomienda Ansible. PERO, nosotros no somos Ansible, podemos empezar con una estructura tan sencilla como la siguiente:

```bash
.
├── ansible.cfg (Archivo de configuración de Ansible)
├── hosts (Archivo de inventario de Ansible)
├── playbooks (Directorio para almacenar nuestros playbooks)
└── roles (Directorio para almacenar nuestros roles)
```

Si en tu sistema no se creó el directorio `/etc/ansible` podemos aprovechar para crear la estructura básica que te mostré antes con el siguiente comando con privilegios de superusuario:

```bash
$ mkdir -p /etc/ansible/playbooks /etc/ansible/roles && touch /etc/ansible/hosts
```

Si tienes Ansible 2.12 o superior, puedes generar un archivo de configuración básico con el siguiente comando (No olvides los permisos de superusuario):

```bash
$ ansible-config init --disabled > /etc/ansible/ansible.cfg
```

Si deseas un archivo más completo pero para "expertos", puedes ejecutar el siguiente comando (No olvides los permisos de superusuario):

```bash
$ ansible-config init -t all > /etc/ansible/ansible.cfg
```

Finalmente, si tu versión de Ansible es anterior a la 2.12, puedes descargar el archivo de configuración de [aquí](https://github.com/ansible/ansible/blob/stable-2.9/examples/ansible.cfg) y guardarlo en `/etc/ansible/ansible.cfg`.

Vamos a explicar que es cada archivo y directorio:

### ansible.cfg

El archivo `ansible.cfg` es la configuración de Ansible, por defecto, se toma la configuración en `/etc/ansible/ansible.cfg`. Sin embargo, Ansible no está limitado a un solo archivo de configuración, si deseas probar otra configuración, puedes usar uno de los siguientes métodos:

1. Cambiar el valor de la variable de ento`ANSIBLE_CONFIG` para que apunte a otro archivo de configuración.
2. Crear un archivo `ansible.cfg` en el directorio actual.
3. Crar un archivo `.ansible.cfg` en el directorio `$HOME`.

Las opciones que definamos en estos archivos tampoco son absolutas, (casi) todas las opciones de Ansible pueden sobreescribirse a nivel playbook. Por ejemplo, si en el archivo de configuración definimos que el usuario remoto por defecto es `root`, pero en el playbook definimos que el usuario remoto es `ansible`, Ansible usará el usuario `ansible` en lugar de `root`. Las posibilidades son infinitas.

> Nota: Para evitar riesgos de seguridad, si te decidiste por la opción 2, Ansible no te permitirá cargar el archivo de configuración si el directorio actual tiene permisos de escritura para otros usuarios, es decir, si es "world-writable".

Puedes encontrar una lista completa de opciones de configuración de Ansible [aquí](https://docs.ansible.com/ansible/latest/reference_appendices/config.html)

## Herramientas CLI de Ansible

Cuando instalamos Ansible, obtendremos una serie de herramientas de línea de comandos con diferentes propósitos, dichas herramientas nos ayudarán a mejorar nuestra interacción y entendimiento de los playbooks.

Ansible cuenta con varias herramientas de línea de comandos que nos ayudan a realizar tareas específicas. Estas herramientas son:

- `ansible-playbook`: Es la herramienta que acabamos de usar en los ejemplos anteriores. Su única función es ejecutar playbooks.
- `ansible-vault`: Es la herramienta que nos ayuda a cifrar y descifrar archivos con información sensible. Por ejemplo, si tenemos un archivo con contraseñas, podemos cifrarlo con `ansible-vault` para que nadie pueda verlo, y cuando necesitemos usarlo, podemos descifrarlo con `ansible-vault` para que Ansible pueda leerlo.
- `ansible-galaxy`: Es la herramienta que nos ayuda a descargar roles de Ansible Galaxy. Ansible Galaxy es un repositorio de roles de Ansible que podemos usar para automatizar tareas comunes. Por ejemplo, si necesitamos instalar un servidor web, podemos buscar un rol de Ansible Galaxy que nos ayude a instalarlo y configurarlo. Piensa en Ansible Galaxy como el equivalente a los repositorios de paquetes de tu distribución Linux favorita. (O como el App Store de Apple, pero de funcionalidades de Ansible)
- `ansible-console`: s la herramienta que nos ayuda a ejecutar comandos de Ansible de forma interactiva. Es decir, podemos ejecutar comandos de Ansible sin necesidad de escribir un playbook. Es muy útil para probar comandos de Ansible antes de escribirlos en un playbook. (O para ejecutar comandos de Ansible sin necesidad de escribir un playbook, piensa en "Bash" pero para Ansible)
- `ansible-config`: Otro comando que ya usamos con anterioridad. Nos ayuda a generar archivos de configuración de Ansible.
- `ansible-pull`: Es la herramienta que nos ayuda a ejecutar playbooks de forma local. Es decir, en lugar de ejecutar un playbook en un servidor remoto, podemos ejecutarlo en nuestra máquina local. Es muy útil para ejecutar playbooks de forma local en máquinas que no tienen Ansible instalado.

## Creando tu primer playbook desde cero

Ahora que conocemos los principios y hemos tocado el 0.000001% del poder de Ansible, vamos a crear nuestro primer playbook desde cero, a partir de un problema real.

Es bien sabido que *ODIO* cuando los blogs ponen los mismos ejemplos, y lo podrás comprobar, busca tutoriales de playbooks de Ansible y te puedo apostar a que fácilmente los primeros 5 tendrán ejemplos más estúpidos que vender el auto para comprar gasolina. Es más, puedo apostarme a que de esos 5, 3 tendrán el mismo ejemplo de instalar un servidor web en un servidor remoto o en un contenedor de Docker.

Aquí vamos a darnos en la madre porque es lo que nos gusta, sufrir y luego quejarnos por sabotearnos a nosotros mismos. Así que, vamos a hacer nuestro primer playbook.

### Creando tus propias pipelines para React con Ansible y Docker

Si eres desarrollador web, probablemente estés familiarizado con React, y si no lo estás, no te preocupes, no es necesario que sepas nada de React para entender este ejemplo. Solo, se que un par de mis lectores son desarrolladores frontend y que utilizan React, así que, este ejemplo es para ellos.

React es una librería de JavaScript para crear interfaces de usuario. React es muy popular, y es utilizado por empresas como Facebook, Instagram, Netflix, Uber, Airbnb, etc. React es muy popular porque es muy fácil de aprender, y porque es muy fácil de integrar con otras herramientas. Existe una alternativa que me gusta más llamada "Preact", es como React bien hecho, es minimalista, 100% compatible con React y es más rápido que React, lamentablemente no es ni de cerca, tan popular como React.

Vamos a ver como crear nuestras propias pipelines.

> Jóven, ¿Qué carajos es un "pipeline"?

Bueno, mi querido 🐓 deguster, un pipeline en el contexto de "DevOps" (Y el actual), es una serie de pasos que se ejecutan de forma automática para lograr un objetivo. Por ejemplo, puedes crear "pipelines" para compilar tu código para diferentes arquitecturas, para ejecutar pruebas unitarias, para ejecutar pruebas de integración, para crear paquetes de instalación, para desplegar tu aplicación, etc.

En este caso solo serán pipelines sencillos para compiar...err...transpilar nuestro código de React, ejecutar pruebas unitarias, crear una imágen de Docker con el código comprobado y finalmente ejecutarla imágen de Docker simulando un servidor de producción.

> Pero todo eso se puede hacer con bash.

Si, pero, aquí viene lo bonito de las pipelines de Docker + Ansible. Un concepto llamado "reproducibilidad". Déjame instruirte en las artes oscuras.

La reproducibilidad en nuestro contexto (computación) se refiere a la capacidad de repetir un proceso de forma idéntica. En otras palabras la capacidad de obtener los mismos resultados de forma consistente. Puede sonar pesado al inicio pero la reproducibilidad es muy importante para que podamos, hasta cierto punto "garantizar" que nuestro código se ejecutará de la misma forma en cualquier entorno y que no entregue resultados inconsistentes.

Imagina que eres un muy buen cocinero y tienes una receta para hornear una pizza bien mamalona, la receta lleva 1 taza de harina, 2 tomates, 100g de queso y 300g de salami (Si, no tengo ni idea de como se hace una pizza). Suponiendo que, sigues esa receta *EXACTAMENTE* al pie de la letra, que tu leche es de la misma marca siempre, que siempre pones la misma cantidad, al grando en el que tu margen de error no pasa de los microlitros (la millonésima parte de un litro), que tus tomates son clones idénticos y que tu salami es de la misma marca, con la misma cantidad de grasa, etc. Entonces, si sigues la receta al pie de la letra, deberías obtener una pizza idéntica cada vez que la hagas.

> Pero eso es imposible, siempre habrá un margen de error.

Exacto, por eso es importante tener un entorno controlado donde no tengas mucha variabilidad en los resultados. Por ejemplo, si tu receta de pizza es para un horno de gas, no puedes esperar que el resultado sea el mismo si la haces en un horno de leña.

Ahora imagina que le das la receta a tu amigo tarugo, ese que nomás no la armaba en los proyectos, y en lugar de usar 1 taza de harina, usa 1 taza de harina para hot cakes. ¿Qué crees que va a pasar? Pues tu amigo se va a terminar comiendo una pizza con un sabor a cola.

> ¿Y qué tiene que ver esto con el desarrollo de software? 

Pues bien, en nuestro caso, cosas como tener diferentes versiones de software, configuraciones distintas o incluso cosas más profundas como la libc del sistema operativo o el manejo de memoria, pueden afectar el resultado de un programa. Son como esa taza de harina para hot cakes en la pizza, que arruinan todo.

Aquí es donde entran en juego herramientas como Docker y Ansible. Docker permite crear contenedores aislados que incluyen todas las dependencias y configuraciones necesarias para ejecutar una aplicación de forma consistente en diferentes entornos. Ansible, por otro lado, permite automatizar y orquestar la configuración de las máquinas en las que se ejecutará el software.

Por supuesto, muchas de estas cosas se pueden evitar al utilizar pipelines de Docker + Ansible. Docker es como un chef super experto que te ayudará a crear un ambiente aislado y controlado para tu pizza. Con utensilios de alta presición, moldes, etc. Puedes empaquetar todos los ingredientes necesarios para tu aplicación en un contenedor Docker, incluyendo las versiones específicas de bibliotecas y dependencias que necesitas. Es como tener tu propia cocina móvil que llevas contigo a todas partes.

Luego viene Ansible, que es como tu asistente personal que se encarga de configurar las máquinas donde se va a ejecutar tu aplicación, ya sea en entornos de desarrollo, pruebas o producción. Ansible asegura que todas las máquinas tengan la misma configuración y versiones de software, al igual que sigues la misma receta de la pizza para obtener resultados consistentes.

Así, con las pipelines de Docker + Ansible, estás asegurando la reproducibilidad en el desarrollo de software. Cada vez que se realiza una nueva implementación o actualización, puedes garantizar que tu aplicación se comportará de la misma manera en todos los entornos, evitando problemas causados por diferencias en la configuración o versiones de software.

Ya volví a divagar mucho. Vamos a meternos de lleno a la creación de pipelines.

### Antes de empezar.

Ya he contado como usar Docker y Ansible en entradas anteriores, así que no voy a entrar en detalles. Si no sabes como usar Docker o Ansible, te recomiendo que leas las entradas anteriores.

Asumiré que ya tienes Ansible y Docker (o podman) instalados en tu sistema.

### 1. Crear la aplicación de React

Para este ejemplo no voy a crear una aplicación de React completa, usaré solo el código de una aplicación de ejemplo. Si, se que me quejo de que los bloggeros luego suben tutoriales con el mínimo esfuerzo posible, pero en este caso, no es necesario crear una aplicación completa para demostrar el funcionamiento de las pipelines.

Para crear la aplicación de ejemplo en React usa lo que quieras, hay quien prefiere usar `create-react-app`, en mi caso usaré Vite porque es más rápido y seamos sinceros, está mejor hecho.

```bash
$ npm create vite@latest react-app -- --template react
```

Vamos a probar si la instalación fue exitosa.

```bash
# Entramos adirectorio de la aplicación y la ejecutamos.
cd react-app
npm install && npm run dev
```

Si todo salió bien, deberías ver algo como esto:

```bash
VITE v4.3.9  ready in 890 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

No mostraré como se ve la aplicación en el navegador porque todos ya sabemos como se ve el boilerte de React en Vite. Además, si estás siguiendo este tutorial lo vas a ver en tu navegador.

### 2. Crear el Dockerfile

Bien, supongamos que le hicimos caso al amigo alucín de las ideas millonarias y construimos una aplicación acá bien perrona que vendió millones, de los cuales a ti te iban a tocar como dos mil pesos. 

Dentro del directorio de la aplicación de React vamos a crear un archivo de nombre `Dockerfile`. Un Dockerfile es un archivo de texto que contiene una serie de instrucciones que Docker utilizará para construir una imagen. Una imagen es un paquete que contiene todo lo necesario para ejecutar una aplicación, incluyendo el código, las dependencias, las variables de entorno, etc.

Si puedo representarlo de forma gráfica es un poco así:

![Diagrama](/img/posts/ansiblenew/diagrama.svg)

Regresando a la analogía de la pizza, el Dockerfile es como la receta de la pizza. En el Dockerfile se especifican los ingredientes y las instrucciones para preparar la pizza. Una vez que se tiene la receta, se puede preparar la pizza en cualquier lugar, siempre y cuando se tengan los ingredientes necesarios.

Con nuestro editor de texto favorito creamos un nuevo archivo llamado `Dockerfile` y escribimos lo siguiente:

```makefile
# Se utiliza una imagen base de Node.js (La más reciente que conozco es la 18)
FROM node:18

# Se establece el directorio de trabajo en el contenedor. Esto funciona similar al comando cd, pero en el contenedor.
WORKDIR /app

# Se copian los archivos de package.json y package-lock.json a la imagen. 
COPY package*.json ./

# Se instalan las dependencias de la aplicación.
RUN npm install

# Se copian todos los archivos de la aplicación al contenedor.
COPY . .

# Se ejecuta el comando para construir la aplicación.
RUN npm run build

# Se define el comando para ejecutar la aplicación cuando se inicie el contenedor
CMD [ "npm", "start" ]
```

Ya con el dockerfile listo podemos probar a construir la imagen. Para ello ejecutamos el siguiente comando:

```bash
$ docker build -t react-app .
```

Verás una salida como la siguiente:

```
Emulate Docker CLI using podman. Create /etc/containers/nodocker to quiet msg.
STEP 1/7: FROM node:18
Resolved "node" as an alias (/etc/containers/registries.conf.d/shortnames.conf)
Trying to pull docker.io/library/node:18...
Getting image source signatures
Copying blob bd73737482dd done  
Copying blob 06cfeca21bcd done  
Copying blob c1e5026c6457 done  
Copying blob 75256935197e done  
Copying blob 6710592d62aa done  
Copying blob f2e4b4cbd0b8 done  
Copying blob cb6259d61ade done  
Copying blob e7ad8f1516a1 done  
Copying config 78b037dbb6 done  
Writing manifest to image destination
Storing signatures
STEP 2/7: WORKDIR /app
--> 111bb07120d
STEP 3/7: COPY package*.json ./
--> af767683b73
STEP 4/7: RUN npm install

added 239 packages, and audited 240 packages in 8s

80 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
npm notice 
npm notice New minor version of npm available! 9.5.1 -> 9.7.1
npm notice Changelog: <https://github.com/npm/cli/releases/tag/v9.7.1>
npm notice Run `npm install -g npm@9.7.1` to update!
npm notice 
--> fa74c2a155f
STEP 5/7: COPY . .
--> 3f575f26a52
STEP 6/7: RUN npm run build

> react-app@0.0.0 build
> vite build

vite v4.3.9 building for production...
transforming...
✓ 34 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/react-35ef61ed.svg    4.13 kB │ gzip:  2.14 kB
dist/assets/index-d526a0c5.css    1.42 kB │ gzip:  0.74 kB
dist/assets/index-e92ae01e.js   143.41 kB │ gzip: 46.10 kB
✓ built in 1.12s
--> d7ab29c0eca
STEP 7/7: CMD [ "npm", "start" ]
COMMIT react-app
--> 7504dc25762
Successfully tagged localhost/react-app:latest
7504dc25762cb3fe1d0127063190751f934dd873a0121b64f54554fb01e818c3
```

La línea `Emulate Docker CLI using podman. Create /etc/containers/nodocker to quiet msg.` es porque estoy utilizando Podman en lugar de Docker. Si tu estás utilizando Docker, no verás esa línea.

Esa salida puede ser más corta si la imágen de NodeJS ya existía en tu sistema, en mi caso tuve que descargarla desde cero.

Si todo salió bien, podemos ver la imagen creada con el comando `docker images`:

```bash
$ docker images
REPOSITORY                TAG         IMAGE ID      CREATED        SIZE
localhost/react-app       latest      7504dc25762c  4 minutes ago  1.15 GB
docker.io/library/node    18          78b037dbb659  2 weeks ago    1.02 GB
```

Una vez probada nuestra imagen, vamos a continuar con Ansible.


### 3. Crear los hosts de Ansible y el Playbook

Ya tenemos las dos cosas más importantes listas y bien seguros de que funcionan. Ahora es tiempo de crear los hosts de Ansible y el playbook.

En el mismo directorio, oootra vez con tu editor de texto favorito, crea un archivo llamado `ansible.cfg` y escribe lo siguiente:

```ini
[defaults]
inventory = ./inventory.ini
```

Ahora, abre un archivo llamado `inventory.ini` y escribe lo siguiente:

```ini
[local]
localhost ansible_connection=local
```

este archivo, como su nombre lo indica, es el inventario de hosts de Ansible. En este caso, solo tenemos un host llamado `localhost` y la conexión se hará de forma local, es decir, en el mismo equipo donde se ejecuta Ansible.

Ahora creamos nuestro playbook, el nombre no está definido, pero por convención se le llama `playbook.yml`. En este archivo escribimos lo siguiente:

```yaml
---
- name: Ejecutar pruebas y construir imagen de Docker.
  hosts: local
  gather_facts: false
  tasks:
    - name: Instalar dependencias de la aplicación.
      command: npm install
      args:
        chdir: ./

    - name: Ejecutar Pruebas
      command: npm test
      args:
        chdir: ./

    - name: Construir imagen de Docker
      command: docker build -t react-app .
      args:
        chdir: /.
...
```

> Estoy consciente de que en Ansible Galaxy existe un modo para manejar Docker, pero, la intención de este ejemplo es para los que apenas están comenzando con Ansible, por lo que no es necesario complicar las cosas, si tenemos los binarios a la mano,podemos utilizarlos.

Ahora para simular un pipeline de CI/CD que despliega una imágen como ambiente productivo, vamos a crear un archivo llamado `deploy.yml` con el siguiente contenido:

```yaml
---
- name: Desplegar aplicación en Docker
  hosts: local
  gather_facts: false
  tasks:
    - name: Levantar contenedor de la aplicación
      command: docker run -d -p 80:80 react-app
...
```

Con esos dos playbooks listos ya estamos listos para el ultimo paso. Por el amor de dios, deja tus playbooks bonitos, así con sangrías y todo, es mejor hacer las cosas bien desde el principio, tu yo del futuro te lo agradecerá.

Otra cosa, el playbook asume que, como tu proyecto está completo y bien hecho, ya tienes pruebas unitarias en tu código, en mi caso añadí unas pruebas sencillas para probar que todo funciona bien, tu deberás hacer las tuyas, en caso de que no puedas, no te lo recomiendo, pero puedes saltarte esa parte del playbook.

Para saltarte la parte de las pruebas, solo tienes que comentar las líneas 11 y 12 del playbook `playbook.yml`:

```yaml
---
- name: Ejecutar pruebas y construir imagen de Docker.
  hosts: local
  gather_facts: false
  tasks:
    - name: Instalar dependencias de la aplicación.
      command: npm install
      args:
        chdir: ./

    # - name: Ejecutar Pruebas
    #   command: npm test
    #   args:
    #     chdir: ./

    - name: Construir imagen de Docker
      command: docker build -t react-app .
      args:
        chdir: ./
...
```

### 4. Ejecutar el pipeline

Para ejecutar el pipeline, solo necesitamos ejecutar el siguiente comando:

```bash
$ ansible-playbook playbook.yml
```

Te comparto la salida de mi ejecución:

```bash
PLAY [Ejecutar pruebas y construir imagen de Docker.] *********************************************************************************

TASK [Instalar dependencias de la aplicación.] ****************************************************************************************
changed: [localhost]

TASK [Ejecutar Pruebas] ***************************************************************************************************************
changed: [localhost]

TASK [Construir imagen de Docker] *****************************************************************************************************
changed: [localhost]

PLAY RECAP ****************************************************************************************************************************
localhost                  : ok=3    changed=3    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
``` 

Es probable que tu salida sea igual, o diferente, lo importante está en el "PLAY RECAP", que, literalmente, como en los deportes de contacto, es el resumen de la jugada.

Si todo salió bien, podemos ver la imagen creada con el comando `docker images`:

```bash
$ docker images
REPOSITORY                TAG         IMAGE ID      CREATED        SIZE
localhost/react-app       latest      7504dc25762c  4 minutes ago  1.15 GB
docker.io/library/node    18          78b037dbb659  2 weeks ago    1.02 GB
```

> Prueba a cambiar el nombre de la imágen que quieres en el playbook, y ejecuta de nuevo el pipeline, verás que se crea una nueva imágen con el nombre que le pusiste. No olvides de limpiar las imágenes que ya no necesites con `docker rmi <image_id>`.

Perfecto ¿Sabes que significa esto? Acabas de saber como hacer tus propias pipelines, ahora puedes probar y entregar aplicaciones más reproducibles.

Por como yo lo veo, tienes en tus manos pipelines donde quieras, muy ligeros en memoria (si usas podman en lugar de docker) y los tienes en tu computadora. En caso de que no puedas utilizar un servicio como GitHub Actions por cuestiones de privacidad o que simplemente en tu trabajo son muy codos para pagarte pipelines, pues aquí tienes una alternativa local, ligera y gratuita.


Vamos a probar un "deploy" de nuestra aplicación, para ello, ejecutamos el siguiente comando:

```bash
$ ansible-playbook deploy.yml
```

La salida de mi ejecución es la siguiente:

```bash
PLAY [Desplegar aplicación en Docker] ************************************************************************************************
changed: [localhost]

PLAY [Levantar contenedor de la aplicación] ******************************************************************************************
changed: [localhost]

PLAY RECAP ****************************************************************************************************************************
localhost                  : ok=2    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
```

> Si estás en podman, es probable que recibas un error "bind: permission denied", "Error rootlessport cannot expose privileged port 80", esto es porque podman no puede exponer puertos privilegiado (Es decir todos los puertos por debajo del 1024), para solucionarlo, solo tienes que cambiar el puerto de tu contenedor en el playbook, por ejemplo, de 80 a 8080. O de forma alternativa (NO), puedes ejecutar el playbook como root. No seas bestia y no lo hagas de la segunda forma.

Y ahí lo tienes, trata de escalar este ejemplo en tu cabeza a algo más grande en tu trabajo (yo supongo que todos mis lectores son desarrolladores), como un pipeline que construya una imágen de Docker, la suba a un registro privado, y luego la despliegue en un cluster de Kubernetes. 

Existen en Ansible Galaxy, módulos para que puedas para manipular hojas de cálculo, como contador, administrativo u otro puesto, puedes encontrar tareas automatizables y hacer tu trabajo más fácil.

## Conclusión

La automatización es una de las cosas más atractivas de cualquier entorno de tecnologías de la información. Ansible, con su facilidad y su poderosa funcionalidad, es una de las mejores herramientas disponibles para la automatización de tareas, desde cosas sencillas como la instalación de paquetes hasta la configuración de un cluster de Kubernetes. 

¿Quieres algo más creativo? ¿Eres un estudiante de sistemas o una carrera similar? Puedes utilizar Ansible para automatizar el envío de correos, SMS o incluso de mensajes de Whatsapp o Telegram para invitar a tus amigos a una ped....fiesta de sana convivencia.

O digamos que, por alguna razóń, comienzas a trabajar mientras estudias en servicio técnico de computadoras. Ansible no podrá ayudarte con la parte del hardware, pero puede ayudarte con la instalación y configuración de software en las máquinas Windows de tus clientes. De nuevo, como Ansible no necesita que instales nada en los hosts, tu cliente no tendrá que preocuparse por la seguridad de su información, es más, ni si quiera se dará cuenta de que todo lo que hiciste fue ejecutar un playbook de Ansible, irte a tomar un café y regresar a cobrarle.

Si te gustó el contenido que leíste y Ansible captó tu atención te recomiendo que comiences a hacer tareas sencillas y gradualmente aumentar la complejidad de la automatización. No es necesario que te lances de cabeza a la parte más profunda.

Como todas las tecnologías y herramientas, la clave es la práctica, diaria. Cuanto más uses Ansible, más cómodo y profesional te sentirás con él y más podrás aprovechar su potencial.

Ansible tiene una comunidad grande y activa, por lo que hay muchos recursos disponibles para ayudarte a empezar. Desde la documentación oficial hasta los tutoriales en línea y los foros de discusión, hay una gran cantidad de información disponible a tu disposición. Así que no tengas miedo de buscar ayuda o hacer preguntas. La comunidad de Ansible es muy acogedora y siempre está dispuesta a ayudar a los recién llegados.

Espero que este artículo te haya ayudado a entender un poco más sobre Ansible y que te haya dado una idea de cómo puedes usarlo para automatizar tareas en tu entorno de trabajo o en tu vida diaria. Y como dijo alguna vez uno de mis senseis:

> "Un buen programador es huevón. Pero para ser huevón, debes de ser, el más chingón."

¿Qué esperas tú para ser el más chingón?

### Canción triste del día.

*Tonight's Music - Katatonia*

![spotify](/img/posts/ansiblenew/spotify.png)

## Referencias

- [Ansible Documentation](https://docs.ansible.com/)
- [How to build your inventory — Ansible Documentation](https://docs.ansible.com/ansible/latest/user_guide/intro_inventory.html)
- [Ansible Community Documentation](https://docs.ansible.com/ansible_community.html)
- [Ansible Core Documentation](https://docs.ansible.com/core.html)
- [Red Hat Ansible Collections Documentation](https://docs.ansible.com/collections.html)
- [Ansible Galaxy Docs](https://docs.ansible.com/galaxy.html)
- [Ansible Lint Documentation](https://docs.ansible.com/lint.html)

### Glosario de términos

- *Host*: Un servidor remoto administrado por Ansible.
- *Grupo*, *Group* o *Host group*: Múltiples *hosts* (o servidores) agrupados que comparten una función en común. Por ejemplo, un grupo de servidores web, un grupo de servidores de base de datos, etc.
- *Inventario* o *Inventory*: Una colección de *hosts* y *grupos* que Ansible maneja. Puede ser un archivo `.yml` o puede ser consultado desde fuentes remotas como proveedores en la nube o sistemas de inventario de terceros.
- *Módulos* o *Modules*: Son programas escritos en Python que Ansible ejecuta en los servidores remotos. Los módulos son la unidad de trabajo de Ansible y pueden ser escritos por cualquiera.
- *Tareas* o *Tasks*: Unidades de acción que combinan uno o varios módulos y sus argumentos junto con otros parámetros.
- *Playbooks*: Una lista ordenada de tareas con sus parámetros correspondientes que definen un procedimiento sólido para configurar / ejecutar en un sistema.
- *Roles*: Unidades de organización distribuibles que permiten a los usuarios reutilizar código de automatización.
- *YAML*: Un lenguaje de marcado más feo que un coche por debajo.
- *Hechos* o *Facts*: Los hechos (*facts* en Ansible), son variables recuperadas de sistemas remotos donde se ejecutan los playbooks o módulos y ofrecen un contexto de los servidores y que está pasando o que pasó en ellos. Pueden contener información como direcciones IP, sistema operativo instalado, dispositivos de ethernet, dirección MAC, datos de fecha y hora e incluso información de hardware.

---

¿Te gustan estos blogs? Ayúdame a seguir escribiéndolos de las siguientes formas:
- [Invítame una pepsi caliente](https://ko-fi.com/ventgrey)
- [Regálame un follow en GitHub ❤](https://github.com/VentGrey)
