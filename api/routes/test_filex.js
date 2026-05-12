 POST http://165.22.227.234:5000/api/register HTTP/1.1
 content-type: application/json

 {
     "username": "testuser",
     "email": "test@example.com",
     "password": "Password123!",
     "first_name": "Test",
     "last_name": "User",
     "department": "IT",   
     "title": "Developer"  
 }

 POST http://165.22.227.234:5000/api/login HTTP/1.1
 content-type: application/json

 {
    
      "username": "test@example.com",
     "password": "Password123!"
 }

 GET http://165.22.227.234:5000/api/staff HTTP/1.1
 content-type: application/json
 x-auth-token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoyLCJ1c2VybmFtZSI6ImFrd2F0dWhhIiwiZW1haWwiOiJrd2F0dWhhQGdtYWlsLmNvbSIsInJvbGUiOiJiYXNpY191c2VyIn0sImlhdCI6MTc1MjY3MzkwNCwiZXhwIjoxNzUyNjc3NTA0fQ.tpbuAwNJwZo0Rj_2mkqHc9ywlsMB85DFtbsYNv6b_d4
