const multer = require('multer');
const fs = require('fs');

const path = require('path');

// Multer config
module.exports = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './backend_public-data');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

// define storage engine
module.exports.jsonupload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      let destFolder;

      switch (file.mimetype) {
        case 'application/json':
          destFolder = './uploads/postman-collections';
        case 'application/yml':
          destFolder = './uploads/postman-collections';
          break;
        default:
          destFolder = './uploads/postman-collections';
          break;
      }
      cb(null, destFolder);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  })
})


module.exports.sbomUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      let destFolder;

      switch (file.mimetype) {
        case 'application/json':
          destFolder = './uploads/sbom-files';
        case 'application/yml':
          destFolder = './uploads/sbom-files';
          break;
        default:
          destFolder = './uploads/sbom-files';
          break;
      }
      cb(null, destFolder);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  })
})


module.exports.soapGraphQLUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      let destFolder;

      switch (file.mimetype) {
        case 'application/json':
          destFolder = './uploads/soap-and-graphql-files';
        case 'application/yml':
          destFolder = './uploads/soap-and-graphql-files';
          break;
        default:
          destFolder = './uploads/soap-and-graphql-files';
          break;
      }
      cb(null, destFolder);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  })
})


module.exports.upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './uploads');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});


module.exports.uploadTicketAttachments = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {      
      callback(null, './uploads/ticket-attachments');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});


module.exports.uploadTicketUpdateAttachments = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {      
      callback(null, './uploads/ticket-update-attachments');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

