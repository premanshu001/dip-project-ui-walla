import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
// import cookieParser from "cookie-parser"
import dotenv from "dotenv"

dotenv.config({ path: '.env' });

import { connectDB } from "./db.js";

connectDB();

import { Comp } from "./models.js";

const app = express();

app.use(cors(
    {
        origin: "*",
        credentials: true,
        optionsSuccessStatus: 200,
        methods: "GET, POST, PUT, DELETE",
        allowedHeaders: "Content-Type, Authorization, Origin, X-Requested-With, Accept"
    }
));


app.use(express.json())
app.use(express.urlencoded())
app.use(express.static("public"))
// app.use(cookieParser())
app.use(bodyParser.text())
app.options('*', cors())


app.get("/", (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, 'public') });
});


app.post("/", (req, res) => {
    console.log(req.body);
    const { name } = req.body;
    res.json({ message: `Hello ${name}` })
});


app.get("/component", (req, res) => {
    const id = req.query?.id;
    const preview = req.query?.preview;

    if (id) {
        if (preview == "true") {
            Comp.findById(id).then((data) => {
                const code = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${data.title}</title>
                    <style>${data.css}</style>
                </head>
                <body>
                    ${data.html}

                    <script>
                        ${data.js}
                    </script>
                </body>
                </html>
                `;
                res.send(code)
            })
        }
        else if (preview == "false") {
            console.log("download");
            Comp.findById(id).then((data) => {
                const code = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${data.title}</title>
                    <style>${data.css}</style>
                </head>
                <body>
                    ${data.html}

                    <script>
                        ${data.js}
                    </script>
                </body>
                </html>
                `;

                let filename = data.title.replace(/ /g, "_");

                filename += " - UI Walla"

                res.setHeader('Content-disposition', 'attachment; filename=' + filename + '.html');
                res.setHeader('Content-type', 'text/html');
                res.charset = 'UTF-8';
                res.write(code);
                res.end();
            })
        }
        else {
            Comp.findById(id).then((data) => {
                res.send(data);
            })
        }
    }

    else {
        Comp.find().then((data) => {
            res.send(data);
        })
    }
});


app.post("/component", (req, res) => {
    const body = typeof req.body == "string" ? JSON.parse(req.body) : req.body;
    const { html, css, js, title } = body;
    const category = body?.category || "general";

    Comp.create({ title: title, html: html, css: css, js: js, category: category }).then((data) => {
        console.log(data);
        res.json({ message: "Component Saved" })
    })
});


app.delete("/component", (req, res) => {
    console.log(req.body);
    const id = req.query?.id;
    Comp.findByIdAndDelete(id).then((data) => {
        res.json({ message: "Component Deleted" })
    })
});


app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running");
});