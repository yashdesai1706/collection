const Size = require('../models/Size');
const Color = require('../models/Color');

// --- Sizes ---
const getSizes = async (req, res) => {
    try {
        const filter = req.query.all === 'true' ? {} : { isActive: true };
        const sizes = await Size.find(filter).sort({ name: 1 });
        res.json(sizes);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const createSize = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
        const size = await Size.create({ name: name.trim() });
        res.status(201).json(size);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Size already exists' });
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateSize = async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const size = await Size.findById(req.params.id);
        if (!size) return res.status(404).json({ message: 'Not found' });
        if (name !== undefined) size.name = name.trim();
        if (isActive !== undefined) size.isActive = isActive;
        await size.save();
        res.json(size);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Size already exists' });
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteSize = async (req, res) => {
    try {
        const size = await Size.findById(req.params.id);
        if (!size) return res.status(404).json({ message: 'Not found' });
        size.isActive = false;
        await size.save();
        res.json({ message: 'Size deactivated' });
    } catch { res.status(500).json({ message: 'Server Error' }); }
};

// --- Colors ---
const getColors = async (req, res) => {
    try {
        const filter = req.query.all === 'true' ? {} : { isActive: true };
        const colors = await Color.find(filter).sort({ name: 1 });
        res.json(colors);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const createColor = async (req, res) => {
    try {
        const { name, hex } = req.body;
        if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
        const color = await Color.create({ name: name.trim(), hex: hex || null });
        res.status(201).json(color);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Color already exists' });
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateColor = async (req, res) => {
    try {
        const { name, hex, isActive } = req.body;
        const color = await Color.findById(req.params.id);
        if (!color) return res.status(404).json({ message: 'Not found' });
        if (name !== undefined) color.name = name.trim();
        if (hex !== undefined) color.hex = hex;
        if (isActive !== undefined) color.isActive = isActive;
        await color.save();
        res.json(color);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Color already exists' });
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteColor = async (req, res) => {
    try {
        const color = await Color.findById(req.params.id);
        if (!color) return res.status(404).json({ message: 'Not found' });
        color.isActive = false;
        await color.save();
        res.json({ message: 'Color deactivated' });
    } catch { res.status(500).json({ message: 'Server Error' }); }
};

module.exports = {
    getSizes, createSize, updateSize, deleteSize,
    getColors, createColor, updateColor, deleteColor
};
