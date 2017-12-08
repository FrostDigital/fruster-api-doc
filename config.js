module.exports = {

    bus: process.env.BUS || "nats://localhost:4222",

    port: parseInt((process.env.PORT || 8080), 10)

};