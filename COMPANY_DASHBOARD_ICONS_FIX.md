# Arreglo de Iconos del Dashboard de Empresa

## Problema Identificado
En las capturas de pantalla del dashboard de empresa aparecían iconos de interrogación (?) en lugar de los iconos minimalistas configurados. Esto se debía a que se estaban usando nombres de iconos de Ionicons que no existen.

## Cambios Realizados

### 1. Importación de MinimalistIcons
- Agregada la importación de `MinimalistIcons` en `CompanyDashboardMain.js`

### 2. Reemplazo de Iconos en Tarjetas Principales
- **Colaboraciones**: `people-circle` → `users`
- **Historias Instagram**: `logo-instagram` → `instagram`
- **Instagram EMV**: `trending-up` → `trending`

### 3. Reemplazo de Iconos del Header
- **Botón Atrás**: `arrow-back` → `back`
- **Botón Refresh**: `refresh` → `refresh` (agregado nuevo icono)

### 4. Reemplazo de Iconos de Métricas
- **Seguidores**: `people` → `users`
- **Impresiones**: `eye` → `trending`
- **Aprobación**: `checkmark-circle` → `check`
- **Tiempo**: `time` → `history`
- **Influencers Únicos**: `person-add` → `profile`
- **Influencers Recurrentes**: `repeat` → `star`

### 5. Nuevo Icono Agregado
- Agregado icono `refresh` a `MinimalistIcons.js` con diseño minimalista

## Archivos Modificados
1. `components/CompanyDashboardMain.js` - Reemplazados todos los iconos de Ionicons por MinimalistIcons
2. `components/MinimalistIcons.js` - Agregado icono `refresh`

## Resultado
- Los iconos de interrogación (?) ya no aparecen
- Todos los iconos ahora usan el diseño minimalista consistente
- La interfaz de empresa mantiene la coherencia visual con el resto de la aplicación

## Pruebas
Para verificar los cambios:
1. Reiniciar la aplicación
2. Navegar al dashboard de empresa
3. Verificar que aparecen los iconos minimalistas en lugar de los signos de interrogación

Los iconos ahora deberían aparecer correctamente en:
- Tarjetas de estadísticas principales (Colaboraciones, Historias Instagram, Instagram EMV)
- Botones del header (atrás y refresh)
- Métricas de analytics (alcance, eficiencia, influencers)