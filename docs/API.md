# Digital Atlas API Documentation

## Base URL
http://localhost:3001/api

## Response Format
All responses follow this format:
```json
{
  "success": true|false,
  "data": {...} | [...],
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {...}
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}

Available Endpoints
General

GET /api - API information
GET /api/health - Health check
GET /api/test-db - Database connection test

Authentication (Coming soon)

POST /api/auth/login - User login
POST /api/auth/logout - User logout
POST /api/auth/refresh - Refresh token

Objects (Coming soon)

GET /api/objects - Get all objects with filters
GET /api/objects/:id - Get object by ID
POST /api/objects - Create new object (admin)
PUT /api/objects/:id - Update object (admin)
DELETE /api/objects/:id - Delete object (admin)

Error Codes

INTERNAL_ERROR - Internal server error
NOT_FOUND - Resource not found
VALIDATION_ERROR - Validation failed
UNAUTHORIZED - Authentication required
FORBIDDEN - Access denied
RATE_LIMIT_EXCEEDED - Too many requests
EOF

## Objects API

### Get Objects List
GET /api/objects?lang=ru&page=1&limit=20

Query Parameters:
- `lang` - Language code (ru/kz/en), default: ru
- `page` - Page number, default: 1
- `limit` - Items per page (max 100), default: 20
- `search` - Search in name and address
- `infrastructureTypeIds` - Comma-separated IDs or array
- `priorityDirectionIds` - Comma-separated IDs or array
- `regionId` - Region ID
- `isPublished` - Filter by publish status (true/false)
- `geocodingStatus` - Filter by geocoding status
- `hasCoordinates` - Filter by coordinates presence (true/false)

### Get Object by ID
GET /api/objects/:id?lang=ru

### Create Object (Admin only)
POST /api/objects
Authorization: Bearer {token}
{
"infrastructureTypeId": 2,
"regionId": 2,
"latitude": 43.238949,
"longitude": 76.889709,
"googleMapsUrl": "https://maps.app.goo.gl/...",
"website": "https://example.kz",
"translations": {
"ru": {
"name": "Название объекта",
"address": "Адрес объекта",
"isPublished": true
},
"kz": {
"name": "Нысан атауы",
"address": "Нысан мекенжайы",
"isPublished": true
}
},
"phones": [
{
"number": "+77001234567",
"type": "MAIN"
}
],
"priorityDirectionIds": [1, 2],
"organizations": [
{
"name": "Организация",
"website": "https://org.kz"
}
]
}

### Update Object (Admin only)
PUT /api/objects/:id
Authorization: Bearer {token}
{
// Same structure as create, all fields optional
}

### Delete Object (Admin only)
DELETE /api/objects/:id
Authorization: Bearer {token}

### Get Objects Statistics (Admin only)
GET /api/objects/stats/summary
Authorization: Bearer {token}

## Reference Data API

### Get Infrastructure Types
GET /api/references/infrastructure-types?lang=ru

### Get Regions
GET /api/references/regions?lang=ru

### Get Priority Directions
GET /api/references/priority-directions