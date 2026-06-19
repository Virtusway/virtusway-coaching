# Reglas de Desarrollo y Buenas Prácticas — VirtusWay

Este archivo define las reglas de comportamiento y restricciones técnicas que deben respetar todos los agentes de IA (incluido Antigravity) que trabajen en este repositorio.

---

## 1. Directrices de SEO Obligatorias (A Futuro)

Para garantizar que el SEO se mantenga optimizado a medida que el sitio evoluciona, se deben seguir estas reglas estrictamente:

1.  **Uso de la Plantilla Base:**
    *   Toda nueva página pública debe crearse utilizando el componente [`Layout.astro`](file:///d:/Repositories/virtusway-coaching/src/layouts/Layout.astro). No se deben crear cabeceras HTML independientes.
2.  **Metadatos Obligatorios:**
    *   Toda página debe pasar propiedades explícitas y descriptivas de `title` (entre 50 y 60 caracteres) y `description` (entre 120 y 160 caracteres).
    *   Cualquier página nueva que actúe como landing page o artículo debe especificar una propiedad `image` para que la previsualización en redes sociales (Open Graph / Twitter Card) sea atractiva y no use la genérica.
3.  **Etiquetas Canonical:**
    *   No se deben hardcodear URLs en las etiquetas de canonical. Se debe utilizar la variable dinámica `canonicalURL` definida en `Layout.astro`.
4.  **Mapa del Sitio (Sitemap):**
    *   Cualquier ruta estática o dinámica nueva que deba ser indexada debe ser compatible con la integración `@astrojs/sitemap` ya configurada.
    *   Si se agrega una página que no debe indexarse (ej. páginas de gracias o legales internas), debe incluirse en la sección `Disallow` del archivo [`public/robots.txt`](file:///d:/Repositories/virtusway-coaching/public/robots.txt).
5.  **Accesibilidad e Imágenes:**
    *   Toda etiqueta `<img>` nueva en el proyecto **debe contar obligatoriamente con el atributo `alt`** con una descripción textual clara del contenido de la imagen para garantizar la accesibilidad y el SEO de Google Imágenes.
6.  **Datos Estructurados (Schema Markup):**
    *   Si una nueva página representa un servicio, evento o artículo específico, se debe declarar e inyectar el correspondiente bloque de datos estructurados JSON-LD en el `<head>`.

---

## 2. Nombres de Ramas (Git)
*   Como regla de consistencia del equipo (Andrés y Marcos), todas las ramas de Git creadas deben nombrarse **siempre en inglés** (ej. `UX-UI`, `feature/seo-fixes`, `hotfix/scroll-flicker`).
