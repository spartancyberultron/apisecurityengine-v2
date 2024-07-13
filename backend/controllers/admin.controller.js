const asyncHandler = require('express-async-handler');
const path = require("path")
const fs = require("fs")
const { generateToken } = require('../utils/generateToken');
const ApiEndpoint = require("../models/apiendpoint.model")
const ApiCollection = require("../models/apicollection.model")
const ActiveScanVulnerability = require("../models/activescanvulnerability.model")
const ActiveScan = require("../models/activescan.model")


const { User } = require('../models/user.model');
const bcrypt = require('bcryptjs');

// Controller function to add a new user
module.exports.addUser = asyncHandler(async (req, res) => {

    const { firstName, lastName, userName, email, phoneNumber, password } = req.body;

    const userWithEmail = await User.findOne({ email: email });

    if (userWithEmail) {
        res.json({ error: 'This email is already taken' });

    } else {


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
        await user.save();
        res.status(201).json(user);
    }

});


// Controller function to update a user
module.exports.updateUser = asyncHandler(async (req, res) => {

    const { id, firstName, lastName, email, password } = req.body;

    let user;

    const userWithEmail = await User.findOne({ email: email });
    const thisUser = await User.findById(id);    

    if (userWithEmail && thisUser.email !== email) {
        res.json({ error: 'This email is already taken' });
    } else {

        if (password !== '') {

            const hashedPassword = await bcrypt.hash(password, 10); // Encrypt the password using bcrypt

            user = await User.findByIdAndUpdate(id, {
                firstName,
                lastName,
                email,
                userType: 'user',
                status: 'active',
                hashedPassword
            }, { new: true });

        } else {

            const hashedPassword = await bcrypt.hash(password, 10); // Encrypt the password using bcrypt


            user = await User.findByIdAndUpdate(id, {
                firstName,
                lastName,
                email,
                userType: 'user',
                status: 'active',
            }, { new: true });

        }


        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json(user);

    }

});

// Controller function to load a user
module.exports.loadUser = asyncHandler(async (req, res) => {

    const { id } = req.body;    

    const user = await User.findById(id);
  
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
        const users = await User.find();
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





