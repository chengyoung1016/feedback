import TKLog from "../log/TKLog";
import ToolsUseful from "../utils/ToolsUseful";
import FeedbackBase from "./FeedbackBase";
import { FeedbackNodeTypeEnum, FeedbackTypeEnum } from "./FeedbackDefine";

const {ccclass, property, disallowMultiple, requireComponent} = cc._decorator;

/**
 * @classdesc 节点反馈系统
 * @description 支持节点移动、旋转、缩放、震动等
 * @author chengzhengyang
 * @since 2020-12-25
 */
@ccclass
@disallowMultiple
export default class FeedbackNode extends FeedbackBase {
    @property(cc.Node)
    TargetNode: cc.Node = null;

    @property({
        type: cc.Enum(FeedbackNodeTypeEnum)
    })
    FeedbackNodeType: FeedbackNodeTypeEnum = FeedbackNodeTypeEnum.NONE;

    @property({
        visible() {return (this.FeedbackNodeType == FeedbackNodeTypeEnum.MOVEBY || this.FeedbackNodeType == FeedbackNodeTypeEnum.MOVETO)}
    })
    OriginPos: cc.Vec2 = cc.Vec2.ZERO;

    @property({
        visible() {return (this.FeedbackNodeType == FeedbackNodeTypeEnum.MOVEBY || this.FeedbackNodeType == FeedbackNodeTypeEnum.MOVETO)}
    })
    TargetPos: cc.Vec2 = cc.Vec2.ZERO;

    @property({
        visible() {return this.FeedbackNodeType == FeedbackNodeTypeEnum.ROTATION}
    })
    OriginAngle: number = 0;

    @property({
        visible() {return this.FeedbackNodeType == FeedbackNodeTypeEnum.ROTATION}
    })
    TargetAngle: number = 0;

    @property({
        visible() {return this.FeedbackNodeType == FeedbackNodeTypeEnum.ZOOM}
    })
    OriginScale: number = 1;

    @property({
        visible() {return this.FeedbackNodeType == FeedbackNodeTypeEnum.ZOOM}
    })
    TargetScale: number = 1;

    @property
    Duration: number = 0;

    init() {
        this._isPlaying = false;
        this.feedbackId = FeedbackTypeEnum.NODE;
        if (this.FeedbackNodeType == FeedbackNodeTypeEnum.MOVEBY || this.FeedbackNodeType == FeedbackNodeTypeEnum.MOVETO) {
            this.TargetNode.setPosition(this.OriginPos);
        }
        if (this.FeedbackNodeType == FeedbackNodeTypeEnum.ROTATION) {
            this.TargetNode.angle = this.OriginAngle;
        }
        if (this.FeedbackNodeType == FeedbackNodeTypeEnum.ZOOM) {
            this.TargetNode.scale = this.OriginScale;
        }
    }

    async play(): Promise<void> {
        return new Promise<void>((resolve) => {
            this._isPlaying = true;
            let time = this.getResolveTime();
            this.playCustom();
            this.scheduleOnce(() => {
                resolve();
            }, time)
        }).catch(e => {
            throw new Error("feedback node play Err:" + e);
        })
    }

    playCustom() {
        TKLog.logInfo("play custom feedback \"node\" id: " + this.FeedbackNodeType + " now");
        switch (this.FeedbackNodeType) {
            case FeedbackNodeTypeEnum.NONE:
                break;
            case FeedbackNodeTypeEnum.MOVEBY:
                this.feedbackMoveBy();
                break;
            case FeedbackNodeTypeEnum.MOVETO:
                this.feedbackMoveTo();
                break;
            case FeedbackNodeTypeEnum.ZOOM:
                this.feedbackScale();
                break;
            case FeedbackNodeTypeEnum.ROTATION:
                this.feedbackRotation();
                break;
            case FeedbackNodeTypeEnum.SHAKE:
                this.feedbackShake();
                break;
        }
    }

    getResolveTime(): number {
        let time = this.Duration;
        if (this.RepeatTimes > 0) {
            time = time * this.RepeatTimes;

            if (this.RepeatInterval > 0) {
                time += (this.RepeatTimes - 1) * this.RepeatInterval;
            }
        }
        
        return time;
    }

    feedbackMoveBy() {
        let tween = cc.tween(this.TargetNode)
        .set({position: cc.v3(this.OriginPos)})
        .by(this.Duration, {position: cc.v3(this.TargetPos)})
        
        tween = this.feedbackRepeat(tween);
        tween.start();
    }

    feedbackMoveTo() {
        let tween = cc.tween(this.TargetNode)
        .set({position: cc.v3(this.OriginPos)})
        .to(this.Duration, {position: cc.v3(this.TargetPos)})

        tween = this.feedbackRepeat(tween);
        tween.start();
    }

    feedbackScale() {
        let tween = cc.tween(this.TargetNode)
        .set({scale: this.OriginScale})
        .to(this.Duration, {scale: this.TargetScale})

        tween = this.feedbackRepeat(tween);
        tween.start();
    }

    feedbackRotation() {
        let tween = cc.tween(this.TargetNode)
        .set({angle: this.OriginAngle})
        .by(this.Duration, {angle: this.TargetAngle})

        tween = this.feedbackRepeat(tween);
        tween.start();
    }

    feedbackShake() {
        let t = this.Duration / 8;
        let tween = cc.tween(this.TargetNode)
        .by(t, {position: cc.v3(0.00, 10.00)})
        .by(t, {position: cc.v3(-7.07, -7.07)})
        .by(t, {position: cc.v3(10.00, -0.00)})
        .by(t, {position: cc.v3(-7.07, 7.07)})
        .by(t, {position: cc.v3(-0.00, -10.00)})
        .by(t, {position: cc.v3(7.07, 7.07)})
        .by(t, {position: cc.v3(-10.00, 0.00)})
        .by(t, {position: cc.v3(7.07, -7.07)})

        tween = this.feedbackRepeat(tween);
        tween.start();
    }

    stop() {
        if (this.isPlaying()) {
            cc.tween(this.TargetNode)
            .stop()
        }
        
        this._isPlaying = false;
    }
}
