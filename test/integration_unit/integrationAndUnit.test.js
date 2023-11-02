// external module
const request = require("supertest");
const chai = require("chai");
const chaiHttp = require("chai-http");
const fs = require("fs");
const mime = require("mime");
const tmp = require("tmp");
const path = require("path");

//internal module
const app = require("../../app");
const uploadResponse = require("../../controllers/postController");
const multer = require("multer");

const expect = chai.expect;
chai.use(chaiHttp);
const server = app.listen();
const uploadFolder = path.join(__dirname, "../..", "FOLDER");

//integration test
describe("File API Integration Tests", () => {
  let publicKey;
  let privateKey;

  it("should upload a file", (done) => {
    //filepath ekhane chilo

    tmp.file((error, filePath) => {
      if (error) {
        return done(err);
      }

      const fileName = filePath + ".txt";
      const randomContent = "This is random content.";
      fs.writeFileSync(fileName, randomContent);
      request(app)
        .post("/files")
        .attach("file", fileName)
        .expect(200)
        .end((error, res) => {
          if (error) {
            return done(error);
          }

          const parts = fileName.split("/");
          publicKey = parts[parts.length - 1];
          privateKey = parts[parts.length - 1];
          done();
        });
    });
  });

  it("should download a file", (done) => {
    request(app)
      .get(`/files/${publicKey}`)
      .expect(200)
      .end((error, res) => {
        if (error) {
          return done(error);
        }
        const fileExtension = path.extname(publicKey).slice(1);
        const mimeType = mime.getType(fileExtension);
        expect(res.headers["content-type"]).to.equal(mimeType);
        done();
      });
  });

  it("should delete a file", (done) => {
    request(app)
      .delete(`/files/${privateKey}`)
      .expect(200)
      .end((error) => {
        if (error) {
          return done(error);
        }
        done();
      });
  });
});

//unit test
describe("Controller Functions", () => {
  // For multer configuration
  describe("Multer Configuration", () => {
    it("should configure Multer storage correctly", (done) => {
      const fileName = "testfile.txt";
      const expectedFileName = "test-file.txt";

      const mockFile = {
        originalname: fileName,
      };

      const destinationCallback = (req, file, cb) => {
        expect(file).to.eql(mockFile);
        cb(null, uploadFolder);
      };

      const filenameCallback = (req, file, cb) => {
        expect(file).to.eql(mockFile);
        expect(file.originalname).to.equal(fileName);
        cb(null, expectedFileName);
      };

      const storage = multer.diskStorage({
        destination: destinationCallback,
        filename: filenameCallback,
      });
      //const request = chai.request(server);

      request(server)
        .post("/files")
        .attach("file", path.join(uploadFolder, "testfile.txt"))
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err, " hello");
          }
          expect(res.body["public key"]).to.equal("testfile.txt");
          expect(res.body["private key"]).to.equal("testfile.txt");
          done();
        });
    });
  });

  // For uploadfuntion
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

  //For getFuntion
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

  //For deleteFuntion
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
});
