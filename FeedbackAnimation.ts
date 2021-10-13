
import FeedbackBase from "./FeedbackBase";
import { FeedbackTypeEnum } from "./FeedbackDefine";

const {ccclass, property, disallowMultiple} = cc._decorator;

/**
 * @classdesc 动画反馈系统
 * @description 支持动画的播放、停止等等
 * @author chengzhengyang
 * @since 2020-12-25
 */
@ccclass
@disallowMultiple
export default class FeedbackAnimation extends FeedbackBase {
    @property(cc.Animation)
    TargetAnim: cc.Animation = null;

    init() {
        this.feedbackId = FeedbackTypeEnum.ANIMATION;
    }

    async play(): Promise<void> {
        this._isPlaying = true;
        return new Promise<void>((resolve) => {
            this.TargetAnim.play();
            let onFinished = () => {
                this.TargetAnim.off('finished', onFinished, this);
                resolve();
            }
            this.TargetAnim.on('finished', onFinished, this);
        })
        .catch(e => {
            throw new Error("feedback animation play Err:" + e);
        })
    }

    stop() {
        this.TargetAnim.stop();
        this._isPlaying = false;
    }
}
