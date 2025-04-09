# object-processor

A TypeScript library for processing objects with support for both ESM and CommonJS.

## Installation

```bash
npm i @waivio/objects-processor
```

## Usage

```typescript
import { ObjectProcessor } from '@waivio/objects-processor';

// Initialize the processor with required functions
const processor = new ObjectProcessor({
    // Function to find parent objects by their permlinks
    findParentsByPermlink: async (permlinks: string[]) => {
        // Implement your logic to fetch parent objects
        return [];
    },
    
    // Function to get Waivio admins and owner
    getWaivioAdminsAndOwner: async () => {
        // Implement your logic to get admins and owner
        return [];
    },
    
    // Function to get blacklisted users
    getBlacklist: async (admins: string[]) => {
        // Implement your logic to get blacklist
        return [];
    },
    
    // Function to get objects by their group IDs
    getObjectsByGroupId: async (ids: string[]) => {
        // Implement your logic to fetch objects by group IDs
        return [];
    },
    
    // Master account username
    masterAccount: 'your-master-account'
});

// Process objects
const processedObjects = await processor.processWobjects({
    wobjects: [/* your objects */],
    fields: ['field1', 'field2'], // Optional: specific fields to process
    locale: 'en-US', // Optional: default is 'en-US'
    app: {
        owner: 'app-owner',
        admins: ['admin1', 'admin2'],
        authority: ['auth1', 'auth2']
    },
    hiveData: false, // Optional: include Hive data
    returnArray: true, // Optional: return array or single object
    topTagsLimit: 2, // Optional: limit for top tags
    countryCode: 'US', // Optional: country code for affiliate links
    reqUserName: 'username', // Optional: requesting user
    affiliateCodes: [], // Optional: affiliate codes
    mobile: false // Optional: mobile view flag
});

// Get top tags for an object
const topTags = processor.getTopTags(object, 2);

// Get default link for an object
const defaultLink = processor.getDefaultLink(object);

// Get link to page load
const pageLink = processor.getLinkToPageLoad(object, false);
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Development mode
npm run dev
```

## License

MIT 
