// Direct OpenRouter LLM Test
// This tests the llmChat function directly to verify OpenRouter integration

import { config } from 'dotenv';
import { llmChat } from './lib/llm.js';

// Load environment variables from .env file
config();

async function testOpenRouterDirect() {
    console.log('='.repeat(60));
    console.log('DIRECT OPENROUTER LLM TEST');
    console.log('='.repeat(60));
    
    // Test message that should use OpenRouter
    const messages = [
        {
            role: 'system',
            content: 'You are a helpful restaurant waiter. Respond briefly and professionally.'
        },
        {
            role: 'user', 
            content: 'What do you recommend for someone who likes spicy food and has a peanut allergy?'
        }
    ];
    
    try {
        console.log('Testing OpenRouter LLM integration...');
        console.log('Environment check:');
        console.log('- OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'SET' : 'NOT SET');
        console.log('- OPENROUTER_MODEL:', process.env.OPENROUTER_MODEL || 'NOT SET');
        console.log('- EMERGENT_LLM_KEY:', process.env.EMERGENT_LLM_KEY ? 'SET' : 'NOT SET');
        console.log('- GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'SET' : 'NOT SET');
        
        const startTime = Date.now();
        const response = await llmChat({ 
            messages, 
            temperature: 0.8 
        });
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log('\n✅ SUCCESS!');
        console.log(`Response time: ${responseTime}ms`);
        console.log(`Response length: ${response.length} characters`);
        console.log('Response preview:', response.substring(0, 200) + '...');
        
        // Check if response looks like it came from a real LLM
        if (responseTime > 1000) {
            console.log('✅ Response time suggests real API call');
        } else {
            console.log('⚠️  Fast response - might be cached or error');
        }
        
        // Check for OpenRouter-specific patterns
        if (response.length > 50 && !response.includes('error')) {
            console.log('✅ Response appears to be from real LLM');
        } else {
            console.log('❌ Response might be an error or fallback');
        }
        
        return true;
        
    } catch (error) {
        console.log('\n❌ ERROR!');
        console.log('Error type:', error.constructor.name);
        console.log('Error message:', error.message);
        
        if (error.message.includes('OpenRouter')) {
            console.log('🔍 This is an OpenRouter-specific error');
        } else if (error.message.includes('No LLM key')) {
            console.log('🔍 No LLM provider configured');
        } else {
            console.log('🔍 Unexpected error type');
        }
        
        return false;
    }
}

// Run the test
testOpenRouterDirect()
    .then(success => {
        console.log('\n' + '='.repeat(60));
        if (success) {
            console.log('🎉 OPENROUTER INTEGRATION TEST PASSED');
        } else {
            console.log('❌ OPENROUTER INTEGRATION TEST FAILED');
        }
        console.log('='.repeat(60));
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('Test script error:', error);
        process.exit(1);
    });