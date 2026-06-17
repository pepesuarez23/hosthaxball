const puppeteer = require('puppeteer');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const token = process.env.TOKEN;

const mapSources = [
    { key: 'x3 Bazinga', paths: [path.join(__dirname, 'x3 Bazinga.hbs'), path.join(__dirname, '..', 'haxmaps', 'x3 Bazinga.hbs')] },
    { key: 'x3 Futsal', paths: [path.join(__dirname, 'x3 Futsal.hbs'), path.join(__dirname, '..', 'haxmaps', 'x3 Futsal.hbs')] },
    { key: 'x3 Champions', paths: [path.join(__dirname, 'x3 Champions.hbs'), path.join(__dirname, '..', 'haxmaps', 'x3 Champions.hbs')] },
    { key: 'x3 Liga', paths: [path.join(__dirname, 'x3 Liga.hbs'), path.join(__dirname, '..', 'haxmaps', 'x3 Liga.hbs')] },
    { key: 'x3 nuevito', paths: [path.join(__dirname, 'x3 nuevito.hbs'), path.join(__dirname, '..', 'haxmaps', 'x3 nuevito.hbs')] }
];

function loadMapFile(entry) {
    for (const filePath of entry.paths) {
        if (fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf8');
    }
    throw new Error(`No encontré el mapa ${entry.key}`);
}

const maps = {};
const mapNames = [];
for (const entry of mapSources) {
    maps[entry.key] = loadMapFile(entry);
    mapNames.push(entry.key);
}

const statsPath = path.join(__dirname, 'stats.json');
const accountsPath = path.join(__dirname, 'accounts.json');

function loadSavedStats() {
    try {
        if (!fs.existsSync(statsPath)) return {};
        return JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    } catch (error) {
        console.error('No pude cargar stats.json, arranco con stats vacías:', error.message);
        return {};
    }
}

function saveStats(stats) {
    try {
        fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf8');
    } catch (error) {
        console.error('No pude guardar stats.json:', error.message);
    }
}

function loadSavedAccounts() {
    try {
        if (!fs.existsSync(accountsPath)) return {};
        return JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
    } catch (error) {
        console.error('No pude cargar accounts.json, arranco sin cuentas:', error.message);
        return {};
    }
}

function saveAccounts(accounts) {
    try {
        fs.writeFileSync(accountsPath, JSON.stringify(accounts, null, 2), 'utf8');
    } catch (error) {
        console.error('No pude guardar accounts.json:', error.message);
    }
}

async function iniciarHost(token) {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://www.haxball.com/headless', { waitUntil: 'domcontentloaded' });

    try {
        await page.waitForFunction(() => typeof window.HBInit === 'function', { timeout: 30000 });
    } catch (error) {
        console.error('No pude cargar Haxball Headless: window.HBInit no apareció. Probá generar un token nuevo y revisar tu conexión.');
        await browser.close();
        return;
    }

    const savedStats = loadSavedStats();
    const savedAccounts = loadSavedAccounts();
    await page.exposeFunction('saveHaxStats', (stats) => saveStats(stats));
    await page.exposeFunction('saveHaxAccounts', (accounts) => saveAccounts(accounts));

    await page.evaluate((token, maps, mapNames, savedStats, savedAccounts) => {
        const room = window.HBInit({
            roomName: '🏆 ʟɪɢᴀ ᴀʀɢᴇɴᴛɪɴᴀ ᴀꜰᴀ | ꜰᴜᴛꜱᴀʟ x𝟥 ⚽',
            playerName: 'HOST',
            maxPlayers: 20,
            public: true,
            token: token
        });

        const TEAM_SPEC = 0;
        const TEAM_RED = 1;
        const TEAM_BLUE = 2;
        const TEAM_MAX = 3;
        const DISCORD_URL = 'https://discord.gg/cYXr45AAu';
        const ownerName = 'PepeSuarez23';
        const coOwnerName = 'marc casado';

        const rankGroups = [
            { name: 'Bronce Oxidado', levels: 3, color: 0x8B4513 },
            { name: 'Metal Abollado', levels: 3, color: 0x808080 },
            { name: 'Oro trucho', levels: 4, color: 0xFFD700 },
            { name: 'Platino', levels: 4, color: 0x87CEEB },
            { name: 'CRAKZASO', levels: 4, color: 0x8A2BE2 },
            { name: 'MAESTRASO', levels: 5, color: 0x00B050 },
            { name: 'DIOS SUPREMO', levels: 5, color: 0xFF0000 }
        ];

        const welcomeMessages = [
            'Que onda [N], SOS BIENVENIDO MI REY!!'
        ];

        const goodbyeMessages = [
            'Te re fuiste wachinaso, a la prox nos vemos!!'
        ];

        const soloGoalMessages = [
            '⚽ ¡Golazo individual de [N]!',
            '🔥 [N] se la cocinó solo y adentro.',
            '💣 [N] metió un gol sin asistencia.',
            '😮 [N] hizo todo solo y la mandó a guardar.',
            '🏹 Definición limpia de [N], sin pase previo.'
        ];

        const assistedGoalMessages = [
            '⚽ ¡Gol de [N] con asistencia de [A]!',
            '🤝 [A] la sirvió y [N] no perdonó.',
            '🎯 Pase fino de [A], definición de [N].',
            '🔥 Conexión perfecta: [A] para [N].',
            '💫 Jugadón colectivo, [N] marca tras pase de [A].'
        ];

        const hattrickMessages = [
            '🎩 ¡HAT-TRICK de [N]! Está intratable.',
            '👑 [N] ya clavó tres, noche de crack.',
            '🔥 Tercer gol de [N], modo leyenda activado.',
            '💣 [N] firma un hat-trick brutal.',
            '🏆 Tres goles para [N], actuación suprema.'
        ];

        const redKits = [
            { name: 'River Plate', angle: 60, text: 0x000000, colors: [0xFFFFFF, 0xFA0000, 0xFFFFFF] },
            { name: 'Independiente', angle: 60, text: 0xFFFFFF, colors: [0xFF0000, 0xBD0000, 0xFF0000] },
            { name: 'Huracan', angle: 0, text: 0xEB0000, colors: [0xFFFFFF] },
            { name: 'Estudiantes', angle: 0, text: 0x000000, colors: [0xFF0000, 0xFFFFFF, 0xFF0000] },
            { name: "Newell's Old Boys", angle: 0, text: 0xFFFFFF, colors: [0xFF0000, 0x000000] },
            { name: 'Argentinos Juniors', angle: 120, text: 0x000000, colors: [0xFF0000, 0xFFFFFF, 0xFF0000] },
            { name: 'Lanus', angle: 60, text: 0xFFFFFF, colors: [0x590801] },
            { name: 'Colon', angle: 0, text: 0xFFFFFF, colors: [0xFF0000, 0x000000] },
            { name: 'Union', angle: 0, text: 0x000000, colors: [0xFF0000, 0xFFFFFF, 0xFF0000] },
            { name: 'Arsenal de Sarandi', angle: 0, text: 0xFFFFFF, colors: [0xD10000, 0x007BD9, 0xD10000] },
            { name: 'Talleres (RdE)', angle: 0, text: 0x000000, colors: [0xFF0000, 0xFFFFFF, 0xFF0000] },
            { name: 'All Boys', angle: 0, text: 0x000000, colors: [0xFFFFFF] },
            { name: 'Patronato', angle: 0, text: 0xFFFFFF, colors: [0xF00000, 0x000000, 0xF00000] },
            { name: 'Atl. Parana', angle: 0, text: 0x000000, colors: [0xFF0000, 0xFFFFFF, 0xFF0000] },
            { name: 'Boca Unidos', angle: 0, text: 0xFFFFFF, colors: [0xF0F000, 0xFF0000, 0xF0F000] },
            { name: 'Chacarita', angle: 0, text: 0xFFFFFF, colors: [0xF00000, 0x000000, 0xF00000] },
            { name: 'Instituto', angle: 0, text: 0x000000, colors: [0xFF0000, 0xFFFFFF, 0xFF0000] },
            { name: 'Los Andes', angle: 0, text: 0x000000, colors: [0xFF0000, 0xFFFFFF, 0xFF0000] },
            { name: 'Santamarina', angle: 0, text: 0xFFFFFF, colors: [0xF0F000, 0x000000, 0xF0F000] },
            { name: 'Platense', angle: 90, text: 0xFFFFFF, colors: [0xFFFFFF, 0x210C00, 0xFFFFFF] },
            { name: 'Estudiantes (BA)', angle: 0, text: 0xFFFFFF, colors: [0xFFFFFF, 0x000000, 0xFFFFFF] },
            { name: 'Alvarado (MdP)', angle: 60, text: 0x000000, colors: [0x120082, 0xFFFFFF, 0x120082] }
        ];

        const blueKits = [
            { name: 'Boca Juniors', angle: 90, text: 0xFFFFFF, colors: [0x006BD4, 0xE0F000, 0x006BD4] },
            { name: 'Racing Club', angle: 0, text: 0x000000, colors: [0x0088FF, 0xFAFAFA, 0x0088FF] },
            { name: 'San Lorenzo', angle: 0, text: 0xFFFFFF, colors: [0x00002E, 0xFF0000, 0x00002E] },
            { name: 'Gimnasia', angle: 90, text: 0xFFFFFF, colors: [0xFFFFFF, 0x00159C, 0xFFFFFF] },
            { name: 'Rosario Central', angle: 0, text: 0xFFFFFF, colors: [0x001CA6, 0xFFF700, 0x001CA6] },
            { name: 'Velez', angle: 90, text: 0xFFFFFF, colors: [0xFFFFFF, 0x000C59, 0xFFFFFF] },
            { name: 'Banfield', angle: 0, text: 0x000000, colors: [0xFFFFFF, 0x00B035, 0xFFFFFF] },
            { name: 'Belgrano', angle: 60, text: 0xFFFFFF, colors: [0x00E5FF] },
            { name: 'Quilmes', angle: 60, text: 0x02003D, colors: [0xFFFFFF] },
            { name: 'Tigre', angle: 90, text: 0xFFFFFF, colors: [0x0010EB, 0xFF0000, 0x0010EB] },
            { name: 'Aldosivi', angle: 0, text: 0x000000, colors: [0xF7FF00, 0x006E0B, 0xF7FF00] },
            { name: 'Olimpo', angle: 0, text: 0x000000, colors: [0xF7FF00] },
            { name: 'Defensa y Justicia', angle: 0, text: 0x000000, colors: [0xF7FF00] },
            { name: 'Godoy Cruz', angle: 0, text: 0xFFFFFF, colors: [0x002CD9] },
            { name: 'Sarmiento (J)', angle: 0, text: 0xFFFF00, colors: [0x00E636] },
            { name: 'Temperley', angle: 60, text: 0xFFFFFF, colors: [0x00E5FF] },
            { name: 'Nueva Chicago', angle: 0, text: 0xFFFFFF, colors: [0x00800D, 0x000000, 0x00800D] },
            { name: 'Atletico de Rafaela', angle: 0, text: 0x000000, colors: [0x00D6DE, 0xFFFFFF, 0x00D6DE] },
            { name: 'San Martin (SJ)', angle: 0, text: 0xFFFFFF, colors: [0x00800D, 0x000000, 0x00800D] },
            { name: 'Crucero del Norte', angle: 0, text: 0x000000, colors: [0xEEFF00, 0xFFA200] },
            { name: 'Talleres de Cordoba', angle: 0, text: 0xFFFFFF, colors: [0xFFFFFF, 0x010019, 0xFFFFFF] },
            { name: 'Almagro', angle: 0, text: 0xFFFFFF, colors: [0x003694, 0x000000, 0x003694] },
            { name: 'Atlanta', angle: 0, text: 0xFFFFFF, colors: [0xF0E000, 0x003694, 0xF0E000] },
            { name: 'Atl. Tucuman', angle: 0, text: 0x000000, colors: [0x00D6DE, 0xFFFFFF, 0x00D6DE] },
            { name: 'Ferro', angle: 0, text: 0xFFFFFF, colors: [0x00BA2C, 0x009623] }
        ];

        const stats = savedStats && typeof savedStats === 'object' ? savedStats : {};
        const accounts = savedAccounts && typeof savedAccounts === 'object' ? savedAccounts : {};
        const loggedIn = {};
        const activeConns = {};
        let afkEnabled = false;
        const gameSummary = { goals: [], hattricks: [] };
        const gameGoals = {};
        const gameAssists = {};
        let lastTouch = null;
        let secondLastTouch = null;
        let currentMap = '';
        let currentMapIndex = 0;
        let autoMatchTimer = null;
        let ignoreNextGameStop = false;
        let victoryPending = false;
        let syncInProgress = false;
        let matchPlayers = [];
        let matchStartedAt = 0;
        let officialMatchInProgress = false;
        let matchIsOfficial = false;
        let matchFinalized = false;
        const lastActivity = {};
        const afkWarningSent = {};
        const afkStrikes = {};
        const afkPauseOffset = {};
        let afkCheckTimer = null;
        let gamePaused = false;
        let pauseStartedAt = 0;
        const AFK_WARN_SEC = 15;
        const AFK_GRACE_SEC = 8;
        const AFK_ACTION_SEC = AFK_WARN_SEC + AFK_GRACE_SEC;
        const voluntaryAfk = {};
        const chatBurst = {};
        let voteKick = null;
        const VOTEKICK_DURATION_MS = 60000;
        const CHAT_BURST_LIMIT = 3;
        const CHAT_COOLDOWN_MS = 3000;
        const SOUND_NONE = 0;
        const SOUND_BOT = 2;
        const SOUND_MENTION = 2;
        const COLOR_UNREGISTERED = 0x888888;
        const COLOR_REGISTER = 0xFF0000;

        function pick(list) {
            return list[Math.floor(Math.random() * list.length)];
        }

        function normalizeName(name) {
            return String(name || '').trim().toLowerCase();
        }

        
        function isLogged(player) {
            return !!player && loggedIn[player.id] === true;
        }

        function sendAuthInfo(player) {
            const target = player ? player.id : null;
            room.sendAnnouncement('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', target, COLOR_REGISTER, 'bold', SOUND_BOT);
            room.sendAnnouncement('🔐 PARA SUMAR STATS: !register tu_contraseña', target, COLOR_REGISTER, 'bold', SOUND_BOT);
            room.sendAnnouncement('🔑 SI YA TENÉS CUENTA: !login tu_contraseña', target, COLOR_REGISTER, 'bold', SOUND_BOT);
            room.sendAnnouncement('ℹ️ Podés jugar sin registrarte, pero NO sumás stats.', target, 0xFFFFFF, 'normal', SOUND_NONE);
            room.sendAnnouncement('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', target, COLOR_REGISTER, 'bold', SOUND_BOT);
        }

        function sendDiscordBanner(player) {
            const target = player ? player.id : null;
            room.sendAnnouncement('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', target, 0x5865F2, 'bold', SOUND_BOT);
            room.sendAnnouncement('💬 ¡Sumate a la comunidad de la Liga!', target, 0x5865F2, 'bold', SOUND_BOT);
            room.sendAnnouncement(`🎮 Discord: ${DISCORD_URL}`, target, 0x00BFFF, 'bold', SOUND_BOT);
            room.sendAnnouncement('📢 Partidos, torneos, novedades y más. ¡Te esperamos!', target, 0xFFFFFF, 'normal', SOUND_NONE);
            room.sendAnnouncement('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', target, 0x5865F2, 'bold', SOUND_BOT);
        }

        function botAnnounce(text, targetId, color, style) {
            room.sendAnnouncement(text, targetId, color, style, SOUND_BOT);
        }

        function getStats(name) {
            if (!stats[name]) {
                stats[name] = {
                    name,
                    matches: 0,
                    points: 0,
                    wins: 0,
                    goals: 0,
                    assists: 0,
                    hattricks: 0,
                    mvps: 0,
                    seconds: 0,
                    streak: 0,
                    bestStreak: 0
                };
                persistStats();
            }
            return stats[name];
        }

        function allStats() {
            return Object.values(stats);
        }

        function persistStats() {
            if (typeof window.saveHaxStats !== 'function') return;
            window.saveHaxStats(stats).catch(() => {});
        }

        function persistAccounts() {
            if (typeof window.saveHaxAccounts !== 'function') return;
            window.saveHaxAccounts(accounts).catch(() => {});
        }

        function getRank(points) {
            let rankIndex = Math.floor(points / 15);
            for (const group of rankGroups) {
                if (rankIndex < group.levels) {
                    return { text: `${group.name} ${rankIndex + 1}`, color: group.color };
                }
                rankIndex -= group.levels;
            }
            const top = rankGroups[rankGroups.length - 1];
            return { text: `${top.name} ${top.levels}`, color: top.color };
        }

        function formatMinutes(seconds) {
            return `${Math.round(seconds / 60)} min`;
        }

        const COMMAND_COLOR = 0x00FF00;

        function sendLine(player, text, color = COMMAND_COLOR, style = 'normal') {
            botAnnounce(text, player ? player.id : null, color, style);
        }

        function sendRanking(player, title, sorter, formatter, color = COMMAND_COLOR) {
            const rows = allStats().sort(sorter).slice(0, 10);
            sendLine(player, title, color, 'bold');
            if (rows.length === 0) {
                sendLine(player, 'Todavía no hay estadísticas cargadas.', 0xFFFFFF);
                return;
            }
            rows.forEach((data, index) => sendLine(player, `${index + 1}. ${formatter(data)}`, getRank(data.points).color));
        }

        function sendPlayerStats(player) {
            const data = getStats(player.name);
            const rank = getRank(data.points);
            const winRate = data.matches > 0 ? Math.round((data.wins / data.matches) * 100) : 0;
            const losses = Math.max(0, data.matches - data.wins);
            sendLine(player, `📊 Stats de ${player.name}`, COMMAND_COLOR, 'bold');
            sendLine(player, `PJ: ${data.matches} | Victorias: ${data.wins} | Derrotas: ${losses} | Puntos: ${data.points} | Goles: ${data.goals} | Asistencias: ${data.assists} | Win rate: ${winRate}% | Hattricks: ${data.hattricks} | MVP: ${data.mvps} | Rango: ${rank.text}`, COMMAND_COLOR);
        }

        function sendRanks(player) {
            sendLine(player, '🏅 Rangos disponibles:', COMMAND_COLOR, 'bold');
            rankGroups.forEach(group => {
                const levels = Array.from({ length: group.levels }, (_, index) => `${group.name} ${index + 1}`).join(' | ');
                sendLine(player, levels, group.color, 'bold');
            });
        }

        function sendTable(player) {
            sendRanking(
                player,
                '🏆 TOP 10 LIGA ARGENTINA AFA',
                (a, b) => b.points - a.points || b.goals - a.goals || b.assists - a.assists,
                data => `${data.name} | ${data.points} pts | G:${data.goals} A:${data.assists} | ${getRank(data.points).text}`
            );
        }

        function getTag(player) {
            if (!isLogged(player)) {
                return { prefix: '[no registrado] ', color: COLOR_UNREGISTERED, style: 'normal' };
            }
            const name = normalizeName(player.name);
            if (name === normalizeName(ownerName)) {
                return { prefix: '👑 [OWNER SUPREMO] ', color: 0xFFD700, style: 'bold' };
            }
            if (name === normalizeName(coOwnerName)) {
                return { prefix: '💎 [CO-OWNER] ', color: 0x87CEEB, style: 'bold' };
            }
            const rank = getRank(getStats(player.name).points);
            return { prefix: `[${rank.text}] `, color: rank.color, style: 'normal' };
        }

        function canSendChat(playerId) {
            const now = Date.now();
            const data = chatBurst[playerId] || { count: 0, lastTime: 0, cooldownUntil: 0 };
            if (now < data.cooldownUntil) return false;
            if (now - data.lastTime > 5000) data.count = 0;
            data.count += 1;
            data.lastTime = now;
            if (data.count > CHAT_BURST_LIMIT) {
                data.cooldownUntil = now + CHAT_COOLDOWN_MS;
                data.count = 0;
                chatBurst[playerId] = data;
                return false;
            }
            chatBurst[playerId] = data;
            return true;
        }

        function messageHasMention(message) {
            const lower = message.toLowerCase();
            if (lower.includes('@')) return true;
            return roomPlayers().some(p => lower.includes(p.name.toLowerCase()));
        }

        function roomPlayers() {
            return room.getPlayerList().filter(p => p.id !== 0);
        }

        function activePlayers() {
            return roomPlayers().filter(p => !isVoluntaryAfk(p));
        }

        function activePlayerCount() {
            return activePlayers().length;
        }

        function teamPlayers() {
            return roomPlayers().filter(player => player.team === TEAM_RED || player.team === TEAM_BLUE);
        }

        function isOfficialMatchSnapshot(players) {
            const red = players.filter(player => player.team === TEAM_RED).length;
            const blue = players.filter(player => player.team === TEAM_BLUE).length;
            return red === TEAM_MAX && blue === TEAM_MAX;
        }

        function getFormation(active) {
            if (active <= 0) return { red: 0, blue: 0 };
            const red = Math.min(TEAM_MAX, Math.ceil(active / 2));
            const blue = Math.min(TEAM_MAX, active - red);
            return { red, blue };
        }

        function formationLabel(formation) {
            return `${formation.red}v${formation.blue}`;
        }

        function applyMapByName(mapName) {
            if (!maps[mapName]) return currentMap;
            if (currentMap === mapName) return mapName;
            room.setCustomStadium(maps[mapName]);
            currentMap = mapName;
            botAnnounce(`🔄 Mapa: ${mapName}`, null, 0xFFFF00, 'bold');
            return mapName;
        }

        function applyInitialMap() {
            const name = mapNames[currentMapIndex] || mapNames[0];
            if (!currentMap) applyMapByName(name);
            return currentMap;
        }

        function rotateMap() {
            currentMapIndex = (currentMapIndex + 1) % mapNames.length;
            return applyMapByName(mapNames[currentMapIndex]);
        }

        function currentFormation() {
            return getFormation(activePlayerCount());
        }

        function applyRandomKits() {
            const red = pick(redKits);
            const blue = pick(blueKits);
            room.setTeamColors(TEAM_RED, red.angle, red.text, red.colors);
            room.setTeamColors(TEAM_BLUE, blue.angle, blue.text, blue.colors);
        }

        function markActive(player) {
            if (!player || player.id === 0) return;
            lastActivity[player.id] = Date.now();
            delete afkWarningSent[player.id];
            afkPauseOffset[player.id] = 0;
        }

        function getInactiveMs(playerId, now) {
            if (!lastActivity[playerId]) return 0;
            return Math.max(0, now - lastActivity[playerId] - (afkPauseOffset[playerId] || 0));
        }

        function isVoluntaryAfk(player) {
            return !!player && voluntaryAfk[player.id] === true;
        }

        function countTeams(players) {
            return {
                red: players.filter(p => p.team === TEAM_RED).length,
                blue: players.filter(p => p.team === TEAM_BLUE).length
            };
        }

        function specsAvailable() {
            return roomPlayers().filter(player => player.team === TEAM_SPEC && !isVoluntaryAfk(player));
        }

        function getActiveRed() {
            return roomPlayers().filter(p => p.team === TEAM_RED && !isVoluntaryAfk(p));
        }

        function getActiveBlue() {
            return roomPlayers().filter(p => p.team === TEAM_BLUE && !isVoluntaryAfk(p));
        }

        function rebalanceToFormation(preferredPlayer) {
            const active = activePlayerCount();
            if (active === 0) return;

            applyInitialMap();
            const formation = getFormation(active);
            const guardLimit = 20;

            roomPlayers().filter(p => isVoluntaryAfk(p) && p.team !== TEAM_SPEC).forEach(p => {
                room.setPlayerTeam(p.id, TEAM_SPEC);
            });

            let guard = 0;
            while (getActiveRed().length > formation.red && guard++ < guardLimit) {
                const extras = getActiveRed();
                const p = extras[extras.length - 1];
                if (getActiveBlue().length < formation.blue) room.setPlayerTeam(p.id, TEAM_BLUE);
                else room.setPlayerTeam(p.id, TEAM_SPEC);
            }

            guard = 0;
            while (getActiveBlue().length > formation.blue && guard++ < guardLimit) {
                const extras = getActiveBlue();
                const p = extras[extras.length - 1];
                if (getActiveRed().length < formation.red) room.setPlayerTeam(p.id, TEAM_RED);
                else room.setPlayerTeam(p.id, TEAM_SPEC);
            }

            guard = 0;
            while (getActiveRed().length < formation.red && specsAvailable().length > 0 && guard++ < guardLimit) {
                const p = preferredPlayer && preferredPlayer.team === TEAM_SPEC && !isVoluntaryAfk(preferredPlayer)
                    ? preferredPlayer
                    : specsAvailable()[0];
                if (isVoluntaryAfk(p)) break;
                room.setPlayerTeam(p.id, TEAM_RED);
                markActive(p);
                if (p.id === (preferredPlayer && preferredPlayer.id)) preferredPlayer = null;
            }

            guard = 0;
            while (getActiveBlue().length < formation.blue && specsAvailable().length > 0 && guard++ < guardLimit) {
                const p = preferredPlayer && preferredPlayer.team === TEAM_SPEC && !isVoluntaryAfk(preferredPlayer)
                    ? preferredPlayer
                    : specsAvailable()[0];
                if (isVoluntaryAfk(p)) break;
                room.setPlayerTeam(p.id, TEAM_BLUE);
                markActive(p);
                if (p.id === (preferredPlayer && preferredPlayer.id)) preferredPlayer = null;
            }
        }

        function ensureGameRunning(preferredPlayer) {
            if (syncInProgress || victoryPending) return;
            syncInProgress = true;
            try {
                if (activePlayerCount() === 0) return;
                applyInitialMap();
                rebalanceToFormation(preferredPlayer);
                if (!room.getScores()) {
                    try { room.startGame(); } catch (e) {}
                }
            } finally {
                syncInProgress = false;
            }
        }

        function restartBalancedMatch() {
            if (activePlayerCount() === 0) return;
            if (room.getScores()) {
                ignoreNextGameStop = true;
                try { room.stopGame(); } catch (e) {}
            }
            applyInitialMap();
            rebalanceToFormation();
            try {
                room.startGame();
            } catch (e) {
                botAnnounce('⚠️ No pude reiniciar la partida.', null, 0xFF5555, 'bold');
                return;
            }
            botAnnounce('🔄 Partida reiniciada.', null, 0xFFD700, 'bold');
        }

        function shouldCountStatsFor(playerOrSnapshot) {
            if (!matchIsOfficial || !isOfficialMatchSnapshot(matchPlayers)) return false;
            const id = playerOrSnapshot && playerOrSnapshot.id;
            return id !== undefined && loggedIn[id] === true;
        }

        function teamSizeForCurrentMap() {
            return TEAM_MAX;
        }

        function addMatchPlayer(player, team) {
            if (!matchIsOfficial || !player) return;
            matchPlayers = matchPlayers.filter(snapshot => snapshot.id !== player.id);
            matchPlayers.push({ id: player.id, name: player.name, team });
        }

        function removeMatchPlayer(playerId) {
            matchPlayers = matchPlayers.filter(snapshot => snapshot.id !== playerId);
        }

        function replaceFromSpec(team, oldPlayerId, reason) {
            const replacement = specsAvailable()[0];
            if (!replacement) {
                if (oldPlayerId) removeMatchPlayer(oldPlayerId);
                botAnnounce('⚠️ No hay suplentes en spec para reemplazar.', null, 0xFF5555, 'bold');
                return false;
            }

            if (oldPlayerId) removeMatchPlayer(oldPlayerId);
            room.setPlayerTeam(replacement.id, team);
            markActive(replacement);
            addMatchPlayer(replacement, team);
            botAnnounce(`🔁 ${replacement.name} entra como reemplazo ${reason}.`, null, 0xFFFF00, 'bold');
            return true;
        }

        function rotateLosingTeam(loserTeam) {
            const formation = currentFormation();
            const loserSize = loserTeam === TEAM_RED ? formation.red : formation.blue;
            const winnerTeam = loserTeam === TEAM_RED ? TEAM_BLUE : TEAM_RED;
            const winnerName = winnerTeam === TEAM_RED ? 'RED' : 'BLUE';
            const loserName = loserTeam === TEAM_RED ? 'RED' : 'BLUE';

            const losers = roomPlayers().filter(player => player.team === loserTeam);
            losers.forEach(player => room.setPlayerTeam(player.id, TEAM_SPEC));

            const specs = specsAvailable();
            const toEnter = specs.slice(0, loserSize);
            toEnter.forEach(player => {
                room.setPlayerTeam(player.id, loserTeam);
                markActive(player);
            });

            const winnerCount = roomPlayers().filter(p => p.team === winnerTeam).length;
            botAnnounce(
                `🔄 Gana sigue: ${winnerName} sigue (${winnerCount}), ${loserName} a spec, entran ${toEnter.length} de spec${toEnter.length < loserSize ? ` (${loserSize - toEnter.length} huecos sin cubrir)` : ''}.`,
                null,
                0xFFD700,
                'bold'
            );
        }

        function tryJoinTeam(player) {
            if (isVoluntaryAfk(player)) return false;
            const formation = currentFormation();
            if (getActiveRed().length < formation.red) {
                room.setPlayerTeam(player.id, TEAM_RED);
                markActive(player);
                return true;
            }
            if (getActiveBlue().length < formation.blue) {
                room.setPlayerTeam(player.id, TEAM_BLUE);
                markActive(player);
                return true;
            }
            return false;
        }

        function clearVoteKick() {
            voteKick = null;
        }

        function voteKickNeeded() {
            if (!voteKick) return 0;
            const eligible = roomPlayers().filter(p => p.id !== voteKick.targetId && !isVoluntaryAfk(p));
            return Math.max(2, Math.ceil(eligible.length * 0.6));
        }

        function handleVoteKick(voter, rawTarget) {
            if (voteKick && Date.now() - voteKick.startedAt > VOTEKICK_DURATION_MS) clearVoteKick();

            if (!rawTarget) {
                if (!voteKick) {
                    sendLine(voter, '🗳️ Usá: !votekick # (número del jugador, visible con Tab)', 0xFFFF00, 'bold');
                    return true;
                }
                const needed = voteKickNeeded();
                const count = Object.keys(voteKick.votes).length;
                sendLine(voter, `🗳️ Votekick activo contra #${voteKick.targetId}: ${count}/${needed} votos.`, 0xFFFF00, 'bold');
                return true;
            }

            const targetId = parseInt(String(rawTarget).replace('#', ''), 10);
            if (!Number.isFinite(targetId)) {
                sendLine(voter, '❌ ID inválido. Usá: !votekick # (número con Tab)', 0xFF5555, 'bold');
                return true;
            }

            const target = room.getPlayerList().find(p => p.id === targetId);
            if (!target || target.id === 0) {
                sendLine(voter, '❌ Jugador no encontrado.', 0xFF5555, 'bold');
                return true;
            }
            if (target.id === voter.id) {
                sendLine(voter, '❌ No podés votekick contra vos mismo.', 0xFF5555, 'bold');
                return true;
            }
            const targetKey = normalizeName(target.name);
            if (targetKey === normalizeName(ownerName) || targetKey === normalizeName(coOwnerName)) {
                sendLine(voter, '❌ No se puede votekick a un admin.', 0xFF5555, 'bold');
                return true;
            }

            if (!voteKick || voteKick.targetId !== targetId) {
                voteKick = { targetId, votes: {}, startedAt: Date.now() };
                botAnnounce(`🗳️ ${voter.name} inició votekick contra ${target.name} (#${target.id}). Escribí !votekick ${target.id} para votar.`, null, 0xFFFF00, 'bold');
            }

            if (voteKick.votes[voter.id]) {
                sendLine(voter, 'ℹ️ Ya votaste en este votekick.', 0xBBBBBB, 'bold');
                return true;
            }

            voteKick.votes[voter.id] = true;
            const needed = voteKickNeeded();
            const count = Object.keys(voteKick.votes).length;
            botAnnounce(`🗳️ Votekick ${target.name}: ${count}/${needed} votos.`, null, 0xFFFF00, 'bold');

            if (count >= needed) {
                botAnnounce(`⛔ ${target.name} fue expulsado por votekick.`, null, 0xFF5555, 'bold');
                room.kickPlayer(target.id, 'Expulsado por votekick de la sala.', false);
                clearVoteKick();
            }
            return true;
        }

        function startAfkChecker() {
            if (afkCheckTimer) return;
            afkCheckTimer = setInterval(() => {
                const now = Date.now();
                if (!afkEnabled || !room.getScores() || gamePaused) return;
                teamPlayers().forEach(player => {
                    if (!lastActivity[player.id]) markActive(player);
                    const inactiveSeconds = Math.floor(getInactiveMs(player.id, now) / 1000);
                    const key = normalizeName(player.name);

                    if (inactiveSeconds >= AFK_WARN_SEC && inactiveSeconds < AFK_ACTION_SEC && !afkWarningSent[player.id]) {
                        afkWarningSent[player.id] = true;
                        botAnnounce(`⚠️ ${player.name}, estás AFK. Tenés ${AFK_GRACE_SEC} segundos para moverte o vas a spec.`, null, 0xFFFF00, 'bold');
                        return;
                    }

                    if (inactiveSeconds < AFK_ACTION_SEC) return;

                    const oldTeam = player.team;
                    if ((afkStrikes[key] || 0) >= 1) {
                        botAnnounce(`⛔ ${player.name} siguió AFK otra vez y fue kickeado.`, null, 0xFF5555, 'bold');
                        if (officialMatchInProgress) replaceFromSpec(oldTeam, player.id, 'por AFK');
                        room.kickPlayer(player.id, 'AFK repetido: no te moviste tras el aviso.', false);
                        return;
                    }

                    afkStrikes[key] = 1;
                    botAnnounce(`⏳ ${player.name} no se movió tras el aviso y va a spec. La próxima vez será kick.`, null, 0xFF5555, 'bold');
                    room.setPlayerTeam(player.id, TEAM_SPEC);
                    markActive(player);

                    if (officialMatchInProgress) {
                        replaceFromSpec(oldTeam, player.id, 'por AFK');
                    }
                });
            }, 1000);
        }

        function syncLobby(delay = 300, joiningPlayer = null) {
            clearTimeout(autoMatchTimer);
            autoMatchTimer = setTimeout(() => {
                if (roomPlayers().length === 0) return;
                const player = joiningPlayer && room.getPlayerList().some(p => p.id === joiningPlayer.id)
                    ? room.getPlayerList().find(p => p.id === joiningPlayer.id)
                    : null;
                ensureGameRunning(player);
            }, delay);
        }

        function isOvertimeScore(scores) {
            if (!scores) return false;
            const timeLimitSeconds = Number(scores.timeLimit || 0) * 60;
            const currentTimeSeconds = Number(scores.time || 0);
            return timeLimitSeconds > 0 && currentTimeSeconds >= timeLimitSeconds;
        }

        function sendCurrentScore(player) {
            const scores = room.getScores();
            if (!scores) {
                sendLine(player, 'No hay partido en curso.', 0xFFFFFF);
                return;
            }
            const overtime = isOvertimeScore(scores);
            sendLine(player, `📍 Puntaje actual: RED ${scores.red} - ${scores.blue} BLUE | Tiempo: ${Math.floor(scores.time / 60)}:${String(Math.floor(scores.time % 60)).padStart(2, '0')}${overtime ? ' | OVERTIME' : ''}`, 0xFFD700, 'bold');
        }

        function sendCommand(player, command) {
            if (command === '!help' || command === '!comandos') {
                sendLine(player, '📜 Comandos:', COMMAND_COLOR, 'bold');
                sendLine(player, '!afk | !unirse | !votekick # | !ds', COMMAND_COLOR, 'bold');
                sendLine(player, '!register contraseña | !login contraseña', COMMAND_COLOR, 'bold');
                sendLine(player, '!stats | !tabla | !puntajes | !mvp | !puntos | !rangos', COMMAND_COLOR, 'bold');
                sendLine(player, '!goleadores | !asistidores | !victorias | !derrotas | !presencias', COMMAND_COLOR, 'bold');
                sendLine(player, '!vicios | !ganadores | !promedios | !racha-actual | !racha-historica | !hattricks', COMMAND_COLOR, 'bold');
                return true;
            }
            if (command === '!ds' || command === '!discord') {
                sendDiscordBanner(player);
                return true;
            }
            if (command === '!votekick' || command.startsWith('!votekick ')) {
                const parts = command.split(/\s+/);
                return handleVoteKick(player, parts[1]);
            }
            if (command === '!afk') {
                voluntaryAfk[player.id] = true;
                const oldTeam = player.team;
                room.setPlayerTeam(player.id, TEAM_SPEC);
                markActive(player);
                if (oldTeam === TEAM_RED || oldTeam === TEAM_BLUE) replaceFromSpec(oldTeam, player.id, 'porque pidió AFK');
                sendLine(player, '💤 Fuiste a spec. Usá !unirse cuando haya lugar en un equipo.', 0xBBBBBB, 'bold');
                return true;
            }
            if (command === '!unirse') {
                delete voluntaryAfk[player.id];
                if (player.team === TEAM_RED || player.team === TEAM_BLUE) {
                    sendLine(player, 'ℹ️ Ya estás jugando en un equipo.', 0xBBBBBB, 'bold');
                    return true;
                }
                if (tryJoinTeam(player)) {
                    sendLine(player, '✅ Entraste al equipo. ¡A jugar!', 0x00FF00, 'bold');
                } else {
                    sendLine(player, '⏳ No hay lugar. Esperá tu turno en spec.', 0xFFFF00, 'bold');
                }
                return true;
            }
            if (command.startsWith('!register ')) {
                const password = command.slice(10).trim();
                const key = normalizeName(player.name);
                if (!password) return sendLine(player, 'Usá: !register tu_contraseña', 0xFF5555, 'bold');
                if (accounts[key]) return sendLine(player, 'Ese nombre ya está registrado. Usá: !login tu_contraseña', 0xFFFF00, 'bold');
                accounts[key] = { password, auth: player.auth || '', conn: player.conn || '' };
                loggedIn[player.id] = false;
                persistAccounts();
                sendLine(player, '✅ Registrado correctamente.', 0x00FF00, 'bold');
                sendLine(player, '▶ Ahora usá: !login tu_contraseña para sumar stats.', 0x00FF00, 'bold');
                return true;
            }
            if (command.startsWith('!login ')) {
                const password = command.slice(7).trim();
                const key = normalizeName(player.name);
                if (!accounts[key]) return sendLine(player, 'Ese nombre no está registrado. Usá: !register tu_contraseña', 0xFFFF00, 'bold');
                if (accounts[key].password !== password) return sendLine(player, '❌ Contraseña incorrecta. Probá de nuevo con: !login tu_contraseña', 0xFF5555, 'bold');
                loggedIn[player.id] = true;
                accounts[key].auth = player.auth || accounts[key].auth || '';
                accounts[key].conn = player.conn || accounts[key].conn || '';
                persistAccounts();
                sendLine(player, '✅ Login correcto. Tus stats ya cuentan en 3v3.', 0x00FF00, 'bold');
                syncLobby(300, player);
                return true;
            }
            if (command === '!puntajes') return sendCurrentScore(player);
            if (command === '!mvp') return sendRanking(player, '⭐ Jugadores con más MVP', (a, b) => b.mvps - a.mvps || b.points - a.points, data => `${data.name} | MVP: ${data.mvps}`);
            if (command === '!puntos' || command === '!tabla') return sendTable(player);
            if (command === '!rangos') return sendRanks(player);
            if (command === '!goleadores') return sendRanking(player, '⚽ Máximos goleadores', (a, b) => b.goals - a.goals || b.points - a.points, data => `${data.name} | Goles: ${data.goals}`);
            if (command === '!asistidores') return sendRanking(player, '🎯 Máximos asistentes', (a, b) => b.assists - a.assists || b.points - a.points, data => `${data.name} | Asistencias: ${data.assists}`);
            if (command === '!hattricks') return sendRanking(player, '🎩 Top 10 hattricks', (a, b) => b.hattricks - a.hattricks || b.points - a.points, data => `${data.name} | Hattricks: ${data.hattricks}`);
            if (command === '!victorias') return sendRanking(player, '🏅 Ranking de victorias', (a, b) => b.wins - a.wins || b.points - a.points, data => `${data.name} | Victorias: ${data.wins}`);
            if (command === '!derrotas') return sendRanking(player, '💀 Ranking de derrotas', (a, b) => (b.matches - b.wins) - (a.matches - a.wins) || b.matches - a.matches, data => `${data.name} | Derrotas: ${data.matches - data.wins}`);
            if (command === '!presencias') return sendRanking(player, '📌 Ranking de partidos jugados', (a, b) => b.matches - a.matches || b.points - a.points, data => `${data.name} | PJ: ${data.matches}`);
            if (command === '!vicios') return sendRanking(player, '⏱️ Ranking de tiempo jugado', (a, b) => b.seconds - a.seconds || b.matches - a.matches, data => `${data.name} | Tiempo: ${formatMinutes(data.seconds)}`);
            if (command === '!ganadores') return sendRanking(player, '📈 Ranking de porcentaje de victorias', (a, b) => ((b.matches ? b.wins / b.matches : 0) - (a.matches ? a.wins / a.matches : 0)) || b.wins - a.wins, data => `${data.name} | Win rate: ${data.matches ? Math.round((data.wins / data.matches) * 100) : 0}%`);
            if (command === '!promedios') return sendRanking(player, '📊 Promedio de gol por minuto', (a, b) => ((b.seconds ? b.goals / (b.seconds / 60) : 0) - (a.seconds ? a.goals / (a.seconds / 60) : 0)) || b.goals - a.goals, data => `${data.name} | ${data.seconds ? (data.goals / (data.seconds / 60)).toFixed(2) : '0.00'} goles/min`);
            if (command === '!racha-actual') return sendRanking(player, '🔥 Rachas actuales', (a, b) => b.streak - a.streak || b.points - a.points, data => `${data.name} | Racha: ${data.streak}`);
            if (command === '!racha-historica') return sendRanking(player, '🏆 Rachas históricas', (a, b) => b.bestStreak - a.bestStreak || b.points - a.points, data => `${data.name} | Mejor racha: ${data.bestStreak}`);
            if (command === '!stats') return sendPlayerStats(player);
            return null;
        }

        function finalizeMatch(scores) {
            if (matchFinalized) return;
            matchFinalized = true;
            if (!scores || matchPlayers.length === 0) return;
            if (!matchIsOfficial || !isOfficialMatchSnapshot(matchPlayers)) {
                botAnnounce('ℹ️ Partido no oficial: las stats solo cuentan en 3v3 para registrados con !login.', null, 0xBBBBBB, 'bold');
                return;
            }

            const registeredPlayers = matchPlayers.filter(snapshot => loggedIn[snapshot.id] === true);
            if (registeredPlayers.length === 0) {
                botAnnounce('ℹ️ Ningún jugador registrado en cancha: no se guardaron stats.', null, 0xBBBBBB, 'bold');
                return;
            }

            const redWon = scores.red > scores.blue;
            const blueWon = scores.blue > scores.red;
            if (!redWon && !blueWon) return;

            const winnerTeam = redWon ? TEAM_RED : TEAM_BLUE;
            const secondsPlayed = Math.max(0, Math.round((scores && typeof scores.time === 'number') ? scores.time : ((Date.now() - matchStartedAt) / 1000)));
            const overtime = isOvertimeScore(scores);
            const winPoints = overtime ? 1 : 3;
            let bestMvp = null;
            let bestMvpScore = -1;

            registeredPlayers.forEach(snapshot => {
                const data = getStats(snapshot.name);
                data.matches += 1;
                data.seconds += secondsPlayed;

                if (snapshot.team === winnerTeam) {
                    data.wins += 1;
                    data.points += winPoints;
                    data.streak += 1;
                    data.bestStreak = Math.max(data.bestStreak, data.streak);
                } else {
                    data.streak = 0;
                }

                const performance = (gameGoals[snapshot.name] || 0) * 3 + (gameAssists[snapshot.name] || 0) * 2 + (snapshot.team === winnerTeam ? 1 : 0);
                if (performance > bestMvpScore) {
                    bestMvpScore = performance;
                    bestMvp = data;
                }
            });

            if (bestMvp) {
                bestMvp.mvps += 1;
                botAnnounce(`⭐ MVP del partido: ${bestMvp.name}`, null, 0xFFD700, 'bold');
            }

            persistStats();
            botAnnounce(`${overtime ? '⏱️ Victoria en overtime' : '🏆 Victoria'}: ${winnerTeam === TEAM_RED ? 'RED' : 'BLUE'} +${winPoints} punto${winPoints === 1 ? '' : 's'}.`, null, 0xFFD700, 'bold');
        }

        room.onPlayerJoin = (player) => {
            if (player.conn && activeConns[player.conn]) {
                const sameConnId = activeConns[player.conn];
                const sameConnStillInside = room.getPlayerList().some(p => p.id === sameConnId);
                if (sameConnStillInside) {
                    room.kickPlayer(player.id, 'Solo se permite 1 jugador por IP/conexión.', false);
                    return;
                }
            }
            if (player.conn) activeConns[player.conn] = player.id;
            getStats(player.name);
            markActive(player);
            botAnnounce(pick(welcomeMessages).replace('[N]', player.name), null, 0x00FF00, 'bold');
            const accountKey = normalizeName(player.name);
            sendAuthInfo(player);
            sendDiscordBanner(player);
            loggedIn[player.id] = false;
            if (accounts[accountKey]) {
                botAnnounce('🔑 Ya tenés cuenta. Usá: !login tu_contraseña para sumar stats.', player.id, COLOR_REGISTER, 'bold');
            }

            if (normalizeName(player.name) === normalizeName(ownerName) || normalizeName(player.name) === normalizeName(coOwnerName)) {
                room.setPlayerAdmin(player.id, true);
                botAnnounce(`✅ Admin otorgado a ${player.name}`, null, 0xFFFF00, 'bold');
            }

            syncLobby(300, player);
        };

        room.onPlayerLeave = (player) => {
            botAnnounce(pick(goodbyeMessages).replace('[N]', player.name), null, 0xFF5555, 'bold');
            delete lastActivity[player.id];
            delete afkWarningSent[player.id];
            delete afkPauseOffset[player.id];
            delete voluntaryAfk[player.id];
            delete loggedIn[player.id];
            delete chatBurst[player.id];
            if (voteKick && voteKick.targetId === player.id) clearVoteKick();
            if (player.conn && activeConns[player.conn] === player.id) delete activeConns[player.conn];

            const remaining = roomPlayers();
            if (remaining.length === 0) {
                if (room.getScores()) {
                    ignoreNextGameStop = true;
                    try { room.stopGame(); } catch (e) {}
                }
                return;
            }

            const teams = countTeams(remaining);
            const fieldCount = teams.red + teams.blue;
            if (room.getScores() && fieldCount === 0) {
                restartBalancedMatch();
                return;
            }

            syncLobby(300);
        };

        room.onPlayerChat = (player, message) => {
            const msg = message.trim();
            const lower = msg.toLowerCase();
            const handled = sendCommand(player, lower);
            if (handled !== null) return false;

            if (!canSendChat(player.id)) {
                sendLine(player, '⏳ Esperá 3 segundos (límite de mensajes).', 0xFFFF00, 'bold');
                return false;
            }

            const tag = getTag(player);
            const sound = messageHasMention(msg) ? SOUND_MENTION : SOUND_NONE;
            room.sendAnnouncement(`${tag.prefix}${player.name}: ${message}`, null, tag.color, tag.style, sound);
            return false;
        };

        room.onPlayerBallKick = (player) => {
            if (player.team !== TEAM_RED && player.team !== TEAM_BLUE) return;
            if (!lastTouch || lastTouch.id !== player.id) {
                secondLastTouch = lastTouch;
            }
            lastTouch = { id: player.id, name: player.name, team: player.team };
        };

        room.onTeamGoal = (team) => {
            if (!lastTouch) return;

            const scorerIsOwnGoal = lastTouch.team !== team;
            if (scorerIsOwnGoal) {
                botAnnounce(`😬 Gol en contra de ${lastTouch.name}.`, null, 0xFF5555, 'bold');
                lastTouch = null;
                secondLastTouch = null;
                return;
            }

            const scorer = getStats(lastTouch.name);
            if (shouldCountStatsFor(lastTouch)) {
                scorer.goals += 1;
                gameSummary.goals.push(lastTouch.name);
                gameGoals[lastTouch.name] = (gameGoals[lastTouch.name] || 0) + 1;
                persistStats();
            }

            const assist = secondLastTouch && secondLastTouch.team === team && secondLastTouch.id !== lastTouch.id ? secondLastTouch : null;
            if (assist) {
                if (shouldCountStatsFor(assist)) {
                    getStats(assist.name).assists += 1;
                    gameAssists[assist.name] = (gameAssists[assist.name] || 0) + 1;
                    persistStats();
                }
                botAnnounce(pick(assistedGoalMessages).replace('[N]', lastTouch.name).replace('[A]', assist.name), null, 0x00FF00, 'bold');
            } else {
                botAnnounce(pick(soloGoalMessages).replace('[N]', lastTouch.name), null, 0x00FF00, 'bold');
            }

            if (shouldCountStatsFor(lastTouch) && gameGoals[lastTouch.name] === 3) {
                scorer.hattricks += 1;
                persistStats();
                botAnnounce(pick(hattrickMessages).replace('[N]', lastTouch.name), null, 0xFFD700, 'bold');
            }

            lastTouch = null;
            secondLastTouch = null;
        };

        room.onGameStart = () => {
            applyRandomKits();
            Object.keys(gameGoals).forEach(name => delete gameGoals[name]);
            Object.keys(gameAssists).forEach(name => delete gameAssists[name]);
            gameSummary.goals = [];
            gameSummary.hattricks = [];
            afkEnabled = true;
            gamePaused = false;
            pauseStartedAt = 0;
            teamPlayers().forEach(player => {
                afkPauseOffset[player.id] = 0;
                markActive(player);
            });
            matchPlayers = teamPlayers().map(player => ({ id: player.id, name: player.name, team: player.team }));
            matchStartedAt = Date.now();
            matchIsOfficial = isOfficialMatchSnapshot(matchPlayers);
            matchFinalized = false;
            officialMatchInProgress = matchIsOfficial;
            if (matchIsOfficial) {
                botAnnounce('✅ Partida oficial 3v3: stats para registrados con !login.', null, 0x00FF00, 'bold');
            } else {
                botAnnounce('ℹ️ Partido no oficial: las stats solo cuentan en 3v3 para registrados.', null, 0xBBBBBB, 'bold');
            }
            lastTouch = null;
            secondLastTouch = null;
        };

        room.onTeamVictory = (scores) => {
            if (!scores || scores.red === scores.blue) return;
            const loserTeam = scores.red > scores.blue ? TEAM_BLUE : TEAM_RED;
            const winnerTeam = loserTeam === TEAM_RED ? TEAM_BLUE : TEAM_RED;
            finalizeMatch(scores);
            botAnnounce('📜 Recordá usar !help para ver todos los comandos.', null, 0xFFD700, 'bold');
            afkEnabled = false;
            officialMatchInProgress = false;
            victoryPending = true;

            const winnerIds = roomPlayers().filter(p => p.team === winnerTeam).map(p => p.id).slice(0, TEAM_MAX);
            const specIds = roomPlayers().filter(p => p.team === TEAM_SPEC && !isVoluntaryAfk(p)).map(p => p.id);
            const loserIds = roomPlayers().filter(p => p.team === loserTeam).map(p => p.id);
            const newLoserIds = (specIds.length > 0 ? specIds : loserIds).slice(0, TEAM_MAX);

            setTimeout(() => {
                try {
                    if (room.getScores()) {
                        ignoreNextGameStop = true;
                        try { room.stopGame(); } catch (e) {}
                    }
                    rotateMap();
                    applyRandomKits();

                    roomPlayers().forEach(p => {
                        if (p.team !== TEAM_SPEC) room.setPlayerTeam(p.id, TEAM_SPEC);
                    });

                    const currentPlayers = room.getPlayerList();
                    const alive = (id) => currentPlayers.some(p => p.id === id);

                    winnerIds.filter(alive).forEach(id => {
                        room.setPlayerTeam(id, winnerTeam);
                    });
                    newLoserIds.filter(alive).forEach(id => {
                        room.setPlayerTeam(id, loserTeam);
                    });

                    const wCount = winnerIds.filter(alive).length;
                    const lCount = newLoserIds.filter(alive).length;
                    const winnerName = winnerTeam === TEAM_RED ? 'RED' : 'BLUE';
                    const loserName = loserTeam === TEAM_RED ? 'RED' : 'BLUE';
                    botAnnounce(
                        `🔄 Gana sigue: ${winnerName} sigue (${wCount}), ${loserName} entra ${lCount}.`,
                        null, 0xFFD700, 'bold'
                    );

                    setTimeout(() => {
                        try {
                            room.startGame();
                            victoryPending = false;
                        } catch (e) {
                            victoryPending = false;
                            botAnnounce('⚠️ No pude iniciar la siguiente partida.', null, 0xFF5555, 'bold');
                            setTimeout(() => ensureGameRunning(), 500);
                        }
                    }, 400);
                } catch (e) {
                    victoryPending = false;
                    botAnnounce('⚠️ No pude iniciar la siguiente partida.', null, 0xFF5555, 'bold');
                    setTimeout(() => ensureGameRunning(), 500);
                }
            }, 3000);
        };

        room.onGameStop = () => {
            if (ignoreNextGameStop) {
                ignoreNextGameStop = false;
                return;
            }
            afkEnabled = false;
            officialMatchInProgress = false;
            matchIsOfficial = false;
            lastTouch = null;
            secondLastTouch = null;
            gamePaused = false;
            pauseStartedAt = 0;
            if (!victoryPending && roomPlayers().length > 0) {
                setTimeout(() => ensureGameRunning(), 400);
            }
        };

        room.onGamePause = () => {
            if (gamePaused) return;
            gamePaused = true;
            pauseStartedAt = Date.now();
        };

        room.onGameUnpause = () => {
            if (!gamePaused) return;
            const pauseDuration = Date.now() - pauseStartedAt;
            gamePaused = false;
            teamPlayers().forEach(player => {
                afkPauseOffset[player.id] = (afkPauseOffset[player.id] || 0) + pauseDuration;
            });
        };

        room.onPlayerActivity = (player) => {
            markActive(player);
        };

        room.onPlayerTeamChange = (changedPlayer) => {
            markActive(changedPlayer);
            if (changedPlayer.id === 0 && changedPlayer.team !== TEAM_SPEC) {
                room.setPlayerTeam(0, TEAM_SPEC);
                return;
            }
            if (changedPlayer.team === TEAM_SPEC && !isVoluntaryAfk(changedPlayer)) {
                setTimeout(() => ensureGameRunning(), 250);
            }
        };

        applyInitialMap();
        applyRandomKits();
        startAfkChecker();
        syncLobby();
    }, token, maps, mapNames, savedStats, savedAccounts);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Pegá tu Token de Haxball acá: ', (token) => {
    iniciarHost(token.trim());
    rl.close();
});

























