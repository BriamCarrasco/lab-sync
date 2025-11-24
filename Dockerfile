# Imagen base oficial de Node para Angular CLI 20
FROM node:24.11.1

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de la aplicación
COPY . .

# Expone el puerto 4200
EXPOSE 4200

# Comando para iniciar la aplicación Angular en modo desarrollo
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200"]