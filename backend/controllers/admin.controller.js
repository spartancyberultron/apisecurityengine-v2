const asyncHandler = require('express-async-handler');
const path = require("path")
const fs = require("fs")
const { generateToken } = require('../utils/generateToken');
const ApiEndpoint = require("../models/apiendpoint.model")
const ApiCollection = require("../models/apicollection.model")
const ActiveScanVulnerability = require("../models/activescanvulnerability.model")
const ActiveScan = require("../models/activescan.model")
const Organization = require("../models/organization.model")


const { User } = require('../models/user.model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function generateClientId() {
    return crypto.randomBytes(16).toString('hex'); // Generate a random 32-character hex string
}

function generateClientSecret() {
    return crypto.randomBytes(32).toString('hex'); // Generate a random 64-character hex string
}

// Controller function to add a new user
module.exports.addUser = asyncHandler(async (req, res) => {

    const { firstName, lastName, userName, email, phoneNumber, password, organizationName, logoURL,companyURL } = req.body;

    const userWithEmail = await User.findOne({ email });

    if (userWithEmail) {
        return res.status(400).json({ error: 'This email is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Encrypt the password using bcrypt
    const user = new User({
        firstName,
        lastName,
        userName,
        email,
        phoneNumber,
        userType: 'user',
        status: 'active',
        password: hashedPassword, // Save the hashed password
    });

    const organization = new Organization({
        name: organizationName,
        primaryUser: user._id,
        logoURL: logoURL,  // Set the logo URL
        companyURL: companyURL,  // Set the logo URL
    });
    
    // Check if clientId and clientSecret are present
    if (!organization.clientId || !organization.clientSecret) {
        
        organization.clientId = generateClientId();
        organization.clientSecret = generateClientSecret();
    }
    
    // Assign the organization ID to the user
    user.organization = organization._id;
    
    // Save the organization
    await organization.save();
    await user.save();

    res.status(201).json(user);
});



// Controller function to update a user
module.exports.updateUser = asyncHandler(async (req, res) => {

    const { id, firstName, lastName, email, password, organizationName, logoURL, companyURL } = req.body;

    let user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    const userWithEmail = await User.findOne({ email });
    if (userWithEmail && userWithEmail.id !== id) {
        return res.status(400).json({ error: 'This email is already taken' });
    }

    if (password) {
        user.password = await bcrypt.hash(password, 10); // Encrypt the password using bcrypt
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;

    const organization = await Organization.findById(user.organization);

    if (organization) {
        organization.name = organizationName;
        organization.logoURL = logoURL;
        organization.companyURL = companyURL;

        // Check if clientId and clientSecret are present
        if (!organization.clientId || !organization.clientSecret) {
        
            organization.clientId = generateClientId();
            organization.clientSecret = generateClientSecret();
        }

        await organization.save();
    }

    await user.save();

    res.json(user);
});

// Controller function to load a user
module.exports.loadUser = asyncHandler(async (req, res) => {

    const { id } = req.body;   
    
    console.log('id:',id)

    const user = await User.findById(id).populate('organization');

    console.log('user:',user)
  
    res.json(user);

});



// Controller function to delete a user
module.exports.deleteUser = asyncHandler(async (req, res) => {

    try {
        const { id } = req.body;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json({ message: 'User deleted successfully.' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete the user.' });
    }
});


// Controller function to list all users
module.exports.listAllUsers = asyncHandler(async (req, res) => {


   // try {
        const users = await User.find().populate('organization');
        res.json(users);
    //} catch (error) {
        //res.status(500).json({ error: error });
    //}
});

// Admin login 
module.exports.adminLogin = asyncHandler(async (req, res) => {

    return res.send("hello")
});


// Get admin settings
module.exports.getAdminSettings = asyncHandler(async (req, res) => {


});




// Update admin settings
module.exports.updateAdminSettings = asyncHandler(async (req, res) => {


});




module.exports.clearAllAPICollections = asyncHandler(async (req, res) => {

        await ApiCollection.deleteMany({});

        res.status(200).json({ success: true, message: 'All APICollection records deleted successfully' });

});

module.exports.clearAllAPIEndpoints = asyncHandler(async (req, res) => {

    await ApiEndpoint.deleteMany({});

    res.status(200).json({ success: true, message: 'All ApiEndpoint records deleted successfully' });

});


module.exports.clearAllActiveScans = asyncHandler(async (req, res) => {

        await ActiveScan.deleteMany({});

        res.status(200).json({ success: true, message: 'All ActiveScan records deleted successfully' });

});

module.exports.clearAllActiveScanVulnerabilities = asyncHandler(async (req, res) => {

        await ActiveScanVulnerability.deleteMany({});

        res.status(200).json({ success: true, message: 'All ActiveScanVulnerability records deleted successfully' });

});





