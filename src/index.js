// import http from "http" // es6
require('dotenv').config()
// axios
const axios = require("axios");
// express
const express = require("express");
const { join } = require("path");
const app = express();

// http
const http = require("http").Server(app); // es5

// socket.io
const socketio = require("socket.io")(http);

socketio.on("connection", function (socket) {
  console.log("Un cliente conectado...");

  socket.on("mi-chat", async function (mensaje) {
    console.log(mensaje);
    if(mensaje.includes("/")){
      // procesar la IA
      let respuestaIA = await procesarOpenAi(mensaje)
      socket.emit("mi-chat", respuestaIA);
      console.log(socket.handshake.address, " - ", socket.request.connection.remoteAddress)

      // -------------------------------------
      socket.broadcast.emit("mi-chat", {iap: mensaje, iar: respuestaIA, ip: socket.request.connection.remoteAddress});
    }else{
      socket.broadcast.emit("mi-chat", mensaje);
    }
  });

  socket.on("disconnect", function () {
    console.log("Cliente desconectado...");
  });
});

// rutas

app.get("/", function (req, res) {
  return res.sendFile(join(__dirname, "index.html"));
});

app.get("/chatgpt", async function (req, res) {
  
    let respuesta = await procesarOpenAi("Hola que es PHP?")
    

  return res.json({ mensaje: respuesta });
});

async function procesarOpenAi(msg){
    const { data } = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              // content: "Actua como un experto en Node.js y solamente responde sobre ese tema. si te consultan otros temas solo responde con una sola palabra 'NOSE'",
              content: "Responde en maximo 15 palabras"
            },
            {
                role: "user",
                content: msg,
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer "+process.env.TOKEN_OPENAI,
          },
        }
      );
    
      const respuesta = data.choices[0].message.content
      console.log(respuesta)
      return respuesta;
}

http.listen(3000, function () {
  console.log("Servidor Iniciado de Node en: localhost:3000");
});
