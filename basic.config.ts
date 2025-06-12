export const schema = {
  project_id: "40b28d84-64a0-48b0-8994-c4d108399cf1",
  version: 0,
  tables: {
    plants: {
      type: 'collection',
      fields: {
        name: {
          type: 'string',
        },
        species: {
          type: 'string',
        },
        image: {
          type: 'string',
        },
        wateringFrequency: {
          type: 'number',
        },
        lastWatered: {
          type: 'string',
        },
        notes: {
          type: 'string',
        },
        isPremium: {
          type: 'boolean',
        },
      },
    },
    reminders: {
      type: 'collection',
      fields: {
        plantId: {
          type: 'string',
        },
        type: {
          type: 'string',
        },
        date: {
          type: 'string',
        },
        isCompleted: {
          type: 'boolean',
        },
        notes: {
          type: 'string',
        },
      },
    },
    identifications: {
      type: 'collection',
      fields: {
        imageUrl: {
          type: 'string',
        },
        result: {
          type: 'string',
        },
        confidence: {
          type: 'number',
        },
        date: {
          type: 'string',
        },
        notes: {
          type: 'string',
        },
      },
    },
    settings: {
      type: 'collection',
      fields: {
        userId: {
          type: 'string',
        },
        isPremium: {
          type: 'boolean',
        },
        notificationsEnabled: {
          type: 'boolean',
        },
        darkMode: {
          type: 'boolean',
        },
        language: {
          type: 'string',
        },
      },
    },
  },
};