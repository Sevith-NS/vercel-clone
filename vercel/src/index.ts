import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import path from "path";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";
import {createClient } from "redis"
const publisher = createClient();
publisher.connect();


const subscriber = createClient();
subscriber.connect();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    console.log(repoUrl);
    const id = generate();
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));
    
    const files = getAllFiles(path.join(__dirname, `output/${id}`));
    files.forEach(async file => {
       await uploadFile(file.slice(__dirname.length + 1), file); 
    //     S3: upload
    })

    await new Promise((resolve) => setTimeout(resolve, 5000))
    publisher.lPush("build-queue", id );
    //Like INSERT in SQL
    //or .create in mongo
    publisher.hSet("status", id, "uploaded");
    const value = await publisher.hGet("status", id);
    res.json({ id: id });   
});

app.get("/status", async (req, res) => {
    const id = req.query.id;
    const response = await subscriber.hGet("status", id as string);
    res.json({
        status: response
    })
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
