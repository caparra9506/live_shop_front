#!/bin/bash

# Reemplazar localhost:3000 con la configuración API en todos los archivos
find src -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.astro" | xargs sed -i 's|http://localhost:3000|${API_BASE_URL}|g'
find src -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.astro" | xargs sed -i 's|"localhost:3000"|API_BASE_URL|g'

echo "URLs actualizadas correctamente"