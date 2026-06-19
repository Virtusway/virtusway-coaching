# Guías de Identidad Visual y Manual de Estilos — VirtusWay

Este documento analiza la idoneidad del sistema tipográfico actual y documenta la paleta de colores oficial, los tokens de diseño y los recursos institucionales utilizados en el desarrollo del sitio web de VirtusWay.

---

## 1. Análisis Tipográfico: Evaluación Estratégica

La tipografía de un sitio de coaching integrativo debe transmitir **confianza, cercanía humana y profesionalismo estructurado**. Analizamos los dos pilares tipográficos de VirtusWay:

### A. Tipografía Principal (Titulares): **Hoss Round Wide Light**
*   **Detalles técnicos:** Cargada localmente desde `/fonts/hoss-round-wide-light.otf`. Asignada al token `--font-display`.
*   **Análisis de Idoneidad (¿Es correcta?):**
    *   **Cercanía y Empatía:** Las tipografías de terminales redondeados (*rounded*) se asocian psicológicamente con la amabilidad, la apertura y la falta de juicio. Al ser un proceso de coaching ("un espacio seguro"), esta tipografía rompe la frialdad corporativa tradicional.
    *   **Sofisticación Editorial:** Las fuentes redondeadas corren el riesgo de verse infantiles (como Comic Sans o Arial Rounded). Sin embargo, al usar la variante **Light** (trazo fino) y **Wide** (proporciones anchas), la fuente adquiere un carácter sumamente elegante, espacioso y de alta gama (editorial), ideal para ejecutivas y directores de tecnología.
    *   **Concepto de Marca:** Representa el pilar ***Virtus*** (valores, el lado humano, la mente y el corazón).

### B. Tipografía Secundaria (Cuerpo y Subtítulos): **Nexa Regular**
*   **Detalles técnicos:** Cargada localmente desde `/fonts/nexa-regular.ttf`. Asignada al token `--font-sans` y aplicada a todo el cuerpo de texto del sitio.
*   **Análisis de Idoneidad (¿Es correcta?):**
    *   **Pragmatismo y Legibilidad:** Nexa es una sans-serif geométrica muy limpia y neutral. Proporciona una lectura descansada en pantallas, lo cual es crítico para los bloques informativos de la metodología y las páginas de aterrizaje.
    *   **Sintonía TIC:** Su estructura geométrica y directa resuena con los perfiles del sector tecnológico (Equipos TIC y líderes de IT), reflejando orden y método sin adornos innecesarios.
    *   **Concepto de Marca:** Representa el pilar ***Way*** (el camino, la estructura, la base técnica).

---

## 2. Paleta de Colores (Design Tokens)

Configurada en el archivo global de estilos ([`global.css`](file:///d:/Repositories/virtusway-coaching/src/styles/global.css)) bajo la directiva `@theme` de Tailwind CSS v4:

### 🎨 Colores de Fondos y Superficies
*   `--color-paper`: `#f4f7f9` (Fondo claro principal. Aporta frescura y aire).
*   `--color-paper-warm`: `#f8f5ee` (Detalle beige cálido. Se usa para las bandas donde se busca conectar más con el lado humano y la introspección).
*   `--color-mist`: `#e0edf4` / `--color-mist-soft`: `#edf4f8` (Azules hielo muy suaves. Utilizados para fondos de tarjetas y separaciones sutiles).

### 🖋️ Colores de Texto (Tintas)
*   `--color-ink`: `#1e1e1e` (Color de texto principal. Un gris carbón muy oscuro que reduce la fatiga visual en comparación con el negro puro `#000000`).
*   `--color-ink-muted`: `#5c6468` (Texto secundario, descripciones y leyendas).
*   `--color-ink-soft`: `#8a9194` (Textos secundarios más pequeños o deshabilitados).
*   `--color-rule`: `#d4e2eb` (Color de bordes y líneas divisorias).

### 🚀 Colores de Marca y Acento (Identidad Corporativa)
*   `--color-deep`: `#0a4d7a` (Azul marino profundo. Representa la seriedad, la trayectoria de 35 años en tecnología y la confianza institucional).
*   `--color-tide`: `#127fb5` / `--color-sky`: `#52c2e6` (Azul medio y celeste brillante. Simbolizan la claridad mental, el alivio y la apertura).
*   `--color-leaf`: `#00cb97` / `--color-leaf-deep`: `#009e75` (Verde menta/hoja. Es el color de acento principal. Simboliza la coherencia, la evolución personal, la naturaleza y la vida).

---

## 3. Recursos Institucionales e Isotipo

El logotipo oficial de VirtusWay se gestiona a través de archivos vectoriales (SVG) limpios ubicados en la carpeta [`/public/brand/`](file:///d:/Repositories/virtusway-coaching/public/brand/):

*   **Logotipo Horizontal:** [`/brand/WEB/Virtusway_Brand_H.svg`](file:///d:/Repositories/virtusway-coaching/public/brand/WEB/Virtusway_Brand_H.svg) (Utilizado en la cabecera principal).
*   **Isotipo (Icono de Marca):** [`/brand/ISO/Web/Virtusway_ISO.svg`](file:///d:/Repositories/virtusway-coaching/public/brand/ISO/Web/Virtusway_ISO.svg) (Utilizado en formularios y detalles de marca).

### 💡 Regla de Fusión de Marca:
En los titulares del sitio web, se aplica una convención visual muy importante:
*   Las palabras regulares se escriben en tipografía principal **Hoss Round Wide** (fina, redondeada).
*   Las palabras clave de acento se envuelven en la clase `.font-display-italic`, la cual cambia la tipografía a **Nexa en estilo itálica** y color de acento (`--color-deep` o `--color-leaf-deep`). Esto imita el contraste gráfico del logotipo original, donde conviven ambos mundos visuales.
