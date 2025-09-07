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
        this.bindings = {};
        this.clicks = {};
    }

    getInfo() {
        return {
            id: 'planetlangparser',
            name: 'PlanetLang Parser',
            blocks: [
                {
                    opcode: 'getTextureData',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'get texture of [ID]',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'objecttest' }
                    }
                },
                {
                    opcode: 'getObjectProperties',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'get properties of [ID]',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'objecttest' }
                    }
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
                    opcode: 'parseScript',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'parse PlanetLang script [SCRIPT]',
                    arguments: {
                        SCRIPT: { type: Scratch.ArgumentType.STRING, defaultValue: 'planets.push(new Planet);' }
                    }
                },
                {
                    opcode: 'bindSprite',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'bind sprite [SPRITE] to object id [ID]',
                    arguments: {
                        SPRITE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Sprite1' },
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'objecttest' }
                    }
                },
                {
                    opcode: 'bindBackgroundSprite',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'bind sprite [SPRITE] to background id [ID]',
                    arguments: {
                        SPRITE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Sprite1' },
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'bg1' }
                    }
                },
                {
                    opcode: 'spriteWasClicked',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'sprite [SPRITE] was clicked',
                    arguments: {
                        SPRITE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Sprite1' }
                    }
                },
                {
                    opcode: 'wasClicked',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: '[ID] was clicked',
                    arguments: {
                        ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'objecttest' }
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
        let currentType = null;

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
                currentType = 'Background';
                continue;
            }

            if (line.startsWith('new Object:')) {
                currentId = line.split(':')[1].replace(';', '');
                this.objects[currentId] = {
                    position: { x: 0, y: 0 },
                    texture: '',
                    size: '',
                    gravity: null,
                    onclick: false
                };
                currentType = 'Object';
                continue;
            }

            if (line.startsWith('switchBackgroundImgTo')) {
                const id = this._extractId(line);
                if (this.backgrounds[id]) {
                    for (let b in this.backgrounds) {
                        this.backgrounds[b].active = false;
                    }
                    this.backgrounds[id].active = true;
                    this._applyTextureToBoundSprite(id);
                }
                continue;
            }

            if (line.startsWith('setPositionOf')) {
                currentBlock = 'position';
                currentId = this._extractId(line);
                currentType = 'Object';
                continue;
            }

            if (line.startsWith('setTextureOf')) {
                currentBlock = 'texture';
                currentId = this._extractId(line);
                currentType = line.includes('(Background') ? 'Background' : 'Object';
                continue;
            }

            if (line.startsWith('setSizeOf')) {
                currentBlock = 'size';
                currentId = this._extractId(line);
                currentType = 'Object';
                continue;
            }

            if (line.startsWith('propertiesOf')) {
                currentBlock = 'properties';
                currentId = this._extractId(line);
                currentType = 'Object';
                continue;
            }

            if (line.startsWith('Object:') && line.includes('.onclick()')) {
                currentId = line.split(':')[1].split('.')[0];
                currentBlock = 'onclick';
                currentType = 'Object';
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
                if (line.startsWith('x:')) {
                    this.planet.spawn.x = Number(line.split('x:')[1].trim());
                }
                if (line.startsWith('y:')) {
                    this.planet.spawn.y = Number(line.split('y:')[1].trim());
                }
            }

            if (currentBlock === 'texture') {
                const url = line.split('url:')[1].trim().replace(';', '');
                if (currentType === 'Object' && this.objects[currentId]) {
                    this.objects[currentId].texture = url;
                    this._applyTextureToBoundSprite(currentId);
                }
                if (currentType === 'Background' && this.backgrounds[currentId]) {
                    this.backgrounds[currentId].texture = url;
                    this._applyTextureToBoundSprite(currentId);
                }
            }

            if (currentBlock === 'position') {
                if (line.startsWith('x:')) {
                    const rawX = line.split('x:')[1].replace(',', '').trim();
                    this.objects[currentId].position.x = isNaN(Number(rawX)) ? 0 : Number(rawX);
                }
                if (line.startsWith('y:')) {
                    const rawY = line.split('y:')[1].replace(',', '').trim();
                    this.objects[currentId].position.y = isNaN(Number(rawY)) ? 0 : Number(rawY);
                }
                this._applyPositionToBoundSprite(currentId);
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

            currentBlock = null;
            currentType = null;
        }
    }

    _extractId(line) {
        const match = line.match(/with id\s+"([^"]+)"/);
        return match ? match[1] : null;
    }

async _applyTextureToBoundSprite(objectId, targetOverride = null) {
    const object = this.objects[objectId] || this.backgrounds[objectId];
    if (!object || !object.texture) return;

    const spriteName = Object.keys(this.bindings).find(
        s => this.bindings[s] === objectId
    );
    if (!spriteName) return;

    const runtime = Scratch.vm.runtime;
    const target = targetOverride ||
        runtime.targets.find(t => t.sprite && t.sprite.name === spriteName);
    if (!target) return;

    try {
        const response = await fetch(object.texture);
        const assetData = await response.arrayBuffer();
        const assetType = object.texture.endsWith('.svg')
            ? runtime.storage.AssetType.ImageVector
            : runtime.storage.AssetType.ImageBitmap;

        const asset = runtime.storage.createAsset(
            assetType,
            null,
            true,
            new Uint8Array(assetData),
            object.texture
        );

        const costume = {
            name: `${objectId}-texture`,
            asset: asset,
            md5ext: asset.md5ext,
            dataFormat: asset.dataFormat,
            rotationCenterX: asset.rotationCenterX || 0,
            rotationCenterY: asset.rotationCenterY || 0
        };

        const existingIndex = target.sprite.costumes.findIndex(c => c.name === costume.name);
        if (existingIndex !== -1) {
            target.sprite.costumes[existingIndex] = costume;
            target.setCostume(existingIndex);
        } else {
            target.sprite.costumes.push(costume);
            target.setCostume(target.sprite.costumes.length - 1);
        }
        console.log('Parsed texture for', objectId, ':', object.texture);
    } catch (e) {
        console.error('Failed to apply texture:', e);
    }
}

    _applyPositionToBoundSprite(objectId) {
        const object = this.objects[objectId];
        if (!object) return;

        const spriteName = Object.keys(this.bindings).find(
            s => this.bindings[s] === objectId
        );
        if (!spriteName) return;

        const runtime = Scratch.vm.runtime;
        const targets = runtime.targets.filter(
            t => t.sprite && t.sprite.name === spriteName
        );

        for (const target of targets) {
            if (typeof target.setXY === 'function') {
                target.setXY(object.position.x, object.position.y);
            } else {
                target.x = object.position.x;
                target.y = object.position.y;
                target.updateAllDrawableProperties();
            }
        }
    }

    bindSprite(args) {
        console.log('Bindings:', this.bindings);
        this.bindings[args.SPRITE] = args.ID;
        this.clicks[args.ID] = false;
        this._applyTextureToBoundSprite(args.ID);
    }

    bindBackgroundSprite(args) {
        this.bindings[args.SPRITE] = args.ID;
        if (this.backgrounds[args.ID] && this.backgrounds[args.ID].texture) {
            this._applyTextureToBoundSprite(args.ID);
        }
    }

    spriteWasClicked(args) {
        const id = this.bindings[args.SPRITE];
        if (id) {
            this.clicks[id] = true;
        }
    }

    wasClicked(args) {
        return this.clicks[args.ID] === true;
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

    isValidPlanetFile() {
        return this.validSignature;
    }

    async getTextureData(args) {
        const object = this.objects[args.ID] || this.backgrounds[args.ID];
        if (!object || !object.texture) return '';

        try {
            const response = await fetch(object.texture);
            const contentType = response.headers.get('content-type');

            if (contentType.includes('svg')) {
                return await response.text(); // Return raw SVG
            } else {
                return '[non-SVG texture]'; // Optional fallback
            }
        } catch (e) {
            console.error('Failed to fetch texture:', e);
            return '';
        }
    }
    getObjectX(args) {
        const obj = this.objects[args.ID];
        return obj && obj.position ? obj.position.x : 0;
    }

    getObjectY(args) {
        const obj = this.objects[args.ID];
        return obj && obj.position ? obj.position.y : 0;
    }
    getObjectProperties(args) {
        const obj = this.objects[args.ID];
        if (!obj || typeof obj.gravity === 'undefined') return '{}';

        const props = {
            gravity: obj.gravity
            // Add more keys here if you expand the properties block later
        };

        return JSON.stringify(props);
    }
}

Scratch.extensions.register(new PlanetLangParser());
