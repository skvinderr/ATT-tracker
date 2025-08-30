const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');

// @desc    Get all branches
// @route   GET /api/branches
// @access  Public
router.get('/', async (req, res) => {
    try {
        const branches = await Branch.find({}).select('name code description department establishedYear');
        
        res.status(200).json({
            success: true,
            count: branches.length,
            data: branches
        });
    } catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching branches'
        });
    }
});

// @desc    Get branch by ID
// @route   GET /api/branches/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const branch = await Branch.findById(req.params.id);
        
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Branch not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: branch
        });
    } catch (error) {
        console.error('Error fetching branch:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching branch'
        });
    }
});

// @desc    Get branch by code
// @route   GET /api/branches/code/:code
// @access  Public
router.get('/code/:code', async (req, res) => {
    try {
        const branch = await Branch.findOne({ code: req.params.code.toUpperCase() });
        
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Branch not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: branch
        });
    } catch (error) {
        console.error('Error fetching branch by code:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching branch'
        });
    }
});

module.exports = router;
