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
const uploadFolder = path.join(__dirname, "../..", "FOLDER");

const expect = chai.expect;
chai.use(chaiHttp);
const server = app.listen();

//integration test
describe("File API Integration Tests", () => {
  let publicKey;
  let privateKey;

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
      request(app)
        .post("/files")
        .attach("file", originalFilePath)
        .expect(200)
        .end((error, res) => {
          if (error) {
            return done(error);
          }

          publicKey = fileName;
          privateKey = fileName;
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
