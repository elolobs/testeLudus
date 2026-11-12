const db = require('../models'); 


const getUsers = async (req, res) => {
	try {
		const users = await db.User.findAll(); 
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch users' });
	}
};


const getStatistics = async (req, res) => {
	try {
		const userCount = await db.User.count();
		const otherStats = {};
		res.status(200).json({ userCount, ...otherStats });
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch statistics' });
	}
};

module.exports = { getUsers, getStatistics };
