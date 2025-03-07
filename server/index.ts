import fs from "fs";
import path from "path";
import express from "express";
import http from "http";
import Handlebars from "handlebars";

// Use module-alias
import "module-alias/register";

// Import types
import type { Response } from "express";

type MainTemplateType = {
  title: string;
  previewImage: string;
  description: string;
};

const app = express();
const rootDir = path.resolve(process.argv[1], "..");

// Add global middleware
app.use(express.static(path.resolve(rootDir, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function getBlogByValue(value: string) {
  const _path = path.resolve(rootDir, "public/data/blogs/data.json");
  const blogs = JSON.parse(fs.readFileSync(_path).toString());
  return blogs.find((blog: any) => blog.value === value);
}

function getProjectById(id: string) {
  const _path = path.resolve(rootDir, "public/data/projects/data.json");
  const projects = JSON.parse(fs.readFileSync(_path).toString());
  return projects.find((project: any) => project.id === id);
}

function getMainTemplate() {
  const _path = path.resolve(rootDir, "templates/index.template");
  const template = fs.readFileSync(_path);
  return template.toString();
}

function buildTemplate(template: any, data: MainTemplateType) {
  // Compile template
  const templateHandler = Handlebars.compile(template);
  // Repare template
  return templateHandler(data);
}

function sendResult(res: Response, data: MainTemplateType) {
  res.status(200).send(buildTemplate(getMainTemplate(), data));
}

// Define routes
app.get("/projects", function (req, res) {
  const title = "Projects";
  const previewImage = "https://i.ibb.co/tYrYq0Q/Preview.png";
  const description = "All of my projects are placed in here, check it now!";

  // Send back
  sendResult(res, { title, previewImage, description });
});

app.get("/blogs", function (req, res) {
  const title = "Blogs";
  const previewImage = "https://i.ibb.co/tYrYq0Q/Preview.png";
  const description =
    "I aggregate my knowledge about particular thing and write it down.";

  // Send back
  sendResult(res, { title, previewImage, description });
});

app.get("/contact", function (req, res) {
  const title = "Contact";
  const previewImage = "https://i.ibb.co/tYrYq0Q/Preview.png";
  const description = "More about me, you just click these links!";

  // Send back
  sendResult(res, { title, previewImage, description });
});

app.get("/projects/:id", function (req, res) {
  const { id } = req.params;

  const project = getProjectById(id);
  const title = "Projects";
  const previewImage = project.cover;
  const description = project.description.short;

  // Send back
  sendResult(res, { title, previewImage, description });
});

app.get("/blogs/:value", function (req, res) {
  const { value } = req.params;

  const blog = getBlogByValue(value);

  const title = "Blogs";
  const previewImage = blog.cover;
  const description = blog.description;

  // Send back
  sendResult(res, { title, previewImage, description });
});

app.get("/", function (req, res) {
  const title = "Home";
  const previewImage = "https://i.ibb.co/tYrYq0Q/Preview.png";
  const description =
    "Hello, I'm Tuan. This is my portfolio site. You can view my projects, works and read my blogs here.";

  console.log("Get main page");

  // Send back
  sendResult(res, { title, previewImage, description });
});

async function main() {
  try {
    // Setup server instance
    const instance = http.createServer(app);
    const port = process.env.PORT || "5000";

    // Start listen
    instance.listen(port, async () => {
      console.log(`You server is listening on http://localhost:${port}`);
    });
  } catch (error: any) {
    console.error(error.message);
    console.log("Exit");
    process.exit(1);
  }
}

main();
