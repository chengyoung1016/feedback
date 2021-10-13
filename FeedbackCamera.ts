
import TKLog from "../log/TKLog";
import FeedbackBase from "./FeedbackBase";
import { FeedbackCameraTypeEnum, FeedbackTypeEnum } from "./FeedbackDefine";

const {ccclass, property, disallowMultiple} = cc._decorator;

/**
 * @classdesc 摄像机反馈模块
 * @description 支持摄像机震动、缩放等等
 * @note 若不选择目标摄像机，则默认为主摄像机
 * @author chengzhengyang
 * @since 2020-12-25
 */
@ccclass
@disallowMultiple
export default class FeedbackCamera extends FeedbackBase {
    @property(cc.Camera)
    TargetCamera: cc.Camera = null;

    @property({type: cc.Enum(FeedbackCameraTypeEnum)})
    FeedbackCameraType: FeedbackCameraTypeEnum = FeedbackCameraTypeEnum.SHAKE;

    @property({
        visible() {return this.FeedbackCameraType == FeedbackCameraTypeEnum.SHAKE},
        displayName: "振幅",
        tooltip: "振幅倍率，1为默认值"
    })
    Amplitude: number = 1;

    //频率对应其他类型的Duration
    @property({
        visible() {return this.FeedbackCameraType == FeedbackCameraTypeEnum.SHAKE},
        displayName: "频率",
    })
    Frequency: number = 0.16;

    @property({
        visible() {return this.FeedbackCameraType == FeedbackCameraTypeEnum.ZOOM}
    })
    TargetZoom: number = 1;

    private _originZoom = -1;

    @property({
        visible() {return this.FeedbackCameraType != FeedbackCameraTypeEnum.SHAKE}
    })
    Duration: number = 0.5;

    init() {
        if (this._originZoom == -1) {
            this._originZoom = this.TargetCamera.zoomRatio;
        } else {
            this.TargetCamera.zoomRatio = this._originZoom;
        }
        this._isPlaying = false;
        this.feedbackId = FeedbackTypeEnum.CAMERA;
    }

    async play(): Promise<void> {
        if (this.TargetCamera == null) {
            this.TargetCamera = cc.Camera.main;
        }
        return new Promise<void>((resolve) => {
            this._isPlaying = true;
            let time = this.getResolveTime();
            this.playCustom();
            this.scheduleOnce(() => {
                this.end();
                resolve();
            }, time);
        })
        .catch(e => {
            throw new Error("feedback audio play Err:" + e);
        })
    }

    getResolveTime(): number {
        let time = this.Duration;
        if (this.FeedbackCameraType == FeedbackCameraTypeEnum.SHAKE) {
            time = this.Frequency;
        }
        if (this.RepeatTimes > 0) {
            time = time * this.RepeatTimes;

            if (this.RepeatInterval > 0) {
                time += (this.RepeatTimes - 1) * this.RepeatInterval;
            }
        }
        
        return time;
    }

    playCustom() {
        TKLog.logInfo("play custom feedback \"camera\" id: " + this.FeedbackCameraType + " now");
        switch(this.FeedbackCameraType) {
            case FeedbackCameraTypeEnum.SHAKE:
                this.feedbackShake();
                break;
            case FeedbackCameraTypeEnum.ZOOM:
                this.feedbackZoom();
                break;
        }
    }

    stop() {
        if (this.isPlaying()) {
            cc.tween(this.TargetCamera.node)
            .stop()
        }
        
        this._isPlaying = false;
    }

    feedbackShake() {
        let t = this.Frequency * this.Amplitude / 8;
        let tween = cc.tween(this.TargetCamera.node)
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

    feedbackZoom() {
        let tween = cc.tween(this.TargetCamera)
        .set({zoomRatio: this._originZoom})
        .to(this.Duration, {zoomRatio: this.TargetZoom})

        tween = this.feedbackRepeat(tween);
        tween.start();
    }
}
