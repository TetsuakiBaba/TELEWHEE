class WhillControl {
    constructor() {
        this.serial = new Serial();
        this.joystick = {
            x: 0,
            y: 0
        };
    }
    async openSerial() {
        return await this.serial.begin(9600);
    }
    start() {
        this.interval_id = setInterval(function () {
            if (this.serial.is_opended) {
                this.serial.writeCSV(`${this.joystick.x},${this.joystick.y}\n`);
            }
        }, 100);
    }
    stop() {
        clearInterval(this.interval_id);
    }
    setJoystick(x, y) {
        if (-100 <= x && x <= 100 && -100 <= y && y <= 100) {
            this.joystick.x = x;
            this.joystick.y = y;
        }
    }
}

let whill_control = new WhillControl();
async function startWhill() {
    await whill_control.openSerial();
    whill_control.start();
}
