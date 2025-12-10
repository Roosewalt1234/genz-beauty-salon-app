const express = require('express');
const supabase = require('./db');

const router = express.Router();

// Convert DB snake_case fields into the camelCase shape the frontend expects
const mapStaffRow = (row) => ({
  id: row.id,
  tenantId: row.tenant_id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  role: row.role,
  yearsOfExperience: row.years_of_experience,
  commission: row.commission,
  profile_image_url: row.profile_image_url,
  rating: row.rating,
  bio: row.bio,
  specializations: row.specializations || [],
  isActive: row.is_active,
  schedule: row.schedule,
  identity: row.identity,
  salary: row.salary,
  createdAt: row.created_at,
});

// Get all staff for a tenant
router.get('/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json((data || []).map(mapStaffRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create staff
router.post('/', async (req, res) => {
  try {
    const { id, tenantId, name, email, phone, role, yearsOfExperience, commission, profile_image_url, rating, bio, specializations, isActive, schedule, identity, salary } = req.body;

    const { data, error } = await supabase
      .from('staff')
      .insert({
        id,
        tenant_id: tenantId,
        name,
        email,
        phone,
        role,
        years_of_experience: yearsOfExperience,
        commission,
        profile_image_url,
        rating,
        bio,
        specializations,
        is_active: isActive,
        schedule,
        identity,
        salary
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(mapStaffRow(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update staff
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, yearsOfExperience, commission, profile_image_url, rating, bio, specializations, isActive, schedule, identity, salary } = req.body;

    const { data, error } = await supabase
      .from('staff')
      .update({
        name,
        email,
        phone,
        role,
        years_of_experience: yearsOfExperience,
        commission,
        profile_image_url,
        rating,
        bio,
        specializations,
        is_active: isActive,
        schedule,
        identity,
        salary
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(mapStaffRow(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete staff
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
