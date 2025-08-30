const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { protect, adminOnly } = require('../middleware/auth');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const subjects = await Subject.find({})
            .populate('branch', 'name code')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: subjects.length,
            data: subjects
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching subjects'
        });
    }
});

// @desc    Get subjects by branch
// @route   GET /api/subjects/branch/:branchId
// @access  Private
router.get('/branch/:branchId', protect, async (req, res) => {
    try {
        const subjects = await Subject.find({ branch: req.params.branchId })
            .populate('branch', 'name code')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: subjects.length,
            data: subjects
        });
    } catch (error) {
        console.error('Error fetching subjects by branch:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching subjects'
        });
    }
});

// @desc    Get specific subject by ID
// @route   GET /api/subjects/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id)
            .populate('branch', 'name code');

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.status(200).json({
            success: true,
            data: subject
        });
    } catch (error) {
        console.error('Error fetching subject:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching subject'
        });
    }
});

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { name, code, branch, credits, description } = req.body;

        // Validate required fields
        if (!name || !code || !branch) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, code, and branch'
            });
        }

        // Check if subject with same code already exists
        const existingSubject = await Subject.findOne({ code: code.toUpperCase() });
        if (existingSubject) {
            return res.status(400).json({
                success: false,
                message: 'Subject with this code already exists'
            });
        }

        const subject = await Subject.create({
            name,
            code: code.toUpperCase(),
            branch,
            credits: credits || 3,
            description
        });

        await subject.populate('branch', 'name code');

        res.status(201).json({
            success: true,
            message: 'Subject created successfully',
            data: subject
        });
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating subject'
        });
    }
});

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { name, code, branch, credits, description } = req.body;

        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Check if new code conflicts with existing subject
        if (code && code.toUpperCase() !== subject.code) {
            const existingSubject = await Subject.findOne({ 
                code: code.toUpperCase(),
                _id: { $ne: req.params.id }
            });
            if (existingSubject) {
                return res.status(400).json({
                    success: false,
                    message: 'Subject with this code already exists'
                });
            }
        }

        // Update fields
        if (name) subject.name = name;
        if (code) subject.code = code.toUpperCase();
        if (branch) subject.branch = branch;
        if (credits !== undefined) subject.credits = credits;
        if (description !== undefined) subject.description = description;

        const updatedSubject = await subject.save();
        await updatedSubject.populate('branch', 'name code');

        res.status(200).json({
            success: true,
            message: 'Subject updated successfully',
            data: updatedSubject
        });
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating subject'
        });
    }
});

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        await Subject.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Subject deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting subject'
        });
    }
});

module.exports = router;
