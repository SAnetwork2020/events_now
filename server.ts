import express from "express";
import cors from 'cors';
import dotEnv from 'dotenv';
import mongoose from "mongoose";
import chalk from "chalk";
import userRouter from "./router/user_router";
import eventsRouter from "./router/event_router";
import TokenVerifier from "./middlewares/token";

// configure dotEnv
dotEnv.config({path:'./.env'});

const app: express.Application = express();
const hostName:string | undefined = process.env.HOST_NAME;
const port: number  = Number(process.env.PORT);
let dbURL:string | undefined = process.env.MONGO_DB_LOCAL;

// cors
app.use(cors());

// configure express to receive form data
app.use(express.json());

// App Router configuration
app.use('/users', userRouter);
app.use('/events',eventsRouter);



// connect to MongoDB
if (dbURL) {
    mongoose.connect(dbURL).then(()=>{
    console.log(`${chalk.yellow.bold('MongoDB connected successfully.....')}`);
    }).catch((err)=>{
    console.error('MongoDB connection error',err);
    process.exit(1);
    });
}



app.get('/', (req:express.Request ,res:express.Response)=>{
    res.status(200).send(
        `<h3 style = "font-family:Lato, sans-serif; color: green ">Welcome to Events Now Booking Application Backend</h3>`
    )
});

// Listen changes on the server
if (port && hostName) {
    app.listen(port,()=>{
        console.log(`Express server is started at ${chalk.yellow.bold(`http://${hostName}:${port}`)} `);
    });
}

/* function reqEnv(name:string):string{
    const val = process.env[name];
    if (!val) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return val;
} */