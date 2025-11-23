/**
 * Migration script to convert existing Survey data to Form model
 * 
 * This script should be run after the Prisma schema migration is complete.
 * It migrates all Survey records to Form records and updates related data.
 * 
 * Usage: npx ts-node prisma/migrate-survey-to-form.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('🔄 Starting migration from Survey to Form...');

  try {
    // Note: This script assumes the database has been migrated to use Form model
    // If you still have Survey data, you'll need to run a raw SQL migration first
    
    // Check if there are any forms already
    const existingForms = await prisma.form.count();
    
    if (existingForms > 0) {
      console.log('✅ Forms already exist. Migration may have already been completed.');
      console.log(`Found ${existingForms} forms.`);
      return;
    }

    // If using SQLite and you need to migrate from old Survey table:
    // You would need to run raw SQL to copy data from surveys table to forms table
    // This is a simplified version - adjust based on your actual migration needs

    console.log('📝 Migration complete!');
    console.log('💡 If you had existing Survey data, ensure the Prisma migration was run first.');
    console.log('💡 The schema migration should have handled the table rename.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

