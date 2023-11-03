# File_Sharing_API


********API Documentation for File_Sharing_API Application********


MY Node.js application is a basic API server built using Express.js. It provides endpoints for uploading files, retrieving a list of files, and deleting files. Additionally, it includes a scheduled task using node-cron for file cleanup.

******Application Structure-----******

**My application consists of the following components:**

****External Modules:**** I have imported external modules such as **body-parser, express, dotenv, http, and node-cron** to build and enhance my API.

    const bodyParser = require("body-parser");
    const express = require("express");
    const dotenv = require("dotenv").config();
    const http = require("http");
    const cron = require("node-cron");


****Internal Modules:**** I've organized your application into separate modules for different functionality, including **postRoute, getRoute, deleteRoute, and fileCleanupCheck**. These modules are used for handling specific **routes** and **tasks**.

    const postRoute = require("./routes/postRoute");
    const getRoute = require("./routes/getRoute");
    const deleteRoute = require("./routes/deleteRoute");
    const fileCleanupCheck = require("./utilities/fileCleanupCheck");

****Express Application Setup:**** I initialize your **Express** application by creating an instance of it and setting up necessary **middleware**.

    const app = express();

******API Endpoints******

**I have defined three main API endpoints:**

****Upload a File (POST /files):**** This endpoint allows clients to upload files. The uploaded files are processed by the postRoute module.

    app.use("/files", postRoute);

****Retrieve a List of Files (GET /files):**** Clients can access this endpoint to fetch a list of files. The getRoute module handles this functionality.

    app.use("/files", getRoute);

****Delete a File (DELETE /files):**** This endpoint enables clients to delete files. The deleteRoute module is responsible for handling file deletions.

    app.use("/files", deleteRoute);

******Middleware******

**I've configured middleware to enhance your API's functionality:**

****JSON and URL Encoding:**** I use the express.json() middleware to parse JSON request bodies and **bodyParser.urlencoded()** middleware to handle URL-encoded data in requests.

    // json body parser
    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: true }));

****Scheduled Task:**** I have implemented a scheduled task using node-cron. This task runs at midnight (00:00) every day and is responsible for cleaning up files that have been inactive for seven days. The fileCleanupCheck function handles this task.

    cron.schedule("0 0 * * *", () => {
      const cleanupPeriod = 7 * 24 * 60 * 60 * 1000; 
      fileCleanupCheck(cleanupPeriod);
    });

******Deployment******

The application listens on a port specified in my environment variables (retrieved using process.env.PORT). This is where clients can connect to access my API.

    server.listen(process.env.PORT, () => {
      console.log(`Listening to the post ${process.env.PORT}`);
    });




**PostRoute Endpoint Description-----**

The postRoute is an Express.js router designed to handle POST requests for uploading files. This route is part of a larger application and includes various modules and middleware for managing file uploads and network rate limiting.

**Dependencies**

**External Modules**

**express**: The Express.js framework for building web applications.
**multer**: A middleware for handling file uploads.

    const express = require("express");
    const postRoute = express.Router();
    const multer = require("multer");

**Internal Modules**

**storage**: A custom middleware for handling file storage, presumably for configuring where uploaded files are stored.

**uploadLimiter**: A custom middleware for rate limiting incoming requests, to prevent network abuse.

**uploadResponse**: A controller responsible for handling the file upload process.

    const storage = require("../middleware/fileuploader");
    const { uploadLimiter } = require("../middleware/networkLimit");
    const uploadResponse = require("../controllers/postController");


**Middleware**

**uploadLimiter**: Applied to the POST / route, this middleware limits the number of incoming requests to prevent network abuse.

    const uploadLimiter = rateLimit({
      windowMs: time,
      max: maxlimit,
      message: "You exit maximum upload per day",
    });

**multer with storage:** Used to configure the file storage settings for handling file uploads.

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
      cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
      const fileExtention = path.extname(file.originalname);
      const originalFileName = file.originalname;
      let fileName;
      if (originalFileName.startsWith("tmp")) {
        // for testing purpose of code
        fileName = originalFileName.replace(fileExtention, "").split(" ").join("-") +fileExtention;
      } else {
      // for actual code
        fileName =  originalFileName.replace(fileExtention, "").split(" ").join("-") + "-" +  Date.now() + fileExtention;
      }
      cb(null, fileName);
    },
  });


**Controller**

**uploadResponse**: This controller is responsible for handling the logic and response generation for file uploads. It is executed after a file is successfully uploaded.

    const uploadResponse = async (req, res) => {
        if (!req.file) {
           return res.status(400).json({ error: "No file uploaded" });
        }
        res.json({
          "public key": req.file.filename,
          "private key": req.file.filename,
        });
    };

**Error Handling**

Any errors that occur during the request handling process, such as exceeding rate limits, file upload failures, or processing errors within the uploadResponse controller, should be appropriately handled and may result in error responses sent to the client.




**GetRoute Endpoint Description-----**

The gostRoute is an Express.js router designed to handle GET requests to retrieve a file based on a specified public key. It serves as part of your application's routing system, responding to requests and sending the corresponding file to the client if it exists.

**Dependencies**

**path**: Used to construct the file path based on the public key and folder.
**fs**: Used to access and stream the file to the client.
**mime**: Used to determine the MIME type of the file based on its extension.

**MIME Type Determination**: The postRoute function uses the "mime" library to determine the MIME type of the file based on its extension. This ensures that the response includes the correct "Content-Type" header, which helps the client's browser interpret the file correctly.

    const path = require("path");
    const fs = require("fs");
    const mime = require("mime");

**Functionality**

The postRoute function performs the following key tasks:

Construct the file path based on the provided public key.

    const filePath = path.join("FOLDER", req.params.publicKey);
                
Check if the file specified by the public key exists in the designated folder.

    await fs.access(filePath, fs.constants.F_OK, (error) => {
      if (error) {
        res
          .status(404)
          .json({ error: `The file ${req.params.publicKey} does not exist` });
      } 

If the file exists, determine its MIME type based on the file extension. Set the response headers to indicate the content type. Create a readable stream for the file and pipe it to the HTTP response.

    else {
        //get the mime type for the current file
        const fileExtension = path.extname(filePath).slice(1);

        // Determine the MIME type based on the file extension
        const mimeType = mime.getType(fileExtension);

        // Set the response headers
        res.setHeader("Content-Type", mimeType);

        // Create a readable stream and pipe it to the response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
      }
    });

**Error Handling**

The function includes error handling to deal with potential issues, such as the file not being found or an internal server error. In these cases, appropriate HTTP response codes and error messages are provided to the client.




**DeleteRoute Endpoint Description-----**

To use the Delete Route API, send a DELETE request to the specified endpoint, providing the :privateKey parameter in the URL path. The :privateKey parameter is used to identify and delete the resource associated with the provided private key.


**Dependencies**

**path**: Used to construct the file path based on the public key and folder.
**fs**: Used to access and stream the file to the client.

    const path = require("path");
    const fs = require("fs");

**Functionality**

Constructs the file path using the privateKey provided in the URL.

    const filePath = path.join("FOLDER", req.params.privateKey);

Checks if the file with the constructed path exists. If the file exists, it attempts to delete the file. Responds with the appropriate status and message based on the success or failure of the file deletion.

    try {
        await fs.access(filePath, fs.constants.F_OK, (error) => {
        if (error) {
            res.status(404).json({ error: `The file ${req.params.privateKey} does not exist` });
        } else {
            fs.unlink(filePath, (error) => {
            if (error) {
                res.status(404).json({error: `The file ${req.params.privateKey} does not exist`,});
            } else {
                res.status(200).json({ error: "File deleted successfully" });
            }
         });
        }
        });
      } catch (error) {
        res.status(404).json({ error: `The file ${req.params.privateKey} does not exist` });
      }


**Error Handling**

If the file with the provided privateKey does not exist, a 404 error is returned with the message "The file does not exist."


