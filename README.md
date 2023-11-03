# File_Sharing_API


********API Documentation for File_Sharing_API Application********


MY Node.js application is a basic API server built using Express.js. It provides endpoints for uploading files, retrieving a list of files, and deleting files. Additionally, it includes a scheduled task using node-cron for file cleanup.

******Application Structure******

**My application consists of the following components:**

****External Modules:**** I have imported external modules such as **body-parser, express, dotenv, http, and node-cron** to build and enhance my API.

****Internal Modules:**** I've organized your application into separate modules for different functionality, including **postRoute, getRoute, deleteRoute, and fileCleanupCheck**. These modules are used for handling specific **routes** and **tasks**.

****Express Application Setup:**** I initialize your **Express** application by creating an instance of it and setting up necessary **middleware**.

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


**postRoute endpoint description**

The postRoute is an Express.js router designed to handle POST requests for uploading files. This route is part of a larger application and includes various modules and middleware for managing file uploads and network rate limiting.

**Dependencies**

**External Modules**

**express**: The Express.js framework for building web applications.
**randomstring**: A module used for generating random strings.
**multer**: A middleware for handling file uploads.

**Internal Modules**

**storage**: A custom middleware for handling file storage, presumably for configuring where uploaded files are stored.

**uploadLimiter**: A custom middleware for rate limiting incoming requests, to prevent network abuse.

**uploadResponse**: A controller responsible for handling the file upload process.


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


