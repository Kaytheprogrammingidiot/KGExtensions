class PlanetLangParser {
    constructor() {
        this.reset();
    }

    reset() {
        this.planet = {
            thumbnail: '',
            spawn: { x: 0, y: 0 }
        };
        this.backgrounds = {};
        this.objects = {};
        this.validSignature = false;
        this.clicks = {};
    }

    getInfo() {
        return {
            id: 'planetlangparser',
            name: 'PlanetLang Parser',
            color1: "#6b8de3",
            blocks: [
                {
                    opcode: 'parseScript',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'parse PlanetLang script [SCRIPT]',
                    arguments: {
                        SCRIPT: { type: Scratch.ArgumentType.STRING, defaultValue: 'planets.push(new Planet);' }
                    }
                },
                {
                    opcode: 'getObjectIds',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'get object IDs'
                },
                {
                    opcode: 'getBackgroundIds',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'get background IDs'
                },
                {
                    opcode: 'getThumbnail',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'get planet thumbnail URL'
                },
                {
                    opcode: 'getSpawnX',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'get spawn X'
                },
                {
                    opcode: 'getSpawnY',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'get spawn Y'
                },
                {
                    opcode: 'getObjectX',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'get x of [ID]',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'objecttest' }
                    }
                },
                {
                    opcode: 'getObjectY',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'get y of [ID]',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'objecttest' }
                    }
                },
                {
                    opcode: 'isValidPlanetFile',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: 'is valid PlanetLang file?'
                }
            ]
        };
    }

    parseScript(args) {
        this.reset();

        const lines = args.SCRIPT.split('\n').map(line => line.trim()).filter(Boolean);
        let currentBlock = null;
        let currentId = null;

        for (let line of lines) {
            if (line === 'planets.push(new Planet);') {
                this.validSignature = true;
                continue;
            }

            if (line.startsWith('planets.thumbnail()')) {
                currentBlock = 'thumbnail';
                continue;
            }

            if (line.startsWith('planets.spawn')) {
                currentBlock = 'spawn';
                continue;
            }

            if (line.startsWith('new Background:')) {
                currentId = line.split(':')[1].replace(';', '');
                this.backgrounds[currentId] = { texture: '', active: false };
                continue;
            }

            if (line.startsWith('switchBackgroundImgTo')) {
                const id = this._extractId(line);
                if (this.backgrounds[id]) {
                    for (let b in this.backgrounds) {
                        this.backgrounds[b].active = false;
                    }
                    this.backgrounds[id].active = true;
                }
                continue;
            }

            if (line.startsWith('new Object:')) {
                const idMatch = line.match(/new Object:\s*([^\s;]+)/);
                if (idMatch) {
                    currentId = idMatch[1];
                    if (!this.objects[currentId]) {
                        this.objects[currentId] = {
                            position: { x: 0, y: 0 },
                            texture: '',
                            size: '',
                            gravity: null,
                            onclick: false
                        };
                    }
                }
                continue;
            }

            if (line.startsWith('setPositionOf')) {
                currentBlock = 'position';
                currentId = this._extractId(line);
                continue;
            }

            if (line.startsWith('setTextureOf')) {
                currentBlock = 'texture';
                currentId = this._extractId(line);
                continue;
            }

            if (line.startsWith('setSizeOf')) {
                currentBlock = 'size';
                currentId = this._extractId(line);
                continue;
            }

            if (line.startsWith('propertiesOf')) {
                currentBlock = 'properties';
                currentId = this._extractId(line);
                continue;
            }

            if (line.startsWith('Object:') && line.includes('.onclick()')) {
                currentId = line.split(':')[1].split('.')[0];
                currentBlock = 'onclick';
                continue;
            }

            if (line.startsWith('remove(')) {
                if (currentBlock === 'onclick' && this.objects[currentId]) {
                    this.objects[currentId].onclick = true;
                }
                continue;
            }

            if (currentBlock === 'thumbnail' && line.startsWith('url:')) {
                this.planet.thumbnail = line.split('url:')[1].trim().replace(';', '');
            }

            if (currentBlock === 'spawn') {
                const cleaned = line.replace(/[;,]/g, '');
                if (cleaned.startsWith('x:')) {
                    const match = cleaned.match(/x:\s*(-?\d+)/);
                    this.planet.spawn.x = match ? parseInt(match[1]) : 0;
                }
                if (cleaned.startsWith('y:')) {
                    const match = cleaned.match(/y:\s*(-?\d+)/);
                    this.planet.spawn.y = match ? parseInt(match[1]) : 0;
                }
            }

            if (currentBlock === 'texture') {
                const url = line.split('url:')[1].trim().replace(';', '');
                if (this.objects[currentId]) {
                    this.objects[currentId].texture = url;
                }
                if (this.backgrounds[currentId]) {
                    this.backgrounds[currentId].texture = url;
                }
            }

            if (currentBlock === 'position') {
                const cleaned = line.replace(/[;,]/g, '');
                if (cleaned.includes('x:')) {
                    const match = cleaned.match(/x:\s*(-?\d+)/);
                    if (this.objects[currentId]) {
                        this.objects[currentId].position.x = match ? parseInt(match[1]) : 0;
                    }
                }
                if (cleaned.includes('y:')) {
                    const match = cleaned.match(/y:\s*(-?\d+)/);
                    if (this.objects[currentId]) {
                        this.objects[currentId].position.y = match ? parseInt(match[1]) : 0;
                    }
                }
            }

            if (currentBlock === 'size') {
                const size = line.replace(';', '').trim();
                if (this.objects[currentId]) {
                    this.objects[currentId].size = size;
                }
            }

            if (currentBlock === 'properties') {
                if (line.startsWith('gravity:')) {
                    const gravity = parseFloat(line.split('gravity:')[1]);
                    if (this.objects[currentId]) {
                        this.objects[currentId].gravity = gravity;
                    }
                }
            }
        }
    }

    _extractId(line) {
        const match = line.match(/with id\s+"([^"]+)"/);
        return match ? match[1] : null;
    }

    getObjectIds() {
        return Object.keys(this.objects).join(',');
    }

    getBackgroundIds() {
        return Object.keys(this.backgrounds).join(',');
    }

    getThumbnail() {
        return this.planet.thumbnail;
    }

    getSpawnX() {
        return this.planet.spawn.x;
    }

    getSpawnY() {
        return this.planet.spawn.y;
    }

    getObjectX(args) {
        const obj = this.objects[args.ID];
        return obj && obj.position ? obj.position.x : 0;
    }

    getObjectY(args) {
        const obj = this.objects[args.ID];
        return obj && obj.position ? obj.position.y : 0;
    }

    isValidPlanetFile() {
        return this.validSignature;
    }
}

Scratch.extensions.register(new PlanetLangParser());
