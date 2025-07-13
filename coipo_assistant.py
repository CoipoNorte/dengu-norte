import os
import subprocess
import datetime

# 🐾 Detectar nombre de usuario
usuario = os.getenv("USER", "Copito")

# 🎉 Saludo personalizado
print(f"\n🐾 ¡Hola, {usuario}!\nHoy es {datetime.datetime.now().strftime('%A, %d de %B %Y')} 🌄")

# ⚙️ Verificación de herramientas
herramientas = {
    "Python": "python3 --version",
    "Docker": "docker --version",
    "Git": "git --version",
    "VS Code": "code --version",
}

print("\n🔍 Detectando herramientas instaladas...")

for nombre, comando in herramientas.items():
    try:
        resultado = subprocess.check_output(comando.split(), stderr=subprocess.DEVNULL).decode().strip()
        print(f"✔️ {nombre}: {resultado}")
    except:
        print(f"❌ {nombre}: no encontrado")

# 🎯 Consejo chistoso
consejos = [
    "No escribas código... escribe leyenda.",
    "Un bug al día mantiene la humildad.",
    "Tu terminal te quiere, aunque no siempre te lo diga.",
    "La RAM es limitada. Tu creatividad, no.",
    "Si fallas, hazlo con estilo y emojis.",
]

import random
print(f"\n🎉 Consejo de hoy:\n\"{random.choice(consejos)}\"")

# 🧠 Nivel de energía
nivel = random.randint(80, 100)
print(f"\n🧠 Nivel de potencia de tu compitadora: {nivel}%\n")

# 🐾 Mensaje final
print("📦 ¿Listo para comenzar en tu carpeta de proyecto? ¡Te apoyo, líder Coipo!\n")
