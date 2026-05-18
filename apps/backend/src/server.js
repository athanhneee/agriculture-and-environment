import http from "node:http";
import { Server } from "socket.io";
import app from "./app.js";

const port = Number(process.env.BACKEND_PORT ?? process.env.PORT ?? 4000);
const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: clientUrl,
    credentials: true
  }
});

io.on("connection", (socket) => {
  socket.emit("sensor:update", {
    farmZoneId: "demo-zone",
    temperature: 28.4,
    humidity: 72,
    soilMoisture: 61,
    recordedAt: new Date().toISOString()
  });
});

server.listen(port, () => {
  console.log(`Smart Farm backend is running at http://localhost:${port}`);
});
