export class AppLoop {
    
        private mAnimationFrameID: number = -1;
    
        private mAnimationFrameRunning: boolean = false;
    
        private static _instance: AppLoop = null;
    
        private _objects: Array<any> = [];
    
        private _unique_id: number = 0;
    
        private mRunning: boolean = false;
    
        private constructor() {
    
        }
    
        public static getInstance() {
            if (this._instance == null) {
                this._instance = new AppLoop();
                this._instance.start();
            }
            return this._instance;
        }
    
        public start() {
            if (this.mRunning) return;
            this.mRunning = true;
            this.run();
        }
    
        public stop() {
            cancelAnimationFrame(this.mAnimationFrameID);
            this.mAnimationFrameID = -1;
            this.mAnimationFrameRunning = false;
            this.mRunning = false;
        }
    
        public pause() {
            this.mRunning = false;
        }
    
        public resume() {
            this.mRunning = true;
        }
    
    
    
        public scheduleUpdate(object) {
            this.unScheduleUpdate(object);
            object.uniqueID = this._unique_id++;
            this._objects.push(object);
        }
    
        public unScheduleUpdate(object) {
            if (object.uniqueID == undefined) return;
            let idx: number = -1;
            for (let i = 0; i < this._objects.length; i++) {
                let obj = this._objects[i];
                if (obj.uniqueID !== undefined) {
                    idx = i;
                    break;
                }
            }
            if (idx != -1) {
                this._objects.splice(idx, 1);
            }
        }
    
        public unScheduleUpdateAll() {
            this._objects = [];
        }
    
    
        private run() {
            this.mAnimationFrameRunning = true;
            this.mAnimationFrameID = requestAnimationFrame(() => {
                this.onUpdate();
                if (this.mAnimationFrameRunning) this.run();
            });
        }
    
        private onUpdate() {
            if (!this.mRunning) return;
            for (let obj of this._objects) {
                obj.onUpdate();
            }
        }
    }