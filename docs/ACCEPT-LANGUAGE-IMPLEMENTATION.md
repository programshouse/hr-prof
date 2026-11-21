# Accept-Language Header Implementation

## Overview
This implementation ensures that the frontend automatically sends the `Accept-Language` header to the backend with every API request, allowing the backend to respond with localized content based on the user's current language preference.

## Implementation Details

### Files Modified
1. **`src/services/http/axiosClient.js`** - Main authenticated API client
2. **`src/services/http/publicAxiosClient.js`** - Public API client (no authentication)

### Changes Made

#### 1. axiosClient.js
```javascript
import i18n from '@/i18n';

// Request interceptor now includes:
config.headers['Accept-Language'] = i18n.language;
```

#### 2. publicAxiosClient.js
```javascript
import i18n from '@/i18n';

// Added request interceptor:
publicAxiosClient.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    config.headers['Accept-Language'] = i18n.language;
    return config;
  },
  (error) => Promise.reject(error)
);
```

### How It Works

1. **Language Detection**: The system uses `react-i18next` for internationalization
2. **Current Language**: `i18n.language` contains the current language ('en' or 'ar')
3. **Automatic Header**: Every API request automatically includes `Accept-Language: {language}`
4. **Dynamic Updates**: When users change language, new requests use the updated language

### Example Request Headers
```http
GET /api/hr/rewards
Authorization: Bearer {token}
Accept-Language: en
Content-Type: application/json
```

### Language Switching
When users toggle language using the `LanguageSwitcher` component:
- English: `Accept-Language: en`
- Arabic: `Accept-Language: ar`

### Backend Integration
The backend should:
1. Read the `Accept-Language` header from incoming requests
2. Use it to determine response language
3. Return localized responses based on the language value

### Testing
A test file is provided at `test-accept-language.js` to verify the implementation:
```javascript
// In browser console:
testAcceptLanguageHeader();  // Test current language headers
testLanguageChange();        // Test language switching
```

## Benefits

1. **Automatic**: No manual header management required
2. **Consistent**: All API requests include the language header
3. **Dynamic**: Responds to language changes immediately
4. **Backend Ready**: Backend can easily detect and handle language preferences

## Notes

- The implementation uses the current i18n language dynamically
- Both authenticated and public API clients include the header
- No additional configuration is required in components
- The header is added before authentication headers to ensure consistency
