# File_Sharing_API


**API Documentation for File_Sharing_API Application**

**Overview**

MY Node.js application is a basic API server built using Express.js. It provides endpoints for uploading files, retrieving a list of files, and deleting files. Additionally, it includes a scheduled task using node-cron for file cleanup.

**Application Structure**

Your application consists of the following components:

**External Modules:** I have imported external modules such as body-parser, express, dotenv, http, and node-cron to build and enhance your API.

**Internal Modules:** I've organized your application into separate modules for different functionality, including postRoute, getRoute, deleteRoute, and fileCleanupCheck. These modules are used for handling specific routes and tasks.

**Express Application Setup:** I initialize your Express application by creating an instance of it and setting up necessary middleware.

**API Endpoints**

I have defined three main API endpoints:

**Upload a File (POST /files):** This endpoint allows clients to upload files. The uploaded files are processed by the postRoute module.

**Retrieve a List of Files (GET /files): C**lients can access this endpoint to fetch a list of files. The getRoute module handles this functionality.

**Delete a File (DELETE /files):** This endpoint enables clients to delete files. The deleteRoute module is responsible for handling file deletions.

**Middleware**

I've configured middleware to enhance your API's functionality:

**JSON and URL Encoding:** I use the express.json() middleware to parse JSON request bodies and bodyParser.urlencoded() middleware to handle URL-encoded data in requests.
Scheduled Task
I have implemented a scheduled task using node-cron. This task runs at midnight (00:00) every day and is responsible for cleaning up files that have been inactive for seven days. The fileCleanupCheck function handles this task.

**Deployment**

The application listens on a port specified in your environment variables (retrieved using process.env.PORT). This is where clients can connect to access your API.
