const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Multi-tenant middleware function
function getTenantFromRequest(req) {
  // In a real application, you would extract tenant_id from:
  // - JWT token
  // - Request headers
  // - Subdomain
  // - URL parameters
  // For now, we'll use a placeholder
  return req.headers['x-tenant-id'] || req.query.tenant_id || 'default-tenant';
}

// Helper function to add tenant filter to queries
function addTenantFilter(query, tenantId, tableName) {
  // Skip tenant filter for tenant table itself
  if (tableName === 'tenants') {
    return query;
  }
  return query.eq('tenant_id', tenantId);
}

async function verifyTables() {
  const tables = ['tenants', 'users', 'services', 'staff', 'bookings', 'inventory', 'campaigns', 'permissions', 'user_accounts', 'sales_register', 'expense_register', 'accounts_receivable', 'accounts_payable', 'payroll'];
  let allExist = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Table '${table}' does not exist or has issues:`, error.message);
        allExist = false;
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    } catch (err) {
      console.log(`❌ Error checking table '${table}':`, err.message);
      allExist = false;
    }
  }

  if (allExist) {
    console.log('🎉 All tables are set up correctly!');
  } else {
    console.log('⚠️  Some tables are missing. Please run the SQL script in Supabase.');
  }
}

verifyTables();