const request = require("supertest");
const app = require("../../app");
const chai = require("chai");
const expect = chai.expect;
const fs = require("fs");
const mime = require("mime");
const tmp = require("tmp");
const path = require("path");

describe("File API Integration Tests", () => {
  let publicKey;
  let privateKey;

  it("should upload a file", (done) => {
    const filePath = path.join(__dirname, "../..", "FOLDER");

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
