const { execSync } = require('child_process');

// Run the seed script using Node.js
try {
    console.log('🌱 Starting seed process...\n');
    
    execSync('node scripts/seed.node.js', {
        stdio: 'inherit',
        cwd: process.cwd()
    });
    
    console.log('\n✅ Seed completed successfully!');
} catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
}
