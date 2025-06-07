if (!Scratch.extensions.unsandboxed) {
    throw new Error("KAYGAMEZ Utils must be run unsandboxed");
}
const vm = Scratch.vm;

  let deltaTime = 0;
  let previousTime = 0;

  vm.runtime.on("BEFORE_EXECUTE", () => {
    const now = performance.now();

    if (previousTime === 0) {
      deltaTime = 1 / vm.runtime.frameLoop.framerate;
    } else {
      deltaTime = (now - previousTime) / 1000;
    }

    previousTime = now;
  });


class KAYGAMEZUtils {
    getInfo(){
        return {
            id: 'kaygamezutils',
            name: 'KAYGAMEZ Utils',
            color1: '#cad0d9',
            color2: '#1600ff',
            color3: '#1600ff',
            blocks: [
                {
                    opcode: 'percentof',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '[PERCENT]% of [NUMBER]',
                    arguments:{
                        PERCENT:{
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        NUMBER:{
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 100
                        }
                    }
                        },
                {
                     opcode: 'moveusingdelta',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '[STEPS] steps using delta time',
                    arguments:{
                        STEPS:{
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 10
                }        
                    }
                },
                {
                    opcode: 'powerof',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '[VALUE] to the power of [EXPONENT]',
                    arguments:{
                        VALUE:{
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 5
                        },
                        EXPONENT:{
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 2
                        }
                    }
                }
            ]
        };
    }
    percentof(args) {
        return args.PERCENT / 100 * args.NUMBER;
    }
    moveusingdelta(args){
        return args.STEPS * 20 * deltaTime;
    }
    powerof(args){
        return args.VALUE ** args.EXPONENT;
    }
}
Scratch.extensions.register(new KAYGAMEZUtils());
