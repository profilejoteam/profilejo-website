const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vklsxpbaaehamjoekcqj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbHN4cGJhYWVoYW1qb2VrY3FqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY5MzQxMSwiZXhwIjoyMDczMjY5NDExfQ.DhLU3IZZQ0DJX8qlE0L_Q9Y1FJEYKQIwrnShRAL2x_4';

// Create Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminRecursion() {
  try {
    console.log('Starting to fix admin table recursion issue...');

    // First, drop the problematic policy
    console.log('Dropping problematic policy...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP POLICY IF EXISTS "Admins can manage admins" ON admins;'
    });

    if (dropError && !dropError.message.includes('does not exist')) {
      console.error('Error dropping policy:', dropError);
    } else {
      console.log('Policy dropped successfully');
    }

    // Create new policies
    console.log('Creating new policies...');
    
    const policies = [
      // Allow authenticated users to read admins
      `CREATE POLICY "Users can read admins" ON admins
        FOR SELECT USING (auth.role() = 'authenticated');`,
      
      // Allow insert if table is empty or user is admin
      `CREATE POLICY "Only admins can modify admins" ON admins
        FOR INSERT WITH CHECK (
          NOT EXISTS (SELECT 1 FROM admins WHERE is_active = true)
          OR
          EXISTS (
            SELECT 1 FROM admins a
            JOIN auth.users u ON a.user_id = u.id
            WHERE u.id = auth.uid() AND a.is_active = true
          )
        );`,
      
      // Allow update only for admins
      `CREATE POLICY "Only admins can update admins" ON admins
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM admins a
            JOIN auth.users u ON a.user_id = u.id
            WHERE u.id = auth.uid() AND a.is_active = true
          )
        );`,
      
      // Allow delete only for admins
      `CREATE POLICY "Only admins can delete admins" ON admins
        FOR DELETE USING (
          EXISTS (
            SELECT 1 FROM admins a
            JOIN auth.users u ON a.user_id = u.id
            WHERE u.id = auth.uid() AND a.is_active = true
          )
        );`
    ];

    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        console.error('Error creating policy:', error);
      } else {
        console.log('Policy created successfully');
      }
    }

    // Try to add the first admin
    console.log('Adding first admin...');
    const { data: existingAdmins, error: checkError } = await supabase
      .from('admins')
      .select('*')
      .eq('is_active', true);

    if (checkError) {
      console.error('Error checking existing admins:', checkError);
    } else if (existingAdmins.length === 0) {
      // No admins exist, add the first one
      const { error: insertError } = await supabase
        .from('admins')
        .insert({
          email: 'amrabdullah19876@gmail.com',
          is_active: true
        });
      
      if (insertError) {
        console.error('Error adding first admin:', insertError);
      } else {
        console.log('First admin added successfully');
      }
    } else {
      console.log('Admin already exists');
    }

    console.log('Fix completed successfully!');
    
  } catch (error) {
    console.error('Error during fix:', error);
  }
}

// Execute the fix
fixAdminRecursion();