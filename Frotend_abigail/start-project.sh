#!/bin/bash

echo "🚀 Iniciando TodoFarma - Sistema de Gestión Farmacéutica"
echo "=================================================="

# Verificar si el backend está ejecutándose
echo "🔍 Verificando estado del backend..."
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Backend ejecutándose en http://localhost:3001"
else
    echo "⚠️  Backend no está ejecutándose en http://localhost:3001"
    echo "   Por favor, inicia el backend primero:"
    echo "   cd ../Backend && npm run dev"
    echo ""
fi

# Verificar si el frontend está ejecutándose
echo "🔍 Verificando estado del frontend..."
if curl -s http://localhost:4200 > /dev/null 2>&1; then
    echo "✅ Frontend ejecutándose en http://localhost:4200"
else
    echo "🚀 Iniciando frontend..."
    echo "   URL: http://localhost:4200"
    echo "   Usuario: admin@todofarma.com"
    echo "   Contraseña: Admin123!"
    echo ""
    npm start
fi

echo ""
echo "🎉 ¡TodoFarma está listo!"
echo "📱 Accede a: http://localhost:4200"
echo "🔗 API Backend: http://localhost:3001"
