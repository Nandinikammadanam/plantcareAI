export const schema = {
  "tables": {
    "plants": {
      "type": "collection",
      "fields": {
        "name": {
          "type": "string",
          "indexed": true
        },
        "species": {
          "type": "string",
          "indexed": true
        },
        "image": {
          "type": "string",
          "indexed": true
        },
        "wateringFrequency": {
          "type": "number",
          "indexed": true
        },
        "lastWatered": {
          "type": "string",
          "indexed": true
        },
        "notes": {
          "type": "string",
          "indexed": true
        },
        "isPremium": {
          "type": "boolean",
          "indexed": true
        }
      }
    },
    "reminders": {
      "type": "collection",
      "fields": {
        "plantId": {
          "type": "string",
          "indexed": true
        },
        "type": {
          "type": "string",
          "indexed": true
        },
        "date": {
          "type": "string",
          "indexed": true
        },
        "isCompleted": {
          "type": "boolean",
          "indexed": true
        },
        "notes": {
          "type": "string",
          "indexed": true
        }
      }
    },
    "identifications": {
      "type": "collection",
      "fields": {
        "imageUrl": {
          "type": "string",
          "indexed": true
        },
        "result": {
          "type": "string",
          "indexed": true
        },
        "confidence": {
          "type": "number",
          "indexed": true
        },
        "date": {
          "type": "string",
          "indexed": true
        },
        "notes": {
          "type": "string",
          "indexed": true
        }
      }
    },
    "settings": {
      "type": "collection",
      "fields": {
        "userId": {
          "type": "string",
          "indexed": true
        },
        "isPremium": {
          "type": "boolean",
          "indexed": true
        },
        "notificationsEnabled": {
          "type": "boolean",
          "indexed": true
        },
        "darkMode": {
          "type": "boolean",
          "indexed": true
        },
        "language": {
          "type": "string",
          "indexed": true
        }
      }
    }
  },
  "version": 1,
  "project_id": "40b28d84-64a0-48b0-8994-c4d108399cf1"
};