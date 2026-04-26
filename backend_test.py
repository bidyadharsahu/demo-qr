#!/usr/bin/env python3
"""
Comprehensive backend testing for Netrik Shop multi-tenant restaurant management system.
Tests all critical API endpoints and flows.
"""

import requests
import json
import time
import uuid
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://restaurant-hub-pro.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class NetrikShopTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_data = {}
        self.results = []
        
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        self.results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
        
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{API_BASE}/{endpoint.lstrip('/')}"
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, params=params)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, params=params)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, params=params)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, params=params)
            else:
                return False, {"error": f"Unsupported method: {method}"}, 0
                
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
                
            return response.status_code < 400, response_data, response.status_code
        except Exception as e:
            return False, {"error": str(e)}, 0

    def test_health_check(self):
        """Test basic health endpoint"""
        success, data, status = self.make_request('GET', 'health')
        if success and data.get('status') == 'ok':
            self.log_result("Health Check", True, f"Service: {data.get('service')}")
        else:
            self.log_result("Health Check", False, f"Status: {status}, Data: {data}")

    def test_central_auth(self):
        """Test central admin authentication"""
        # Test valid credentials
        success, data, status = self.make_request('POST', 'auth/login', {
            "type": "central",
            "userId": "hello",
            "password": "123456"
        })
        
        if success and data.get('user', {}).get('type') == 'central':
            self.log_result("Central Auth - Valid Credentials", True, f"User ID: {data['user']['userId']}")
            self.test_data['central_user'] = data['user']
        else:
            self.log_result("Central Auth - Valid Credentials", False, f"Status: {status}, Data: {data}")
            
        # Test invalid credentials
        success, data, status = self.make_request('POST', 'auth/login', {
            "type": "central",
            "userId": "hello",
            "password": "wrong"
        })
        
        if not success and status == 401:
            self.log_result("Central Auth - Invalid Credentials", True, "Correctly rejected invalid credentials")
        else:
            self.log_result("Central Auth - Invalid Credentials", False, f"Should have returned 401, got {status}")

    def test_restaurant_crud(self):
        """Test restaurant CRUD operations"""
        # Create restaurant
        restaurant_data = {
            "name": "Test Pizzeria Roma",
            "ownerName": "Mario Rossi",
            "contact": "+1-555-0123",
            "address": "123 Main St, Test City",
            "domain": "pizzeria-roma.test",
            "subscription": "Pro"
        }
        
        success, data, status = self.make_request('POST', 'restaurants', restaurant_data)
        
        if success and data.get('restaurant'):
            restaurant = data['restaurant']
            self.test_data['restaurant'] = restaurant
            manager_creds = restaurant.get('managerCreds', {})
            chef_creds = restaurant.get('chefCreds', {})
            
            # Verify auto-generated credentials
            if (manager_creds.get('userId', '').startswith('manager_') and 
                chef_creds.get('userId', '').startswith('chef_') and
                len(manager_creds.get('password', '')) == 6 and
                len(chef_creds.get('password', '')) == 6):
                self.log_result("Restaurant Creation", True, 
                    f"ID: {restaurant['id']}, Manager: {manager_creds['userId']}, Chef: {chef_creds['userId']}")
            else:
                self.log_result("Restaurant Creation", False, "Invalid credential generation")
        else:
            self.log_result("Restaurant Creation", False, f"Status: {status}, Data: {data}")
            return
            
        # Test manager login
        success, data, status = self.make_request('POST', 'auth/login', {
            "type": "manager",
            "userId": manager_creds['userId'],
            "password": manager_creds['password']
        })
        
        if success and data.get('user', {}).get('type') == 'manager':
            self.log_result("Manager Auth", True, f"Restaurant: {data['user']['restaurantName']}")
            self.test_data['manager_user'] = data['user']
        else:
            self.log_result("Manager Auth", False, f"Status: {status}, Data: {data}")
            
        # Test chef login
        success, data, status = self.make_request('POST', 'auth/login', {
            "type": "chef",
            "userId": chef_creds['userId'],
            "password": chef_creds['password']
        })
        
        if success and data.get('user', {}).get('type') == 'chef':
            self.log_result("Chef Auth", True, f"Restaurant: {data['user']['restaurantName']}")
            self.test_data['chef_user'] = data['user']
        else:
            self.log_result("Chef Auth", False, f"Status: {status}, Data: {data}")
            
        # List restaurants
        success, data, status = self.make_request('GET', 'restaurants')
        if success and isinstance(data.get('restaurants'), list):
            self.log_result("Restaurant List", True, f"Found {len(data['restaurants'])} restaurants")
        else:
            self.log_result("Restaurant List", False, f"Status: {status}, Data: {data}")
            
        # Get single restaurant
        restaurant_id = self.test_data['restaurant']['id']
        success, data, status = self.make_request('GET', f'restaurants/{restaurant_id}')
        if success and data.get('restaurant', {}).get('id') == restaurant_id:
            self.log_result("Restaurant Get Single", True, f"Name: {data['restaurant']['name']}")
        else:
            self.log_result("Restaurant Get Single", False, f"Status: {status}, Data: {data}")
            
        # Update restaurant
        success, data, status = self.make_request('PUT', f'restaurants/{restaurant_id}', {
            "name": "Updated Pizzeria Roma",
            "ownerName": "Mario Rossi Jr.",
            "contact": "+1-555-0124",
            "address": "456 Updated St, Test City",
            "domain": "updated-pizzeria.test",
            "subscription": "Premium"
        })
        if success and data.get('restaurant', {}).get('name') == "Updated Pizzeria Roma":
            self.log_result("Restaurant Update", True, "Successfully updated restaurant")
        else:
            self.log_result("Restaurant Update", False, f"Status: {status}, Data: {data}")

    def test_menu_crud(self):
        """Test menu CRUD operations"""
        if 'restaurant' not in self.test_data:
            self.log_result("Menu CRUD", False, "No restaurant available for testing")
            return
            
        restaurant_id = self.test_data['restaurant']['id']
        
        # Create menu items
        menu_items = [
            {
                "restaurantId": restaurant_id,
                "name": "Margherita Pizza",
                "description": "Fresh tomato, mozzarella, basil",
                "price": 18.99,
                "category": "Pizza",
                "available": True,
                "image": "https://example.com/margherita.jpg"
            },
            {
                "restaurantId": restaurant_id,
                "name": "Caesar Salad",
                "description": "Romaine lettuce, parmesan, croutons",
                "price": 12.50,
                "category": "Salads",
                "available": True
            },
            {
                "restaurantId": restaurant_id,
                "name": "Tiramisu",
                "description": "Classic Italian dessert",
                "price": 8.99,
                "category": "Desserts",
                "available": False
            }
        ]
        
        created_items = []
        for item_data in menu_items:
            success, data, status = self.make_request('POST', 'menu', item_data)
            if success and data.get('item'):
                created_items.append(data['item'])
            else:
                self.log_result("Menu Item Creation", False, f"Failed to create {item_data['name']}")
                return
                
        self.test_data['menu_items'] = created_items
        self.log_result("Menu Items Creation", True, f"Created {len(created_items)} items")
        
        # List all menu items
        success, data, status = self.make_request('GET', 'menu', params={'restaurantId': restaurant_id})
        if success and len(data.get('menu', [])) >= len(created_items):
            self.log_result("Menu List All", True, f"Found {len(data['menu'])} items")
        else:
            self.log_result("Menu List All", False, f"Status: {status}, Expected >= {len(created_items)} items")
            
        # List only available items
        success, data, status = self.make_request('GET', 'menu', params={
            'restaurantId': restaurant_id,
            'availableOnly': '1'
        })
        available_items = data.get('menu', [])
        expected_available = len([item for item in created_items if item['available']])
        if success and len(available_items) == expected_available:
            self.log_result("Menu List Available Only", True, f"Found {len(available_items)} available items")
        else:
            self.log_result("Menu List Available Only", False, f"Expected {expected_available}, got {len(available_items)}")
            
        # Update menu item (toggle availability)
        item_to_update = created_items[2]  # Tiramisu (currently unavailable)
        success, data, status = self.make_request('PUT', f'menu/{item_to_update["id"]}', {
            "available": True,
            "price": 9.99
        })
        if success:
            self.log_result("Menu Item Update", True, "Successfully updated item availability and price")
        else:
            self.log_result("Menu Item Update", False, f"Status: {status}, Data: {data}")

    def test_tables_crud(self):
        """Test tables CRUD operations"""
        if 'restaurant' not in self.test_data:
            self.log_result("Tables CRUD", False, "No restaurant available for testing")
            return
            
        restaurant_id = self.test_data['restaurant']['id']
        
        # Create tables
        tables_data = [
            {"restaurantId": restaurant_id, "number": "1", "seats": 2},
            {"restaurantId": restaurant_id, "number": "2", "seats": 4},
            {"restaurantId": restaurant_id, "number": "3", "seats": 6}
        ]
        
        created_tables = []
        for table_data in tables_data:
            success, data, status = self.make_request('POST', 'tables', table_data)
            if success and data.get('table'):
                table = data['table']
                if table['status'] == 'available':
                    created_tables.append(table)
                else:
                    self.log_result("Table Creation", False, f"Table {table_data['number']} not created with 'available' status")
                    return
            else:
                self.log_result("Table Creation", False, f"Failed to create table {table_data['number']}")
                return
                
        self.test_data['tables'] = created_tables
        self.log_result("Tables Creation", True, f"Created {len(created_tables)} tables")
        
        # List tables
        success, data, status = self.make_request('GET', 'tables', params={'restaurantId': restaurant_id})
        if success and len(data.get('tables', [])) >= len(created_tables):
            self.log_result("Tables List", True, f"Found {len(data['tables'])} tables")
        else:
            self.log_result("Tables List", False, f"Status: {status}, Expected >= {len(created_tables)} tables")
            
        # Get single table
        table_id = created_tables[0]['id']
        success, data, status = self.make_request('GET', f'tables/{table_id}')
        if success and data.get('table', {}).get('id') == table_id:
            self.log_result("Table Get Single", True, f"Table {data['table']['number']}")
        else:
            self.log_result("Table Get Single", False, f"Status: {status}, Data: {data}")
            
        # Update table status
        success, data, status = self.make_request('PUT', f'tables/{table_id}', {"status": "occupied"})
        if success:
            self.log_result("Table Status Update", True, "Successfully updated table status to occupied")
        else:
            self.log_result("Table Status Update", False, f"Status: {status}, Data: {data}")

    def test_orders_flow(self):
        """Test complete order flow including addons and payment"""
        if not all(key in self.test_data for key in ['restaurant', 'menu_items', 'tables']):
            self.log_result("Orders Flow", False, "Missing required test data (restaurant, menu, tables)")
            return
            
        restaurant_id = self.test_data['restaurant']['id']
        table_id = self.test_data['tables'][0]['id']
        menu_items = self.test_data['menu_items']
        
        # Create order
        order_data = {
            "restaurantId": restaurant_id,
            "tableId": table_id,
            "items": [
                {
                    "id": menu_items[0]['id'],
                    "name": menu_items[0]['name'],
                    "price": menu_items[0]['price'],
                    "qty": 2
                },
                {
                    "id": menu_items[1]['id'],
                    "name": menu_items[1]['name'],
                    "price": menu_items[1]['price'],
                    "qty": 1
                }
            ],
            "allergy": "No nuts",
            "spicyLevel": "medium"
        }
        
        success, data, status = self.make_request('POST', 'orders', order_data)
        if success and data.get('order'):
            order = data['order']
            expected_total = (menu_items[0]['price'] * 2) + menu_items[1]['price']
            if abs(order['total'] - expected_total) < 0.01 and order['status'] == 'pending':
                self.log_result("Order Creation", True, f"Order ID: {order['id']}, Total: ${order['total']}")
                self.test_data['order'] = order
                
                # Verify table status changed to occupied
                success, data, status = self.make_request('GET', f'tables/{table_id}')
                if success and data.get('table', {}).get('status') == 'occupied':
                    self.log_result("Table Auto-Occupation", True, "Table status correctly updated to occupied")
                else:
                    self.log_result("Table Auto-Occupation", False, "Table status not updated")
            else:
                self.log_result("Order Creation", False, f"Invalid order total or status: {order}")
        else:
            self.log_result("Order Creation", False, f"Status: {status}, Data: {data}")
            return
            
        order_id = self.test_data['order']['id']
        
        # List orders
        success, data, status = self.make_request('GET', 'orders', params={'restaurantId': restaurant_id})
        if success and any(o['id'] == order_id for o in data.get('orders', [])):
            self.log_result("Orders List", True, f"Found {len(data['orders'])} orders")
        else:
            self.log_result("Orders List", False, "Created order not found in list")
            
        # Get single order
        success, data, status = self.make_request('GET', f'orders/{order_id}')
        if success and data.get('order', {}).get('id') == order_id:
            self.log_result("Order Get Single", True, f"Status: {data['order']['status']}")
        else:
            self.log_result("Order Get Single", False, f"Status: {status}, Data: {data}")
            
        # Update order status
        success, data, status = self.make_request('PUT', f'orders/{order_id}', {"status": "preparing"})
        if success:
            self.log_result("Order Status Update", True, "Updated status to preparing")
        else:
            self.log_result("Order Status Update", False, f"Status: {status}, Data: {data}")
            
        # Add items to order (addons)
        addon_data = {
            "items": [
                {
                    "id": menu_items[2]['id'],
                    "name": menu_items[2]['name'],
                    "price": menu_items[2]['price'],
                    "qty": 1
                }
            ]
        }
        
        success, data, status = self.make_request('POST', f'orders/{order_id}/addons', addon_data)
        if success and data.get('order'):
            updated_order = data['order']
            expected_new_total = self.test_data['order']['total'] + menu_items[2]['price']
            if abs(updated_order['total'] - expected_new_total) < 0.01:
                self.log_result("Order Addons", True, f"New total: ${updated_order['total']}")
                self.test_data['order'] = updated_order
            else:
                self.log_result("Order Addons", False, f"Incorrect total calculation: {updated_order['total']}")
        else:
            self.log_result("Order Addons", False, f"Status: {status}, Data: {data}")

    def test_payment_demo(self):
        """Test demo payment flow"""
        if 'order' not in self.test_data:
            self.log_result("Payment Demo", False, "No order available for payment testing")
            return
            
        order_id = self.test_data['order']['id']
        table_id = self.test_data['order']['tableId']
        
        # Process demo payment
        success, data, status = self.make_request('POST', 'payment/demo', {"orderId": order_id})
        if success and data.get('order'):
            paid_order = data['order']
            if paid_order['status'] == 'paid' and 'paidAt' in paid_order:
                self.log_result("Demo Payment", True, f"Order paid at: {paid_order['paidAt']}")
                
                # Verify table status changed back to available
                success, data, status = self.make_request('GET', f'tables/{table_id}')
                if success and data.get('table', {}).get('status') == 'available':
                    self.log_result("Table Auto-Release", True, "Table status correctly updated to available")
                else:
                    self.log_result("Table Auto-Release", False, "Table status not updated after payment")
            else:
                self.log_result("Demo Payment", False, f"Invalid payment status: {paid_order}")
        else:
            self.log_result("Demo Payment", False, f"Status: {status}, Data: {data}")

    def test_analytics(self):
        """Test analytics endpoints"""
        if 'restaurant' not in self.test_data:
            self.log_result("Analytics", False, "No restaurant available for analytics testing")
            return
            
        restaurant_id = self.test_data['restaurant']['id']
        
        # Test restaurant analytics
        success, data, status = self.make_request('GET', 'analytics', params={'restaurantId': restaurant_id})
        if success:
            required_fields = ['todayRevenue', 'todayOrders', 'avgTicket', 'topItems', 'byHour', 'last7']
            if all(field in data for field in required_fields):
                self.log_result("Restaurant Analytics", True, 
                    f"Revenue: ${data['todayRevenue']}, Orders: {data['todayOrders']}")
            else:
                missing = [f for f in required_fields if f not in data]
                self.log_result("Restaurant Analytics", False, f"Missing fields: {missing}")
        else:
            self.log_result("Restaurant Analytics", False, f"Status: {status}, Data: {data}")
            
        # Test central stats
        success, data, status = self.make_request('GET', 'central/stats')
        if success:
            required_fields = ['totalRestaurants', 'totalRevenue', 'totalOrders', 'mrr', 'byPlan', 'trend']
            if all(field in data for field in required_fields):
                self.log_result("Central Analytics", True, 
                    f"Restaurants: {data['totalRestaurants']}, MRR: ${data['mrr']}")
            else:
                missing = [f for f in required_fields if f not in data]
                self.log_result("Central Analytics", False, f"Missing fields: {missing}")
        else:
            self.log_result("Central Analytics", False, f"Status: {status}, Data: {data}")

    def test_ai_waiter_chat(self):
        """Test AI Waiter chat functionality"""
        if not all(key in self.test_data for key in ['restaurant', 'menu_items', 'tables']):
            self.log_result("AI Waiter Chat", False, "Missing required test data")
            return
            
        restaurant_id = self.test_data['restaurant']['id']
        table_id = self.test_data['tables'][1]['id']  # Use a different table
        session_id = str(uuid.uuid4())
        
        # Prepare menu data for chat
        menu_for_chat = [
            {
                "id": item['id'],
                "name": item['name'],
                "price": item['price'],
                "category": item['category'],
                "description": item.get('description', '')
            }
            for item in self.test_data['menu_items']
        ]
        
        # Test 1: Basic chat interaction
        chat_data = {
            "sessionId": session_id,
            "restaurantId": restaurant_id,
            "tableId": table_id,
            "language": "en",
            "message": "Hi, I'd like to see the menu please",
            "menu": menu_for_chat,
            "cart": [],
            "stage": "browsing"
        }
        
        success, data, status = self.make_request('POST', 'chat', chat_data)
        if success and 'reply' in data:
            self.log_result("AI Chat - Basic Interaction", True, f"Reply length: {len(data['reply'])}")
        else:
            self.log_result("AI Chat - Basic Interaction", False, f"Status: {status}, Data: {data}")
            return
            
        # Test 2: Order with actions
        chat_data['message'] = "I'd like 2 Margherita Pizzas please, I'm allergic to peanuts and want medium spice"
        
        success, data, status = self.make_request('POST', 'chat', chat_data)
        if success and 'reply' in data:
            actions = data.get('actions')
            if actions and 'add_items' in actions:
                add_items = actions['add_items']
                if (len(add_items) > 0 and 
                    add_items[0]['quantity'] == 2 and
                    actions.get('set_allergy') and
                    actions.get('set_spicy') == 'medium'):
                    self.log_result("AI Chat - Order with Actions", True, 
                        f"Added {add_items[0]['quantity']} {add_items[0]['name']}")
                else:
                    self.log_result("AI Chat - Order with Actions", False, f"Invalid actions: {actions}")
            else:
                self.log_result("AI Chat - Order with Actions", False, "No add_items action found")
        else:
            self.log_result("AI Chat - Order with Actions", False, f"Status: {status}, Data: {data}")
            
        # Test 3: Multi-turn conversation (history persistence)
        chat_data['message'] = "Actually, can you also add a Caesar Salad?"
        
        success, data, status = self.make_request('POST', 'chat', chat_data)
        if success and 'reply' in data:
            actions = data.get('actions')
            if actions and 'add_items' in actions:
                salad_item = next((item for item in actions['add_items'] 
                                 if 'Caesar' in item['name']), None)
                if salad_item:
                    self.log_result("AI Chat - Multi-turn Context", True, 
                        f"Added {salad_item['name']} in follow-up")
                else:
                    self.log_result("AI Chat - Multi-turn Context", False, "Salad not found in actions")
            else:
                self.log_result("AI Chat - Multi-turn Context", False, "No actions in follow-up")
        else:
            self.log_result("AI Chat - Multi-turn Context", False, f"Status: {status}, Data: {data}")
            
        # Test 4: Spanish language
        chat_data_es = {
            "sessionId": str(uuid.uuid4()),  # New session for Spanish
            "restaurantId": restaurant_id,
            "tableId": table_id,
            "language": "es",
            "message": "Hola, ¿qué me recomienda?",
            "menu": menu_for_chat,
            "cart": [],
            "stage": "browsing"
        }
        
        success, data, status = self.make_request('POST', 'chat', chat_data_es)
        if success and 'reply' in data:
            reply = data['reply']
            # Check if reply contains Spanish words (basic check)
            spanish_indicators = ['hola', 'qué', 'cómo', 'gracias', 'por favor', 'recomiendo', 'menú']
            has_spanish = any(word.lower() in reply.lower() for word in spanish_indicators)
            if has_spanish:
                self.log_result("AI Chat - Spanish Language", True, "Response contains Spanish")
            else:
                self.log_result("AI Chat - Spanish Language", False, "Response doesn't appear to be in Spanish")
        else:
            self.log_result("AI Chat - Spanish Language", False, f"Status: {status}, Data: {data}")

    def test_feedback(self):
        """Test feedback submission"""
        if not all(key in self.test_data for key in ['restaurant', 'tables', 'order']):
            self.log_result("Feedback", False, "Missing required test data")
            return
            
        feedback_data = {
            "restaurantId": self.test_data['restaurant']['id'],
            "tableId": self.test_data['tables'][0]['id'],
            "orderId": self.test_data['order']['id'],
            "rating": 5,
            "comment": "Excellent food and service! The AI waiter was very helpful."
        }
        
        success, data, status = self.make_request('POST', 'feedback', feedback_data)
        if success and data.get('ok'):
            self.log_result("Feedback Submission", True, "Feedback submitted successfully")
        else:
            self.log_result("Feedback Submission", False, f"Status: {status}, Data: {data}")

    def test_restaurant_deletion_cascade(self):
        """Test restaurant deletion with cascade"""
        if 'restaurant' not in self.test_data:
            self.log_result("Restaurant Deletion Cascade", False, "No restaurant available for deletion testing")
            return
            
        restaurant_id = self.test_data['restaurant']['id']
        
        # Delete restaurant (should cascade delete menu, tables, orders)
        success, data, status = self.make_request('DELETE', f'restaurants/{restaurant_id}')
        if success and data.get('ok'):
            self.log_result("Restaurant Deletion", True, "Restaurant deleted successfully")
            
            # Verify cascade deletions
            # Check menu items are deleted
            success, data, status = self.make_request('GET', 'menu', params={'restaurantId': restaurant_id})
            if success and len(data.get('menu', [])) == 0:
                self.log_result("Cascade Delete - Menu", True, "Menu items deleted")
            else:
                self.log_result("Cascade Delete - Menu", False, "Menu items not deleted")
                
            # Check tables are deleted
            success, data, status = self.make_request('GET', 'tables', params={'restaurantId': restaurant_id})
            if success and len(data.get('tables', [])) == 0:
                self.log_result("Cascade Delete - Tables", True, "Tables deleted")
            else:
                self.log_result("Cascade Delete - Tables", False, "Tables not deleted")
                
            # Check orders are deleted
            success, data, status = self.make_request('GET', 'orders', params={'restaurantId': restaurant_id})
            if success and len(data.get('orders', [])) == 0:
                self.log_result("Cascade Delete - Orders", True, "Orders deleted")
            else:
                self.log_result("Cascade Delete - Orders", False, "Orders not deleted")
        else:
            self.log_result("Restaurant Deletion", False, f"Status: {status}, Data: {data}")

    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting Netrik Shop Backend Tests")
        print(f"📍 Base URL: {BASE_URL}")
        print(f"🔗 API Base: {API_BASE}")
        print("=" * 60)
        
        # Run tests in logical order
        self.test_health_check()
        self.test_central_auth()
        self.test_restaurant_crud()
        self.test_menu_crud()
        self.test_tables_crud()
        self.test_orders_flow()
        self.test_payment_demo()
        self.test_analytics()
        self.test_ai_waiter_chat()
        self.test_feedback()
        self.test_restaurant_deletion_cascade()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.results if r['success'])
        total = len(self.results)
        
        for result in self.results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}")
            
        print(f"\n🎯 Results: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
        
        if passed == total:
            print("🎉 All tests passed! Backend is working correctly.")
        else:
            print("⚠️  Some tests failed. Check the details above.")
            
        return passed == total

if __name__ == "__main__":
    tester = NetrikShopTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)