var gamestateImport = require('../libs/gamestate.js');
var PlayerState = gamestateImport.PlayerState;
var GameState = gamestateImport.GameState;
var UnitState = gamestateImport.UnitState;
var BuildingState = gamestateImport.BuildingState; 

var MapData = require('../libs/mapdata.js').MapData;

var Maps = {
    "testmap": {
        "mapid": "testmap",
        "tileset": "forest",
        "width": 21,
        "height": 11,
        "terrain": "ggggggggggggggggggggg|dddddddddwwwggggggggg|ggggggggddwgggggggggg|ggggggggdwwwggggggggg|ggggggggdwwwggggggggg|wwwwwwggdddddggwwwwww|gggggggggwwwdgggggggg|gggggggggwwwdgggggggg|ggggggggggwddgggggggg|gggggggggwwwddddddddd|ggggggggggggggggggggg",
        "props": "ggggTgTggHHHggggggggR|dddddddddwwwgRBgggggR|gggHRRRRddwggRRgggggR|gggggggTdwwwggRgTgggg|TTgggggBdwwwBgRggggTT|wwwwwwHHdddddHHwwwwww|TTggggRgBwwwdBgggggTT|ggggTgRggwwwdTggggggg|RgggggRRggwddRRRRHggg|RgggggBRgwwwddddddddd|RggggggggHHHggTgTgggg",
        "averageTurnsToWin": 20,
        "startstate": {
            "_0_": {
                "food": 60,
                "turn": 1,
                "team": "Blue",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 1,
                          "y": 9
                      },
                      "turnsUntilCapture": 1
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 1,
                          "y": 8
                      },
                      "turnsUntilCapture": 1
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 1,
                          "y": 10
                      },
                      "turnsUntilCapture": 1
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 2,
                          "y": 9
                      },
                      "turnsUntilCapture": 1
                  }
                ],
                "units": []
            },
            "_1_": {
                "food": 60,
                "turn": 1,
                "team": "Red",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 19,
                          "y": 1
                      },
                      "turnsUntilCapture": 1
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 19,
                          "y": 0
                      },
                      "turnsUntilCapture": 1
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 18,
                          "y": 1
                      },
                      "turnsUntilCapture": 1
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 19,
                          "y": 2
                      },
                      "turnsUntilCapture": 1
                  }
                ],
                "units": []
            },
            "_neutral_": {
                "food": 0,
                "turn": 0,
                "team": "Neutral",
                "buildings": [
                  {
                      "type": "Hut",
                      "location": {
                          "x": 1,
                          "y": 1
                      },
                      "turnsUntilCapture": 1
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 8,
                          "y": 1
                      },
                      "turnsUntilCapture": 1
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 10,
                          "y": 5
                      },
                      "turnsUntilCapture": 1
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 12,
                          "y": 9
                      },
                      "turnsUntilCapture": 1
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 19,
                          "y": 9
                      },
                      "turnsUntilCapture": 1
                  }
                ]
            }
        }
    },
    "maninthemiddle": {
        "mapid": "maninthemiddle",
        "tileset": "forest",
        "width": 13,
        "height": 17,
        "terrain": "ddddddddddddd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|ddddddddddddd|dwdwwdddwwdwd|ddddddddddddd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|ddddddddddddd",
        "props": "..t...t...t..|.............|HR..T...B..RH|HR.........RH|HR....t....RH|HR.TB...BT.RH|H.....T.....H|f...........f|..t..q.q..t..|f...........f|H.....T.....H|HR.TB...BT.RH|HR....t....RH|HR.........RH|HR..B...T..RH|.............|..t...t...t..",
        "averageTurnsToWin": 20,
        "startstate": {
            "_0_": {
                "food": 60,
                "turn": 1,
                "team": "Blue",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 5,
                          "y": 8
                      },
                      "turnsUntilCapture": 4
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 2,
                          "y": 0
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 6,
                          "y": 0
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 10,
                          "y": 0
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": [
                  {
                      "type": "DartBlower",
                      "location": {
                          "x": 6,
                          "y": 1
                      },
                      "hp": 5,
                      "state": "idle"
                  }
                ]
            },
            "_1_": {
                "food": 60,
                "turn": 1,
                "team": "Red",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 7,
                          "y": 8
                      },
                      "turnsUntilCapture": 4
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 2,
                          "y": 16
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 6,
                          "y": 16
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 10,
                          "y": 16
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": [
                  {
                      "type": "DartBlower",
                      "location": {
                          "x": 6,
                          "y": 15
                      },
                      "hp": 5,
                      "state": "idle"
                  }
                ]
            },
            "_neutral_": {
                "food": 0,
                "turn": 0,
                "team": "Neutral",
                "buildings": [
                  {
                      "type": "Farm",
                      "location": {
                          "x": 0,
                          "y": 7
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 12,
                          "y": 7
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 0,
                          "y": 9
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 12,
                          "y": 9
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 2,
                          "y": 8
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 10,
                          "y": 8
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 6,
                          "y": 4
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 6,
                          "y": 12
                      },
                      "turnsUntilCapture": 2
                  }
                ]
            }
        }
    },
    "boulderLine": {
        "tileset": "Forest",
        "mapid": "boulderLine",
        "width": 15,
        "height": 15,
        "terrain": "ggggggwwwgggggg|ggggggwgwgggggg|ggggggwwwgggggg|ggggggggggggggg|ggggggggggggggg|ggggggggggggggg|dddggwwgwwggddd|dddggwwgwwggddd|dddggwwgwwggddd|gdgggggggggggdg|gdgggggggggggdg|gdgggggggggggdg|gdddddddddddddg|ggggggggggggggg|wwwwwwgggwwwwww",
        "props": "..HHHH...HHHH..|....B..H..B....|...............|....B..R..B....|.......R.......|.......R.......|.......R.......|.......R.......|.......R.......|.......R.......|....B..R..B....|......TRT......|...............|......HHH......|......HHH......",
        "averageTurnsToWin": 20,
        "startstate": {
            "_0_": {
                "food": 60,
                "turn": 1,
                "team": "Blue",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 13,
                          "y": 7
                      },
                      "turnsUntilCapture": 3
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 13,
                          "y": 6
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 13,
                          "y": 8
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 12,
                          "y": 7
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 14,
                          "y": 7
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": []
            },
            "_1_": {
                "food": 60,
                "turn": 1,
                "team": "Red",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 1,
                          "y": 7
                      },
                      "turnsUntilCapture": 3
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 1,
                          "y": 6
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 1,
                          "y": 8
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 0,
                          "y": 7
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 2,
                          "y": 7
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": []
            },
            "_neutral_": {
                "food": 60,
                "turn": 0,
                "team": "Neutral",
                "buildings": [
                  {
                      "type": "Hut",
                      "location": {
                          "x": 2,
                          "y": 12
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 12,
                          "y": 12
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 12,
                          "y": 2
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 2,
                          "y": 2
                      },
                      "turnsUntilCapture": 2
                  }
                ]
            }
        }
    },
    "thelaststand": {
        "tileset": "forest",
        "mapid": "thelaststand",
        "width": 20,
        "height": 7,
        "terrain": "gggggggggggwgggggggg|gggggggggggggggggggg|gggggggggggggggggggg|gggggggggggggggggggg|gggggggggggggggggggg|gggggggggggggggggggg|ggggggggwggggggggggg",
        "props": "B.....HH.....R.....B|H...........RR.....H|B...B....TH....B...B|H....B...HH...B....H|B...B....HT....B...B|H.....RR...........H|B.....R.....HH.....B",
        "averageTurnsToWin": 20,
        "startstate": {
            "_0_": {
                "food": 60,
                "turn": 1,
                "team": "Blue",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 1,
                          "y": 3
                      },
                      "turnsUntilCapture": 3
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 1,
                          "y": 1
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 1,
                          "y": 5
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 2,
                          "y": 0
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 2,
                          "y": 6
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": []
            },
            "_1_": {
                "food": 60,
                "turn": 1,
                "team": "Red",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 18,
                          "y": 3
                      },
                      "turnsUntilCapture": 3
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 18,
                          "y": 1
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 18,
                          "y": 5
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 17,
                          "y": 0
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 17,
                          "y": 6
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": []
            },
            "_neutral_": {
                "food": 60,
                "turn": 0,
                "team": "Neutral",
                "buildings": [
                  {
                      "type": "Hut",
                      "location": {
                          "x": 12,
                          "y": 0
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 7,
                          "y": 6
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 7,
                          "y": 1
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 12,
                          "y": 5
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 4,
                          "y": 3
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 15,
                          "y": 3
                      },
                      "turnsUntilCapture": 2
                  }
                ]
            }
        }
    },
    "crossbridges": {
        "tileset": "forest",
        "mapid": "crossbridges",
        "width": 15,
        "height": 15,
        "terrain": "gggggggggggggww|ggggggggggggdww|gggggggggggdddg|ggggggggggwwdgg|gggggggggwwwggg|ggggggggwgwgggg|gggggggwwwggggg|ggggggwgwgggggg|gggggwwwggggggg|ggggwgwgggggggg|gggwwwggggggggg|ggdwwgggggggggg|gdddggggggggggg|wwdgggggggggggg|wwggggggggggggg",
        "props": "RRRR...........|R..............|R.........R....|R....B...B.....|........H...R..|...B...H...B...|......B...H....|.....H.T.H.....|....H...B......|...B...H...B...|..R...H........|.....B...B....R|....R.........R|..............R|...........RRRR",
        "averageTurnsToWin": 20,
        "startstate": {
            "_0_": {
                "food": 60,
                "turn": 1,
                "team": "Blue",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 1,
                          "y": 1
                      },
                      "turnsUntilCapture": 3
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 1,
                          "y": 3
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 2,
                          "y": 2
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 3,
                          "y": 1
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": []
            },
            "_1_": {
                "food": 60,
                "turn": 1,
                "team": "Red",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 13,
                          "y": 13
                      },
                      "turnsUntilCapture": 3
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 12,
                          "y": 12
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 13,
                          "y": 11
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 11,
                          "y": 13
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": []
            },
            "_neutral_": {
                "food": 60,
                "turn": 0,
                "team": "Neutral",
                "buildings": [
                  {
                      "type": "Hut",
                      "location": {
                          "x": 12,
                          "y": 2
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 2,
                          "y": 12
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 5,
                          "y": 9
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 9,
                          "y": 5
                      },
                      "turnsUntilCapture": 2
                  }
                ]
            }
        }
    },
    "riverbends": {
        "tileset": "Forest",
        "mapid": "riverbends",
        "width": 10,
        "height": 22,
        "terrain": "gggggggggg|wwwwwwgggg|gggggwwwww|gggggggggg|dggggggggg|dddddddddg|dggggggggg|gggggggggg|wwwwwggggw|wgddddddgw|wgdggggdgw|wgdggggdgw|wgddddddgw|wggggwwwww|gggggggggg|gggggggggd|gddddddddd|gggggggggd|gggggggggg|wwwwwggggg|ggggwwwwww|gggggggggg",
        "props": "TTTTTTTTTT|......B..B|..........|..........|..........|........B.|..........|RRRRRRR..T|.....HH...|..........|.H...T..H.|.H..T...H.|..........|...HH.....|T..RRRRRRR|..........|.B........|..........|..........|..........|B..B......|TTTTTTTTTT",
        "averageTurnsToWin": 20,
        "startstate": {
            "_0_": {
                "food": 60,
                "turn": 1,
                "team": "Blue",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 0,
                          "y": 5
                      },
                      "turnsUntilCapture": 3
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 0,
                          "y": 4
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 1,
                          "y": 5
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 0,
                          "y": 6
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": []
            },
            "_1_": {
                "food": 60,
                "turn": 1,
                "team": "Red",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 9,
                          "y": 16
                      },
                      "turnsUntilCapture": 3
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 9,
                          "y": 15
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 8,
                          "y": 16
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 9,
                          "y": 17
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": []
            },
            "_neutral_": {
                "food": 60,
                "turn": 0,
                "team": "Neutral",
                "buildings": [
                  {
                      "type": "Farm",
                      "location": {
                          "x": 8,
                          "y": 1
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 1,
                          "y": 20
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 3,
                          "y": 10
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 6,
                          "y": 11
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 7,
                          "y": 1
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 2,
                          "y": 20
                      },
                      "turnsUntilCapture": 2
                  }
                ]
            }
        }
    },
    "hiddenquarry": {
        "tileset": "Forest",
        "mapid": "hiddenquarry",
        "width": 20,
        "height": 20,
        "terrain": "gggggggggggggggggggg|gggggggggggggggggggg|ggddddddddddddddddgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggddddddddddddddddgg|gggggggggggggggggggg|gggggggggggggggggggg",
        "props": "TTTTTTTTTTTTTTTTTTTT|T..................T|T..................T|T..................T|T...RRRRRRRRRRRR...T|T...RRRRR..RRRRR...T|TH..R..RR..RR..R..HT|T...R..........R...T|TB..RRR......RRR..BT|T....H...HH........T|T........HH...H....T|TB..RRR......RRR..BT|T...R..........R...T|TH..R..RR..RR..R..HT|T...RRRRR..RRRRR...T|T...RRRRRRRRRRRR...T|T..................T|T..................T|T..................T|TTTTTTTTTTTTTTTTTTTT",
        "averageTurnsToWin": 20,
        "startstate": {
            "_0_": {
                "food": 60,
                "turn": 1,
                "team": "Blue",
                "buildings": [
                  {
                      "type": "Hut",
                      "location": {
                          "x": 15,
                          "y": 2
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 13,
                          "y": 2
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "HQ",
                      "location": {
                          "x": 9,
                          "y": 2
                      },
                      "turnsUntilCapture": 3
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 4,
                          "y": 2
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 6,
                          "y": 2
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": []
            },
            "_1_": {
                "food": 60,
                "turn": 1,
                "team": "Red",
                "buildings": [
                  {
                      "type": "Hut",
                      "location": {
                          "x": 6,
                          "y": 17
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 4,
                          "y": 17
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 15,
                          "y": 17
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "HQ",
                      "location": {
                          "x": 10,
                          "y": 17
                      },
                      "turnsUntilCapture": 3
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 13,
                          "y": 17
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": []
            },
            "_neutral_": {
                "food": 60,
                "turn": 0,
                "team": "Neutral",
                "buildings": [
                  {
                      "type": "Hut",
                      "location": {
                          "x": 5,
                          "y": 6
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 14,
                          "y": 6
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 14,
                          "y": 13
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 5,
                          "y": 13
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 9,
                          "y": 14
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 10,
                          "y": 14
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 9,
                          "y": 5
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 10,
                          "y": 5
                      },
                      "turnsUntilCapture": 2
                  }
                ]
            }
        }
    },
    "thatsSoUnfair": {
        "_id": "521562d5a488c61900000001",
        "averageTurnsToWin": 20,
        "height": 13,
        "mapid": "thatsSoUnfair",
        "props": "RRRRRRHHHH.HHHHRRRRRR|RRRRHH.........HHRRRR|RRHH.....T.T.....HHRR|RH...B.........B...HR|H...................H|H........T.T........H|H.B...............B.H|H........H.H........H|H.T..T...H.H...T..T.H|.......HH...HH.......|H.T..T...H.H...T..T.H|H...................H|HHH...T.......T...HHH",
        "ready": true,
        "startstate": {
            "_0_": {
                "food": 10,
                "turn": 1,
                "team": "Blue",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 10,
                          "y": 9
                      },
                      "turnsUntilCapture": 3
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 10,
                          "y": 10
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 9,
                          "y": 9
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 11,
                          "y": 9
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": []
            },
            "_1_": {
                "food": 10,
                "turn": 1,
                "team": "Red",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 10,
                          "y": 0
                      },
                      "turnsUntilCapture": 3
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 10,
                          "y": 1
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 7,
                          "y": 1
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 13,
                          "y": 1
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": []
            },
            "_neutral_": {
                "food": 10,
                "turn": 0,
                "team": "Neutral",
                "buildings": [
                  {
                      "type": "Farm",
                      "location": {
                          "x": 7,
                          "y": 12
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 13,
                          "y": 12
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 5,
                          "y": 9
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 15,
                          "y": 9
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 0,
                          "y": 9
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 20,
                          "y": 9
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 9,
                          "y": 12
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 11,
                          "y": 12
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 19,
                          "y": 5
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 1,
                          "y": 5
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 10,
                          "y": 5
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 4,
                          "y": 2
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 16,
                          "y": 2
                      },
                      "turnsUntilCapture": 2
                  }
                ]
            }
        },
        "terrain": "ggggggggggggggggggggg|ggggggggggggggggggggg|ggggggggggggggggggggg|ggggggggwwdwwgggggggg|ggggggwwwwdwwwwgggggg|gggggwwwwdddwwwwggggg|ggggwwwwwdddwwwwwgggg|gggwwwwwwdddwwwwwwggg|gggwwddwwdddwwddwwggg|gggdddddddddddddddggg|gggwwddwwdddwwddwwggg|gggwwwwwwwdwwwwwwwggg|gggwwwdddddddddwwwggg",
        "tileset": "Forest",
        "width": 21
    },
    "lanes": {
        "_id": "5220347bc58bba1900000001",
        "averageTurnsToWin": 20,
        "height": 21,
        "mapid": "lanes",
        "props": ".......................|..B......B...B......B..|.B...................B.|.....R...........R.....|.....R....R.R....R.....|.....R..TR...RT..R.B...|.....R..R.....R..R.....|.B...R.R.......R.R...B.|.....R..R.....R..R.....|...B.R..TR...RT..R.....|.....R....R.R....R.....|....R....B...B...TR....|.......................|....RT...B...B....R....|.....R.R..B.B..R.R.....|.....R.R..B.B..R.R.....|.B...R.R.B...B.R.R...B.|....TR.R.T...T.R.RT....|.......R.......R.......|.B..B..TRRR.RRRT..B..B.|.......................",
        "ready": true,
        "startstate": {
            "_0_": {
                "food": 60,
                "turn": 1,
                "team": "Blue",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 11,
                          "y": 12
                      },
                      "turnsUntilCapture": 3
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 6,
                          "y": 12
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 16,
                          "y": 12
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 11,
                          "y": 17
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 10,
                          "y": 16
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 12,
                          "y": 16
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 11,
                          "y": 15
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": []
            },
            "_1_": {
                "food": 60,
                "turn": 1,
                "team": "Red",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 11,
                          "y": 2
                      },
                      "turnsUntilCapture": 3
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 6,
                          "y": 2
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 16,
                          "y": 2
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 1,
                          "y": 18
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 21,
                          "y": 18
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 20,
                          "y": 19
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 2,
                          "y": 19
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 11,
                          "y": 0
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": []
            },
            "_neutral_": {
                "food": 60,
                "turn": 0,
                "team": "Neutral",
                "buildings": [
                  {
                      "type": "Hut",
                      "location": {
                          "x": 11,
                          "y": 7
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 2,
                          "y": 8
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 20,
                          "y": 6
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 20,
                          "y": 8
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 2,
                          "y": 6
                      },
                      "turnsUntilCapture": 2
                  }
                ]
            }
        },
        "terrain": "gggggggggggdggggggggggg|ggggggggggdddgggggggggg|ggdddddddddddddddddddgg|ggdgggdgggdddgggdgggdgg|ggdgggdggggdggggdgggdgg|ggdgggdggggwggggdgggdgg|ggdgggdddddddddddgggdgg|ggdgggdddddddddddgggdgg|ggdgggdddddddddddgggdgg|ggdgggdggggwggggdgggdgg|ggdgggdggggdggggdgggdgg|ggdgggdgggdddgggdgggdgg|ddddddddddddddddddddddd|ggdgggwgggdddgggwgggdgg|ggdgggdggggdggggdgggdgg|ggdgggdggggdggggdgggdgg|ggdgggdgggdddgggdgggdgg|ggdgggwgggddggggwgggdgg|ggdddddggggdggggdddddgg|ggggggdggggdggggdgggggg|ggggggdddddddddddgggggg",
        "tileset": "Forest",
        "width": 23
    },
    "funnel": {
        "_id": "5222e9a06d60b91900000004",
        "averageTurnsToWin": 20,
        "height": 13,
        "mapid": "funnel",
        "props": "HHHH...TTB..B..BTT...HHHH|H.B.RR...TTB.BTT...RR.B.H|H...TTRR...TTT...RRTT...H|H.....TTRR.....RRTT.....H|H.......TTRRTRTTT.......H|.B.................B...B.|.........................|.B...B.................B.|H.......TTRRTRRTT.......H|H.....TTRR.....RRTT.....H|H...TTRR...TTT...RRTT...H|H.B.RR...TTB.BTT...RR.B.H|HHHH...TTB..B..BTT...HHHH",
        "ready": true,
        "startstate": {
            "_0_": {
                "food": 100,
                "turn": 1,
                "team": "Blue",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 21,
                          "y": 6
                      },
                      "turnsUntilCapture": 3
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 22,
                          "y": 4
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 22,
                          "y": 8
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 23,
                          "y": 2
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 23,
                          "y": 10
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": []
            },
            "_1_": {
                "food": 100,
                "turn": 1,
                "team": "Red",
                "buildings": [
                  {
                      "type": "HQ",
                      "location": {
                          "x": 3,
                          "y": 6
                      },
                      "turnsUntilCapture": 3
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 2,
                          "y": 4
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 1,
                          "y": 2
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 1,
                          "y": 10
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 2,
                          "y": 8
                      },
                      "turnsUntilCapture": 2
                  }
                ],
                "units": []
            },
            "_neutral_": {
                "food": 100,
                "turn": 0,
                "team": "Neutral",
                "buildings": [
                  {
                      "type": "Hut",
                      "location": {
                          "x": 14,
                          "y": 12
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 10,
                          "y": 0
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 14,
                          "y": 0
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 10,
                          "y": 12
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 12,
                          "y": 6
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 5,
                          "y": 5
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Farm",
                      "location": {
                          "x": 19,
                          "y": 7
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 7,
                          "y": 6
                      },
                      "turnsUntilCapture": 2
                  },
                  {
                      "type": "Hut",
                      "location": {
                          "x": 17,
                          "y": 6
                      },
                      "turnsUntilCapture": 2
                  }
                ]
            }
        },
        "terrain": "gggdwwwgggggggggggwwwdggg|gggdggwwwgggggggwwwggdggg|gggdggggwwwgggwwwggggdggg|gggdggggggwwwwwggggggdggg|gggdgggggggggggggggggdggg|gggdgggggggggggggggggdggg|ddddddddddddddddddddddddd|gggdgggggggggggggggggdggg|gggdgggggggggggggggggdggg|gggdggggggwwwwwggggggdggg|gggdggggwwwgggwwwggggdggg|gggdggwwwgggggggwwwggdggg|gggdwwwgggggggggggwwwdggg",
        "tileset": "Forest",
        "width": 25
    }
};
//Maps.testmap = {
//    mapid: 'testmap',
//    tileset: 'forest',
//    width: 21,
//    height: 11,
//    terrain: 'ggggggggggggggggggggg|dddddddddwwwggggggggg|ggggggggddwgggggggggg|ggggggggdwwwggggggggg|ggggggggdwwwggggggggg|wwwwwwggdddddggwwwwww|gggggggggwwwdgggggggg|gggggggggwwwdgggggggg|ggggggggggwddgggggggg|gggggggggwwwddddddddd|ggggggggggggggggggggg',
//    props: 'ggggTgTggHHHggggggggR|dddddddddwwwgRBgggggR|gggHRRRRddwggRRgggggR|gggggggTdwwwggRgTgggg|TTgggggBdwwwBgRggggTT|wwwwwwHHdddddHHwwwwww|TTggggRgBwwwdBgggggTT|ggggTgRggwwwdTggggggg|RgggggRRggwddRRRRHggg|RgggggBRgwwwddddddddd|RggggggggHHHggTgTgggg',
//    averageTurnsToWin: 20,
//    startstate: {
//        '_0_':
//            {
//                food: 60,
//                turn: 1,
//                team: 'Blue',
//                buildings: [
//                    { type: 'HQ', location: { x: 1, y: 9 }, turnsUntilCapture: 1 },
//                    { type: 'Hut', location: { x: 1, y: 8 }, turnsUntilCapture: 1 },
//                    { type: 'Hut', location: { x: 1, y: 10 }, turnsUntilCapture: 1 },
//                    { type: 'Hut', location: { x: 2, y: 9 }, turnsUntilCapture: 1 }
//                ],
//                units: [
//                ]
//            },

//        '_1_':
//            {
//                food: 60,
//                turn: 1,
//                team: 'Red',
//                buildings: [
//                    { type: 'HQ', location: { x: 19, y: 1 }, turnsUntilCapture: 1 },
//                    { type: 'Hut', location: { x: 19, y: 0 }, turnsUntilCapture: 1 },
//                    { type: 'Hut', location: { x: 18, y: 1 }, turnsUntilCapture: 1 },
//                    { type: 'Hut', location: { x: 19, y: 2 }, turnsUntilCapture: 1 }
//                ],
//                units: [
//                ]
//            },

//        '_neutral_': 
//            {
//                food: 0,
//                turn: 0,
//                team: 'Neutral',
//                buildings: [
//                    { type: 'Hut', location: { x: 1, y: 1 }, turnsUntilCapture: 1 },
//                    { type: 'Hut', location: { x: 8, y: 1 }, turnsUntilCapture: 1 },
//                    { type: 'Hut', location: { x: 10, y: 5 }, turnsUntilCapture: 1 },
//                    { type: 'Hut', location: { x: 12, y: 9 }, turnsUntilCapture: 1 },
//                    { type: 'Hut', location: { x: 19, y: 9 }, turnsUntilCapture: 1 }
//                ]
//            }        
//    }  // startState
//};


//Maps.maninthemiddle = {
//    mapid : 'maninthemiddle',
//    tileset : 'forest',
//    width : 13,
//    height : 17,
//    terrain : 'ddddddddddddd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|ddddddddddddd|dwdwwdddwwdwd|ddddddddddddd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|dgggggdgggggd|ddddddddddddd',
//    props : '..t...t...t..|.............|HR..T...B..RH|HR.........RH|HR....t....RH|HR.TB...BT.RH|H.....T.....H|f...........f|..t..q.q..t..|f...........f|H.....T.....H|HR.TB...BT.RH|HR....t....RH|HR.........RH|HR..B...T..RH|.............|..t...t...t..',
//    averageTurnsToWin : 20,
//    startstate : {
//        '_0_' : 
//            {
//                food : 60,
//                turn : 1,
//                team : 'Blue',
//                buildings : [
//                    { type : 'HQ', location: { x:5, y:8 }, turnsUntilCapture: 4 },
//                    { type : 'Hut', location: { x:2, y:0 }, turnsUntilCapture: 2 },
//                    { type : 'Hut', location: { x:6, y:0 }, turnsUntilCapture: 2 },
//                    { type : 'Hut', location: { x:10, y:0 }, turnsUntilCapture: 2 }                   
//                ],
//                units : [
//                    { type:'DartBlower', location: { x:6, y:1 }, hp:5, state:'idle' }
//                ]
//            } , // PlayerState
        
//        '_1_' : 
//            {
//                food : 60,
//                turn : 1,
//                team : 'Red',
//                buildings : [
//                    { type : 'HQ', location: { x:7, y:8 }, turnsUntilCapture: 4 },
//                    { type : 'Hut', location: { x:2, y:16 }, turnsUntilCapture: 2 },
//                    { type : 'Hut', location: { x:6, y:16 }, turnsUntilCapture: 2 },
//                    { type : 'Hut', location: { x:10, y:16 }, turnsUntilCapture: 2 }
//                ],
//                units : [
//                    { type:'DartBlower', location: { x:6, y:15 }, hp:5, state:'idle' } 
//                ]
//            }, // PlayerState
        
//        '_neutral_' : 
//            {
//                food : 0,
//                turn : 0,
//                team : 'Neutral',
//                buildings : [
//                    { type : 'Farm', location: { x:0, y:7 }, turnsUntilCapture: 2 },
//                    { type : 'Farm', location: { x:12, y:7 }, turnsUntilCapture: 2 },
//                    { type : 'Farm', location: { x:0, y:9 }, turnsUntilCapture: 2 },
//                    { type : 'Farm', location: { x:12, y:9 }, turnsUntilCapture: 2 },
                    
//                    { type : 'Hut', location: { x:2, y:8 }, turnsUntilCapture: 2 },
//                    { type : 'Hut', location: { x:10, y:8 }, turnsUntilCapture: 2 },
//                    { type : 'Hut', location: { x:6, y:4 }, turnsUntilCapture: 2 },
//                    { type : 'Hut', location: { x:6, y:12 }, turnsUntilCapture: 2 } 
//                ]
//            }
        
//    }  // startState
//}; // maninthemiddle

//Maps.boulderLine = {
//    "tileset": "Forest",
//    "mapid": "boulderLine",
//    "width": 15,
//    "height": 15,
//    "terrain": "ggggggwwwgggggg|ggggggwgwgggggg|ggggggwwwgggggg|ggggggggggggggg|ggggggggggggggg|ggggggggggggggg|dddggwwgwwggddd|dddggwwgwwggddd|dddggwwgwwggddd|gdgggggggggggdg|gdgggggggggggdg|gdgggggggggggdg|gdddddddddddddg|ggggggggggggggg|wwwwwwgggwwwwww",
//    "props": "..HHHH...HHHH..|....B..H..B....|...............|....B..R..B....|.......R.......|.......R.......|.......R.......|.......R.......|.......R.......|.......R.......|....B..R..B....|......TRT......|...............|......HHH......|......HHH......",
//    "averageTurnsToWin": 20,
//    "startstate": {
//        "_0_":
//        {
//            "food": 60,
//            "turn": 1,
//            "team": "Blue",
//            "buildings": [
//                { "type": "HQ", "location": { "x": 13, "y": 7 }, "turnsUntilCapture": 3 },
//                { "type": "Hut", "location": { "x": 13, "y": 6 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 13, "y": 8 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 12, "y": 7 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 14, "y": 7 }, "turnsUntilCapture": 2 }
//            ],
//            "units": []
//        },
//        "_1_":
//        {
//            "food": 60,
//            "turn": 1,
//            "team": "Red",
//            "buildings": [
//                { "type": "HQ", "location": { "x": 1, "y": 7 }, "turnsUntilCapture": 3 },
//                { "type": "Hut", "location": { "x": 1, "y": 6 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 1, "y": 8 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 0, "y": 7 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 2, "y": 7 }, "turnsUntilCapture": 2 }
//            ],
//            "units": []
//        },
//        "_neutral_":
//        {
//            "food": 60,
//            "turn": 0,
//            "team": "Neutral",
//            "buildings": [
//            { "type": "Hut", "location": { "x": 2, "y": 12 }, "turnsUntilCapture": 2 },
//            { "type": "Hut", "location": { "x": 12, "y": 12 }, "turnsUntilCapture": 2 },
//            { "type": "Hut", "location": { "x": 12, "y": 2 }, "turnsUntilCapture": 2 },
//            { "type": "Hut", "location": { "x": 2, "y": 2 }, "turnsUntilCapture": 2 }
//            ]
//        }
//    }
//};

//Maps.thelaststand = {
//    "tileset": "forest",
//    "mapid": "thelaststand",
//    "width": 20,
//    "height": 7,
//    "terrain": "gggggggggggwgggggggg|gggggggggggggggggggg|gggggggggggggggggggg|gggggggggggggggggggg|gggggggggggggggggggg|gggggggggggggggggggg|ggggggggwggggggggggg",
//    "props": "B.....HH.....R.....B|H...........RR.....H|B...B....TH....B...B|H....B...HH...B....H|B...B....HT....B...B|H.....RR...........H|B.....R.....HH.....B",
//    "averageTurnsToWin": 20,
//    "startstate": {
//        "_0_":
//        {
//            "food": 60,
//            "turn": 1,
//            "team": "Blue",
//            "buildings": [
//                { "type": "HQ", "location": { "x": 1, "y": 3 }, "turnsUntilCapture": 3 },
//                { "type": "Hut", "location": { "x": 1, "y": 1 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 1, "y": 5 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 2, "y": 0 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 2, "y": 6 }, "turnsUntilCapture": 2 }
//            ],
//            "units": []
//        },
//        "_1_":
//        {
//            "food": 60,
//            "turn": 1,
//            "team": "Red",
//            "buildings": [
//                { "type": "HQ", "location": { "x": 18, "y": 3 }, "turnsUntilCapture": 3 },
//                { "type": "Hut", "location": { "x": 18, "y": 1 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 18, "y": 5 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 17, "y": 0 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 17, "y": 6 }, "turnsUntilCapture": 2 }
//            ],
//            "units": []
//        },
//        "_neutral_":
//        {
//            "food": 60,
//            "turn": 0,
//            "team": "Neutral",
//            "buildings": [
//            { "type": "Hut", "location": { "x": 12, "y": 0 }, "turnsUntilCapture": 2 },
//            { "type": "Hut", "location": { "x": 7, "y": 6 }, "turnsUntilCapture": 2 },
//            { "type": "Farm", "location": { "x": 7, "y": 1 }, "turnsUntilCapture": 2 },
//            { "type": "Farm", "location": { "x": 12, "y": 5 }, "turnsUntilCapture": 2 },
//            { "type": "Hut", "location": { "x": 4, "y": 3 }, "turnsUntilCapture": 2 },
//            { "type": "Hut", "location": { "x": 15, "y": 3 }, "turnsUntilCapture": 2 }
//            ]
//        }
//    }
//};

//Maps.crossbridges = {
//    "tileset": "forest",
//    "mapid": "crossbridges",
//    "width": 15,
//    "height": 15,
//    "terrain": "gggggggggggggww|ggggggggggggdww|gggggggggggdddg|ggggggggggwwdgg|gggggggggwwwggg|ggggggggwgwgggg|gggggggwwwggggg|ggggggwgwgggggg|gggggwwwggggggg|ggggwgwgggggggg|gggwwwggggggggg|ggdwwgggggggggg|gdddggggggggggg|wwdgggggggggggg|wwggggggggggggg",
//    "props": "RRRR...........|R..............|R.........R....|R....B...B.....|........H...R..|...B...H...B...|......B...H....|.....H.T.H.....|....H...B......|...B...H...B...|..R...H........|.....B...B....R|....R.........R|..............R|...........RRRR",
//    "averageTurnsToWin": 20,
//    "startstate": {
//        "_0_":
//        {
//            "food": 60,
//            "turn": 1,
//            "team": "Blue",
//            "buildings": [
//                { "type": "HQ", "location": { "x": 1, "y": 1 }, "turnsUntilCapture": 3 },
//                { "type": "Hut", "location": { "x": 1, "y": 3 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 2, "y": 2 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 3, "y": 1 }, "turnsUntilCapture": 2 }
//            ],
//            "units": []
//        },
//        "_1_":
//        {
//            "food": 60,
//            "turn": 1,
//            "team": "Red",
//            "buildings": [
//                { "type": "HQ", "location": { "x": 13, "y": 13 }, "turnsUntilCapture": 3 },
//                { "type": "Hut", "location": { "x": 12, "y": 12 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 13, "y": 11 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 11, "y": 13 }, "turnsUntilCapture": 2 }
//            ],
//            "units": []
//        },
//        "_neutral_":
//        {
//            "food": 60,
//            "turn": 0,
//            "team": "Neutral",
//            "buildings": [
//            { "type": "Hut", "location": { "x": 12, "y": 2 }, "turnsUntilCapture": 2 },
//            { "type": "Hut", "location": { "x": 2, "y": 12 }, "turnsUntilCapture": 2 },
//            { "type": "Farm", "location": { "x": 5, "y": 9 }, "turnsUntilCapture": 2 },
//            { "type": "Farm", "location": { "x": 9, "y": 5 }, "turnsUntilCapture": 2 }
//            ]
//        }
//    }
//};

//Maps.riverbends = {
//    "tileset": "Forest",
//    "mapid": "riverbends",
//    "width": 10,
//    "height": 22,
//    "terrain": "gggggggggg|wwwwwwgggg|gggggwwwww|gggggggggg|dggggggggg|dddddddddg|dggggggggg|gggggggggg|wwwwwggggw|wgddddddgw|wgdggggdgw|wgdggggdgw|wgddddddgw|wggggwwwww|gggggggggg|gggggggggd|gddddddddd|gggggggggd|gggggggggg|wwwwwggggg|ggggwwwwww|gggggggggg",
//    "props": "TTTTTTTTTT|......B..B|..........|..........|..........|........B.|..........|RRRRRRR..T|.....HH...|..........|.H...T..H.|.H..T...H.|..........|...HH.....|T..RRRRRRR|..........|.B........|..........|..........|..........|B..B......|TTTTTTTTTT",
//    "averageTurnsToWin": 20,
//    "startstate": {
//        "_0_":
//        {
//            "food": 60,
//            "turn": 1,
//            "team": "Blue",
//            "buildings": [
//                { "type": "HQ", "location": { "x": 0, "y": 5 }, "turnsUntilCapture": 3 },
//                { "type": "Hut", "location": { "x": 0, "y": 4 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 1, "y": 5 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 0, "y": 6 }, "turnsUntilCapture": 2 }
//            ],
//            "units": []
//        },
//        "_1_":
//        {
//            "food": 60,
//            "turn": 1,
//            "team": "Red",
//            "buildings": [
//                { "type": "HQ", "location": { "x": 9, "y": 16 }, "turnsUntilCapture": 3 },
//                { "type": "Hut", "location": { "x": 9, "y": 15 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 8, "y": 16 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 9, "y": 17 }, "turnsUntilCapture": 2 }
//            ],
//            "units": []
//        },
//        "_neutral_":
//        {
//            "food": 60,
//            "turn": 0,
//            "team": "Neutral",
//            "buildings": [
//            { "type": "Farm", "location": { "x": 8, "y": 1 }, "turnsUntilCapture": 2 },
//            { "type": "Farm", "location": { "x": 1, "y": 20 }, "turnsUntilCapture": 2 },
//            { "type": "Hut", "location": { "x": 3, "y": 10 }, "turnsUntilCapture": 2 },
//            { "type": "Hut", "location": { "x": 6, "y": 11 }, "turnsUntilCapture": 2 },
//            { "type": "Farm", "location": { "x": 7, "y": 1 }, "turnsUntilCapture": 2 },
//            { "type": "Farm", "location": { "x": 2, "y": 20 }, "turnsUntilCapture": 2 }
//            ]
//        }
//    }
//};

//Maps.hiddenquarry = {
//    "tileset": "Forest",
//    "mapid": "hiddenquarry",
//    "width": 20,
//    "height": 20,
//    "terrain": "gggggggggggggggggggg|gggggggggggggggggggg|ggddddddddddddddddgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggdggggggggggggggdgg|ggddddddddddddddddgg|gggggggggggggggggggg|gggggggggggggggggggg",
//    "props": "TTTTTTTTTTTTTTTTTTTT|T..................T|T..................T|T..................T|T...RRRRRRRRRRRR...T|T...RRRRR..RRRRR...T|TH..R..RR..RR..R..HT|T...R..........R...T|TB..RRR......RRR..BT|T....H...HH........T|T........HH...H....T|TB..RRR......RRR..BT|T...R..........R...T|TH..R..RR..RR..R..HT|T...RRRRR..RRRRR...T|T...RRRRRRRRRRRR...T|T..................T|T..................T|T..................T|TTTTTTTTTTTTTTTTTTTT",
//    "averageTurnsToWin": 20,
//    "startstate": {
//        "_0_":
//        {
//            "food": 60,
//            "turn": 1,
//            "team": "Blue",
//            "buildings": [
//                { "type": "Hut", "location": { "x": 15, "y": 2 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 13, "y": 2 }, "turnsUntilCapture": 2 },
//                { "type": "HQ", "location": { "x": 9, "y": 2 }, "turnsUntilCapture": 3 },
//                { "type": "Hut", "location": { "x": 4, "y": 2 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 6, "y": 2 }, "turnsUntilCapture": 2 }
//            ],
//            "units": []
//        },
//        "_1_":
//        {
//            "food": 60,
//            "turn": 1,
//            "team": "Red",
//            "buildings": [
//                { "type": "Hut", "location": { "x": 6, "y": 17 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 4, "y": 17 }, "turnsUntilCapture": 2 },
//                { "type": "Hut", "location": { "x": 15, "y": 17 }, "turnsUntilCapture": 2 },
//                { "type": "HQ", "location": { "x": 10, "y": 17 }, "turnsUntilCapture": 3 },
//                { "type": "Hut", "location": { "x": 13, "y": 17 }, "turnsUntilCapture": 2 }
//            ],
//            "units": []
//        },
//        "_neutral_":
//        {
//            "food": 60,
//            "turn": 0,
//            "team": "Neutral",
//            "buildings": [
//            { "type": "Hut", "location": { "x": 5, "y": 6 }, "turnsUntilCapture": 2 },
//            { "type": "Hut", "location": { "x": 14, "y": 6 }, "turnsUntilCapture": 2 },
//            { "type": "Hut", "location": { "x": 14, "y": 13 }, "turnsUntilCapture": 2 },
//            { "type": "Hut", "location": { "x": 5, "y": 13 }, "turnsUntilCapture": 2 },
//            { "type": "Farm", "location": { "x": 9, "y": 14 }, "turnsUntilCapture": 2 },
//            { "type": "Farm", "location": { "x": 10, "y": 14 }, "turnsUntilCapture": 2 },
//            { "type": "Farm", "location": { "x": 9, "y": 5 }, "turnsUntilCapture": 2 },
//            { "type": "Farm", "location": { "x": 10, "y": 5 }, "turnsUntilCapture": 2 }
//            ]
//        }
//    }
//};

var disabledMaps = [];

module.exports.Maps = Maps;
module.exports.enable = function (mapid) {
    if (mapid == '$all') {
        disabledMaps = [];
    } else {
        var j = disabledMaps.indexOf(mapid);
        if (j >= 0) {
            disabledMaps.splice(j, 1);
        }
    }
};
module.exports.disable = function (mapid) {
    if (disabledMaps.indexOf(mapid) == -1) {
        disabledMaps.push(mapid);
    }
};
module.exports.isDisabled = function (mapid) {
    return disabledMaps.indexOf(mapid) >= 0;
}

module.exports.getMaps = function (db, options, onComplete) {
    if (!options) {
        options = {};
    }
    if (typeof (options.enabledOnly) == 'undefined') {
        options.enabledOnly = true;
    }

    var retObject = {};
    for (var i in Maps) {
        if (!options.enabledOnly || disabledMaps.indexOf(i) == -1) {
            retObject[i] = Maps[i];
        }
    }
    debugger;
    db.maps.get({ ready: true }, function (docs) {
        if (docs) {
            for (var i = 0; i < docs.length; i++) {
                if (!options.enabledOnly || disabledMaps.indexOf(docs[i].mapid) == -1) {
                    retObject[docs[i].mapid] = docs[i];
                }
            }
        }
        if (onComplete) {
            onComplete(retObject);
        }
    });
};