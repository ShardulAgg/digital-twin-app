#!/usr/bin/env node

const API_BASE = 'http://localhost:8000';

async function testEndpoint(name, method, path, data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE}${path}`, options);
    const result = await response.json();
    
    console.log(`✅ ${name}: ${response.status} - ${response.statusText}`);
    return { success: true, data: result };
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing Digital Twin API Integration...\n');
  
  // Test health endpoint
  await testEndpoint('Health Check', 'GET', '/health');
  
  // Test personas endpoint
  const personasResult = await testEndpoint('Get Personas', 'GET', '/personas');
  
  // Test process-text endpoint
  const processResult = await testEndpoint('Process Text', 'POST', '/process-text', {
    text: 'An AI that turns messy product feedback into prioritized JIRA tickets',
    persona_id: 'chad_goldstein',
    context: 'Testing the frontend integration'
  });
  
  if (processResult.success && processResult.data.job_id) {
    console.log(`📋 Job created: ${processResult.data.job_id}`);
    
    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test job status endpoint
    await testEndpoint('Job Status', 'GET', `/job/${processResult.data.job_id}`);
  }
  
  // Test quick roast endpoint
  await testEndpoint('Quick Roast', 'POST', '/quick-roast', {
    topic: 'AI-powered productivity tools',
    persona_id: 'sarah_guo'
  });
  
  console.log('\n🎉 API testing completed!');
  console.log('\n📱 Frontend should be available at: http://localhost:3000');
  console.log('🔗 API documentation at: http://localhost:8000/docs');
}

runTests().catch(console.error);
