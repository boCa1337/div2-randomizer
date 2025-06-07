document.addEventListener('DOMContentLoaded', () => {

    const REPEAT_TYPE_MALUS = 0.25;
    const MIN_TASKS_BEFORE_SWITCH = 8;
    const MAP_SWITCH_CHANCE = 0.25;

    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const nextTaskBtn = document.getElementById('next-task-btn');
    const toggleSettingsBtn = document.getElementById('toggle-settings-btn');

    const sessionTimerEl = document.getElementById('session-timer');
    const taskListEl = document.getElementById('task-list-container');
    const weightsEditorEl = document.getElementById('weights-editor');
    const mapsEditorEl = document.getElementById('maps-editor');

    let typeWeights = {
        activity: 30,
        controlPoint: 20,
        mission: 10,
        bounty: 5
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
        mapHistory: []
    };

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
        const points = map.locations.filter(l => l.isFastTravel && l.coords);
        if (points.length === 0) return { message: "No fast travel points available." };
        const closest = points.reduce((acc, p) => {
            const dist = getDistance(target.coords, p.coords, map.meta.scale);
            return dist < acc.dist ? { dist, point: p } : acc;
        }, { dist: Infinity, point: null });
        return { nearestPoint: closest.point, distance: closest.dist };
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

    function getRandomActivity(lastTask = null) {
        const enabledMaps = sessionData.filter(m => m.meta.enabled);
        if (enabledMaps.length === 0) return { target: { title: "No Maps Enabled" }, travelInfo: {}, map: null, mapSwitched: false };

        const lastTaskType = lastTask ? lastTask.target.type : null;
        let currentMap = sessionData.find(m => m.meta.id === state.currentMapId) || enabledMaps[0];
        let targetMap = currentMap;
        let mapSwitched = false;

        const canSwitch = enabledMaps.length > 1 && state.tasksOnCurrentMap >= MIN_TASKS_BEFORE_SWITCH;
        if (canSwitch && Math.random() < MAP_SWITCH_CHANCE) {
            const otherMaps = enabledMaps.filter(m => m.meta.id !== currentMap.meta.id);
            if (otherMaps.length > 0) {
                targetMap = getWeightedRandomMap(otherMaps);
                mapSwitched = true;
            }
        }

        if (targetMap.uniqueTaskDeck.length === 0) {
            const allUniqueTasks = targetMap.locations.filter(l => l.type === 'mission' || l.type === 'controlPoint');
            shuffleArray(allUniqueTasks);
            targetMap.uniqueTaskDeck = allUniqueTasks;
        }

        const uniqueTasksInMap = targetMap.uniqueTaskDeck.filter(task => typeWeights[task.type] > 0);
        const repeatableTasksInMap = targetMap.repeatableTaskPool.filter(task => typeWeights[task.type] > 0);

        let availableTypes = [];
        if (uniqueTasksInMap.length > 0) {
            availableTypes.push(...[...new Set(uniqueTasksInMap.map(t => t.type))]);
        }
        if (repeatableTasksInMap.length > 0) {
            availableTypes.push(...[...new Set(repeatableTasksInMap.map(t => t.type))]);
        }

        if (mapSwitched && availableTypes.length > 1) {
        } else if (canSwitch && !mapSwitched) {
            availableTypes.push('mapChange');
        }

        if (availableTypes.length === 0) {
            return { target: { title: `No weighted activities on ${targetMap.meta.title}` }, map: targetMap, mapSwitched };
        }

        const chosenType = getWeightedRandomType(availableTypes, lastTaskType);

        if (chosenType === 'mapChange') {
            return getRandomActivity({ ...lastTask, target: { ...lastTask.target, type: 'mapChange' } });
        }

        let target;
        if (chosenType === 'mission' || chosenType === 'controlPoint') {
            const deck = targetMap.uniqueTaskDeck;
            let taskIndex = deck.findIndex(t => t.type === chosenType);

            if (taskIndex !== -1) {
                target = deck.splice(taskIndex, 1)[0];
            } else {
                if (repeatableTasksInMap.length > 0) {
                    let fallbackType = getWeightedRandomType(repeatableTasksInMap.map(t => t.type), lastTaskType);
                    let pool = repeatableTasksInMap.filter(t => t.type === fallbackType);
                    target = pool[Math.floor(Math.random() * pool.length)];
                } else {
                    return { target: { title: "All tasks done!" }, map: targetMap, mapSwitched };
                }
            }
        } else {
            let pool = repeatableTasksInMap.filter(t => t.type === chosenType);
            target = pool[Math.floor(Math.random() * pool.length)];
        }

        if (!target) { return getRandomActivity(lastTask); }

        if (target.type === 'activity' && lastTask && lastTask.map.meta.id === targetMap.meta.id && lastTask.target.district) {
            target.district = lastTask.target.district;
        }

        let travelInfo = {};
        if (target.isFastTravel) { travelInfo = { message: "Fast travel directly." }; }
        else if (!target.coords) { travelInfo = { message: `In ${target.district} district.` }; }
        else { travelInfo = findClosestFastTravel(target, targetMap); }

        return { target, travelInfo, map: targetMap, mapSwitched };
    }

    function createTaskDisplay(taskData) {
        const { target, travelInfo, map } = taskData;
        let primaryText = target.title;
        let secondaryText = "";
        let mapText = map ? map.meta.title : "";

        switch (target.type) {
            case 'mission': primaryText = `Mission: ${target.title}`; break;
            case 'controlPoint': primaryText = `CP: ${target.title}`; break;
            case 'bounty': primaryText = `Bounty: ${target.district}`; break;
            case 'activity': primaryText = `Random Activity`; break;
        }

        if (travelInfo.nearestPoint) {
            secondaryText = `via ${travelInfo.nearestPoint.title} (~${travelInfo.distance}m)`;
        } else if (travelInfo.message) {
            secondaryText = travelInfo.message;
        }

        if (target.type === 'activity') {
            secondaryText = `Recommended: ${target.district}`;
        }

        return { primaryText, secondaryText, mapText };
    }

    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateTimers() {
        if (!state.isSessionActive || state.isPaused) return;
        const now = Date.now();
        const sessionElapsed = Math.floor((now - state.sessionStartTime - state.totalTimePaused) / 1000);
        sessionTimerEl.textContent = formatTime(sessionElapsed);
        const activeRow = taskListEl.querySelector('.task-row.active .time');
        if (activeRow) {
            const taskElapsed = Math.floor((now - state.currentTaskStartTime) / 1000);
            activeRow.textContent = formatTime(taskElapsed);
        }
    }

    function addNewTask(taskData) {
        state.currentTask = taskData;
        state.currentTaskStartTime = Date.now();
        const { primaryText, secondaryText, mapText } = createTaskDisplay(taskData);
        const row = document.createElement('div');
        row.className = 'task-row active';
        row.dataset.taskType = taskData.target.type;
        row.innerHTML = `
            <div class="info">
                <span class="task-map">${mapText}</span>
                <h3>${primaryText}</h3>
                <p>${secondaryText}</p>
            </div>
            <div class="time">00:00:00</div>
        `;
        taskListEl.appendChild(row);
        taskListEl.scrollTop = taskListEl.scrollHeight;
    }

    function startSession() {
        sessionData = JSON.parse(JSON.stringify(masterMapsData));

        sessionData.forEach(map => {
            const uniqueTasks = map.locations.filter(l => l.type === 'mission' || l.type === 'controlPoint');
            shuffleArray(uniqueTasks);
            map.uniqueTaskDeck = uniqueTasks;
            map.repeatableTaskPool = map.locations.filter(l => l.type === 'activity' || l.type === 'bounty');
        });

        const enabledMaps = sessionData.filter(m => m.meta.enabled);
        if (enabledMaps.length === 0) {
            alert('Please enable at least one map!');
            return;
        }

        const startingMap = enabledMaps[Math.floor(Math.random() * enabledMaps.length)];
        state.currentMapId = startingMap.meta.id;
        state.tasksOnCurrentMap = 0;
        state.mapHistory = [startingMap.meta.id];

        state.isSessionActive = true;
        state.isPaused = false;
        state.sessionStartTime = Date.now();
        state.totalTimePaused = 0;
        addNewTask(getRandomActivity(null));
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

        const finishedRow = taskListEl.querySelector('.task-row.active');
        if (finishedRow) {
            finishedRow.querySelector('.time').textContent = formatTime(duration);
            finishedRow.classList.remove('active');
        }

        const lastTask = state.currentTask;
        if (lastTask.target.type === 'controlPoint') {
            const mapOfTask = sessionData.find(m => m.meta.id === lastTask.map.meta.id);
            if (mapOfTask) {
                const cpInSession = mapOfTask.locations.find(loc => loc.id === lastTask.target.id);
                if (cpInSession) cpInSession.isFastTravel = true;
            }
        }

        const newTaskData = getRandomActivity(lastTask);

        if (newTaskData.mapSwitched) {
            state.currentMapId = newTaskData.map.meta.id;
            state.tasksOnCurrentMap = 0;
            state.mapHistory.push(newTaskData.map.meta.id);
            if (state.mapHistory.length > masterMapsData.length - 1 && state.mapHistory.length > 1) {
                state.mapHistory.shift();
            }
        } else {
            state.tasksOnCurrentMap++;
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
            isSessionActive: false, isPaused: false, sessionStartTime: 0, currentTask: null,
            currentTaskStartTime: 0, totalTimePaused: 0, pauseStartTime: 0, timerInterval: null,
            currentMapId: null, tasksOnCurrentMap: 0, mapHistory: []
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
        Object.keys(typeWeights).forEach(type => {
            if (type === 'mapChange') return;
            const group = document.createElement('div');
            group.className = 'weight-input-group';

            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'icon-wrapper';
            iconWrapper.innerHTML = icons[type] || '';
            iconWrapper.setAttribute('data-tooltip', `${type.charAt(0).toUpperCase() + type.slice(1)} (${typeWeights[type]})`);

            iconWrapper.dataset.type = type;

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
                if (mapToUpdate) mapToUpdate.meta.enabled = e.target.checked;

                if (!e.target.checked && state.currentMapId === mapToUpdate.meta.id) {
                    const remainingEnabledMaps = masterMapsData.filter(m => m.meta.enabled);
                    if (remainingEnabledMaps.length > 0) {
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

    startBtn.addEventListener('click', startSession);
    nextTaskBtn.addEventListener('click', nextTask);
    pauseBtn.addEventListener('click', pauseSession);
    resetBtn.addEventListener('click', resetSession);

    toggleSettingsBtn.innerHTML = icons.gear;
    toggleSettingsBtn.addEventListener('click', () => {
        document.getElementById('settings-container').classList.toggle('is-collapsed');
        toggleSettingsBtn.classList.toggle('is-active');
    });

    renderWeightEditor();
    renderMapSelector();
});