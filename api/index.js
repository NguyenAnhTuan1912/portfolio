"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const handlebars_1 = __importDefault(require("handlebars"));
// Use module-alias
require("module-alias/register");
const app = (0, express_1.default)();
const rootDir = path_1.default.resolve(process.argv[1], "..");
// Add global middleware
app.use(express_1.default.static(path_1.default.resolve(rootDir, "public")));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
function getBlogByValue(value) {
    const _path = path_1.default.resolve(rootDir, "public/data/blogs/data.json");
    const blogs = JSON.parse(fs_1.default.readFileSync(_path).toString());
    return blogs.find((blog) => blog.value === value);
}
function getProjectById(id) {
    const _path = path_1.default.resolve(rootDir, "public/data/projects/data.json");
    const projects = JSON.parse(fs_1.default.readFileSync(_path).toString());
    return projects.find((project) => project.id === id);
}
function getMainTemplate() {
    const _path = path_1.default.resolve(rootDir, "templates/index.template");
    const template = fs_1.default.readFileSync(_path);
    return template.toString();
}
function buildTemplate(template, data) {
    // Compile template
    const templateHandler = handlebars_1.default.compile(template);
    // Repare template
    return templateHandler(data);
}
function sendResult(res, data) {
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
    const description = "I aggregate my knowledge about particular thing and write it down.";
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
    const description = "Hello, I'm Tuan. This is my portfolio site. You can view my projects, works and read my blogs here.";
    console.log("Get main page");
    // Send back
    sendResult(res, { title, previewImage, description });
});
async function main() {
    try {
        // Setup server instance
        const instance = http_1.default.createServer(app);
        const port = process.env.PORT || "5000";
        // Start listen
        instance.listen(port, async () => {
            console.log(`You server is listening on http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error(error.message);
        console.log("Exit");
        process.exit(1);
    }
}
main();
