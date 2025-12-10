const express = require('express');
const supabase = require('./db');

const router = express.Router();

// Get all clients for a tenant
router.get('/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create client
router.post('/', async (req, res) => {
  try {
    const { id, tenantId, name, email, phone, dob, acquisitionSource, preferredServices, skinType, hairType, notes, communicationPreferences, isActive, allergies } = req.body;

    const { data, error } = await supabase
      .from('clients')
      .insert({
        id,
        tenant_id: tenantId,
        name,
        email,
        phone,
        dob,
        acquisition_source: acquisitionSource,
        preferred_services: preferredServices,
        skin_type: skinType,
        hair_type: hairType,
        notes,
        communication_preferences: communicationPreferences,
        is_active: isActive,
        allergies
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, dob, acquisitionSource, preferredServices, skinType, hairType, notes, communicationPreferences, isActive, allergies } = req.body;

    const { data, error } = await supabase
      .from('clients')
      .update({
        name,
        email,
        phone,
        dob,
        acquisition_source: acquisitionSource,
        preferred_services: preferredServices,
        skin_type: skinType,
        hair_type: hairType,
        notes,
        communication_preferences: communicationPreferences,
        is_active: isActive,
        allergies
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('clients')
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