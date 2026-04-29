#!/usr/bin/env python3
"""
Detailed AI Chat Test - Verify OpenRouter vs Demo Fallback
"""

import requests
import json
import uuid
import time
import os
from datetime import datetime

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
API_BASE = f"{BASE_URL}/api"

def test_openrouter_vs_demo():
    """Test to determine if OpenRouter is actually being used"""
    print("=" * 60)
    print("DETAILED TEST: OpenRouter vs Demo Fallback Detection")
    print("=" * 60)
    
    # Create minimal test data
    restaurant_data = {
        "name": "Test Restaurant",
        "ownerName": "Test Owner", 
        "email": "test@test.com",
        "contact": "+1-555-0100",
        "subscription": "Pro"
    }
    
    resp = requests.post(f"{API_BASE}/restaurants", json=restaurant_data, timeout=10)
    restaurant = resp.json()["restaurant"]
    restaurant_id = restaurant["id"]
    
    # Create a simple menu item
    menu_item = {
        "restaurantId": restaurant_id,
        "name": "Test Dish",
        "description": "A test dish",
        "price": 10.00,
        "category": "Mains"
    }
    
    resp = requests.post(f"{API_BASE}/menu", json=menu_item, timeout=10)
    menu = [resp.json()["item"]]
    
    # Create table
    table_data = {"restaurantId": restaurant_id, "number": "1", "seats": 2}
    resp = requests.post(f"{API_BASE}/tables", json=table_data, timeout=10)
    table = resp.json()["table"]
    
    # Test 1: Simple message that should trigger OpenRouter
    session_id = f"test_{uuid.uuid4().hex[:8]}"
    
    chat_payload = {
        "sessionId": session_id,
        "restaurantId": restaurant_id,
        "tableId": table["id"],
        "language": "en",
        "message": "What is the meaning of life according to philosophy?",  # Non-food question
        "menu": menu,
        "cart": [],
        "stage": "browsing"
    }
    
    print("Testing with philosophical question (should use OpenRouter)...")
    start_time = time.time()
    resp = requests.post(f"{API_BASE}/chat", json=chat_payload, timeout=20)
    response_time = time.time() - start_time
    
    if resp.status_code == 200:
        result = resp.json()
        reply = result.get("reply", "")
        fallback = result.get("fallback", False)
        
        print(f"Response time: {response_time:.2f}s")
        print(f"Reply length: {len(reply)} chars")
        print(f"Fallback used: {fallback}")
        print(f"Reply preview: {reply[:150]}...")
        
        # Analyze response characteristics
        if response_time < 0.1:
            print("⚠️  Very fast response suggests demo fallback")
        elif response_time > 2.0:
            print("✅ Slower response suggests real API call")
        else:
            print("⚠️  Response time inconclusive")
            
        # Check for demo-specific patterns
        demo_patterns = [
            "I recommend",
            "our restaurant", 
            "today's chef specials",
            "Great choice. I can add mains"
        ]
        
        has_demo_pattern = any(pattern in reply for pattern in demo_patterns)
        if has_demo_pattern:
            print("⚠️  Response contains demo chat patterns")
        else:
            print("✅ Response doesn't match demo patterns")
            
        # Test 2: Food-related question
        food_payload = {
            "sessionId": session_id,
            "restaurantId": restaurant_id,
            "tableId": table["id"],
            "language": "en",
            "message": "What do you recommend?",
            "menu": menu,
            "cart": [],
            "stage": "browsing"
        }
        
        print("\nTesting with food question...")
        start_time = time.time()
        resp2 = requests.post(f"{API_BASE}/chat", json=food_payload, timeout=20)
        response_time2 = time.time() - start_time
        
        if resp2.status_code == 200:
            result2 = resp2.json()
            reply2 = result2.get("reply", "")
            fallback2 = result2.get("fallback", False)
            
            print(f"Response time: {response_time2:.2f}s")
            print(f"Fallback used: {fallback2}")
            print(f"Reply preview: {reply2[:150]}...")
            
    return True

if __name__ == "__main__":
    test_openrouter_vs_demo()