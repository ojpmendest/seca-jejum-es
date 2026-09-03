# Seca Jejum — Quiz (ES) · vista previa

Clon de vista previa del funnel `quiz.secajejumturbo.site` con la copy traducida
al español. Renderiza `quiz.json` (estructura completa: 82 pantallas).

- `index.html` — motor de render (vanilla JS, sin build)
- `quiz.json` — estructura del quiz ya traducida PT → ES
- Las imágenes se cargan desde `media.inlead.cloud` (el mismo origen del quiz original)

## Ver localmente

```bash
cd site
python -m http.server 8777
# abrir http://localhost:8777
```

## Publicar en Vercel

```bash
cd site
npx vercel
```

Primera vez: pide iniciar sesión (abre el navegador una vez). Responde a las
preguntas con los valores por defecto. Al terminar da una URL `*.vercel.app`.
Para producción: `npx vercel --prod`.

## Notas

- Es una vista previa para revisar la traducción y el flujo, no el clon final
  pixel-perfect. Tipos de pantalla soportados: texto, imagen, opciones (con
  ramificación por respuesta), inputs de altura/peso/edad, barras de nivel,
  gráficos, loading, carrusel, bloque de precio, alertas.
- Las imágenes "Antes/Depois" tienen el texto quemado en el PNG (son las que ya
  copiaste); hay que rehacerlas si quieres el texto en español.
- `{{pesoideal}}` se muestra como `68` de ejemplo — el quiz real lo calcula
  desde el peso/altura ingresados.
