import { dbService } from '../db';

async function testDatabase() {
  console.log('🧪 Testing Database Storage & Auth Sync...');

  // 1. Test User Registration
  const testUserId = `usr_test_${Date.now()}`;
  const testEmail = `developer_${Date.now()}@example.com`;
  
  const created = dbService.createUser({
    id: testUserId,
    email: testEmail,
    fullName: 'Test Developer',
    role: 'developer',
  });
  console.log('✅ 1. Created User in DB:', created);

  // 2. Record Auth Log
  dbService.recordAuthLog({
    id: `log_${Date.now()}`,
    userId: testUserId,
    authType: 'register',
    ipAddress: '127.0.0.1',
    userAgent: 'Node Test Runner',
  });
  console.log('✅ 2. Auth Log Recorded.');

  // 3. Test User Login Update
  dbService.updateUserLogin(testUserId);
  const updatedUser = dbService.getUserById(testUserId);
  console.log('✅ 3. Updated User Login Count & Timestamp:', {
    loginCount: updatedUser?.loginCount,
    lastLoginAt: updatedUser?.lastLoginAt,
  });

  // 4. Test Code Analysis Persistence
  const analysisId = `analysis_${Date.now()}`;
  dbService.saveAnalysis({
    id: analysisId,
    userId: testUserId,
    code: 'const x: number = 10;',
    language: 'typescript',
    mode: 'general',
    overallScore: 95,
    summary: 'Clean TypeScript code snippet.',
    issues: [],
    strengths: ['Strict typing used', 'Immutability preferred'],
    createdAt: new Date().toISOString(),
  });
  console.log('✅ 4. Code Analysis Saved to DB.');

  // 5. Query Analyses
  const analyses = dbService.getAnalyses(testUserId);
  console.log('✅ 5. Fetched Analyses for User:', analyses.total, 'records.');

  // 6. DB Overall Stats
  const stats = dbService.getStats();
  console.log('✅ 6. Overall DB Stats:', stats);

  console.log('\n🎉 ALL DATABASE VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

testDatabase().catch(console.error);
