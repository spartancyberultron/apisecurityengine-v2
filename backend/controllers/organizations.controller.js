const asyncHandler = require('express-async-handler');

const Organization = require("../models/organization.model");

const { User } = require('../models/user.model');

const Ticket = require("../models/ticket.model");
const TicketUpdate = require("../models/ticketupdate.model");

const Team = require("../models/team.model");
const Workspace = require("../models/workspace.model");
const OrgProject = require("../models/orgproject.model");

const path = require('path');

// Get organization details
module.exports.getOrganizationDetails = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id).populate('organization');

    const organization = await Organization.findById(user.organization._id).lean();

    const teams = await Team.find({ organization: organization._id });
    const workspaces = await Workspace.find({ organization: organization._id });
    const projects = await OrgProject.find({ organization: organization._id });
    const users = await User.find({ organization: organization._id });

    organization.teams = teams;
    organization.workspaces = workspaces;
    organization.projects = projects;
    organization.users = users;

    res.status(200).json({ success: true, organization });
});


// Edit an organization
module.exports.editOrganization = asyncHandler(async (req, res) => {

    try {

        const { name } = req.body;

        const user = await User.findById(req.user._id).populate('organization');
        const organization = await Organization.findById(user.organization._id)

        organization.name = name;

        // Save the new record to the database
        await organization.save();


        res.status(200).json({ success: true, organization });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


});


// Get teams
module.exports.getTeams = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id).populate('organization');

    const teams = await Team.find({ organization: user.organization._id })
  .populate({
    path: 'users', // The field in the Team schema that references User documents
    select: 'firstName lastName email' // Optional: specify which fields to return
  });

    res.status(200).json({ success: true, teams });
});


// Add a team
module.exports.addTeam = asyncHandler(async (req, res) => {

    try {

        const { name } = req.body;

        const user = await User.findById(req.user._id).populate('organization');
        const organization = await Organization.findById(user.organization._id)

        // Create a new Team record
        const newTeam = new Team({
            name: name,
            organization: organization._id
        });

        // Save the new record to the database
        await newTeam.save();


        res.status(200).json({ success: true, newTeam });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


});

// Edit a team
module.exports.editTeam = asyncHandler(async (req, res) => {

    try {

        const { id, name, users } = req.body;

        const team = await Team.findById(id);
        team.name = name;
        team.users = users;
        team.save();

        res.status(200).json({ success: true, team });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


});


// Delete a team
module.exports.deleteTeam = asyncHandler(async (req, res) => {

    try {

        const { id } = req.body;

        const team = await Team.findById(id);
        team.deleteOne();

        res.status(200).json({ success: true, message: 'deleted' });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }

});





// Get workspaces
module.exports.getWorkspaces = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id).populate('organization');

    const workspaces = await Workspace.find({ organization: user.organization._id })
    .populate({
        path: 'teams', 
        select: 'name' 
      });



    res.status(200).json({ success: true, workspaces });
});


// Add a workspace
module.exports.addWorkspace = asyncHandler(async (req, res) => {

    try {

        const { name } = req.body;

        const user = await User.findById(req.user._id).populate('organization');
        const organization = await Organization.findById(user.organization._id)

        // Create a new Workspace record
        const newWorkspace = new Workspace({
            name: name,
            organization: organization._id
        });

        // Save the new record to the database
        await newWorkspace.save();


        res.status(200).json({ success: true, newWorkspace });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


});

// Edit a workspace
module.exports.editWorkspace = asyncHandler(async (req, res) => {

    try {

        const { id, name, teams } = req.body;

        const workspace = await Workspace.findById(id);
        workspace.name = name;
        workspace.teams = teams;
        workspace.save();

        res.status(200).json({ success: true, workspace });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


});


// Delete a workspace
module.exports.deleteWorkspace= asyncHandler(async (req, res) => {

    try {

        const { id } = req.body;

        const workspace = await Workspace.findById(id);
        workspace.deleteOne();

        res.status(200).json({ success: true, message: 'deleted' });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }

});


// Get projects
module.exports.getProjects = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id).populate('organization');

    const projects = await OrgProject.find({ organization: user.organization._id }).populate('workspace') 


    res.status(200).json({ success: true, projects });
});


// Add a project
module.exports.addProject = asyncHandler(async (req, res) => {

    try {

        const { name, workspace } = req.body;

        const user = await User.findById(req.user._id).populate('organization');
        const organization = await Organization.findById(user.organization._id)

        // Create a new OrgProject record
        const newProject = new OrgProject({
            name: name,
            organization: organization._id,
            workspace:workspace,
        });

        // Save the new record to the database
        await newProject.save();


        res.status(200).json({ success: true, newProject });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


});

// Edit a project
module.exports.editProject = asyncHandler(async (req, res) => {

    try {

        const { id, name, workspace } = req.body;

        const project = await OrgProject.findById(id);
        project.name = name;
        project.workspace = workspace;
        project.save();

        res.status(200).json({ success: true, project });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


});


// Delete a project
module.exports.deleteProject= asyncHandler(async (req, res) => {

    try {

        const { id } = req.body;

        const project = await OrgProject.findById(id);
        project.deleteOne();

        res.status(200).json({ success: true, message: 'deleted' });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }

});




// Get organization users
module.exports.getOrganizationUsers = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id).populate('organization');

    const users = await User.find({ organization: user.organization._id });

    res.status(200).json({ success: true, users });
});



/**Tickets **/

// Get tickets
module.exports.getTickets = asyncHandler(async (req, res) => {
    
    try {
        // Find the user and populate the organization field
        const user = await User.findById(req.user._id).populate('organization');

        // Fetch the latest 100 tickets for the user's organization
        const tickets = await Ticket.find({ organization: user.organization._id })
            .populate('openedBy')
            .populate('assignedTo')
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .limit(100); // Limit to 100 tickets

        // Return the tickets
        res.status(200).json({ success: true, tickets });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});



// Add a ticket
module.exports.addTicket = asyncHandler(async (req, res) => {

    try {

        const { title, description, assignedTo, status, category, priority, note } = req.body;

        const currentUser = await User.findById(req.user._id);

        const user = await User.findById(req.user._id).populate('organization');
        const organization = await Organization.findById(user.organization._id)

        const highestTicket = await Ticket.findOne().sort({ ticketId: -1 }).exec();

        let highestTicketId;
        let newTicketId;

        if(highestTicket){
            highestTicketId = highestTicket.ticketId;
            newTicketId = highestTicketId + 1;
        }else{
            newTicketId = 1;
        }

        

            console.log('highestTicket:', highestTicket);
            console.log('highestTicketId:', highestTicketId);
            console.log('newTicketId:', newTicketId);

        // Create a new ticket record
        const newTicket = new Ticket({
            title: title,
            description: description,
            assignedTo: assignedTo,
            openedBy:currentUser._id,
            status: status,
            category:category,
            priority:priority,
            note:note,
            ticketId:newTicketId,
            organization: organization._id,
            attachments: req.files.map(file => path.join('./ticket-attachments/', file.filename)),
        });

        // Save the new record to the database
        await newTicket.save();


        res.status(200).json({ success: true, newTicket });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


});


// Add a ticket update
module.exports.addTicketUpdate = asyncHandler(async (req, res) => {

    try {

        const { ticketId, updateText, assignedTo, status } = req.body;

        const currentUser = await User.findById(req.user._id);

        const user = await User.findById(req.user._id).populate('organization');
        const organization = await Organization.findById(user.organization._id)

        const ticket = await Ticket.findById(ticketId)

        ticket.status = status;
        ticket.save();

        // Create a new ticket update record
        const newTicketUpdate = new TicketUpdate({
            updateText: updateText,
            assignedTo: assignedTo,
            updatedBy:currentUser._id,
            status: status,
            ticket: ticketId,
            attachments: req.files.map(file => path.join('./ticket-update-attachments/', file.filename)),
        });

        // Save the new record to the database
        await newTicketUpdate.save();

        const updatedTicket = await Ticket.findById(ticketId).lean();
        const ticketUpdates = await TicketUpdate.find({ticket:ticketId}).lean();
        updatedTicket.ticketUpdates = ticketUpdates;

        res.status(200).json({ success: true, ticket:updatedTicket });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


});


// Edit a ticket
module.exports.editTicket = asyncHandler(async (req, res) => {

   try {

        const { id, title, description, assignedTo, status, category, priority, note } = req.body;

console.log('body:', req.body);

        const currentUser = await User.findById(req.user._id);

        const user = await User.findById(req.user._id).populate('organization');
        const organization = await Organization.findById(user.organization._id)

       // const highestTicket = await Ticket.findOne().sort({ ticketId: -1 }).exec();
      //var highestTicketId = highestTicket.ticketId;
       // var newTicketId = highestTicketId + 1;

         //   console.log('highestTicket:', highestTicket);
          //  console.log('highestTicketId:', highestTicketId);
           // console.log('newTicketId:', newTicketId);

const ticket = await Ticket.findById(id);

           ticket.title = title;
           ticket.description = description;
           ticket.assignedTo = assignedTo;
           ticket.status = status;
           ticket.category = category;
           ticket.priority = priority;
           ticket.note = note;
//         ticket.save();

        // Create a new ticket record
  /*      const newTicket = new Ticket({
            title: title,
            description: description,
            assignedTo: assignedTo,
            openedBy:currentUser._id,
            status: status,
            category:category,
            priority:priority,
            note:note,
           // ticketId:newTicketId,
            organization: organization._id,
            attachments: req.files.map(file => path.join('./ticket-attachments/', file.filename)),
        });  */

        // Save the new record to the database
        await ticket.save();


        res.status(200).json({ success: true, ticket });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }

});


// Delete a ticket
module.exports.deleteTicket = asyncHandler(async (req, res) => {

    try {

        const { id } = req.body;

        const ticket = await Ticket.findById(id);
        ticket.deleteOne();

        res.status(200).json({ success: true, message: 'deleted' });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }

});


// Get tikcet details
module.exports.getTicketDetails = asyncHandler(async (req, res) => {

    try {

        // Assuming you are using Mongoose and have a Ticket model
        const id = req.params.id;

        // Fetch ticket details from the database
        const ticket = await Ticket.findById(id);

        if (!ticket) {
            // If ticket is not found, return a 404 Not Found response
            return res.status(404).json({ success: false, error: 'Ticket not found' });
        }

        // Return the ticket details
        res.status(200).json({ success: true, data: ticket });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


});


// Delete a user
module.exports.deleteUser = asyncHandler(async (req, res) => {

    try {

        const { id } = req.body;

        const user = await User.findById(id);
        user.deleteOne();

        res.status(200).json({ success: true, message: 'deleted' });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }

});



// Add user
module.exports.addUser = asyncHandler(async (req, res) => {

    try {

        const { firstName,
            lastName,
            email,
            phoneNumber,
            businessUnit,
            userType,
            location, status } = req.body;

        const user = await User.findById(req.user._id).populate('organization');
        const organization = await Organization.findById(user.organization._id)

        const emailTakenUser = await User.find({ email: email });
        if (emailTakenUser.length > 0) {
            res.status(200).json({ success: false, message: "This email is already taken" });
        } else {

            // Create a new user record
            const newUser = new User({
                firstName: firstName,
                lastName: lastName,
                email: email,
                phoneNumber: phoneNumber,
                businessUnit: businessUnit,
                userType: userType,
                location: location,
                organization: organization._id,
                status:status
            });

            // Save the new record to the database
            await newUser.save();


            res.status(200).json({ success: true, newUser });
        }

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


});

// Edit user
module.exports.editUser = asyncHandler(async (req, res) => {

    try {

        const { userId, firstName,
            lastName,
            email,
            phoneNumber,
            businessUnit,
            userType,
            location, status } = req.body;

        const user = await User.findById(userId);

        const emailTakenUser = await User.find({ email: email });

        if (emailTakenUser.length > 0 && email !== user.email) {
            res.status(200).json({ success: false, message: "This email is already taken" });
        } else {

            user.firstName = firstName;
            user.lastName = lastName;
            user.email = email;
            user.phoneNumber = phoneNumber;
            user.businessUnit = businessUnit;
            user.userType = userType;
            user.location = location;
            user.status = status;
            user.save();

            res.status(200).json({ success: true, user });
        }


    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


});

// Get user details
module.exports.getUserDetails = asyncHandler(async (req, res) => {

    try {

        // Assuming you are using Mongoose and have a User model
        const id = req.params.id;

        // Fetch user details from the database
        const user = await User.findById(id);

        if (!user) {
            // If user is not found, return a 404 Not Found response
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Return the user details
        res.status(200).json({ success: true, data: user });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


});


// Get team details
module.exports.getTeamDetails = asyncHandler(async (req, res) => {

    try {

        const id = req.params.id;

        // Fetch team details from the database
        const team = await Team.findById(id);

        if (!team) {
            // If team is not found, return a 404 Not Found response
            return res.status(404).json({ success: false, error: 'Team not found' });
        }

        // Return the team details
        res.status(200).json({ success: true, data: team });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


});


// Get workspace details
module.exports.getWorkspaceDetails = asyncHandler(async (req, res) => {

    try {

        const id = req.params.id;

        // Fetch workspace details from the database
        const workspace = await Workspace.findById(id);

        if (!workspace) {

            // If workspace is not found, return a 404 Not Found response
            return res.status(404).json({ success: false, error: 'Workspace not found' });
        }

        // Return the workspace details
        res.status(200).json({ success: true, data: workspace });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


});


// Get project details
module.exports.getProjectDetails = asyncHandler(async (req, res) => {

    try {

        const id = req.params.id;

        // Fetch project details from the database
        const project = await OrgProject.findById(id).populate('workspace');

        if (!project) {

            // If project is not found, return a 404 Not Found response
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Return the project details
        res.status(200).json({ success: true, data: project });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


});




// Get ticket details
module.exports.getTicketDetails = asyncHandler(async (req, res) => {

    try {

        const id = req.params.id;

        // Fetch ticket details from the database
        const ticket = await Ticket.findById(id).populate('assignedTo').lean();

        const ticketUpdates = await TicketUpdate.find({ticket:ticket._id}).populate('updatedBy');
        ticket.ticketUpdates = ticketUpdates;

        if (!ticket) {
            return res.status(404).json({ success: false, error: 'Ticket not found' });
        }

        // Return the asset group details
        res.status(200).json({ success: true, ticket: ticket });

    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


});


// Save organization settings
module.exports.saveOrganizationSettings = asyncHandler(async (req, res) => {

    const { settings, piiSettings } = req.body;

    const org = await Organization.findOne({ primaryUser: req.user._id });
    const orgId = org._id;

    console.log('orgId:', orgId);

    console.log('piiSettings:',piiSettings)

    try {
        // Update the organization settings
       /* const updatedOrganization = await Organization.findByIdAndUpdate(
            orgId,
            {
                $set: {
                    'vulnSeverityAndPriority': Object.entries(settings).map(([key, { vulnId, severity, priority }]) => ({
                        vulnId: Number(vulnId), // Ensure this is a Number as per schema
                        severity,
                        priority,
                    })),
                    'piiField': piiSettings.map(piiField => ({
                        piiField,
                        enabled: true
                    }))
                },
            },
            { new: true, runValidators: true }
        ); */

        const updatedOrganization = await Organization.findByIdAndUpdate(
            orgId,
            {
              $set: {
                'vulnSeverityAndPriority': Object.entries(settings).map(([key, { vulnId, severity, priority }]) => ({
                  vulnId: Number(vulnId), // Ensure this is a Number as per schema
                  severity,
                  priority,
                })),
                'piiField': piiSettings.map(piiField => ({
                  piiField: piiField.piiField, // Assuming this is the correct field name
                  enabled: piiField.enabled // Ensure this is a Boolean
                }))
              }
            },
            { new: true, runValidators: true }
          );

        // Check if organization was found
        if (!updatedOrganization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        // Send the updated organization data as response
        res.status(200).json(updatedOrganization);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
