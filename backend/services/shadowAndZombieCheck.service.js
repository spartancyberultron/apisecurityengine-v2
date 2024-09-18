const TrafficProjectEndpoint = require('../models/trafficprojectendpoint.model');

async function shadowAndZombieCheck(newEndpoint) {

    let status = '---';
    const currentDate = new Date();

    try {
        // Get project-wide statistics
        const projectStats = await TrafficProjectEndpoint.aggregate([
            { $match: { project: newEndpoint.project } },
            { 
                $group: {
                    _id: null,
                    avgVulnCount: { $avg: "$vulnCount" },
                    totalEndpoints: { $sum: 1 },
                    recentActiveEndpoints: { 
                        $sum: { 
                            $cond: [
                                { $gte: [{ $toDate: "$lastActive" }, new Date(currentDate - 30 * 24 * 60 * 60 * 1000)] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        if (projectStats.length === 0) {
            // If this is the first endpoint in the project, we can't determine much
            return 'New API';
        }

        const { avgVulnCount, totalEndpoints, recentActiveEndpoints } = projectStats[0];
        const projectActivityRate = recentActiveEndpoints / totalEndpoints;

        // Check if this endpoint has been detected before
        const existingEndpoint = await TrafficProjectEndpoint.findOne({
            url: newEndpoint.url,
            method: newEndpoint.method,
            project: newEndpoint.project
        });

        if (existingEndpoint) {
            
            // This is an existing endpoint, check for zombie characteristics
            const lastActiveDate = new Date(existingEndpoint.lastActive);
            const daysSinceLastActive = (currentDate - lastActiveDate) / (1000 * 60 * 60 * 24);

            if (daysSinceLastActive > 60 && projectActivityRate > 0.5) {

                // If the endpoint hasn't been active for a long time, but the project is generally active
                status = 'Zombie';
            } else if (daysSinceLastActive > 30 && existingEndpoint.vulnCount > avgVulnCount) {

                // If the endpoint is less active than others and has above-average vulnerabilities
                status = 'Potential Zombie';
            }
        } else {
            // This is a new endpoint, check for shadow characteristics
            if (newEndpoint.isAuthenticated === 'false' && projectActivityRate > 0.7) {

                // If it's an unauthenticated endpoint in a highly active project
                status = 'Potential Shadow';
            } else if (newEndpoint.vulnCount > avgVulnCount * 1.5) {

                // If it has significantly more vulnerabilities than the project average
                status = 'Potential Shadow';
            } else {
                status = 'New API';
            }
        }

        // Update the endpoint in the database
        await TrafficProjectEndpoint.findByIdAndUpdate(newEndpoint._id, { shadowOrZombie: status });

        return status;
    } catch (error) {
        console.error('Error in shadowAndZombieCheck:', error);
        throw error;
    }
}

module.exports = {
    shadowAndZombieCheck
};