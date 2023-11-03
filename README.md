# API Documentation for File_Sharing_API Application

MY Node.js application is a basic API server built using Express.js. It provides endpoints for uploading files, retrieving a list of files, and deleting files. Additionally, it includes a scheduled task using node-cron for file cleanup.

## Application Structure

### My application consists of the following components:

### Dependencies (External Modules & Internal Modules)

Imported external modules such as **body-parser, express, dotenv, http, and node-cron** to build and enhance my API.

    const bodyParser = require("body-parser");
    const express = require("express");
    const dotenv = require("dotenv").config();
    const http = require("http");
    const cron = require("node-cron");

I've organized my application into separate modules for different functionality, including **postRoute, getRoute, deleteRoute,databaseConnection and fileCleanupCheck**. These modules are used for handling specific **routes** and **tasks**.And **databaseConnection** is used for connect cloud storage (Mongo Atlas).

    const databaseConnection = require("./configuration/databaseConnection");
    const postRoute = require("./routes/postRoute");
    const getRoute = require("./routes/getRoute");
    const deleteRoute = require("./routes/deleteRoute");
    const fileCleanupCheck = require("./utilities/fileCleanupCheck");

    databaseConnection();       //for connect database to my app

### Express Application Setup

I initialize my **Express** application by creating an instance of it and setting up necessary **middleware**.

    const app = express();

### API Endpoints

**Upload a File (POST /files):** This endpoint allows clients to upload files. The uploaded files are processed by the postRoute module.

    app.use("/files", postRoute);

**Retrieve a List of Files (GET /files):** Clients can access this endpoint to fetch a list of files. The getRoute module handles this functionality.

    app.use("/files", getRoute);

**Delete a File (DELETE /files):** This endpoint enables clients to delete files. The deleteRoute module is responsible for handling file deletions.

    app.use("/files", deleteRoute);

### Middleware

**JSON and URL Encoding:** I use the express.json() middleware to parse JSON request bodies and **bodyParser.urlencoded()** middleware to handle URL-encoded data in requests.

    // json body parser
    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: true }));

**Scheduled Task:** I have implemented a scheduled task using node-cron. This task runs at midnight (00:00) every day and is responsible for cleaning up files that have been inactive for seven days. The fileCleanupCheck function handles this task.

    cron.schedule("0 0 * * *", () => {
        const cleanupPeriod = 7 * 24 * 60 * 60 * 1000;
        fileCleanupCheck(cleanupPeriod);
    });

Here, funtions for cleanup inactivefiles files from cloud storage

    const remover = async (file) => {
        try {
            await filesModel.deleteOne({ name: file });
        } catch (error) {
            console.error("Error removing file", error);
        }
    };

That is the called function from main app to do the file cleaner work if any file inactive for a certain period.

    const fileCleanupCheck = async (cleanupPeriod) => {
        const cleanupTimestamp = Date.now() - cleanupPeriod;

        fs.readdir(filesPath, (error, files) => {
            if (error) {
                console.error("Error reading file directory", error);
                return;
            }

            files.forEach((file) => {
                const currentFilePath = `${filesPath}/${file}`;
                fs.stat(currentFilePath, (statError, stats) => {
                    if (statError) {
                        console.error("Error getting file stats", statError);
                    } else {
                        if (stats.mtimeMs < cleanupTimestamp) {
                            remover(file);
                            fs.unlink(currentFilePath, (removeError) => {
                                if (removeError) {
                                    console.error("Error removing file", removeError);
                                } else {
                                    console.log(`File named ${file} removed successfully`);
                                }
                            });
                        }
                    }
                });
            });
        });
    };

### Deployment

The application listens on a port specified in my environment variables (retrieved using process.env.PORT). This is where clients can connect to access my API.

    server.listen(process.env.PORT, () => {
        console.log(`Listening to the post ${process.env.PORT}`);
    });

## Database Configuration for Cloud Storage

Use mongo atlas for cloud storage & here is the connection code for configure mongo atlas to our API

    const databaseConnection = async () => {
        mongoose.connect(process.env.MONGOURL)
        .then(console.log("Database connection established!"))
        .catch((err) => console("Database not connected"));
    };

## PostRoute Endpoint Description

The postRoute is an Express.js router designed to handle POST requests for uploading files. This route is part of a larger application and includes various modules and middleware for managing file uploads and network rate limiting.

### Dependencies (External Modules & Internal Modules)

**express**: The Express.js framework for building web applications.
**multer**: A middleware for handling file uploads.

    const express = require("express");
    const postRoute = express.Router();
    const multer = require("multer");

**storage**: A custom middleware for handling file storage, presumably for configuring where uploaded files are stored.

**uploadLimiter**: A custom middleware for rate limiting incoming requests, to prevent network abuse.

**uploadResponse**: A controller responsible for handling the file upload process.

    const storage = require("../middleware/fileuploader");
    const { uploadLimiter } = require("../middleware/networkLimit");
    const uploadResponse = require("../controllers/postController");

### Middleware

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
            if (originalFileName.startsWith("testfile")) {
                // for testing purpose of code
                fileName = originalFileName.replace(fileExtention, "").split(" ").join("-") + fileExtention;
            } else {
                // for actual code
                fileName = originalFileName.replace(fileExtention, "").split(" ").join("-") + "-" + Date.now() + fileExtention;
            }
            cb(null, fileName);
        },

    });

### Controller

**uploadResponse**: This controller is responsible for handling the logic and response generation for file uploads. It is executed after a file is successfully uploaded.

    const uploadResponse = async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const fileName = req.file.filename;

        //for testing code neednot use mongo atlas
        if (!fileName.startsWith("testfile")) {
            await filesModel.create({
                name: req.file.filename,
            });
        }

        res.json({
            "public key": req.file.filename,
            "private key": req.file.filename,
        });
    };

### Error Handling

Any errors that occur during the request handling process, such as exceeding rate limits, file upload failures, or processing errors within the uploadResponse controller, should be appropriately handled and may result in error responses sent to the client.

## GetRoute Endpoint Description

The getRoute is an Express.js router designed to handle GET requests to retrieve a file based on a specified public key. It serves as part of your application's routing system, responding to requests and sending the corresponding file to the client if it exists.

### Dependencies

**path**: Used to construct the file path based on the public key and folder.
**fs**: Used to access and stream the file to the client.
**mime**: Used to determine the MIME type of the file based on its extension.

**MIME Type Determination**: The getRoute function uses the "mime" library to determine the MIME type of the file based on its extension. This ensures that the response includes the correct "Content-Type" header, which helps the client's browser interpret the file correctly.

    const path = require("path");
    const fs = require("fs");
    const mime = require("mime");

### Middleware

**downloadLimiter**: Applied to the get / route, this middleware limits the number of download requests to prevent network abuse.

    const downloadLimiter = rateLimit({
        windowMs: time,
        max: maxlimit,
        message: "You exit maximum download per day",
    });

### Functionality

The gettRoute function performs the following key tasks:

Construct the file path based on the provided public key.

    const filePath = path.join("FOLDER", req.params.publicKey);

Check if the file specified by the public key exists in the designated folder.

    fs.access(filePath, fs.constants.F_OK, (error) => {
        if (error) {
            res .status(404) .json({ error: `The file ${req.params.publicKey} does not exist` });
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

### Error Handling

The function includes error handling to deal with potential issues, such as the file not being found or an internal server error. In these cases, appropriate HTTP response codes and error messages are provided to the client.

## DeleteRoute Endpoint Description

To use the Delete Route API, send a DELETE request to the specified endpoint, providing the :privateKey parameter in the URL path. The :privateKey parameter is used to identify and delete the resource associated with the provided private key.

### Dependencies

**path**: Used to construct the file path based on the public key and folder.
**fs**: Used to access and stream the file to the client.

    const path = require("path");
    const fs = require("fs");

### Functionality

Constructs the file path using the privateKey provided in the URL.

    const filePath = path.join("FOLDER", req.params.privateKey);

Checks if the file with the constructed path exists. If the file exists, it attempts to delete the file. Responds with the appropriate status and message based on the success or failure of the file deletion.

    try {

        //Restrict cloud database during testing
        if ( !req.params.privateKey.startsWith("nonexistentfile.txt") && !req.params.privateKey.  startsWith  ("testfile")) {
            await filesModel.deleteOne({ name: req.params.privateKey });
        }

        fs.access(filePath, fs.constants.F_OK, (error) => {
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

### Error Handling

If the file with the provided privateKey does not exist, a 404 error is returned with the message "The file does not exist."

# API Documentation for Integration and Unit Testing

## Introduction

This document provides theoretical documentation for the integration and unit testing of an API. The API in question is a file management system that allows users to upload, download, and delete files. The testing is divided into two parts: Integration Testing and Unit Testing.

## Integration Testing

Integration testing involves testing the API as a whole to ensure that its various components work together seamlessly. The focus is on testing the API's endpoints and their interactions.

### Test Environment Setup

To perform integration tests, we use the following tools and libraries:

- **Supertest**: A library for making HTTP requests to the API.
- **Chai**: A test assertion library.
- **Chai-Http**: A plugin for Chai to make HTTP requests.
- **fs**: Node.js's file system module for handling file operations.
- **mime**: A library for working with MIME types.
- **tmp**: A library for creating temporary files and directories.
- **path**: Node.js's path module for working with file paths.

      const request = require("supertest");
      const chai = require("chai");
      const chaiHttp = require("chai-http");
      const fs = require("fs");
      const mime = require("mime");
      const tmp = require("tmp");
      const path = require("path");

#### 1. Uploading a File

- Test Description: This test ensures that files can be uploaded successfully through the API.
- Test Steps:
  1. Generate a temporary file with random content.
  2. Attach the file to the API request.
  3. Verify that the API returns a status code of 200.
- Expected Outcome: The file should be uploaded successfully.

  it("should upload a file", (done) => {
  tmp.file((error, filePath) => {
  if (error) {
  return done(err);
  }

        const temporyFilePath = filePath + ".txt";
        const parts = temporyFilePath.split("/");
        const temporaryFileName = parts[parts.length - 1];

        const fileName = temporaryFileName.replace("tmp", "testfile");

        const originalFilePath = path.join("FOLDER", fileName);

        const randomContent = "This is random content.";

        fs.writeFileSync(originalFilePath, randomContent);
        request(app) .post("/files")  .attach("file", originalFilePath)  .expect(200)  .end((error, res) => {
                if (error) {
                    return done(error);
                }
                publicKey = fileName;
                privateKey = fileName;
                console.log(fileName);
                done();
            });
        });

  });

#### 2. Downloading a File

- Test Description: This test checks the ability to download a file by its public key.
- Test Steps:
  1. Send an HTTP GET request to the API with the public key of the file to download.
  2. Verify that the API returns a status code of 200 and the correct MIME type.
- Expected Outcome: The file should be successfully downloaded with the correct MIME type.

  it("should download a file", (done) => {
  request(app).get(`/files/${publicKey}`) .expect(200) .end((error, res) => {
  if (error) {
  return done(error);
  }
  const fileExtension = path.extname(publicKey).slice(1);
  const mimeType = mime.getType(fileExtension);
  expect(res.headers["content-type"]).to.equal(mimeType);
  done();
  });
  });

#### 3. Deleting a File

- Test Description: This test verifies the ability to delete a file by its private key.
- Test Steps:
  1. Send an HTTP DELETE request to the API with the private key of the file to delete.
  2. Verify that the API returns a status code of 200.
- Expected Outcome: The file should be deleted successfully.

  it("should delete a file", (done) => {
  request(app) .delete(`/files/${privateKey}`) .expect(200) .end((error) => {
  if (error) {
  return done(error);
  }
  done();
  });
  });

## Unit Testing

Unit testing focuses on testing individual functions and components of the API in isolation. In this case, we will test the controller functions responsible for handling file operations.

### Controller Functions

#### uploadResponse

- Test Description: This unit test checks the behavior of the `uploadResponse` function, which handles file upload requests.
- Test Scenarios:
  1. Test that the function returns a JSON response with public and private keys when a file is uploaded.
  2. Test that the function returns a 400 status with an error message if no file is uploaded.
- Expected Outcomes:

  1.  The function should return a JSON response with keys when a file is uploaded.
  2.  The function should return a 400 status with an error message if no file is uploaded.

      describe("uploadResponse", () => {
      it("should retrun a JSON response with public and private keys", async () => {
      const req = {
      file: {
      filename: "testfile.txt", //"testfile.txt" is the demo file name for testing
      },
      };
      const res = {
      json: (data) => {
      expect(data).to.deep.equal({
      "public key": "testfile.txt",
      "private key": "testfile.txt",
      });
      },
      status: (statusCode) => {
      expect(statusCode).to.equal(200);
      return res;
      },
      };
      await uploadResponse(req, res);
      });

      it("should return a 400 status with an error message if no file is uploaded", async () => {
      const req = {};
      const res = {
      json: (data) => {
      expect(data).to.deep.equal({ error: "No file uploaded" });
      },
      status: (statusCode) => {
      expect(statusCode).to.equal(400);
      return res;
      },
      };
      await uploadResponse(req, res);

      });

  });

#### getResponse

- Test Description: This unit test examines the behavior of the `getResponse` function, which handles file download requests.
- Test Scenarios:
  1. Test that the function returns the file content with the correct MIME type.
  2. Test that the function returns a 404 status with an error message if the file does not exist.
- Expected Outcomes:

  1.  The function should return the file content with the correct MIME type.
  2.  The function should return a 404 status with an error message if the file does not exist.

  describe("getResponse", () => {
  it("should return the file content with the correct MIME type", async () => {
  const req = {
  params: {
  publicKey: "testfile.txt",
  },
  };
  const res = chai.request(server);

        const response = await res.get(`/files/${req.params.publicKey}`);

         expect(response).to.have.status(200);

        const fileExtension = path.extname(req.params.publicKey).slice(1);
            const mimeType = mime.getType(fileExtension);

            expect(response).to.have.header("Content-Type", mimeType);
        });

        it("should return a 404 status with an error message if the file does not exist", async () => {
            const req = {
                params: {
                    publicKey: "nonexistentfile.txt",
                },
            };
            const res = chai.request(server);

            const response = await res.get(`/files/${req.params.publicKey}`);

            expect(response).to.have.status(404);
            expect(response.body).to.deep.equal({
                error: `The file ${req.params.publicKey} does not exist`,
            });
        });

  });

#### deleteResponse

- Test Description: This unit test evaluates the behavior of the `deleteResponse` function, which handles file deletion requests.
- Test Scenarios:
  1. Test that the function returns a 200 status with a success message on successful deletion.
  2. Test that the function returns a 404 status with an error message if the file does not exist.
- Expected Outcomes:

  1.  The function should return a 200 status with a success message on successful deletion.
  2.  The function should return a 404 status with an error message if the file does not exist.

  describe("deleteResponse", () => {
  it("should return a 200 status with a success message on successful deletion", async () => {
  const req = {
  params: {
  privateKey: "testfile.txt",
  },
  };
  const res = chai.request(server);

            const response = await res.delete(`/files/${req.params.privateKey}`);

            expect(response).to.have.status(200);
            expect(response.body).to.deep.equal({
               error: "File deleted successfully",
            });
        });

        it("should return a 404 status with an error message if the file does not exist", async () => {
            const req = {
                params: {
                    privateKey: "nonexistentfile.txt",
                },
            };
            const res = chai.request(server); // Assuming you have an Express app

            const response = await res.delete(`/files/${req.params.privateKey}`);

            expect(response).to.have.status(404);
            expect(response.body).to.deep.equal({
                error: `The file ${req.params.privateKey} does not exist`,
            });
        });

  });

## Conclusion

This documentation outlines the integration and unit testing procedures for the file management API. Integration tests ensure that the API functions correctly as a whole, while unit tests verify the behavior of individual components and controller functions. A successful testing process helps ensure the reliability and functionality of the API.
