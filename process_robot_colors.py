#!/usr/bin/env python3
"""
Script para procesar el JSON completo del robot y cambiar colores azules → rojos
"""
import json
import sys
import re

def process_colors(json_str):
    """Cambia todos los colores azules por rojos/naranjas del proyecto"""
    
    # Reemplazos directos de colores en formato [r,g,b,a]
    replacements = {
        # Azul oscuro → Rojo-600 (#dc2626)
        '[0.2901960784313726,0.5647058823529412,0.8862745098039215,1]': '[0.8627450980392157,0.14901960784313725,0.14901960784313725,1]',
        # Azul medio → Rojo-500 (#ef4444)
        '[0.3607843137254902,0.6313725490196078,0.9450980392156862,1]': '[0.9372549019607843,0.26666666666666666,0.26666666666666666,1]',
        # Azul claro → Red-400 (#f87171)
        '[0.13333333333333333,0.21568627450980393,0.9058823529411765,1]': '[0.9725490196078431,0.44313725490196076,0.44313725490196076,1]',
        '[0.12549019607843137,0.48627450980392156,0.9058823529411765,1]': '[0.8627450980392157,0.14901960784313725,0.14901960784313725,1]',
        '[0.22745098039215686,0.5529411764705883,0.9333333333333333,1]': '[0.9372549019607843,0.26666666666666666,0.26666666666666666,1]',
        '[0.23529411764705882,0.5450980392156862,0.9058823529411765,1]': '[0.8627450980392157,0.14901960784313725,0.14901960784313725,1]',
        # Sin espacios
        '[0.2901960784313726,0.5647058823529412,0.8862745098039215,1]': '[0.8627450980392157,0.14901960784313725,0.14901960784313725,1]',
        '[0.3607843137254902,0.6313725490196078,0.9450980392156862,1]': '[0.8627450980392157,0.14901960784313725,0.14901960784313725,1]',
    }
    
    for old, new in replacements.items():
        json_str = json_str.replace(old, new)
    
    # Procesar gradientes (arrays con comas y espacios)
    json_str = re.sub(r'\[0,\s*0\.035,\s*0\.153,\s*0\.224', r'[0,0.862,0.149,0.149', json_str)
    json_str = re.sub(r'\[0\.5,\s*0\.047,\s*0\.182,\s*0\.276', r'[0.5,0.937,0.266,0.266', json_str)
    json_str = re.sub(r'\[1,\s*0\.059,\s*0\.212,\s*0\.329', r'[1,0.862,0.149,0.149', json_str)
    
    # También procesar versiones sin espacios en los arrays
    json_str = re.sub(r'\[0,0\.035,0\.153,0\.224', r'[0,0.862,0.149,0.149', json_str)
    json_str = re.sub(r'\[0\.5,0\.047,0\.182,0\.276', r'[0.5,0.937,0.266,0.266', json_str)
    json_str = re.sub(r'\[1,0\.059,0\.212,0\.329', r'[1,0.862,0.149,0.149', json_str)
    
    return json_str

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python3 process_robot_colors.py <archivo_input.json>")
        print("O pega el JSON completo como entrada estándar")
        sys.exit(1)
    
    input_file = sys.argv[1]
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            json_str = f.read()
        
        # Procesar colores
        processed = process_colors(json_str)
        
        # Validar JSON
        data = json.loads(processed)
        
        # Guardar
        output_file = "frontend/src/assets/animations/robot.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ JSON procesado y guardado en: {output_file}")
        print(f"   Capas: {len(data.get('layers', []))}")
        print("   Colores cambiados: Azules → Rojos/Naranjas")
        
    except FileNotFoundError:
        print(f"Error: No se encontró el archivo {input_file}")
    except json.JSONDecodeError as e:
        print(f"Error: JSON inválido: {e}")
    except Exception as e:
        print(f"Error: {e}")
