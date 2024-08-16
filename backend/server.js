const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const { connectDB } = require('./config/db');
const adminRoutesV1 = require("./routes/v1/admin.route")
const userRoutesV1 = require("./routes/v1/user.route")
const activeScanRoutesV1 = require("./routes/v1/activeScans.route")
const mirroredScanRoutesV1 = require("./routes/v1/mirroredScans.route")

const llmScanRoutesV1 = require("./routes/v1/llmScans.route")
const sbomScanRoutesV1 = require("./routes/v1/sbomScans.route")
const soapOrGraphQLScanRoutesV1 = require("./routes/v1/soapOrGraphQLScans.route")
const inventoryRoutesV1 = require("./routes/v1/inventory.route")
const complianceMonitoringRoutesV1 = require("./routes/v1/complianceMonitoring.route")
const organizationsRoutesV1 = require("./routes/v1/organizations.route")
const attackSurfaceScanRoutesV1 = require("./routes/v1/attackSurfaceScans.route")


const rateLimit = require('express-rate-limit');
const fs = require("fs")
const path = require("path")
const { exec } = require("child_process")
const limiter = rateLimit({
	windowMs: 30 * 1000, // 30 seconds
	max: 10000, // Limit each IP to 100 requests per `window` (here, per 30 seconds)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
const folderPath = path.join(__dirname, "uploads")
fs.chmod(folderPath, 0o700, (err) => {
	if (err) {
		console.error(err);
		return;
	}
})

const { notFoundError, errorHandler } = require('./middlewares/errorHandlerMiddleware');
const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

dotenv.config();

connectDB();

app.use(express.json());

app.use(limiter)

app.use(cors());
app.options('*', cors());

app.get('/', (req, res) => {
	res.send('Server is running....');
});

app.use('/api/v1/admin/', adminRoutesV1);
app.use('/api/v1/users/', userRoutesV1);
app.use('/api/v1/activeScans/', activeScanRoutesV1)
app.use('/api/v1/mirroredScans/', mirroredScanRoutesV1)
app.use('/api/v1/llmScans/', llmScanRoutesV1)
app.use('/api/v1/sbomScans/', sbomScanRoutesV1)
app.use('/api/v1/soapOrGraphQLScans/', soapOrGraphQLScanRoutesV1)
app.use('/api/v1/inventory/', inventoryRoutesV1)
app.use('/api/v1/complianceMonitoring/', complianceMonitoringRoutesV1)
app.use('/api/v1/organizations/', organizationsRoutesV1)
app.use('/api/v1/attackSurfaceScans/', attackSurfaceScanRoutesV1)


app.use(notFoundError);
app.use(errorHandler);



const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on Port ${PORT}`.green.bold));