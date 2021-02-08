var bbq = bbq || {};
bbq.buildings = bbq.buildings || {};

bbq.buildings.configuration = {
    Hut: {
        vision: 0,
        turnsTilCap: 2,
        foodProduced: 10,
        defaultImagePath: 'assets/Buildings/hut_$(team).png',
        commands: ['Train']
    },

    Farm: {
        vision: 0,
        turnsTilCap: 2,
        foodProduced: 20,
        defaultImagePath: 'assets/Buildings/farm_$(team).png'
    },

    HQ: {
        vision: 0,
        turnsTilCap: 4,
        foodProduced: 10,
        defaultImagePath: 'assets/Buildings/hq_$(team).png'
    }
};