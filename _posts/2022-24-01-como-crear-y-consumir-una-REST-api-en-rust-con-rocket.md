---
layout: post
---
# Y es que...todos son iguales.

Seamos sinceros, todos hemos hecho al menos una REST API en nuestra vida, honestamente es algo de esperarse, siendo el estilo de arquitectura de software más popular de los últimos años. Si bien REST no es algo nuevo (Pues, su existencia puede rastrearse hasta el año 2000) sigue siendo un enfoque de desarrollo modular y en un todo muy conveniente. Sobre todo si hablamos de tecnologías basadas en la web.

No creo que sea necesario dar tanto contexto sobre qué es una REST API, mucho menos en estos años donde podemos encontrar (sin exagerar) miles de sitios donde se nos podría explicar perfectamente que son las REST API, como funcionan, sus casos de uso, ventajas, desventajas y todas esas cosas que nos encanta leer para excusar una flamewar en foros o grupos de chat.

Para esta entrada vamos a ver como crear y consumir una REST API. Con la parte de la creación utilizaremos [Rust](https://www.rust-lang.org/) con [Rocket](https://rocket.rs/) y para la parte del consumo una página web con un script básico debería funcionar. Asímismo voy a utilizar como ejemplo mi proyecto personal "[upventrs](https://github.com/UpVent/upventrs)" (Por: UpVent RustSvelte). Donde pondré ejemplos de como podemos consumir nuestra REST API desde un framework para JavaScript como [Svelte](https://svelte.dev/).

## Preparando el entorno de trabajo
Si estás leyendo este tutorial asumiré que ya tienes un poco de experiencia con Rust (por lo menos la [instalación](https://rustup.rs/) debería ser algo que ya lograste hacer con éxito). Para este trabajo vamos a crear un binario de Rust y añadiremos algunas dependencias.

### El magnánimo ORM [^1 Que tiene noble temperamento y grandeza de espíritu y se comporta con generosidad.]


