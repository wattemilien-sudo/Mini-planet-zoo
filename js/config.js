export const GAME_CONFIG = {
    animals: {
        kangaroo: { 
            name: 'Kangaroo', 
            emoji: '🦘', 
            habitat: 'savanna', 
            cost: 500, 
            appeal: 45, 
            modelType: 'kangaroo' 
        },
        lion: { 
            name: 'Lion', 
            emoji: '🦁', 
            habitat: 'savanna', 
            cost: 1200, 
            appeal: 85, 
            modelType: 'quadruped' 
        },
        penguin: { 
            name: 'Penguin', 
            emoji: '🐧', 
            habitat: 'tundra', 
            cost: 300, 
            appeal: 30, 
            modelType: 'biped' 
        }
    },
    
    shops: {
        iceCream: { 
            name: 'Ice Cream Stand', 
            emoji: '🍦', 
            cost: 250, 
            revenue: 12 
        },
        giftShop: { 
            name: 'Gift Shop', 
            emoji: '🎁', 
            cost: 600, 
            revenue: 25 
        },
        restroom: { 
            name: 'Restroom', 
            emoji: '🚻', 
            cost: 150, 
            appeal: 5 
        }
    },

    habitats: {
        savanna: { 
            name: 'Savanna Habitat', 
            cost: 100, 
            color: 0xd4a373 
        },
        tundra: { 
            name: 'Tundra Habitat', 
            cost: 130, 
            color: 0x90e0ef 
        }
    },

    tools: {
        path: { cost: 10 },
        bulldozer: { cost: 0 }
    }
};
