const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

const toSlug = (name) =>
    name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ── Categories ──────────────────────────────────────────────

// GET /api/admin/categories  (also used publicly for dropdowns)
const getCategories = async (req, res) => {
    try {
        const filter = req.query.all === 'true' ? {} : { isActive: true };
        const cats = await Category.find(filter).sort({ name: 1 });
        res.json(cats);
    } catch (err) {
        console.error('getCategories error:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// POST /api/admin/categories
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
        const cat = await Category.create({ name: name.trim(), slug: toSlug(name) });
        res.status(201).json(cat);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Category already exists' });
        res.status(500).json({ message: 'Server Error' });
    }
};

// PUT /api/admin/categories/:id
const updateCategory = async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const cat = await Category.findById(req.params.id);
        if (!cat) return res.status(404).json({ message: 'Not found' });
        if (name !== undefined) { cat.name = name.trim(); cat.slug = toSlug(name); }
        if (isActive !== undefined) cat.isActive = isActive;
        await cat.save();
        res.json(cat);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Category name already taken' });
        res.status(500).json({ message: 'Server Error' });
    }
};

// DELETE /api/admin/categories/:id  (soft delete)
const deleteCategory = async (req, res) => {
    try {
        const cat = await Category.findById(req.params.id);
        if (!cat) return res.status(404).json({ message: 'Not found' });
        cat.isActive = false;
        await cat.save();
        res.json({ message: 'Category deactivated' });
    } catch { res.status(500).json({ message: 'Server Error' }); }
};

// ── Subcategories ────────────────────────────────────────────

// GET /api/admin/subcategories?category=<id>
const getSubcategories = async (req, res) => {
    try {
        const filter = req.query.all === 'true' ? {} : { isActive: true };
        if (req.query.category) filter.category = req.query.category;
        const subs = await Subcategory.find(filter).populate('category', 'name').sort({ name: 1 });
        res.json(subs);
    } catch (err) {
        console.error('getSubcategories error:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// POST /api/admin/subcategories
const createSubcategory = async (req, res) => {
    try {
        const { name, category } = req.body;
        if (!name?.trim() || !category) return res.status(400).json({ message: 'Name and category are required' });
        const sub = await Subcategory.create({ name: name.trim(), slug: toSlug(name), category });
        await sub.populate('category', 'name');
        res.status(201).json(sub);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Subcategory already exists in this category' });
        res.status(500).json({ message: 'Server Error' });
    }
};

// PUT /api/admin/subcategories/:id
const updateSubcategory = async (req, res) => {
    try {
        const { name, category, isActive } = req.body;
        const sub = await Subcategory.findById(req.params.id);
        if (!sub) return res.status(404).json({ message: 'Not found' });
        if (name !== undefined) { sub.name = name.trim(); sub.slug = toSlug(name); }
        if (category !== undefined) sub.category = category;
        if (isActive !== undefined) sub.isActive = isActive;
        await sub.save();
        await sub.populate('category', 'name');
        res.json(sub);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Subcategory name already taken in this category' });
        res.status(500).json({ message: 'Server Error' });
    }
};

// DELETE /api/admin/subcategories/:id  (soft delete)
const deleteSubcategory = async (req, res) => {
    try {
        const sub = await Subcategory.findById(req.params.id);
        if (!sub) return res.status(404).json({ message: 'Not found' });
        sub.isActive = false;
        await sub.save();
        res.json({ message: 'Subcategory deactivated' });
    } catch { res.status(500).json({ message: 'Server Error' }); }
};

module.exports = {
    getCategories, createCategory, updateCategory, deleteCategory,
    getSubcategories, createSubcategory, updateSubcategory, deleteSubcategory,
};
