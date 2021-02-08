if (!window.bbq) { window.bbq = {}; }
if (!bbq.maps) { bbq.maps = {}; }

bbq.maps.testmap = {
    mapid: 'testmap',
    tileset: 'forest',
    width: 21,
    height: 11,
    terrain: 'ggggggggggggggggggggg|dddddddddwwwggggggggg|ggggggggddwgggggggggg|ggggggggdwwwggggggggg|ggggggggdwwwggggggggg|wwwwwwggdddddggwwwwww|gggggggggwwwdgggggggg|gggggggggwwwdgggggggg|ggggggggggwddgggggggg|gggggggggwwwddddddddd|ggggggggggggggggggggg',
    props: 'ggggTgTggHHHggggggggR|dddddddddwwwgRBgggggR|gggHRRRRddwggRRgggggR|gggggggTdwwwggRgTgggg|TTgggggBdwwwBgRggggTT|wwwwwwHHdddddHHwwwwww|TTggggRgBwwwdBgggggTT|ggggTgRggwwwdTggggggg|RgggggRRggwddRRRRHggg|RgggggBRgwwwddddddddd|RggggggggHHHggTgTgggg',
    averageTurnsToWin: 20,
    startstate: {
        '_0_':
            {
                food: 10,
                turn: 1,
                team: 'Blue',
                buildings: [
                    { type: 'HQ', location: { x: 1, y: 9 }, turnsUntilCapture: 1 },
                    { type: 'Hut', location: { x: 1, y: 8 }, turnsUntilCapture: 1 },
                    { type: 'Hut', location: { x: 1, y: 10 }, turnsUntilCapture: 1 },
                    { type: 'Hut', location: { x: 2, y: 9 }, turnsUntilCapture: 1 }
                ],
                units: [
                ]
            },

        '_1_':
            {
                food: 10,
                turn: 1,
                team: 'Red',
                buildings: [
                    { type: 'HQ', location: { x: 19, y: 1 }, turnsUntilCapture: 1 },
                    { type: 'Hut', location: { x: 19, y: 0 }, turnsUntilCapture: 1 },
                    { type: 'Hut', location: { x: 18, y: 1 }, turnsUntilCapture: 1 },
                    { type: 'Hut', location: { x: 19, y: 2 }, turnsUntilCapture: 1 }
                ],
                units: [
                ]
            },

        '_neutral_': 
            {
                food: 0,
                turn: 0,
                team: 'Neutral',
                buildings: [
                    { type: 'Hut', location: { x: 1, y: 1 }, turnsUntilCapture: 1 },
                    { type: 'Hut', location: { x: 8, y: 1 }, turnsUntilCapture: 1 },
                    { type: 'Hut', location: { x: 10, y: 5 }, turnsUntilCapture: 1 },
                    { type: 'Hut', location: { x: 12, y: 9 }, turnsUntilCapture: 1 },
                    { type: 'Hut', location: { x: 19, y: 9 }, turnsUntilCapture: 1 }
                ]
            }        
    }  // startState
};


bbq.maps.maninthemiddle = {
    mapid : 'maninthemiddle',
    tileset : 'forest',
    width : 13,
    height : 17,
    terrain : 'ddddddddddddd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|ddddddddddddd|dwdwwdddwwdwd|ddddddddddddd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|ddddddddddddd',
    props : '..t...t...t..|.............|HR..T...B..RH|HR.........RH|HR....t....RH|HR.TB...BT.RH|H.....T.....H|f...........f|..t..q.q..t..|f...........f|H.....T.....H|HR.TB...BT.RH|HR....t....RH|HR.........RH|HR..B...T..RH|.............|..t...t...t..',
    averageTurnsToWin : 20,
    startstate : {
        '_0_' : 
            {
                food : 10,
                turn : 1,
                team : 'Blue',
                buildings : [
                    { type : 'HQ', location: { x:5, y:8 }, turnsUntilCapture: 4 },
                    { type : 'Hut', location: { x:2, y:0 }, turnsUntilCapture: 2 },
                    { type : 'Hut', location: { x:6, y:0 }, turnsUntilCapture: 2 },
                    { type : 'Hut', location: { x:10, y:0 }, turnsUntilCapture: 2 }                   
                ],
                units : [
                    { type:'DartBlower', location: { x:6, y:1 }, hp:5, state:'idle' }
                ]
            } , // PlayerState
        
        '_1_' : 
            {
                food : 10,
                turn : 1,
                team : 'Red',
                buildings : [
                    { type : 'HQ', location: { x:7, y:8 }, turnsUntilCapture: 4 },
                    { type : 'Hut', location: { x:2, y:16 }, turnsUntilCapture: 2 },
                    { type : 'Hut', location: { x:6, y:16 }, turnsUntilCapture: 2 },
                    { type : 'Hut', location: { x:10, y:16 }, turnsUntilCapture: 2 }
                ],
                units : [
                    { type:'DartBlower', location: { x:6, y:15 }, hp:5, state:'idle' } 
                ]
            }, // PlayerState
        
        '_neutral_' : 
            {
                food : 0,
                turn : 0,
                team : 'Neutral',
                buildings : [
                    { type : 'Farm', location: { x:0, y:7 }, turnsUntilCapture: 2 },
                    { type : 'Farm', location: { x:12, y:7 }, turnsUntilCapture: 2 },
                    { type : 'Farm', location: { x:0, y:9 }, turnsUntilCapture: 2 },
                    { type : 'Farm', location: { x:12, y:9 }, turnsUntilCapture: 2 },
                    
                    { type : 'Hut', location: { x:2, y:8 }, turnsUntilCapture: 2 },
                    { type : 'Hut', location: { x:10, y:8 }, turnsUntilCapture: 2 },
                    { type : 'Hut', location: { x:6, y:4 }, turnsUntilCapture: 2 },
                    { type : 'Hut', location: { x:6, y:12 }, turnsUntilCapture: 2 } 
                ]
            }
        
    }  // startState
}; // maninthemiddle