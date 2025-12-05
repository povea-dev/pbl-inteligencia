# Robot Animation - Lottie

## Instrucciones para agregar la animación del robot

1. **Guarda el JSON completo** de la animación Lottie que compartiste en este archivo: `robot.json`

2. **Procesa los colores** para cambiar azules por rojos/naranjas del proyecto:

```bash
# Desde la raíz del proyecto
python3 process_robot_colors.py < frontend/src/assets/animations/robot.json > frontend/src/assets/animations/robot_processed.json
mv frontend/src/assets/animations/robot_processed.json frontend/src/assets/animations/robot.json
```

O manualmente reemplaza estos colores en el JSON:
- `[0.2901960784313726, 0.5647058823529412, 0.8862745098039215, 1]` → `[0.8627450980392157, 0.14901960784313725, 0.14901960784313725, 1]` (Red-600)
- `[0.3607843137254902, 0.6313725490196078, 0.9450980392156862, 1]` → `[0.9372549019607843, 0.26666666666666666, 0.26666666666666666, 1]` (Red-500)

## Colores del Proyecto EduFlow

- **Red-600:** `#dc2626` = `[0.8627, 0.1490, 0.1490, 1]`
- **Red-500:** `#ef4444` = `[0.9373, 0.2667, 0.2667, 1]`
- **Red-400:** `#f87171` = `[0.9725, 0.4431, 0.4431, 1]`
- **Orange-500:** `#f97316` = `[0.9765, 0.4510, 0.0863, 1]`

