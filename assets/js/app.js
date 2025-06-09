document.addEventListener('DOMContentLoaded', () => {
    const REPEAT_TYPE_MALUS = 0.25;
    const MIN_TASKS_BEFORE_SWITCH = 8;
    const MIN_TASKS_AFTER_RESET = 2;
    const MAP_SWITCH_CHANCE = 0.25;
    const RESET_TASK_BASE_WEIGHT = 5;
    const RESET_TASK_WEIGHT_INCREASE = 10;
    const HIGH_COMPLEXITY_THRESHOLD = 5;
    const COMPLEXITY_MALUS = 0.1;

    // --- DOM ELEMENTS ---

    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const nextTaskBtn = document.getElementById('next-task-btn');
    const toggleSettingsBtn = document.getElementById('toggle-settings-btn');
    const sessionTimerEl = document.getElementById('session-timer');
    const taskListEl = document.getElementById('task-list-container');
    const weightsEditorEl = document.getElementById('weights-editor');
    const mapsEditorEl = document.getElementById('maps-editor');
    const complexityEditorEl = document.getElementById('complexity-editor');
    const factionsEditorEl = document.getElementById('factions-editor');
    const mementoModeEditorEl = document.getElementById('memento-mode-editor');

    // --- STATE & DATA ---

    let typeWeights = {
        activity: 30,
        controlPoint: 25,
        mission: 10,
        bounty: 5,
        classifiedAssignment: 0
    };

    let sessionData = null;
    let state = {
        isSessionActive: false,
        isPaused: false,
        sessionStartTime: 0,
        currentTask: null,
        currentTaskStartTime: 0,
        totalTimePaused: 0,
        pauseStartTime: 0,
        timerInterval: null,
        currentMapId: null,
        tasksOnCurrentMap: 0,
        mapHistory: [],
        mapSwitchCooldown: 0,
        maxComplexity: 7,
        enabledFactions: [],
        lastTaskComplexity: 0,
        totalSessionDuration: 0,
        isMementoModeActive: false
    };

    // --- UTILITY FUNCTIONS ---

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function getDistance(c1, c2, scale = 1) {
        if (!c1 || !c2) return Infinity;
        const rawDist = Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2));
        return Math.round(rawDist * scale);
    }

    function findClosestFastTravel(target, map) {
        let points = map.locations.filter(l => l.isFastTravel && l.coords);

        if (state.isMementoModeActive) {
            points = points.filter(p => p.type !== 'safeHouse' && p.type !== 'settlement');
        }

        if (points.length === 0) return { message: "No fast travel points available." };
        const closest = points.reduce((acc, p) => {
            const dist = getDistance(target.coords, p.coords, map.meta.scale);
            return dist < acc.dist ? { dist, point: p } : acc;
        }, { dist: Infinity, point: null });
        return { nearestPoint: closest.point, distance: closest.dist };
    }

    function getUncapturedCps(map) {
        if (!map) return [];
        return map.locations.filter(l => l.type === 'controlPoint' && !l.isFastTravel);
    }

    // --- CORE LOGIC ---

    function getWeightedRandomMap(maps) {
        const weightedMaps = maps.map(map => {
            let weight = 10;
            if (state.mapHistory.includes(map.meta.id)) {
                weight *= 0.1;
            }
            return { map, weight };
        });
        const totalWeight = weightedMaps.reduce((sum, item) => sum + item.weight, 0);
        if (totalWeight <= 0) return maps[0];
        let randomNum = Math.random() * totalWeight;
        for (const item of weightedMaps) {
            randomNum -= item.weight;
            if (randomNum <= 0) {
                return item.map;
            }
        }
        return maps[maps.length - 1];
    }

    function getPlayableTasks(map) {
        if (!map) return [];

        return map.locations.filter(task => {
            if (task.type === 'mission' || task.type === 'classifiedAssignment') {
                if (!map.missionDeck.find(m => m.id === task.id)) {
                    return false;
                }
            }
            if (!task.type || !typeWeights.hasOwnProperty(task.type) || typeWeights[task.type] <= 0) {
                return false;
            }
            if (task.type === 'controlPoint' && task.isFastTravel) {
                return false;
            }
            if (task.complexity && task.complexity > state.maxComplexity) {
                return false;
            }
            if (!task.factions || !task.factions.some(f => state.enabledFactions.includes(f))) {
                return false;
            }
            if (state.isMementoModeActive && task.type === 'mission' && !task.coords) {
                return false;
            }
            return true;
        });
    }

    function isResetPossibleForMap(map) {
        if (!map || typeWeights.controlPoint <= 0) return false;

        const filterMatchingCps = map.locations.filter(task =>
            task.type === 'controlPoint' &&
            task.complexity <= state.maxComplexity &&
            task.factions.some(f => state.enabledFactions.includes(f))
        );

        if (filterMatchingCps.length === 0) return false;

        const areAnyMatchingCpsUncaptured = filterMatchingCps.some(cp => !cp.isFastTravel);

        return !areAnyMatchingCpsUncaptured;
    }

    function getRandomActivity(lastTask = null, excludeTypes = []) {
        const enabledMaps = sessionData.filter(m => m.meta.enabled);
        if (enabledMaps.length === 0) return { target: { title: "No Maps Enabled", type: 'error' }, travelInfo: { message: "Please enable a map." }, map: null, mapSwitched: false };

        if (typeWeights.mission > 0) {
            let allPlayableMissionsInDecks = [];
            enabledMaps.forEach(map => {
                const playableOnThisMap = map.missionDeck.filter(task => {
                    if (task.complexity && task.complexity > state.maxComplexity) return false;
                    if (!task.factions || !task.factions.some(f => state.enabledFactions.includes(f))) return false;
                    return true;
                });
                allPlayableMissionsInDecks.push(...playableOnThisMap);
            });

            if (allPlayableMissionsInDecks.length === 0) {
                sessionData.forEach(map => {
                    const allMissions = map.locations.filter(l => l.type === 'mission');
                    shuffleArray(allMissions);
                    map.missionDeck = allMissions;
                });
            }
        }

        let mapPool = enabledMaps;
        if (lastTask && lastTask.target.type === 'mission' && !lastTask.target.coords) {
            const originMap = sessionData.find(m => m.meta.id === lastTask.map.meta.id);
            if (originMap && getPlayableTasks(originMap).length > 0) {
                mapPool = [originMap];
            }
        }

        let currentMap = sessionData.find(m => m.meta.id === state.currentMapId) || mapPool[0];
        if (!mapPool.find(m => m.meta.id === currentMap.meta.id)) {
            currentMap = mapPool[0];
        }

        let targetMap = currentMap;
        let mapSwitched = false;

        if (!currentMap) {
            return { target: { title: "No valid maps available" }, travelInfo: { message: "Check your filters or enabled maps." }, map: null, mapSwitched: false };
        }

        const playableOnCurrentMap = getPlayableTasks(currentMap);
        const resetPossibleOnCurrentMap = isResetPossibleForMap(currentMap);

        const mustSwitch = playableOnCurrentMap.length === 0 && !resetPossibleOnCurrentMap;
        const maySwitch = !mustSwitch && mapPool.length > 1 && state.tasksOnCurrentMap >= MIN_TASKS_BEFORE_SWITCH && state.mapSwitchCooldown === 0 && Math.random() < MAP_SWITCH_CHANCE;

        if (mustSwitch || maySwitch) {
            const otherMaps = mapPool.filter(m => m.meta.id !== currentMap.meta.id);
            let foundNewMap = false;
            if (otherMaps.length > 0) {
                const potentialNewMap = getWeightedRandomMap(otherMaps);
                if (getPlayableTasks(potentialNewMap).length > 0 || isResetPossibleForMap(potentialNewMap)) {
                    targetMap = potentialNewMap;
                    mapSwitched = true;
                    foundNewMap = true;
                }
            }
            if (mustSwitch && !foundNewMap) {
                return { target: { title: 'No valid tasks on any enabled map!' }, travelInfo: { message: 'Adjust filters or reset session.' }, map: currentMap, mapSwitched: false };
            }
        }

        let allAvailableTasks = [];
        const taskPool = getPlayableTasks(targetMap);
        const missionDeckTasks = targetMap.missionDeck.filter(m => taskPool.find(p => p.id === m.id));
        const nonMissionTasks = taskPool.filter(t => t.type !== 'mission');
        allAvailableTasks.push(...missionDeckTasks, ...nonMissionTasks);

        if (isResetPossibleForMap(targetMap)) {
            allAvailableTasks.push({ id: 'dynamic_reset_map', type: 'resetMap', title: 'Reset Control Points', district: 'Map-wide', complexity: 0, factions: [] });
        }

        let filteredTasks = allAvailableTasks.filter(task => !excludeTypes.includes(task.type));
        if (filteredTasks.length === 0 && allAvailableTasks.length > 0) { filteredTasks = allAvailableTasks; }

        if (lastTask && (lastTask.target.type === 'mission' || lastTask.target.type === 'classifiedAssignment') && filteredTasks.length > 1) {
            const tasksWithoutLastMission = filteredTasks.filter(task => task.id !== lastTask.target.id);
            if (tasksWithoutLastMission.length > 0) {
                filteredTasks = tasksWithoutLastMission;
            }
        }

        if (filteredTasks.length === 0) { return { target: { title: "No tasks to select!", type: 'info' }, travelInfo: { message: 'Adjust filters or reset session.' }, map: targetMap, mapSwitched }; }

        const weightedTasks = filteredTasks.map(task => {
            let weight = typeWeights[task.type] || 1;
            if (task.type === 'resetMap') { weight = RESET_TASK_BASE_WEIGHT + (targetMap.meta.tasksSinceCPsCleared * RESET_TASK_WEIGHT_INCREASE); }
            if (task.type === state.currentTask?.target.type && task.type !== 'activity') { weight *= REPEAT_TYPE_MALUS; }
            if (task.complexity >= HIGH_COMPLEXITY_THRESHOLD && state.lastTaskComplexity >= HIGH_COMPLEXITY_THRESHOLD) { weight *= COMPLEXITY_MALUS; }
            return { task, weight };
        });

        const totalWeight = weightedTasks.reduce((sum, item) => sum + item.weight, 0);
        let randomNum = Math.random() * totalWeight;
        let chosenTask = weightedTasks.length > 0 ? weightedTasks[weightedTasks.length - 1].task : null;

        for (const item of weightedTasks) {
            randomNum -= item.weight;
            if (randomNum <= 0) { chosenTask = item.task; break; }
        }

        if (!chosenTask) { return { target: { title: "Could not select a task!", type: 'error' }, travelInfo: { message: 'Adjust filters or reset session.' }, map: targetMap, mapSwitched }; }

        const target = chosenTask;
        let travelInfo = {};
        if (target.isFastTravel) { travelInfo = { message: "Fast travel directly" }; }
        else if (!target.coords) { travelInfo = { message: `In ${target.district}` }; }
        else { travelInfo = findClosestFastTravel(target, targetMap); }

        return { target, travelInfo, map: targetMap, mapSwitched };
    }

    // --- UI & DISPLAY FUNCTIONS ---

    function createTaskDisplay(taskData) {
        const { target, travelInfo, map } = taskData;
        let primaryText = target.title;
        let secondaryText = "";
        let mapText = map ? map.meta.title : "";
        let districtText = "";

        if (target.type === 'activity') {
            districtText = 'Any district';
        } else if (target.district) {
            districtText = target.district;
        }

        if (target.type === 'info' || target.type === 'error') {
            primaryText = target.title;
        } else {
            switch (target.type) {
                case 'resetMap': primaryText = `Reset Control Points`; break;
                case 'mission': primaryText = `Mission: ${target.title}`; break;
                case 'controlPoint': primaryText = `CP: ${target.title}`; break;
                case 'bounty': primaryText = `Bounty Target`; break;
                case 'activity': primaryText = `Random Activity`; break;
                case 'classifiedAssignment': primaryText = `Classified: ${target.title}`; break;
            }
        }

        if (target.type === 'activity') {
            secondaryText = `Any open world activity`;
        } else if (target.type === 'resetMap') {
            secondaryText = `Open your map and use the 'Reset Control Points' feature`;
        } else if (travelInfo && travelInfo.nearestPoint) {
            secondaryText = `via ${travelInfo.nearestPoint.title} (~${travelInfo.distance}m)`;
        } else if (travelInfo && travelInfo.message) {
            if (target.type === 'bounty') {
                secondaryText = 'Find target in district';
            } else {
                secondaryText = travelInfo.message;
            }
        }

        return { primaryText, secondaryText, mapText, districtText };
    }

    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateTimers() {
        if (!state.isSessionActive) return;

        const activeRow = taskListEl.querySelector('.task-row.active .time');
        let currentTaskElapsed = 0;
        if (activeRow && !state.isPaused) {
            currentTaskElapsed = Math.floor((Date.now() - state.currentTaskStartTime) / 1000);
            activeRow.textContent = formatTime(currentTaskElapsed);
        }

        if (!state.isPaused) {
            const totalElapsed = state.totalSessionDuration + currentTaskElapsed;
            sessionTimerEl.textContent = formatTime(totalElapsed);
        }
    }

    function addNewTask(taskData) {
        state.currentTask = taskData;
        state.currentTaskStartTime = Date.now();
        const { primaryText, secondaryText, mapText, districtText } = createTaskDisplay(taskData);

        const row = document.createElement('div');
        row.className = 'task-row active';
        row.dataset.taskType = taskData.target.type;

        let metaInfoHTML = '';
        const complexity = taskData.target.complexity;
        const factions = taskData.target.factions;

        if (complexity > 0 || (factions && factions.length > 0)) {
            metaInfoHTML += `<div class="task-meta">`;

            if (complexity > 0) {
                metaInfoHTML += `
                    <div class="task-complexity">
                        <span class="label">Complexity:</span>
                        <span class="value">${complexity}</span>
                    </div>
                `;
            }

            if (factions && factions.length > 0) {
                metaInfoHTML += `<div class="task-factions">`;
                metaInfoHTML += factions.map(f => `<span class="faction-tag">${f.replace('_', ' ')}</span>`).join('');
                metaInfoHTML += `</div>`;
            }

            metaInfoHTML += `</div>`;
        }

        row.innerHTML = `
            <div class="info">
                <div class="task-location">
                    <span class="task-map">${mapText}</span>
                    ${districtText ? `<span class="task-district">${districtText}</span>` : ''}
                </div>
                <h3>${primaryText}</h3>
                <p>${secondaryText}</p>
                ${metaInfoHTML}
            </div>
            <div class="time">00:00:00</div>
        `;

        taskListEl.appendChild(row);
        taskListEl.scrollTop = taskListEl.scrollHeight;
    }

    // --- SESSION MANAGEMENT ---

    function handleTaskCompletion(task, map) {
        if (!task || !map) return;
        const taskType = task.target.type;
        const taskId = task.target.id;

        if (taskType === 'controlPoint') {
            const cpInSession = map.locations.find(loc => loc.id === taskId);
            if (cpInSession) cpInSession.isFastTravel = true;
        }
        else if (taskType === 'mission' || taskType === 'classifiedAssignment') {
            const missionIndex = map.missionDeck.findIndex(m => m.id === taskId);
            if (missionIndex > -1) {
                map.missionDeck.splice(missionIndex, 1);
            }
        }
        else if (taskType === 'resetMap') {
            map.locations.forEach(loc => {
                if (loc.type === 'controlPoint') {
                    loc.isFastTravel = false;
                }
            });
            map.meta.tasksSinceCPsCleared = 0;
            state.mapSwitchCooldown = MIN_TASKS_AFTER_RESET;
        }
    }

    function startSession() {
        sessionData = JSON.parse(JSON.stringify(masterMapsData));

        sessionData.forEach(map => {
            const missionLikeTasks = map.locations.filter(l => l.type === 'mission' || l.type === 'classifiedAssignment');
            shuffleArray(missionLikeTasks);
            map.missionDeck = missionLikeTasks;
            map.repeatableTaskPool = map.locations.filter(l => l.type === 'activity' || l.type === 'bounty');
            map.meta.tasksSinceCPsCleared = 0;
        });

        const enabledMaps = sessionData.filter(m => m.meta.enabled);
        if (enabledMaps.length === 0) {
            alert('Please enable at least one map!');
            return;
        }

        const validStartingMaps = enabledMaps.filter(map => {
            const playable = getPlayableTasks(map);
            return playable.length > 0 || (map.locations.some(l => l.type === 'controlPoint') && getUncapturedCps(map).length === 0);
        });

        if (validStartingMaps.length === 0) {
            alert("No valid tasks found on any enabled map with the current filter settings. Please adjust your filters and start a new session.");
            return;
        }

        const startingMap = validStartingMaps[Math.floor(Math.random() * validStartingMaps.length)];

        state.currentMapId = startingMap.meta.id;
        state.tasksOnCurrentMap = 0;
        state.mapHistory = [startingMap.meta.id];
        state.isSessionActive = true;
        state.isPaused = false;
        state.sessionStartTime = Date.now();
        state.totalTimePaused = 0;
        state.mapSwitchCooldown = 0;
        addNewTask(getRandomActivity(null, ['activity']));
        state.timerInterval = setInterval(updateTimers, 1000);

        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        resetBtn.style.display = 'inline-block';
        nextTaskBtn.disabled = false;
    }

    function nextTask() {
        if (!state.currentTask) return;
        let duration;

        if (state.isPaused) {
            duration = Math.floor((state.pauseStartTime - state.currentTaskStartTime) / 1000);
            state.totalTimePaused += Date.now() - state.pauseStartTime;
            state.isPaused = false;
            pauseBtn.textContent = 'PAUSE';
        } else {
            duration = Math.floor((Date.now() - state.currentTaskStartTime) / 1000);
        }

        state.totalSessionDuration += duration;

        const finishedRow = taskListEl.querySelector('.task-row.active');
        if (finishedRow) {
            finishedRow.querySelector('.time').textContent = formatTime(duration);
            finishedRow.classList.remove('active');
        }
        const lastTask = state.currentTask;

        state.lastTaskComplexity = lastTask.target.complexity || 0;
        const mapOfLastTask = sessionData.find(m => m.meta.id === lastTask.map.meta.id);

        handleTaskCompletion(lastTask, mapOfLastTask);
        const excludeNextTypes = lastTask.target.type === 'resetMap' ? ['activity'] : [];

        const newTaskData = getRandomActivity(lastTask, excludeNextTypes);

        if (newTaskData.mapSwitched) {
            state.currentMapId = newTaskData.map.meta.id;
            state.tasksOnCurrentMap = 0;
            state.mapHistory.push(newTaskData.map.meta.id);
            if (state.mapHistory.length > masterMapsData.length - 1 && state.mapHistory.length > 1) {
                state.mapHistory.shift();
            }
        } else {
            state.tasksOnCurrentMap++;
            if (state.mapSwitchCooldown > 0) {
                state.mapSwitchCooldown--;
            }

            const currentMapObject = sessionData.find(m => m.meta.id === state.currentMapId);
            if (currentMapObject && getUncapturedCps(currentMapObject).length === 0) {
                currentMapObject.meta.tasksSinceCPsCleared++;
            }
        }
        addNewTask(newTaskData);
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
            isSessionActive: false,
            isPaused: false,
            sessionStartTime: 0,
            currentTask: null,
            currentTaskStartTime: 0,
            totalTimePaused: 0,
            pauseStartTime: 0,
            timerInterval: null,
            currentMapId: null,
            tasksOnCurrentMap: 0,
            mapHistory: [],
            mapSwitchCooldown: 0,
            lastTaskComplexity: 0,
            totalSessionDuration: 0
        });

        taskListEl.innerHTML = '';
        sessionTimerEl.textContent = '00:00:00';
        startBtn.style.display = 'inline-block';
        pauseBtn.style.display = 'none';
        resetBtn.style.display = 'none';
        nextTaskBtn.disabled = true;
        pauseBtn.textContent = 'PAUSE';
    }

    function handleKeyPress(event) {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            return;
        }

        if (event.code === 'Space') {
            event.preventDefault();

            if (state.isSessionActive) {
                if (!nextTaskBtn.disabled) {
                    nextTaskBtn.click();
                }
            } else {
                startBtn.click();
            }
        }
    }

    // --- INITIAL RENDER & EVENT LISTENERS ---

    function renderWeightEditor() {
        weightsEditorEl.innerHTML = '';
        const tooltipMap = {
            activity: 'Activities',
            controlPoint: 'Control Points',
            mission: 'Missions',
            bounty: 'Bounties',
            classifiedAssignment: 'Classified Assignments'
        }
        Object.keys(typeWeights).forEach(type => {
            if (type === 'mapChange') return;

            const group = document.createElement('div');
            group.className = 'slider-group';

            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'slider-icon';
            iconWrapper.innerHTML = icons[type] || '';
            iconWrapper.dataset.type = type;
            iconWrapper.setAttribute('data-tooltip', tooltipMap[type]);

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = 0;
            slider.max = 50;
            slider.value = typeWeights[type];

            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'slider-value';
            valueDisplay.textContent = typeWeights[type];

            slider.addEventListener('input', (e) => {
                const newWeight = parseInt(e.target.value, 10);
                if (!isNaN(newWeight)) {
                    typeWeights[type] = newWeight;
                    valueDisplay.textContent = newWeight;
                }
            });

            group.appendChild(iconWrapper);
            group.appendChild(slider);
            group.appendChild(valueDisplay);
            weightsEditorEl.appendChild(group);
        });
    }

    function renderMapSelector() {
        mapsEditorEl.innerHTML = '';
        masterMapsData.forEach(map => {
            const group = document.createElement('div');
            group.className = 'map-toggle-group';

            const label = document.createElement('label');
            label.setAttribute('for', `map-toggle-${map.meta.id}`);

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `map-toggle-${map.meta.id}`;
            input.checked = map.meta.enabled;
            input.addEventListener('change', (e) => {
                const mapToUpdate = masterMapsData.find(m => m.meta.id === map.meta.id);
                if (mapToUpdate) {
                    mapToUpdate.meta.enabled = e.target.checked;
                }
                if (state.isSessionActive) {
                    const mapInSession = sessionData.find(m => m.meta.id === map.meta.id);
                    if (mapInSession) { mapInSession.meta.enabled = e.target.checked; }
                    const remainingEnabledMaps = masterMapsData.filter(m => m.meta.enabled);
                    if (remainingEnabledMaps.length === 0) {
                        alert("You can't disable the last active map during a session!");
                        e.target.checked = true;
                        if (mapToUpdate) mapToUpdate.meta.enabled = true;
                        if (mapInSession) mapInSession.meta.enabled = true;
                        return;
                    }
                    if (!e.target.checked && state.currentMapId === mapToUpdate.meta.id) {
                        state.currentMapId = remainingEnabledMaps[0].meta.id;
                        state.tasksOnCurrentMap = 0;
                        state.mapHistory = [remainingEnabledMaps[0].meta.id];
                    }
                }
            });

            const span = document.createElement('span');
            span.className = 'map-name';
            span.textContent = map.meta.title;

            label.appendChild(input);
            label.appendChild(span);
            group.appendChild(label);
            mapsEditorEl.appendChild(group);
        });
    }

    function renderComplexityFilter() {
        complexityEditorEl.innerHTML = '';

        const group = document.createElement('div');
        group.className = 'slider-group';

        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'slider-icon';
        iconWrapper.innerHTML = icons.complexity || '';
        iconWrapper.dataset.type = 'complexity';
        iconWrapper.setAttribute('data-tooltip', 'Complexity');

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 1;
        slider.max = 10;
        slider.value = state.maxComplexity;

        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'slider-value';
        valueDisplay.textContent = state.maxComplexity;

        slider.addEventListener('input', e => {
            state.maxComplexity = parseInt(e.target.value, 10);
            valueDisplay.textContent = state.maxComplexity;
        });

        const legend = document.createElement('div');
        legend.className = 'complexity-legend';
        legend.innerHTML = `
            <p><span>1-3:</span> Activities, CPs, Bounties</p>
            <p><span>4-7:</span> Short Missions & Strongholds</p>
            <p><span>8-10:</span> Manhunts, Long Missions & Strongholds</p>
        `;

        group.appendChild(iconWrapper);
        group.appendChild(slider);
        group.appendChild(valueDisplay);

        complexityEditorEl.appendChild(group);
        complexityEditorEl.appendChild(legend);
    }

    function renderFactionFilter() {
        factionsEditorEl.innerHTML = '';

        const factionOrder = ['hyenas', 'black_tusk', 'true_sons', 'cleaners', 'outcasts', 'rikers'];
        state.enabledFactions = [...factionOrder];

        factionOrder.forEach(faction => {
            const group = document.createElement('div');
            group.className = 'faction-toggle-group';

            const label = document.createElement('label');
            label.setAttribute('for', `faction-toggle-${faction}`);

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `faction-toggle-${faction}`;
            input.value = faction;
            input.checked = true;

            input.addEventListener('change', e => {
                if (e.target.checked) {
                    state.enabledFactions.push(e.target.value);
                } else {
                    state.enabledFactions = state.enabledFactions.filter(f => f !== e.target.value);
                }
            });

            const span = document.createElement('span');
            span.className = 'faction-name';
            span.textContent = faction.replace('_', ' ');

            label.appendChild(input);
            label.appendChild(span);
            group.appendChild(label);
            factionsEditorEl.appendChild(group);
        });
    }

    function renderMementoModeToggle() {
        mementoModeEditorEl.innerHTML = '';
        const group = document.createElement('div');
        group.className = 'generic-toggle-group';

        const label = document.createElement('label');
        label.setAttribute('for', 'memento-toggle');

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = 'memento-toggle';
        input.checked = state.isMementoModeActive;

        const span = document.createElement('span');
        span.className = 'toggle-name';

        span.textContent = state.isMementoModeActive ? 'Enabled' : 'Disabled';

        input.addEventListener('change', e => {
            state.isMementoModeActive = e.target.checked;
            span.textContent = e.target.checked ? 'Enabled' : 'Disabled';
        });

        label.appendChild(input);
        label.appendChild(span);
        group.appendChild(label);

        const description = document.createElement('p');
        description.className = 'setting-description';
        description.textContent = 'Avoids locations that cancel Memento buff: Off-Site Missions, Safehouses, Settlements';

        mementoModeEditorEl.appendChild(group);
        mementoModeEditorEl.appendChild(description);
    }

    startBtn.addEventListener('click', startSession);
    pauseBtn.addEventListener('click', pauseSession);
    resetBtn.addEventListener('click', resetSession);
    nextTaskBtn.addEventListener('click', nextTask);

    toggleSettingsBtn.innerHTML = icons.gear;
    toggleSettingsBtn.addEventListener('click', () => {
        document.getElementById('settings-container').classList.toggle('is-collapsed');
        toggleSettingsBtn.classList.toggle('is-active');
    });

    document.addEventListener('keydown', handleKeyPress);

    renderWeightEditor();
    renderMapSelector();
    renderComplexityFilter();
    renderFactionFilter();
    renderMementoModeToggle();
});