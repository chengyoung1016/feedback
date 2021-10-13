import TKLog from '../log/TKLog';
import ToolsUseful from '../utils/ToolsUseful';
import { FeedbackTypeEnum } from './FeedbackDefine';
import IFeedback, { IFeedbackTimingParam } from './IFeedback';

const {ccclass, property} = cc._decorator;

/**
 * @classdesc 反馈系统基类
 * @description 所有反馈模块都会继承此类
 * @author chengzhengyang
 * @since 2020-12-25
 */
@ccclass
export default abstract class FeedbackBase extends cc.Component implements IFeedback, IFeedbackTimingParam {
    @property({
        displayName: "是否启用"
    })
    IsEnable: boolean = true;
    @property
    StartDelay: number = 0;
    @property({
        type: cc.Integer,
        displayName: "重复次数",
    })
    RepeatTimes: number = 1;
    @property({
        visible() {return (this.RepeatTimes > 1 || this.RepeatTimes < 0)},
        min: 0,
        tooltip: "重复间隔"
    })
    RepeatInterval: number = 0.5;
    @property({
        displayName: "执行概率",
        min: 0,
        max: 1
    })
    Chance: number = 1;

    public feedbackId: string = "";
    protected _isPlaying: boolean = false;

    onLoad() {
        this.init();
    }

    abstract init(): void;

    reset(): void {
        if (this.isPlaying()) {
            this.stop();
        }
        this.init();
    }

    async execute(): Promise<void> {
        if (!this.IsEnable || this.isPlaying() || this.RepeatTimes == 0) {
            TKLog.logWarn("execute " + this.feedbackId + " failed: ", this.IsEnable, this.isPlaying(), this.RepeatTimes);
            return;
        }

        if (this.StartDelay > 0) {
            await ToolsUseful.waitForSeconds(this.StartDelay);
        }

        if (!this.playByChance(this.Chance)) {
            TKLog.logWarn("反馈概率失败");
            return;
        }

        TKLog.logWarn("execute " + this.feedbackId + " now");
        return await new Promise((resolve) => {
            this.play().then(() => {
                resolve();
            })
        })
         
    }

    playByChance(chance: number): boolean {
        if (chance <= 0) {
            return false;
        }
        if (chance >= 1) {
            return true;
        }
        let r = Math.random();
        return ToolsUseful.isValid(r, 0, chance);
    }

    end() {
        this.init();
    }

    abstract play(): Promise<void>;

    isPlaying(): boolean {
        return this._isPlaying;
    }

    abstract stop(): void;

    feedbackRepeat(tween: cc.Tween): cc.Tween {
        if (this.RepeatInterval > 0) {
            tween = tween.delay(this.RepeatInterval);
        }
        tween = tween.union();
        if (this.RepeatTimes < 0) {
            tween = tween.repeatForever();
        }
        if (this.RepeatTimes > 0) {
            tween = tween.repeat(this.RepeatTimes);
        }
        tween = tween.call(() => {
            this.end();
        })
        return tween;
    }
}
