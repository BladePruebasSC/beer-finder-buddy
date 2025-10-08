# 🍺 Instrucciones para Actualizar el Favicon

## Opción 1: Usar el SVG creado (Recomendado)

El archivo `public/favicon.svg` ya está creado con un diseño profesional de cerveza. Los navegadores modernos lo usarán automáticamente.

## Opción 2: Convertir SVG a ICO

Si necesitas un archivo .ico, puedes:

### Método 1: Online (Más fácil)
1. Ve a https://convertio.co/svg-ico/ o https://cloudconvert.com/svg-to-ico
2. Sube el archivo `public/favicon.svg`
3. Descarga el archivo .ico
4. Reemplaza `public/favicon.ico` con el nuevo archivo

### Método 2: Usando Node.js
```bash
npm install -g svg2png-cli png-to-ico
svg2png public/favicon.svg --output public/favicon.png --width 32 --height 32
png-to-ico public/favicon.png public/favicon.ico
```

## Opción 3: Generar desde cero

Puedes usar cualquier generador de favicon como:
- https://favicon.io/favicon-generator/
- https://realfavicongenerator.net/
- https://www.favicon-generator.org/

## Características del Nuevo Favicon

✅ **Diseño profesional**: Jarra de cerveza con espuma
✅ **Colores vibrantes**: Gradiente naranja/amarillo
✅ **Escalable**: SVG funciona en todos los tamaños
✅ **Compatibilidad**: Múltiples formatos (SVG, ICO, PNG)
✅ **Fallback**: Emoji 🍺 como respaldo

## Verificación

Después de actualizar:
1. Refresca el navegador (Ctrl+F5)
2. Verifica en la pestaña del navegador
3. Revisa en bookmarks/favoritos
4. Prueba en diferentes navegadores

## Troubleshooting

Si no se ve el nuevo favicon:
1. **Limpia cache**: Ctrl+Shift+Delete
2. **Hard refresh**: Ctrl+F5
3. **Incógnito**: Abre en modo privado
4. **Espera**: Puede tardar unos minutos en propagarse

El favicon SVG ya está configurado y debería funcionar inmediatamente en navegadores modernos.
