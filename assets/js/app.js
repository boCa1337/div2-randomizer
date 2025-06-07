document.addEventListener('DOMContentLoaded', () => {

    const masterMapsData = [
        {
            meta: { id: 'washington', title: 'Washington DC', scale: 0.8, enabled: true },
            locations: [
                { id: 'dc_mis_01', type: 'mission', title: 'Grand Washington Hotel', district: 'Downtown East', coords: { x: 2229, y: 716 }, isFastTravel: true },
                { id: 'dc_mis_02', type: 'mission', title: 'Jefferson Trade Center', district: 'Federal Triangle', coords: { x: 2147, y: 1102 }, isFastTravel: true },
                { id: 'dc_mis_03', type: 'mission', title: 'Viewpoint Museum', district: 'Federal Triangle', coords: { x: 2665, y: 1176 }, isFastTravel: true },
                { id: 'dc_mis_04', type: 'mission', title: 'American History Museum', district: 'East Mall', coords: { x: 2053, y: 1380 }, isFastTravel: true },
                { id: 'dc_mis_05', type: 'mission', title: 'Air & Space Museum', district: 'East Mall', coords: { x: 2617, y: 1626 }, isFastTravel: true },
                { id: 'dc_mis_06', type: 'mission', title: 'Jefferson Plaza', district: 'Southwest', coords: { x: 2453, y: 1894 }, isFastTravel: true },
                { id: 'dc_mis_07', type: 'mission', title: 'Space Administration HQ', district: 'Southwest', coords: { x: 2927, y: 1866 }, isFastTravel: true },
                { id: 'dc_mis_08', type: 'mission', title: 'DCD Headquarters', district: 'White House', coords: { x: 1495, y: 1022 }, isFastTravel: true },
                { id: 'dc_mis_09', type: 'mission', title: 'Bank Headquarters', district: 'Downtown West', coords: { x: 1315, y: 672 }, isFastTravel: true },
                { id: 'dc_mis_10', type: 'mission', title: 'Federal Emergency Bunker', district: 'West End', coords: { x: 883, y: 416 }, isFastTravel: true },
                { id: 'dc_mis_11', type: 'mission', title: 'Potomac Event Center', district: 'Foggy Bottom', coords: { x: 483, y: 820 }, isFastTravel: true },
                { id: 'dc_mis_12', type: 'mission', title: 'Lincoln Memorial', district: 'West Potomac Park', coords: { x: 785, y: 1492 }, isFastTravel: true },
                { id: 'dc_mis_18', type: 'mission', title: 'District Union Arena', district: 'Downtown East', coords: { x: 2519, y: 742 }, isFastTravel: true },
                { id: 'dc_mis_19', type: 'mission', title: 'Roosevelt Island', district: 'Foggy Bottom', coords: { x: 165, y: 1202 }, isFastTravel: true },
                { id: 'dc_mis_20', type: 'mission', title: 'Capitol Building', district: 'East Mall', coords: { x: 3219, y: 1448 }, isFastTravel: true },
                { id: 'dc_mis_22', type: 'mission', title: 'Tidal Basin', district: 'West Potomac Park', coords: { x: 1385, y: 1480 }, isFastTravel: true },
                { id: 'dc_mis_21', type: 'mission', title: 'Manning National Zoo', district: null, coords: null, isFastTravel: true },
                { id: 'dc_mis_13', type: 'mission', title: 'DARPA Research Labs', district: null, coords: null, isFastTravel: true },
                { id: 'dc_mis_14', type: 'mission', title: 'The Pentagon', district: null, coords: null, isFastTravel: true },
                { id: 'dc_mis_15', type: 'mission', title: 'Camp White Oak', district: null, coords: null, isFastTravel: true },
                { id: 'dc_mis_16', type: 'mission', title: 'Coney Island Ballpark', district: null, coords: null, isFastTravel: true },
                { id: 'dc_mis_17', type: 'mission', title: 'Coney Island Amusement Park', district: null, coords: null, isFastTravel: true },

                { id: 'dc_cp_01', type: 'controlPoint', title: 'The Vault', district: 'White House', coords: { x: 1535, y: 592 }, isFastTravel: false },
                { id: 'dc_cp_02', type: 'controlPoint', title: 'Ellipse Fuel Depot', district: 'White House', coords: { x: 1779, y: 1154 }, isFastTravel: false },
                { id: 'dc_cp_03', type: 'controlPoint', title: 'Fallen Cranes', district: 'Downtown East', coords: { x: 1933, y: 652 }, isFastTravel: false },
                { id: 'dc_cp_04', type: 'controlPoint', title: 'Demolition Site', district: 'Downtown East', coords: { x: 2055, y: 892 }, isFastTravel: false },
                { id: 'dc_cp_05', type: 'controlPoint', title: 'MLK Memorial Library', district: 'Downtown East', coords: { x: 2327, y: 742 }, isFastTravel: false },
                { id: 'dc_cp_06', type: 'controlPoint', title: 'Red Dragon', district: 'Downtown East', coords: { x: 2491, y: 548 }, isFastTravel: false },
                { id: 'dc_cp_07', type: 'controlPoint', title: 'Navy Plaza', district: 'Federal Triangle', coords: { x: 2519, y: 1082 }, isFastTravel: false },
                { id: 'dc_cp_08', type: 'controlPoint', title: 'Hotel Infirmary', district: 'Judiciary Square', coords: { x: 2635, y: 514 }, isFastTravel: false },
                { id: 'dc_cp_09', type: 'controlPoint', title: 'The Cinderblock', district: 'Judiciary Square', coords: { x: 2719, y: 1026 }, isFastTravel: false },
                { id: 'dc_cp_10', type: 'controlPoint', title: 'Metro Ruins', district: 'East Mall', coords: { x: 2079, y: 1464 }, isFastTravel: false },
                { id: 'dc_cp_11', type: 'controlPoint', title: 'Sinkhole', district: 'East Mall', coords: { x: 2495, y: 1446 }, isFastTravel: false },
                { id: 'dc_cp_12', type: 'controlPoint', title: 'Solar Farm', district: 'East Mall', coords: { x: 2819, y: 1452 }, isFastTravel: false },
                { id: 'dc_cp_13', type: 'controlPoint', title: 'Crash Site', district: 'East Mall', coords: { x: 3141, y: 1440 }, isFastTravel: false },
                { id: 'dc_cp_14', type: 'controlPoint', title: 'The Choke', district: 'Southwest', coords: { x: 2339, y: 1688 }, isFastTravel: false },
                { id: 'dc_cp_15', type: 'controlPoint', title: 'No Hope Hotel', district: 'Southwest', coords: { x: 2815, y: 1828 }, isFastTravel: false },
                { id: 'dc_cp_16', type: 'controlPoint', title: 'New Venice', district: 'West End', coords: { x: 585, y: 374 }, isFastTravel: false },
                { id: 'dc_cp_17', type: 'controlPoint', title: 'Riverside Gas Station', district: 'West End', coords: { x: 455, y: 582 }, isFastTravel: false },
                { id: 'dc_cp_18', type: 'controlPoint', title: 'Overgrowth', district: 'West End', coords: { x: 709, y: 538 }, isFastTravel: false },
                { id: 'dc_cp_19', type: 'controlPoint', title: 'Sleeping Giant', district: 'Foggy Bottom', coords: { x: 625, y: 708 }, isFastTravel: false },
                { id: 'dc_cp_20', type: 'controlPoint', title: 'Navy Hill', district: 'Foggy Bottom', coords: { x: 585, y: 1024 }, isFastTravel: false },
                { id: 'dc_cp_21', type: 'controlPoint', title: 'Taxi Graveyard', district: 'Foggy Bottom', coords: { x: 451, y: 1162 }, isFastTravel: false },
                { id: 'dc_cp_22', type: 'controlPoint', title: 'Ivy Tunnel', district: 'Constitution Hall', coords: { x: 991, y: 960 }, isFastTravel: false },
                { id: 'dc_cp_23', type: 'controlPoint', title: 'Haunted House', district: 'Constitution Hall', coords: { x: 1337, y: 890 }, isFastTravel: false },
                { id: 'dc_cp_24', type: 'controlPoint', title: 'The Nest', district: 'Constitution Hall', coords: { x: 1127, y: 1172 }, isFastTravel: false },
                { id: 'dc_cp_25', type: 'controlPoint', title: 'The Mast', district: 'West Potomac Park', coords: { x: 1021, y: 1334 }, isFastTravel: false },
                { id: 'dc_cp_26', type: 'controlPoint', title: 'Flooded Levee', district: 'West Potomac Park', coords: { x: 1431, y: 1324 }, isFastTravel: false },
                { id: 'dc_cp_27', type: 'controlPoint', title: 'Washington Monument', district: 'West Potomac Park', coords: { x: 1707, y: 1476 }, isFastTravel: false },
                { id: 'dc_cp_28', type: 'controlPoint', title: 'Toxic Alley', district: 'Downtown West', coords: { x: 1273, y: 558 }, isFastTravel: false },
                { id: 'dc_cp_29', type: 'controlPoint', title: 'The World\'s End', district: 'Downtown West', coords: { x: 905, y: 624 }, isFastTravel: false },

                { id: 'dc_sh_01', type: 'safeHouse', title: 'Final Epiphany', district: 'Downtown East', coords: { x: 2023, y: 706 }, isFastTravel: true },
                { id: 'dc_sh_02', type: 'safeHouse', title: 'Last Stop', district: 'Judiciary Square', coords: { x: 2665, y: 920 }, isFastTravel: true },
                { id: 'dc_sh_03', type: 'safeHouse', title: 'The 1040', district: 'Federal Triangle', coords: { x: 2239, y: 1126 }, isFastTravel: true },
                { id: 'dc_sh_04', type: 'safeHouse', title: 'The Ring', district: 'East Mall', coords: { x: 2513, y: 1580 }, isFastTravel: true },
                { id: 'dc_sh_05', type: 'safeHouse', title: 'Liberty\'s Call', district: 'Southwest', coords: { x: 2985, y: 1712 }, isFastTravel: true },
                { id: 'dc_sh_06', type: 'safeHouse', title: 'The Attic', district: 'West End', coords: { x: 635, y: 616 }, isFastTravel: true },
                { id: 'dc_sh_07', type: 'safeHouse', title: 'The Archive', district: 'Constitution Hall', coords: { x: 1137, y: 1024 }, isFastTravel: true },
                { id: 'dc_sh_08', type: 'safeHouse', title: 'Truman', district: 'Foggy Bottom', coords: { x: 787, y: 1100 }, isFastTravel: true },
                { id: 'dc_sh_09', type: 'safeHouse', title: 'The Shop', district: 'West Potomac Park', coords: { x: 1057, y: 1422 }, isFastTravel: true },
                { id: 'dc_sh_10', type: 'safeHouse', title: 'Pentagon Library', district: null, coords: null, isFastTravel: true },
                { id: 'dc_sh_11', type: 'safeHouse', title: 'Coney Island Safehouse', district: null, coords: null, isFastTravel: true },

                { id: 'dc_set_01', type: 'settlement', title: 'The White House', district: 'White House', coords: { x: 1643, y: 796 }, isFastTravel: true },
                { id: 'dc_set_02', type: 'settlement', title: 'The Theater', district: 'Downtown East', coords: { x: 2309, y: 880 }, isFastTravel: true },
                { id: 'dc_set_03', type: 'settlement', title: 'Castle', district: 'East Mall', coords: { x: 2331, y: 1554 }, isFastTravel: true },
                { id: 'dc_set_04', type: 'settlement', title: 'The Campus', district: 'Downtown West', coords: { x: 1069, y: 662 }, isFastTravel: true },

                { id: 'dc_act_01', type: 'activity', title: 'Open World Activity', district: 'Downtown East', coords: null, isFastTravel: false },
                { id: 'dc_act_02', type: 'activity', title: 'Open World Activity', district: 'Judiciary Square', coords: null, isFastTravel: false },
                { id: 'dc_act_03', type: 'activity', title: 'Open World Activity', district: 'Federal Triangle', coords: null, isFastTravel: false },
                { id: 'dc_act_04', type: 'activity', title: 'Open World Activity', district: 'East Mall', coords: null, isFastTravel: false },
                { id: 'dc_act_05', type: 'activity', title: 'Open World Activity', district: 'Southwest', coords: null, isFastTravel: false },
                { id: 'dc_act_06', type: 'activity', title: 'Open World Activity', district: 'West End', coords: null, isFastTravel: false },
                { id: 'dc_act_07', type: 'activity', title: 'Open World Activity', district: 'Constitution Hall', coords: null, isFastTravel: false },
                { id: 'dc_act_08', type: 'activity', title: 'Open World Activity', district: 'Foggy Bottom', coords: null, isFastTravel: false },
                { id: 'dc_act_09', type: 'activity', title: 'Open World Activity', district: 'West Potomac Park', coords: null, isFastTravel: false },
                { id: 'dc_act_10', type: 'activity', title: 'Open World Activity', district: 'Downtown West', coords: null, isFastTravel: false },
                { id: 'dc_act_11', type: 'activity', title: 'Open World Activity', district: 'White House', coords: null, isFastTravel: false },

                { id: 'dc_bty_01', type: 'bounty', title: 'Bounty', district: 'Downtown East', coords: null, isFastTravel: false },
                { id: 'dc_bty_02', type: 'bounty', title: 'Bounty', district: 'Judiciary Square', coords: null, isFastTravel: false },
                { id: 'dc_bty_03', type: 'bounty', title: 'Bounty', district: 'Federal Triangle', coords: null, isFastTravel: false },
                { id: 'dc_bty_04', type: 'bounty', title: 'Bounty', district: 'East Mall', coords: null, isFastTravel: false },
                { id: 'dc_bty_05', type: 'bounty', title: 'Bounty', district: 'Southwest', coords: null, isFastTravel: false },
                { id: 'dc_bty_06', type: 'bounty', title: 'Bounty', district: 'West End', coords: null, isFastTravel: false },
                { id: 'dc_bty_07', type: 'bounty', title: 'Bounty', district: 'Constitution Hall', coords: null, isFastTravel: false },
                { id: 'dc_bty_08', type: 'bounty', title: 'Bounty', district: 'Foggy Bottom', coords: null, isFastTravel: false },
                { id: 'dc_bty_09', type: 'bounty', title: 'Bounty', district: 'West Potomac Park', coords: null, isFastTravel: false },
                { id: 'dc_bty_10', type: 'bounty', title: 'Bounty', district: 'Downtown West', coords: null, isFastTravel: false },
                { id: 'dc_bty_11', type: 'bounty', title: 'Bounty', district: 'White House', coords: null, isFastTravel: false },

                { id: 'dc_ca_01', type: 'classifiedAssignment', title: 'National Bond Armory', district: 'White House', coords: { x: 1785, y: 674 }, isFastTravel: true },
                { id: 'dc_ca_02', type: 'classifiedAssignment', title: 'Nightclub Infiltration (North)', district: 'Downtown East', coords: { x: 2193, y: 568 }, isFastTravel: true },
                { id: 'dc_ca_03', type: 'classifiedAssignment', title: 'Nelson Theatre Hostages (South)', district: 'Downtown East', coords: { x: 2161, y: 904 }, isFastTravel: true },
                { id: 'dc_ca_04', type: 'classifiedAssignment', title: 'Aquarium Civilian Rescue (South West)', district: 'Downtown East', coords: { x: 1885, y: 984 }, isFastTravel: true },
                { id: 'dc_ca_05', type: 'classifiedAssignment', title: 'NSA Security Alert', district: 'East Mall', coords: { x: 3103, y: 1526 }, isFastTravel: true },
                { id: 'dc_ca_06', type: 'classifiedAssignment', title: 'Embassy Crash Site (North)', district: 'West End', coords: { x: 755, y: 384 }, isFastTravel: true },
                { id: 'dc_ca_07', type: 'classifiedAssignment', title: 'Marina Supply Route (West)', district: 'West End', coords: { x: 285, y: 552 }, isFastTravel: true },
                { id: 'dc_ca_08', type: 'classifiedAssignment', title: 'Detention Center Rescue', district: 'Downtown West', coords: { x: 1173, y: 508 }, isFastTravel: true },
            ]
        },
        {
            meta: { id: 'newyork', title: 'New York', scale: 1.0, enabled: true },
            locations: [
                { id: 'ny_mis_01', type: 'mission', title: 'The Tombs', district: 'Civic Center', coords: { x: 2433, y: 240 }, isFastTravel: true },
                { id: 'ny_mis_02', type: 'mission', title: 'Stranded Tanker', district: 'Two Bridges', coords: { x: 2883, y: 846 }, isFastTravel: true },
                { id: 'ny_mis_03', type: 'mission', title: 'Wallstreet', district: 'Financial District', coords: { x: 1308, y: 1617 }, isFastTravel: true },
                { id: 'ny_mis_04', type: 'mission', title: 'Pathway Park', district: 'Battery Park', coords: { x: 1584, y: 780 }, isFastTravel: true },
                { id: 'ny_mis_05', type: 'mission', title: 'Liberty Island', district: 'Financial District', coords: { x: 1140, y: 1941 }, isFastTravel: true },

                // TODO: CPs
                { id: 'ny_cp_01', type: 'controlPoint', title: 'City Hall', district: 'Civic Center', coords: { x: 1893, y: 534 }, isFastTravel: false },
                { id: 'ny_cp_02', type: 'controlPoint', title: 'The Gate', district: 'Civic Center', coords: { x: 2865, y: 62 }, isFastTravel: false },
                { id: 'ny_cp_03', type: 'controlPoint', title: 'Brooklyn Bridge', district: 'Two Bridges', coords: { x: 2381, y: 906 }, isFastTravel: false },
                { id: 'ny_cp_04', type: 'controlPoint', title: 'D-Railed', district: 'Two Bridges', coords: { x: 3041, y: 454 }, isFastTravel: false },
                { id: 'ny_cp_05', type: 'controlPoint', title: 'Celebration Hotel', district: 'Financial District', coords: { x: 1659, y: 1506 }, isFastTravel: false },
                { id: 'ny_cp_06', type: 'controlPoint', title: 'Waterfront', district: 'Financial District', coords: { x: 1350, y: 2061 }, isFastTravel: false },
                { id: 'ny_cp_07', type: 'controlPoint', title: 'Widow\'s Web', district: 'Battery Park', coords: { x: 1183, y: 852 }, isFastTravel: false },
                { id: 'ny_cp_08', type: 'controlPoint', title: 'Boathouse', district: 'Battery Park', coords: { x: 551, y: 1544 }, isFastTravel: false },

                { id: 'ny_sh_01', type: 'safeHouse', title: 'Animal Shelter', district: 'Civic Center', coords: { x: 2211, y: 376 }, isFastTravel: true },
                { id: 'ny_sh_02', type: 'safeHouse', title: 'Residential Building', district: 'Two Bridges', coords: { x: 2551, y: 702 }, isFastTravel: true },
                { id: 'ny_sh_03', type: 'safeHouse', title: 'The Food Bank', district: 'Financial District', coords: { x: 1959, y: 1392 }, isFastTravel: true },
                { id: 'ny_sh_04', type: 'safeHouse', title: 'Trinity Church', district: 'Battery Park', coords: { x: 1308, y: 1059 }, isFastTravel: true },

                { id: 'ny_set_01', type: 'settlement', title: 'Haven', district: null, coords: { x: 1913, y: 920 }, isFastTravel: true },

                { id: 'ny_act_01', type: 'activity', title: 'Open World Activity', district: 'Civic Center', coords: null, isFastTravel: false },
                { id: 'ny_act_02', type: 'activity', title: 'Open World Activity', district: 'Two Bridges', coords: null, isFastTravel: false },
                { id: 'ny_act_03', type: 'activity', title: 'Open World Activity', district: 'Financial District', coords: null, isFastTravel: false },
                { id: 'ny_act_04', type: 'activity', title: 'Open World Activity', district: 'Battery Park', coords: null, isFastTravel: false },

                { id: 'ny_bty_01', type: 'bounty', title: 'Bounty', district: 'Civic Center', coords: null, isFastTravel: false },
                { id: 'ny_bty_02', type: 'bounty', title: 'Bounty', district: 'Two Bridges', coords: null, isFastTravel: false },
                { id: 'ny_bty_03', type: 'bounty', title: 'Bounty', district: 'Financial District', coords: null, isFastTravel: false },
                { id: 'ny_bty_04', type: 'bounty', title: 'Bounty', district: 'Battery Park', coords: null, isFastTravel: false },
            ]
        },
        {
            meta: { id: "brooklyn", title: "Brooklyn", scale: 1.0, enabled: true },
            locations: [
                { id: 'bk_mis_01', type: 'mission', title: 'Bridge Park Pier', district: 'Brooklyn Heights', coords: { x: 1133, y: 1343 }, isFastTravel: true },
                { id: 'bk_mis_02', type: 'mission', title: 'Clark Street', district: 'Brooklyn Heights', coords: { x: 1413, y: 1589 }, isFastTravel: true },
                { id: 'bk_mis_03', type: 'mission', title: 'DUMBO Skate Park', district: 'DUMBO', coords: { x: 2477, y: 767 }, isFastTravel: true },
                { id: 'bk_mis_04', type: 'mission', title: 'CERA Clinic', district: 'DUMBO', coords: { x: 2481, y: 1068 }, isFastTravel: true },
                { id: 'bk_mis_05', type: 'mission', title: 'H5 Refinery', district: null, coords: null, isFastTravel: true },
                { id: 'bk_mis_06', type: 'mission', title: 'The Art Museum', district: null, coords: null, isFastTravel: true },
                { id: 'bk_mis_07', type: 'mission', title: 'Army Terminal', district: null, coords: null, isFastTravel: true },

                { id: 'bk_cp_01', type: 'controlPoint', title: 'The Warehouse', district: 'DUMBO', coords: { x: 1976, y: 728 }, isFastTravel: false },
                { id: 'bk_cp_02', type: 'controlPoint', title: 'The Farm', district: 'DUMBO', coords: { x: 2284, y: 923 }, isFastTravel: false },
                { id: 'bk_cp_03', type: 'controlPoint', title: 'Cadman Plaza', district: 'Brooklyn Heights', coords: { x: 1681, y: 1443 }, isFastTravel: false },
                { id: 'bk_cp_04', type: 'controlPoint', title: 'Fulton Ferry Market', district: 'Brooklyn Heights', coords: { x: 1447, y: 932 }, isFastTravel: false },

                { id: 'bk_sh_01', type: 'safeHouse', title: 'The Lookout', district: 'Brooklyn Heights', coords: { x: 1359, y: 1253 }, isFastTravel: true },
                { id: 'bk_sh_02', type: 'safeHouse', title: 'The Retreat', district: 'DUMBO', coords: { x: 2195, y: 648 }, isFastTravel: true },

                { id: 'bk_set_01', type: 'settlement', title: 'The Bridge', district: null, coords: { x: 1875, y: 1083 }, isFastTravel: true },

                { id: 'bk_act_01', type: 'activity', title: 'Open World Activity', district: 'Brooklyn Heights', coords: null, isFastTravel: false },
                { id: 'bk_act_02', type: 'activity', title: 'Open World Activity', district: 'DUMBO', coords: null, isFastTravel: false },

                { id: 'bk_bty_01', type: 'bounty', title: 'Bounty', district: 'Brooklyn Heights', coords: null, isFastTravel: false },
                { id: 'bk_bty_02', type: 'bounty', title: 'Bounty', district: 'DUMBO', coords: null, isFastTravel: false },
            ]
        }
    ];

    let typeWeights = {
        activity: 30,
        controlPoint: 20,
        mission: 10,
        bounty: 5
    };
    const REPEAT_TYPE_MALUS = 0.25;

    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const nextTaskBtn = document.getElementById('next-task-btn');
    const sessionTimerEl = document.getElementById('session-timer');
    const taskListEl = document.getElementById('task-list-container');
    const weightsEditorEl = document.getElementById('weights-editor');

    let sessionData = null;
    let state = {
        isSessionActive: false,
        isPaused: false,
        sessionStartTime: 0,
        currentTask: null,
        currentTaskStartTime: 0,
        totalTimePaused: 0,
        pauseStartTime: 0,
        timerInterval: null
    };

    const icons = {
        mission: `<svg viewBox="3 3 18 18"><path fill-rule="evenodd" d="M12 20.9L19.7 16.4V7.6L12 3.1L4.3 7.6V16.4L12 20.9ZM12 19.2L18.2 15.6V8.4L12 4.8L5.8 8.4V15.6L12 19.2ZM12 17.6L16.9 14.8V9.2L12 6.4L7.1 9.2V14.8L12 17.6ZM12 16.1L15.6 14V10L12 8L8.4 10V14L12 16.1Z"/></svg>`,
        controlPoint: `<svg viewBox="4 2 18 20"><path d="M5 2V22H7V2H5Z M7 2L21 7L7 12V2Z"/></svg>`,
        bounty: `<svg viewBox="0 0 15 15"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.5 0C7.77614 0 8 0.223858 8 0.5V1.80687C10.6922 2.0935 12.8167 4.28012 13.0068 7H14.5C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H12.9888C12.7094 10.6244 10.6244 12.7094 8 12.9888V14.5C8 14.7761 7.77614 15 7.5 15C7.22386 15 7 14.7761 7 14.5V13.0068C4.28012 12.8167 2.0935 10.6922 1.80687 8H0.5C0.223858 8 0 7.77614 0 7.5C0 7.22386 0.223858 7 0.5 7H1.78886C1.98376 4.21166 4.21166 1.98376 7 1.78886V0.5C7 0.223858 7.22386 0 7.5 0ZM8 12.0322V9.5C8 9.22386 7.77614 9 7.5 9C7.22386 9 7 9.22386 7 9.5V12.054C4.80517 11.8689 3.04222 10.1668 2.76344 8H5.5C5.77614 8 6 7.77614 6 7.5C6 7.22386 5.77614 7 5.5 7H2.7417C2.93252 4.73662 4.73662 2.93252 7 2.7417V5.5C7 5.77614 7.22386 6 7.5 6C7.77614 6 8 5.77614 8 5.5V2.76344C10.1668 3.04222 11.8689 4.80517 12.054 7H9.5C9.22386 7 9 7.22386 9 7.5C9 7.77614 9.22386 8 9.5 8H12.0322C11.7621 10.0991 10.0991 11.7621 8 12.0322Z"/></svg>`,
        activity: `<svg viewBox="0 0 27.774 27.774"><path d="M10.398,22.811h4.618v4.964h-4.618V22.811z M21.058,1.594C19.854,0.532,17.612,0,14.33,0c-3.711,0-6.205,0.514-7.482,1.543 c-1.277,1.027-1.916,3.027-1.916,6L4.911,8.551h4.577l-0.02-1.049c0-1.424,0.303-2.377,0.907-2.854 c0.604-0.477,1.814-0.717,3.632-0.717c1.936,0,3.184,0.228,3.74,0.676c0.559,0.451,0.837,1.457,0.837,3.017 c0,1.883-0.745,3.133-2.237,3.752l-1.797,0.766c-1.882,0.781-3.044,1.538-3.489,2.27c-0.442,0.732-0.665,2.242-0.665,4.529h4.68 v-0.646c0-1.41,0.987-2.533,2.965-3.365c2.03-0.861,3.343-1.746,3.935-2.651c0.592-0.908,0.888-2.498,0.888-4.771 C22.863,4.625,22.261,2.655,21.058,1.594z"/></svg>`
    };

    function getDistance(c1, c2) {
        if (!c1 || !c2) return Infinity;
        return Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2));
    }

    function findClosestFastTravel(target, locations) {
        const points = locations.filter(l => l.isFastTravel && l.coords);
        if (points.length === 0) return { message: "No fast travel points available." };
        const closest = points.reduce((acc, p) => (getDistance(target.coords, p.coords) < acc.dist ? { dist: getDistance(target.coords, p.coords), point: p } : acc), { dist: Infinity, point: null });
        return { nearestPoint: closest.point, distance: Math.round(closest.dist) };
    }

    function getWeightedRandomType(availableTypes, lastTaskType) {
        const weightedTypes = availableTypes.map(type => {
            let weight = typeWeights[type] || 1;
            if (type === lastTaskType && lastTaskType !== 'activity') {
                weight *= REPEAT_TYPE_MALUS;
            }
            return { type, weight };
        });

        const totalWeight = weightedTypes.reduce((sum, item) => sum + item.weight, 0);
        if (totalWeight <= 0) return availableTypes[0];

        let randomNum = Math.random() * totalWeight;
        for (const item of weightedTypes) {
            randomNum -= item.weight;
            if (randomNum <= 0) {
                return item.type;
            }
        }
        return availableTypes[availableTypes.length - 1];
    }

    function getRandomActivity(mapData, lastTask = null) {
        const lastTaskType = lastTask ? lastTask.target.type : null;

        const basePool = mapData.locations.filter(l =>
            typeWeights[l.type] > 0 &&
            !(l.type === 'controlPoint' && l.isFastTravel)
        );

        if (basePool.length === 0) {
            return { target: { title: "No activities available!" }, travelInfo: {} };
        }

        const availableTypes = [...new Set(basePool.map(l => l.type))];
        if (availableTypes.length === 0) {
            return { target: { title: "No types available!" }, travelInfo: {} };
        }

        const chosenType = getWeightedRandomType(availableTypes, lastTaskType);

        let typeSpecificPool = basePool.filter(l => l.type === chosenType);

        if (lastTask && lastTask.target.type !== 'activity' && lastTask.target.type === chosenType) {
            const filteredByType = typeSpecificPool.filter(l => l.id !== lastTask.target.id);
            if (filteredByType.length > 0) {
                typeSpecificPool = filteredByType;
            }
        }

        const target = typeSpecificPool[Math.floor(Math.random() * typeSpecificPool.length)];

        if (target.type === 'activity' && lastTask && lastTask.target.district) {
            target.district = lastTask.target.district;
        }

        let travelInfo = {};
        if (target.isFastTravel) {
            travelInfo = { message: "Fast travel directly." };
        } else if (target.type === 'activity') {
            travelInfo = { message: `Recommended: ${target.district} district.` };
        } else if (!target.coords) {
            travelInfo = { message: `In ${target.district} district.` };
        } else {
            travelInfo = findClosestFastTravel(target, mapData.locations);
        }
        return { target, travelInfo };
    }

    function createTaskDisplay(taskData) {
        const { target, travelInfo } = taskData;
        let primaryText = target.title;
        let secondaryText = "";
        switch (target.type) {
            case 'mission': primaryText = `Mission: ${target.title}`; break;
            case 'controlPoint': primaryText = `CP: ${target.title}`; break;
            case 'bounty': primaryText = `Bounty: ${target.district}`; break;
            case 'activity': primaryText = `Random Activity`; break;
        }
        if (travelInfo.nearestPoint) secondaryText = `via ${travelInfo.nearestPoint.title} (~${travelInfo.distance}m)`;
        else if (travelInfo.message) secondaryText = travelInfo.message;
        return { primaryText, secondaryText };
    }

    function formatTime(totalSeconds, isTotalTime) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        if (hours > 0 || isTotalTime) return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateTimers() {
        if (!state.isSessionActive || state.isPaused) return;
        const now = Date.now();
        const sessionElapsed = Math.floor((now - state.sessionStartTime - state.totalTimePaused) / 1000);
        sessionTimerEl.textContent = formatTime(sessionElapsed, true);
        const activeRow = taskListEl.querySelector('.task-row.active .time');
        if (activeRow) {
            const taskElapsed = Math.floor((now - state.currentTaskStartTime) / 1000);
            activeRow.textContent = formatTime(taskElapsed);
        }
    }

    function addNewTask(taskData) {
        state.currentTask = taskData;
        state.currentTaskStartTime = Date.now();
        const { primaryText, secondaryText } = createTaskDisplay(taskData);
        const row = document.createElement('div');
        row.className = 'task-row active';
        row.dataset.taskType = taskData.target.type;
        row.innerHTML = `
            <div class="info">
                <h3>${primaryText}</h3>
                <p>${secondaryText}</p>
            </div>
            <div class="time">00:00</div>
        `;
        taskListEl.appendChild(row);
        taskListEl.scrollTop = taskListEl.scrollHeight;
    }

    function startSession() {
        sessionData = JSON.parse(JSON.stringify(masterMapsData));
        const brooklynData = sessionData.find(map => map.meta.id === 'brooklyn');
        state.isSessionActive = true;
        state.isPaused = false;
        state.sessionStartTime = Date.now();
        state.totalTimePaused = 0;
        addNewTask(getRandomActivity(brooklynData, null));
        state.timerInterval = setInterval(updateTimers, 1000);
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        resetBtn.style.display = 'inline-block';
        nextTaskBtn.disabled = false;
    }

    function nextTask() {
        if (!state.currentTask) return;
        const brooklynData = sessionData.find(map => map.meta.id === 'brooklyn');
        const finishedRow = taskListEl.querySelector('.task-row.active');
        if (finishedRow) {
            const duration = Math.floor((Date.now() - state.currentTaskStartTime) / 1000);
            finishedRow.querySelector('.time').textContent = formatTime(duration);
            finishedRow.classList.remove('active');
        }
        if (state.currentTask.target.type === 'controlPoint') {
            const cpInSession = brooklynData.locations.find(loc => loc.id === state.currentTask.target.id);
            if (cpInSession) {
                cpInSession.isFastTravel = true;
            }
        }
        const lastTask = state.currentTask;
        addNewTask(getRandomActivity(brooklynData, lastTask));
    }

    function pauseSession() {
        if (state.isPaused) {
            state.isPaused = false;
            state.totalTimePaused += Date.now() - state.pauseStartTime;
            state.currentTaskStartTime += Date.now() - state.pauseStartTime;
            pauseBtn.textContent = 'PAUSE';
        } else {
            if (!state.isSessionActive) return;
            state.isPaused = true;
            state.pauseStartTime = Date.now();
            pauseBtn.textContent = 'RESUME';
        }
    }

    function resetSession() {
        clearInterval(state.timerInterval);
        Object.assign(state, {
            isSessionActive: false, isPaused: false, sessionStartTime: 0, currentTask: null,
            currentTaskStartTime: 0, totalTimePaused: 0, pauseStartTime: 0, timerInterval: null
        });
        taskListEl.innerHTML = '';
        sessionTimerEl.textContent = '00:00:00';
        startBtn.style.display = 'inline-block';
        pauseBtn.style.display = 'none';
        resetBtn.style.display = 'none';
        nextTaskBtn.disabled = true;
        pauseBtn.textContent = 'PAUSE';
    }

    function renderWeightEditor() {
        weightsEditorEl.innerHTML = '';
        for (const type in typeWeights) {
            const group = document.createElement('div');
            group.className = 'weight-input-group';

            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'icon-wrapper';
            iconWrapper.innerHTML = icons[type] || '';
            iconWrapper.setAttribute('data-tooltip', `${type.charAt(0).toUpperCase() + type.slice(1)}`);

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.id = `weight-${type}`;
            slider.min = 0;
            slider.max = 50;
            slider.value = typeWeights[type];
            slider.dataset.type = type;

            slider.addEventListener('input', (e) => {
                const newWeight = parseInt(e.target.value, 10);
                const taskType = e.target.dataset.type;

                iconWrapper.setAttribute('data-tooltip', `${taskType.charAt(0).toUpperCase() + taskType.slice(1)} (${newWeight})`);

                if (!isNaN(newWeight)) {
                    typeWeights[taskType] = newWeight;
                }
            });

            group.appendChild(iconWrapper);
            group.appendChild(slider);
            weightsEditorEl.appendChild(group);
        }
    }

    startBtn.addEventListener('click', startSession);
    nextTaskBtn.addEventListener('click', nextTask);
    pauseBtn.addEventListener('click', pauseSession);
    resetBtn.addEventListener('click', resetSession);

    renderWeightEditor();
});