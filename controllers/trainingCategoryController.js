const TrainingCategory = require('../models/TrainingCategory');

// @desc    Get all training categories
// @route   GET /api/training-categories
// @access  Private
exports.getAllCategories = async (req, res) => {
  try {
    const { active, mandatory } = req.query;
    
    let query = {};
    if (active !== undefined) query.isActive = active === 'true';
    if (mandatory !== undefined) query.isMandatory = mandatory === 'true';

    const categories = await TrainingCategory.find(query)
      .sort({ isMandatory: -1, name: 1 })
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: error.message
    });
  }
};

// @desc    Get single training category
// @route   GET /api/training-categories/:id
// @access  Private
exports.getCategory = async (req, res) => {
  try {
    const category = await TrainingCategory.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Training category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve category',
      error: error.message
    });
  }
};

// @desc    Get category by code
// @route   GET /api/training-categories/code/:code
// @access  Private
exports.getCategoryByCode = async (req, res) => {
  try {
    const category = await TrainingCategory.findOne({ 
      code: req.params.code.toUpperCase() 
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Training category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve category',
      error: error.message
    });
  }
};

// @desc    Create new training category
// @route   POST /api/training-categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    // Add creator ID
    req.body.createdBy = req.user._id;

    const category = await TrainingCategory.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Training category created successfully',
      data: category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this code or name already exists'
      });
    }

    res.status(400).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// @desc    Update training category
// @route   PUT /api/training-categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const category = await TrainingCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Training category not found'
      });
    }

    // Don't allow changing code if it would break references
    if (req.body.code && req.body.code !== category.code) {
      delete req.body.code;
    }

    const updatedCategory = await TrainingCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Training category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

// @desc    Delete training category
// @route   DELETE /api/training-categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await TrainingCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Training category not found'
      });
    }

    // Soft delete by setting isActive to false
    category.isActive = false;
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Training category deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

// @desc    Get mandatory training categories
// @route   GET /api/training-categories/mandatory
// @access  Private
exports.getMandatoryCategories = async (req, res) => {
  try {
    const categories = await TrainingCategory.getMandatoryCategories();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve mandatory categories',
      error: error.message
    });
  }
};

// @desc    Seed predefined training categories
// @route   POST /api/training-categories/seed
// @access  Private/Admin
exports.seedCategories = async (req, res) => {
  try {
    const predefinedCategories = [
      {
        name: 'POSH (Prevention of Sexual Harassment)',
        code: 'POSH',
        description: 'Mandatory training on prevention of sexual harassment at workplace as per Indian law',
        isMandatory: true,
        frequency: 'annual',
        applicableTo: ['all_employees'],
        regulatoryBody: 'Ministry of Women & Child Development, India',
        defaultDuration: 120,
        certificateValidity: 365,
        riskLevel: 'High',
        icon: '🛡️',
        color: '#E74C3C',
        createdBy: req.user._id
      },
      {
        name: 'Phishing Awareness & Email Security',
        code: 'PHISHING',
        description: 'Training on identifying and preventing phishing attacks and email-based threats',
        isMandatory: true,
        frequency: 'quarterly',
        applicableTo: ['all_employees'],
        regulatoryBody: 'CERT-In',
        defaultDuration: 45,
        certificateValidity: 90,
        riskLevel: 'High',
        icon: '🎣',
        color: '#F39C12',
        createdBy: req.user._id
      },
      {
        name: 'HIPAA Compliance',
        code: 'HIPAA',
        description: 'Health Insurance Portability and Accountability Act training for healthcare workers',
        isMandatory: true,
        frequency: 'annual',
        applicableTo: ['healthcare', 'hr'],
        regulatoryBody: 'US Department of Health and Human Services',
        defaultDuration: 90,
        certificateValidity: 365,
        riskLevel: 'High',
        icon: '🏥',
        color: '#3498DB',
        createdBy: req.user._id
      },
      {
        name: 'Cybersecurity Fundamentals',
        code: 'CYBERSEC',
        description: 'Essential cybersecurity practices and awareness for all employees',
        isMandatory: true,
        frequency: 'semi-annual',
        applicableTo: ['all_employees'],
        regulatoryBody: 'ISO 27001',
        defaultDuration: 60,
        certificateValidity: 180,
        riskLevel: 'High',
        icon: '🔒',
        color: '#2C3E50',
        createdBy: req.user._id
      },
      {
        name: 'Data Privacy & GDPR',
        code: 'GDPR',
        description: 'General Data Protection Regulation compliance training',
        isMandatory: true,
        frequency: 'annual',
        applicableTo: ['all_employees', 'it', 'sales', 'hr'],
        regulatoryBody: 'European Union',
        defaultDuration: 75,
        certificateValidity: 365,
        riskLevel: 'High',
        icon: '🔐',
        color: '#9B59B6',
        createdBy: req.user._id
      },
      {
        name: 'Workplace Safety',
        code: 'SAFETY',
        description: 'Occupational health and safety training for workplace environments',
        isMandatory: true,
        frequency: 'annual',
        applicableTo: ['all_employees'],
        regulatoryBody: 'OSHA / Local Labor Department',
        defaultDuration: 90,
        certificateValidity: 365,
        riskLevel: 'High',
        icon: '⚠️',
        color: '#E67E22',
        createdBy: req.user._id
      },
      {
        name: 'Anti-Money Laundering (AML)',
        code: 'AML',
        description: 'Training on detecting and preventing money laundering activities',
        isMandatory: true,
        frequency: 'annual',
        applicableTo: ['finance', 'management'],
        regulatoryBody: 'Financial Action Task Force (FATF)',
        defaultDuration: 120,
        certificateValidity: 365,
        riskLevel: 'High',
        icon: '💰',
        color: '#27AE60',
        createdBy: req.user._id
      },
      {
        name: 'Code of Conduct & Ethics',
        code: 'ETHICS',
        description: 'Company code of conduct and ethical guidelines training',
        isMandatory: true,
        frequency: 'annual',
        applicableTo: ['all_employees'],
        regulatoryBody: 'Internal Policy',
        defaultDuration: 60,
        certificateValidity: 365,
        riskLevel: 'Medium',
        icon: '⚖️',
        color: '#16A085',
        createdBy: req.user._id
      },
      {
        name: 'Diversity & Inclusion',
        code: 'DEI',
        description: 'Training on diversity, equity, and inclusion in the workplace',
        isMandatory: true,
        frequency: 'annual',
        applicableTo: ['all_employees', 'management'],
        regulatoryBody: 'Internal Policy',
        defaultDuration: 75,
        certificateValidity: 365,
        riskLevel: 'Medium',
        icon: '🌈',
        color: '#8E44AD',
        createdBy: req.user._id
      },
      {
        name: 'IT Security & Password Management',
        code: 'ITSEC',
        description: 'Best practices for IT security and password management',
        isMandatory: true,
        frequency: 'quarterly',
        applicableTo: ['all_employees'],
        regulatoryBody: 'NIST / ISO 27001',
        defaultDuration: 30,
        certificateValidity: 90,
        riskLevel: 'High',
        icon: '🔑',
        color: '#C0392B',
        createdBy: req.user._id
      }
    ];

    // Check if categories already exist
    const existingCount = await TrainingCategory.countDocuments();
    
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Categories already exist (${existingCount} found). Use update or delete first.`
      });
    }

    // Insert all categories
    const categories = await TrainingCategory.insertMany(predefinedCategories);

    res.status(201).json({
      success: true,
      message: `Successfully seeded ${categories.length} training categories`,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to seed categories',
      error: error.message
    });
  }
};

module.exports = exports;
